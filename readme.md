# modular-behaviour.js

[![NPM](https://nodei.co/npm/modular-behaviour.js.png?mini=true)](https://nodei.co/npm/modular-behaviour.js/)
[![Downloads](https://img.shields.io/npm/dt/modular-behaviour.js.svg)](https://www.npmjs.com/package/modular-behaviour.js)

Bind js behaviours (js classes, functions, jquery plugins...) to your dom nodes.

NOTE: the v3 contains significant changes over the previous versions. Check branch 2 if you want to use the previous stuff.

## What does this library solve ?

This library act as a glue between your js libraries and your html document. It will allow to initialize most things
out of the box by using a custom element. The V3 use the custom element because it's self initializing (and can delay itself it's initialization)
which is a big advantage over watching the dom for changes.

## General use

Simply wrap your html node with <modular-behaviour>

```html
<modular-behaviour name="myGlobalFunction" data-someconfig="test">
  <div class="somenode">Some content here</div>
</modular-behaviour>
```

WARNING : module names are CaSe SenSitiVe! For instance, jquery datable needs to use DataTable
or FilePond needs a uppercase P.

If the function `myGlobalFunction` is defined in the global scope, it will be called with two parameters:

- the element (by default, the first child element of the custom element)
- a config array (the data attributes on the custom elements)

## Namespaced plugins

Avoid polluting the global namespace by defining a App namespace.

```html
<modular-behaviour name="App.myFunction" data-someconfig="test">
  <div class="somenode">Some content here</div>
</modular-behaviour>
```

## Init / pending classes

## Advanced configuration

## Manual init

## Supported attributes

## Demo

Please check `demo.html` for some sample usages
