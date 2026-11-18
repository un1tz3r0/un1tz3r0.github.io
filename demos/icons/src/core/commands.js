// Command registry.
//
// Every user-visible operation is a command. Menus, toolbar buttons, context menus and
// keyboard shortcuts all dispatch by id, so there is one implementation and one
// enabled-state rule per operation.

/**
 * @typedef {object} Command
 * @property {string} id
 * @property {string} label
 * @property {string} [shortcut]   e.g. "Mod+Shift+Z", "Delete", "V"
 * @property {string[]} [aliases]  additional shortcuts
 * @property {string} [icon]
 * @property {string} [group]      for the shortcut help overlay
 * @property {(ctx: any) => boolean} [enabled]
 * @property {(ctx: any, args?: any) => any} run
 */

const MOD_ORDER = ['Mod', 'Alt', 'Shift'];

/** Canonical form of a shortcut string: modifiers in a fixed order, key upper-cased. */
export function normalizeShortcut(shortcut) {
  const parts = shortcut.split('+').map((p) => p.trim()).filter(Boolean);
  // A trailing "+" key ("Mod++") loses its key to the split.
  if (shortcut.trim().endsWith('+')) parts.push('+');
  const key = parts.pop() ?? '';
  const mods = MOD_ORDER.filter((m) => parts.some((p) => p.toLowerCase() === m.toLowerCase()));
  return [...mods, key.length === 1 ? key.toUpperCase() : key].join('+');
}

/**
 * The canonical shortcut string for a keyboard event.
 * @param {{key: string, ctrlKey?: boolean, metaKey?: boolean, altKey?: boolean, shiftKey?: boolean}} e
 */
export function shortcutFromEvent(e) {
  let key = e.key;
  if (key === ' ') key = 'Space';
  if (key === 'Control' || key === 'Meta' || key === 'Alt' || key === 'Shift') return '';
  const mods = [];
  if (e.ctrlKey || e.metaKey) mods.push('Mod');
  if (e.altKey) mods.push('Alt');
  // Shift is part of the identity of named keys and letters, but for punctuation the
  // shifted character already says it ("?" rather than "Shift+/").
  if (e.shiftKey && (key.length > 1 || /[a-z0-9]/i.test(key) || mods.length > 0)) mods.push('Shift');
  return [...mods, key.length === 1 ? key.toUpperCase() : key].join('+');
}

/** A shortcut as it should be shown to the user on this platform. */
export function formatShortcut(shortcut, isMac = false) {
  if (!shortcut) return '';
  return normalizeShortcut(shortcut)
    .split('+')
    .map((p) => {
      if (p === 'Mod') return isMac ? '⌘' : 'Ctrl';
      if (p === 'Alt') return isMac ? '⌥' : 'Alt';
      if (p === 'Shift') return isMac ? '⇧' : 'Shift';
      if (p === 'ArrowLeft') return '←';
      if (p === 'ArrowRight') return '→';
      if (p === 'ArrowUp') return '↑';
      if (p === 'ArrowDown') return '↓';
      if (p === '') return '+';
      return p;
    })
    .join(isMac ? '' : '+');
}

/** @param {any} ctx  passed to every `enabled` and `run` */
export function createCommands(ctx) {
  /** @type {Map<string, Command>} */
  const byId = new Map();
  /** @type {Map<string, string>} */
  const byShortcut = new Map();

  return {
    /** @param {Command | Command[]} command */
    register(command) {
      for (const cmd of Array.isArray(command) ? command : [command]) {
        if (byId.has(cmd.id)) throw new Error(`commands: duplicate id "${cmd.id}"`);
        byId.set(cmd.id, cmd);
        for (const sc of [cmd.shortcut, ...(cmd.aliases ?? [])]) {
          if (sc) byShortcut.set(normalizeShortcut(sc), cmd.id);
        }
      }
    },
    get: (id) => byId.get(id),
    list: () => [...byId.values()],
    isEnabled(id) {
      const cmd = byId.get(id);
      if (!cmd) return false;
      return cmd.enabled ? !!cmd.enabled(ctx) : true;
    },
    /** Run a command if it exists and is enabled. Returns whether it ran. */
    run(id, args) {
      const cmd = byId.get(id);
      if (!cmd) throw new Error(`commands: unknown command "${id}"`);
      if (cmd.enabled && !cmd.enabled(ctx)) return false;
      cmd.run(ctx, args);
      return true;
    },
    /** The command id bound to a keyboard event, if any. */
    forEvent(e) {
      const sc = shortcutFromEvent(e);
      return sc ? byShortcut.get(sc) : undefined;
    },
  };
}
