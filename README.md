# [_un1tz3r0_.github.io](https://un1tz3r0.github.io)

My corner of the web: what I build, when I built it, and things you can play with right in the browser.

- **[Projects](https://un1tz3r0.github.io/#projects)**: every project on one timeline, drawn from the commit history of
  each repo, with curves showing which projects use, follow on from or grew out of which.
- **[Activity](https://un1tz3r0.github.io/#activity)**: a running log of posts, status updates, links, commits and
  imported journal entries, with a heatmap of keyboard time reported by a small daemon on my computer.
- **[Demos](https://un1tz3r0.github.io/#demos)**: the riso separation lab, the windchime simulator,
  [paisl](https://un1tz3r0.github.io/paisl/index.html), [squid](https://un1tz3r0.github.io/squid/index.html) and
  [x-fade](https://un1tz3r0.github.io/audio/index.html).

## How it's put together

`index.html` is the whole site: one file of HTML, CSS and JavaScript, built from web components with no framework and
no build step. It reads its content from JSON in `data/`:

- `data/projects.json`, `data/demos.json` and `data/site.json` are written by hand.
- `data/github.json` and `data/feed/` are kept fresh by `tools/` (a small Python package, `sitekit`) and a daily
  GitHub Actions run (`.github/workflows/refresh.yml`) that re-reads commit history and rebuilds the demos that live
  in their own repos.
- `data/pulse/` is published by `sitekit pulse`, the activity daemon, from my machine.

See [tools/README.md](tools/README.md) for posting, importing from Twitter and LiveJournal, and running the daemon.

To preview locally, serve the folder with anything static (`python3 -m http.server`, or `localserver.py` for HTTPS)
and open `index.html`.
