"""The pulse status icon, next to the network and sound indicators.

Speaks StatusNotifierItem and dbusmenu directly over D-Bus, so it needs no AppIndicator library. GNOME shows these
through the AppIndicator extension (enabled by default on Ubuntu; elsewhere install "AppIndicator and KStatusNotifierItem
Support"); KDE and most tiling-desktop bars show them natively.
"""
from __future__ import annotations

import os
import shutil
import sqlite3
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

from gi.repository import Gio, GLib

from .pulse import CONFIG, Settings

ICONS = Path(__file__).parent / 'icons'
WATCHER = 'org.kde.StatusNotifierWatcher'
REFRESH = 30    # seconds
ITEM_PATH, MENU_PATH = '/StatusNotifierItem', '/MenuBar'
INTERFACES = Gio.DBusNodeInfo.new_for_xml('''<node>
<interface name="org.kde.StatusNotifierItem">
  <property name="Category" type="s" access="read"/><property name="Id" type="s" access="read"/>
  <property name="Title" type="s" access="read"/><property name="Status" type="s" access="read"/>
  <property name="IconName" type="s" access="read"/><property name="IconThemePath" type="s" access="read"/>
  <property name="Menu" type="o" access="read"/><property name="ItemIsMenu" type="b" access="read"/>
  <method name="Activate"><arg name="x" type="i" direction="in"/><arg name="y" type="i" direction="in"/></method>
  <method name="SecondaryActivate"><arg name="x" type="i" direction="in"/><arg name="y" type="i" direction="in"/></method>
  <method name="ContextMenu"><arg name="x" type="i" direction="in"/><arg name="y" type="i" direction="in"/></method>
  <method name="Scroll"><arg name="delta" type="i" direction="in"/><arg name="orientation" type="s" direction="in"/></method>
  <signal name="NewIcon"/><signal name="NewTitle"/>
</interface>
<interface name="com.canonical.dbusmenu">
  <property name="Version" type="u" access="read"/><property name="TextDirection" type="s" access="read"/>
  <property name="Status" type="s" access="read"/><property name="IconThemePath" type="as" access="read"/>
  <method name="GetLayout">
    <arg name="parentId" type="i" direction="in"/><arg name="recursionDepth" type="i" direction="in"/>
    <arg name="propertyNames" type="as" direction="in"/>
    <arg name="revision" type="u" direction="out"/><arg name="layout" type="(ia{sv}av)" direction="out"/>
  </method>
  <method name="GetGroupProperties">
    <arg name="ids" type="ai" direction="in"/><arg name="propertyNames" type="as" direction="in"/>
    <arg name="properties" type="a(ia{sv})" direction="out"/>
  </method>
  <method name="GetProperty">
    <arg name="id" type="i" direction="in"/><arg name="name" type="s" direction="in"/><arg name="value" type="v" direction="out"/>
  </method>
  <method name="Event">
    <arg name="id" type="i" direction="in"/><arg name="eventId" type="s" direction="in"/>
    <arg name="data" type="v" direction="in"/><arg name="timestamp" type="u" direction="in"/>
  </method>
  <method name="EventGroup">
    <arg name="events" type="a(isvu)" direction="in"/><arg name="idErrors" type="ai" direction="out"/>
  </method>
  <method name="AboutToShow"><arg name="id" type="i" direction="in"/><arg name="needUpdate" type="b" direction="out"/></method>
  <method name="AboutToShowGroup">
    <arg name="ids" type="ai" direction="in"/><arg name="updatesNeeded" type="ai" direction="out"/><arg name="idErrors" type="ai" direction="out"/>
  </method>
  <signal name="LayoutUpdated"><arg name="revision" type="u"/><arg name="parent" type="i"/></signal>
  <signal name="ItemsPropertiesUpdated"><arg name="updated" type="a(ia{sv})"/><arg name="removed" type="a(ias)"/></signal>
</interface>
</node>''')


def sitekit(*args: str) -> None:
    subprocess.Popen([shutil.which('sitekit') or 'sitekit', *args], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def daemon_running() -> bool:
    return subprocess.run(['systemctl', '--user', 'is-active', '--quiet', 'sitekit-pulse']).returncode == 0


def minutes_today(s: Settings) -> int:
    if not s.db.exists():
        return 0
    start = int(datetime.combine(date.today(), datetime.min.time()).timestamp())
    with sqlite3.connect(f'file:{s.db}?mode=ro', uri=True) as db:
        return round(db.execute('select count(*) from samples where active and ts >= ?', (start,)).fetchone()[0] * s.interval / 60)


class Tray:
    def __init__(self, config: Path, loop: GLib.MainLoop):
        self.config, self.loop, self.revision, self.items, self.signature = config, loop, 1, [], None
        self.actions = {}
        self.bus = Gio.bus_get_sync(Gio.BusType.SESSION)
        self.name = f'org.kde.StatusNotifierItem-{os.getpid()}-1'
        self.settings()
        self.rebuild()
        for path, info in ((ITEM_PATH, INTERFACES.interfaces[0]), (MENU_PATH, INTERFACES.interfaces[1])):
            self.bus.register_object(path, info, self.call, self.property, None)
        Gio.bus_own_name_on_connection(self.bus, self.name, Gio.BusNameOwnerFlags.NONE, None, None)
        Gio.bus_watch_name_on_connection(self.bus, WATCHER, Gio.BusNameWatcherFlags.NONE, self.register, None)    # again if the shell restarts
        GLib.timeout_add_seconds(REFRESH, self.refresh)

    def settings(self) -> None:
        try:
            self.s = Settings.load(self.config)
        except SystemExit:
            self.s = None

    def register(self, *_) -> None:
        self.bus.call(WATCHER, '/StatusNotifierWatcher', WATCHER, 'RegisterStatusNotifierItem', GLib.Variant('(s)', (self.name,)),
                      None, Gio.DBusCallFlags.NONE, -1, None, None)

    @property
    def paused(self) -> bool:
        return bool(self.s and self.s.paused.exists())

    @property
    def icon(self) -> str:
        return 'sitekit-pulse-paused-symbolic' if self.paused else 'sitekit-pulse-symbolic'

    def rebuild(self) -> None:
        """The menu as (label, props, action) rows; ids are their positions, starting at 1."""
        label = lambda text: (text, {'enabled': False}, None)
        line = (None, {'type': 'separator'}, None)
        if not self.s:
            rows = [label('sitekit pulse is not set up yet'), line]
        else:
            running = daemon_running()
            minutes = minutes_today(self.s)
            rows = [label(f'{minutes // 60} h {minutes % 60:02d} min at the keyboard today'),
                    label('Paused' if self.paused else 'Daemon running' if running else 'Daemon stopped'), line,
                    ('Pause tracking', {'toggle-type': 'checkmark', 'toggle-state': int(self.paused)}, self.toggle_pause),
                    ('Publish now', {}, lambda: sitekit('pulse', 'publish', '--config', str(self.config))),
                    ('Stop daemon' if running else 'Start daemon', {}, lambda: self.service('stop' if running else 'start')), line]
            owners = self.s.discover.get('owners')
            if owners:
                rows.append(('Open site', {}, lambda: Gio.AppInfo.launch_default_for_uri(f'https://{owners[0]}.github.io/#activity', None)))
        rows += [('Settings…', {}, lambda: sitekit('config', '--config', str(self.config))), line, ('Quit', {}, self.loop.quit)]
        self.items = rows
        self.actions = {i + 1: row[2] for i, row in enumerate(rows) if row[2]}

    def toggle_pause(self) -> None:
        self.s.paused.unlink() if self.paused else self.s.paused.touch()
        self.refresh()

    def service(self, verb: str) -> None:
        subprocess.Popen(['systemctl', '--user', verb, 'sitekit-pulse'])
        GLib.timeout_add_seconds(2, lambda: self.refresh() and False)

    def refresh(self) -> bool:
        self.settings()
        self.rebuild()
        signature = [(row[0], row[1]) for row in self.items]
        if signature != self.signature:
            self.signature = signature
            self.revision += 1
            self.bus.emit_signal(None, MENU_PATH, 'com.canonical.dbusmenu', 'LayoutUpdated', GLib.Variant('(ui)', (self.revision, 0)))
            self.bus.emit_signal(None, ITEM_PATH, 'org.kde.StatusNotifierItem', 'NewIcon', None)
        return True

    @staticmethod
    def props(row: tuple) -> dict:
        typed = {str: 's', int: 'i', bool: 'b'}
        out = {k: GLib.Variant(typed[type(v)], v) for k, v in row[1].items()}
        return out | ({'label': GLib.Variant('s', row[0])} if row[0] else {})

    def layout(self) -> GLib.Variant:
        kids = [GLib.Variant('(ia{sv}av)', (i + 1, self.props(row), [])) for i, row in enumerate(self.items)]
        return GLib.Variant('(u(ia{sv}av))', (self.revision, (0, {'children-display': GLib.Variant('s', 'submenu')}, kids)))

    def property(self, _bus, _sender, _path, interface, name):
        if interface == 'com.canonical.dbusmenu':
            return {'Version': GLib.Variant('u', 3), 'TextDirection': GLib.Variant('s', 'ltr'), 'Status': GLib.Variant('s', 'normal'),
                    'IconThemePath': GLib.Variant('as', [str(ICONS)])}[name]
        return {'Category': GLib.Variant('s', 'ApplicationStatus'), 'Id': GLib.Variant('s', 'sitekit-pulse'),
                'Title': GLib.Variant('s', 'sitekit pulse'), 'Status': GLib.Variant('s', 'Active'),
                'IconName': GLib.Variant('s', self.icon), 'IconThemePath': GLib.Variant('s', str(ICONS)),
                'Menu': GLib.Variant('o', MENU_PATH), 'ItemIsMenu': GLib.Variant('b', True)}[name]

    def call(self, _bus, _sender, _path, _interface, method, params, invocation):
        reply = None
        if method == 'GetLayout':
            reply = self.layout()
        elif method == 'GetGroupProperties':
            ids = params.unpack()[0] or range(1, len(self.items) + 1)
            rows = [(i, self.props(self.items[i - 1])) for i in ids if 0 < i <= len(self.items)]
            reply = GLib.Variant('(a(ia{sv}))', (rows,))
        elif method == 'AboutToShow':
            self.refresh()
            reply = GLib.Variant('(b)', (False,))
        elif method == 'AboutToShowGroup':
            self.refresh()
            reply = GLib.Variant('(aiai)', ([], []))
        elif method == 'Event':
            item, event, *_ = params.unpack()
            if event == 'clicked' and item in self.actions:
                self.actions[item]()
        elif method == 'EventGroup':
            for item, event, *_ in params.unpack()[0]:
                if event == 'clicked' and item in self.actions:
                    self.actions[item]()
            reply = GLib.Variant('(ai)', ([],))
        elif method == 'GetProperty':
            reply = GLib.Variant('(v)', (GLib.Variant('s', ''),))
        invocation.return_value(reply)


def main(args: list[str]) -> None:
    loop = GLib.MainLoop()
    tray = Tray(CONFIG, loop)   # noqa: F841 - owns the D-Bus objects for the life of the loop
    loop.run()


if __name__ == '__main__':
    main(sys.argv[1:])
