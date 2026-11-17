"""Talk to the running pulse daemon, and install pulse for this user: systemd unit, launchers, panel-icon autostart, icons.

request() is plain sockets, for the CLI and scripts. Link keeps a watch connection on the GLib main loop for the panel
icon and the settings window, reconnects whenever the daemon restarts, and restarts its own process when the daemon
comes back as a newer release (see update.py).

A managed install (`sitekit pulse install --managed`) points everything at ~/.local/share/sitekit/current, so it follows
updates; otherwise at the Python and package that ran the install.
"""
from __future__ import annotations

import json
import os
import shutil
import socket
import subprocess
import sys
from pathlib import Path

from . import update
from .common import expand
from .pulse import SOCKET

ICONS = Path(__file__).resolve().parent / 'data' / 'icons'
UNIT = expand('~/.config/systemd/user/sitekit-pulse.service')
APPS = expand('~/.local/share/applications')
AUTOSTART = expand('~/.config/autostart')
ICON_HOME = expand('~/.local/share/icons')
APP_ID = 'io.github.un1tz3r0.SitekitPulse'


def request(cmd: str, timeout: float = 3, **args) -> dict | None:
    """One command to the daemon; its reply, or None when no daemon is running."""
    try:
        with socket.socket(socket.AF_UNIX) as sock:
            sock.settimeout(timeout)
            sock.connect(str(SOCKET))
            sock.sendall((json.dumps({'cmd': cmd, **args}) + '\n').encode())
            with sock.makefile() as f:
                return json.loads(f.readline() or 'null')
    except (OSError, ValueError):
        return None


class Link:
    """A watch connection to the daemon on the GLib main loop. on_event gets every message the daemon sends (state
    events, log lines, replies), and None whenever the connection drops; it reconnects every few seconds."""

    def __init__(self, on_event, on_update=None):
        from gi.repository import Gio, GLib
        self.Gio, self.GLib, self.on_event = Gio, GLib, on_event
        self.on_update, self.updating = on_update or restart, False
        self.conn = self.out = None
        self.connect()

    @property
    def up(self) -> bool:
        return self.conn is not None

    def connect(self) -> bool:
        self.Gio.SocketClient().connect_async(self.Gio.UnixSocketAddress.new(str(SOCKET)), None, self.connected)
        return False

    def connected(self, client, result) -> None:
        try:
            self.conn = client.connect_finish(result)
        except self.GLib.Error:
            return self.retry()
        self.out = self.conn.get_output_stream()
        self.inp = self.Gio.DataInputStream.new(self.conn.get_input_stream())
        self.send('watch')
        self.send('log', limit=500)
        self.read()

    def send(self, cmd: str, **args) -> bool:
        if not self.conn:
            return False
        try:
            self.out.write_all((json.dumps({'cmd': cmd, **args}) + '\n').encode(), None)
            return True
        except self.GLib.Error:
            return False

    def read(self) -> None:
        self.inp.read_line_async(self.GLib.PRIORITY_DEFAULT, None, self.line)

    def line(self, stream, result) -> None:
        try:
            text, _ = stream.read_line_finish_utf8(result)
        except self.GLib.Error:
            text = None
        if text is None:
            self.conn = None
            self.on_event(None)
            return self.retry()
        try:
            msg = json.loads(text)
        except ValueError:
            msg = None
        if isinstance(msg, dict):
            version = msg.get('version')
            if version and update.RUNNING and version != update.RUNNING and not self.updating:
                self.updating = True
                self.on_update(version)
            self.on_event(msg)
        self.read()

    def retry(self) -> None:
        self.GLib.timeout_add_seconds(3, self.connect)


def restart(version: str) -> None:
    """Start this program again from the same command, which now loads the new release through `current`."""
    os.execv(sys.executable, sys.orig_argv)


def managed() -> update.Layout | None:
    """The managed install's layout when this code runs from one of its releases."""
    return update.Layout.default() if update.RUNNING else None


def runtime(layout: update.Layout | None = None) -> tuple[Path, Path]:
    """(python, package folder) that launchers run: through `current` for a managed install, never a resolved release."""
    if layout:
        return layout.python, layout.package
    return Path(sys.executable), Path(__file__).resolve().parent.parent


def command(*args: str, layout: update.Layout | None = None) -> str:
    """How a launcher runs `sitekit <args>`."""
    python, package = runtime(layout)
    return f'env PYTHONPATH={package} {python} -m sitekit {" ".join(args)}'


def desktop(name: str, comment: str, args: str, categories: str, extra: str = '', layout: update.Layout | None = None) -> str:
    return (f'[Desktop Entry]\nType=Application\nName={name}\nComment={comment}\nExec={command(args, layout=layout)}\n'
            f'Icon=sitekit-pulse\nTerminal=false\nCategories={categories}\nStartupWMClass={APP_ID}\n{extra}')


def files(layout: update.Layout | None = None) -> dict[Path, str]:
    python, package = runtime(layout)
    # A managed install starts through pulse-launch, which can roll back a release that doesn't start.
    start = f'ExecStart={layout.launch}\n' if layout else f'Environment=PYTHONPATH={package}\nExecStart={python} -m sitekit pulse run\n'
    entry = lambda *a, **k: desktop(*a, **k, layout=layout)
    return {
        UNIT: ('[Unit]\nDescription=sitekit pulse\nAfter=graphical-session.target\nPartOf=graphical-session.target\n\n'
               f'[Service]\n{start}'
               'Restart=on-failure\nRestartSec=30\n\n[Install]\nWantedBy=graphical-session.target\n'),
        APPS / 'sitekit-pulse-settings.desktop': entry('Pulse Settings', 'Settings and log for the sitekit pulse daemon',
                                                         'settings', 'Settings;Utility;GTK;', 'Keywords=sitekit;pulse;activity;\n'),
        APPS / 'sitekit-pulse-indicator.desktop': entry('Pulse Indicator', 'Panel icon for the sitekit pulse daemon',
                                                          'pulse indicator', 'Utility;', 'NoDisplay=true\n'),
        AUTOSTART / 'sitekit-pulse-indicator.desktop': entry('Pulse Indicator', 'Panel icon for the sitekit pulse daemon',
                                                               'pulse indicator', 'Utility;', 'X-GNOME-Autostart-enabled=true\nNoDisplay=true\n'),
    }


def systemctl(*args: str) -> str | None:
    if not shutil.which('systemctl'):
        return None
    r = subprocess.run(['systemctl', '--user', *args], capture_output=True, text=True)
    return None if r.returncode else ' '.join(args)


def install(uninstall: bool = False, layout: update.Layout | None = None) -> list[str]:
    layout = layout or managed()
    done = []
    icons = [(p, ICON_HOME / p.relative_to(ICONS)) for p in ICONS.rglob('*.svg')]
    if uninstall:
        if systemctl('disable', '--now', 'sitekit-pulse'):
            done.append('stopped and disabled sitekit-pulse.service')
        for path in [*files(layout), *(dst for _, dst in icons)]:
            if path.exists():
                path.unlink()
                done.append(f'removed {path}')
        systemctl('daemon-reload')
        return done or ['nothing to remove']
    for path, text in files(layout).items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        done.append(f'wrote {path}')
    for src, dst in icons:
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
    done.append(f'installed {len(icons)} icons under {ICON_HOME / "hicolor"}')
    if shutil.which('gtk-update-icon-cache'):
        subprocess.run(['gtk-update-icon-cache', '-q', '-t', str(ICON_HOME / 'hicolor')], check=False)
    if systemctl('daemon-reload') and systemctl('enable', '--now', 'sitekit-pulse'):
        done.append('enabled and started sitekit-pulse.service (journalctl --user -fu sitekit-pulse)')
    else:
        done.append('start the daemon with: systemctl --user enable --now sitekit-pulse')
    if not os.environ.get('DISPLAY') and not os.environ.get('WAYLAND_DISPLAY'):
        done.append('no desktop session here; the panel icon starts at your next login')
    else:
        subprocess.Popen(command('pulse', 'indicator', layout=layout).split(), start_new_session=True,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        done.append('started the panel icon')
    return done
