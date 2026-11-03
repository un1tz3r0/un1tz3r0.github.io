// Tracks the active tab of the focused window while you're not idle, as spans of one page each, classifies each page
// with the plugins and the config's rules, and reports to the pulse daemon through the native messaging host.
import plugins from './plugins/index.js';

const api = globalThis.browser ?? globalThis.chrome;
const HOST = 'io.github.un1tz3r0.sitekit_pulse';
const DEFAULTS = { idle: 180, interval: 60, owner: null, titles: true, allow: [], deny: [], sites: {}, rules: [], plugins: {} };
const QUEUE_MAX = 5000, MIN_SPAN = 2, MAX_SPAN = 600, BROWSER = /Firefox\//.test(navigator.userAgent) ? 'firefox' : 'chrome';

const local = { config: DEFAULTS, queue: [], synced: {} };   // mirrored to storage.local
const live = { span: null, idle: 'active', window: null };    // mirrored to storage.session, survives worker restarts
let port = null, daemon = null, error = null, nextId = 1;
const pending = new Map(), extracted = new Map(), announced = new Set();

const save = (area, obj, keys) => api.storage[area].set(Object.fromEntries(keys.map(k => [k, obj[k]])));
const now = () => Date.now() / 1000;

// ── daemon link ──────────────────────────────────────────────────────────────────────────────────────────────────

function connect() {
  if (port) return;
  try {
    port = api.runtime.connectNative(HOST);
  } catch (e) {
    return void (error = e.message);
  }
  port.onMessage.addListener(onDaemon);
  port.onDisconnect.addListener(() => {
    error = api.runtime.lastError?.message ?? port?.error?.message ?? 'native host exited';
    port = daemon = null;
    for (const [, { reject }] of pending) reject(new Error(error));
    pending.clear();
    paint();
  });
}

function request(msg, timeout = 10000) {
  if (!port || !daemon) return Promise.reject(new Error(error ?? 'not connected to the pulse daemon'));
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => (pending.delete(id), reject(new Error('the pulse daemon did not answer'))), timeout);
    pending.set(id, { resolve: v => (clearTimeout(timer), resolve(v)), reject: e => (clearTimeout(timer), reject(e)) });
    port.postMessage({ ...msg, id });
  });
}

async function onDaemon(msg) {
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    return msg.ok === false ? reject(new Error(msg.error)) : resolve(msg);
  }
  switch (msg.event ?? (msg.id === 'watch' && 'state')) {
    case 'connected':
      daemon = {}, error = null;
      await applyConfig((await request({ cmd: 'config' })).config);
      await flush();
      syncDue(true);
      return report();
    case 'disconnected':
      daemon = null, error = 'the pulse daemon is not running';
      return paint();
    case 'config':
      return applyConfig(msg.config);
    case 'state':
      daemon = msg;
      return paint();
  }
}

async function applyConfig(config) {
  local.config = { ...DEFAULTS, ...config };
  await save('local', local, ['config']);
  api.idle.setDetectionInterval(Math.max(15, Math.round(local.config.idle)));
  extracted.clear();
  refresh();
}

async function flush() {
  if (!daemon || !local.queue.length) return;
  const spans = local.queue.slice(0, 500);
  try {
    await request({ cmd: 'pages', spans });
    local.queue.splice(0, spans.length);
    await save('local', local, ['queue']);
    if (local.queue.length) await flush();
  } catch { /* stays queued until the next connect or tick */ }
}

// The daemon uses this every sample: while a browser window has focus, the page's project beats file changes.
function report() {
  const s = live.span;
  if (daemon) request({ cmd: 'focus', focused: live.window != null, idle: live.idle, browser: BROWSER,
    page: s && { site: s.site, project: s.project, activity: s.activity } }).catch(() => {});
  paint();
}

// ── spans ────────────────────────────────────────────────────────────────────────────────────────────────────────

const glob = g => new RegExp(`^${g.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`, 'i');
const listed = (list, url) => list.some(g => glob(g).test(g.includes('/') ? url.host + url.pathname : url.hostname));

function allowed(tab) {
  if (!tab || tab.incognito || !/^https?:/.test(tab.url ?? '')) return null;
  const url = new URL(tab.url), { allow, deny } = local.config;
  return (allow.length && !listed(allow, url)) || listed(deny, url) ? null : url;
}

async function extract(tab, plugin) {
  const key = `${tab.id} ${plugin.id}`, seen = extracted.get(key);
  if (seen?.url === tab.url && seen.title === tab.title) return seen.data;
  let data = null;
  try {
    [{ result: data }] = await api.scripting.executeScript({ target: { tabId: tab.id }, func: plugin.extract });
  } catch { /* page not scriptable (yet) */ }
  if (tab.status === 'complete') extracted.set(key, { url: tab.url, title: tab.title, data });
  return data;
}

function byRule(url) {
  const where = url.host + url.pathname;
  for (const r of local.config.rules) {
    const m = where.match(new RegExp(r.match, 'i'));
    if (m) return { project: r.project?.replace(/\$(\d)/g, (_, n) => m[n] ?? '') ?? null, activity: r.activity ?? null };
  }
  return null;
}

async function classify(tab, url) {
  const site = Object.entries(local.config.sites).find(([, rx]) => new RegExp(rx, 'i').test(url.hostname))?.[0] ?? null;
  const rule = byRule(url);
  if (rule) return { site, ...rule, meta: null };
  for (const p of plugins) {
    if (!enabled(p) || !p.hosts.some(h => url.hostname === h || url.hostname.endsWith(`.${h}`))) continue;
    const data = p.extract ? await extract(tab, p) : null;
    const r = await p.classify({ url, title: tab.title, data }, context(p)).catch(() => null);
    if (!r) continue;
    if (r.project?.name && !announced.has(r.project.id + r.project.name))
      catalog([r.project]).then(() => announced.add(r.project.id + r.project.name), () => {});
    return { site: site ?? r.site ?? null, project: r.project?.id ?? null, activity: r.activity ?? null, meta: r.meta ?? null };
  }
  return { site, project: null, activity: null, meta: null };
}

function close(at = now()) {
  const s = live.span;
  live.span = null;
  if (!s || at - s.start < MIN_SPAN || daemon?.paused) return;
  local.queue.push({ ...s, end: at, title: local.config.titles ? s.title : null });
  local.queue.splice(0, Math.max(0, local.queue.length - QUEUE_MAX));
  save('local', local, ['queue']);
  flush();
}

let timer = null, chain = Promise.resolve();
const refresh = () => (clearTimeout(timer), timer = setTimeout(() => chain = chain.then(update, update), 250));

async function update() {
  const tab = live.idle === 'active' && live.window != null
    ? (await api.tabs.query({ active: true, windowId: live.window }))[0] : null;
  const url = allowed(tab);
  const page = url && { tab: tab.id, url: url.origin + url.pathname, title: tab.title ?? null, ...(await classify(tab, url)) };
  const s = live.span, t = now();
  const same = s && page && ['tab', 'url', 'project', 'activity'].every(k => s[k] === page[k]);
  if (same && t - s.start < MAX_SPAN) {
    s.title = page.title, s.meta = page.meta ?? s.meta;
  } else {
    close(t);
    live.span = page ? { start: t, ...page } : null;
  }
  await save('session', live, ['span', 'idle', 'window']);
  report();
}

// ── plugins ──────────────────────────────────────────────────────────────────────────────────────────────────────

const enabled = p => local.config.plugins[p.id]?.enabled !== false;
const catalog = projects => request({ cmd: 'catalog', projects });

// Plugins fetch with your cookies for their own hosts. If the background request is refused (some sites check where a
// request comes from), it is repeated inside an open tab of that site.
function context(plugin) {
  const config = { owner: local.config.owner, ...(local.config.plugins[plugin.id] ?? {}) };
  async function inTab(url, as) {
    const [tab] = await api.tabs.query({ url: plugin.hosts.map(h => `https://${h}/*`) });
    if (!tab) throw new Error(`no open ${plugin.hosts[0]} tab to fetch ${url} from`);
    const [{ result }] = await api.scripting.executeScript({ target: { tabId: tab.id }, args: [url, as],
      func: async (u, as) => { const r = await fetch(u, { credentials: 'same-origin' }); return r.ok ? r[as]() : null; } });
    if (result == null) throw new Error(`${url} failed`);
    return result;
  }
  async function get(url, as) {
    try {
      const r = await fetch(url, { credentials: 'include' });
      if (r.ok) return await r[as]();
    } catch { /* fall through */ }
    return inTab(String(url), as);
  }
  return { config, json: url => get(url, 'json'), text: url => get(url, 'text') };
}

async function sync(p) {
  const projects = await p.sync(context(p));
  if (projects?.length) await catalog(projects);
  local.synced[p.id] = { at: now(), count: projects?.length ?? 0, error: null };
}

async function syncDue(force = false) {
  if (!daemon) return;
  for (const p of plugins.filter(p => p.sync && enabled(p))) {
    const last = local.synced[p.id];
    const wait = last?.error ? (force ? 0 : 3600) : force ? 3600 : p.every ?? 86400;
    if (last && now() - last.at < wait) continue;
    await sync(p).catch(e => (local.synced[p.id] = { ...last, at: now(), error: e.message }));
  }
  await save('local', local, ['synced']);
}

// ── toolbar icon: the site's pulse glyph, coloured by what the daemon is doing ────────────────────────────────────

const COLORS = { active: '#2e7d32', idle: '#78909c', paused: '#ef8f00', offline: '#c62828' };
const mode = () => !daemon ? 'offline' : daemon.paused ? 'paused' : live.span ? 'active' : 'idle';

function paint() {
  const m = mode(), images = {};
  for (const size of [16, 32]) {
    const c = new OffscreenCanvas(size, size), g = c.getContext('2d');
    g.scale(size / 24, size / 24);
    g.lineWidth = 2.6, g.lineCap = g.lineJoin = 'round', g.strokeStyle = COLORS[m];
    g.stroke(new Path2D('M2.5 12h4l2.2-5.5 4.3 11 2.3-5.5h6.2'));
    images[size] = g.getImageData(0, 0, size, size);
  }
  api.action.setIcon({ imageData: images }).catch(() => {});
  api.action.setTitle({ title: `sitekit pulse: ${m}${error && m === 'offline' ? ` (${error})` : ''}` });
}

// ── popup ────────────────────────────────────────────────────────────────────────────────────────────────────────

const status = () => ({ mode: mode(), error, daemon, span: live.span, queued: local.queue.length, config: local.config,
  plugins: plugins.map(p => ({ id: p.id, name: p.name, sync: !!p.sync, enabled: enabled(p), synced: local.synced[p.id] ?? null })) });

api.runtime.onMessage.addListener((msg, sender, reply) => {
  const act = {
    status: async () => status(),
    pause: () => request({ cmd: 'pause', minutes: msg.minutes ?? 0 }),
    resume: () => request({ cmd: 'resume' }),
    publish: () => request({ cmd: 'publish' }),
    sync: () => sync(plugins.find(p => p.id === msg.plugin)).then(() => save('local', local, ['synced'])),
    reconnect: async () => connect(),
  }[msg.type];
  if (!act) return false;
  act().then(r => reply({ ok: true, ...status(), result: r ?? null }), e => reply({ ok: false, error: e.message, ...status() }));
  return true;
});

// ── events ───────────────────────────────────────────────────────────────────────────────────────────────────────

api.tabs.onActivated.addListener(refresh);
api.tabs.onUpdated.addListener((id, change, tab) => tab.active && (change.url || change.title || change.status) && refresh());
api.tabs.onRemoved.addListener(id => [...extracted.keys()].filter(k => k.startsWith(`${id} `)).forEach(k => extracted.delete(k)));
api.windows.onFocusChanged.addListener(id => (live.window = id === api.windows.WINDOW_ID_NONE ? null : id, refresh()));
api.idle.onStateChanged.addListener(state => (live.idle = state, refresh()));
api.alarms.onAlarm.addListener(() => (connect(), refresh(), flush(), syncDue()));
api.runtime.onStartup.addListener(() => {});   // having a listener is what starts the worker with the browser

(async () => {
  Object.assign(local, await api.storage.local.get(['config', 'queue', 'synced']));
  local.config = { ...DEFAULTS, ...local.config }, local.queue ??= [], local.synced ??= {};
  Object.assign(live, await api.storage.session.get(['span', 'idle', 'window']));
  live.idle = await api.idle.queryState(Math.max(15, Math.round(local.config.idle)));
  const win = await api.windows.getLastFocused().catch(() => null);
  live.window = win?.focused ? win.id : null;
  api.alarms.create('tick', { periodInMinutes: 0.5 });
  connect();
  paint();
  refresh();
})();
