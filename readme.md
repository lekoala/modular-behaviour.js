# modular-behaviour.js

[![NPM](https://nodei.co/npm/modular-behaviour.js.png?mini=true)](https://nodei.co/npm/modular-behaviour.js/) 
[![Downloads](https://img.shields.io/npm/dt/modular-behaviour.js.svg)](https://www.npmjs.com/package/modular-behaviour.js)

## About

This library helps you to simply attach functions or jQuery plugins to dom nodes.

## How to use

### General use

Simply define a data-mb attribute with the name of the function on your nodes

```html
<div data-mb="myJqueryPlugin"></div>
<div data-mb="myGlobalFunction"></div>
```

WARNING : module names are CaSe SenSitiVe! For instance, jquery datable needs to use DataTable

Then, all you need to do is to run the script:

```js
ModularBehaviour.run();
```

If you are not using deferred scripts (hint: you should be), you can call init() that will wrap the run
call in a dom ready callback:

```js
ModularBehaviour.init();
```

Be aware that this will trigger on dom ready. Therefore, any requirements (maybe you will load other scripts later)
need to be loaded BEFORE calling this. If this is not possible, you can fallback to:

```js
ModularBehaviour.load();
```

This will trigger on page load instead. It's slower (because it waits for all scripts to be loaded and parsed, including css)
but safer.

### Configure plugins or set options

You can set options through the data attributes

```html
<div data-mb="myJqueryPlugin" data-mb-myJqueryPlugin-options=""></div>
```

Or simply, if you have only one handler

```html
<div data-mb="myJqueryPlugin" data-mb-options=""></div>
```

### Namespaced plugins

You can also namespace your plugins using dot notation

### Available types of options

Json strings (make sure to escape everything properly or wrap in single quotes)

```html
<div data-mb="myJqueryPlugin" data-mb-options='{"configKey": "configValue"}'></div>
```

External json stored in a html node (in can be a div or anything)

```html
<div id="myDiv" style="display:none">{"configKey": "configValue"}</div>
<div data-mb="myJqueryPlugin" data-mb-options="#myDiv"></div>
```

Global callback (need to be loaded before run())

```html
<div data-mb="myJqueryPlugin" data-mb-options="myOptions()"></div>
```

### Define multiple functions or plugins

You can add multiple handlers, simply add a space between each

```html
<div data-mb="handler1 handler2" data-handler1-options="" data-handler2-options=""></div>
```

### Add option transformers

Sometimes you want to apply so default options to all modules. You can achieve this
by defining an option transform

```js
ModularBehaviour.addOptionsTransformer('myModule',function(opts,el) { // modify here the options object });
```

The options object passed is as collected for the given node.

A typical use case is to apply custom data attribute to the config

```js
ModularBehaviour.addOptionsTransformer('myModule',function(opts,el) {
    if(el.dataset.thisOption) {
        opts.thatOption = el.dataset.thisOption;
    }
});
```

### Add after init hooks

Not all modules or javascript libs let you configure everything through options. Sometimes
you need to call methods. This is possible using afterInitHooks.

```js
ModularBehaviour.addAfterInitHook('myModule',function(inst, el, opts) { 
    // call what you need on module instance 
    // inst : the instantianted class or jquery plugin
    // el : the html node
    // opts : the options object
});
```

### Handling updates

But what if the document changes due to some external updates or an ajax load ?

You can simply run

```js
ModularBehaviour.run();
```

With jQuery you can do something like

```js
// after each successfull ajax request, try to init modules again
$(document).ajaxSuccess(function (event, xhr, settings) {
    ModularBehaviour.run();
});
```

Please be aware that all requirements should be loaded and available.
If you need to load extra scripts before running your modules, you may
need extra configuration.

### Set globa config options

You can also set config options, this can be used to enable debug mode

```js
ModularBehaviour.setConfig('debug',true);
```
