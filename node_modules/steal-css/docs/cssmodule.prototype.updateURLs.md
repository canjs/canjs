@function steal-css.CSSModule.prototype.updateURLs updateURLs
@parent steal-css.CSSModule.prototype

@description 

Rewrites URLs within the stylesheet to be relative to the module.

@signature `css.updateURLs()`

Rewrites the module's *source* and updates all `@import` and `url()` uses to be relative to the CSS module.

@return {String} Returns the modified *source* (and also updates the `css.source` property.
