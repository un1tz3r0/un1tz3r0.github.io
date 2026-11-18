// Observable application state.
//
// State is one immutable object made of slices. `set` replaces slices; subscribers
// register a selector and are called only when the selected value changes by identity.
// Notifications are synchronous, so a subscriber always sees the state that caused it;
// `batch` coalesces several `set` calls into one round of notifications.

/**
 * @template S
 * @param {S} initial
 */
export function createStore(initial) {
  /** @type {S} */
  let state = initial;
  /** @type {Set<{selector: (s: S) => any, cb: Function, value: any}>} */
  const subs = new Set();
  let batchDepth = 0;
  let dirty = false;

  function notify() {
    if (batchDepth > 0) {
      dirty = true;
      return;
    }
    dirty = false;
    for (const sub of [...subs]) {
      if (!subs.has(sub)) continue;
      const value = sub.selector(state);
      if (!Object.is(value, sub.value)) {
        const previous = sub.value;
        sub.value = value;
        sub.cb(value, previous);
      }
    }
  }

  return {
    /** The whole state, or one slice of it. */
    get(key) {
      return key === undefined ? state : state[key];
    },

    /**
     * Merge a patch (or the result of an updater) into the state.
     * @param {Partial<S> | ((s: S) => Partial<S>)} patch
     */
    set(patch) {
      const delta = typeof patch === 'function' ? patch(state) : patch;
      if (!delta) return;
      let changed = false;
      for (const key of Object.keys(delta)) {
        if (!Object.is(delta[key], state[key])) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      state = { ...state, ...delta };
      notify();
    },

    /** Run `fn`, delivering at most one round of notifications afterwards. */
    batch(fn) {
      batchDepth++;
      try {
        fn();
      } finally {
        batchDepth--;
        if (batchDepth === 0 && dirty) notify();
      }
    },

    /**
     * @param {keyof S | ((s: S) => any)} selector  a slice name or a selector function
     * @param {(value: any, previous: any) => void} cb
     * @param {{signal?: AbortSignal, immediate?: boolean}} [opts]
     * @returns {() => void} unsubscribe
     */
    subscribe(selector, cb, opts = {}) {
      const select = typeof selector === 'function' ? selector : (s) => s[selector];
      const sub = { selector: select, cb, value: select(state) };
      subs.add(sub);
      const off = () => subs.delete(sub);
      if (opts.signal) {
        if (opts.signal.aborted) off();
        else opts.signal.addEventListener('abort', off, { once: true });
      }
      if (opts.immediate) cb(sub.value, undefined);
      return off;
    },
  };
}
