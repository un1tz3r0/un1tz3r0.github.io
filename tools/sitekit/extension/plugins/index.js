// Plugins recognise pages of one site and say which project and kind of activity they belong to.
//
//   id, name      identify the plugin; [browser.plugins.<id>] in pulse.toml configures it ("enabled = false" turns it off)
//   hosts         hostnames it handles (subdomains included); list them under host_permissions in manifest.json too
//   extract       optional arrow function, run inside the page, returning plain JSON; it can't use anything from its module
//   classify({url, title, data}, ctx) → {project?: {id, type, name?, url?, public?}, activity?, site?, meta?} | null
//   sync(ctx)     optional, returns the projects it can list, e.g. your public pens: [{id, type, name, url, public, meta}]
//   every         seconds between syncs (default a day)
//
// ctx is {config, json(url), text(url)}: config is [browser.plugins.<id>] plus the daemon's `owner`, and json/text fetch
// with your cookies for the plugin's hosts. Project ids are "<type>:<id>", except your own GitHub repos, which use the
// bare repo name so browser time and file changes count toward the same project. Only projects with public: true (or
// that the site already lists) are named in what gets published; public: null or absent leaves a known value alone.
import github from './github.js';
import claude from './claude.js';
import codepen from './codepen.js';

export default [github, claude, codepen];
