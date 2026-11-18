// Bootstrap: create services, register tools and commands, define the custom elements,
// restore the last session, register the service worker.

import { app, editor, registerTool } from './app.js';
import { registerCommands } from './commands.js';
import { registerPathCommands } from './commands-path.js';
import { registerFileCommands } from './commands-file.js';
import { installTextMeasurer } from './render/text-measure.js';
import { createDoc, migrateDoc } from './core/model/nodes.js';
import { allNodes } from './core/model/tree.js';
import { getSetting, loadDocument, storage } from './services/storage/index.js';
import { createIconService } from './services/icons/iconify.js';
import { createFontService } from './services/fonts/index.js';

import { SelectTool, PanTool, ZoomTool } from './tools/select.js';
import { NodeTool } from './tools/node.js';
import { RectTool, EllipseTool, PolygonTool, LineTool } from './tools/shapes.js';
import { PenTool } from './tools/pen.js';
import { TextTool } from './tools/text.js';
import { PlaceTool } from './tools/place.js';

import { MisIcon, MisButton } from './ui/kit/button.js';
import { MisNumberField, MisTextField, MisSelect, MisSegmented, MisSlider, MisCheckbox } from './ui/kit/fields.js';
import { MisPanel, MisTabs, MisTab, MisSection, MisSplitter } from './ui/kit/layout.js';
import { MisDialog, MisMenu, MisContextMenu, MisToast, MisTooltip, toast } from './ui/kit/overlays.js';
import { MisToolbar, MisToolButton, MisFlyout } from './ui/kit/toolbar.js';
import { MisVirtualGrid, MisVirtualList } from './ui/kit/virtual.js';
import { MisColorPicker, MisGradientEditor, MisPaintField } from './ui/color.js';
import { MisCanvas, MisRuler } from './ui/canvas.js';
import { MisTopbar, MisStatusbar } from './ui/chrome.js';
import { MisProperties } from './ui/panels/properties.js';
import { MisLayers, MisLayerRow } from './ui/panels/layers.js';
import { MisIconBrowser } from './ui/panels/icon-browser.js';
import { MisFontBrowser } from './ui/panels/font-browser.js';
import { MisSwatches } from './ui/panels/swatches.js';
import { MisAssetPanel } from './ui/panels/assets.js';
import { MisApp } from './ui/app-shell.js';

/** Tools, in palette order. */
const TOOLS = [SelectTool, NodeTool, RectTool, EllipseTool, PolygonTool, LineTool, PenTool, TextTool, PlaceTool, PanTool, ZoomTool];

/** Custom elements, leaves first so containers find their children already defined. */
const ELEMENTS = {
  'mis-icon': MisIcon,
  'mis-button': MisButton,
  'mis-number-field': MisNumberField,
  'mis-text-field': MisTextField,
  'mis-select': MisSelect,
  'mis-segmented': MisSegmented,
  'mis-slider': MisSlider,
  'mis-checkbox': MisCheckbox,
  'mis-panel': MisPanel,
  'mis-tab': MisTab,
  'mis-tabs': MisTabs,
  'mis-section': MisSection,
  'mis-splitter': MisSplitter,
  'mis-dialog': MisDialog,
  'mis-menu': MisMenu,
  'mis-context-menu': MisContextMenu,
  'mis-toast': MisToast,
  'mis-tooltip': MisTooltip,
  'mis-tool-button': MisToolButton,
  'mis-flyout': MisFlyout,
  'mis-toolbar': MisToolbar,
  'mis-virtual-grid': MisVirtualGrid,
  'mis-virtual-list': MisVirtualList,
  'mis-color-picker': MisColorPicker,
  'mis-gradient-editor': MisGradientEditor,
  'mis-paint-field': MisPaintField,
  'mis-ruler': MisRuler,
  'mis-canvas': MisCanvas,
  'mis-layer-row': MisLayerRow,
  'mis-layers': MisLayers,
  'mis-properties': MisProperties,
  'mis-icon-browser': MisIconBrowser,
  'mis-font-browser': MisFontBrowser,
  'mis-swatches': MisSwatches,
  'mis-asset-panel': MisAssetPanel,
  'mis-topbar': MisTopbar,
  'mis-statusbar': MisStatusbar,
};

async function createServices() {
  let featured = [];
  try {
    featured = await (await fetch(new URL('./data/featured-icon-sets.json', import.meta.url))).json();
  } catch {
    /* the browser still works without a featured list */
  }
  app.services.icons = createIconService({ featured });
  app.services.fonts = createFontService({ storage, manifestUrl: new URL('./data/github-fonts.json', import.meta.url) });
  app.services.storage = storage;
}

async function restoreSession() {
  try {
    const lastId = await getSetting('lastDocument', null);
    const saved = lastId ? await loadDocument(lastId) : null;
    if (saved?.doc) {
      editor.load(migrateDoc(saved.doc));
      if (saved.view) {
        editor.store.set({ view: saved.view });
        return true;
      }
      return false;
    }
  } catch (err) {
    console.warn('Could not restore the last document', err);
  }
  editor.load(createDoc({ name: 'Untitled', width: 256, height: 256 }));
  return false;
}

/** Keep the fonts used by text objects loaded, whatever puts them in the document. */
function watchDocumentFonts() {
  const requested = new Set();
  const sync = () => {
    for (const node of allNodes(editor.doc)) {
      if (node.type !== 'text') continue;
      const key = `${node.font.provider}:${node.font.id}:${node.font.weight}:${node.font.style}`;
      if (requested.has(key)) continue;
      requested.add(key);
      app.services.fonts.ensure(node.font).catch(() => {
        requested.delete(key);
        toast(`The typeface ${node.font.family} could not be loaded; a fallback is shown.`, { type: 'error' });
      });
    }
  };
  editor.store.subscribe('doc', sync, { immediate: true });
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // During development a caching service worker mostly gets in the way; opt in with ?sw=1.
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (local && !new URLSearchParams(location.search).has('sw')) {
    // A worker left over from an earlier ?sw=1 session would keep serving old files.
    for (const registration of await navigator.serviceWorker.getRegistrations()) await registration.unregister();
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register(new URL('../sw.js', import.meta.url), { scope: new URL('../', import.meta.url).pathname });
    const offer = (worker) => {
      toast('A new version is ready.', {
        action: 'Reload',
        timeout: 0,
        onAction: () => worker.postMessage({ type: 'skip-waiting' }),
      });
    };
    if (registration.waiting && navigator.serviceWorker.controller) offer(registration.waiting);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) offer(worker);
      });
    });
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
  } catch (err) {
    console.warn('Service worker registration failed', err);
  }
}

/** Chrome and Edge announce installability with an event; keep it for the menu command. */
function watchInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    app.services.installPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    app.services.installPrompt = null;
    toast('Material Icon Studio is installed.');
  });
}

async function boot() {
  installTextMeasurer();
  await createServices();
  for (const T of TOOLS) registerTool(T);
  registerCommands();
  registerPathCommands();
  registerFileCommands();
  const viewRestored = await restoreSession();

  MisProperties.defineSections();
  for (const [tag, cls] of Object.entries(ELEMENTS)) cls.define(tag);
  MisApp.define('mis-app');
  if (viewRestored) app.canvas?.keepRestoredView();
  if ((await getSetting('rulers', true)) === false) app.canvas?.setAttribute('no-rulers', '');

  watchDocumentFonts();
  watchInstallPrompt();
  // The browser refused to store something (usually: the disk is full or the quota is).
  window.addEventListener('mis-storage-error', () => {
    toast('This browser is out of storage space, so changes are not being saved. Export your work, then free space under Menu → Offline data.', { type: 'error', timeout: 12000 });
  }, { once: true });
  storage.persist();
  registerServiceWorker();
  // Handy when poking at the app from the console or from an automated walkthrough.
  // `mis.import('/src/io.js')` loads a module in the page's own module context, where
  // the import map applies (a bare import() from an injected script does not get it).
  /** @type {any} */ (app).import = (path) => import(new URL(path, document.baseURI).href);
  /** @type {any} */ (globalThis).mis = app;
}

boot().catch((err) => {
  console.error(err);
  const el = document.querySelector('mis-app');
  const p = document.createElement('p');
  p.setAttribute('role', 'alert');
  p.textContent = `Material Icon Studio failed to start: ${err?.message ?? err}`;
  el?.append(p);
});
