"use strict";

const PREFIX = "modular-behaviour";
/**
 * @var {number}
 */
let idx = 0;
/**
 * @var {object}
 */
let watchList = {};
/**
 * @var {number}
 */
let timeoutCounter = 0;
let timeout = null;
/**
 * @var {Function}
 */
let timer = () => {
  const res = ModularBehaviour.scanWatchList();
  if (res) {
    // Everything is loaded, don't set timeout again
    return;
  }
  if (timeoutCounter < 100) {
    // 10 times at 10ms
    timeoutCounter += 10;
  } else {
    // 20 times at 100ms
    timeoutCounter += 100;
  }

  if (timeoutCounter < 2000) {
    timeout = setTimeout(timer, timeoutCounter);
  } else {
    console.warn(`Unable to load ${ModularBehaviour.watching().join(",")}`);
    watchList = {}; // reset list
    timeout = null; // clear timeout id
  }
};

// Extra check on top of the regular poll timer
window.addEventListener("DOMContentLoaded", () => {
  ModularBehaviour.scanWatchList();
});

/**
 * Easily bind js behaviour to your html nodes
 */
class ModularBehaviour extends HTMLElement {
  constructor() {
    super();
    idx++;
  }

  set name(value) {
    this.setAttribute("name", value);
  }

  get name() {
    return this.getAttribute("name");
  }

  set selector(value) {
    this.setAttribute("selector", value);
  }

  get selector() {
    return this.getAttribute("selector");
  }

  set func(value) {
    this.setAttribute("func", value);
  }

  get func() {
    return this.getAttribute("func");
  }

  set config(value) {
    this.setAttribute("config", value);
  }

  get config() {
    return this.getAttribute("config");
  }

  set manual(value) {
    if (value) {
      this.setAttribute("manual", "");
    } else {
      this.removeAttribute("manual");
    }
  }

  get manual() {
    return this.hasAttribute("manual");
  }

  /**
   * This allows loading arbitrary template into script
   * @param {HTMLTemplateElement} el
   */
  loadConfigTemplate(el) {
    const s = document.createElement("script");
    s.textContent = el.content.textContent;
    this.appendChild(s);
  }

  /**
   * Resolve config by checking the global or namespace scope and merge with data attributes
   * @param {object} config
   * @returns {object}
   */
  resolveConfig(config = {}) {
    // Load config from js var
    if (this.config) {
      config = ModularBehaviour.globalValue(this.config);
      if (!config) {
        console.warn(`${this.config} is not available`);
        config = {};
      }
      if (typeof config === "function") {
        config = config();
      }
    }
    // Merge data attribute
    config = Object.assign(config, this.dataset);
    return config;
  }

  /**
   * Find value in the global or namespaced scope
   * @param {string} name
   * @returns {Function|object|null}
   */
  static globalValue(name) {
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

  /**
   * Global watcher that can watch multiple functions until they are defined
   * @param {string} name
   * @param {Function} cb
   */
  static watch(name, cb) {
    // Check for a provider script for a faster result than polling
    const script = document.querySelector(`script[provides="${name}"]`);
    if (script) {
      const prevOnload = script.onload;
      script.onload = (e) => {
        if (prevOnload) {
          prevOnload(e);
        }
        const constructor = ModularBehaviour.globalValue(name);
        if (constructor) {
          cb(constructor);
        }
      };
      return;
    }

    // Or use poll logic for all callbacks under the same name
    if (!watchList[name]) {
      watchList[name] = [];
    }
    watchList[name].push(cb);
    // Set a progressive timer for all, but always reset counter
    timeoutCounter = 10;
    if (!timeout) {
      // This allows us to wait for delayed init due to async js loading, etc.
      timer();
    }
  }

  /**
   * Scan watch list if global value is available
   * @returns {bool} true when watch list is empty
   */
  static scanWatchList() {
    for (var n in watchList) {
      const constructor = ModularBehaviour.globalValue(n);
      if (constructor) {
        // init all pending
        for (var cb of watchList[n]) {
          cb(constructor);
        }
        delete watchList[n];
      }
    }
    // everything is cleared, return true and clear timeout if needed
    if (!Object.keys(watchList).length) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      return true;
    }
    return false;
  }

  /**
   * Manually runs through all nodes
   * @param {string} name
   * @returns {bool}
   */
  static run(name) {
    const constructor = ModularBehaviour.globalValue(name);
    if (!constructor) {
      return false;
    }
    document.querySelectorAll(`modular-behaviour[name="${name}"]`).forEach((el) => {
      if (el.classList.contains(`${PREFIX}-initialized`)) {
        return;
      }
      el.init(constructor);
    });
    return true;
  }

  /**
   * @returns {array}
   */
  static watching() {
    return Object.keys(watchList);
  }

  /**
   * @link https://stackoverflow.com/questions/29093396/how-do-you-check-the-difference-between-an-ecmascript-6-class-and-function
   * @param {Function} fn
   * @returns {bool}
   */
  static isConstructable(fn) {
    try {
      new new Proxy(fn, { construct: () => ({}) })();
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * @param {Function} constructor
   */
  init(constructor) {
    const configTemplate = this.querySelector(`template.${PREFIX}-config`);
    let config = {};
    if (configTemplate) {
      // Without config, it's parsed as json
      if (!this.config) {
        config = JSON.parse(configTemplate.content.textContent);
      } else {
        this.loadConfigTemplate(configTemplate);
      }
    }
    // Fetch first valid node or selector
    const el = this.selector ? this.querySelector(this.selector) : this.firstElementChild;
    if (!el) {
      console.warn("No element");
      return;
    }

    // Set a default id
    if (!el.hasAttribute("id")) {
      el.setAttribute("id", `${PREFIX}-${idx}`);
    }

    // Override constructor
    if (this.func) {
      constructor = ModularBehaviour.globalValue(this.func);
      if (!constructor) {
        console.warn(`${this.func} is not available`);
        return;
      }
    }

    // Instantiate class or function. ES6 Classes must use "new" keyword.
    const isClass = ModularBehaviour.isConstructable(constructor);
    let instance;
    if (isClass) {
      new constructor(el, this.resolveConfig(config));
    } else {
      Object.create(constructor.prototype || constructor);
      constructor.apply(instance, [el, this.resolveConfig(config)]);
    }

    // Register init class
    this.classList.remove(`${PREFIX}-pending`);
    this.classList.add(`${PREFIX}-initialized`);
  }

  connectedCallback() {
    // Look for the class or function to instantiate
    const constructor = ModularBehaviour.globalValue(this.name);
    if (!constructor) {
      this.classList.add(`${PREFIX}-pending`);
      // Need to call `run` manually
      if (this.manual) {
        return;
      }
      // Watch until defined
      ModularBehaviour.watch(this.name, (constructor) => {
        this.init(constructor);
      });
      return;
    }
    this.init(constructor);
  }
}

customElements.define("modular-behaviour", ModularBehaviour);

export default ModularBehaviour;
