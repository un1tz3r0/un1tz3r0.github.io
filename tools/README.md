# sitekit

The data side of the site. The page itself (`index.html`) is static and reads JSON from `data/`; sitekit writes that
JSON. It needs Python 3.11+, git, and two dependencies (`aiohttp`, `yarl`).

The panel icon and settings window use GTK 4 and libadwaita through PyGObject, which come from the system rather than
pip. On Debian or Ubuntu, install them first:

```sh
sudo apt install git pipx python3-venv python3-gi python3-cairo \
    gir1.2-glib-2.0 gir1.2-girepository-3.0 gir1.2-gtk-4.0 gir1.2-adw-1 gir1.2-pango-1.0 \
    libgtk-4-1 libadwaita-1-0
```

(Releases older than Ubuntu 25.04 or Debian 13 call it `gir1.2-girepository-2.0`.) Then install sitekit into a venv
that can see those system packages. Without `--system-site-packages` the venv can't import `gi`, and `sitekit
settings` and `sitekit pulse indicator` fail:

```sh
pipx install --system-site-packages --editable ./tools
# or a plain venv:
python3 -m venv --system-site-packages ~/.local/share/sitekit/venv
~/.local/share/sitekit/venv/bin/pip install -e ./tools
ln -s ~/.local/share/sitekit/venv/bin/sitekit ~/.local/bin/sitekit
sitekit -h
```

If sitekit is already installed in a venv without them, `pipx reinstall --system-site-packages sitekit` fixes it
(or recreate the plain venv with the flag). The daily workflow and the commands that only write `data/` need none of this.

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
window titles, file names and anything outside the listed folders never do, unless you opt in to publishing chosen
sites and pages (`[browser] publish`, below) or Claude conversation titles (`[claude]`, below). The local database is
readable only by you.

Its config is `~/.config/sitekit/pulse.toml`. The first time the daemon, `sitekit pulse install` or `sitekit settings`
runs without one, it creates the folder and copies `tools/pulse.example.toml` there. Edit it in the settings window or
by hand.

```sh
sitekit settings         # or edit ~/.config/sitekit/pulse.toml
sitekit pulse status     # which idle and focus probes work on this desktop, and today's totals so far
sitekit pulse publish    # publish now instead of waiting for the hour
```

Listing every folder gets old, so `[discover]` in the config makes the daemon scan `root` (default `~`, optionally
limited by `depth`) at startup and daily for git repos whose remote is on `github.com/<owner>`, and watch them under the
repo's name. A repo only appears in the published data if the site lists it as public; private ones are tracked
locally and never named. `sitekit pulse status` shows what the scan finds, what it left out and why, and what would be
held back.

`max_idle` and `max_age` (`"90d"`, `"6m"`, `"1y"`) skip repos untouched for that long (newest commit or uncommitted
edit) or created that long ago (first commit). `rules` decide first, in order: `deny` leaves a repo out, `allow` exempts it
from both limits. Each matches `when` one of `dir`, `no-dir`, `file`, `no-file` (globs inside the repo), `remote`,
`no-remote` (globs on remote URLs), `name` (the folder name) or `path` (the full path) against `value`:

```toml
[discover]
max_idle = "6m"
rules = [{ action = "deny", when = "name", value = "scratch*" },
         { action = "allow", when = "file", value = "pinned.txt" }]
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

### Rule lists

The filters and pattern maps in `pulse.toml` (`[discover] rules`, `[apps] rules`, `[browser] filter`, `publish` and
`[browser.sites] rules`) are ordered lists of rules, written the same way:

```toml
filter = [
  { match = "*.bank.*", action = "deny", priority = "!" },   # action: allow (default) or deny
  { match = "*.example.com" },
  { match = "*", action = "deny", priority = "?" },          # priority: "!" tried first, "?" last, none in between
]
```

Rules are tried by priority, then in list order. In a filter the first matching rule decides. In a map (rules with
`to`, or `level` for publish rules), the first matching allow rule gives its key, except a key that an earlier matching
deny rule ruled out, so a later rule can give another: `{ match = "insiders", to = "code", action = "deny" }` stops
insider builds counting as *code* without ignoring them. A deny rule with no key stops at once. Older configs keep
working: `allow` and `deny` lists, `[discover] exclude`, and `name = "regex"` entries in `[apps]` and
`[browser.sites]` are read as the rules they mean, and the settings window writes them in the new form when you save.

### Panel icon and settings window (GNOME and others)

```sh
sitekit pulse install      # systemd unit, launcher, panel-icon autostart and icons, all under ~ (`uninstall` reverses it)
sitekit pulse indicator    # the panel icon, run by hand
sitekit settings [page]    # the settings window; page is pulse, site, projects, apps, publishing, tools or log
sitekit pulse pause        # or resume: ask the running daemon from a script or keybinding
```

The panel icon shows whether pulse is **active**, **idle** (away from the keyboard), **paused**, or **offline** (the
daemon isn't running or the last publish failed). Its menu has pause (for a while or until resumed), the push toggle,
publish and rescan, the sample interval, and two assignments: the focused app to a category or *ignore* (written to
`[app_ids]`; ignored apps never count as active), and the folder you last changed files in to a project or *ignore*
(written to `[projects]`, or as a deny rule on its path in `[discover] rules`). *Pulse Settings…* and *Activity Log…* open the settings window. It speaks StatusNotifierItem directly, so it
needs no extra packages on GNOME with the AppIndicator extension (on by default in Ubuntu; elsewhere install
`gnome-shell-extension-appindicator` and enable it) or on KDE and other panels that show tray icons.

The settings window (libadwaita, from the system packages in [the install steps](#sitekit), so a venv needs `--system-site-packages`) shows
live state with a countdown to the next publish and edits `pulse.toml` in place, keeping your comments and writing the
previous file to `pulse.toml.bak`. Changes apply when you press *Save and Apply*, which restarts the daemon; pause and
push take effect at once. The *Site* page edits `site.toml` in the site checkout the same way, and commits and pushes
just that file. Lists are edited a line at a time: + in a list's header adds one, and each line's … menu edits, moves
(where order matters) or removes it; in rule lists the +/− button sets allow or deny and the next one the priority
(·, `!` or `?`; see [Rule lists](#rule-lists)). The *Tools* page runs the other sitekit commands in the site checkout, posts quick statuses
and commits and pushes `data/`. The first time it opens, and from the tour button in the header, *Back* and *Next* walk
through Site, Projects, Apps, Publishing and Pulse, where *Install* runs `sitekit pulse install`. The *Log* page follows the daemon's log, with a toggle per kind of line (lifecycle,
samples, activity, scans, publishing, warnings, errors) and a filter. GNOME Settings itself has no plug-in API for third-party panels, so this is
a separate app with a Settings-category launcher rather than a page inside it.

The daemon is controlled over a socket at `$XDG_RUNTIME_DIR/sitekit-pulse.sock` (newline-delimited JSON; commands
`status`, `watch`, `pause`, `resume`, `publish`, `rescan`, `set` (push, interval, idle, window, publish; saved to the
config without a restart), `assign`, `log`, `reload`, `quit`, and for the browser extension
`config`, `focus`, `pages`, `catalog`), which only your user can reach. A request's `id` is echoed in its reply. The
daemon restarts itself when `pulse.toml` changes.

### Updates: signed releases that install themselves

A managed install follows releases of this repo: every running daemon picks up a new feature or fix on its own, with
the panel icon, settings window, browser host and extension following it.

```sh
# once, where you make releases: sign tags with your SSH key
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub

# once per machine: trust that key, then install (needs at least one release; writes pulse.toml if there isn't one)
sitekit pulse trust ~/.ssh/id_ed25519.pub
sitekit pulse install --managed

# each release: merge to master, then from your checkout
sitekit release 1.4.0 -m "what changed"    # signed tag pulse-v1.4.0 on HEAD, which must be on origin/master
```

`install --managed` keeps everything under `~/.local/share/sitekit`: a bare clone, a venv (with system site packages,
for GTK), and each release checked out side by side in `versions/` (just `tools/`), with `current` pointing at the one
that runs. The systemd unit, launchers, panel icon and browser host all run through `current`.

Every `[update] every` seconds (an hour by default) the daemon lists the remote's `pulse-v*` tags. A newer one is only
installed when it is an annotated tag signed by a key in `~/.config/sitekit/allowed_signers` and points at a commit on
master; anything else is refused, whoever pushed it. That matters because Claude sessions and the Copilot agent can push
to this repo too. Signing is the only thing trusted, and the key file is only ever written by hand on each machine.
A tag that passes is checked out, its dependencies installed into the venv if `pyproject.toml` changed, and its own
`sitekit pulse check` run against your config and database. Only then does `current` switch and the daemon restart in
place. The panel icon and settings window restart themselves when they see the new version (the settings window waits
while it has unsaved edits), and the extension reloads, which also restarts the browser host. For the extension to load
the new files, load it unpacked from `~/.local/share/sitekit/current/tools/sitekit/extension`.

If the new release crashes three times before it confirms that it started, `pulse-launch` (the unit's command, which
updates never change) switches back to the previous release. A tag that isn't trusted, fails its check or doesn't
start is recorded in `~/.local/share/sitekit/bad` and never tried again; a checkout or `pip install` that fails (usually
the network) is retried at the next check.

```sh
sitekit pulse update      # look for a release now instead of waiting
sitekit pulse rollback    # go back to the previous release, and never use this one again
```

Set `[update] enabled = false` to stay on the current release. A pause now survives restarts, including updates.
Releases should only ever add to the database (new tables and columns, which `open_db` creates), so rolling back stays
safe.

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
category, project and activity. Private windows, non-http pages and hosts the `filter` denies are never recorded. Published:
minutes per site category, and per project the minutes by activity, only for projects that the site already names or
that a plugin marks as yours and public.

Nothing about individual sites is published unless you add `publish` rules. Each sets matching pages (a glob on the
hostname, or on host + path when it contains a `/`; the first match wins, else `default`, which is `private`) to
`domain`, publishing the domain's minutes and pages visited per day, or `page`, publishing each page's URL and title
too. Publish rules and the `filter` are applied at publish time, so tightening one covers what is already stored. With
`history = true`, the browsers' own history (through `browserprofile`, Python 3.13+, from `pip install "./tools[pulse]"`)
fills in pages visited on days the extension saw nothing; the `filter` applies to it too.

```toml
[browser]
publish = [{ match = "github.com", level = "page" }, { match = "*.wikipedia.org", level = "domain" }]
history = true
```

Plugins live in `extension/plugins/` (the interface is documented in `index.js`) and ship with the extension, since MV3
can't load code from elsewhere. Simple cases need no code: `[[browser.rules]]` map URLs to projects.

- **GitHub**: your repos count toward the project of the same name (so browser and editor time add up), with activity
  `review`, `issues`, `code`, `ci` and so on. Other people's repos are kept local. Syncs your public repo list daily.
- **CodePen**: pens are `pen:<slug>` projects, `editing` in the editor and `viewing` elsewhere. Syncs your public pens
  from your profile feed (`user` defaults to the owner), so they can be named on the site via `data/pulse/catalog.json`.
- **Claude**: Claude Code projects (`claude-code:chan_…`, named from the page title) and claude.ai projects and chats
  (`claude:<uuid>`, synced from the web app's own API, which is undocumented and may change). Names only reach
  `data/claude.json` for Claude projects already listed there.

## Claude

`sitekit history` also notices Claude's work. Commits a Claude session made carry a `Claude-Session:` trailer (or a
Claude co-author), and PRs opened from a Claude project thread carry an attribution marker and the project's link. In
repos owned by `[claude].owners`, Claude's commits count on your timeline (you reviewed and merged them) and are marked
per day in `data/github.json`. Sessions, commits and PRs are grouped by Claude project in `data/claude.json`; give a
project a name and a site project under `[claude.projects.<chan_id>]` in `site.toml`. PR lists need the GitHub API, so
set `GITHUB_TOKEN` (the daily workflow does).

```sh
sitekit claude scan          # fold ~/.claude/projects into a local cache, publish data/claude-usage/<machine>.json
sitekit claude report        # everything, cost included, per repo and per Claude project; --days 7 for the last week
```

Claude Code deletes transcripts after a month, so the scan keeps per-session totals in
`~/.local/share/sitekit/claude-sessions.json`. What's published is per day: sessions and tokens (input, output, cache
reads and writes, per model), split by public repo; cost only if `[claude].publish` lists `"cost"`. Each machine writes
its own file (`SITEKIT_MACHINE` overrides the host name). The pulse daemon runs the scan with every publish. Costs are the
API list-price equivalent, which on a subscription is notional.

### Conversations in the daily record

Separately, `[claude]` in `pulse.toml` puts conversations into `data/pulse/`, and the activity feed shows them under
each day. `code` (Claude Code sessions, from the transcripts) and `web` (claude.ai conversations, from the browser
extension) each take a level, and both are `off` until you set them:

| level | published |
|---|---|
| `counts` | conversations, prompts, minutes and tokens, in total and per publishable project |
| `titles` | also each conversation's title |
| `summaries` | also one sentence on what was worked on, written by the Claude API |

A Claude Code session is named only when its folder belongs to a publishable project; otherwise it is just counted. A
claude.ai conversation has no folder, so its title follows the level alone. Titles and summaries are scrubbed of keys,
email addresses and home paths. Summaries send your prompts (for claude.ai, the opening of the page, which the extension
only reads at this level) to `model` (default `claude-opus-5-5`), only for conversations that would be published, and
are cached per conversation per day. They need `pip install "./tools[pulse]"` and a key: the settings window saves one
to `~/.config/sitekit/anthropic.key`, or set `ANTHROPIC_API_KEY`, or run `ant auth login`.

```toml
[claude]
code = "titles"
web = "counts"
```

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
