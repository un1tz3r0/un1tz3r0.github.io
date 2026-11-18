// The application context: one editor, the tool registry and the services, shared by the
// container elements. Leaf widgets in `ui/kit` never import this.

import { Editor } from './core/editor.js';

export const editor = new Editor();

/**
 * @type {{
 *   editor: Editor,
 *   canvas: any,
 *   tools: Map<string, import('./tools/base.js').Tool>,
 *   services: Record<string, any>,
 * }}
 */
export const app = {
  editor,
  /** The <mis-canvas> element, once mounted. */
  canvas: null,
  tools: new Map(),
  services: {},
};

/** @param {typeof import('./tools/base.js').Tool} ToolClass */
export function registerTool(ToolClass) {
  if (app.tools.has(ToolClass.id)) throw new Error(`Tool "${ToolClass.id}" is already registered`);
  app.tools.set(ToolClass.id, new ToolClass(app));
}

/** The tool instance currently selected in the palette. */
export function activeTool() {
  return app.tools.get(editor.store.get('tool'));
}

/** Platform check used when formatting shortcuts. */
export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? '');
