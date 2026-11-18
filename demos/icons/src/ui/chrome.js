// <mis-topbar> and <mis-statusbar>: the bars above and below the workspace.

import { MisElement, css, html, h } from './base.js';
import { editor, app, isMac } from '../app.js';
import { formatShortcut } from '../core/commands.js';
import { selectionBounds } from '../core/geometry/bounds.js';
import { fmt } from '../core/affine.js';

/**
 * Keep every `[data-command]` button under `root` in step with its command: label,
 * shortcut, enabled state; and run the command on click.
 * @param {MisElement} host
 * @param {ParentNode} root
 */
export function bindCommandButtons(host, root) {
  const buttons = /** @type {any[]} */ ([...root.querySelectorAll('[data-command]')]);
  for (const button of buttons) {
    const cmd = editor.commands.get(button.dataset.command);
    if (!cmd) continue;
    if (!button.icon && cmd.icon) button.icon = cmd.icon;
    button.label = cmd.label;
    button.shortcut = formatShortcut(cmd.shortcut ?? '', isMac);
    host.listen(button, 'click', () => editor.commands.run(cmd.id));
  }
  let queued = false;
  const sync = () => {
    queued = false;
    for (const button of buttons) {
      if (editor.commands.get(button.dataset.command)) button.disabled = !editor.commands.isEnabled(button.dataset.command);
    }
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(sync);
  };
  host.watch(editor.store, (s) => s, schedule);
  sync();
}

export class MisTopbar extends MisElement {
  static styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 0 var(--s2);
        background: var(--bg-raised);
        border-bottom: 1px solid var(--border);
        min-width: 0;
        overflow: hidden;
      }
      .brand {
        font-weight: 700;
        white-space: nowrap;
        margin: 0 var(--s2) 0 var(--s1);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .name {
        width: 150px;
        flex: 0 1 150px;
        min-width: 60px;
      }
      .name::part(box) {
        border-color: transparent;
        background: transparent;
      }
      .name:hover::part(box),
      .name:focus-within::part(box) {
        border-color: var(--border);
        background: var(--bg-field);
      }
      .sep {
        width: 1px;
        height: 18px;
        background: var(--border);
        margin: 0 var(--s1);
        flex: none;
      }
      .spacer {
        flex: 1;
      }
      .zoom {
        min-width: 58px;
        font-variant-numeric: tabular-nums;
      }
      .dirty {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--text-faint);
        flex: none;
        visibility: hidden;
      }
      .dirty.on {
        visibility: visible;
      }
      /* Lower-priority groups disappear first as the window narrows. */
      @container (max-width: 1180px) {
        .g-align {
          display: none;
        }
      }
      @container (max-width: 900px) {
        .g-arrange {
          display: none;
        }
      }
      @container (max-width: 720px) {
        .g-path,
        .brand span {
          display: none;
        }
      }
      :host {
        container-type: inline-size;
      }
      .group {
        display: flex;
        align-items: center;
        gap: 2px;
      }
    `,
  ];
  static template = html`
    <mis-button class="menu" icon="menu" label="Menu"></mis-button>
    <div class="brand"><slot name="brand"></slot></div>
    <mis-text-field class="name" label="Document name"></mis-text-field>
    <span class="dirty" title="Unsaved changes"></span>
    <span class="sep"></span>
    <mis-button data-command="edit.undo"></mis-button>
    <mis-button data-command="edit.redo"></mis-button>
    <div class="group g-path">
      <span class="sep"></span>
      <mis-button data-command="path.union"></mis-button>
      <mis-button data-command="path.subtract"></mis-button>
      <mis-button data-command="path.intersect"></mis-button>
      <mis-button data-command="path.exclude"></mis-button>
    </div>
    <div class="group g-arrange">
      <span class="sep"></span>
      <mis-button data-command="object.group"></mis-button>
      <mis-button data-command="object.ungroup"></mis-button>
      <mis-button data-command="order.front"></mis-button>
      <mis-button data-command="order.back"></mis-button>
    </div>
    <div class="group g-align">
      <span class="sep"></span>
      <mis-button data-command="align.left"></mis-button>
      <mis-button data-command="align.center"></mis-button>
      <mis-button data-command="align.right"></mis-button>
      <mis-button data-command="align.top"></mis-button>
      <mis-button data-command="align.middle"></mis-button>
      <mis-button data-command="align.bottom"></mis-button>
      <mis-button data-command="distribute.horizontal"></mis-button>
      <mis-button data-command="distribute.vertical"></mis-button>
    </div>
    <span class="spacer"></span>
    <mis-button data-command="view.zoomOut"></mis-button>
    <mis-button class="zoom" label="Zoom"></mis-button>
    <mis-button data-command="view.zoomIn"></mis-button>
    <span class="sep"></span>
    <mis-button data-command="file.export" variant="primary" icon="download">Export</mis-button>
    <mis-menu class="main-menu"></mis-menu>
    <mis-menu class="zoom-menu"></mis-menu>
  `;

  connected() {
    bindCommandButtons(this, this.shadowRoot);
    const store = editor.store;
    const name = this.$('.name');
    this.watch(store, (s) => s.doc.name, (v) => (name.value = v), { immediate: true });
    this.listen(name, 'change', (e) => {
      const value = e.detail.value.trim() || 'Untitled';
      if (value !== editor.doc.name) editor.apply('Rename document', (doc) => ({ ...doc, name: value }));
      name.value = editor.doc.name;
    });
    this.watch(store, 'dirty', (d) => this.$('.dirty').classList.toggle('on', d), { immediate: true });

    const zoom = this.$('.zoom');
    this.watch(store, (s) => s.view.zoom, (z) => (zoom.textContent = `${fmt(z * 100, z < 0.1 ? 1 : 0)}%`), { immediate: true });
    const zoomMenu = this.$('.zoom-menu');
    this.listen(zoom, 'click', () => {
      zoomMenu.items = [
        ...this.#items(['view.zoomFit', 'view.zoomSelection', 'view.zoom100']),
        { separator: true },
        ...[0.5, 2, 4, 8, 16, 32].map((z) => ({ id: `zoom:${z}`, label: `${z * 100}%` })),
      ];
      zoomMenu.openFor(zoom);
    });
    this.listen(zoomMenu, 'select', (e) => {
      const id = e.detail.id;
      if (id.startsWith('zoom:')) app.canvas?.zoomTo(Number(id.slice(5)));
      else editor.commands.run(id);
    });

    const menu = this.$('.main-menu');
    const menuButton = this.$('.menu');
    this.listen(menuButton, 'click', () => {
      const doc = editor.doc;
      menu.items = [
        ...this.#items(['file.new', 'file.open', 'file.import']),
        { separator: true },
        ...this.#items(['file.save', 'file.saveAs', 'file.export', 'file.copySvg']),
        { separator: true },
        ...this.#items(['view.toggleGrid', 'view.toggleSnap', 'view.toggleGuides', 'view.toggleGuideLock', 'view.clearGuides', 'view.toggleRulers', 'view.toggleSidebar', 'view.toggleAssets']).map((item) => ({
          ...item,
          checked: {
            'view.toggleGrid': doc.grid.visible,
            'view.toggleSnap': doc.snap.enabled,
            'view.toggleGuides': doc.guidesVisible,
            'view.toggleGuideLock': doc.guidesLocked,
            'view.toggleRulers': !app.canvas?.hasAttribute('no-rulers'),
            'view.toggleSidebar': !this.getRootNode().host?.hasAttribute('side-closed'),
            'view.toggleAssets': !this.getRootNode().host?.hasAttribute('assets-closed'),
          }[item.id],
        })),
        { separator: true },
        ...this.#items(['help.credits', 'app.offline', 'app.install', 'app.theme', 'help.shortcuts', 'help.about']).filter((item) => item.id !== 'app.install' || !item.disabled),
      ];
      menu.openFor(menuButton);
    });
    this.listen(menu, 'select', (e) => editor.commands.run(e.detail.id));
  }

  /** Menu items for the commands that exist, in the order given. */
  #items(ids) {
    return ids
      .map((id) => editor.commands.get(id))
      .filter(Boolean)
      .map((cmd) => ({
        id: cmd.id,
        label: cmd.label,
        icon: cmd.icon,
        shortcut: formatShortcut(cmd.shortcut ?? '', isMac),
        disabled: !editor.commands.isEnabled(cmd.id),
      }));
  }
}

export class MisStatusbar extends MisElement {
  static styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        gap: var(--s3);
        padding: 0 var(--s2);
        background: var(--bg-raised);
        border-top: 1px solid var(--border);
        color: var(--text-muted);
        font-size: var(--font-size-sm);
        white-space: nowrap;
        overflow: hidden;
        --control-h: 20px;
        --icon-size: 13px;
      }
      .mono {
        font-variant-numeric: tabular-nums;
        min-width: 96px;
      }
      .spacer {
        flex: 1;
      }
      .hint {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .toggles {
        display: flex;
        align-items: center;
        gap: 1px;
      }
      .toggles span {
        margin-right: 4px;
      }
      .offline {
        color: var(--warning);
        display: none;
        align-items: center;
        gap: 4px;
      }
      .offline.on {
        display: inline-flex;
      }
    `,
  ];
  static template = html`
    <span class="mono pos" aria-hidden="true"></span>
    <span class="mono size"></span>
    <span class="hint"></span>
    <span class="spacer"></span>
    <span class="offline"><mis-icon name="wifi-off"></mis-icon>Offline</span>
    <div class="toggles" role="group" aria-label="Snapping">
      <span>Snap</span>
      <mis-button data-snap="enabled" icon="magnet" label="Snapping on/off" toggle></mis-button>
      <mis-button data-snap="grid" icon="grid-3x3" label="Snap to grid" toggle></mis-button>
      <mis-button data-snap="guides" icon="ruler" label="Snap to guides" toggle></mis-button>
      <mis-button data-snap="artboard" icon="frame" label="Snap to artboard" toggle></mis-button>
      <mis-button data-snap="bounds" icon="square-dashed" label="Snap to object bounds" toggle></mis-button>
      <mis-button data-snap="nodes" icon="waypoints" label="Snap to path nodes" toggle></mis-button>
      <mis-button data-snap="paths" icon="spline" label="Snap to anywhere along a path" toggle></mis-button>
    </div>
  `;

  connected() {
    const store = editor.store;
    const pos = this.$('.pos');
    // Pointer position comes straight from the canvas; it is not application state.
    this.listen(this.getRootNode(), 'pointer-position', (e) => {
      const p = /** @type {CustomEvent} */ (e).detail;
      pos.textContent = p ? `${fmt(p.x, 2)}, ${fmt(p.y, 2)}` : '';
    });
    const size = this.$('.size');
    const syncSize = () => {
      const sel = editor.selection;
      const box = sel.length ? selectionBounds(editor.doc, sel) : null;
      size.textContent = box ? `${fmt(box.width, 2)} × ${fmt(box.height, 2)}` : '';
      this.$('.hint').textContent = sel.length > 1 ? `${sel.length} objects selected` : '';
    };
    this.watch(store, 'selection', syncSize);
    this.watch(store, 'doc', syncSize);
    syncSize();

    const buttons = this.$$('[data-snap]');
    for (const button of buttons) {
      this.listen(button, 'click', () => {
        const key = button.dataset.snap;
        editor.apply('Snap settings', (doc) => ({ ...doc, snap: { ...doc.snap, [key]: !doc.snap[key] } }));
      });
    }
    this.watch(store, (s) => s.doc.snap, (snap) => {
      for (const button of buttons) {
        const key = button.dataset.snap;
        button.pressed = !!snap[key];
        button.disabled = key !== 'enabled' && !snap.enabled;
      }
    }, { immediate: true });

    const offline = this.$('.offline');
    const syncOnline = () => offline.classList.toggle('on', !navigator.onLine);
    this.listen(window, 'online', syncOnline);
    this.listen(window, 'offline', syncOnline);
    syncOnline();
  }
}

export { h };
