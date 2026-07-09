/* =====================================================
   utils.js — Tiny shared DOM helpers (ES module)
   Replaces the old window.$ / window.$$ global polyfills.
===================================================== */

export const $  = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
