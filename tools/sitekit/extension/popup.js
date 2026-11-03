const api = globalThis.browser ?? globalThis.chrome;
const $ = sel => document.querySelector(sel);
const ago = t => { const s = Date.now() / 1000 - t; return s < 90 ? 'just now' : s < 5400 ? `${Math.round(s / 60)} min ago` : s < 129600 ? `${Math.round(s / 3600)} h ago` : `${Math.round(s / 86400)} d ago`; };
const ask = msg => api.runtime.sendMessage(msg);

class PluginRow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append($('#plugin-row').content.cloneNode(true));
    this.button = this.shadowRoot.querySelector('button');
    this.button.onclick = async () => {
      this.button.disabled = true;
      render(await ask({ type: 'sync', plugin: this.plugin.id }));
    };
  }

  set plugin(p) {
    this._plugin = p;
    const $s = sel => this.shadowRoot.querySelector(sel), s = p.synced;
    $s('.name').textContent = p.name;
    $s('.name').classList.toggle('off', !p.enabled);
    $s('.when').textContent = !p.enabled ? 'turned off in pulse.toml' : !p.sync ? 'classifies pages'
      : !s ? 'not synced yet' : s.error ? `sync failed ${ago(s.at)}: ${s.error}` : `${s.count} projects, synced ${ago(s.at)}`;
    $s('.when').classList.toggle('err', !!s?.error);
    Object.assign(this.button, { hidden: !p.sync || !p.enabled, disabled: false });
  }

  get plugin() { return this._plugin; }
}
customElements.define('plugin-row', PluginRow);

function render(st) {
  const d = st.daemon ?? {};
  $('.mode').dataset.mode = st.mode;
  $('#summary').textContent = st.mode === 'offline' ? 'not connected to the daemon'
    : `${st.mode}${d.minutes != null ? ` · ${Math.floor(d.minutes / 60)} h ${d.minutes % 60} min today` : ''}${st.queued ? ` · ${st.queued} queued` : ''}`;
  $('#error').textContent = st.ok === false ? st.error : st.mode === 'offline' && st.error
    ? `${st.error}. Is the daemon running, and was the host registered with "sitekit pulse browser"?` : '';
  const s = st.span;
  $('#page').replaceChildren(...(s ? [['site', s.site ?? '—'], ['project', s.project ?? '—'], ['activity', s.activity ?? '—'], ['since', ago(s.start)]]
    : [['', st.mode === 'offline' ? 'nothing is sent while offline; pages are queued' : 'not tracked (idle, unfocused, private or filtered)']])
    .flatMap(([k, v]) => [Object.assign(document.createElement('dt'), { textContent: k }), Object.assign(document.createElement('dd'), { textContent: v })]));
  const paused = !!d.paused, online = st.mode !== 'offline';
  for (const b of document.querySelectorAll('[data-act]'))
    b.disabled = b.dataset.act === 'reconnect' ? online : !online || (b.dataset.act === 'resume') !== paused && b.dataset.act !== 'publish';
  const rows = $('#plugins');
  st.plugins.forEach((p, i) => ((rows.children[i] ?? rows.appendChild(new PluginRow())).plugin = p));
}

for (const b of document.querySelectorAll('[data-act]'))
  b.onclick = async () => render(await ask({ type: b.dataset.act, minutes: +b.dataset.minutes || 0 }));

render(await ask({ type: 'status' }));
setInterval(async () => render(await ask({ type: 'status' })), 2000);
