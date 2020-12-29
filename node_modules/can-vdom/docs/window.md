@typedef {{}} can-vdom.types.window window
@parent can-vdom.types

An object representing a fake `window` object.

@option {can-simple-dom/document/document} document A browser document

@option {Object} window The window itself.

@option {Object} self The `self` object is an alias for `window`.

@option {function} addEventListener A stub for `window.addEventListener`, does not actually set up events unless overridden some place else.

@option {function} removeEventListener A stub for `window.removeEventListener`.

@option {Object} navigator

@option {Object} location

@option {Object} history
