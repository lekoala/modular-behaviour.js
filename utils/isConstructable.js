"use strict";

/**
 * @link https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function
 * @param {Function} fn
 * @returns {bool}
 */
export default function isConstructable(fn) {
  try {
    new new Proxy(fn, { construct: () => ({}) })();
    return true;
  } catch (err) {
    return false;
  }
}
