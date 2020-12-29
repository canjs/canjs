"use strict";

const stacheBindings = require("can-stache-bindings");

const metaSymbol = Symbol.for("can.meta");
const inSetupSymbol = Symbol.for("can.initializing");

module.exports = function mixinBindings(Base = HTMLElement) {
	return class InitializeBindingsClass extends Base {
		initialize(props) {
			var bindings = this[metaSymbol] && this[metaSymbol]._bindings;

			if (bindings && bindings.length) {
				// set inSetup to false so that observations read in `initializeViewModel`
				// correctly set up bindings
				const origInSetup = this[inSetupSymbol];
				this[inSetupSymbol] = false;

				const bindingContext = {
					element: this
				};
				// Initialize the viewModel.  Make sure you
				// save it so the observables can access it.
				var initializeData = stacheBindings.behaviors.initializeViewModel(bindings, props, (properties) => {
					super.initialize(properties);
					return this;
				}, bindingContext);
	
				this[metaSymbol]._connectedBindingsTeardown = function() {
					for (var attrName in initializeData.onTeardowns) {
						initializeData.onTeardowns[attrName]();
					}
				};

				// restore inSetup to the original value
				this[inSetupSymbol] = origInSetup;
			} else {
				if (super.initialize) {
					super.initialize(props);
				}
			}
		}
		disconnect() {
			if(this[metaSymbol] && this[metaSymbol]._connectedBindingsTeardown) {
				this[metaSymbol]._connectedBindingsTeardown();
				this[metaSymbol]._connectedBindingsTeardown = null;
			}
			if (super.disconnect) {
				super.disconnect();
			}
		}
	};
};
