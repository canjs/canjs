@page StealJS.writing-plugins Writing Plugins
@parent StealJS.guides

@body

Steal's plugin API makes it easy to write plugins for module loading that does things like:

* Caches source in localStorage/IndexedDB so it doesn't need to be fetched from the server.
* Transpiling TypeScript to JavaScript.
* Preloading images so they are cached before use.

## How to write a plugin

Writing a plugin is just a matter of creating a module that exports one or more of the Steal loader hooks. the loader hooks are:

* [steal.hooks.locate] - Determine the URL for a module.
* [steal.hooks.fetch] - Fetch a module (like using XHR).
* [steal.hooks.translate] - Run a transpiler like TypeScript against module source, converting it into JavaScript.
* [steal.hooks.instantiate] - Override the loader's mechanisms for determining a module's dependencies and ultimate value.

To override any of these hooks you only need to export the hook name in your module. For example to override the **locate** hook you do:

```
exports.locate = function(load){
  // custom logic goes here
};
```

### Simple example: image preloading

Let's build a simple example of a plugin, one preloads images so that they are ready before being inserted into the DOM.

Let's start off by creating our plugin, create a file **preload.js** in your project:

```
exports.fetch = function(load) {

};
```

To implement this plugin we are overriding the `fetch` hook. The fetch hook receives the [load] object which identifies the module we are attempting to load.

What we want to do in this plugin is to load this image without displaying it to the user. This way when, later, our JavaScript inserts the image into the page it has already been loaded from the server and is in the browser cache.

We can use the [Image constructor](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image) to load the image.  Each loader hook can return a Promise, which we can use to block module loading, but in this case we want the page to load as fast as possible, so we'll load the image in the background but allow module loading to continue.

Here's how we can implement this plugin:

```
exports.fetch = function(load){
  var img = new Image();
  img.src = load.address;

  return "";
};
```

Steal assumes that the modules it is loading are all JavaScript, and will try to execute their source as JavaScript. Since this is an image, we can return an empty string `""` which becomes this module's "source", acting as a noop of sorts.

To now use this plugin, in another file use the bang syntax to load an image. I'll create a **main.js** for this purpose:

```
require("./cat.png!preload");
```

And now cat.png is preload it. If we were to insert it into the page later, such as after a user had clicked on a link, it would be fresh in the browser cache and would display nearly instantly.

If you wanted to associate *all* .png files with this preload plugin, you could special it as the handler using [System.ext] configuration:

```
"system": {
  "ext": {
    "png": "preload"
  }
}
```

Now with this config all you need to do is:

```
require("./cat.png");
```
