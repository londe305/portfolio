/* =====================================================
   utils.js — Tiny shared DOM helpers (ES module)
   Replaces the old window.$ / window.$$ global polyfills.
===================================================== */

const memoryStorage = new Map();

function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Ignore storage access errors in restricted contexts.
  }

  return {
    getItem(key) {
      return memoryStorage.has(key) ? memoryStorage.get(key) : null;
    },
    setItem(key, value) {
      memoryStorage.set(key, String(value));
      return true;
    },
    removeItem(key) {
      memoryStorage.delete(key);
      return true;
    }
  };
}

export const safeStorage = {
  getItem(key) {
    try {
      return getStorage().getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      const storage = getStorage();
      storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  getJSON(key, fallback = null) {
    const raw = this.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  setJSON(key, value) {
    return this.setItem(key, JSON.stringify(value));
  },
  removeItem(key) {
    try {
      getStorage().removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

export const $  = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
