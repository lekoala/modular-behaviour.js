# modular-behaviour.js

[![NPM](https://nodei.co/npm/modular-behaviour.js.png?mini=true)](https://nodei.co/npm/modular-behaviour.js/)
[![Downloads](https://img.shields.io/npm/dt/modular-behaviour.js.svg)](https://www.npmjs.com/package/modular-behaviour.js)

Bind js behaviours (js classes, functions, jquery plugins...) to your dom nodes.

NOTE: the v3 contains significant changes over the previous versions. Check branch 2 if you want to use the previous stuff.

## What does this library solve ?

This library act as a glue between your js libraries and your html document. It will allow to initialize most things
out of the box by using a custom element. The V3 use a custom element because it's self initializing which is a big advantage over watching the dom for changes.
You basically get "watching the dom" for free and get a clearer separation by not manipulating the html node itself.

A minor downside is that you add a extra html node, and therefore it may affect styling (eg: direct > selectors).

## General use

Simply wrap your html node with <modular-behaviour>

```html
<modular-behaviour name="myGlobalFunction" data-someconfig="test">
  <div class="somenode">Some content here</div>
</modular-behaviour>
```

If the function `myGlobalFunction` is defined in the global scope, it will be called with two parameters:

- the element (by default, the first child element of the custom element)
- a config array (the data attributes on the custom elements)

WARNING : module names are CaSe SenSitiVe! For instance, jquery datable needs to use DataTable
or FilePond needs a uppercase P.

### What if my arguments are different ?

Indeed, this library expect the very classic (el, opts) convention. If you have a function using other
arguments (eg: selector, opt1, opt2) you need to wrap that function into another function that accepts
(el, opts) instead.

## Namespaced plugins

Avoid polluting the global namespace by defining a App namespace.

```html
<modular-behaviour name="App.myFunction" data-someconfig="test">
  <div class="somenode">Some content here</div>
</modular-behaviour>
```

## Load order

One of the nice thing with this library is that load order doesn't matter.
You can define your html first, then load the js. Or the opposite.

### Js first

The javascript function is already available in the global scope and can be called.
This will not be the case if you defer the loading of your scripts or use js modules.

The js function is immediately triggered when the custom element is ready.

### Js second

If you deferred (or async) the loading of the js code, the html node may be defined before
the js function responsible for initializing the html node is available.

As a first measure, we try to initialize everything on domReady.

After that, the callback is added to a watch list.
We poll the scope (fast first, then slower) until the callback function is available.
If polling doesn't result in any result after a certain time, it stops.

### Provider scripts

Polling the scope is not ideal. It's much better to know WHEN the js callback is made available and
run only when ready.

You can add a `provides` attribute to a script. Onload, it will trigger all matching nodes.

```html
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js" type="module" provides="jQuery.select2"></script>
```

## Init / pending classes

While loading, the nodes get a `modular-behaviour-pending` class. Once initialized,
they get a `modular-behaviour-initialized` class. This can help dealing with loading/init states.

```css
modular-behaviour {
  visibility: hidden;
}
modular-behaviour.modular-behaviour-initialized {
  visibility: visible;
}
```

## Advanced configuration

### Using data attributes

The default way to deal with configuration is through data attributes in the modular-behaviour element.
They will be passed on as an array to the constructor function.

### Using json config

You can also add a custom config a json in a template with the class `modular-behaviour-config`.
It is recommended to put the template at the end of the element.

```html
<modular-behaviour name="Cleave">
  <input class="input-date-a" placeholder="YYYY-MM-DD" type="tel" />
  <template class="modular-behaviour-config">{"myconfig": "test"}</template>
</modular-behaviour>
```

### Using custom script

Json is nice, but it's limited in the way it can express callbacks for example. A more powerful alternative
is to load the configuration from a variable or a function.

When doing so, instead of being loaded as json, the config will be injected as a js script.

The script is executed after the function is available, but before its called.

```html
<modular-behaviour name="Cleave" config="myconfig">
  <input class="input-date-a" placeholder="YYYY-MM-DD" type="tel" />
  <template class="modular-behaviour-config">var myconfig = {myconfig: "test"} ; // my config</template>
</modular-behaviour>
```

## Manual lookup

If you don't want to use the automatic system that look for a function, you can initialize things yourself.

```html
<modular-behaviour name="yetToDefine" manual>
  <div>init</div>
</modular-behaviour>
```

Then call

```js
window["yetToDefine"] = function (el, opts) {};
customElements.get("modular-behaviour").run("yetToDefine");
```

NOTE: manual lookup still initialize everything automatically if `yetToDefine` is available when the custom
element is loaded. It only prevents the polling of the scope to let you determine when the dependencies for this
element are indeed loaded.

## Lazy init

But what if you html nodes are not visible, because you have a long page or tabs ? Wouldn't it be a waste to initialize them
immediately ?

Indeed! This is why you can set a lazy attribute.

```html
<modular-behaviour name="imLazy" lazy>
  <div></div>
</modular-behaviour>
```

In this example, `imLazy` will only be looked for when the node is actually visible.

NOTE: lazy elements don't get a pending class (that is specific for elements waiting to be initialized due to a missing callback
in the global scope).

## Self contained elements

You can go one step further than lazy loading, you can actually let modular behaviour load your js modules. It only requires that
you set a `src` attribute that points to a js file that export default the class you want to load.

Here is an example using my bootstrap5-tags library.

```html
<modular-behaviour name="Tags" src="https://cdn.jsdelivr.net/npm/bootstrap5-tags@1.4.35/tags.min.js" lazy>
  <select class="form-select" id="tags" name="tags[]" multiple data-allow-clear="1" required>
    <option selected="selected" disabled hidden value="">Choose a tag...</option>
    <option value="1" selected="selected">Apple</option>
    <option value="2">Banana</option>
    <option value="3">Orange</option>
  </select>
</modular-behaviour>
```

## Supported attributes

| Name     | Default | Description                                                                                             |
| -------- | ------- | ------------------------------------------------------------------------------------------------------- |
| name     | null    | The name of the function to call in the global scope. It can be nested (eg: App.Func)                   |
| config   | null    | The name of the var or function that provides the configuration                                         |
| manual   | false   | Don't use auto init system                                                                              |
| lazy     | false   | Lazily init html nodes when visible in viewport                                                         |
| src      | ''      | Path to a js file that export a default class that will be imported dynamically and used as constructor |
| selector | ''      | Custom selector to select the target node (first child element by default)                              |
| func     | ''      | Alternative function to call instead of the one provided by name                                        |

## Demo

Please check `demo.html` for some sample usages

## What about X feature from V2 ?

Some features are not available anymore: transformers, hooks, multiple callbacks... These are mostly
unecessary and can be replaced by custom constructors.
