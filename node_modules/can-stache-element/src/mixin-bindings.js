"use strict";

const keyObservable = require("can-simple-observable/key/key");
const canReflect = require("can-reflect");
const Bind = require("can-bind");

const getValueSymbol = Symbol.for("can.getValue");
const setValueSymbol = Symbol.for("can.setValue");
const metaSymbol = Symbol.for("can.meta");

module.exports = function mixinBindings(Base = HTMLElement) {
	return class BindingsClass extends Base {
		bindings(bindings) {
			if(this[metaSymbol] === undefined) {
				this[metaSymbol] = {};
			}
			const bindingsObservables = {};
			canReflect.eachKey(bindings, (parent, propName) => {
				// Create an observable for reading/writing the viewModel
				// even though it doesn't exist yet.
				const child = keyObservable(this, propName);

				bindingsObservables[propName] = {
					parent,
					child
				};
			});
			this[metaSymbol]._connectedBindings = bindingsObservables;
			return this;
		}
		initialize(props) {
			var savedBindings = this[metaSymbol] && this[metaSymbol]._connectedBindings;
			if (savedBindings) {
				props = props || {};

				if (this[metaSymbol]._bindings === undefined) {
					this[metaSymbol]._bindings = [];
				}

				canReflect.eachKey(savedBindings, (binding, propName) => {
					const { child, parent } = binding;

					var canGetParentValue = parent != null && !!parent[getValueSymbol];
					var canSetParentValue = parent != null && !!parent[setValueSymbol];

					// If we can get or set the value, then we’ll create a binding
					if (canGetParentValue || canSetParentValue) {

						// Create the binding similar to what’s in can-stache-bindings
						var canBinding = new Bind({
							child: child,
							parent: parent,
							queue: "dom",
							element: this,

							//!steal-remove-start
							// For debugging: the names that will be assigned to the updateChild
							// and updateParent functions within can-bind
							updateChildName: "update <" + this.nodeName.toLowerCase() + ">."+propName,
							updateParentName: "update " + canReflect.getName(parent) + " from <" + this.nodeName.toLowerCase() + ">."+propName
							//!steal-remove-end
						});

						this[metaSymbol]._bindings.push({
							binding: canBinding,
							siblingBindingData: {
								parent: {
									source: "scope",
									exports: canGetParentValue
								},
								child: {
									source: "viewModel",
									exports: canSetParentValue,
									name: propName
								},
								bindingAttributeName: propName
							}
						});

					} else {
						// Can’t get or set the value, so assume it’s not an observable
						props[propName] = parent;
					}
				});

				this[metaSymbol].other = true;
			}
			if (super.initialize) {
				super.initialize(props);
			}
		}
		render(props, renderOptions) {
			const viewRoot = this.viewRoot || this;
			viewRoot.innerHTML = "";

			if(super.render) {
				super.render(props, renderOptions);
			}
		}
		disconnect() {
			delete this[metaSymbol]._bindings;
			if (super.disconnect) {
				super.disconnect();
			}
		}
	};
};
