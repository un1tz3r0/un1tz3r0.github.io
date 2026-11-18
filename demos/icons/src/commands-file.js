// File, export and application commands, with their dialogs. DESIGN.md §13–14.

import { app, editor, isMac } from './app.js';
import { h } from './ui/base.js';
import { openDialog, confirmDialog, field } from './ui/dialogs.js';
import { toast } from './ui/kit/overlays.js';
import { formatShortcut } from './core/commands.js';
import { createDoc, ARTBOARD_PRESETS } from './core/model/nodes.js';
import { parseProject } from './core/io/svg-export.js';
import { insertNodes } from './core/model/tree.js';
import { fmt } from './core/affine.js';
import {
  buildSvg, buildProject, buildCredits, svgToPng, saveFile, pickFiles, download, importSvg, DEFAULT_EXPORT,
} from './io.js';
import { listDocuments, loadDocument, deleteDocument, saveDocument, getSetting, setSetting, storage } from './services/storage/index.js';
import { migrateDoc } from './core/model/nodes.js';

const SVG_TYPE = { 'image/svg+xml': ['.svg'] };
/** File handle of the project file the current document was opened from / saved to. */
let projectHandle = null;

const shell = () => /** @type {any} */ (document.querySelector('mis-app'));
const kb = (n) => (n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${fmt(n / 1024, 1)} KB` : `${fmt(n / 1024 / 1024, 1)} MB`);

function loadDoc(doc, { view, handle = null } = {}) {
  projectHandle = handle;
  editor.load(doc);
  if (view) editor.store.set({ view });
  else requestAnimationFrame(() => app.canvas?.zoomToFit());
  editor.setTool('select');
}

// --- new ---------------------------------------------------------------------------------------

function newDocumentDialog() {
  const name = h('mis-text-field', { value: 'Untitled' });
  const w = h('mis-number-field', { label: 'W', min: 1, max: 16384, step: 1, precision: 2, value: 256 });
  const hh = h('mis-number-field', { label: 'H', min: 1, max: 16384, step: 1, precision: 2, value: 256 });
  const presets = h('div', { class: 'presets' }, ARTBOARD_PRESETS.map((p) => h('mis-button', {
    variant: 'outline',
    textContent: p.label,
    onclick: () => {
      w.value = p.width;
      hh.value = p.height;
    },
  })));
  const create = h('mis-button', { variant: 'primary', textContent: 'Create' });
  const cancel = h('mis-button', { variant: 'outline', textContent: 'Cancel' });
  const dialog = openDialog({
    heading: 'New document',
    content: h('div', { class: 'form' },
      field('Name', name),
      field('Size', w, hh),
      field('Presets', presets),
      h('p', { class: 'muted small', style: 'margin:0', textContent: 'The current document stays in “Open → Recent”. Icons are usually drawn at 24; pick a larger size for illustrations.' })),
    footer: [cancel, create],
  });
  cancel.addEventListener('click', () => dialog.close());
  create.addEventListener('click', () => {
    loadDoc(createDoc({ name: name.value.trim() || 'Untitled', width: w.value || 256, height: hh.value || 256 }));
    dialog.close();
  });
}

// --- open --------------------------------------------------------------------------------------

async function openFromFile() {
  const [picked] = await pickFiles({ accept: SVG_TYPE, description: 'SVG images' });
  if (!picked) return false;
  return openSvgText(await picked.file.text(), picked.file.name, picked.handle);
}

/** Open SVG text as a document: a project file as it was saved, anything else converted. */
export async function openSvgText(text, filename = 'Imported.svg', handle = null) {
  const base = filename.replace(/\.svg$/i, '');
  try {
    const project = parseProject(text);
    if (project) {
      loadDoc(project, { handle });
      toast(`Opened ${project.name}`);
      return true;
    }
    const { group, width, height, report } = await importSvg(text, base);
    const doc = { ...createDoc({ name: base, width, height }), children: [group] };
    loadDoc(doc);
    showImportReport(base, report);
    return true;
  } catch (err) {
    toast(`Could not open ${filename}: ${err?.message ?? 'not a valid SVG'}`, { type: 'error', timeout: 7000 });
    return false;
  }
}

/** Add SVG text to the current document as a group. */
export async function importSvgText(text, filename = 'Imported.svg') {
  const base = filename.replace(/\.svg$/i, '');
  try {
    const project = parseProject(text);
    let nodes;
    let report = [];
    if (project) {
      nodes = project.children;
    } else {
      const result = await importSvg(text, base);
      nodes = [result.group];
      report = result.report;
    }
    if (!nodes.length) throw new Error('nothing to import');
    editor.apply('Import', (doc) => insertNodes(doc, null, nodes), { selection: nodes.map((n) => n.id) });
    editor.setTool('select');
    showImportReport(base, report);
    return true;
  } catch (err) {
    toast(`Could not import ${filename}: ${err?.message ?? 'not a valid SVG'}`, { type: 'error', timeout: 7000 });
    return false;
  }
}

function showImportReport(name, report) {
  if (!report.length) {
    toast(`Imported ${name}`);
    return;
  }
  const ok = h('mis-button', { variant: 'primary', textContent: 'OK' });
  const dialog = openDialog({
    heading: `Imported ${name}`,
    content: h('div', { class: 'form' },
      h('p', { style: 'margin:0', textContent: 'The shapes were converted to editable paths. Some things could not be carried over:' }),
      h('pre', { class: 'report', textContent: report.map((r) => `• ${r}`).join('\n') })),
    footer: [ok],
  });
  ok.addEventListener('click', () => dialog.close());
}

async function openDialogCommand() {
  const docs = await listDocuments();
  const list = h('div', { class: 'list' });
  let dialog;
  const render = (items) => {
    list.replaceChildren(...items.map((entry) => {
      const size = entry.doc?.artboard ? `${fmt(entry.doc.artboard.width, 0)} × ${fmt(entry.doc.artboard.height, 0)}` : '';
      const remove = h('mis-button', { icon: 'trash-2', label: `Delete ${entry.name}` });
      const row = h('div', { class: 'doc-row', tabIndex: 0, attrs: { role: 'button' } },
        h('mis-icon', { name: 'file-text', style: '--icon-size:22px;color:var(--text-muted)' }),
        h('div', { class: 'meta' },
          h('b', { textContent: entry.name + (entry.id === editor.doc.id ? ' (open now)' : '') }),
          h('span', { class: 'muted small', textContent: `${size} · ${new Date(entry.updated).toLocaleString()}` })),
        remove);
      const open = () => {
        try {
          loadDoc(migrateDoc(entry.doc), { view: entry.view });
          dialog.close();
        } catch (err) {
          toast(`Could not open ${entry.name}: ${err.message}`, { type: 'error' });
        }
      };
      row.addEventListener('click', open);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') open();
      });
      remove.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (entry.id === editor.doc.id) {
          toast('That document is open. Create or open another one first.');
          return;
        }
        if (!(await confirmDialog({ heading: 'Delete document?', message: `“${entry.name}” will be removed from this browser. This cannot be undone.`, confirm: 'Delete', danger: true }))) return;
        await deleteDocument(entry.id);
        render((await listDocuments()));
      });
      return row;
    }));
    if (!items.length) list.replaceChildren(h('p', { class: 'muted', textContent: 'No saved documents yet.' }));
  };
  render(docs);
  const fromFile = h('mis-button', { variant: 'primary', icon: 'folder-open', textContent: 'Open a file…' });
  const close = h('mis-button', { variant: 'outline', textContent: 'Close' });
  dialog = openDialog({
    heading: 'Open',
    width: '520px',
    content: h('div', { class: 'form' },
      h('p', { class: 'muted small', style: 'margin:0', textContent: 'Documents are saved automatically in this browser. Project files (.svg saved from this app) reopen exactly; other SVG files are converted to paths.' }),
      list),
    footer: [close, fromFile],
  });
  close.addEventListener('click', () => dialog.close());
  fromFile.addEventListener('click', async () => {
    if (await openFromFile()) dialog.close();
  });
}

// --- save --------------------------------------------------------------------------------------

async function saveProject(saveAs) {
  try {
    const svg = await buildProject(editor.doc);
    const result = await saveFile(new Blob([svg], { type: 'image/svg+xml' }), {
      name: editor.doc.name,
      extension: 'svg',
      mime: 'image/svg+xml',
      description: 'Material Icon Studio project (SVG)',
      handle: saveAs ? null : projectHandle,
    });
    if (!result.saved) return;
    projectHandle = result.handle;
    editor.store.set({ dirty: false });
    saveDocument(editor.doc, { view: editor.store.get('view') });
    toast(result.handle ? `Saved ${result.handle.name}` : 'Project downloaded');
  } catch (err) {
    toast(`Could not save: ${err?.message ?? err}`, { type: 'error' });
  }
}

// --- export ------------------------------------------------------------------------------------

async function exportDialog() {
  const saved = await getSetting('export', {});
  const state = { format: 'svg', scale: 4, transparent: true, ...DEFAULT_EXPORT, ...saved };
  const doc = editor.doc;
  const { width, height } = doc.artboard;

  const format = h('mis-segmented', { options: [{ value: 'svg', label: 'SVG' }, { value: 'png', label: 'PNG' }], value: state.format, label: 'Format' });
  const check = (key, label) => {
    const c = h('mis-checkbox', { textContent: label, checked: !!state[key] });
    c.addEventListener('change', (e) => {
      state[key] = e.detail.value;
      refresh();
    });
    return c;
  };
  const svgOptions = h('div', { class: 'form' },
    check('outlineText', 'Convert text to outlines (no font needed to view)'),
    check('currentColor', 'Use currentColor instead of fixed colors (single-color icons)'),
    check('dimensions', 'Include width and height (off: viewBox only, scales to its container)'),
    check('credits', 'Include credits for icon sets and typefaces'),
    check('background', 'Include the artboard background'),
    check('minify', 'Minify'));
  const scale = h('mis-number-field', { label: '×', min: 0.25, max: 32, step: 1, precision: 2, value: state.scale });
  const pixels = h('span', { class: 'muted' });
  scale.addEventListener('change', (e) => {
    state.scale = e.detail.value;
    refresh();
  });
  scale.addEventListener('input', (e) => {
    state.scale = e.detail.value;
    refresh();
  });
  const pngOptions = h('div', { class: 'form' }, field('Scale', scale, pixels), check('transparent', 'Transparent background'));
  const preview = h('div', { class: 'preview' });
  const info = h('div', { class: 'muted small' });
  const warn = h('div', { class: 'small', style: 'color:var(--warning)' });
  const save = h('mis-button', { variant: 'primary', icon: 'download', textContent: 'Save…' });
  const copy = h('mis-button', { variant: 'outline', icon: 'clipboard', textContent: 'Copy' });
  const cancel = h('mis-button', { variant: 'outline', textContent: 'Close' });

  let current = { svg: '', warnings: [] };
  let token = 0;
  let previewUrl = '';
  async function refresh() {
    const mine = ++token;
    svgOptions.hidden = state.format !== 'svg';
    pngOptions.hidden = state.format !== 'png';
    const px = { width: Math.round(width * state.scale), height: Math.round(height * state.scale) };
    pixels.textContent = `${px.width} × ${px.height} px`;
    const { format: _f, scale: _s, transparent: _t, ...settings } = state;
    setSetting('export', state);
    try {
      // A PNG is a picture: always outline text, never minify or switch to currentColor.
      const result = await buildSvg(doc, state.format === 'png'
        ? { outlineText: true, currentColor: false, credits: false, minify: false, dimensions: true, background: !state.transparent }
        : settings);
      if (mine !== token) return;
      current = result;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = URL.createObjectURL(new Blob([result.svg], { type: 'image/svg+xml' }));
      preview.replaceChildren(h('img', { src: previewUrl, alt: 'Export preview', style: state.currentColor && state.format === 'svg' ? 'color:var(--text)' : '' }));
      info.textContent = state.format === 'svg'
        ? `${kb(new Blob([result.svg]).size)} · ${fmt(width, 2)} × ${fmt(height, 2)} units`
        : `${px.width} × ${px.height} pixels`;
      warn.textContent = result.warnings.join(' ');
    } catch (err) {
      if (mine !== token) return;
      warn.textContent = `Export failed: ${err?.message ?? err}`;
    }
  }
  format.addEventListener('change', (e) => {
    state.format = e.detail.value;
    refresh();
  });

  const makeBlob = async () => {
    if (state.format === 'svg') return new Blob([current.svg], { type: 'image/svg+xml' });
    return svgToPng(current.svg, { width: width * state.scale, height: height * state.scale });
  };
  const dialog = openDialog({
    heading: 'Export',
    width: '500px',
    content: h('div', { class: 'form' }, preview, info, field('Format', format), svgOptions, pngOptions, warn),
    footer: [cancel, copy, save],
    onClose: () => previewUrl && URL.revokeObjectURL(previewUrl),
  });
  cancel.addEventListener('click', () => dialog.close());
  save.addEventListener('click', async () => {
    try {
      const blob = await makeBlob();
      const isSvg = state.format === 'svg';
      const result = await saveFile(blob, {
        name: doc.name,
        extension: isSvg ? 'svg' : 'png',
        mime: isSvg ? 'image/svg+xml' : 'image/png',
        description: isSvg ? 'SVG image' : 'PNG image',
      });
      if (result.saved) {
        toast(result.handle ? `Exported ${result.handle.name}` : 'Export downloaded');
        dialog.close();
      }
    } catch (err) {
      toast(`Export failed: ${err?.message ?? err}`, { type: 'error' });
    }
  });
  copy.addEventListener('click', async () => {
    try {
      if (state.format === 'svg') await navigator.clipboard.writeText(current.svg);
      else await navigator.clipboard.write([new ClipboardItem({ 'image/png': makeBlob() })]);
      toast(state.format === 'svg' ? 'SVG markup copied' : 'PNG copied');
    } catch (err) {
      toast(`Could not copy: ${err?.message ?? 'clipboard unavailable'}`, { type: 'error' });
    }
  });
  refresh();
}

// --- credits, shortcuts, about, offline data ---------------------------------------------------

async function creditsDialog() {
  const credits = await buildCredits(editor.doc);
  const body = credits.length
    ? credits.map((c) => h('div', { class: 'credit' },
        h('div', null,
          h('b', { textContent: c.kind === 'icons' ? c.title : `${c.title} (typeface)` }),
          c.required ? h('span', { class: 'tag', textContent: 'Attribution required' }) : null),
        h('div', { class: 'muted' }, [c.author && `by ${c.author}`, c.license].filter(Boolean).join(' · '), c.url ? ' · ' : '', c.url ? h('a', { href: c.url, target: '_blank', rel: 'noopener noreferrer', textContent: 'license / source' }) : null),
        c.names ? h('div', { class: 'names', textContent: c.names.join(', ') }) : null))
    : [h('p', { class: 'muted', textContent: 'This document does not use any icons or typefaces yet.' })];
  const text = credits.map((c) => `${c.kind === 'icons' ? 'Icons' : 'Typeface'}: ${c.title}${c.author ? ` by ${c.author}` : ''}${c.license ? ` (${c.license})` : ''}${c.url ? ` — ${c.url}` : ''}`).join('\n');
  const copy = h('mis-button', { variant: 'outline', icon: 'clipboard', textContent: 'Copy as text', disabled: !credits.length });
  const close = h('mis-button', { variant: 'primary', textContent: 'Close' });
  const dialog = openDialog({
    heading: 'Credits',
    content: h('div', null,
      h('p', { class: 'muted small', style: 'margin-top:0', textContent: 'Everything in this document that came from somewhere else, and what its license asks of you. Exports can carry this list as a comment.' }),
      ...body),
    footer: [copy, close],
  });
  copy.addEventListener('click', () => navigator.clipboard?.writeText(text).then(() => toast('Credits copied'), () => {}));
  close.addEventListener('click', () => dialog.close());
}

function shortcutsDialog() {
  const groups = new Map();
  for (const cmd of editor.commands.list()) {
    if (!cmd.shortcut) continue;
    const g = cmd.group ?? 'Other';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(cmd);
  }
  const keys = (shortcut) => formatShortcut(shortcut, isMac).split(isMac ? /(?=.)/ : '+').filter(Boolean).flatMap((k, i) => (i ? [' ', h('kbd', { textContent: k })] : [h('kbd', { textContent: k })]));
  const extra = [
    ['Canvas', [
      ['Pan', 'Space + drag, or middle button'],
      ['Zoom', `${isMac ? '⌘' : 'Ctrl'} + wheel, or pinch`],
      ['Constrain (square, 15°, axis)', 'Shift'],
      ['From center / duplicate while dragging', isMac ? '⌥' : 'Alt'],
      ['Suspend snapping', isMac ? '⌘' : 'Ctrl'],
      ['Cancel / leave group', 'Esc'],
    ]],
  ];
  const table = h('table', { class: 'keys' },
    ...[...groups].flatMap(([name, cmds]) => [
      h('tr', null, h('th', { colSpan: 2, textContent: name })),
      ...cmds.map((cmd) => h('tr', null, h('td', { textContent: cmd.label }), h('td', null, keys(cmd.shortcut)))),
    ]),
    ...extra.flatMap(([name, rows]) => [
      h('tr', null, h('th', { colSpan: 2, textContent: name })),
      ...rows.map(([label, key]) => h('tr', null, h('td', { textContent: label }), h('td', null, h('kbd', { textContent: key })))),
    ]));
  const close = h('mis-button', { variant: 'primary', textContent: 'Close' });
  const dialog = openDialog({ heading: 'Keyboard shortcuts', width: '460px', content: table, footer: [close] });
  close.addEventListener('click', () => dialog.close());
}

function aboutDialog() {
  const close = h('mis-button', { variant: 'primary', textContent: 'Close' });
  const link = (href, text) => h('a', { href, target: '_blank', rel: 'noopener noreferrer', textContent: text });
  const dialog = openDialog({
    heading: 'About Material Icon Studio',
    width: '420px',
    content: h('div', { class: 'form' },
      h('p', { style: 'margin:0', textContent: 'Compose SVG images from free icon sets, shapes and text. Everything stays in your browser.' }),
      h('p', { class: 'muted', style: 'margin:0' },
        'Geometry by ', link('https://github.com/un1tz3r0/geo', 'geo'), ' · icons via ', link('https://iconify.design', 'Iconify'),
        ' · typefaces via ', link('https://fontsource.org', 'Fontsource'), ' · font parsing by ', link('https://opentype.js.org', 'opentype.js'),
        ' · interface glyphs from ', link('https://lucide.dev', 'Lucide'), '.'),
      h('p', { class: 'muted small', style: 'margin:0', textContent: 'MIT licensed. Icon sets and typefaces keep their own licenses; see Credits for what a document uses.' })),
    footer: [close],
  });
  close.addEventListener('click', () => dialog.close());
}

/** What a cached request is, for the offline-data list: an icon set, a typeface, … */
function describeCached(url) {
  const u = new URL(url);
  let m;
  if ((m = /^\/npm\/@iconify-json\/([^/@]+)/.exec(u.pathname))) {
    return { kind: 'Icon set', key: `set:${m[1]}`, label: app.services.icons.cachedSet(m[1])?.name ?? m[1] };
  }
  if ((m = /^\/fontsource\/fonts\/([^/@]+)/.exec(u.pathname))) {
    return { kind: 'Typeface', key: `font:${m[1]}`, label: app.services.fonts.cached({ provider: 'fontsource', id: m[1] })?.family ?? m[1] };
  }
  if ((m = /^\/gh\/([^/]+\/[^/@]+)/.exec(u.pathname))) return { kind: 'Typeface', key: `gh:${m[1]}`, label: m[1] };
  if (u.hostname === 'api.iconify.design') {
    if (u.pathname.startsWith('/collection')) return { kind: 'Catalog', key: 'catalog:icons', label: 'Icon set catalog' };
    return { kind: 'Icons', key: 'icons:single', label: 'Individual icons and thumbnails' };
  }
  if (u.hostname === 'api.fontsource.org') return { kind: 'Catalog', key: 'catalog:fonts', label: 'Typeface catalog' };
  return { kind: 'Other', key: `other:${u.hostname}`, label: u.hostname };
}

async function offlineDialog() {
  const body = h('div', { class: 'form' }, h('p', { class: 'muted', textContent: 'Checking…' }));
  const close = h('mis-button', { variant: 'primary', textContent: 'Close' });
  const dialog = openDialog({ heading: 'Offline data', width: '480px', content: body, footer: [close] });
  close.addEventListener('click', () => dialog.close());
  await app.services.icons.listSets().catch(() => []);

  const render = async () => {
    const estimate = await storage.estimate();
    /** @type {Map<string, {kind: string, label: string, entries: {cache: Cache, request: Request}[]}>} */
    const groups = new Map();
    let shellFiles = 0;
    if ('caches' in window) {
      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        if (name.startsWith('mis-shell')) {
          shellFiles += requests.length;
          continue;
        }
        for (const request of requests) {
          const info = describeCached(request.url);
          if (!groups.has(info.key)) groups.set(info.key, { kind: info.kind, label: info.label, entries: [] });
          groups.get(info.key).entries.push({ cache, request });
        }
      }
    }
    const rows = [...groups.values()]
      .sort((x, y) => x.kind.localeCompare(y.kind) || x.label.localeCompare(y.label))
      .map((group) => {
        const remove = h('mis-button', { icon: 'trash-2', label: `Remove ${group.label} from this device` });
        remove.addEventListener('click', async () => {
          await Promise.all(group.entries.map((e) => e.cache.delete(e.request)));
          toast(`${group.label} removed`);
          render();
        });
        return h('div', { class: 'doc-row', style: 'cursor:default' },
          h('div', { class: 'meta' },
            h('b', { textContent: group.label }),
            h('span', { class: 'muted small', textContent: `${group.kind} · ${group.entries.length} file${group.entries.length === 1 ? '' : 's'}` })),
          remove);
      });
    const sw = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const persisted = await navigator.storage?.persisted?.().catch(() => false);
    body.replaceChildren(
      h('p', { class: 'muted small', style: 'margin:0' },
        sw ? 'The app works offline. Icon sets and typefaces you have already used are kept on this device; ones you have never opened need a connection the first time.'
          : 'Offline support is off in this session (on localhost it is only enabled when the address ends in ?sw=1).'),
      rows.length ? h('div', { class: 'list' }, rows) : h('p', { class: 'muted', textContent: 'No icon sets or typefaces are stored yet.' }),
      field('The app itself', h('span', { class: 'muted', textContent: shellFiles ? `${shellFiles} files` : 'not stored' })),
      field('Storage used', h('span', { textContent: estimate ? `${kb(estimate.usage)} of ${kb(estimate.quota)}` : 'unknown' })),
      field('Protected', h('span', { textContent: persisted ? 'Yes — the browser will not clear this data on its own' : 'No — the browser may clear it if the device runs low on space' })),
    );
  };
  render();
}

// --- registration ------------------------------------------------------------------------------

export function registerFileCommands() {
  editor.commands.register([
    { id: 'file.new', label: 'New…', icon: 'file-plus', shortcut: 'Mod+Alt+N', group: 'File', run: newDocumentDialog },
    { id: 'file.open', label: 'Open…', icon: 'folder-open', shortcut: 'Mod+O', group: 'File', run: openDialogCommand },
    {
      id: 'file.import', label: 'Import SVG into this document…', icon: 'upload', group: 'File',
      run: async () => {
        const picked = await pickFiles({ accept: SVG_TYPE, description: 'SVG images', multiple: true });
        for (const { file } of picked) await importSvgText(await file.text(), file.name);
      },
    },
    { id: 'file.save', label: 'Save project', icon: 'save', shortcut: 'Mod+S', group: 'File', run: () => saveProject(false) },
    { id: 'file.saveAs', label: 'Save project as…', shortcut: 'Mod+Shift+S', group: 'File', run: () => saveProject(true) },
    { id: 'file.export', label: 'Export…', icon: 'download', shortcut: 'Mod+Shift+E', group: 'File', run: exportDialog },
    {
      id: 'file.copySvg', label: 'Copy as SVG', icon: 'clipboard', group: 'File',
      run: async () => {
        try {
          const saved = await getSetting('export', {});
          const { format: _f, scale: _s, transparent: _t, ...settings } = saved;
          const { svg } = await buildSvg(editor.doc, settings);
          await navigator.clipboard.writeText(svg);
          toast('SVG markup copied');
        } catch (err) {
          toast(`Could not copy: ${err?.message ?? 'clipboard unavailable'}`, { type: 'error' });
        }
      },
    },
    { id: 'help.credits', label: 'Credits…', icon: 'badge-check', group: 'Help', run: creditsDialog },
    { id: 'help.shortcuts', label: 'Keyboard shortcuts', icon: 'keyboard', shortcut: '?', group: 'Help', run: shortcutsDialog },
    { id: 'help.about', label: 'About', icon: 'info', group: 'Help', run: aboutDialog },
    { id: 'app.offline', label: 'Offline data…', icon: 'hard-drive', group: 'Help', run: offlineDialog },
    {
      id: 'app.install', label: 'Install as an app…', icon: 'download', group: 'Help',
      enabled: () => !!app.services.installPrompt,
      run: async () => {
        const prompt = app.services.installPrompt;
        app.services.installPrompt = null;
        await prompt.prompt();
      },
    },
    {
      id: 'app.theme', label: 'Switch theme (auto / light / dark)', icon: 'contrast', group: 'View',
      run: () => {
        const order = ['auto', 'light', 'dark'];
        const next = order[(order.indexOf(shell().theme ?? 'auto') + 1) % order.length];
        shell().setTheme(next);
        toast(`Theme: ${next}`);
      },
    },
    {
      id: 'view.toggleRulers', label: 'Show rulers', icon: 'ruler', shortcut: 'Mod+Alt+R', group: 'View',
      run: () => {
        const hidden = app.canvas.toggleAttribute('no-rulers');
        setSetting('rulers', !hidden);
      },
    },
    { id: 'view.toggleSidebar', label: 'Show properties and layers', icon: 'panel-right', shortcut: 'Mod+\\', group: 'View', run: () => shell().togglePanel('side') },
    { id: 'view.toggleAssets', label: 'Show asset panel', icon: 'panel-bottom', shortcut: 'Mod+J', group: 'View', run: () => shell().togglePanel('assets') },
  ]);

  // Files dropped on the canvas: a project file opens; anything else is imported.
  document.addEventListener('files-dropped', async (e) => {
    for (const file of /** @type {CustomEvent} */ (e).detail.files) {
      if (/\.svg$/i.test(file.name) || file.type === 'image/svg+xml') await importSvgText(await file.text(), file.name);
      else if (/\.(ttf|otf|woff2?)$/i.test(file.name)) {
        const { added, failed } = await app.services.fonts.addLocalFiles([file]);
        if (added.length) toast(`Added ${added.join(', ')} to your typefaces`);
        if (failed.length) toast(`Could not read ${failed.join(', ')}`, { type: 'error' });
      } else toast(`${file.name} is not something this app can open.`);
    }
  });

  // Pasting SVG markup from another application imports it.
  document.addEventListener('paste', (e) => {
    const t = e.composedPath()[0];
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA)$/.test(t.tagName))) return;
    const text = e.clipboardData?.getData('text/plain') ?? '';
    if (!/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(text)) return;
    e.preventDefault();
    importSvgText(text, 'Pasted.svg');
  });

  // Files opened from the OS when the app is installed.
  const launchQueue = /** @type {any} */ (window).launchQueue;
  launchQueue?.setConsumer?.(async (params) => {
    for (const handle of params.files ?? []) {
      const file = await handle.getFile();
      await openSvgText(await file.text(), file.name, handle);
    }
  });
}

export { download, loadDocument };
