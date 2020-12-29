'use strict';

require('can-globals/global/global');
var globals = require('can-globals/can-globals-instance');

/**
 * @module {function} can-globals/mutation-observer/mutation-observer mutation-observer
 * @parent can-globals/modules
 * 
 * Get the global [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) object for the current context.
 * 
 * @signature `MUTATIONOBSERVER([newMutationObserver])`
 * 
 * Optionally sets, and returns, the [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) object for the context.
 * 
 * ```js
 * var mutationObserverShim = require('can-globals/mutation-observer/mutation-observer');
 * MUTATIONOBSERVER(mutationObserverShim);
 * MUTATIONOBSERVER() //-> MutationObserver
 * ```
 *
 * @param {Object} MutationObserver An optional MutationObserver-like object to set as the context's MutationObserver
 *
 * @return {Object} The MutationObserver object for this JavaScript environment.
 */

globals.define('MutationObserver', function(){
	var GLOBAL = globals.getKeyValue('global');
	return GLOBAL.MutationObserver || GLOBAL.WebKitMutationObserver || GLOBAL.MozMutationObserver;
});

module.exports = globals.makeExport('MutationObserver');
