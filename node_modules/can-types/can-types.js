"use strict";
var namespace = require('can-namespace');
var canReflect = require('can-reflect');
var canSymbol = require('can-symbol');
var dev = require('can-log/dev/dev');

/**
 * @module {Object} can-types
 * @parent can-typed-data
 * @collection can-infrastructure
 * @package ./package.json
 * @description A stateful container for CanJS type information.
 *
 * @body
 *
 * ## Use
 *
 * `can-types` exports an object with placeholder functions that
 * can be used to provide default types or test if something is of a certain type.
 *
 * For example, `can-define/map/map` might overwrite `DefeaultMap` to return DefineMap
 *
 * ```js
 * types.DefaultMap = DefineMap;
 * ```
 */

var types = {
	isMapLike: function(obj){
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.warn('can-types.isMapLike(obj) is deprecated, please use `canReflect.isObservableLike(obj) && canReflect.isMapLike(obj)` instead.');
		}
		//!steal-remove-end
		return canReflect.isObservableLike(obj) && canReflect.isMapLike(obj);
	},

	isListLike: function(obj){
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.warn('can-types.isListLike(obj) is deprecated, please use `canReflect.isObservableLike(obj) && canReflect.isListLike(obj)` instead.');
		}
		//!steal-remove-end
		return canReflect.isObservableLike(obj) && canReflect.isListLike(obj);
	},

	isPromise: function(obj){
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.warn('can-types.isPromise is deprecated, please use canReflect.isPromise instead.');
		}
		//!steal-remove-end
		return canReflect.isPromise(obj);
	},

	isConstructor: function(func){
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.warn('can-types.isConstructor is deprecated, please use canReflect.isConstructorLike instead.');
		}
		//!steal-remove-end
		return canReflect.isConstructorLike(func);
	},

	isCallableForValue: function(obj){
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.warn('can-types.isCallableForValue(obj) is deprecated, please use `canReflect.isFunctionLike(obj) && !canReflect.isConstructorLike(obj)` instead.');
		}
		//!steal-remove-end
		return obj && canReflect.isFunctionLike(obj) && !canReflect.isConstructorLike(obj);
	},

	isCompute: function(obj){
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.warn('can-types.isCompute is deprecated.');
		}
		//!steal-remove-end
		return obj && obj.isComputed;
	},

	get iterator() {
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			dev.warn('can-types.iterator is deprecated, use `canSymbol.iterator || canSymbol.for("iterator")` instead.');
		}
		//!steal-remove-end
		return canSymbol.iterator || canSymbol.for("iterator");
	},
	/**
	 * @property {Map} can-types.DefaultMap DefaultMap
	 *
	 * @option {Map}
	 *
	 *   The default map type to create if a map is needed.  If both [can-map] and [can-define/map/map]
	 *   are imported, the default type will be [can-define/map/map].
	 */
	DefaultMap: null,
	/**
	 * @property {can-connect.List} can-types.DefaultList DefaultList
	 *
	 * @option {can-connect.List}
	 *
	 *   The default list type to create if a list is needed. If both [can-list] and [can-define/list/list]
	 *   are imported, the default type will be [can-define/list/list].
	 */
	DefaultList: null,
	/**
	 * @function can-types.queueTask queueTask
	 * @signature `types.queueTask(task)`
	 *   Run code that will be queued at the end of the current batch.
	 *   @param {Array} task
	 */
	queueTask: function(task){
		var args = task[2] || [];
		task[0].apply(task[1], args);
	},
	/**
	 * @function can-types.wrapElement wrapElement
	 * @signature `types.wrapElement(element)`
	 *   Wraps an element into an object useful by DOM libraries ala jQuery.
	 *
	 *   @param {Node} element Any object inheriting from the [Node interface](https://developer.mozilla.org/en-US/docs/Web/API/Node).
	 *   @return {{}} A wrapped object.
	 */
	wrapElement: function(element){
		return element;
	},
	/**
	 * @function can-types.unwrapElement unwrapElement
	 * @signature `types.unwrapElement(object)`
	 *   Unwraps an object that contains an element within.
	 *
	 *   @param {{}} object Any object that can be unwrapped into a Node.
	 *   @return {Node} A Node.
	 */
	unwrapElement: function(element){
		return element;
	}
};

if (namespace.types) {
	throw new Error("You can't have two versions of can-types, check your dependencies");
} else {
	module.exports = namespace.types = types;
}
