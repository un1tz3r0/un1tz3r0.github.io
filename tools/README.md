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
| `data/gallery.json` | `sitekit gallery` | Gallery pieces, newest first; previews in `gallery/`. |
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

Listing every folder gets old, so `[discover]` in the config makes the daemon scan `root` (default `~`, optionally
limited by `depth`) at startup and daily for git repos whose remote is on `github.com/<owner>`, and watch them under the
repo's name. A repo only appears in the published data if the site lists it as public; private ones are tracked
locally and never named. `sitekit pulse status` shows what the scan finds and what would be held back.

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

### Panel icon and settings window (GNOME and others)

```sh
sitekit pulse install      # systemd unit, launcher, panel-icon autostart and icons, all under ~ (`uninstall` reverses it)
sitekit pulse indicator    # the panel icon, run by hand
sitekit settings [page]    # the settings window; page is pulse, projects, apps, publishing or tools
sitekit pulse pause        # or resume: ask the running daemon from a script or keybinding
```

The panel icon shows whether pulse is **active**, **idle** (away from the keyboard), **paused**, or **offline** (the
daemon isn't running or the last publish failed), and its menu has the pause and push toggles, publish and rescan, and
*Pulse Settings…*, which opens the settings window on the Pulse page. It speaks StatusNotifierItem directly, so it
needs no extra packages on GNOME with the AppIndicator extension (on by default in Ubuntu; elsewhere install
`gnome-shell-extension-appindicator` and enable it) or on KDE and other panels that show tray icons.

The settings window (libadwaita: `python3-gi` and `gir1.2-adw-1`) shows live state and edits `pulse.toml` in place,
keeping your comments and writing the previous file to `pulse.toml.bak`. Changes apply when you press *Save and Apply*,
which restarts the daemon; the push switch takes effect at once. The *Tools* page runs the other sitekit commands in
the site checkout and posts quick statuses. GNOME Settings itself has no plug-in API for third-party panels, so this is
a separate app with a Settings-category launcher rather than a page inside it.

The daemon is controlled over a socket at `$XDG_RUNTIME_DIR/sitekit-pulse.sock` (newline-delimited JSON; commands
`status`, `watch`, `pause`, `resume`, `publish`, `rescan`, `set`, `reload`, `quit`, and for the browser extension
`config`, `focus`, `pages`, `catalog`), which only your user can reach. A request's `id` is echoed in its reply. The
daemon restarts itself when `pulse.toml` changes.

### Browser extension

`tools/sitekit/extension/` is a Manifest V3 extension (Chrome first; the manifest also loads in Firefox 128+). It
follows the active tab of the focused window while you aren't idle, records one span per page, and sends it to the
daemon through a native messaging host, buffering while the daemon is down. While a browser window has focus, the
page's project beats file changes for that minute, and its site category (from `[browser.sites]`) is published
alongside the app categories.

```sh
sitekit pulse browser      # register the native messaging host for Chrome, Chromium, Brave, Vivaldi, Edge and Firefox
```

Then load it: *chrome://extensions › Developer mode › Load unpacked*, and pick `tools/sitekit/extension`. Its `key`
pins the id to `idmnjfajgdlaoneflcachggmmbpbohao`, which the host allows; to allow other ids (a store build), set
`SITEKIT_EXTENSION_IDS=id1,id2` when you run `sitekit pulse browser`. The toolbar icon shows the same four states as
the panel icon, and its popup shows what the current page counts toward, the daemon controls, and each plugin's sync.

Locally the daemon keeps each span's URL without query or fragment, its title (`titles = false` drops them), site
category, project and activity. Private windows, non-http pages and `deny`ed hosts are never recorded. Published:
minutes per site category, and per project the minutes by activity, only for projects that the site already names or
that a plugin marks as yours and public.

Plugins live in `extension/plugins/` (the interface is documented in `index.js`) and ship with the extension, since MV3
can't load code from elsewhere. Simple cases need no code: `[[browser.rules]]` map URLs to projects.

- **GitHub**: your repos count toward the project of the same name (so browser and editor time add up), with activity
  `review`, `issues`, `code`, `ci` and so on. Other people's repos are kept local. Syncs your public repo list daily.
- **CodePen**: pens are `pen:<slug>` projects, `editing` in the editor and `viewing` elsewhere. Syncs your public pens
  from your profile feed (`user` defaults to the owner), so they can be named on the site via `data/pulse/catalog.json`.
- **Claude**: Claude Code projects (`claude-code:chan_…`, named from the page title) and claude.ai projects and chats
  (`claude:<uuid>`, synced from the web app's own API, which is undocumented and may change). Names only reach
  `data/claude.json` for Claude projects already listed there.

## The gallery

```sh
sitekit gallery add ~/art/*.gif                  # animated GIFs become silent video loops, single frames become WebP
sitekit gallery add clip.mp4 --title "Night run" # a video with sound keeps it and gets player controls
sitekit gallery add https://youtu.be/VIDEO_ID    # a YouTube video, embedded only when someone opens it
sitekit gallery rm animout-11                    # by id, with its preview files
```

Each piece gets a small preview in `gallery/` (loops up to 640 px tall, about 0.5 MB each) and a row in
`data/gallery.json`. The same file added twice is skipped. Ids come from file names, and a batch is listed highest
number first.

## Hosting media

Previews live in the repo, so the site works with nothing else. Full-size files go to a bucket. Any
[rclone](https://rclone.org/) remote works: Cloudflare R2, Google Cloud Storage, Backblaze B2, Bunny, S3. Set it up
once with `rclone config`, then fill in `[media]` in `site.toml`:

```toml
[media]
base = "https://media.example.net/"   # the bucket's public URL
masters = "~/Media/site"              # full-size files are written here
remote = "r2:un1tz3r0-media"          # the rclone remote they're mirrored to
backup = "/mnt/ssd/site-media"        # where `sitekit backup` keeps its copy
```

```sh
git archive 3b18d7f gallery | tar -x -C /tmp     # the original GIFs, from before they were converted
sitekit gallery add /tmp/gallery/*.gif --refresh # write full-size masters for pieces already in the gallery
sitekit mirror                                   # make the bucket match masters/, then point the site at base
sitekit backup                                   # copy the bucket to backup/current; old versions go to backup/history/<time>
```

Once `base` is set and `sitekit mirror` has run, the gallery's viewer shows the full-size file while the wall keeps
using the previews. To run the backup daily, save these two files and run
`systemctl --user enable --now sitekit-backup.timer`:

```ini
# ~/.config/systemd/user/sitekit-backup.service
[Unit]
Description=sitekit: back up the media bucket to the SSD
ConditionPathIsMountPoint=/mnt/ssd

[Service]
Type=oneshot
ExecStart=%h/.local/bin/sitekit --site %h/src/un1tz3r0.github.io backup
```

```ini
# ~/.config/systemd/user/sitekit-backup.timer
[Unit]
Description=Daily sitekit backup

[Timer]
OnCalendar=daily
Persistent=true
RandomizedDelaySec=30m

[Install]
WantedBy=timers.target
```

## Demos from other repos

A demo in `data/demos.json` with a `build` table is cloned, built and copied into `demos/<id>/` by `sitekit demos`
(or `sitekit demos windchime` for one). The daily workflow runs it too, so pushing to the demo's repo updates the site
within a day.
