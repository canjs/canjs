"use strict";
var Control = require("can-control");
var canReflect = require("can-reflect");

// ## Helpers
// Attribute names to ignore for setting viewModel values.
var paramReplacer = /\{([^\}]+)\}/g;

var ComponentControl = Control.extend({
		// the lookup path - where templated keys will be looked up
		// change lookup to first look in the viewModel
		_lookup: function(options) {
			return [options.scope, options, window];
		},
		// strip strings that represent delegates from the key
		// viewModel.foo -> foo
		_removeDelegateFromKey: function (key) {
			return key.replace(/^(scope|^viewModel)\./, "");
		},
		// return whether the key is a delegate
		_isDelegate: function(options, key) {
			return key === 'scope' || key === 'viewModel';
		},
		// return the delegate object for a given key
		_getDelegate: function(options, key) {
			return options[key];
		},
		_action: function(methodName, options, controlInstance) {
			var hasObjectLookup;

			paramReplacer.lastIndex = 0;

			hasObjectLookup = paramReplacer.test(methodName);

			// If we don't have options (a `control` instance), we'll run this later.
			if (!controlInstance && hasObjectLookup) {
				return;
			} else {
				return Control._action.apply(this, arguments);
			}
		}
	},
	// Extend `events` with a setup method that listens to changes in `viewModel` and
	// rebinds all templated event handlers.
	{
		setup: function(el, options) {
			this.scope = options.scope;
			this.viewModel = options.viewModel;
			return Control.prototype.setup.call(this, el, options);
		},
		off: function() {
			// If `this._bindings` exists we need to go through it's `readyComputes` and manually
			// unbind `change` event listeners set by the controller.
			if (this._bindings) {
				canReflect.eachKey(this._bindings.readyComputes || {}, function(value) {
					canReflect.offValue(value.compute, value.handler);
				});
			}
			// Call `Control.prototype.off` function on this instance to cleanup the bindings.
			Control.prototype.off.apply(this, arguments);
			this._bindings.readyComputes = {};
		},
		destroy: function() {
			if (typeof this.options.destroy === 'function') {
				this.options.destroy.apply(this, arguments);
			}
			Control.prototype.destroy.apply(this, arguments);

		}
	});

module.exports = ComponentControl;
