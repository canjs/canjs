"use strict";
const { mixins } = require("can-observable-mixin");

const metaSymbol = Symbol.for("can.meta");

// `attributeChangedCallback` cannot be overwritten so we need to create a named
// function to check if we have had a `attributeChangedCallback` set.
function baseAttributeChangedCallback () {
	/* jshint validthis: true */
	if (this.attributeChangedCallback !== baseAttributeChangedCallback) {
		// `this.attributeChangedCallback` is being set up within `can-observable-bindings`
		this.attributeChangedCallback.apply(this, arguments);
	}
}

module.exports = function mixinBindBehaviour(Base = HTMLElement) {
	class BindingPropsClass extends Base {
		initialize(props) {
			if(this[metaSymbol] === undefined) {
				this[metaSymbol] = {};
			}
			if (this[metaSymbol]._bindings === undefined) {
				this[metaSymbol]._bindings = [];
			}
			// `_uninitializedBindings` are being set within `observedAttributes` which creates the bindings
			Object.keys(this.constructor[metaSymbol]._uninitializedBindings).forEach(propName => {
				const binding = this.constructor[metaSymbol]._uninitializedBindings[propName](this);

				// Add bindings to the instance `metaSymbol` to be set up during `mixin-initialize-bindings`
				this[metaSymbol]._bindings.push({
					binding,
					siblingBindingData: {
						parent: {
							source: "scope",
							exports: true
						},
						child: {
							source: "viewModel",
							exports: true,
							name: propName
						},
						bindingAttributeName: propName
					}
				});
			});

			if (super.initialize) {
				super.initialize(props);
			}
		}
	}

	// To prevent inifinite loop, use a named function so we can differentiate
	// make it writable so it can be set elsewhere  
	Object.defineProperty(BindingPropsClass.prototype, 'attributeChangedCallback', {
		value: baseAttributeChangedCallback,
		writable: true
	});

	return BindingPropsClass;
};

// We can't set `observedAttributes` on the `StacheElement.prototype` as static properties are
// not copied over with `Object.create`
module.exports.initializeObservedAttributes = function initializeObservedAttributes (ctr) {
	Object.defineProperty(ctr, 'observedAttributes', {
		get () {
			// We only want to return `observedAttributes` if we have a `bind` on the
			// property definition
			let hasBindDefinition = false;
			// Run finalizeClass to set up the property definitions
			mixins.finalizeClass(this);
			
			if(this[metaSymbol] === undefined) {
				this[metaSymbol] = {};
			}
			if(this[metaSymbol]._uninitializedBindings === undefined) {
				this[metaSymbol]._uninitializedBindings = {};
			}

			// Check that we have property definitions
			const definitions = this.prototype._define && this.prototype._define.definitions;
			if (definitions) {
				// Run through all defitions so we can check if they have a `bind` function
				Object.keys(definitions).forEach(propName => {
					const definition = definitions[propName];
					if (typeof definition.bind === 'function') {
						const bindFn = definition.bind(propName, this);
						// Set up the bindings so that they can be called during initialize
						// to setup binding starts
						this[metaSymbol]._uninitializedBindings[propName] = bindFn;
						hasBindDefinition = true;
					}
				});
			}
			// Only return `this.observedAttributes` if we have binds otherwise
			// we create an inifinite loop
			return hasBindDefinition ? this.observedAttributes : [];
		}
	});
};
