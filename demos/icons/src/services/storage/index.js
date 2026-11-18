// IndexedDB persistence: documents (autosave), settings, icon recents/favorites, uploaded
// fonts. A thin promise wrapper; every method resolves to `undefined`/`[]` rather than
// throwing when storage is unavailable (private windows, blocked site data), so the app
// keeps working without persistence.

const DB_NAME = 'mis';
const DB_VERSION = 1;
const STORES = ['documents', 'settings', 'iconRecents', 'iconFavorites', 'fonts'];

/** @type {Promise<IDBDatabase | null> | null} */
let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
  return dbPromise;
}

/**
 * @template T
 * @param {string} store
 * @param {IDBTransactionMode} mode
 * @param {(s: IDBObjectStore) => IDBRequest<T>} fn
 * @param {T} [fallback]
 * @returns {Promise<T>}
 */
async function run(store, mode, fn, fallback) {
  const db = await open();
  if (!db) return fallback;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(store, mode);
      const request = fn(tx.objectStore(store));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(fallback);
      tx.onabort = () => {
        // Running out of space is the one failure the user can do something about.
        if (tx.error?.name === 'QuotaExceededError') globalThis.dispatchEvent?.(new Event('mis-storage-error'));
        resolve(fallback);
      };
    } catch {
      resolve(fallback);
    }
  });
}

export const storage = {
  /** @returns {Promise<any>} */
  get: (store, key) => run(store, 'readonly', (s) => s.get(key), undefined),
  set: (store, key, value) => run(store, 'readwrite', (s) => s.put(value, key), undefined),
  delete: (store, key) => run(store, 'readwrite', (s) => s.delete(key), undefined),
  /** @returns {Promise<any[]>} */
  values: (store) => run(store, 'readonly', (s) => s.getAll(), []),
  /** @returns {Promise<IDBValidKey[]>} */
  keys: (store) => run(store, 'readonly', (s) => s.getAllKeys(), []),
  clear: (store) => run(store, 'readwrite', (s) => s.clear(), undefined),

  /** Ask the browser not to evict our data under storage pressure. */
  async persist() {
    try {
      if (await navigator.storage?.persisted?.()) return true;
      return (await navigator.storage?.persist?.()) ?? false;
    } catch {
      return false;
    }
  },

  /** @returns {Promise<{usage: number, quota: number} | null>} */
  async estimate() {
    try {
      const e = await navigator.storage?.estimate?.();
      return e ? { usage: e.usage ?? 0, quota: e.quota ?? 0 } : null;
    } catch {
      return null;
    }
  },
};

// --- settings ------------------------------------------------------------------------------

const settingsCache = new Map();

/** Read a setting (cached after the first read). */
export async function getSetting(key, fallback) {
  if (settingsCache.has(key)) return settingsCache.get(key);
  const value = await storage.get('settings', key);
  const result = value === undefined ? fallback : value;
  settingsCache.set(key, result);
  return result;
}

export function setSetting(key, value) {
  settingsCache.set(key, value);
  return storage.set('settings', key, value);
}

// --- documents -----------------------------------------------------------------------------

/**
 * Save a document under its id, with a small summary for the "recent" list.
 * @param {import('../../core/model/nodes.js').Doc} doc
 * @param {{view?: any, thumbnail?: string}} [extra]
 */
export function saveDocument(doc, extra = {}) {
  return storage.set('documents', doc.id, { id: doc.id, name: doc.name, updated: Date.now(), doc, ...extra });
}

/** @returns {Promise<{id:string, name:string, updated:number, doc:any, view?:any, thumbnail?:string}[]>} newest first */
export async function listDocuments() {
  const all = await storage.values('documents');
  return all.sort((a, b) => b.updated - a.updated);
}

export const loadDocument = (id) => storage.get('documents', id);
export const deleteDocument = (id) => storage.delete('documents', id);
