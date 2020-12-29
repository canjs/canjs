"use strict";
// # can-stache-bindings.js
//
// This module provides CanJS's default data and event bindings.
// It's broken up into several parts:
//
// - Behaviors - Binding behaviors that run given an attribute or element.
// - Attribute Syntaxes - Hooks up custom attributes to their behaviors.
// - getObservableFrom - Methods that return a observable cross bound to the scope, viewModel, or element.
// - bind - Methods for setting up cross binding
// - getBindingInfo - A helper that returns the details of a data binding given an attribute.
// - makeDataBinding - A helper method for setting up a data binding.
// - initializeValues - A helper that initializes a data binding.
var Bind = require('can-bind');
var expression = require('can-stache/src/expression');
var canViewModel = require('can-view-model');
var stacheKey = require('can-stache-key');
var ObservationRecorder = require('can-observation-recorder');
var SimpleObservable = require('can-simple-observable');
var Scope = require('can-view-scope');

var assign = require('can-assign');
var dev = require('can-log/dev/dev');
var domMutate = require('can-dom-mutate');
var domData = require('can-dom-data');
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var canReflectDeps = require("can-reflect-dependencies");
var encoder = require("can-attribute-encoder");
var queues = require("can-queues");
var SettableObservable = require("can-simple-observable/setter/setter");
var AttributeObservable = require("can-attribute-observable");
var makeCompute = require("can-view-scope/make-compute-like");

var canEventQueue = require("can-event-queue/map/map");

// Contains all of the stache bindings that will be exported.
var bindings = new Map();

var onMatchStr = "on:",
	vmMatchStr = "vm:",
	elMatchStr = "el:",
	byMatchStr = ":by:",
	toMatchStr = ":to",
	fromMatchStr = ":from",
	bindMatchStr = ":bind",
	viewModelBindingStr = "viewModel",
	attributeBindingStr = "attribute",
	scopeBindingStr = "scope",
	viewModelOrAttributeBindingStr = "viewModelOrAttribute",
	viewModelSymbol = canSymbol.for("can.viewModel"),
	preventDataBindingsSymbol = canSymbol.for("can.preventDataBindings");

var throwOnlyOneTypeOfBindingError = function() {
	throw new Error("can-stache-bindings - you can not have contextual bindings ( this:from='value' ) and key bindings ( prop:from='value' ) on one element.");
};

// This function checks if there bindings that are trying
// to set a property ON the viewModel _conflicting_ with bindings trying to
// set THE viewModel ITSELF.
// If there is a conflict, an error is thrown.
var checkBindingState = function(bindingState, siblingBindingData) {
	var isSettingOnViewModel = siblingBindingData.parent.exports && siblingBindingData.child.source === viewModelBindingStr;
	if (isSettingOnViewModel) {
		var bindingName = siblingBindingData.child.name;
		var isSettingViewModel = isSettingOnViewModel && ( bindingName === 'this' || bindingName === '.' );

		if (isSettingViewModel) {
			if (bindingState.isSettingViewModel || bindingState.isSettingOnViewModel) {
				throwOnlyOneTypeOfBindingError();
			} else {
				return {
					isSettingViewModel: true,
					initialViewModelData: undefined
				};
			}
		} else {
			// just setting on viewModel
			if (bindingState.isSettingViewModel) {
				throwOnlyOneTypeOfBindingError();
			} else {
				return {
					isSettingOnViewModel: true,
					initialViewModelData: bindingState.initialViewModelData
				};
			}
		}
	} else {
		return bindingState;
	}
};

var getEventBindingData = function (attributeName, el, scope) {
	var bindingCode = attributeName.substr(onMatchStr.length);
	var viewModel = el && el[viewModelSymbol];
	var elUsed = startsWith.call(bindingCode, elMatchStr);
	var vmUsed = startsWith.call(bindingCode, vmMatchStr);
	var byUsed = bindingCode.indexOf(byMatchStr) > -1;
	var scopeUsed;

	// The values being returned
	var bindingContext;
	var eventName;
	var bindingContextObservable;
	var shortBindingCode = "";

	// if explicit context is specified, trim the string down
	// else, determine value of which scope being used elUsed, vmUsed, scopeUsed
	if (vmUsed) {
		shortBindingCode = "vm";
		bindingCode = bindingCode.substr(vmMatchStr.length);
	} else if (elUsed) {
		shortBindingCode = "el";
		bindingCode = bindingCode.substr(elMatchStr.length);
	} else if (!vmUsed && !elUsed) {
		if (byUsed) {
			scopeUsed = true;
		} else if (viewModel)  {
			vmUsed = true;
		} else {
			elUsed = true;
		}
	}

	// if by is used, take the appropriate path to determine the bindingContext
	// and create the bindingKeyValue
	var bindingContextKey;
	if (byUsed) {
		var byIndex = bindingCode.indexOf(byMatchStr);
		bindingContextKey = bindingCode.substr(byIndex + byMatchStr.length);
		bindingCode = bindingCode.substr(0, byIndex);
	}
	eventName = bindingCode;
	if (elUsed) {
		if (byUsed) {
			throw new Error('binding with :by in element scope is not currently supported');
		} else {
			bindingContext = el;
		}
	} else if (vmUsed) {
		bindingContext = viewModel;
		if (byUsed) {
			bindingContext = viewModel.get(bindingContextKey);
			bindingContextObservable = new Scope(viewModel).computeData(bindingContextKey);
		}
	} else if (scopeUsed) {
		bindingContext = scope;
		if (byUsed) {
			bindingContext = bindingContext.get(bindingContextKey);
			bindingContextObservable = scope.computeData(bindingContextKey);
		}
	}

	return {
		// single observable object to listen to eventName directly on one observable object
		bindingContext: bindingContext,
		// this observable emits the bindingContext
		bindingContextObservable: bindingContextObservable,
		// the eventName string
		eventName: eventName,
		// which binding code was explicitly set by the user
		bindingCode: shortBindingCode,
	};
};

var onKeyValueSymbol = canSymbol.for("can.onKeyValue");
var makeScopeFromEvent = function(element, event, viewModel, args, data, bindingContext){
	// TODO: Remove in 6.0.  In 4 and 5 arguments were wrong.
	var shiftArgumentsForLegacyArguments = bindingContext && bindingContext[onKeyValueSymbol] !== undefined;

	var specialValues = {
		element: element,
		event: event,
		viewModel: viewModel,
		arguments: shiftArgumentsForLegacyArguments ? Array.prototype.slice.call(args, 1) : args,
		args: args
	};

	// make a scope with these things just under
	return data.scope.add(specialValues, { special: true });
};

var runEventCallback = function (el, ev, data, scope, expr, attributeName, attrVal) {
	// create "special" values that can be looked up using
	// {{scope.element}}, etc

	var updateFn = function() {
		var value = expr.value(scope, {
			doNotWrapInObservation: true
		});

		value = canReflect.isValueLike(value) ?
			canReflect.getValue(value) :
			value;

		return typeof value === 'function' ?
			value(el) :
			value;
	};
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		Object.defineProperty(updateFn, "name", {
			value: attributeName + '="' + attrVal + '"'
		});
	}
	//!steal-remove-end

	queues.batch.start();
	var mutateQueueArgs = [];
	mutateQueueArgs = [
		updateFn,
		null,
		null,
		{}
	];
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		mutateQueueArgs = [
			updateFn,
			null,
			null, {
				reasonLog: [el, ev, attributeName+"="+attrVal]
			}
		];
	}
	//!steal-remove-end
	queues.mutateQueue.enqueue.apply(queues.mutateQueue, mutateQueueArgs);
	queues.batch.stop();
};

// ## Behaviors
var behaviors = {
	// ## completeBindings
	// Given a list of bindings, initializes the bindings, then the viewModel then completes the bindings.
	// Arguments:
	// - bindings  - An array of `{binding, siblingBindingData}`
	// - initialViewModelData - Extra initial viewModel values
	// - makeViewModel - `makeViewModel(props, hasBindings, bindingsState)`
	// - bindingContext - optional, `{scope}`
	// Returns:
	// `{viewModel, onTeardowns, bindingsState}`
	initializeViewModel: function(bindings, initialViewModelData, makeViewModel, bindingContext) {

		var onCompleteBindings = [],
			onTeardowns = {};

		var bindingsState = {
			// if we have a binding like {something}="foo"
			isSettingOnViewModel: false,
			// if we have binding like {this}="bar"
			isSettingViewModel: false,
			initialViewModelData: initialViewModelData || {}
		};

		bindings.forEach(function(dataBinding){
			// Immediately bind to the parent so we can read its value
			dataBinding.binding.startParent();

			var siblingBindingData = dataBinding.siblingBindingData;
			bindingsState = checkBindingState(bindingsState, siblingBindingData);

			// For bindings that change the viewModel,
			// save the initial value on the viewModel.
			if (siblingBindingData.parent.exports) {

				var parentValue = siblingBindingData.child.setCompute ? makeCompute(dataBinding.binding.parent) : dataBinding.binding.parentValue;

				if (parentValue !== undefined) {

					if (bindingsState.isSettingViewModel) {
						// the initial data is the context
						// TODO: this is covered by can-component’s tests but not can-stache-bindings’ tests
						bindingsState.initialViewModelData = parentValue;
					} else {
						bindingsState.initialViewModelData[cleanVMName(siblingBindingData.child.name, bindingContext.scope)] = parentValue;
					}

				}
			}

			// Save what needs to happen after the `viewModel` is created.
			onCompleteBindings.push(dataBinding.binding.start.bind(dataBinding.binding));

			onTeardowns[siblingBindingData.bindingAttributeName] = dataBinding.binding.stop.bind(dataBinding.binding);
		});

		var viewModel = makeViewModel(bindingsState.initialViewModelData, bindings.length > 0, bindingsState);

		// bind on the viewModel so we can updat ethe parent
		for (var i = 0, len = onCompleteBindings.length; i < len; i++) {
			onCompleteBindings[i]();
		}
		return {viewModel: viewModel, onTeardowns: onTeardowns, bindingsState: bindingsState};
	},
	// ### bindings.behaviors.viewModel
	// Sets up all of an element's data binding attributes to a "soon-to-be-created"
	// `viewModel`.
	// This is primarily used by `Component` to ensure that its
	// `viewModel` is initialized with values from the data bindings as quickly as possible.
	// Component could look up the data binding values itself.  However, that lookup
	// would have to be duplicated when the bindings are established.
	// Instead, this uses the `makeDataBinding` helper, which allows creation of the `viewModel`
	// after scope values have been looked up.
	//
	// Arguments:
	// - `makeViewModel(initialViewModelData)` - a function that returns the `viewModel`.
	// - `initialViewModelData` any initial data that should already be added to the `viewModel`.
	//
	// Returns:
	// - `function` - a function that tears all the bindings down. Component
	// wants all the bindings active so cleanup can be done during a component being removed.
	viewModel: function(el, tagData, makeViewModel, initialViewModelData, staticDataBindingsOnly) {

		var attributeViewModelBindings = assign({}, initialViewModelData),

			// The data around the binding.
			bindingContext = assign({
				element: el,
				// this gets defined later
				viewModel: undefined
			}, tagData),

			// global settings for the bindings
			bindingSettings = {
				attributeViewModelBindings: attributeViewModelBindings,
				alreadyUpdatedChild: true,
				// force viewModel bindings in cases when it is ambiguous whether you are binding
				// on viewModel or an attribute (:to, :from, :bind)
				favorViewModel: true
			},
			dataBindings = [];

		// For each attribute, we create a dataBinding object.
		// These look like: `{binding, siblingBindingData}`
		canReflect.eachListLike(el.attributes || [], function(node) {
			var dataBinding = makeDataBinding(node, bindingContext, bindingSettings);

			if (dataBinding) {
				dataBindings.push(dataBinding);
			}
		});

		// If there are no binding, exit.
		if (staticDataBindingsOnly && dataBindings.length === 0) {
			return;
		}

		// Initialize the viewModel
		var completedData = behaviors.initializeViewModel(dataBindings, initialViewModelData, function(){
			// we need to make sure we have the viewModel available
			bindingContext.viewModel = makeViewModel.apply(this, arguments);
		}, bindingContext),
			onTeardowns = completedData.onTeardowns,
			bindingsState = completedData.bindingsState,
			siblingBindingDatas = {};


		// Listen to attribute changes and re-initialize
		// the bindings.
		var attributeDisposal;
		if (!bindingsState.isSettingViewModel) {
			// We need to update the child on any new bindings.
			bindingSettings.alreadyUpdatedChild = false;
			attributeDisposal = domMutate.onNodeAttributeChange(el, function(ev) {
				var attrName = ev.attributeName,
					value = el.getAttribute(attrName);

				if (onTeardowns[attrName]) {
					onTeardowns[attrName]();
				}
				// Parent attribute bindings we always re-setup.
				var parentBindingWasAttribute = siblingBindingDatas[attrName] && siblingBindingDatas[attrName].parent.source === attributeBindingStr;

				if (value !== null || parentBindingWasAttribute) {
					var dataBinding = makeDataBinding({
						name: attrName,
						value: value
					}, bindingContext, bindingSettings);
					if (dataBinding) {
						// The viewModel is created, so call callback immediately.
						dataBinding.binding.start();
						siblingBindingDatas[attrName] = dataBinding.siblingBindingData;
						onTeardowns[attrName] = dataBinding.binding.stop.bind(dataBinding.binding);
					}
				}
			});
		}

		return function() {
			if (attributeDisposal) {
				attributeDisposal();
				attributeDisposal = undefined;
			}
			for (var attrName in onTeardowns) {
				onTeardowns[attrName]();
			}
		};
	},
	// ### bindings.behaviors.data
	// This is called when an individual data binding attribute is placed on an element.
	// For example `{^value}="name"`.
	data: function(el, attrData) {
		if (el[preventDataBindingsSymbol] === true || domData.get(el, "preventDataBindings")) {
			return;
		}
		var viewModel,
			getViewModel = ObservationRecorder.ignore(function() {
				return viewModel || (viewModel = canViewModel(el));
			}),
			teardown,
			attributeDisposal,
			removedDisposal,
			bindingContext = {
				element: el,
				templateType: attrData.templateType,
				scope: attrData.scope,
				parentNodeList: attrData.nodeList,
				get viewModel(){
					return getViewModel();
				}
			};

		// Setup binding
		var dataBinding = makeDataBinding({
			name: attrData.attributeName,
			value: el.getAttribute(attrData.attributeName),
		}, bindingContext, {
			syncChildWithParent: false
		});

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (dataBinding.siblingBindingData.child.source === "viewModel" && !domData.get(el, "viewModel")) {
				dev.warn('This element does not have a viewModel. (Attempting to bind `' + dataBinding.siblingBindingData.bindingAttributeName + '="' + dataBinding.siblingBindingData.parent.name + '"`)');
			}
		}
		//!steal-remove-end

		// Flag to prevent start binding twice in dev mode
		var started = false;

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (el.nodeName === 'INPUT') {
				try {
					dataBinding.binding.start();
					started = true;
				} catch (error) {
					throw new Error(error.message + ' <input> elements always set properties to Strings.');
				}
			}
		}
		//!steal-remove-end

		if (!started) {
			dataBinding.binding.start();
			started = true;
		}

		var attributeListener = function(ev) {
			var attrName = ev.attributeName,
				value = el.getAttribute(attrName);

			if (attrName === attrData.attributeName) {
				if (teardown) {
					teardown();
				}

				if(value !== null  ) {
					var dataBinding = makeDataBinding({name: attrName, value: value}, bindingContext, {
						syncChildWithParent: false
					});
					if(dataBinding) {
						// The viewModel is created, so call callback immediately.
						dataBinding.binding.start();
						teardown = dataBinding.binding.stop.bind(dataBinding.binding);
					}
					teardown = dataBinding.onTeardown;
				}
			}
		};


		var tearItAllDown = function() {
			if (teardown) {
				teardown();
				teardown = undefined;
			}

			if (removedDisposal) {
				removedDisposal();
				removedDisposal = undefined;
			}
			if (attributeDisposal) {
				attributeDisposal();
				attributeDisposal = undefined;
			}
		};



		// Listen for changes
		teardown = dataBinding.binding.stop.bind(dataBinding.binding);

		attributeDisposal = domMutate.onNodeAttributeChange(el, attributeListener);
		removedDisposal = domMutate.onNodeDisconnected(el, function() {
			var doc = el.ownerDocument;
			var ownerNode = doc.contains ? doc : doc.documentElement;
			if (!ownerNode || ownerNode.contains(el) === false) {
				tearItAllDown();
			}
		});
	},
	// ### bindings.behaviors.event
	// The following section contains code for implementing the can-EVENT attribute.
	// This binds on a wildcard attribute name. Whenever a view is being processed
	// and can-xxx (anything starting with can-), this callback will be run.  Inside, its setting up an event handler
	// that calls a method identified by the value of this attribute.
	event: function(el, data) {
		var eventBindingData;
		// Get the `event` name and if we are listening to the element or viewModel.
		// The attribute name is the name of the event.
		var attributeName = encoder.decode(data.attributeName),
			// the name of the event we are binding
			event,
			// the context to which we bind the event listener
			bindingContext,
			// if the bindingContext is null, then use this observable to watch for changes
			bindingContextObservable;

		// check for `on:event:value:to` type things and call data bindings
		if (attributeName.indexOf(toMatchStr + ":") !== -1 ||
			attributeName.indexOf(fromMatchStr + ":") !== -1 ||
			attributeName.indexOf(bindMatchStr + ":") !== -1
		) {
			return this.data(el, data);
		}

		if (startsWith.call(attributeName, onMatchStr)) {
			eventBindingData = getEventBindingData(attributeName, el, data.scope);
			event = eventBindingData.eventName;
			bindingContext = eventBindingData.bindingContext;
			bindingContextObservable = eventBindingData.bindingContextObservable;

			//!steal-remove-start
			if(process.env.NODE_ENV !== "production") {
				if(
					!eventBindingData.bindingCode &&
					el[viewModelSymbol] &&
					("on" + event) in el
				) {
					dev.warn(
						"The " + event + " event is bound the view model for <" + el.tagName.toLowerCase() +
							">. Use " + attributeName.replace(onMatchStr, "on:el:") +  " to bind to the element instead."
					);
				}
			}
			//!steal-remove-end
		} else {
			throw new Error("can-stache-bindings - unsupported event bindings " + attributeName);
		}

		// This is the method that the event will initially trigger. It will look up the method by the string name
		// passed in the attribute and call it.
		var handler = function(ev) {
			var attrVal = el.getAttribute(encoder.encode(attributeName));
			if (!attrVal) {
				return;
			}

			var viewModel = el[viewModelSymbol];

			// expression.parse will read the attribute
			// value and parse it identically to how mustache helpers
			// get parsed.
			var expr = expression.parse(attrVal, {
				lookupRule: function() {
					return expression.Lookup;
				},
				methodRule: "call"
			});

			var runScope = makeScopeFromEvent(el, ev, viewModel, arguments, data, bindingContext);

			if (expr instanceof expression.Hashes) {
				var hashExprs = expr.hashExprs;
				var key = Object.keys(hashExprs)[0];
				var value = expr.hashExprs[key].value(runScope);
				var isObservableValue = canReflect.isObservableLike(value) && canReflect.isValueLike(value);
				runScope.set(key, isObservableValue ? canReflect.getValue(value) : value);
			} else if (expr instanceof expression.Call) {
				runEventCallback(el, ev, data, runScope, expr, attributeName, attrVal);
			} else {
				throw new Error("can-stache-bindings: Event bindings must be a call expression. Make sure you have a () in " + data.attributeName + "=" + JSON.stringify(attrVal));
			}
		};

		var attributesDisposal,
			removalDisposal,
			removeObservation,
			currentContext;

		// Unbind the event when the attribute is removed from the DOM
		var attributesHandler = function(ev) {
			var isEventAttribute = ev.attributeName === attributeName;
			var isRemoved = !el.getAttribute(attributeName);
			var isEventAttributeRemoved = isEventAttribute && isRemoved;
			if (isEventAttributeRemoved) {
				unbindEvent();
			}
		};
		var removalHandler = function() {
			var doc = el.ownerDocument;
			var ownerNode = doc.contains ? doc : doc.documentElement;
			if (!ownerNode || !ownerNode.contains(el)) {
				unbindEvent();
			}
		};
		var unbindEvent = function() {
			if (bindingContext) {
				canEventQueue.off.call(bindingContext, event, handler);
			}
			if (attributesDisposal) {
				attributesDisposal();
				attributesDisposal = undefined;
			}
			if (removalDisposal) {
				removalDisposal();
				removalDisposal = undefined;
			}
			if (removeObservation) {
				removeObservation();
				removeObservation = undefined;
			}
		};

		function updateListener(newVal, oldVal) {
			if (oldVal) {
				canEventQueue.off.call(oldVal, event, handler);
			}
			if (newVal) {
				canEventQueue.on.call(newVal, event, handler);
				currentContext = newVal;
			}
		}

		// Bind the handler defined above to the element we're currently processing and the event name provided in this
		// attribute name (can-click="foo")
		attributesDisposal = domMutate.onNodeAttributeChange(el, attributesHandler);
		removalDisposal = domMutate.onNodeDisconnected(el, removalHandler);
		if (!bindingContext && bindingContextObservable) {
			// on value changes of the observation, rebind the listener to the new context
			removeObservation = function () {
				if (currentContext) {
					canEventQueue.off.call(currentContext, event, handler);
				}
				canReflect.offValue(bindingContextObservable, updateListener);
			};
			canReflect.onValue(bindingContextObservable, updateListener);
		} else {
			try {
				canEventQueue.on.call(bindingContext, event, handler);
			} catch (error) {
				if (/Unable to bind/.test(error.message)) {
					var msg = 'can-stache-bindings - Unable to bind "' + event + '"';
					msg += ': "' + event  + '" is a property on a plain object "';
					msg += JSON.stringify(bindingContext);
					msg += '". Binding is available with observable objects only.';
					msg += ' For more details check https://canjs.com/doc/can-stache-bindings.html#Callafunctionwhenaneventhappensonavalueinthescope_animation_';
					throw new Error(msg);
				} else {
					throw error;
				}
			}
		}
	}
};


// ## Attribute Syntaxes
// The following sets up the bindings functions to be called
// when called in a template.


// value:to="bar" data bindings
// these are separate so that they only capture at the end
// to avoid (toggle)="bar" which is encoded as :lp:toggle:rp:="bar"
bindings.set(/[\w\.:]+:to$/, behaviors.data);
bindings.set(/[\w\.:]+:from$/, behaviors.data);
bindings.set(/[\w\.:]+:bind$/, behaviors.data);
bindings.set(/[\w\.:]+:raw$/, behaviors.data);
// value:to:on:input="bar" data bindings
bindings.set(/[\w\.:]+:to:on:[\w\.:]+/, behaviors.data);
bindings.set(/[\w\.:]+:from:on:[\w\.:]+/, behaviors.data);
bindings.set(/[\w\.:]+:bind:on:[\w\.:]+/, behaviors.data);


// `(EVENT)` event bindings.
bindings.set(/on:[\w\.:]+/, behaviors.event);

// ## getObservableFrom
// An object of helper functions that make a getter/setter observable
// on different types of objects.
var getObservableFrom = {
	// ### getObservableFrom.viewModelOrAttribute
	viewModelOrAttribute: function(bindingData, bindingContext) {
		var viewModel = bindingContext.element[viewModelSymbol];

		// if we have a viewModel, use it; otherwise, setup attribute binding
		if (viewModel) {
			return this.viewModel.apply(this, arguments);
		} else {
			return this.attribute.apply(this, arguments);
		}
	},
	// ### getObservableFrom.scope
	// Returns a compute from the scope.  This handles expressions like `someMethod(.,1)`.
	scope: function(bindingData, bindingContext) {
		var scope = bindingContext.scope,
			scopeProp = bindingData.name,
			mustBeGettable = bindingData.exports;

		if (!scopeProp) {
			return new SimpleObservable();
		} else {
			// Check if we need to spend time building a scope-key-data
			// If we have a '(', it likely means a call expression.
			if (mustBeGettable || scopeProp.indexOf("(") >= 0 || scopeProp.indexOf("=") >= 0) {
				var parentExpression = expression.parse(scopeProp,{baseMethodType: "Call"});

				if (parentExpression instanceof expression.Hashes) {
					return new SimpleObservable(function () {
						var hashExprs = parentExpression.hashExprs;
						var key = Object.keys(hashExprs)[0];
						var value = parentExpression.hashExprs[key].value(scope);
						var isObservableValue = canReflect.isObservableLike(value) && canReflect.isValueLike(value);
						scope.set(key, isObservableValue ? canReflect.getValue(value) : value);
					});
				} else {
					return parentExpression.value(scope);
				}
			} else {
				var observation = {};
				canReflect.assignSymbols(observation, {
					"can.getValue": function getValue() {},

					"can.valueHasDependencies": function hasValueDependencies() {
						return false;
					},

					"can.setValue": function setValue(newVal) {
						var expr = expression.parse(cleanVMName(scopeProp, scope),{baseMethodType: "Call"});
						var value = expr.value(scope);
						canReflect.setValue(value, newVal);
					},

					// Register what the custom observation changes
					"can.getWhatIChange": function getWhatIChange() {
						var data = scope.getDataForScopeSet(cleanVMName(scopeProp, scope));
						var m = new Map();
						var s = new Set();
						s.add(data.key);
						m.set(data.parent, s);

						return {
							mutate: {
								keyDependencies: m
							}
						};
					},

					"can.getName": function getName() {
						//!steal-remove-start
						if (process.env.NODE_ENV !== 'production') {
							var result = "ObservableFromScope<>";
							var data = scope.getDataForScopeSet(cleanVMName(scopeProp, scope));

							if (data.parent && data.key) {
								result = "ObservableFromScope<" +
									canReflect.getName(data.parent) +
									"." +
									data.key +
									">";
							}

							return result;
						}
						//!steal-remove-end
					},
				});

				var data = scope.getDataForScopeSet(cleanVMName(scopeProp, scope));
				if (data.parent && data.key) {
					// Register what changes the Scope's parent key
					canReflectDeps.addMutatedBy(data.parent, data.key, observation);
				}

				return observation;
			}
		}
	},
	// ### getObservableFrom.viewModel
	// Returns a compute that's two-way bound to the `viewModel` returned by
	// `options.bindingSettings()`.
	// Arguments:
	// - bindingData - {source, name, setCompute}
	// - bindingContext - {scope, element}
	// - bindingSettings - {getViewModel}
	viewModel: function(bindingData, bindingContext) {
		var scope = bindingContext.scope,
			vmName = bindingData.name,
			setCompute = bindingData.setCompute;

		var setName = cleanVMName(vmName, scope);
		var isBoundToContext = vmName === "." || vmName === "this";
		var keysToRead = isBoundToContext ? [] : stacheKey.reads(vmName);

		function getViewModelProperty() {
			var viewModel = bindingContext.viewModel;
			return stacheKey.read(viewModel, keysToRead, {}).value;
		}
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {

			Object.defineProperty(getViewModelProperty, "name", {
				value: "<"+bindingContext.element.tagName.toLowerCase()+">." + vmName
			});
		}
		//!steal-remove-end

		var observation = new SettableObservable(
			getViewModelProperty,

			function setViewModelProperty(newVal) {
				var viewModel = bindingContext.viewModel;

				if (setCompute) {
					// If there is a binding like `foo:from="~bar"`, we need
					// to set the observable itself.
					var oldValue = canReflect.getKeyValue(viewModel, setName);
					if (canReflect.isObservableLike(oldValue)) {
						canReflect.setValue(oldValue, newVal);
					} else {
						canReflect.setKeyValue(
							viewModel,
							setName,
							new SimpleObservable(canReflect.getValue(newVal))
						);
					}
				} else {
					if (isBoundToContext) {
						canReflect.setValue(viewModel, newVal);
					} else {
						stacheKey.write(viewModel, keysToRead, newVal);
					}
				}
			}
		);

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			var viewModel = bindingContext.viewModel;
			if (viewModel && setName) {
				canReflectDeps.addMutatedBy(viewModel, setName, observation);
			}
		}
		//!steal-remove-end

		return observation;
	},
	// ### getObservableFrom.attribute
	// Returns a compute that is two-way bound to an attribute or property on the element.
	attribute: function(bindingData, bindingContext ) {

		if(bindingData.name === "this") {
			return canReflect.assignSymbols({}, {
				"can.getValue": function() {
					return bindingContext.element;
				},

				"can.valueHasDependencies": function() {
					return false;
				},
				"can.getName": function getName() {
					//!steal-remove-start
					return "<"+bindingContext.element.nodeName+">";
					//!steal-remove-end
				}
			});
		} else {
			return new AttributeObservable(bindingContext.element, bindingData.name, {}, bindingData.event);
		}

	}
};

var startsWith = String.prototype.startsWith || function(text){
	return this.indexOf(text) === 0;
};

// Gets an event name in the after part.
function getEventName(result) {
	if (result.special.on !== undefined) {
		return result.tokens[result.special.on + 1];
	}
}

var siblingBindingRules = {
	to: {
		child: {
			exports: true,
			syncSibling: false
		},
		parent: {
			exports: false,
			syncSibling: false
		}
	},
	from: {
		child: {
			exports: false,
			syncSibling: false
		},
		parent: {
			exports: true,
			syncSibling: false
		}
	},
	bind: {
		child: {
			exports: true,
			syncSibling: false
		},
		parent: {
			exports: true,
			syncSibling: true
		}
	},
	raw: {
		child: {
			exports: false,
			syncSibling: false
		},
		parent: {
			exports: true,
			syncSibling: false
		}
	}
};
var bindingNames = [];
var special = {
	vm: true,
	on: true
};
canReflect.eachKey(siblingBindingRules, function(value, key) {
	bindingNames.push(key);
	special[key] = true;
});

// "on:click:value:to" //-> {tokens: [...], special: {on: 0, to: 3}}
function tokenize(source) {
	var splitByColon = source.split(":");
	// combine tokens that are not to, from, vm,
	var result = {
		tokens: [],
		special: {}
	};
	splitByColon.forEach(function(token) {
		if (special[token]) {
			result.special[token] = result.tokens.push(token) - 1;
		} else {
			result.tokens.push(token);
		}
	});

	return result;
}

// ## getChildBindingStr
var getChildBindingStr = function(tokens, favorViewModel) {
	if (tokens.indexOf('vm') >= 0) {
		return viewModelBindingStr;
	} else if (tokens.indexOf('el') >= 0) {
		return attributeBindingStr;
	} else {
		return favorViewModel ? viewModelBindingStr : viewModelOrAttributeBindingStr;
	}
};

// ## getSiblingBindingData
// Returns information about the binding read from an attribute node.
// Arguments:
// - node - An attribute node like: `{name, value}`
// - bindingSettings - Optional.  Has {favorViewModel: Boolean}
// Returns an object with:
// - `parent` - {source, name, event, exports, syncSibling}
// - `child` - {source, name, event, exports, syncSibling, setCompute}
// - `bindingAttributeName` - debugging name.
// - `initializeValues` - should parent and child be initialized to their counterpart.
//
// `parent` and `child` properties:
//
// - `source` - where is the value read from: "scope", "attribute", "viewModel".
// - `name` - the name of the property that should be read
// - `event` - an optional event name to listen to
// - `exports` - if the value is exported to its sibling
// - `syncSibling` - if the value is sticky. When this value is updated, should the value be checked after
//   and its sibling be updated immediately.
// - `setCompute` - set the value to a compute.
function getSiblingBindingData(node, bindingSettings) {

	var siblingBindingData,
		attributeName = encoder.decode(node.name),
		attributeValue = node.value || "";

	var result = tokenize(attributeName),
		dataBindingName,
		specialIndex;

	// check if there's a match of a binding name with at least a value before it
	bindingNames.forEach(function(name) {
		if (result.special[name] !== undefined && result.special[name] > 0) {
			dataBindingName = name;
			specialIndex = result.special[name];
			return false;
		}
	});

	if (dataBindingName) {
		var childEventName = getEventName(result);

		var initializeValues = childEventName && dataBindingName !== "bind" ? false : true;
		siblingBindingData = {
			parent: assign({
				source: scopeBindingStr,
				name: result.special.raw ? ('"' + attributeValue + '"') : attributeValue
			}, siblingBindingRules[dataBindingName].parent),
			child: assign({
				source: getChildBindingStr(result.tokens, bindingSettings && bindingSettings.favorViewModel),
				name: result.tokens[specialIndex - 1],
				event: childEventName
			}, siblingBindingRules[dataBindingName].child),
			bindingAttributeName: attributeName,
			initializeValues: initializeValues
		};
		if (attributeValue.trim().charAt(0) === "~") {
			siblingBindingData.child.setCompute = true;
		}
		return siblingBindingData;
	}
}



// ## makeDataBinding
// Makes a data binding for an attribute `node`.  Returns an object with information
// about the binding, including an `onTeardown` method that undoes the binding.
// If the data binding involves a `viewModel`, an `onCompleteBinding` method is returned on
// the object.  This method must be called after the element has a `viewModel` with the
// `viewModel` to complete the binding.
//
// Arguments:
// - `node` - an attribute node or an object with a `name` and `value` property.
// - `bindingContext` - The stache context  `{scope, element, parentNodeList}`
// - `bindingSettings` - Settings to control the behavior.
//   - `getViewModel`  - a function that returns the `viewModel` when called.  This function can be passed around (not called) even if the
//      `viewModel` doesn't exist yet.
//   - `attributeViewModelBindings` - properties already specified as being a viewModel<->attribute (as opposed to viewModel<->scope) binding.
//   - `favorViewModel`
//   - `alreadyUpdatedChild`
// Returns:
// - `undefined` - If this isn't a data binding.
// - `object` - An object with information about the binding:
//   - siblingBindingData: the binding behavior
//   - binding: canBinding
var makeDataBinding = function(node, bindingContext, bindingSettings) {
	// Get information about the binding.
	var siblingBindingData = getSiblingBindingData( node, bindingSettings );
	if (!siblingBindingData) {
		return;
	}

	// Get computes for the parent and child binding
	var parentObservable = getObservableFrom[siblingBindingData.parent.source](
		siblingBindingData.parent,
		bindingContext, bindingSettings
	),
	childObservable = getObservableFrom[siblingBindingData.child.source](
		siblingBindingData.child,
		bindingContext, bindingSettings,
		parentObservable
	);

	var childToParent = !!siblingBindingData.child.exports;
	var parentToChild = !!siblingBindingData.parent.exports;

	// Check for child:bind="~parent" (it’s not supported because it’s unclear
	// what the “right” behavior should be)

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		if (siblingBindingData.child.setCompute && childToParent && parentToChild) {
			dev.warn("Two-way binding computes is not supported.");
		}
	}
	//!steal-remove-end

	var bindingOptions = {
		child: childObservable,
		childToParent: childToParent,
		// allow cycles if one directional
		cycles: childToParent === true && parentToChild === true ? 0 : 100,
		onInitDoNotUpdateChild: bindingSettings.alreadyUpdatedChild || siblingBindingData.initializeValues === false,
		onInitDoNotUpdateParent: siblingBindingData.initializeValues === false,
		onInitSetUndefinedParentIfChildIsDefined: true,
		parent: parentObservable,
		parentToChild: parentToChild,
		priority: bindingContext.parentNodeList ? bindingContext.parentNodeList.nesting + 1 : undefined,
		queue: "dom",
		sticky: siblingBindingData.parent.syncSibling ? "childSticksToParent" : undefined,
		element: bindingContext.element
	};

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		var nodeHTML = encoder.decode(node.name)+"="+JSON.stringify(node.value);
		var tagStart = "<"+bindingContext.element.nodeName.toLowerCase(),
			tag = tagStart+">";

		var makeUpdateName = function(child, childName) {

			if(child === "viewModel") {
				return tag+"."+childName;
			}
			else if(child === "scope") {
				return "{{"+childName+"}}";
			}
			else {
				return ""+child+"."+childName;
			}
		};
		bindingOptions.debugName = tagStart+" "+nodeHTML+">";
		bindingOptions.updateChildName = bindingOptions.debugName+" updates "+
			makeUpdateName(siblingBindingData.child.source, siblingBindingData.child.name)+
			" from "+makeUpdateName(siblingBindingData.parent.source, siblingBindingData.parent.name);

		bindingOptions.updateParentName = bindingOptions.debugName+" updates "+
			makeUpdateName(siblingBindingData.parent.source, siblingBindingData.parent.name)+
			" from "+makeUpdateName(siblingBindingData.child.source, siblingBindingData.child.name);
	}
	//!steal-remove-end

	// Create the binding
	var canBinding = new Bind(bindingOptions);

	return {
		siblingBindingData: siblingBindingData,
		binding: canBinding
	};
};

var cleanVMName = function(name, scope) {
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		if (name.indexOf("@") >= 0 && scope) {
			var filename = scope.peek('scope.filename');
			var lineNumber = scope.peek('scope.lineNumber');

			dev.warn(
				(filename ? filename + ':' : '') +
				(lineNumber ? lineNumber + ': ' : '') +
				'functions are no longer called by default so @ is unnecessary in \'' + name + '\'.');
		}
	}
	//!steal-remove-end
	return name.replace(/@/g, "");
};

var canStacheBindings = {
	behaviors: behaviors,
	getSiblingBindingData: getSiblingBindingData,
	bindings: bindings,
	getObservableFrom: getObservableFrom,
	makeDataBinding: makeDataBinding
};

canStacheBindings[canSymbol.for("can.callbackMap")] = bindings;

module.exports = canStacheBindings;
