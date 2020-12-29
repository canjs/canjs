@function steal-css.CSSModule.prototype.injectLink injectLink
@parent steal-css.CSSModule.prototype

@description 

Injects a `<link>` tag for this module into the `document.head`.

@signature `css.injectLink()`

Creates a new `<link rel=stylesheet>` element using the CSSModule's *address* as the link's `href`. Waits until the link has loaded (using the `load` event in modern browsers and other techniques elsewhere).

@return {Promise} A promise that will resolve when the CSS, including all imports, have been loaded.
