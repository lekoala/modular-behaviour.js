import ModularBehaviour from "../modular-behaviour.js";
import jQuery from "jquery";
import test from "ava";

window.$ = window.jQuery = jQuery;
jQuery.fn.testPlugin = function (opts) {
  this.html("jquery");
  this.addClass(opts.test);
};

class TestClass {
  constructor(el, opts) {
    el.innerHTML = "test class";
  }
}
window["TestClass"] = TestClass; // It needs to be visible in global scope

const app = {
  testFunc: function (el, opts) {
    el.innerHTML = "test";
  },
  TestClass,
};
window["app"] = app;

test("it is registered", (t) => {
  let inst = customElements.get("modular-behaviour");
  t.is(inst, ModularBehaviour);
});

test("it runs functions", (t) => {
  window["testFunc"] = function (el, opts) {
    el.innerHTML = "test";
  };
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "testFunc");
  node.innerHTML = "<div>init</div>";
  document.appendChild(node);
  t.not(node.firstElementChild.innerHTML, "init");
  t.is(node.firstElementChild.innerHTML, "test");
  t.assert(node.classList.contains("modular-behaviour-initialized"));
});

test("it can have config", (t) => {
  window["testConfig"] = function (el, opts) {
    el.innerHTML = opts.value;
  };
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "testConfig");
  node.dataset.value = "test";
  node.innerHTML = "<div>init</div>";
  document.appendChild(node);
  t.not(node.firstElementChild.innerHTML, "init");
  t.is(node.firstElementChild.innerHTML, "test");
});

test("it can use a specific selector", (t) => {
  window["testSelector"] = function (el, opts) {
    el.innerHTML = "test";
  };
  let node = document.createElement("modular-behaviour");
  // we can use regular attributes
  node.name = "testSelector";
  node.selector = ".test";
  node.innerHTML = '<div>init</div><div class="test">init</div>';
  document.appendChild(node);
  t.is(node.firstElementChild.innerHTML, "init");
  t.not(node.firstElementChild.nextSibling.innerHTML, "init");
  t.is(node.firstElementChild.nextSibling.innerHTML, "test");
});

test("it can use an alternative function", (t) => {
  window["altFunction"] = function (el, opts) {
    el.innerHTML = "altFunction";
  };
  window["altFunctionConstructor"] = function (el, opts) {
    el.innerHTML = "altFunctionConstructor";
  };
  let node = document.createElement("modular-behaviour");
  // we can use regular attributes
  node.name = "altFunction";
  node.func = "altFunctionConstructor";
  node.innerHTML = "<div>init</div>";
  document.appendChild(node);
  t.not(node.firstElementChild.innerHTML, "init");
  t.not(node.firstElementChild.innerHTML, "altFunction");
  t.is(node.firstElementChild.innerHTML, "altFunctionConstructor");
});

test("it can have a templated config", (t) => {
  window["testTemplatedConfig"] = function (el, opts) {
    el.innerHTML = opts.value ?? "failed";
  };
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "testTemplatedConfig");
  node.setAttribute("config", "myconfig");
  node.innerHTML = "<div>init</div>";

  // need version 5.3.3
  // https://github.com/capricorn86/happy-dom/issues/451
  let template = document.createElement("template");
  template.classList.add("modular-behaviour-config");

  // in a browser env, you don't need bind to window, here in tests we run as module
  template.innerHTML = 'var myconfig = {value: "test"}; window["myconfig"] = myconfig;';

  node.appendChild(template);
  document.appendChild(node);

  const tpl = node.querySelector("template.modular-behaviour-config");
  const script = node.querySelector("script");

  t.truthy(tpl);
  t.truthy(script);
  t.not(node.firstElementChild.innerHTML, "failed");
  t.not(node.firstElementChild.innerHTML, "init");
  t.is(node.firstElementChild.innerHTML, "test");
});

test("it polls functions", (t) => {
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "testFunc2");
  node.innerHTML = "<div>init</div>";
  document.appendChild(node);
  t.assert(node.classList.contains("modular-behaviour-pending"));
  t.not(node.firstElementChild.innerHTML, "test");
  t.is(node.firstElementChild.innerHTML, "init");

  window["testFunc2"] = function (el, opts) {
    el.innerHTML = "test";
  };

  // We poll one element
  let inst = customElements.get("modular-behaviour");
  t.is(inst.watching().length, 1);

  // Wait more than polling and check if it works
  setTimeout(() => {
    t.is(node.firstElementChild.innerHTML, "test");
    t.assert(!node.classList.contains("modular-behaviour-pending"));
  }, 150);
});

test("it can init manually", (t) => {
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "manualFunc");
  node.innerHTML = "<div>init</div>";
  node.manual = true;
  document.appendChild(node);
  t.assert(node.classList.contains("modular-behaviour-pending"));
  t.is(node.firstElementChild.innerHTML, "init");

  let inst = customElements.get("modular-behaviour");
  // Polling is not triggered
  t.assert(!inst.watching().includes("manualFunc"));
});

test("it works with classes", (t) => {
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "TestClass");
  node.innerHTML = "<div>init</div>";
  document.appendChild(node);

  t.is(node.firstElementChild.innerHTML, "test class");
});

test("it runs namespaced functions", (t) => {
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "app.testFunc");
  node.innerHTML = "<div>init</div>";
  document.appendChild(node);
  t.not(node.firstElementChild.innerHTML, "init");
  t.is(node.firstElementChild.innerHTML, "test");
});

test("it works with namespaced classes", (t) => {
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "app.TestClass");
  node.innerHTML = "<div>init</div>";
  document.appendChild(node);

  t.is(node.firstElementChild.innerHTML, "test class");
});

test("it works with jQuery plugins", (t) => {
  let node = document.createElement("modular-behaviour");
  node.setAttribute("name", "$.testPlugin");
  node.dataset.test = "val";
  node.innerHTML = "<div>init</div>";
  document.appendChild(node);
  t.not(node.firstElementChild.innerHTML, "init");
  t.is(node.firstElementChild.innerHTML, "jquery");
  // it propagate config
  t.assert(node.firstElementChild.classList.contains("val"));
});
