@function steal-css.CSSModule.prototype.injectStyle injectStyle
@parent steal-css.CSSModule.prototype

@description 

Injects a `<style>` tag for this module into the `document.head`.

@signature `css.injectStyle()`

Creates a new `<style>` element using the CSSModule's *source* as the textContent and injects it into the `document.head`.
