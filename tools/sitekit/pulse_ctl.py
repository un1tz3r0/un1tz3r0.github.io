"""Talk to the running pulse daemon. request() is plain sockets, for the CLI and scripts. Link keeps a watch connection on
the GLib main loop for the panel icon and the settings window, reconnects whenever the daemon restarts, and restarts its
own process when the daemon comes back as a newer release (see update.py). Installing is sitekitctl's job (manage.py).
"""
from __future__ import annotations

import json
import os
import socket
import sys
from pathlib import Path

from . import update
from .pulse import SOCKET

ICONS = Path(__file__).resolve().parent / 'data' / 'icons'
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
