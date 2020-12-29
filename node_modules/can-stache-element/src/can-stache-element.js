"use strict";

const namespace = require("can-namespace");
const mixinLifecycleMethods = require("./mixin-lifecycle-methods");
const mixinProps = require("./mixin-props");
const mixinStacheView = require("./mixin-stache-view");
const mixinViewModelSymbol = require("./mixin-viewmodel-symbol");
const mixinBindings = require("./mixin-bindings");
const mixinInitializeBindings = require("./mixin-initialize-bindings");
const mixinBindBehaviour = require("./mixin-bind-behaviour");
const { initializeObservedAttributes } = require("./mixin-bind-behaviour");

const canStacheBindings = require("can-stache-bindings");
const { createConstructorFunction } = require("can-observable-mixin");

const initializeSymbol = Symbol.for("can.initialize");
const teardownHandlersSymbol = Symbol.for("can.teardownHandlers");
const isViewSymbol = Symbol.for("can.isView");
const Scope = require("can-view-scope");

// Calling a renderer like {{foo()}} gets the template scope
// added no matter what. This checks for that condition.
// https://github.com/canjs/can-stache/issues/719
function rendererWasCalledWithData(scope) {
	return scope instanceof Scope &&
		scope._parent &&
		scope._parent._context instanceof Scope.TemplateContext;
}

function addContext(rawRenderer, tagData) {
	function renderer(data) {
		if(rendererWasCalledWithData(data)) {
			return rawRenderer(tagData.scope.addLetContext(data._context));
		} else {
			// if it was called programmatically (not in stache), just add the data
			return rawRenderer(tagData.scope.addLetContext(data));
		}
	}
	// Marking as a view will add the template scope ... but it should
	// already be present in `tagData.scope`.
	// However, I mark this as a renderer because that is what it is.
	renderer[isViewSymbol] = true;
	return renderer;
}

function DeriveElement(BaseElement = HTMLElement) {
	class StacheElement extends
	// add lifecycle methods
	// this needs to happen after other mixins that implement these methods
	// so that this.<lifecycleMethod> is the actual lifecycle method which
	// controls whether the methods farther "down" the chain are called
	mixinLifecycleMethods(
		// mixin .bindings() method and behavior
		mixinBindings(
			// Find all prop definitions and extract `{ bind: () => {} }` for binding initialization
			mixinBindBehaviour(
				// Initialize the bindings
				mixinInitializeBindings(
					// mix in viewModel symbol used by can-stache-bindings
					mixinViewModelSymbol(
						// mix in stache renderer from `static view` property
						mixinStacheView(
							// add getters/setters from `static props` property
							mixinProps(BaseElement)
						)
					)
				)
			)
		)
	) {
		[initializeSymbol](el, tagData) {


			const teardownBindings = canStacheBindings.behaviors.viewModel(
				el,
				tagData,
				function makeViewModel(initialViewmodelData) {
					for(let prop in tagData.templates) {
						// It's ok to modify the argument. The argument is created
						// just for what gets passed into creating the VM.
						initialViewmodelData[prop] = addContext(tagData.templates[prop], tagData);
					}
					el.render(initialViewmodelData);
					return el;
				}
			);


			if (el[teardownHandlersSymbol]) {
				el[teardownHandlersSymbol].push(teardownBindings);
			}
		}
	}

	const StacheElementConstructorFunction = createConstructorFunction(
		StacheElement
	);

	// Initialize the `observedAttributes`
	initializeObservedAttributes(StacheElementConstructorFunction);

	return StacheElementConstructorFunction;
}

module.exports = namespace.StacheElement = DeriveElement();
