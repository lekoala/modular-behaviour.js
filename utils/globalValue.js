"use strict";

/**
 * Find value in the global or namespaced scope
 * @param {string} name
 * @returns {Function|object|null}
 */
export default function globalValue(name) {
  if (!name) {
    return null;
  }
  if (name.includes(".")) {
    const parts = name.split(".");
    const ns = parts[0];
    const func = parts[1];
    const scope = window[ns];
    if (!scope) {
      return;
    }
    // Wrap jQuery in a constructor function
    if ((ns === "$" || ns === "jQuery") && typeof window.jQuery.fn[func] !== "undefined") {
      return (el, opts) => {
        window.jQuery.fn[func].call(window.jQuery(el), opts);
      };
    }
    return scope[func] || null;
  }
  return window[name] || null;
}
