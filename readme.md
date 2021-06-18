# modular-behaviour.js

[![NPM](https://nodei.co/npm/modular-behaviour.js.png?mini=true)](https://nodei.co/npm/modular-behaviour.js/)
[![Downloads](https://img.shields.io/npm/dt/modular-behaviour.js.svg)](https://www.npmjs.com/package/modular-behaviour.js)

## About

This library helps you to simply attach functions or jQuery plugins to dom nodes.

## How to use

### General use

Simply define a data-mb attribute with the name of the function on your nodes

```html
<script>
function myGlobalFunction(element, options) {
    element.textContent = "Initialized!";
}
</script>
<div data-mb="myJqueryPlugin"></div>
<div data-mb="myGlobalFunction"></div>
```

WARNING : module names are CaSe SenSitiVe! For instance, jquery datable needs to use DataTable
or FilePond needs a uppercase P.

Then simply run the init method. You can pass an optional config array to set config values.

```js
ModularBehaviour.init();
```

NOTE: the init method should be called after all your configurations are set. If you
use options transformers or after init hooks, make sure they are defined before the
nodes are added to the dom.

### Configure plugins or set options

You can set options through the data attributes

```html
<div data-mb="myJqueryPlugin" data-mb-myJqueryPlugin-options=""></div>
```

Or simply, if you have only one handler, use the global mb-options

```html
<div data-mb="myJqueryPlugin" data-mb-options=""></div>
```

NOTE: jQuery is optional ! you can use this library with vanilla javascript without worries!

### Namespaced plugins

You can also namespace your plugins using dot notation. Nested namespaces are not supported.

```html
<div data-mb="App.myFunc" data-mb-options=""></div>
```

### Use factory

Some libs use a factory method (like `create`). These can be used using the : notation.

```html
<div data-mb="FilePond:create" data-mb-options=""></div>
```

Another trick is that some libs expect a selector as the first argument while other
expect an html element. For instance:

```js
// Cleave expect a selector
var cleave = new Cleave(".input-element", {
  date: true,
  delimiter: "-",
  datePattern: ["Y", "m", "d"],
});
// FilePond expect an element
FilePond.create(document.querySelector("input"));
```

ModularBehaviour always passes the element as the first argument. If you need to use a selector,
wrap the call in a global function (in this case, it's fine since Cleave also supports an HTMLElement
as the first argument).

### Available types of options

Json strings (make sure to escape everything properly or wrap in single quotes)

```html
<div data-mb="myJqueryPlugin" data-mb-options='{"configKey": "configValue"}'></div>
```

Or if you don't like single quotes, you can use base64 encoded strings

```html
<div data-mb="myJqueryPlugin" data-mb-options="base64:eyJkYXRlIjp0cnVlLCJkZWxpbWl0ZXIiOiItIiwiZGF0ZVBhdHRlcm4iOlsiWSIsIm0iLCJkIl19"></div>
```

External json stored in a html node. It can be a div or anything, but we recommend
a template element since they are hidden by default (not on IE11! don't forget template { display:none }).

```html
<template id="myTemplate">{"configKey": "configValue"}</template>
<div id="myDiv" style="display:none">{"configKey": "configValue"}</div>
<div data-mb="myJqueryPlugin" data-mb-options="#myDiv"></div>
```

Global callback (need to be loaded before init)

```html
<div data-mb="App.plugin" data-mb-options="myOptions()"></div>
```

### Define multiple functions or plugins

You can add multiple handlers, simply add a space between each

```html
<div data-mb="handler1 handler2" data-handler1-options="" data-handler2-options=""></div>
```

### Add option transformers

Sometimes you want to apply some default options to all modules. You can achieve this
by defining an option transformer

```js
ModularBehaviour.addOptionsTransformer("myModule", function (opts, el) {
  // modify here the options object
});
```

The options object passed is as collected for the given node.

A typical use case is to apply custom data attribute to the config

```js
ModularBehaviour.addOptionsTransformer("myModule", function (opts, el) {
  // opts is mutable so no need to return it
  if (el.dataset.thisOption) {
    opts.thatOption = el.dataset.thisOption;
  }
});
```

### Add after init hooks

Not all modules or javascript libs let you configure everything through options. Sometimes
you need to call methods. This is possible using afterInitHooks.

```js
ModularBehaviour.addAfterInitHook("myModule", function (inst, el, opts) {
  // call what you need on module instance
  // inst : the instantianted class or jquery plugin
  // el : the html node
  // opts : the options object
});
```

### Handling updates

But what if the document changes due to some external updates or an ajax load ?

ModularBehaviour now includes a MutationObserver which will init nodes if
they have the data-mb attribute. So everything is handled automatically once
you have run the `init` method.

Since we watch the whole body, maybe there are a lot of mutations happening.
If this is an issue for you, you can disable this option.

```js
ModularBehaviour.setConfig("observeDom", false);
```

It also means that it's up to you to use the `run` method each time you
add new nodes (eg: after an ajax load).

### Set global config options

You can also set config options, this can be used to enable debug mode

```js
ModularBehaviour.setConfig("debug", true);
```

Here are the available config options:

- attr: "data-mb"
- failedClass: "mb-failed"
- initClass: "mb-init"
- optionsKey: "options"
- maxTries: 3
- retryInterval: 250
- observeDom: true
- debug: false