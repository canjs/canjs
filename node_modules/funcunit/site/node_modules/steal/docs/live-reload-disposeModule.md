@function live-reload.disposeModule disposeModule
@parent steal.live-reload
@description Dispose of a module, removing it from the Loader registry.

@signature `reload.disposeModule(moduleName)`

Remove a module from the Loader registry and call any dispose callbacks registered for the module.

@param {String} moduleName the name of the module to be disposed

@body

## Use

Advanced plugins might want to dispose of modules at arbitrary times and disposeModule allows for that. One example would be if a plugin creates virtual modules and needs to remove them when the parent module is disposed.

```js
var reload = require("live-reload");
var loader = require("@loader");

loader.set("virtual-module", loader.newModule({}));

// Called when this module is disposed during a live-reload cycle.
reload.dispose(function(){

	// Remove virtual-module since it will be recreated when 
	// this module reloads.
	reload.disposeModule("virtual-module");

});
```

## Implementation

Implemented by [live-reload](https://github.com/stealjs/live-reload).
