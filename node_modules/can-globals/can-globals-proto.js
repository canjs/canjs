'use strict';

var canReflect = require('can-reflect');

function dispatch(key) {
	// jshint -W040
	var handlers = this.eventHandlers[key];
	if (handlers) {
		var handlersCopy = handlers.slice();
		var value = this.getKeyValue(key);
		for (var i = 0; i < handlersCopy.length; i++) {
			handlersCopy[i](value);
		}
	}
}

function Globals() {
	this.eventHandlers = {};
	this.properties = {};
}

/**
 * @function define 
 * @parent can-globals/methods
 * 
 * Create a new global environment variable.
 * 
 * @signature `globals.define(key, value[, cache])`
 * 
 * Defines a new global called `key`, who's value defaults to `value`.
 * 
 * The following example defines the `global` key's default value to the [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) object:
 * ```javascript
 * globals.define('global', window);
 * globals.getKeyValue('window') //-> window
 * ```
 * 
 * If a function is provided and `cache` is falsy, that function is run every time the key value is read:
 * ```javascript
 * globals.define('isBrowserWindow', function() {
 *   console.log('EVALUATING')
 *   return typeof window !== 'undefined' &&
 *     typeof document !== 'undefined' && typeof SimpleDOM === 'undefined'
 * }, false);
 * globals.get('isBrowserWindow') // logs 'EVALUATING'
 *                                // -> true
 * globals.get('isBrowserWindow') // logs 'EVALUATING' again
 *                                // -> true
 * ```
 * 
 * If a function is provided and `cache` is truthy, that function is run only the first time the value is read:
 * ```javascript
 * globals.define('isWebkit', function() {
 *   console.log('EVALUATING')
 *   var div = document.createElement('div')
 *   return 'WebkitTransition' in div.style
 * })
 * globals.getKeyValue('isWebkit') // logs 'EVALUATING'
 * 								   // -> true
 * globals.getKeyValue('isWebkit') // Does NOT log again!
 * 								   // -> true
 * ```
 * 
 * @param {String} key
 * The key value to create.
 * 
 * @param {*} value
 * The default value. If this is a function, its return value will be used.
 * 
 * @param {Boolean} [cache=true]
 * Enable cache. If false the `value` function is run every time the key value is read.
 * 
 * @return {can-globals}
 * Returns the instance of `can-globals` for chaining.
 */
Globals.prototype.define = function (key, value, enableCache) {
	if (enableCache === undefined) {
		enableCache = true;
	}
	if (!this.properties[key]) {
		this.properties[key] = {
			default: value,
			value: value,
			enableCache: enableCache
		};
	}
	return this;
};

/**
 * @function getKeyValue 
 * @parent can-globals/methods
 * 
 * Get a global environment variable by name.
 * 
 * @signature `globals.getKeyValue(key)`
 * 
 * Returns the current value at `key`. If no value has been set, it will return the default value (if it is not a function). If the default value is a function, it will return the output of the function. This execution is cached if the cache flag was set on initialization.
 * 
 * ```javascript
 * globals.define('foo', 'bar');
 * globals.getKeyValue('foo'); //-> 'bar'
 * ```
 * 
 * @param {String} key
 * The key value to access.
 * 
 * @return {*}
 * Returns the value of a given key.
 */
Globals.prototype.getKeyValue = function (key) {
	var property = this.properties[key];
	if (property) {
		if (typeof property.value === 'function') {
			if (property.cachedValue) {
				return property.cachedValue;
			}
			if (property.enableCache) {
				property.cachedValue = property.value();
				return property.cachedValue;
			} else {
				return property.value();
			}
		}
		return property.value;
	}
};

Globals.prototype.makeExport = function (key) {
	return function (value) {
		if (arguments.length === 0) {
			return this.getKeyValue(key);
		}

		if (typeof value === 'undefined' || value === null) {
			this.deleteKeyValue(key);
		} else {
			if (typeof value === 'function') {
				this.setKeyValue(key, function () {
					return value;
				});
			} else {
				this.setKeyValue(key, value);
			}
			return value;
		}
	}.bind(this);
};

/**
 * @function offKeyValue 
 * @parent can-globals/methods
 * 
 * Remove handler from event queue.
 * 
 * @signature `globals.offKeyValue(key, handler)`
 * 
 * Removes `handler` from future change events for `key`.
 * 
 * 
 * ```javascript
 * var handler = (value) => {
 *   value === 'baz' //-> true
 * };
 * globals.define('foo', 'bar');
 * globals.onKeyValue('foo', handler);
 * globals.setKeyValue('foo', 'baz');
 * globals.offKeyValue('foo', handler);
 * ```
 * 
 * @param {String} key
 * The key value to observe.
 * 
 * @param {Function} handler([value])
 * The observer callback.
 * 
 * @return {can-globals}
 * Returns the instance of `can-globals` for chaining.
 */
Globals.prototype.offKeyValue = function (key, handler) {
	if (this.properties[key]) {
		var handlers = this.eventHandlers[key];
		if (handlers) {
			var i = handlers.indexOf(handler);
			handlers.splice(i, 1);
		}
	}
	return this;
};

/**
 * @function onKeyValue 
 * @parent can-globals/methods
 * 
 * Add handler to event queue.
 * 
 * @signature `globals.onKeyValue(key, handler)`
 * 
 * Calls `handler` each time the value of `key` is set or reset.
 * 
 * ```javascript
 * globals.define('foo', 'bar');
 * globals.onKeyValue('foo', (value) => {
 *   value === 'baz' //-> true
 * });
 * globals.setKeyValue('foo', 'baz');
 * ```
 * 
 * @param {String} key
 * The key value to observe.
 * 
 * @param {function(*)} handler([value])
 * The observer callback.
 * 
 * @return {can-globals}
 * Returns the instance of `can-globals` for chaining.
 */
Globals.prototype.onKeyValue = function (key, handler) {
	if (this.properties[key]) {
		if (!this.eventHandlers[key]) {
			this.eventHandlers[key] = [];
		}
		this.eventHandlers[key].push(handler);
	}
	return this;
};

/**
 * @function deleteKeyValue 
 * @parent can-globals/methods
 * 
 * Reset global environment variable.
 * 
 * @signature `globals.deleteKeyValue(key)`
 * 
 * Deletes the current value at `key`. Future `get`s will use the default value.
 * 
 * ```javascript
 * globals.define('global', window);
 * globals.setKeyValue('global', {});
 * globals.deleteKeyValue('global');
 * globals.getKeyValue('global') === window; //-> true
 * ```
 * 
 * @param {String} key
 * The key value to access.
 * 
 * @return {can-globals}
 * Returns the instance of `can-globals` for chaining.
 */
Globals.prototype.deleteKeyValue = function (key) {
	var property = this.properties[key];
	if (property !== undefined) {
		property.value = property.default;
		property.cachedValue = undefined;
		dispatch.call(this, key);
	}
	return this;
};

/**
 * @function setKeyValue 
 * @parent can-globals/methods
 * 
 * Overwrite an existing global environment variable.
 * 
 * @signature `globals.setKeyValue(key, value)`
 * 
 * ```javascript
 * globals.define('foo', 'bar');
 * globals.setKeyValue('foo', 'baz');
 * globals.getKeyValue('foo'); //-> 'baz'
 * ```
 * 
 * Sets the new value at `key`. Will override previously set values, but preserves the default (see `deleteKeyValue`).
 * 
 * Setting a key which was not previously defined will call `define` with the key and value.
 * 
 * @param {String} key
 * The key value to access.
 * 
 * @param {*} value
 * The new value.
 * 
 * @return {can-globals}
 * Returns the instance of `can-globals` for chaining.
 */
Globals.prototype.setKeyValue = function (key, value) {
	if (!this.properties[key]) {
		return this.define(key, value);
	}
	var property = this.properties[key];
	property.value = value;
	property.cachedValue = undefined;
	dispatch.call(this, key);
	return this;
};

/**
 * @function reset 
 * @parent can-globals/methods
 * 
 * Reset all keys to their default value and clear their caches.
 * 
 * @signature `globals.setKeyValue(key, value)`
 * 
 * ```javascript
 * globals.define('foo', 'bar');
 * globals.setKeyValue('foo', 'baz');
 * globals.getKeyValue('foo'); //-> 'baz'
 * globals.reset();
 * globals.getKeyValue('foo'); //-> 'bar'
 * ```
 * 
 * @return {can-globals}
 * Returns the instance of `can-globals` for chaining.
 */
Globals.prototype.reset = function () {
	for (var key in this.properties) {
		if (this.properties.hasOwnProperty(key)) {
			this.properties[key].value = this.properties[key].default;
			this.properties[key].cachedValue = undefined;
			dispatch.call(this, key);
		}
	}
	return this;
};

canReflect.assignSymbols(Globals.prototype, {
	'can.getKeyValue': Globals.prototype.getKeyValue,
	'can.setKeyValue': Globals.prototype.setKeyValue,
	'can.deleteKeyValue': Globals.prototype.deleteKeyValue,
	'can.onKeyValue': Globals.prototype.onKeyValue,
	'can.offKeyValue': Globals.prototype.offKeyValue
});

module.exports = Globals;
