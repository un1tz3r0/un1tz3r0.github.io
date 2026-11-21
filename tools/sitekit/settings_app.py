"""Pulse Settings: a libadwaita window for the pulse daemon.

Pulse shows live state with a countdown to the next publish, and the controls that act at once (pause, push, publish,
rescan); Projects, Apps and Publishing edit pulse.toml, which Save and Apply writes in place (keeping comments, the old
file goes to pulse.toml.bak) and the daemon restarts on; Site edits site.toml in the site checkout, which needs a commit
to reach the daily workflow; Tools runs the other sitekit commands in the site checkout; Log follows the daemon's log
with a toggle per kind of line. On first run, or from the header's tour button, Back and Next walk through the tabs
that need filling in.
"""
from __future__ import annotations

import sys
import time
from dataclasses import dataclass
from pathlib import Path

import gi

gi.require_version('Gtk', '4.0')
gi.require_version('Gdk', '4.0')
gi.require_version('Adw', '1')
from gi.repository import Adw, Gdk, Gio, GLib, Gtk, Pango  # noqa: E402

from . import browsing, conversations, tomledit  # noqa: E402
from .common import expand, load_toml  # noqa: E402
from .pulse import CONDITIONS, CONFIG, KINDS, discover_rules, duration, map_rules  # noqa: E402
from .pulse_ctl import APP_ID, ICONS, Link, restart  # noqa: E402

PAGES = {'pulse': ('Pulse', 'sitekit-pulse-active'), 'site': ('Site', 'user-home-symbolic'), 'projects': ('Projects', 'folder-symbolic'),
         'apps': ('Apps', 'view-app-grid-symbolic'), 'publishing': ('Publishing', 'send-to-symbolic'),
         'tools': ('Tools', 'utilities-terminal-symbolic'), 'log': ('Log', 'view-list-symbolic')}
TOUR = ['site', 'projects', 'apps', 'publishing', 'pulse']    # the walkthrough's steps, in order
EXAMPLE = Path(__file__).resolve().parent.parent / 'pulse.example.toml'
DEFAULTS = {('', 'interval'): 60, ('', 'idle'): 180, ('', 'window'): 600, ('', 'publish'): 3600,
            ('discover', 'enabled'): True, ('discover', 'root'): '~',
            ('', 'site'): '~/.local/share/sitekit/site', ('', 'db'): '~/.local/share/sitekit/pulse.sqlite3', ('discover', 'depth'): 0, ('discover', 'every'): 86400, ('browser', 'titles'): True,
            ('browser', 'history'): False, ('browser', 'default'): 'private', ('claude', 'code'): 'off', ('claude', 'web'): 'off',
            ('claude', 'model'): conversations.MODEL, ('github', 'forks'): True}
FEED_KINDS = ['', 'post', 'status', 'link', 'media', 'lj']
TINT = {'lifecycle': '#3584e4', 'sample': '#77767b', 'activity': '#2ec27e', 'scan': '#9141ac', 'publish': '#1c71d8',
        'warning': '#e5a50a', 'error': '#e01b24'}
CSS = '.kind { border-radius: 99px; padding: 0 8px; font-size: 0.8em; font-weight: 600; min-width: 64px; }\n' + \
      ''.join(f'.kind-{k} {{ background: alpha({c}, 0.22); }}\n' for k, c in TINT.items()) + \
      'button.kind:not(:checked) { opacity: 0.4; } button.kind { min-height: 24px; }\n' + \
      '.logtime { font-family: monospace; opacity: 0.6; } .output { font-family: monospace; font-size: 0.9em; }\n' + \
      '.sign, .priority { min-width: 22px; padding: 2px 6px; font-weight: 800; }\n' + \
      '.sign { color: @success_color; } .sign:checked { color: @error_color; } .priority.normal { color: alpha(currentColor, 0.45); }'


def hours(minutes: int) -> str:
    return f'{minutes // 60} h {minutes % 60:02d} min' if minutes >= 60 else f'{minutes} min'


def ago(t: float | None) -> str:
    if not t:
        return 'never'
    s = time.time() - t
    return f'{int(s)} s ago' if s < 90 else f'{round(s / 60)} min ago' if s < 5400 else f'{s / 3600:.1f} h ago'


def countdown(t: float) -> str:
    s = max(0, int(t - time.time()))
    return f'in {s // 3600}:{s // 60 % 60:02d}:{s % 60:02d}' if s >= 3600 else f'in {s // 60}:{s % 60:02d}'


def row(title: str, subtitle: str = '') -> Adw.ActionRow:
    r = Adw.ActionRow(title=title, subtitle=subtitle)
    r.set_subtitle_selectable(True)
    return r


def group(page: Adw.PreferencesPage, title: str, description: str = '') -> Adw.PreferencesGroup:
    g = Adw.PreferencesGroup(title=title, description=description)
    page.add(g)
    return g


def button(label: str, on_click, style: str | None = None) -> Gtk.Button:
    b = Gtk.Button(label=label, valign=Gtk.Align.CENTER)
    if style:
        b.add_css_class(style)
    b.connect('clicked', lambda *_: on_click())
    return b


PRIORITY = {'': '·', '!': '!', '?': '?'}
PRIORITY_HELP = {'': 'Normal priority: tried in list order', '!': 'High priority: tried before the others',
                 '?': 'Low priority: tried after the others'}


@dataclass
class Col:
    """One field of a list's lines. kind: text, choice (a drop-down), sign (the rule's action: + allow, − deny) or
    priority (cycles normal, ! and ?)."""
    name: str
    kind: str = 'text'
    hint: str = ''
    choices: list[str] | None = None
    wide: bool = True       # a text field that takes the spare width; a narrow one is for short keys


class ListEditor(Adw.PreferencesGroup):
    """An editable list: one line per item, + in the header to add one, and a … menu on each line with Edit, Move up and
    Move down (only where `ordered`) and Remove. Items are dicts of the columns' names; get() leaves out lines whose
    first text field is empty, an allow action and a normal priority (the defaults)."""

    def __init__(self, title: str, description: str, items: list[dict], cols: list[Col], ordered: bool = True,
                 extra: Gtk.Widget | None = None):
        super().__init__(title=title, description=description)
        self.cols, self.ordered, self.lines = cols, ordered, []
        self.first = next(c.name for c in cols if c.kind == 'text')
        add = Gtk.Button(icon_name='list-add-symbolic', tooltip_text='Add', valign=Gtk.Align.CENTER)
        add.add_css_class('flat')
        add.connect('clicked', lambda *_: self.put({}, focus=True))
        header = Gtk.Box(spacing=4)
        for w in filter(None, (extra, add)):
            header.append(w)
        self.set_header_suffix(header)
        for item in items:
            self.put(item)

    def put(self, item: dict, focus: bool = False) -> None:
        box = Gtk.Box(spacing=6, margin_top=6, margin_bottom=6, margin_start=12, margin_end=6)
        widgets = {}
        for c in self.cols:
            widgets[c.name] = w = self.widget(c, item.get(c.name))
            box.append(w)
        menu = Gio.Menu()
        menu.append('Edit', 'line.edit')
        if self.ordered:
            menu.append('Move up', 'line.up')
            menu.append('Move down', 'line.down')
        menu.append('Remove', 'line.remove')
        more = Gtk.MenuButton(icon_name='view-more-symbolic', menu_model=menu, valign=Gtk.Align.CENTER, tooltip_text='More')
        more.add_css_class('flat')
        box.append(more)
        line = Adw.PreferencesRow(activatable=False, selectable=False, child=box)    # sits in the group's card
        entry = (line, widgets)
        actions = Gio.SimpleActionGroup()
        for name, do in [('edit', lambda: self.edit(entry)), ('up', lambda: self.move(entry, -1)),
                         ('down', lambda: self.move(entry, 1)), ('remove', lambda: self.drop(entry))]:
            a = Gio.SimpleAction.new(name, None)
            a.connect('activate', lambda *_, do=do: do())
            actions.add_action(a)
        line.insert_action_group('line', actions)
        line.actions = actions
        self.lines.append(entry)
        self.add(line)
        self.refresh()
        if focus:
            self.edit(entry)

    def widget(self, c: Col, value) -> Gtk.Widget:
        if c.kind == 'sign':
            w = Gtk.ToggleButton(active=value == 'deny', valign=Gtk.Align.CENTER)
            w.add_css_class('sign')
            w.add_css_class('flat')
            show = lambda b: (b.set_label('−' if b.get_active() else '+'),
                              b.set_tooltip_text('Deny: what this matches is left out (−)' if b.get_active()
                                                 else 'Allow: what this matches is let in (+)'))
            w.connect('toggled', show)
            show(w)
            return w
        if c.kind == 'priority':
            w = Gtk.Button(valign=Gtk.Align.CENTER)
            w.add_css_class('priority')
            w.add_css_class('flat')
            w.value = value if value in PRIORITY else ''

            def show(b):
                b.set_label(PRIORITY[b.value])
                b.set_tooltip_text(PRIORITY_HELP[b.value] + ' (click to change)')
                (b.add_css_class if b.value == '' else b.remove_css_class)('normal')
            w.connect('clicked', lambda b: (setattr(b, 'value', {'': '!', '!': '?', '?': ''}[b.value]), show(b)))
            show(w)
            return w
        if c.kind == 'choice':
            w = Gtk.DropDown.new_from_strings(c.choices)
            w.set_selected(c.choices.index(value) if value in c.choices else 0)
            w.set_valign(Gtk.Align.CENTER)
            return w
        return Gtk.Entry(text=str(value or ''), placeholder_text=c.hint, hexpand=c.wide, valign=Gtk.Align.CENTER,
                         width_chars=10 if c.wide else 12, max_width_chars=14 if not c.wide else -1)

    def read(self, c: Col, w: Gtk.Widget):
        if c.kind == 'sign':
            return 'deny' if w.get_active() else None
        if c.kind == 'priority':
            return w.value or None
        if c.kind == 'choice':
            return w.get_selected_item().get_string() or None
        return w.get_text().strip() or None

    def edit(self, entry) -> None:
        entry[1][self.first].grab_focus()

    def drop(self, entry) -> None:
        self.remove(entry[0])
        self.lines.remove(entry)
        self.refresh()

    def move(self, entry, by: int) -> None:
        i = self.lines.index(entry)
        j = max(0, min(len(self.lines) - 1, i + by))
        if i == j:
            return
        self.lines.insert(j, self.lines.pop(i))
        for line, _ in self.lines:     # re-add in the new order
            self.remove(line)
        for line, _ in self.lines:
            self.add(line)
        self.refresh()

    def refresh(self) -> None:
        """Only lines that can move offer to."""
        for i, (line, _) in enumerate(self.lines):
            line.actions.lookup_action('up').set_enabled(self.ordered and i > 0)
            line.actions.lookup_action('down').set_enabled(self.ordered and i < len(self.lines) - 1)

    def get(self) -> list[dict]:
        out = []
        for _, widgets in self.lines:
            item = {c.name: v for c in self.cols if (v := self.read(c, widgets[c.name])) is not None}
            if item.get(self.first):
                out.append(item)
        return out


def strings(title: str, description: str, values: list[str], hint: str) -> ListEditor:
    """A list of strings whose order doesn't matter."""
    return ListEditor(title, description, [{'value': v} for v in values], [Col('value', hint=hint)], ordered=False)


def string_values(editor: ListEditor) -> list[str]:
    return [i['value'] for i in editor.get()]


def pairs(title: str, description: str, values: dict, hints: tuple[str, str], extra: Gtk.Widget | None = None) -> ListEditor:
    """A table of names to values, as a list of pairs whose order doesn't matter."""
    return ListEditor(title, description, [{'key': k, 'value': v} for k, v in values.items()],
                      [Col('key', hint=hints[0]), Col('value', hint=hints[1], wide=False)], ordered=False, extra=extra)


def pair_values(editor: ListEditor) -> dict:
    return {i['key']: i.get('value', '') for i in editor.get()}


def rule_list(title: str, description: str, items: list[dict], *middle: Col, pattern: Col, key: Col | None = None) -> ListEditor:
    """An ordered rule list: + or −, priority, any fields of its own, the pattern, and the key it gives in a map."""
    return ListEditor(title, description, items, [Col('action', 'sign'), Col('priority', 'priority'), *middle, pattern,
                                                  *([key] if key else [])])


class Window(Adw.ApplicationWindow):
    def __init__(self, app: Adw.Application):
        super().__init__(application=app, title='Pulse Settings', default_width=760, default_height=760)
        self.path = expand(CONFIG)
        first_run = not self.path.exists()
        if not self.path.exists() and EXAMPLE.exists():
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(EXAMPLE.read_text())
        self.state, self.quiet = {}, False
        self.toasts, self.stack = Adw.ToastOverlay(), Adw.ViewStack()
        header = Adw.HeaderBar(title_widget=Adw.ViewSwitcher(stack=self.stack, policy=Adw.ViewSwitcherPolicy.NARROW))
        header.pack_end(button('Save and Apply', self.save, 'suggested-action'))
        tour = Gtk.Button(icon_name='help-browser-symbolic', tooltip_text='Walk through the settings')
        tour.connect('clicked', lambda *_: self.show_tour(True))
        header.pack_end(tour)
        self.bar, self.back, self.next = Gtk.ActionBar(), Gtk.Button(label='Back'), Gtk.Button(label='Next')
        self.next.add_css_class('suggested-action')
        self.back.connect('clicked', lambda *_: self.step(-1))
        self.next.connect('clicked', lambda *_: self.step(1))
        self.progress = Gtk.Label()
        self.progress.add_css_class('dim-label')
        self.bar.pack_start(self.back)
        self.bar.set_center_widget(self.progress)
        self.bar.pack_end(self.next)
        view = Adw.ToolbarView(content=self.toasts)
        view.add_top_bar(header)
        view.add_bottom_bar(self.bar)
        self.toasts.set_child(self.stack)
        self.set_content(view)
        self.build()
        self.stack.connect('notify::visible-child-name', lambda *_: self.sync_tour())
        self.show_tour(first_run)
        self.link = Link(self.event, self.updated)
        GLib.timeout_add_seconds(1, self.tick)

    def build(self) -> None:
        self.cfg = load_toml(self.path)
        self.site_path = expand(self.cfg.get('site', '~/.local/share/sitekit/site')) / 'site.toml'
        self.site_cfg = load_toml(self.site_path) if self.site_path.exists() else None
        for child in list(self.stack):
            self.stack.remove(child)
        for name, (title, icon) in PAGES.items():
            page = getattr(self, f'page_{name}')()
            self.stack.add_titled_with_icon(page, name, title, icon)

    def show_page(self, name: str) -> None:
        self.stack.set_visible_child_name(name if name in PAGES else 'pulse')
        self.present()

    # ── walkthrough ──────────────────────────────────────────────────────────────────────────────────────────────

    def show_tour(self, on: bool) -> None:
        self.bar.set_revealed(on)
        if on:
            self.stack.set_visible_child_name(TOUR[0])
        self.sync_tour()

    def sync_tour(self) -> None:
        name = self.stack.get_visible_child_name()
        if name not in TOUR:
            return self.progress.set_label('')
        i = TOUR.index(name)
        self.progress.set_label(f'Step {i + 1} of {len(TOUR)}: {PAGES[name][0]}')
        self.back.set_sensitive(i > 0)
        self.next.set_label('Save and Finish' if i == len(TOUR) - 1 else 'Next')

    def step(self, by: int) -> None:
        name = self.stack.get_visible_child_name()
        i = TOUR.index(name) + by if name in TOUR else 0
        if i == len(TOUR):
            self.save()
            self.bar.set_revealed(False)
        else:
            self.stack.set_visible_child_name(TOUR[max(0, i)])

    def toast(self, text: str) -> None:
        self.toasts.add_toast(Adw.Toast(title=GLib.markup_escape_text(text), timeout=4))

    def send(self, cmd: str, **args) -> None:
        if not self.link.send(cmd, **args):
            self.toast('The pulse daemon is not running')

    # ── pages ────────────────────────────────────────────────────────────────────────────────────────────────────

    def page_pulse(self) -> Adw.PreferencesPage:
        page = Adw.PreferencesPage()
        status = group(page, 'Status')
        self.mode_icon = Gtk.Image(icon_name='sitekit-pulse-offline', pixel_size=32)
        self.status = {k: row(t) for k, t in [('mode', 'Daemon'), ('today', 'Today'), ('now', 'Right now'),
                                              ('pending', 'Waiting to publish'), ('published', 'Last publish'),
                                              ('next', 'Next publish'), ('probes', 'Detected with')]}
        self.status['mode'].add_prefix(self.mode_icon)
        self.status['next'].add_suffix(button('Publish Now', lambda: self.send('publish')))
        self.status['probes'].add_suffix(button('Rescan Projects', lambda: self.send('rescan')))
        for r in self.status.values():
            status.add(r)
        self.paused = Adw.SwitchRow(title='Paused', subtitle='Nothing is recorded while paused')
        self.paused.connect('notify::active', lambda r, _: self.quiet or self.send('pause' if r.get_active() else 'resume'))
        self.push = Adw.SwitchRow(title='Push to GitHub', subtitle='Off: publish commits to the site checkout but keeps them local')
        self.push.connect('notify::active', lambda r, _: self.quiet or self.send('set', push=r.get_active()))
        status.add(self.paused)
        status.add(self.push)
        self.install = row('Run in the background', 'Installs the daemon as a user service that starts with your session, '
                                                    'the panel icon, and this window in the app launcher')
        self.install.add_suffix(button('Install', lambda: self.run([sys.executable, '-m', 'sitekit', 'pulse', 'install'],
                                                                  lambda ok: self.toast('Installed; the daemon is starting' if ok
                                                                                        else 'Install failed; see the Tools tab'))))
        status.add(self.install)
        timing = group(page, 'Timing', 'Saved to pulse.toml with Save and Apply')
        self.spins = {}
        for key, title, sub, lo, hi, default in [
                ('interval', 'Sample every', 'seconds between samples', 5, 3600, 60),
                ('idle', 'Away after', 'seconds without keyboard or mouse input', 30, 7200, 180),
                ('window', 'Project window', 'seconds a project stays current after a file in it changes', 60, 14400, 600),
                ('publish', 'Publish every', 'seconds between publishes', 60, 86400, 3600)]:
            spin = Adw.SpinRow.new_with_range(lo, hi, 5 if hi <= 3600 else 60)
            spin.set_title(title)
            spin.set_subtitle(sub)
            spin.set_value(self.cfg.get(key, default))
            self.spins[key] = spin
            timing.add(spin)
        return page

    def page_site(self) -> Adw.PreferencesPage:
        page = Adw.PreferencesPage()
        c = self.site_cfg
        if c is None:
            group(page, 'No site.toml', f'{GLib.markup_escape_text(str(self.site_path))} does not exist yet. Set the checkout on '
                                        'the Publishing tab and save; the daemon clones it on its first publish.')
            return page
        g = c.get('github', {})
        gh = group(page, 'GitHub', 'sitekit history builds the project timeline from these; the daily workflow reads the same file')
        self.github = {'user': Adw.EntryRow(title='User', text=g.get('user', '')),
                       'author': Adw.EntryRow(title='Commit author (regex on “Name &lt;email&gt;”)', text=g.get('author', ''))}
        self.forks = Adw.SwitchRow(title='Include forks', active=g.get('forks', True))
        for w in [*self.github.values(), self.forks]:
            gh.add(w)
        self.hidden = strings('Hidden repos', 'Left off the timeline and the feed', g.get('ignore', []), 'name or owner/name')
        self.extra_repos = strings('Extra repos', 'Repos the GitHub listing misses: other people’s you commit to, or local checkouts',
                                   g.get('repos', []), 'owner/name or a path')
        self.feeds = ListEditor('Feeds', 'sitekit sync imports these every day', c.get('feeds', []),
                                [Col('url', hint='feed URL'), Col('source', hint='name shown on entries'), Col('kind', 'choice', choices=FEED_KINDS)],
                                ordered=False)
        for w in (self.hidden, self.extra_repos, self.feeds):
            page.add(w)
        m = c.get('media', {})
        media = group(page, 'Media', 'Where full-size gallery files live; leave empty to serve previews from the repo')
        self.media = {k: Adw.EntryRow(title=t, text=m.get(k, '')) for k, t in [
            ('base', 'Public URL of the bucket'), ('masters', 'Local folder of full-size files'),
            ('remote', 'rclone remote they are mirrored to'), ('backup', 'Backup folder')]}
        for w in self.media.values():
            media.add(w)
        commit = group(page, 'Publish these settings')
        r = row('Commit and push site.toml', 'Save first. Only site.toml is committed')
        r.add_suffix(button('Push', lambda: self.run(['sh', '-c', 'git commit -qm "Update site.toml from Pulse Settings" -- site.toml '
                                                     '|| { echo nothing new to commit; true; }; "$0" -m sitekit push', sys.executable])))
        commit.add(r)
        return page

    def page_projects(self) -> Adw.PreferencesPage:
        page = Adw.PreferencesPage()
        choose = Gtk.Button(icon_name='folder-open-symbolic', tooltip_text='Choose a folder…', valign=Gtk.Align.CENTER)
        choose.add_css_class('flat')
        choose.connect('clicked', lambda *_: self.choose_folder())
        self.projects = pairs('Watched folders', 'Each folder and the project id its time counts toward ([projects])',
                              self.cfg.get('projects', {}), ('folder', 'project id'), extra=choose)
        page.add(self.projects)
        d = self.cfg.get('discover', {})
        disc = group(page, 'Discover', 'Find your repos automatically: git checkouts whose remote is on github.com/&lt;owner&gt;')
        self.discover = {
            'enabled': Adw.SwitchRow(title='Look for repos', active=d.get('enabled', True)),
            'root': Adw.EntryRow(title='Search under', text=d.get('root', '~')),
            'owner': Adw.EntryRow(title='GitHub owner (blank: the site’s user)', text=d.get('owner', '')),
        }
        self.depth = Adw.SpinRow.new_with_range(0, 12, 1)
        self.depth.set_title('Depth')
        self.depth.set_subtitle('folder levels below the search root; 0 means no limit')
        self.depth.set_value(d.get('depth', 0))
        self.every = Adw.SpinRow.new_with_range(1, 168, 1)
        self.every.set_title('Rescan every')
        self.every.set_subtitle('hours')
        self.every.set_value(d.get('every', 86400) / 3600)
        self.limits = {'max_idle': Adw.EntryRow(title='Skip repos untouched for (like 90d, 6m, 1y; blank: no limit)', text=str(d.get('max_idle', ''))),
                       'max_age': Adw.EntryRow(title='Skip repos created over (like 1y; blank: no limit)', text=str(d.get('max_age', '')))}
        for w in [*self.discover.values(), self.depth, self.every, *self.limits.values()]:
            disc.add(w)
        self.rules = rule_list('Rules', 'The first matching rule decides: − leaves a repo out (on an exact path, never watched at all), '
                               '+ exempts it from the two limits. ' + '; '.join(f'{k}: {v[0]}' for k, v in CONDITIONS.items()),
                               discover_rules(d), Col('when', 'choice', choices=list(CONDITIONS)), pattern=Col('value', hint='pattern'))
        page.add(self.rules)
        self.ignore = strings('Ignored files', 'Names never watched, on top of .git, node_modules, venvs and editor temp files',
                              self.cfg.get('ignore', []), 'fnmatch pattern, like *.log')
        page.add(self.ignore)
        return page

    def page_apps(self) -> Adw.PreferencesPage:
        page = Adw.PreferencesPage()
        focus = group(page, 'Focused now')
        self.focused = row('App', 'nothing yet')
        focus.add(self.focused)
        self.apps = rule_list('Categories', 'Regexes on the focused app id, each giving a category; anything no rule gives one is '
                              '“other”. − rules that category out for what it matches. Only category names are published',
                              map_rules(self.cfg.get('apps', {})), pattern=Col('match', hint='regex'), key=Col('to', hint='category', wide=False))
        page.add(self.apps)
        self.pins = pairs('Pinned apps', 'Exact app ids and their category, or “ignore” to not count time in them; checked first '
                          '([app_ids]; the panel menu adds these)', self.cfg.get('app_ids', {}), ('app id', 'category or ignore'))
        page.add(self.pins)
        return page

    def page_publishing(self) -> Adw.PreferencesPage:
        page = Adw.PreferencesPage()
        site = group(page, 'Site checkout', 'Where the daemon commits data/pulse/, and the repo it clones that from')
        self.site = {k: Adw.EntryRow(title=t, text=str(self.cfg.get(k, d))) for k, t, d in [
            ('site', 'Checkout', '~/.local/share/sitekit/site'), ('remote', 'Remote', ''),
            ('db', 'Local database', '~/.local/share/sitekit/pulse.sqlite3')]}
        for w in self.site.values():
            site.add(w)
        b = self.cfg.get('browser', {})
        browser = group(page, 'Browser extension')
        self.titles = Adw.SwitchRow(title='Keep page titles', subtitle='Stored locally only, never published', active=b.get('titles', True))
        self.history = Adw.SwitchRow(title='Import browser history', subtitle='Fills in pages visited on days the extension saw '
                                     'nothing (needs browserprofile and Python 3.13)', active=b.get('history', False))
        self.default = Adw.ComboRow(title='Pages no rule below matches', subtitle='private: nothing published. domain: its minutes '
                                    'and pages visited. page: its URL and title too', model=Gtk.StringList.new(browsing.LEVELS))
        self.default.set_selected(browsing.LEVELS.index(b.get('default', 'private')))
        for w in (self.titles, self.history, self.default):
            browser.add(w)
        self.filter = rule_list('What gets recorded', 'Globs on the hostname, or host + path with a “/”. The first matching rule '
                                'decides; with any + rules, only what they match is recorded', browsing.filter_rules(b),
                                pattern=Col('match', hint='*.example.com'))
        self.publish_rules = rule_list('What gets published', 'Globs like the ones above, each giving a level; − rules that level out',
                                       b.get('publish', []), pattern=Col('match', hint='github.com'),
                                       key=Col('level', 'choice', choices=['page', 'domain', 'private']))
        self.sites = rule_list('Site categories', 'Regexes on the hostname, each giving a category, published as minutes per category',
                               browsing.site_rules(b), pattern=Col('match', hint='regex'), key=Col('to', hint='category', wide=False))
        for w in (self.filter, self.publish_rules, self.sites):
            page.add(w)
        c = self.cfg.get('claude', {})
        cl = group(page, 'Claude conversations', 'Off, counts, titles too, or a one-sentence summary as well. Claude Code sessions are '
                   'named only under a published project; claude.ai titles follow the level alone')
        self.claude = {}
        for k, title in [('code', 'Claude Code'), ('web', 'claude.ai')]:
            self.claude[k] = Adw.ComboRow(title=title, model=Gtk.StringList.new(conversations.LEVELS))
            self.claude[k].set_selected(conversations.LEVELS.index(c.get(k, 'off')))
            cl.add(self.claude[k])
        self.model = Adw.EntryRow(title='Model for summaries', text=c.get('model', conversations.MODEL))
        have = 'saved' if conversations.KEY_FILE.exists() else 'none saved; ANTHROPIC_API_KEY or ant auth login also work'
        self.key = Adw.PasswordEntryRow(title=f'Anthropic API key ({have})')
        cl.add(self.model)
        cl.add(self.key)
        return page

    def page_tools(self) -> Adw.PreferencesPage:
        page = Adw.PreferencesPage()
        run = group(page, 'Run in the site checkout')
        for args, title, sub in [(['history'], 'Project history', 'commit timeline from GitHub'),
                                 (['sync'], 'Sync feeds', 'LiveJournal, Medium and the other [[feeds]]'),
                                 (['demos'], 'Build demos', 'demos that live in other repos'),
                                 (['claude', 'scan'], 'Claude usage', 'token totals from ~/.claude'),
                                 (['pulse', 'status'], 'Pulse status', 'probes, discovered repos and today so far')]:
            r = row(title, sub)
            r.add_suffix(button('Run', lambda a=args: self.run([sys.executable, '-m', 'sitekit', *a])))
            run.add(r)
        post = group(page, 'Post a status')
        self.post_text = Adw.EntryRow(title='What are you up to? (Markdown)')
        self.post_project = Adw.EntryRow(title='Project id (optional)')
        post.add(self.post_text)
        post.add(self.post_project)
        post_row = row('Post', 'adds it to the activity feed in the site checkout')
        post_row.add_suffix(button('Post', self.post, 'suggested-action'))
        post.add(post_row)
        push = row('Commit and push', 'data/ and media/ in the site checkout')
        push.add_suffix(button('Push', lambda: self.run(['sh', '-c', 'git add data media 2>/dev/null; git commit -qm "Update from Pulse Settings" '
                                                         '|| { echo nothing new to commit; true; }; "$0" -m sitekit push', sys.executable])))
        post.add(push)
        out = group(page, 'Output')
        self.output = Gtk.TextView(editable=False, monospace=True, wrap_mode=Gtk.WrapMode.WORD_CHAR,
                                   top_margin=8, bottom_margin=8, left_margin=10, right_margin=10)
        self.output.add_css_class('output')
        frame = Gtk.ScrolledWindow(min_content_height=220, child=self.output)
        frame.add_css_class('card')
        out.add(frame)
        return page

    def page_log(self) -> Gtk.Widget:
        bar = Gtk.Box(spacing=6, margin_start=12, margin_end=12, margin_top=12, margin_bottom=6)
        self.kinds = {}
        for k in KINDS:
            t = Gtk.ToggleButton(label=k, active=k != 'sample')
            t.add_css_class('kind')
            t.add_css_class(f'kind-{k}')
            t.connect('toggled', lambda *_: self.log_list.invalidate_filter())
            self.kinds[k] = t
            bar.append(t)
        self.search = Gtk.SearchEntry(hexpand=True, placeholder_text='Filter')
        self.search.connect('search-changed', lambda *_: self.log_list.invalidate_filter())
        bar.append(self.search)
        self.log_list = Gtk.ListBox(selection_mode=Gtk.SelectionMode.NONE)
        self.log_list.add_css_class('boxed-list')
        self.log_list.set_filter_func(self.log_visible)
        self.log_scroll = Gtk.ScrolledWindow(vexpand=True, child=Adw.Clamp(maximum_size=1100, child=self.log_list,
                                                                             margin_start=12, margin_end=12, margin_bottom=12))
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL)
        box.append(bar)
        box.append(self.log_scroll)
        return box

    # ── log ──────────────────────────────────────────────────────────────────────────────────────────────────────

    def log_visible(self, r: Gtk.ListBoxRow) -> bool:
        needle = self.search.get_text().lower()
        return self.kinds[r.kind].get_active() and (not needle or needle in r.text.lower())

    def log_add(self, entry: dict) -> None:
        kind = entry['kind'] if entry['kind'] in self.kinds else 'lifecycle'
        adj = self.log_scroll.get_vadjustment()
        at_end = adj.get_value() >= adj.get_upper() - adj.get_page_size() - 20
        line = Gtk.Box(spacing=10, margin_start=10, margin_end=10, margin_top=4, margin_bottom=4)
        stamp = Gtk.Label(label=time.strftime('%m-%d %H:%M:%S', time.localtime(entry['t'])), valign=Gtk.Align.START)
        stamp.add_css_class('logtime')
        pill = Gtk.Label(label=kind, valign=Gtk.Align.START)
        pill.add_css_class('kind')
        pill.add_css_class(f'kind-{kind}')
        text = Gtk.Label(label=entry['text'], xalign=0, wrap=True, wrap_mode=Pango.WrapMode.WORD_CHAR, selectable=True, hexpand=True)
        for w in (stamp, pill, text):
            line.append(w)
        r = Gtk.ListBoxRow(child=line, activatable=False)
        r.kind, r.text = kind, entry['text']
        self.log_list.append(r)
        while (first := self.log_list.get_row_at_index(0)) and self.log_list.get_row_at_index(2000):
            self.log_list.remove(first)
        if at_end:
            GLib.idle_add(lambda: adj.set_value(adj.get_upper()) or False)

    # ── daemon ───────────────────────────────────────────────────────────────────────────────────────────────────

    def event(self, msg: dict | None) -> None:
        if msg is None:
            self.state = {}
        elif 'entries' in msg:
            self.log_list.remove_all()
            for e in msg['entries']:
                self.log_add(e)
            return
        elif msg.get('event') == 'log':
            return self.log_add(msg)
        elif msg.get('event') == 'state' or 'mode' in msg:
            self.state = msg
        elif msg.get('ok') is False:
            return self.toast(msg.get('error', 'the daemon refused that'))
        else:
            return
        self.render()

    def render(self) -> None:
        st, s = self.state, self.status
        mode = st.get('mode', 'offline')
        self.mode_icon.set_from_icon_name(f'sitekit-pulse-{mode}')
        s['mode'].set_subtitle({'active': 'Active', 'idle': 'Idle, away from the keyboard', 'paused': 'Paused',
                                'offline': f'Publishing failed: {st.get("error")}' if st.get('error') else 'Not running'}[mode]
                               + (f' · pid {st["pid"]}' if st.get('pid') else '') + (f' · {st["version"]}' if st.get('version') else ''))
        s['today'].set_subtitle(f'{hours(st.get("minutes") or 0)} at the keyboard' if st else '—')
        now = ' · '.join(filter(None, [st.get('category'), st.get('project')]))
        s['now'].set_subtitle(f'{now or "active"} (sampled {ago(st.get("sampled"))})' if st.get('active') else
                              f'not active (sampled {ago(st.get("sampled"))})' if st else '—')
        s['pending'].set_subtitle(f'{hours(st.get("pending") or 0)} of activity' if st else '—')
        s['published'].set_subtitle(ago(st.get('published')) if st else '—')
        s['probes'].set_subtitle(f'idle: {st.get("idle_probe") or "none"} · focus: {st.get("focus_probe") or "none"} · '
                                 f'{st.get("projects", 0)} project folders · browser {"connected" if st.get("browser") else "not connected"}'
                                 if st else '—')
        self.focused.set_subtitle(f'{st["app"]} → {st.get("category") or "not active"}' if st.get('app') else 'nothing yet')
        self.quiet = True
        self.paused.set_active(bool(st.get('paused')))
        self.push.set_active(bool(st.get('push', self.cfg.get('push', True))))
        self.quiet = False
        for w in (self.paused, self.push, self.status['next'], self.status['probes']):
            w.set_sensitive(bool(st))
        self.tick()

    def tick(self) -> bool:
        st = self.state
        self.status['next'].set_subtitle(countdown(st['next_publish']) if st.get('next_publish') and not st.get('paused')
                                         else 'paused' if st.get('paused') else '—')
        return True

    # ── actions ──────────────────────────────────────────────────────────────────────────────────────────────────

    def choose_folder(self) -> None:
        def done(dialog, result):
            try:
                folder = dialog.select_folder_finish(result)
            except GLib.Error:
                return
            path = Path(folder.get_path())
            key = f'~/{path.relative_to(Path.home())}' if path.is_relative_to(Path.home()) else str(path)
            self.projects.put({'key': key, 'value': path.name}, focus=True)
        Gtk.FileDialog(title='Watch a project folder').select_folder(self, None, done)

    def values(self) -> list[tuple[str, str, object]]:
        """(table, key, value) for everything the form shows; None removes the key."""
        blank = lambda v: v if v not in ('', []) else None
        out = [('', k, int(spin.get_value())) for k, spin in self.spins.items()]
        out += [('discover', 'enabled', self.discover['enabled'].get_active()),
                ('discover', 'root', blank(self.discover['root'].get_text().strip())),
                ('discover', 'owner', blank(self.discover['owner'].get_text().strip())),
                ('discover', 'exclude', None),     # now deny rules on the path, in rules
                ('discover', 'depth', int(self.depth.get_value())), ('discover', 'every', int(self.every.get_value() * 3600)),
                ('', 'ignore', blank(string_values(self.ignore)))]
        out += [('', k, blank(e.get_text().strip())) for k, e in self.site.items()]
        out += [('discover', k, blank(e.get_text().strip())) for k, e in self.limits.items()]
        out += [('discover', 'rules', blank(self.rules.get()))]
        out += [('browser', 'titles', self.titles.get_active()), ('browser', 'filter', blank(self.filter.get())),
                ('browser', 'allow', None), ('browser', 'deny', None),      # the older form of filter
                ('browser', 'history', self.history.get_active()),
                ('browser', 'default', browsing.LEVELS[self.default.get_selected()]),
                ('browser', 'publish', blank(self.publish_rules.get())),
                ('apps', 'rules', blank(self.apps.get())), ('browser.sites', 'rules', blank(self.sites.get()))]
        # older name = "regex" entries, now in those rules
        out += [(t, k, None) for t in ('apps', 'browser.sites') for k, v in (self.lookup(t) or {}).items() if isinstance(v, str)]
        out += [('claude', k, conversations.LEVELS[w.get_selected()]) for k, w in self.claude.items()]
        out += [('claude', 'model', blank(self.model.get_text().strip()))]
        for table, m in [('projects', self.projects), ('app_ids', self.pins)]:
            new, old = pair_values(m), self.lookup(table) or {}
            out += [(table, k, None) for k in old if k not in new] + [(table, k, v) for k, v in new.items()]
        return out

    def site_values(self) -> list[tuple[str, str, object]]:
        if self.site_cfg is None:
            return []
        blank = lambda v: v if v not in ('', []) else None
        out = [('github', 'user', blank(self.github['user'].get_text().strip())),
               ('github', 'author', blank(self.github['author'].get_text().strip())),
               ('github', 'forks', self.forks.get_active()), ('', 'feeds', self.feeds.get()),
               ('github', 'ignore', string_values(self.hidden)), ('github', 'repos', string_values(self.extra_repos))]
        out += [('media', k, e.get_text().strip()) for k, e in self.media.items()]
        return out

    def lookup(self, table: str, key: str | None = None, cfg: dict | None = None):
        node = self.cfg if cfg is None else cfg
        for part in [p for p in table.split('.') if p] + ([key] if key else []):
            node = node.get(part) if isinstance(node, dict) else None
        return node

    def changes(self) -> tuple[list, list]:
        """(pulse.toml changes, site.toml changes) the form holds that aren't saved yet."""
        def changed(values, cfg):
            return [(t, k, v) for t, k, v in values
                    if v != (old := self.lookup(t, k, cfg)) and not (old is None and (v in ('', [], None) or v == DEFAULTS.get((t, k))))]
        return changed(self.values(), self.cfg), changed(self.site_values(), self.site_cfg or {})

    def updated(self, version: str) -> None:
        """The daemon came back as a newer release: reopen on it, unless that would lose edits."""
        if any(self.changes()) or self.key.get_text().strip():
            return self.toast(f'Pulse updated to {version}. Save, then reopen this window to use it')
        restart(version)

    def save(self) -> None:
        changes, site = self.changes()
        key = self.key.get_text().strip()
        if not changes and not site and not key:
            return self.toast('Nothing to save')
        try:
            for k in ('max_idle', 'max_age'):
                duration(self.limits[k].get_text().strip())
            if changes:
                tomledit.edit(self.path, changes)
            if site:
                tomledit.edit(self.site_path, site)
        except (ValueError, TypeError, OSError) as e:
            return self.toast(f'Not saved: {e}')
        if key:
            conversations.KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
            conversations.KEY_FILE.touch(mode=0o600)
            conversations.KEY_FILE.chmod(0o600)
            conversations.KEY_FILE.write_text(key + '\n')
            self.key.set_text('')
        old_site = self.site_path
        self.cfg = load_toml(self.path)
        self.site_cfg = load_toml(self.site_path) if self.site_path.exists() else None
        if expand(self.cfg.get('site', '~/.local/share/sitekit/site')) / 'site.toml' != old_site:
            page = self.stack.get_visible_child_name()     # the Site tab edits the checkout just saved
            self.build()
            self.stack.set_visible_child_name(page)
        restarting = bool(changes) and self.link.up
        if restarting:
            self.send('reload')
        n = len(changes) + len(site) + bool(key)
        self.toast(f'Saved {n} change{"s" * (n != 1)}'
                   + ('; the daemon is restarting' if restarting else '; they apply when the daemon starts' if changes else '')
                   + ('; commit site.toml from the Site tab' if site else ''))

    def post(self) -> None:
        text = self.post_text.get_text().strip()
        if not text:
            return self.toast('Write something to post first')
        project = self.post_project.get_text().strip()
        self.run([sys.executable, '-m', 'sitekit', 'status', text, *(['--project', project] if project else [])],
                 lambda ok: ok and self.post_text.set_text(''))

    def run(self, argv: list[str], then=None) -> None:
        site = expand(self.state.get('site') or self.cfg.get('site', '~/.local/share/sitekit/site'))
        buf = self.output.get_buffer()
        buf.set_text(f'$ {" ".join(argv[2:] if argv[0] == sys.executable else argv)}\n')
        launcher = Gio.SubprocessLauncher.new(Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE)
        launcher.set_cwd(str(site))
        launcher.setenv('SITEKIT_SITE', str(site), True)
        launcher.setenv('PYTHONPATH', str(Path(__file__).resolve().parent.parent), True)
        try:
            proc = launcher.spawnv(argv)
        except GLib.Error as e:
            return buf.insert(buf.get_end_iter(), f'{e.message}\n')

        def done(p, result):
            _, out, _ = p.communicate_utf8_finish(result)
            ok = p.get_successful()
            buf.insert(buf.get_end_iter(), (out or '') + ('' if ok else f'\nexited with status {p.get_exit_status()}\n'))
            if then:
                then(ok)
        proc.communicate_utf8_async(None, None, done)


class App(Adw.Application):
    def __init__(self):
        super().__init__(application_id=APP_ID, flags=Gio.ApplicationFlags.HANDLES_COMMAND_LINE)
        self.window = None

    def do_startup(self) -> None:
        Adw.Application.do_startup(self)
        css = Gtk.CssProvider()
        css.load_from_string(CSS)
        display = Gdk.Display.get_default()
        Gtk.StyleContext.add_provider_for_display(display, css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
        Gtk.IconTheme.get_for_display(display).add_search_path(str(ICONS))

    def do_command_line(self, line: Gio.ApplicationCommandLine) -> int:
        args = line.get_arguments()
        if not self.window:
            self.window = Window(self)
        self.window.show_page(args[1] if len(args) > 1 else 'pulse')
        return 0


def main(page: str = 'pulse') -> int:
    return App().run(['sitekit-settings', page])
