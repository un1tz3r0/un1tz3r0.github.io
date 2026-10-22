# sitekit

The data side of the site. The page itself (`index.html`) is static and reads JSON from `data/`; sitekit writes that
JSON. It needs Python 3.11+, git, and two dependencies (`aiohttp`, `yarl`).

```sh
pipx install --editable ./tools      # or: pip install --user -e ./tools
sitekit -h
```

Run it anywhere inside the site checkout (it finds `site.toml`), or pass `--site PATH`.

## What lives where

| File | Written by | What it is |
| --- | --- | --- |
| `data/projects.json` | you | Projects, groups and how they relate. Repos you don't list still show up, under *Other repos* or *Forks*. |
| `data/demos.json` | you | The demos shelf; entries with a `build` table are built by `sitekit demos`. |
| `data/site.json` | you | Name, tagline, about text and links. |
| `data/github.json` | `sitekit history` | Commits per day for every repo with your commits. |
| `data/feed/YYYY-MM.json` | everything else | The activity log, one month per file, one entry per line. |
| `data/pulse/YYYY-MM.json` | `sitekit pulse` | Daily keyboard-time aggregates from your computer. |

## Project history

```sh
sitekit history                       # all your repos via the GitHub API, plus [github].repos in site.toml
sitekit history --repo ~/src/thing    # also count a local checkout (counted on the timeline, never named in the feed)
```

Each repo is mirrored once as a bare, commit-only partial clone under `~/.cache/sitekit/git`, then fetched
incrementally. Commits count when the author matches `[github].author` in `site.toml`. Set `GITHUB_TOKEN` to avoid
the API's anonymous rate limit. The daily workflow in `.github/workflows/refresh.yml` runs this for you.

## Writing to the activity log

```sh
sitekit post "Title" post.md --tag music --project windchime
sitekit status "Rewired the **clapper** physics" --project windchime
sitekit link https://example.com/article "Why this matters"   # fetches the page title, summary and image
sitekit media ~/Pictures/print.jpg "First riso pass" --project riso   # copies into media/YYYY/MM/
sitekit rm status:1a2b3c4d5e6f
```

Text is Markdown. `--time 2026-10-21T20:00:00-07:00` backdates an entry. Every command prints the entry id, and
running the same command again updates the entry rather than duplicating it. Commit and push `data/` and `media/`
when you're done.

## Importing old posts

```sh
sitekit import twitter ~/Downloads/twitter-archive.zip --media    # your tweets and threads; --replies, --retweets to include those
sitekit import lj ~/lj-export/*.xml --user myjournal --utc-offset -8
sitekit import feed https://myjournal.livejournal.com/data/atom --source livejournal --kind lj
sitekit import feed https://mastodon.social/@me.rss --source mastodon
```

Feeds listed as `[[feeds]]` tables in `site.toml` (your LiveJournal and Medium are there already) are pulled in one go
with `sitekit sync`, which the daily workflow runs. A feed entry whose link an imported entry already has is skipped,
so the richer copy from an export wins.

The Twitter archive comes from *Settings › Your account › Download an archive*. LiveJournal exports come from
`livejournal.com/export.bml` (XML, one file per month) or from ljdump. Only public journal entries are imported.
Imports are idempotent, so re-running one after a fresh export only adds what's new.

## Keyboard time: the pulse daemon

`sitekit pulse run` samples once a minute whether you're at the keyboard, which category of app has focus, and which
of your listed project folders are changing. Raw samples stay in a local SQLite file; once an hour it publishes daily
totals to `data/pulse/` and pushes. What leaves the machine is: active minutes per hour of the day, minutes per app
category, and, for the folders you list only, minutes, number of files changed and their extensions. App names,
window titles, file names and anything outside the listed folders never do.

```sh
mkdir -p ~/.config/sitekit && cp tools/pulse.example.toml ~/.config/sitekit/pulse.toml   # then edit it
sitekit pulse status     # which idle and focus probes work on this desktop, and today's totals so far
sitekit pulse publish    # publish now instead of waiting for the hour
```

Idle time comes from GNOME (Mutter), `xprintidle` on X11, or logind. The focused app comes from Hyprland, Sway, KDE
(`kdotool`), X11 (`xprop`) or, on GNOME Wayland, the *Focused Window D-Bus* shell extension. Without an idle probe a
minute counts as active when files changed or the focused app switched. File watching uses inotify directly; if you
watch big trees, raise `fs.inotify.max_user_watches`.

To run it with your desktop session, save this as `~/.config/systemd/user/sitekit-pulse.service`:

```ini
[Unit]
Description=sitekit pulse
After=graphical-session.target
PartOf=graphical-session.target

[Service]
ExecStart=%h/.local/bin/sitekit pulse run
Restart=on-failure
RestartSec=30

[Install]
WantedBy=graphical-session.target
```

then `systemctl --user enable --now sitekit-pulse` and follow it with `journalctl --user -fu sitekit-pulse`. The
service needs your session's `DISPLAY`/`WAYLAND_DISPLAY` and `SSH_AUTH_SOCK` (GNOME and KDE pass them on; elsewhere run
`systemctl --user import-environment` from your session startup) so the probes work and `git push` can authenticate.

## Demos from other repos

A demo in `data/demos.json` with a `build` table is cloned, built and copied into `demos/<id>/` by `sitekit demos`
(or `sitekit demos windchime` for one). The daily workflow runs it too, so pushing to the demo's repo updates the site
within a day.
