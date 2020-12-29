@function steal-css.CSSModule.prototype.setupLiveReload setupLiveReload
@parent steal-css.CSSModule.prototype

@description 

Uses Steal live-reload to listen for changes in this module and then removes the `<style>` **after** a new version of the module has been loaded.

@signature `css.setupLiveReload(loader, moduleName)`

@param {Loader} loader The Loader used to load this module.

@param {moduleName} moduleName The moduleName of the module, so that we can listen for its changes.
