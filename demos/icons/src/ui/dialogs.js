// Dialogs. Each is built on demand inside the app shell's #dialogs container, as a
// <mis-dialog> with slotted content, and removed again when it closes.

import { css, h } from './base.js';

/** Styles for dialog content. Adopted by <mis-app>, whose shadow tree hosts the dialogs. */
export const dialogStyles = css`
  .form {
    display: grid;
    gap: 10px;
  }
  .field {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr);
    align-items: center;
    gap: 8px;
  }
  .field > label,
  .field > .lbl {
    color: var(--text-muted);
  }
  .field .ctl {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }
  .field .ctl > * {
    flex: 1;
    min-width: 0;
  }
  .field .ctl > mis-button {
    flex: none;
  }
  .muted {
    color: var(--text-muted);
  }
  .small {
    font-size: var(--font-size-sm);
  }
  .list {
    display: grid;
    gap: 2px;
    max-height: 46vh;
    overflow: auto;
    margin: 0 -6px;
  }
  .doc-row {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px;
    border-radius: var(--radius);
    cursor: pointer;
  }
  .doc-row:hover,
  .doc-row:focus-visible {
    background: var(--bg-hover);
  }
  .doc-row:focus-visible {
    outline: 2px solid var(--focus);
  }
  .doc-row .meta {
    flex: 1;
    min-width: 0;
  }
  .doc-row .meta b {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .thumb {
    width: 44px;
    height: 44px;
    flex: none;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: repeating-conic-gradient(var(--checker-b) 0% 25%, var(--checker-a) 0% 50%) 50% / 10px 10px;
    object-fit: contain;
  }
  .preview {
    height: 180px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: repeating-conic-gradient(var(--checker-b) 0% 25%, var(--checker-a) 0% 50%) 50% / 14px 14px;
    display: grid;
    place-items: center;
    overflow: hidden;
  }
  .preview img {
    max-width: 100%;
    max-height: 178px;
    display: block;
  }
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  table.keys {
    width: 100%;
    border-collapse: collapse;
  }
  table.keys th {
    text-align: left;
    padding: 12px 0 4px;
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  table.keys td {
    padding: 3px 0;
    border-top: 1px solid var(--border);
  }
  table.keys td:last-child {
    text-align: right;
    white-space: nowrap;
  }
  kbd {
    font: 11px var(--font-mono);
    padding: 1px 5px;
    border: 1px solid var(--border-strong);
    border-bottom-width: 2px;
    border-radius: 4px;
    background: var(--bg-field);
  }
  .credit {
    padding: 8px 0;
    border-top: 1px solid var(--border);
  }
  .credit:first-child {
    border-top: none;
  }
  .credit a,
  .form a {
    color: var(--accent);
  }
  .credit .names {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
    overflow-wrap: anywhere;
  }
  .tag {
    display: inline-block;
    font-size: 10px;
    padding: 0 5px;
    border-radius: 3px;
    border: 1px solid currentColor;
    color: var(--warning);
    margin-left: 6px;
    vertical-align: 1px;
  }
  pre.report {
    margin: 0;
    padding: 8px;
    background: var(--bg-field);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    white-space: pre-wrap;
    font: 11px/1.5 var(--font-mono);
    max-height: 200px;
    overflow: auto;
    user-select: text;
  }
`;

/** A labelled row in a dialog form. */
export function field(label, ...controls) {
  return h('div', { class: 'field' }, h('span', { class: 'lbl', textContent: label }), h('div', { class: 'ctl' }, controls));
}

/**
 * Open a dialog.
 * @param {{heading: string, width?: string, content: Node | Node[], footer?: Node[], onClose?: (value: string) => void}} spec
 * @returns {any} the <mis-dialog> element (call `.close()` to dismiss)
 */
export function openDialog(spec) {
  const shell = /** @type {any} */ (document.querySelector('mis-app'));
  const host = shell.shadowRoot.getElementById('dialogs');
  const dialog = h('mis-dialog', { heading: spec.heading, width: spec.width ?? '' });
  dialog.append(...[spec.content].flat());
  for (const el of spec.footer ?? []) {
    el.slot = 'footer';
    dialog.append(el);
  }
  host.append(dialog);
  dialog.addEventListener('close', (e) => {
    // Nested dialogs' close events bubble through; only react to our own.
    if (e.target !== dialog) return;
    spec.onClose?.(e.detail?.value ?? '');
    dialog.remove();
  });
  // The element upgrades synchronously on insertion, but its template needs a tick.
  queueMicrotask(() => dialog.show());
  return dialog;
}

/** Ask a yes/no question. Resolves to true when confirmed. */
export function confirmDialog({ heading, message, confirm = 'OK', danger = false }) {
  return new Promise((resolve) => {
    let result = false;
    const ok = h('mis-button', { variant: danger ? 'outline' : 'primary', textContent: confirm });
    const cancel = h('mis-button', { variant: 'outline', textContent: 'Cancel' });
    const dialog = openDialog({
      heading,
      width: '380px',
      content: h('p', { style: 'margin:0', textContent: message }),
      footer: [cancel, ok],
      onClose: () => resolve(result),
    });
    ok.addEventListener('click', () => {
      result = true;
      dialog.close();
    });
    cancel.addEventListener('click', () => dialog.close());
  });
}
