@function steal-css.CSSModule CSSModule
@parent steal-css.exports
@group steal-css.CSSModule.prototype prototype

@description

`CSSModule` is a constructor function that is used for loading a `.css` module. This is mostly useful for CSS plugins that seek to inherit base behavior from [steal-css].

@signature `new CSSModule(load, loader)`

Creates a new instance of CSSModule for the load.

@param {Object} load The load object of this module.

@param {Loader} loader The loader loading the module.

@signature `new CSSModule(address, source)`

Creates a new instance of CSSModule with the given address and source.

@param {String} address The address, or URL, of this module.

@param {String} [source] The source code of this module. This parameter is not required in production [steal.config.env] due to the use of `<link>` to load the module.

@body

# Use

CSSModule encapsulates behaviors for loading CSS modules in both development and production. You instantiate a new object with:

```js
var CSSModule = require("steal-css").CSSModule;

...

var css = new CSSModule(load, loader);
```

Depending on whether you are trying to inject a `<style>` tag or a `<link>` tag use the methods [steal-css.CSSModule.prototype.injectStyle] or [steal-css.CSSModule.prototype.injectLink].

## In development mode

Two other useful methods in development are [steal-css.CSSModule.prototype.updateURLs] and [steal-css.CSSModule.prototype.setupLiveReload].

**updateURLs** rewrites the source code to make the URLs for `@import` calls relative to the current module.

**setupLiveReload** takes care of making sure the `<style>` tag for the module is removed after a new version has been loaded.
