"""The sitekit settings app: one tab per section of site.toml and pulse.toml, explained, plus a first-run walkthrough.

Edits go through tomlkit, so comments and layout in hand-edited files survive. Anything that does real work (scanning
for projects, installing the browser host, previewing what gets published) runs the `sitekit` command, so the app only
needs GTK and tomlkit. Needs Python's gi bindings with GTK 4 and libadwaita, which `sitekit config` finds for you.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

import gi

gi.require_version('Gtk', '4.0')
gi.require_version('Adw', '1')

import tomlkit  # noqa: E402
from gi.repository import Adw, Gio, GLib, Gtk  # noqa: E402

from . import claude, discover, web  # noqa: E402
from .common import expand, find_site  # noqa: E402

TEMPLATE = Path(__file__).parent / 'pulse.example.toml'
LEVEL_HELP = 'Off, counts only, titles too, or titles and one-sentence summaries'


class Store:
    """One TOML file, edited in memory until saved."""

    def __init__(self, path: Path, template: str = ''):
        self.path, self.dirty = path, False
        self.doc = tomlkit.parse(path.read_text() if path.exists() else template)

    def table(self, key: str, create: bool = False):
        node = self.doc
        for part in key.split('.')[:-1]:
            if part not in node:
                if not create:
                    return None
                node[part] = tomlkit.table()
            node = node[part]
        return node

    def get(self, key: str, default=None):
        node = self.table(key)
        return default if node is None else node.get(key.split('.')[-1], default)

    def set(self, key: str, value) -> None:
        name, self.dirty = key.split('.')[-1], True
        if value in ('', None, [], {}):
            node = self.table(key)
            if node is not None and name in node:
                del node[name]
            return
        node = self.table(key, create=True)
        if isinstance(value, list) and isinstance(value[0], dict):
            # In place: tomlkit keeps the comment before the next section on the last table, so replacing would lose it.
            rows = node.setdefault(name, tomlkit.aot())
            while len(rows) > len(value):
                del rows[len(rows) - 1]
            for i, row in enumerate(value):
                if i == len(rows):
                    rows.append(tomlkit.table())
                for k in [k for k in rows[i] if k not in row]:
                    del rows[i][k]
                rows[i].update(row)
        elif isinstance(value, dict):      # update in place so comments in the table survive
            t = node.setdefault(name, tomlkit.table())
            for k in [k for k in t if k not in value]:
                del t[k]
            for k, v in value.items():
                t[k] = v
        else:
            node[name] = value

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        temp = self.path.with_suffix('.tmp')
        temp.write_text(tomlkit.dumps(self.doc))
        temp.replace(self.path)
        self.dirty = False


@dataclass
class Field:
    key: str
    label: str
    help: str = ''
    kind: str = 'text'          # text, int, bool or choice
    default: object = ''
    choices: list[str] = field(default_factory=list)
    low: int = 0
    high: int = 86400


@dataclass
class Col:
    name: str
    hint: str = ''
    choices: list[str] = field(default_factory=list)


@dataclass
class Table:
    """A list of rows: `tables` is an array of tables, `map` a key→value table, `strings` a list of strings."""
    key: str
    title: str
    help: str
    cols: list[Col]
    shape: str = 'tables'


@dataclass
class Group:
    title: str
    items: list
    help: str = ''


@dataclass
class Page:
    name: str
    title: str
    icon: str
    intro: str
    store: str = 'pulse'        # which file its keys live in
    groups: list[Group] = field(default_factory=list)


def rule_cols(actions: list[str], conditions: dict) -> list[Col]:
    return [Col('action', choices=actions), Col('when', choices=list(conditions)), Col('value', 'value')]


LEVELS = dict(kind='choice', choices=claude.LEVELS, default='counts')
PAGES = [
    Page('site', 'Site', 'user-home-symbolic',
         'Who you are on GitHub. `sitekit history` uses this to build the project timeline, and the daily GitHub Action '
         'reads the same file, so commit changes here along with the site.', 'site', [
             Group('GitHub', [
                 Field('github.user', 'User', 'Your GitHub username'),
                 Field('github.author', 'Commit author', 'Regular expression matched against "Name <email>"; only matching commits count'),
                 Field('github.forks', 'Include forks', 'Count repos you forked as well as ones you created', 'bool', True),
                 Table('github.ignore', 'Hidden repos', 'Left off the timeline and the feed, by name or owner/name', [Col('', 'name or owner/name')], 'strings'),
                 Table('github.repos', 'Extra repos', "Repos the API listing misses: other people's you commit to, or local checkouts", [Col('', 'owner/name or path')], 'strings'),
             ])]),
    Page('feeds', 'Feeds', 'folder-remote-symbolic',
         '`sitekit sync` imports posts from these feeds into the activity log every day. Media settings say where '
         'full-size gallery files live; leave them empty and the gallery serves its previews from this repo.', 'site', [
             Group('Feeds', [Table('feeds', 'Feeds', 'RSS or Atom feeds to import', [
                 Col('url', 'feed URL'), Col('source', 'name shown on entries'), Col('kind', choices=['', 'post', 'status', 'link', 'media', 'lj'])])]),
             Group('Media', [
                 Field('media.base', 'Public URL', 'Public URL of the bucket, like https://media.example.net/'),
                 Field('media.masters', 'Masters folder', '`sitekit gallery add` writes full-size files here'),
                 Field('media.remote', 'rclone remote', 'Where masters are mirrored, like r2:my-media'),
                 Field('media.backup', 'Backup folder', '`sitekit backup` keeps a dated copy of the bucket here'),
             ])]),
    Page('daemon', 'Daemon', 'preferences-system-time-symbolic',
         'The pulse daemon notes once a minute whether you are at the keyboard, and once an hour publishes daily totals '
         'by committing to a checkout of the site. Raw samples stay in a local database.', groups=[
             Group('Publishing', [
                 Field('site', 'Site checkout', 'The daemon commits data/pulse/ here. If missing it is cloned from the remote, sparse and small', default='~/.local/share/sitekit/site'),
                 Field('remote', 'Git remote', 'Where that checkout comes from and pushes to'),
                 Field('push', 'Push after publishing', 'Off keeps commits local, which is a good way to try everything first', 'bool', True),
                 Field('publish', 'Publish every', 'Seconds between publishes', 'int', 3600, low=60),
             ]),
             Group('Sampling', [
                 Field('interval', 'Sample every', 'Seconds between samples', 'int', 60, low=5, high=3600),
                 Field('idle', 'Away after', 'Seconds without keyboard or mouse input', 'int', 180, low=10),
                 Field('window', 'Project stays current for', 'Seconds after a file in it changes', 'int', 600, low=10),
                 Field('db', 'Local database', 'Private: readable only by you, and never pushed', default='~/.local/share/sitekit/pulse.sqlite3'),
             ]),
         ]),
    Page('projects', 'Projects', 'folder-symbolic',
         'Pulse tracks minutes, changed files and Claude sessions for the projects listed here, and only those names are '
         'published. List folders by hand, or let it find them: a folder counts when it is a git repo that pushes to a '
         'public GitHub repo of yours, and passes the filters below.', groups=[
             Group('Find projects automatically', [
                 Field('discover.enabled', 'Scan for projects', 'Checked when the daemon starts and then once a day', 'bool', False),
                 Table('discover.roots', 'Folders to scan', 'Searched for git repositories', [Col('', '~/prj')], 'strings'),
                 Field('discover.depth', 'Scan depth', 'How many folders down to look', 'int', 3, low=1, high=8),
                 Table('discover.owners', 'GitHub owners', 'A repo must push to one of these accounts', [Col('', 'username or org')], 'strings'),
                 Field('discover.public_only', 'Public repos only', 'Leave on: names of private repos would otherwise appear on your site', 'bool', True),
                 Field('discover.max_idle', 'Skip if untouched for', 'Like 90d, 6m or 1y; empty for no limit. Uses the last commit or edit'),
                 Field('discover.max_age', 'Skip if created over', 'Like 1y; empty for no limit. Uses the date on GitHub'),
             ]),
             Group('Filters', [Table('discover.rules', 'Filter rules',
                                     'First match decides. deny leaves a folder out; allow exempts it from the two limits above. ' +
                                     ', '.join(f'{k}: {v[0]}' for k, v in discover.CONDITIONS.items()),
                                     rule_cols(['deny', 'allow'], discover.CONDITIONS))]),
             Group('Listed by hand', [Table('projects', 'Folders', 'Always tracked, git repo or not, under the project id you give. Ids come from data/projects.json',
                                            [Col('', 'folder'), Col('', 'project id')], 'map')]),
         ]),
    Page('apps', 'Apps', 'view-grid-symbolic',
         'Time is grouped into categories by which app has focus. Only category names are published, never app names or '
         'window titles. On GNOME under Wayland this needs the Focused Window D-Bus shell extension.', groups=[
             Group('Categories', [Table('apps', 'App categories', 'Case-insensitive regular expression matched against the app id; first match wins, the rest is "other"',
                                        [Col('', 'category'), Col('', 'regular expression')], 'map')]),
             Group('Ignored files', [Table('ignore', 'Ignored names', 'File or folder patterns to skip while watching, on top of .git, node_modules, venvs and editor temp files', [Col('', '*.log')], 'strings')]),
         ]),
    Page('claude', 'Claude', 'user-available-symbolic',
         'Reports your Claude Code sessions (read from ~/.claude) and claude.ai conversations (seen by the browser extension '
         'or in browser history), grouped by project. Titles and summaries go to your public site, so start with counts, '
         'check the preview on the Review tab, then turn them up.', groups=[
             Group('What gets published', [
                 Field('claude.code', 'Claude Code', LEVEL_HELP + '. Sessions outside your listed projects are only ever counted', **LEVELS),
                 Field('claude.web', 'claude.ai', LEVEL_HELP + '. Conversations have no folder, so titles appear whatever the project', **LEVELS),
                 Field('claude.dir', 'Claude Code folder', '', default='~/.claude'),
             ]),
             Group('Summaries', [
                 Field('claude.model', 'Model', 'Summaries are written once per conversation per day and cached', default=claude.MODEL),
             ], 'Needs credentials: a key saved here, ANTHROPIC_API_KEY, or `ant auth login`. Your prompts in each conversation are sent to the Claude API.'),
         ]),
    Page('browser', 'Browser', 'web-browser-symbolic',
         'A small extension sends tab, navigation and focus events to a local program, with no network involved. Each page '
         'is then dropped, logged privately, or shared, by the rules below. Query strings are removed before anything is '
         'stored, and the extension never runs in incognito windows.', groups=[
             Group('Log', [
                 Field('web.enabled', 'Record browsing', 'Accept events from the extension', 'bool', True),
                 Field('web.history', 'Import browser history', 'Fill gaps from history through browserprofile; also finds claude.ai conversations without the extension', 'bool', True),
                 Field('web.keep_query', 'Keep query strings', 'Leave off: they often carry tokens and search terms', 'bool', False),
                 Field('web.default', 'Pages no rule matches', 'drop: never stored. private: logged here only. domain: domain and minutes published. page: title and URL too',
                       'choice', 'private', web.ACTIONS),
             ]),
             Group('Filters', [Table('web.rules', 'Rules', 'First match decides. ' + ', '.join(f'{k}: {v[0]}' for k, v in web.CONDITIONS.items()),
                                     rule_cols(web.ACTIONS, web.CONDITIONS))]),
             Group('Projects', [Table('web.projects', 'URLs that belong to a project',
                                      'Time on github.com/you/repo counts toward that project automatically. Add other URLs here, as patterns',
                                      [Col('', 'https://docs.example.com/*'), Col('', 'project id')], 'map')]),
         ]),
    Page('review', 'Review', 'emblem-ok-symbolic',
         'Check what would be published, then set the daemon to run with your session.'),
]


def plain(text: str) -> str:
    """Row subtitles are Pango markup; these are plain text with `commands` in backticks."""
    return GLib.markup_escape_text(text.replace('`', ''))


class Row:
    """Build the row for a Field and keep the Store in step with it."""

    @staticmethod
    def make(f: Field, store: Store) -> Gtk.Widget:
        return getattr(Row, f.kind)(f, store)

    @staticmethod
    def text(f, store):
        row = Adw.ActionRow(title=f.label, subtitle=plain(f.help), subtitle_lines=3)
        entry = Gtk.Entry(text=str(store.get(f.key, f.default) or ''), valign=Gtk.Align.CENTER, width_chars=30)
        entry.connect('changed', lambda e: store.set(f.key, e.get_text().strip()))
        row.add_suffix(entry)
        return row

    @staticmethod
    def int(f, store):
        row = Adw.SpinRow.new_with_range(f.low, f.high, 1)
        row.set_title(f.label)
        row.set_subtitle(plain(f.help))
        row.set_value(int(store.get(f.key, f.default)))
        row.connect('notify::value', lambda r, _: store.set(f.key, int(r.get_value())))
        return row

    @staticmethod
    def bool(f, store):
        row = Adw.SwitchRow(title=f.label, subtitle=plain(f.help), active=bool(store.get(f.key, f.default)))
        row.connect('notify::active', lambda r, _: store.set(f.key, r.get_active()))
        return row

    @staticmethod
    def choice(f, store):
        row = Adw.ComboRow(title=f.label, subtitle=plain(f.help), subtitle_lines=3, model=Gtk.StringList.new(f.choices))
        row.set_selected(f.choices.index(store.get(f.key, f.default)))
        row.connect('notify::selected', lambda r, _: store.set(f.key, f.choices[r.get_selected()]))
        return row


class Editor(Adw.PreferencesGroup):
    """Rows of entries and drop-downs with add and remove buttons, written back to the Store on every change."""

    def __init__(self, t: Table, store: Store):
        super().__init__(title=t.title, description=t.help.replace('`', ''))
        self.t, self.store, self.rows = t, store, []
        add = Gtk.Button(icon_name='list-add-symbolic', valign=Gtk.Align.CENTER, tooltip_text='Add a row', css_classes=['flat'])
        add.connect('clicked', lambda _: self.add_row())
        self.set_header_suffix(add)
        value = store.get(t.key)
        if t.shape == 'strings':
            rows = [[v] for v in value or []]
        elif t.shape == 'map':
            rows = [[k, v] for k, v in (value or {}).items()]
        else:
            rows = [[r.get(c.name, '') for c in t.cols] for r in value or []]
        for r in rows:
            self.append(r)

    def add_row(self, values=None) -> None:
        self.append(values)
        if values:
            self.write()

    def append(self, values=None) -> None:
        box = Gtk.Box(spacing=8, margin_top=6, margin_bottom=6, margin_start=12, margin_end=6)
        widgets = []
        for i, col in enumerate(self.t.cols):
            value = str(values[i]) if values else ''
            if col.choices:
                w = Gtk.DropDown.new_from_strings(col.choices)
                w.set_selected(col.choices.index(value) if value in col.choices else 0)
                w.connect('notify::selected', lambda *_: self.write())
            else:
                w = Gtk.Entry(text=value, placeholder_text=col.hint, hexpand=True)
                w.connect('changed', lambda *_: self.write())
            box.append(w)
            widgets.append(w)
        row = Gtk.ListBoxRow(activatable=False, selectable=False, child=box)
        remove = Gtk.Button(icon_name='user-trash-symbolic', valign=Gtk.Align.CENTER, tooltip_text='Remove', css_classes=['flat'])
        entry = (row, widgets)
        remove.connect('clicked', lambda _: self.remove_row(entry))
        box.append(remove)
        self.add(row)
        self.rows.append(entry)

    def remove_row(self, entry) -> None:
        self.remove(entry[0])
        self.rows.remove(entry)
        self.write()

    def values(self) -> list[list[str]]:
        read = lambda w: w.get_text().strip() if isinstance(w, Gtk.Entry) else w.get_selected_item().get_string()
        return [[read(w) for w in widgets] for _, widgets in self.rows]

    def write(self) -> None:
        # Half-typed rows stay on screen but aren't saved. Drop-downs always have a value, and some are optional, so a
        # table row counts once its first text column is filled in.
        text = next(i for i, c in enumerate(self.t.cols) if not c.choices)
        rows = [r for r in self.values() if r[text]]
        if self.t.shape == 'strings':
            value = [r[0] for r in rows]
        elif self.t.shape == 'map':
            value = {k: v for k, v in rows if v}
        else:
            value = [{c.name: v for c, v in zip(self.t.cols, r) if v} for r in rows]
        self.store.set(self.t.key, value)


def check(pulse: Store) -> str | None:
    """A reason this config would fail when the daemon loads it."""
    for name, rx in (pulse.get('apps') or {}).items():
        try:
            re.compile(rx)
        except re.error as e:
            return f'App category {name}: {e}'
    for key in ('discover.max_idle', 'discover.max_age'):
        try:
            discover.duration(pulse.get(key))
        except ValueError as e:
            return str(e)
    return None


class Window(Adw.ApplicationWindow):
    def __init__(self, app, stores: dict[str, Store | None], config: Path, wizard: bool):
        super().__init__(application=app, title='sitekit', default_width=1120, default_height=780)
        self.stores, self.config, self.editors, self.key = stores, config, {}, None
        self.stack = Adw.ViewStack()
        for page in PAGES:
            self.stack.add_titled_with_icon(self.build(page), page.name, page.title, page.icon)
        header = Adw.HeaderBar()
        header.set_title_widget(Adw.ViewSwitcher(stack=self.stack, policy=Adw.ViewSwitcherPolicy.WIDE))
        save = Gtk.Button(label='Save', css_classes=['suggested-action'], tooltip_text='Save (Ctrl+S)')
        save.connect('clicked', lambda _: self.save())
        header.pack_end(save)
        tour = Gtk.Button(icon_name='help-browser-symbolic', tooltip_text='Walk through every tab')
        tour.connect('clicked', lambda _: self.show_wizard(True))
        header.pack_end(tour)

        self.bar = Gtk.ActionBar()
        self.back = Gtk.Button(label='Back')
        self.back.connect('clicked', lambda _: self.step(-1))
        self.next = Gtk.Button(label='Next', css_classes=['suggested-action'])
        self.next.connect('clicked', lambda _: self.step(1))
        self.progress = Gtk.Label(css_classes=['dim-label'])
        self.bar.pack_start(self.back)
        self.bar.set_center_widget(self.progress)
        self.bar.pack_end(self.next)

        self.toasts = Adw.ToastOverlay(child=self.stack)
        view = Adw.ToolbarView(content=self.toasts)
        view.add_top_bar(header)
        view.add_bottom_bar(self.bar)
        self.set_content(view)
        self.stack.connect('notify::visible-child-name', lambda *_: self.sync_wizard())
        keys = Gtk.ShortcutController()
        keys.add_shortcut(Gtk.Shortcut.new(Gtk.ShortcutTrigger.parse_string('<Control>s'), Gtk.CallbackAction.new(lambda *_: self.save() or True)))
        self.add_controller(keys)
        self.show_wizard(wizard)

    def build(self, page: Page) -> Gtk.Widget:
        store = self.stores[page.store]
        prefs = Adw.PreferencesPage(title=page.title)
        intro = Adw.PreferencesGroup()
        intro.add(Gtk.Label(label=page.intro.replace('`', ''), wrap=True, xalign=0, css_classes=['body'], margin_bottom=6))
        prefs.add(intro)
        if store is None:
            prefs.add(Adw.PreferencesGroup(title='No site.toml found', description='Start this app from your site checkout, or set SITEKIT_SITE.'))
            return prefs
        for g in page.groups:
            fields = [i for i in g.items if isinstance(i, Field)]
            if fields:
                group = Adw.PreferencesGroup(title=g.title, description=g.help)
                for f in fields:
                    group.add(Row.make(f, store))
                prefs.add(group)
            for t in (i for i in g.items if isinstance(i, Table)):
                self.editors[t.key] = Editor(t, store)
                prefs.add(self.editors[t.key])
        getattr(self, f'extra_{page.name}', lambda p: None)(prefs)
        return prefs

    def button(self, row: Adw.ActionRow, label: str, action) -> Gtk.Button:
        b = Gtk.Button(label=label, valign=Gtk.Align.CENTER)
        b.connect('clicked', lambda _: action())
        row.add_suffix(b)
        return b

    def extra_projects(self, prefs) -> None:
        self.found = Adw.PreferencesGroup(title='Scan results', description='Saves first, then shows what the current settings find and why anything was left out.')
        row = Adw.ActionRow(title='Try it')
        self.button(row, 'Save and scan', self.scan)
        self.found.add(row)
        self.found_rows = []
        prefs.add(self.found)

    def scan(self) -> None:
        if self.save():
            self.toast('Scanning…')
            self.run(['pulse', 'discover', '--json', '--config', str(self.config)], self.scanned)

    def scanned(self, ok: bool, out: str, err: str) -> None:
        for r in self.found_rows:
            self.found.remove(r)
        self.found_rows = []
        if not ok:
            return self.toast(f'Scan failed: {err.strip()[-200:]}')
        for f in json.loads(out):
            row = Adw.ActionRow(title=GLib.markup_escape_text(f['path']), subtitle=GLib.markup_escape_text(f"project id: {f['id']}" if f['id'] else f['why']))
            row.add_prefix(Gtk.Image(icon_name='object-select-symbolic' if f['id'] else 'action-unavailable-symbolic'))
            if f['id']:
                self.button(row, 'Skip', lambda p=f['path']: self.editors['discover.rules'].add_row(['deny', 'path', p]))
            else:
                self.button(row, 'Add by hand', lambda p=f['path']: self.editors['projects'].add_row([p, Path(p).name]))
            self.found.add(row)
            self.found_rows.append(row)

    def extra_claude(self, prefs) -> None:
        group = Adw.PreferencesGroup(title='API key')
        self.key = Adw.PasswordEntryRow(title='Saved to ~/.config/sitekit/anthropic.key on Save, readable only by you')
        state = 'A key is saved' if claude.KEY_FILE.exists() else 'ANTHROPIC_API_KEY is set' if os.environ.get('ANTHROPIC_API_KEY') else 'No key yet'
        group.set_description(state)
        group.add(self.key)
        prefs.add(group)

    def extra_browser(self, prefs) -> None:
        group = Adw.PreferencesGroup(title='Install', description='Do these once. Developer mode is needed because the extension is not on the Chrome Web Store.')
        host = Adw.ActionRow(title='1. Connect the browser to sitekit', subtitle='Registers the local program with each Chromium-family browser found')
        self.button(host, 'Install', lambda: self.run(['pulse', 'install-browser'], self.reported))
        folder = Adw.ActionRow(title='2. Load the extension', subtitle='In chrome://extensions turn on Developer mode, choose Load unpacked, and pick this folder', subtitle_lines=3)
        self.button(folder, 'Copy path', lambda: (self.get_clipboard().set(str(web.EXTENSION)), self.toast(str(web.EXTENSION))))
        self.button(folder, 'Open folder', lambda: Gio.AppInfo.launch_default_for_uri(web.EXTENSION.as_uri(), None))
        for row in (host, folder):
            group.add(row)
        prefs.add(group)

    def extra_review(self, prefs) -> None:
        look = Adw.PreferencesGroup(title='What leaves this machine', description='Saves first. Nothing is published or pushed by these buttons.')
        public = Adw.ActionRow(title="Today's public record", subtitle='Exactly what would go into data/pulse/, as of now')
        self.button(public, 'Preview', lambda: self.save() and self.run(['pulse', 'status', '--config', str(self.config)], self.show_output))
        private = Adw.ActionRow(title='Your private browsing log', subtitle='Everything stored locally, shared or not')
        self.button(private, 'Show', lambda: self.save() and self.run(['pulse', 'log', '--days', '7', '--config', str(self.config)], self.show_output))
        look.add(public)
        look.add(private)
        prefs.add(look)
        self.output = Gtk.TextView(editable=False, monospace=True, wrap_mode=Gtk.WrapMode.WORD_CHAR, top_margin=8, left_margin=8, right_margin=8, bottom_margin=8)
        text = Adw.PreferencesGroup()
        text.add(Gtk.ScrolledWindow(child=self.output, min_content_height=240, css_classes=['card']))
        prefs.add(text)
        start = Adw.PreferencesGroup(title='Run it')
        service = Adw.ActionRow(title='Start with your session', subtitle='Installs and starts the daemon and tray icon as user services, and adds sitekit to the app launcher. '
                                'With pushing on, it publishes to GitHub once an hour from then on', subtitle_lines=3)
        self.button(service, 'Turn on', lambda: self.save() and self.run(['pulse', 'install-service'], self.reported))
        start.add(service)
        prefs.add(start)

    def show_output(self, ok: bool, out: str, err: str) -> None:
        self.output.get_buffer().set_text(out if ok else err)

    def reported(self, ok: bool, out: str, err: str) -> None:
        self.toast(out.strip().splitlines()[0] if ok and out.strip() else 'Done' if ok else err.strip()[-200:])

    def show_wizard(self, on: bool) -> None:
        self.bar.set_revealed(on)
        if on:
            self.stack.set_visible_child_name(PAGES[0].name)
        self.sync_wizard()

    def sync_wizard(self) -> None:
        i = [p.name for p in PAGES].index(self.stack.get_visible_child_name())
        self.progress.set_label(f'Step {i + 1} of {len(PAGES)}: {PAGES[i].title}')
        self.back.set_sensitive(i > 0)
        self.next.set_label('Finish' if i == len(PAGES) - 1 else 'Next')

    def step(self, by: int) -> None:
        i = [p.name for p in PAGES].index(self.stack.get_visible_child_name()) + by
        if i == len(PAGES):
            if self.save():
                self.bar.set_revealed(False)
        else:
            self.stack.set_visible_child_name(PAGES[i].name)

    def save(self) -> bool:
        if problem := check(self.stores['pulse']):
            self.toast(problem)
            return False
        for store in filter(None, self.stores.values()):
            if store.dirty or not store.path.exists():
                store.save()
        if self.key and (key := self.key.get_text().strip()):
            claude.KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
            claude.KEY_FILE.touch(mode=0o600)
            claude.KEY_FILE.write_text(key + '\n')
            self.key.set_text('')
        self.toast('Saved')
        return True

    def toast(self, text: str) -> None:
        self.toasts.add_toast(Adw.Toast(title=GLib.markup_escape_text(text)))

    def run(self, args: list[str], done) -> None:
        exe = shutil.which('sitekit')
        command = [exe] if exe else [sys.executable, '-m', 'sitekit']
        proc = Gio.Subprocess.new(command + args, Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE)

        def finished(p, result):
            _, out, err = p.communicate_utf8_finish(result)
            done(p.get_successful(), out or '', err or '')

        proc.communicate_utf8_async(None, None, finished)


def site_store() -> Store | None:
    try:
        return Store(find_site() / 'site.toml')
    except SystemExit:
        return None


def main(args: list[str]) -> None:
    ap = argparse.ArgumentParser(prog='sitekit config')
    ap.add_argument('--wizard', action='store_true')
    ap.add_argument('--config', type=Path, default=expand('~/.config/sitekit/pulse.toml'))
    a = ap.parse_args(args)
    config = expand(a.config)
    first_run = not config.exists()
    stores = {'pulse': Store(config, TEMPLATE.read_text() if TEMPLATE.exists() else ''), 'site': site_store()}

    def activate(app):
        (app.get_active_window() or Window(app, stores, config, a.wizard or first_run)).present()

    app = Adw.Application(application_id='io.github.un1tz3r0.sitekit')
    app.connect('activate', activate)
    app.run([])


if __name__ == '__main__':
    main(sys.argv[1:])
