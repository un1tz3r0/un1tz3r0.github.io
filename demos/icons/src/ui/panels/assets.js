// <mis-asset-panel>: the bottom panel. Hosts the icon browser, font browser and swatches
// and follows the active tool (Place → Icons, Text → Fonts, others → Swatches) unless the
// user pins a tab.

import { MisElement, css, html } from '../base.js';
import { app, editor } from '../../app.js';
import { getSetting, setSetting } from '../../services/storage/index.js';

export class MisAssetPanel extends MisElement {
  static styles = [
    css`
      :host {
        display: block;
        min-height: 0;
        background: var(--bg-raised);
        container-type: inline-size;
      }
      mis-tabs {
        height: 100%;
      }
    `,
  ];
  static template = html`
    <mis-tabs label="Assets" value="icons">
      <mis-tab value="icons" label="Icons" icon="shapes"><mis-icon-browser></mis-icon-browser></mis-tab>
      <mis-tab value="fonts" label="Fonts" icon="type"><mis-font-browser></mis-font-browser></mis-tab>
      <mis-tab value="swatches" label="Swatches" icon="palette"><mis-swatches></mis-swatches></mis-tab>
      <mis-button slot="actions" class="pin" icon="pin" label="Keep this tab when switching tools" toggle></mis-button>
      <mis-button slot="actions" class="hide" icon="chevron-down" label="Hide the asset panel"></mis-button>
    </mis-tabs>
  `;

  constructor() {
    super();
    this.pinned = false;
  }

  async connected() {
    const tabs = this.$('mis-tabs');
    const pin = this.$('.pin');
    this.listen(pin, 'click', () => {
      this.pinned = !this.pinned;
      pin.pressed = this.pinned;
      setSetting('assetsPinned', this.pinned);
    });
    this.listen(this.$('.hide'), 'click', () => /** @type {any} */ (this.getRootNode()).host?.togglePanel?.('assets'));
    this.listen(tabs, 'change', (e) => setSetting('assetsTab', e.detail.value));

    // A request from elsewhere in the app ("choose a font…") always wins over the pin.
    this.listen(this.getRootNode(), 'show-assets', (e) => this.show(/** @type {CustomEvent} */ (e).detail.tab));

    this.pinned = await getSetting('assetsPinned', false);
    pin.pressed = this.pinned;
    const saved = await getSetting('assetsTab', 'icons');
    tabs.value = saved;
    this.watch(editor.store, 'tool', (id) => {
      if (this.pinned) return;
      const T = /** @type {any} */ (app.tools.get(id)?.constructor);
      // Tools without an opinion (select, node, pan, zoom) leave the panel as it is.
      if (T?.assetTab && ['place', 'text', 'rect', 'ellipse', 'polygon', 'line', 'pen'].includes(id)) tabs.value = T.assetTab;
    });
  }

  /** Bring a tab to the front, opening the panel if it is collapsed. */
  show(tab) {
    this.$('mis-tabs').value = tab;
    const shell = /** @type {any} */ (this.getRootNode()).host;
    if (shell?.layout && !shell.layout.assetsOpen) shell.togglePanel('assets');
  }
}
