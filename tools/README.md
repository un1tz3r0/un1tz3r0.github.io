# sitekit

The data side of the site. The page itself (`index.html`) is static and reads JSON from `data/`; sitekit writes that
JSON. It needs Python 3.11+ and git; pip or pipx installs the rest. `browserprofile`, which imports browser history, comes
from GitHub and only installs on Python 3.13+, so pulse skips that import on older versions.

```sh
pipx install --editable ./tools      # or: uv pip install -e ./tools
sitekit -h
```

Run it anywhere inside the site checkout (it finds `site.toml`), or pass `--site PATH`.

## Settings app

```sh
sitekit config             # GTK 4 and libadwaita; run from the site checkout, or set SITEKIT_SITE
sitekit config --wizard    # the walkthrough again
```

Every section of `site.toml` and `pulse.toml` is a tab with an explanation of what it does. The first run steps through
them in order, and the help button in the header starts that again. Nothing is written until you save, and comments in
files you've edited by hand are kept. *Review* shows exactly what would be published and can start everything with your
session. The app uses the system Python's GTK bindings (Debian and Ubuntu: `python3-gi`, `gir1.2-adw-1`), so it works
from a pipx install too.

## What lives where

| File | Written by | What it is |
| --- | --- | --- |
| `data/projects.json` | you | Projects, groups and how they relate. Repos you don't list still show up, under *Other repos* or *Forks*. |
| `data/demos.json` | you | The demos shelf; entries with a `build` table are built by `sitekit demos`. |
| `data/site.json` | you | Name, tagline, about text and links. |
| `data/gallery.json` | `sitekit gallery` | Gallery pieces, newest first; previews in `gallery/`. |
| `data/github.json` | `sitekit history` | Commits per day for every repo with your commits. |
| `data/feed/YYYY-MM.json` | everything else | The activity log, one month per file, one entry per line. |
| `data/pulse/YYYY-MM.json` | `sitekit pulse` | Daily aggregates from your computer: keyboard time, Claude usage, browsing. |

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
sitekit config           # or copy tools/sitekit/pulse.example.toml to ~/.config/sitekit/pulse.toml and edit it
sitekit pulse status     # which idle and focus probes work on this desktop, and today's public record so far
sitekit pulse publish    # publish now instead of waiting for the hour
sitekit pulse pause      # record nothing new until `sitekit pulse resume`; the tray icon does this too
```

Idle time comes from GNOME (Mutter), `xprintidle` on X11, or logind. The focused app comes from Hyprland, Sway, KDE
(`kdotool`), X11 (`xprop`) or, on GNOME Wayland, the *Focused Window D-Bus* shell extension. Without an idle probe a
minute counts as active when files changed or the focused app switched. File watching uses inotify directly; if you
watch big trees, raise `fs.inotify.max_user_watches`.

To run it with your desktop session, use *Review › Start with your session* in the settings app, or from the site
checkout:

```sh
sitekit pulse install-service        # the daemon and tray as user services, plus a launcher entry for the settings app
journalctl --user -fu sitekit-pulse  # follow it
```

The service needs your session's `DISPLAY`/`WAYLAND_DISPLAY` and `SSH_AUTH_SOCK` (GNOME and KDE pass them on; elsewhere run
`systemctl --user import-environment` from your session startup) so the probes work and `git push` can authenticate.

### Tray icon

`sitekit tray` puts a status icon beside the network and sound indicators, with today's keyboard time, *Pause tracking*,
*Publish now*, start and stop for the daemon, and the settings app. It speaks StatusNotifierItem over D-Bus, so it needs
no extra libraries. KDE and most tiling-desktop bars show these natively. GNOME needs the *AppIndicator and
KStatusNotifierItem Support* extension, which Ubuntu enables by default.

### Finding projects

Instead of listing every folder under `[projects]`, set `[discover]`: pulse scans `roots` for git repos and adds each one
that pushes to a public GitHub repo owned by one of `owners`. `sitekit pulse discover` shows what it finds and why
anything was left out. Rules decide the rest, first match first:

```toml
[discover]
enabled = true
roots = ["~/prj"]
owners = ["un1tz3r0"]
max_idle = "6m"     # skip repos with no commit or edit for this long
max_age = "2y"      # skip repos created longer ago than this

[[discover.rules]]
action = "deny"     # leave it out
when = "file"       # dir, no-dir, file, no-file, remote, no-remote, name or path
value = ".pulse-ignore"

[[discover.rules]]
action = "allow"    # exempt it from max_idle and max_age
when = "remote"
value = "*un1tz3r0/vcvopxyz*"
```

An `allow` rule can't make a private repo public or someone else's repo yours; list those under `[projects]` if you want
them, and their names will be published. A project's id comes from `data/projects.json` if the repo is listed there,
otherwise from the repo name. Folders with no git repo are never found; list them under `[projects]`.

### Claude usage

Pulse reads Claude Code's transcripts in `~/.claude` and picks claude.ai conversations out of the browser log, then
groups them by project. `[claude]` sets how much of each is published:

| Level | Published |
| --- | --- |
| `off` | Nothing; the source isn't read. |
| `counts` | Conversations, prompts, minutes and tokens, per listed project and overall. |
| `titles` | Also each conversation's title. |
| `summaries` | Also a one-sentence summary written by Claude. |

Claude Code sessions outside your listed projects are only ever added to a total. claude.ai conversations have no
folder, so a title or summary is published whichever project it belongs to, if any: raise that level with care. Check
`sitekit pulse status` first. Anything that looks like a key, an email address or a home-folder path is removed from
titles and summaries.

Summaries need credentials: `~/.config/sitekit/anthropic.key`, which the settings app writes, `ANTHROPIC_API_KEY`, or
`ant auth login`. They are written with `claude-opus-5-5` unless you set
`[claude].model`, and declined requests retry on Anthropic's recommended fallback model. Each conversation is summarised
once a day and only again if it changes. Your prompts are sent to the Claude API; for claude.ai conversations, that's the
opening text of the page. If a summary fails, its title is published alone.

### Browsing

`tools/sitekit/extension` is a small Chrome extension that reports navigation, tab switches, open tabs, page titles and
short page descriptions to a local program over native messaging. No port is opened and nothing is sent over the network.
It doesn't run in incognito windows. To install it:

```sh
sitekit pulse install-browser    # registers the local program with Chrome, Chromium, Brave, Vivaldi and Edge
```

then open `chrome://extensions`, turn on *Developer mode*, choose *Load unpacked* and pick `tools/sitekit/extension`.
Snap builds of Chromium can't run native-messaging hosts; use the deb build of Chrome. Firefox isn't supported.

Pulse also imports browser history each hour through `browserprofile`, which covers time the extension wasn't running
and finds claude.ai conversations without it.

Each page ends up in one of four states, by the first rule that matches:

| Action | What happens |
| --- | --- |
| `drop` | Never stored. |
| `private` | Stored locally, never published. The default for pages no rule matches. |
| `domain` | Also publishes the domain's minutes and visits. |
| `page` | Also publishes the page's title and URL. |

```toml
[web]
default = "private"

[[web.rules]]
action = "drop"
when = "domain"     # domain (and subdomains), url or title; url and title may use * and ?
value = "mybank.example"

[[web.rules]]
action = "domain"
when = "domain"
value = "github.com"

[web.projects]
"https://docs.example.com/*" = "my-project"
```

Time on `github.com/owner/repo` of a listed project counts toward that project unless a rule says `private` or `drop`,
and so does any URL pattern under `[web.projects]`. Query strings and fragments are removed before anything is stored,
because they often hold tokens; set `keep_query` to keep query strings. Rules run again when publishing, so tightening
one applies to everything not yet published.

`sitekit pulse log --days 7` shows your private log: minutes per domain, published or not, and your open tabs. It lives in
the local database, which only your account can read. It isn't encrypted beyond that, so full-disk encryption is what
protects it from someone with the disk. Pausing stops the daemon and the browser log, but transcripts Claude Code writes
meanwhile are still read.

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
