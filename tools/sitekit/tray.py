"""The pulse panel icon: a StatusNotifierItem with a com.canonical.dbusmenu menu, spoken over D-Bus with Gio alone.

Works wherever a StatusNotifierWatcher runs: GNOME with the AppIndicator extension, KDE, and most other panels. The
icon shows the daemon's mode; the menu pauses and resumes, toggles pushing, publishes, rescans, sets the sample
interval, pins the focused app to a category or ignores it, assigns the folder you are editing to a project or ignores
it, and opens the settings window.
"""
from __future__ import annotations

import json
import os
import subprocess
import time

import gi

gi.require_version('Gio', '2.0')
from gi.repository import Gio, GLib  # noqa: E402

from .pulse_ctl import ICONS, Link, command  # noqa: E402

BUS_NAME = 'io.github.un1tz3r0.SitekitPulse.Indicator'
ITEM, MENU = '/StatusNotifierItem', '/MenuBar'
INTERVALS = [(15, '15 s'), (30, '30 s'), (60, '1 min'), (120, '2 min'), (300, '5 min')]
PAUSES = [(15, '15 minutes'), (30, '30 minutes'), (60, '1 hour'), (180, '3 hours'), (0, 'Until resumed')]

XML = '''<node>
<interface name="org.kde.StatusNotifierItem">
  <property name="Category" type="s" access="read"/><property name="Id" type="s" access="read"/>
  <property name="Title" type="s" access="read"/><property name="Status" type="s" access="read"/>
  <property name="WindowId" type="i" access="read"/><property name="IconName" type="s" access="read"/>
  <property name="IconThemePath" type="s" access="read"/><property name="OverlayIconName" type="s" access="read"/>
  <property name="AttentionIconName" type="s" access="read"/><property name="ToolTip" type="(sa(iiay)ss)" access="read"/>
  <property name="ItemIsMenu" type="b" access="read"/><property name="Menu" type="o" access="read"/>
  <method name="ContextMenu"><arg name="x" type="i" direction="in"/><arg name="y" type="i" direction="in"/></method>
  <method name="Activate"><arg name="x" type="i" direction="in"/><arg name="y" type="i" direction="in"/></method>
  <method name="SecondaryActivate"><arg name="x" type="i" direction="in"/><arg name="y" type="i" direction="in"/></method>
  <method name="Scroll"><arg name="delta" type="i" direction="in"/><arg name="orientation" type="s" direction="in"/></method>
  <signal name="NewTitle"/><signal name="NewIcon"/><signal name="NewToolTip"/>
  <signal name="NewStatus"><arg name="status" type="s"/></signal>
</interface>
<interface name="com.canonical.dbusmenu">
  <property name="Version" type="u" access="read"/><property name="TextDirection" type="s" access="read"/>
  <property name="Status" type="s" access="read"/><property name="IconThemePath" type="as" access="read"/>
  <method name="GetLayout"><arg type="i" name="parentId" direction="in"/><arg type="i" name="recursionDepth" direction="in"/>
    <arg type="as" name="propertyNames" direction="in"/><arg type="u" name="revision" direction="out"/>
    <arg type="(ia{sv}av)" name="layout" direction="out"/></method>
  <method name="GetGroupProperties"><arg type="ai" name="ids" direction="in"/><arg type="as" name="propertyNames" direction="in"/>
    <arg type="a(ia{sv})" name="properties" direction="out"/></method>
  <method name="GetProperty"><arg type="i" name="id" direction="in"/><arg type="s" name="name" direction="in"/>
    <arg type="v" name="value" direction="out"/></method>
  <method name="Event"><arg type="i" name="id" direction="in"/><arg type="s" name="eventId" direction="in"/>
    <arg type="v" name="data" direction="in"/><arg type="u" name="timestamp" direction="in"/></method>
  <method name="EventGroup"><arg type="a(isvu)" name="events" direction="in"/><arg type="ai" name="idErrors" direction="out"/></method>
  <method name="AboutToShow"><arg type="i" name="id" direction="in"/><arg type="b" name="needUpdate" direction="out"/></method>
  <method name="AboutToShowGroup"><arg type="ai" name="ids" direction="in"/><arg type="ai" name="updatesNeeded" direction="out"/>
    <arg type="ai" name="idErrors" direction="out"/></method>
  <signal name="ItemsPropertiesUpdated"><arg type="a(ia{sv})" name="updatedProps"/><arg type="a(ias)" name="removedProps"/></signal>
  <signal name="LayoutUpdated"><arg type="u" name="revision"/><arg type="i" name="parent"/></signal>
  <signal name="ItemActivationRequested"><arg type="i" name="id"/><arg type="u" name="timestamp"/></signal>
</interface>
</node>'''


def item(label: str = '', action=None, children: list | None = None, toggle: str | None = None, checked: bool = False,
         enabled: bool = True) -> dict:
    return {'label': label, 'action': action, 'children': children, 'toggle': toggle, 'checked': checked, 'enabled': enabled}


SEPARATOR = {'separator': True}


def hours(minutes: int) -> str:
    return f'{minutes // 60} h {minutes % 60:02d} min' if minutes >= 60 else f'{minutes} min'


def ago(t: float | None) -> str:
    if not t:
        return 'never'
    s = time.time() - t
    return 'just now' if s < 90 else f'{round(s / 60)} min ago' if s < 5400 else f'{round(s / 3600)} h ago'


class Indicator:
    def __init__(self, bus: Gio.DBusConnection):
        self.bus, self.state, self.revision, self.items, self.layout_key = bus, None, 1, {}, None
        node = Gio.DBusNodeInfo.new_for_xml(XML)
        bus.register_object(ITEM, node.interfaces[0], self.item_call, self.item_prop, None)
        bus.register_object(MENU, node.interfaces[1], self.menu_call, self.menu_prop, None)
        self.layout = self.build()
        self.link = Link(self.event)
        Gio.bus_watch_name_on_connection(bus, 'org.kde.StatusNotifierWatcher', Gio.BusNameWatcherFlags.NONE, self.register, None)

    # ── state ────────────────────────────────────────────────────────────────────────────────────────────────────

    @property
    def mode(self) -> str:
        return (self.state or {}).get('mode', 'offline')

    def event(self, msg: dict | None) -> None:
        if msg is None:
            self.state = None
        elif msg.get('event') == 'state' or 'mode' in msg:
            self.state = msg
        else:
            return
        icon = self.icon
        self.layout = self.build()
        key = json.dumps(self.layout, default=str)
        if key != self.layout_key:
            self.layout_key, self.revision = key, self.revision + 1
            self.emit(MENU, 'com.canonical.dbusmenu', 'LayoutUpdated', GLib.Variant('(ui)', (self.revision, 0)))
        if icon != getattr(self, 'shown_icon', None):
            self.shown_icon = icon
            self.emit(ITEM, 'org.kde.StatusNotifierItem', 'NewIcon')
            self.emit(ITEM, 'org.kde.StatusNotifierItem', 'NewToolTip')

    @property
    def icon(self) -> str:
        return f'sitekit-pulse-{self.mode}'

    def summary(self) -> str:
        st = self.state
        if not st:
            return 'Pulse is not running'
        now = ' · '.join(filter(None, [st.get('category'), st.get('project')]))
        head = {'active': f'Active{f": {now}" if now else ""}', 'idle': 'Idle', 'offline': 'Publishing failed',
                'paused': 'Paused' + (f' until {time.strftime("%H:%M", time.localtime(st["paused_until"]))}' if st.get('paused_until') else '')}
        return f'{head[self.mode]} · {hours(st.get("minutes") or 0)} today'

    # ── menu ─────────────────────────────────────────────────────────────────────────────────────────────────────

    def send(self, cmd: str, **args):
        return lambda: self.link.send(cmd, **args)

    def build(self) -> list[dict]:
        st = self.state
        menu = [item(self.summary(), enabled=False)]
        if st and st.get('error'):
            menu.append(item(st['error'][:80], enabled=False))
        if st:
            menu.append(item(f'Published {ago(st.get("published"))} · next in {max(0, round((st["next_publish"] - time.time()) / 60))} min',
                             enabled=False))
            menu.append(SEPARATOR)
            menu.append(item('Resume', self.send('resume')) if st['paused'] else
                        item('Pause', children=[item(label, self.send('pause', minutes=m)) for m, label in PAUSES]))
            menu.append(item('Push to GitHub', self.send('set', push=not st['push']), toggle='checkmark', checked=st['push']))
            menu.append(item('Publish now', self.send('publish')))
            menu.append(item('Rescan projects', self.send('rescan')))
            menu.append(item('Sample every', children=[item(label, self.send('set', interval=s), toggle='radio',
                                                            checked=st['interval'] == s) for s, label in INTERVALS]))
            menu.append(SEPARATOR)
            if app := st.get('app'):
                cats = [*st.get('categories', []), 'other']
                menu.append(item(f'App “{app[:40]}”', children=[
                    item(c, self.send('assign', what='app', app=app, category=c), toggle='radio', checked=st.get('category') == c)
                    for c in cats] + [SEPARATOR, item("Ignore this app", self.send('assign', what='app', app=app, category='ignore'))]))
            if root := st.get('root'):
                ids = sorted({*st.get('project_ids', []), *([st['root_project']] if st.get('root_project') else [])})
                menu.append(item(f'Folder “{os.path.basename(root)}”', children=[
                    item(p, self.send('assign', what='folder', path=root, project=p), toggle='radio', checked=st.get('root_project') == p)
                    for p in ids[:30]] + [SEPARATOR, item('Ignore this folder', self.send('assign', what='folder', path=root, project='ignore'))]))
            if app or root:
                menu.append(SEPARATOR)
        menu.append(item('Pulse Settings…', lambda: self.open('pulse')))
        menu.append(item('Activity Log…', lambda: self.open('log')))
        menu.append(item('Quit Indicator', lambda: loop.quit()))
        return menu

    def open(self, page: str) -> None:
        subprocess.Popen([*command('settings', page).split()], start_new_session=True)

    @staticmethod
    def props(entry: dict | None) -> dict[str, GLib.Variant]:
        if not entry:
            return {}
        if entry.get('separator'):
            return {'type': GLib.Variant('s', 'separator')}
        props = {'label': GLib.Variant('s', entry['label'].replace('_', '__')), 'enabled': GLib.Variant('b', entry['enabled'])}
        if entry.get('toggle'):
            props |= {'toggle-type': GLib.Variant('s', entry['toggle']), 'toggle-state': GLib.Variant('i', int(entry['checked']))}
        if entry.get('children') is not None:
            props['children-display'] = GLib.Variant('s', 'submenu')
        return props

    def node(self, ident: int, entry: dict, depth: int) -> GLib.Variant:
        """Menu ids are positional (a child of n is n * 100 + its index + 1), so they stay stable across rebuilds."""
        self.items[ident] = entry
        children = [GLib.Variant('v', self.node(ident * 100 + i + 1, child, depth - 1))
                    for i, child in enumerate(entry.get('children') or [])] if depth != 0 else []
        return GLib.Variant('(ia{sv}av)', (ident, self.props(entry), children))

    def index(self) -> None:
        self.items = {}
        self.node(0, {'label': '', 'enabled': True, 'children': self.layout}, -1)

    def find(self, ident: int, depth: int) -> GLib.Variant:
        self.index()
        return self.node(ident, self.items.get(ident) or self.items[0], depth)

    # ── D-Bus plumbing ───────────────────────────────────────────────────────────────────────────────────────────

    def register(self, bus, name, owner) -> None:
        bus.call('org.kde.StatusNotifierWatcher', '/StatusNotifierWatcher', 'org.kde.StatusNotifierWatcher',
                 'RegisterStatusNotifierItem', GLib.Variant('(s)', (bus.get_unique_name(),)), None,
                 Gio.DBusCallFlags.NONE, -1, None, None)

    def emit(self, path: str, iface: str, signal: str, args: GLib.Variant | None = None) -> None:
        self.bus.emit_signal(None, path, iface, signal, args)

    def item_prop(self, bus, sender, path, iface, name):
        tooltip = ('', [], 'sitekit pulse', self.summary())
        return {
            'Category': GLib.Variant('s', 'ApplicationStatus'), 'Id': GLib.Variant('s', 'sitekit-pulse'),
            'Title': GLib.Variant('s', 'sitekit pulse'), 'Status': GLib.Variant('s', 'Active'),
            'WindowId': GLib.Variant('i', 0), 'IconName': GLib.Variant('s', self.icon),
            'IconThemePath': GLib.Variant('s', str(ICONS)), 'OverlayIconName': GLib.Variant('s', ''),
            'AttentionIconName': GLib.Variant('s', ''), 'ToolTip': GLib.Variant('(sa(iiay)ss)', tooltip),
            'ItemIsMenu': GLib.Variant('b', True), 'Menu': GLib.Variant('o', MENU),
        }.get(name)

    def item_call(self, bus, sender, path, iface, method, args, invocation) -> None:
        if method in ('Activate', 'SecondaryActivate'):
            self.open('pulse')
        invocation.return_value(None)

    def menu_prop(self, bus, sender, path, iface, name):
        return {'Version': GLib.Variant('u', 3), 'TextDirection': GLib.Variant('s', 'ltr'),
                'Status': GLib.Variant('s', 'normal'), 'IconThemePath': GLib.Variant('as', [str(ICONS)])}.get(name)

    def menu_call(self, bus, sender, path, iface, method, args, invocation) -> None:
        a = args.unpack()
        match method:
            case 'GetLayout':
                invocation.return_value(GLib.Variant.new_tuple(GLib.Variant('u', self.revision), self.find(a[0], a[1])))
            case 'GetGroupProperties':
                self.index()
                out = [(i, self.props(self.items.get(i))) for i in (a[0] or list(self.items))]
                invocation.return_value(GLib.Variant('(a(ia{sv}))', (out,)))
            case 'GetProperty':
                self.index()
                invocation.return_value(GLib.Variant('(v)', (self.props(self.items.get(a[0])).get(a[1], GLib.Variant('s', '')),)))
            case 'Event':
                self.clicked(a[0], a[1])
                invocation.return_value(None)
            case 'EventGroup':
                for ident, event, *_ in a[0]:
                    self.clicked(ident, event)
                invocation.return_value(GLib.Variant('(ai)', ([],)))
            case 'AboutToShow':
                invocation.return_value(GLib.Variant('(b)', (False,)))
            case 'AboutToShowGroup':
                invocation.return_value(GLib.Variant('(aiai)', ([], [])))
            case _:
                invocation.return_dbus_error('org.freedesktop.DBus.Error.UnknownMethod', method)

    def clicked(self, ident: int, event: str) -> None:
        if event != 'clicked':
            return
        self.index()
        if (entry := self.items.get(ident)) and entry.get('action'):
            entry['action']()


loop: GLib.MainLoop


def main() -> int:
    global loop
    loop = GLib.MainLoop()
    bus = Gio.bus_get_sync(Gio.BusType.SESSION)
    state = {}

    def acquired(*_):
        state['indicator'] = Indicator(bus)

    def lost(*_):
        if 'indicator' not in state:
            print('pulse: the panel icon is already running')
        loop.quit()

    Gio.bus_own_name_on_connection(bus, BUS_NAME, Gio.BusNameOwnerFlags.DO_NOT_QUEUE, acquired, lost)
    GLib.unix_signal_add(GLib.PRIORITY_DEFAULT, 15, lambda: (loop.quit(), False)[1])
    GLib.unix_signal_add(GLib.PRIORITY_DEFAULT, 2, lambda: (loop.quit(), False)[1])
    loop.run()
    return 0
