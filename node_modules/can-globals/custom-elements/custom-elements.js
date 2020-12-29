'use strict';

require('can-globals/global/global');
var globals = require('can-globals/can-globals-instance');

/**
 * @module {function} can-globals/custom-elements/custom-elements custom-elements
 * @parent can-globals/modules
 *
 * Get the global [`customElements`](https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements) object for the current context.
 *
 * @signature `CUSTOMELEMENTS([newCustomElements])`
 *
 * Optionally sets, and returns, the [`customElements`](https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements) object for the context.
 *
 * ```js
 * var customElementsShim = require('some-custom-elements-shim');
 * CUSTOMELEMENTS(customElementsShim);
 * CUSTOMELEMENTS() //-> customElementsShim
 * ```
 *
 * @param {Object} customElements An optional CustomElementRegistry-like object to set as the context's customElements
 *
 * @return {Object} The customElements object for this JavaScript environment.
 */

globals.define('customElements', function(){
	var GLOBAL = globals.getKeyValue('global');
	return GLOBAL.customElements;
});

module.exports = globals.makeExport('customElements');
