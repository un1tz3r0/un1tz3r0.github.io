"""Native messaging host for the sitekit pulse browser extension.

The browser starts this when the extension connects and stops it when the extension disconnects. It relays messages
between the extension (32-bit length-prefixed JSON on stdin and stdout) and the pulse daemon's control socket (JSON
lines), reconnecting whenever the daemon restarts, and tells the extension with {"event": "connected"} and
{"event": "disconnected"} so it can ask for the config again and flush what it buffered meanwhile.
"""
from __future__ import annotations

import asyncio
import json
import os
import struct
import sys
from pathlib import Path

from .common import expand
from .pulse import SOCKET

NAME = 'io.github.un1tz3r0.sitekit_pulse'
CHROME_ID = 'idmnjfajgdlaoneflcachggmmbpbohao'  # fixed by the "key" in extension/manifest.json
GECKO_ID = 'pulse@sitekit.un1tz3r0.github.io'
HOST = expand('~/.local/share/sitekit/pulse-native-host')

CHROMIUM_DIRS = ['google-chrome', 'google-chrome-beta', 'google-chrome-unstable', 'chromium', 'BraveSoftware/Brave-Browser',
                 'vivaldi', 'microsoft-edge', 'opera']
MAC_CHROMIUM_DIRS = ['Google/Chrome', 'Google/Chrome Beta', 'Chromium', 'BraveSoftware/Brave-Browser', 'Vivaldi', 'Microsoft Edge']


def send(msg: dict) -> None:
    data = json.dumps(msg).encode()
    sys.stdout.buffer.write(struct.pack('=I', len(data)) + data)
    sys.stdout.buffer.flush()


async def bridge() -> None:
    loop = asyncio.get_running_loop()
    stdin = asyncio.StreamReader(limit=1 << 26)
    await loop.connect_read_pipe(lambda: asyncio.StreamReaderProtocol(stdin), sys.stdin.buffer)
    daemon: asyncio.StreamWriter | None = None

    async def relay() -> None:
        nonlocal daemon
        while True:
            try:
                reader, writer = await asyncio.open_unix_connection(SOCKET, limit=1 << 24)
            except OSError:
                await asyncio.sleep(3)
                continue
            writer.write(b'{"cmd": "watch", "id": "watch"}\n')
            daemon = writer
            send({'event': 'connected'})
            try:
                while line := await reader.readline():
                    send(json.loads(line))
            except (OSError, ValueError):
                pass
            daemon = None
            writer.close()
            send({'event': 'disconnected'})
            await asyncio.sleep(1)

    task = asyncio.create_task(relay())
    try:
        while True:
            size, = struct.unpack('=I', await stdin.readexactly(4))
            msg = json.loads(await stdin.readexactly(size))
            if daemon:
                daemon.write((json.dumps(msg) + '\n').encode())
            else:
                send({'id': msg.get('id'), 'ok': False, 'error': 'the pulse daemon is not running'})
    except (asyncio.IncompleteReadError, BrokenPipeError):
        pass
    finally:
        task.cancel()


def manifests() -> list[tuple[Path, dict]]:
    base = {'name': NAME, 'description': 'sitekit pulse', 'path': str(HOST), 'type': 'stdio'}
    chrome = {**base, 'allowed_origins': [f'chrome-extension://{i}/' for i in
                                          [CHROME_ID, *filter(None, os.environ.get('SITEKIT_EXTENSION_IDS', '').split(','))]]}
    firefox = {**base, 'allowed_extensions': [GECKO_ID]}
    if sys.platform == 'darwin':
        support = expand('~/Library/Application Support')
        return ([(support / d / 'NativeMessagingHosts', chrome) for d in MAC_CHROMIUM_DIRS]
                + [(support / 'Mozilla' / 'NativeMessagingHosts', firefox)])
    return ([(expand('~/.config') / d / 'NativeMessagingHosts', chrome) for d in CHROMIUM_DIRS]
            + [(expand(d) / 'native-messaging-hosts', firefox) for d in ('~/.mozilla', '~/.librewolf')])


def install(uninstall: bool = False) -> list[str]:
    """Register the host with every browser profile root that exists. Extra unpacked or store extension ids can be
    allowed with SITEKIT_EXTENSION_IDS=id1,id2."""
    done = []
    for folder, manifest in manifests():
        path = folder / f'{NAME}.json'
        if uninstall:
            if path.exists():
                path.unlink()
                done.append(f'removed {path}')
        elif folder.parent.exists():
            folder.mkdir(exist_ok=True)
            path.write_text(json.dumps(manifest, indent=2) + '\n')
            done.append(f'wrote {path}')
    if uninstall:
        HOST.unlink(missing_ok=True)
    else:
        package = Path(__file__).resolve().parent.parent
        HOST.parent.mkdir(parents=True, exist_ok=True)
        HOST.write_text(f'#!/bin/sh\nPYTHONPATH="{package}${{PYTHONPATH:+:$PYTHONPATH}}" exec "{sys.executable}" -m sitekit.native\n')
        HOST.chmod(0o755)
        done.append(f'wrote {HOST}')
    return done or ['no browser profile folders found']


if __name__ == '__main__':
    asyncio.run(bridge())
