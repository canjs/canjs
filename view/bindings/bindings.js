// # can/view/bindings/bindings.js
//
// This module provides CanJS's default data and event bindings.
// It's broken up into several parts:
// 
// - Behaviors - Binding behaviors that run given an attribute or element.
// - Attribute Syntaxes - Hooks up custom attributes to their behaviors.
// - getComputeFrom - Methods that return a compute cross bound to the scope, viewModel, or element.
// - bind - Methods for setting up cross binding
// - getBindingInfo - A helper that returns the details of a data binding given an attribute.
// - makeDataBinding - A helper method for setting up a data binding.
// - initializeValues - A helper that initializes a data binding.
steal("can/util",
	"can/view/stache/expression.js",
	"can/view/callbacks",
	"can/view/live",
	"can/view/scope",
	"can/view/href", function (can, expression, viewCallbacks, live) {
	
	// ## Behaviors
	var behaviors = {
		// ### bindings.behaviors.viewModel
		// Sets up all of an element's data binding attributes to a "soon-to-be-created"
		// `viewModel`. 
		// This is primarily used by `can.Component` to ensure that its
		// `viewModel` is initialized with values from the data bindings as quickly as possible.
		// Component could look up the data binding values itself.  However, that lookup
		// would have to be duplicated when the bindings are established.
		// Instead, this uses the `makeDataBinding` helper, which allows creation of the `viewModel`
		// after scope values have been looked up.
		//
		// - `makeViewModel(initialViewModelData)` - a function that returns the `viewModel`.
		// - `initialViewModelData` any initial data that should already be added to the `viewModel`.
		//
		// Returns:
		// - `function` - a function that tears all the bindings down. Component
		// wants all the bindings active so cleanup can be done during a component being removed.
		viewModel: function(el, tagData, makeViewModel, initialViewModelData){
			initialViewModelData = initialViewModelData || {};
			
			var bindingsSemaphore = {},
				viewModel,
				// Stores callbacks for when the viewModel is created.
				onCompleteBindings = [],
				// Stores what needs to be called when the element is removed
				// to prevent memory leaks.
				onTeardowns = {},
				// Track info about each binding, we need this for binding attributes correctly.
				bindingInfos = {},
				attributeViewModelBindings = can.extend({}, initialViewModelData);
			
			// For each attribute, we start the binding process,
			// and save what's returned to be used when the `viewModel` is created,
			// the element is removed, or the attribute changes values.
			can.each( can.makeArray(el.attributes), function(node){
				
				var dataBinding = makeDataBinding(node, el, {
					templateType: tagData.templateType,
					scope: tagData.scope,
					semaphore: bindingsSemaphore,
					getViewModel: function(){
						return viewModel;
					},
					attributeViewModelBindings: attributeViewModelBindings,
					alreadyUpdatedChild: true,
					nodeList: tagData.parentNodeList
				});
				if(dataBinding) {
					// For bindings that change the viewModel,
					if(dataBinding.onCompleteBinding) {
						// save the initial value on the viewModel.
						if(dataBinding.bindingInfo.parentToChild && dataBinding.value !== undefined) {
							initialViewModelData[cleanVMName(dataBinding.bindingInfo.childName)] = dataBinding.value;
						}
						// Save what needs to happen after the `viewModel` is created.
						onCompleteBindings.push(dataBinding.onCompleteBinding);
					}
					onTeardowns[node.name] = dataBinding.onTeardown;
				}
				
			});
			
			// Create the `viewModel` and call what needs to be happen after
			// the `viewModel` is created.
			viewModel = makeViewModel(initialViewModelData);
			
			for(var i = 0, len = onCompleteBindings.length; i < len; i++) {
				onCompleteBindings[i]();
			}
			
			// Listen to attribute changes and re-initialize
			// the bindings.
			can.bind.call(el, "attributes", function (ev) {
				
				var attrName = ev.attributeName,
					value = el.getAttribute(attrName);
				
				if( onTeardowns[attrName] ) {
					onTeardowns[attrName]();
				}
				// Parent attribute bindings we always re-setup.
				var parentBindingWasAttribute = bindingInfos[attrName] && bindingInfos[attrName].parent === "attribute";
				
				if(value !== null || parentBindingWasAttribute ) {
					var dataBinding = makeDataBinding({name: attrName, value: value}, el, {
						templateType: tagData.templateType,
						scope: tagData.scope,
						semaphore: {},
						getViewModel: function(){
							return viewModel;
						},
						attributeViewModelBindings: attributeViewModelBindings,
						// always update the viewModel accordingly.
						initializeValues: true,
						nodeList: tagData.parentNodeList
					});
					if(dataBinding) {
						// The viewModel is created, so call callback immediately.
						if(dataBinding.onCompleteBinding) {
							dataBinding.onCompleteBinding();
						}
						bindingInfos[attrName] = dataBinding.bindingInfo;
						onTeardowns[attrName] = dataBinding.onTeardown;
					}
				}
			});
			
			return function(){
				for(var attrName in onTeardowns) {
					onTeardowns[attrName]();
				}
			};
		},
		// ### bindings.behaviors.data
		// This is called when an individual data binding attribute is placed on an element.
		// For example `{^value}="name"`.
		data: function(el, attrData){
			if(can.data(can.$(el),"preventDataBindings")){
				return;
			}
			var viewModel = can.viewModel(el),
				semaphore = {},
				teardown;
			
			// Setup binding
			var dataBinding = makeDataBinding({
				name: attrData.attributeName,
				value: el.getAttribute(attrData.attributeName),
				nodeList: attrData.nodeList
			}, el, {
				templateType: attrData.templateType,
				scope: attrData.scope,
				semaphore: semaphore,
				getViewModel: function(){
					return viewModel;
				}
			});
			
			if(dataBinding.onCompleteBinding) {
				dataBinding.onCompleteBinding();
			}
			teardown = dataBinding.onTeardown;

			can.one.call(el, 'removed', function(){
				teardown();
			});
			
			// Listen for changes
			can.bind.call(el, "attributes", function (ev) {
				var attrName = ev.attributeName,
					value = el.getAttribute(attrName);
					
				if( attrName === attrData.attributeName ) {
					
					if( teardown ) {
						teardown();
					}
					
					if(value !== null  ) {
						
						var dataBinding = makeDataBinding({name: attrName, value: value}, el, {
							templateType: attrData.templateType,
							scope: attrData.scope,
							semaphore: semaphore,
							getViewModel: function(){
								return viewModel;
							},
							// always update the viewModel accordingly.
							initializeValues: true,
							nodeList: attrData.nodeList
						});
						if(dataBinding) {
							// The viewModel is created, so call callback immediately.
							if(dataBinding.onCompleteBinding) {
								dataBinding.onCompleteBinding();
							}
							teardown = dataBinding.onTeardown;
						}
					}
					
				}
			});
		},
		// ### bindings.behaviors.reference
		// Provides the shorthand `*ref` behavior that exports the `viewModel`.
		// For example `{^value}="name"`.
		reference: function(el, attrData) {
			if(el.getAttribute(attrData.attributeName)) {
				console.warn("*reference attributes can only export the view model.");
			}
	
			var name = can.camelize( attrData.attributeName.substr(1).toLowerCase() );
	
			var viewModel = can.viewModel(el);
			var refs = attrData.scope.getRefs();
			refs._context.attr("*"+name, viewModel);
		},
		// ### bindings.behaviors.event
		// The following section contains code for implementing the can-EVENT attribute.
		// This binds on a wildcard attribute name. Whenever a view is being processed
		// and can-xxx (anything starting with can-), this callback will be run.  Inside, its setting up an event handler
		// that calls a method identified by the value of this attribute.
		event: function(el, data) {
	
			// Get the `event` name and if we are listening to the element or viewModel.
			// The attribute name is the name of the event.
			var attributeName = data.attributeName,
			// The old way of binding is can-X
				legacyBinding = attributeName.indexOf('can-') === 0,
				event = attributeName.indexOf('can-') === 0 ?
					attributeName.substr("can-".length) :
					can.camelize(removeBrackets(attributeName, '(', ')')),
				onBindElement = legacyBinding;
	
			if(event.charAt(0) === "$") {
				event = event.substr(1);
				onBindElement = true;
			}
	
	
			// This is the method that the event will initially trigger. It will look up the method by the string name
			// passed in the attribute and call it.
			var handler = function (ev) {
					var attrVal = el.getAttribute(attributeName);
					if (!attrVal) { return; }
	
					var $el = can.$(el),
						viewModel = can.viewModel($el[0]);
	
					// expression.parse will read the attribute
					// value and parse it identically to how mustache helpers
					// get parsed.
					var expr = expression.parse(removeBrackets(attrVal),{lookupRule: "method", methodRule: "call"});
	
					if(!(expr instanceof expression.Call) && !(expr instanceof expression.Helper)) {
						var defaultArgs = can.map( [data.scope._context, $el].concat(can.makeArray(arguments) ), function(data){
							return new expression.Literal(data);
						});
						expr = new expression.Call(expr, defaultArgs, {} );
					}
	
					// make a scope with these things just under
	
					var localScope = data.scope.add({
						"@element": $el,
						"@event": ev,
						"@viewModel": viewModel,
						"@scope": data.scope,
						"@context": data.scope._context,
	
						"%element": this,
						"$element": $el,
						"%event": ev,
						"%viewModel": viewModel,
						"%scope": data.scope,
						"%context": data.scope._context
					},{
						notContext: true
					});
	
					// We grab the first item and treat it as a method that
					// we'll call.
					var scopeData = localScope.read(expr.methodExpr.key, {
						isArgument: true
					});
	
					// We break out early if the first argument isn't available
					// anywhere.
	
					if (!scopeData.value) {
						scopeData = localScope.read(expr.methodExpr.key, {
							isArgument: true
						});
	
						//!steal-remove-start
						can.dev.warn("can/view/bindings: " + attributeName + " couldn't find method named " + expr.methodExpr.key, {
							element: el,
							scope: data.scope
						});
						//!steal-remove-end
	
						return null;
					}

					var args = expr.args(localScope, null)();
					
	
					return scopeData.value.apply(scopeData.parent, args);
				};
	
			// This code adds support for special event types, like can-enter="foo". special.enter (or any special[event]) is
			// a function that returns an object containing an event and a handler. These are to be used for binding. For example,
			// when a user adds a can-enter attribute, we'll bind on the keyup event, and the handler performs special logic to
			// determine on keyup if the enter key was pressed.
			if (special[event]) {
				var specialData = special[event](data, el, handler);
				handler = specialData.handler;
				event = specialData.event;
			}
			// Bind the handler defined above to the element we're currently processing and the event name provided in this
			// attribute name (can-click="foo")
			can.bind.call(onBindElement ? el : can.viewModel(el), event, handler);
	
			// Create a handler that will unbind itself and the event when the attribute is removed from the DOM
			var attributesHandler = function(ev) {
				if(ev.attributeName === attributeName && !this.getAttribute(attributeName)) {
	
					can.unbind.call(onBindElement ? el : can.viewModel(el), event, handler);
					can.unbind.call(el, 'attributes', attributesHandler);
				}
			};
			can.bind.call(el, 'attributes', attributesHandler);
		},
		// ### bindings.behaviors.value
		// Behavior for the deprecated can-value
		value: function(el, data) {
			var propName = "$value",
				attrValue = can.trim(removeBrackets(el.getAttribute("can-value"))),
				getterSetter;
	
			if (el.nodeName.toLowerCase() === "input" && ( el.type === "checkbox" || el.type === "radio" ) ) {
	
				var property = getComputeFrom.scope(el, data.scope, attrValue, {}, true);
				if (el.type === "checkbox") {
	
					var trueValue = can.attr.has(el, "can-true-value") ? el.getAttribute("can-true-value") : true,
						falseValue = can.attr.has(el, "can-false-value") ? el.getAttribute("can-false-value") : false;
	
					getterSetter = can.compute(function(newValue){
						// jshint eqeqeq: false
						if(arguments.length) {
							property(newValue ? trueValue : falseValue);
						}
						else {
							return property() == trueValue;
						}
					});
				}
				else if(el.type === "radio") {
					// radio is two-way bound to if the property value
					// equals the element value
	
					getterSetter = can.compute(function(newValue){
						// jshint eqeqeq: false
						if(arguments.length) {
							if( newValue ) {
								property(el.value);
							}
						}
						else {
							return property() == el.value;
						}
					});
	
				}
				propName = "$checked";
				attrValue = "getterSetter";
				data.scope = new can.view.Scope({
					getterSetter: getterSetter
				});
			}
			// For contenteditable elements, we instantiate a Content control.
			else if (isContentEditable(el)) {
				propName = "$innerHTML";
			}
	
			var dataBinding = makeDataBinding({
				name: "{("+propName+"})",
				value: attrValue
			}, el, {
				templateType: data.templateType,
				scope: data.scope,
				semaphore: {},
				initializeValues: true,
				legacyBindings: true,
				syncChildWithParent: true
			});
			
			can.one.call(el, 'removed', function(){
				dataBinding.onTeardown();
			});
	
		}
	};
	
		
	// ## Attribute Syntaxes
	// The following sets up the bindings functions to be called 
	// when called in a template.
	
	// `{}="bar"` data bindings.
	can.view.attr(/^\{[^\}]+\}$/, behaviors.data);

	// `*ref-export` shorthand.
	can.view.attr(/\*[\w\.\-_]+/, behaviors.reference);

	// `(EVENT)` event bindings.
	can.view.attr(/^\([\$?\w\.\-]+\)$/, behaviors.event);
	
	
	//!steal-remove-start
	function syntaxWarning(el, attrData) {
		can.dev.warn('can/view/bindings/bindings.js: mismatched binding syntax - ' + attrData.attributeName);
	}
	can.view.attr(/^\(.+\}$/, syntaxWarning);
	can.view.attr(/^\{.+\)$/, syntaxWarning);
	can.view.attr(/^\(\{.+\}\)$/, syntaxWarning);
	//!steal-remove-end

	
	// Legacy bindings.
	can.view.attr(/can-[\w\.]+/, behaviors.event);
	can.view.attr("can-value", behaviors.value);
	
	
	// ## getComputeFrom
	// An object of helper functions that make a getter/setter compute
	// on different types of objects.
	var getComputeFrom = {
		// ### getComputeFrom.scope
		// Returns a compute from the scope.  This handles expressions like `someMethod(.,1)`.
		scope: function(el, scope, scopeProp, bindingData, mustBeACompute, stickyCompute){
			if(!scopeProp) {
				return can.compute();
			} else {
				if(mustBeACompute) {
					var parentExpression = expression.parse(scopeProp,{baseMethodType: "Call"});
					return parentExpression.value(scope, new can.view.Options({}));
				} else {
					return function(newVal){
						scope.attr(cleanVMName(scopeProp), newVal);
					};
				}
				
			}
			
		},
		// ### getComputeFrom.viewModel
		// Returns a compute that's two-way bound to the `viewModel` returned by 
		// `options.getViewModel()`.
		viewModel: function(el, scope, vmName, bindingData, mustBeACompute, stickyCompute) {
			var setName = cleanVMName(vmName);
			if(mustBeACompute) {
				return can.compute(function(newVal){
					var viewModel = bindingData.getViewModel();
					if(arguments.length) {
						viewModel.attr(setName,newVal);
					} else {
						return vmName === "." ? viewModel : can.compute.read(viewModel, can.compute.read.reads(vmName), {}).value;
					}
				});
			} else {

				return function(newVal){
					var childCompute;
					var viewModel = bindingData.getViewModel();

					if(stickyCompute) {
						childCompute = viewModel._get(setName, { readCompute: false });
						// childCompute is a compute at this point unless it was locally overwritten
						//  in the child viewModel.
						if(!childCompute || !childCompute.isComputed) {
							// If it was locally overwritten, make a new compute for the property.
							childCompute = can.compute();
							viewModel._set(setName, childCompute, { readCompute: false });
						}
						// Otherwise update the compute's value.
						childCompute(newVal);
					} else {
						viewModel.attr(setName,newVal);
					}
				};
			}
		},
		// ### getComputeFrom.attribute
		// Returns a compute that is two-way bound to an attribute or property on the element.
		attribute: function(el, scope, prop, bindingData, mustBeACompute, stickyCompute, event){
			var hasChildren = el.nodeName.toLowerCase() === "select",
				isMultiselectValue = prop === "value" && hasChildren && el.multiple,
				isStringValue,
				lastSet,
				scheduledAsyncSet = false,
				timer,
				parentEvents,
				originalValue;

			// Determine the event or events we need to listen to 
			// when this value changes.
			if(!event) {
				if(prop === "innerHTML") {
					event = ["blur","change"];
				}
				else {
					event = "change";
				}
			}
			if(!can.isArray(event)) {
				event = [event];
			}
	
			
			// Sets the element property or attribute.
			var set = function(newVal){
					// Templates write parent's out before children.  This should probably change.
					// But it means we don't do a set immediately.
					if(hasChildren && !scheduledAsyncSet) {
						clearTimeout(timer);
						timer = setTimeout(function(){
							set(newVal);
						},1);
					}
					
					lastSet = newVal;
					
					if(isMultiselectValue) {
						if (newVal && typeof newVal === 'string') {
							newVal = newVal.split(";");
							isStringValue = true;
						}
						// When given something else, try to make it an array and deal with it
						else if (newVal) {
							newVal = can.makeArray(newVal);
						} else {
							newVal = [];
						}
	
						// Make an object containing all the options passed in for convenient lookup
						var isSelected = {};
						can.each(newVal, function (val) {
							isSelected[val] = true;
						});
	
						// Go through each &lt;option/&gt; element, if it has a value property (its a valid option), then
						// set its selected property if it was in the list of vals that were just set.
						can.each(el.childNodes, function (option) {
							if (option.value) {
								option.selected = !! isSelected[option.value];
							}
						});
					} else {
						if(!bindingData.legacyBindings && hasChildren && ("selectedIndex" in el) && prop === "value" ) {
							can.attr.setSelectValue(el, newVal);
						} else {
							can.attr.setAttrOrProp(el, prop, newVal == null ? "" : newVal);
						}
					}
					
					return newVal;
	
				},
				// Returns the value of the element property or attribute.
				get = function(){
					if(isMultiselectValue) {
	
						var values = [],
							children = el.childNodes;
	
						can.each(children, function (child) {
							if (child.selected && child.value) {
								values.push(child.value);
							}
						});

						return isStringValue ? values.join(";"): values;
					} else if(hasChildren && ("selectedIndex" in el) && el.selectedIndex === -1) {
						return undefined;
					}

					return can.attr.get(el, prop);
				};
			
			// If the element has children like `<select>`, those
			// elements are hydrated (by can.view.target) after the select and only then
			// get their `value`s set. This make sure that when the value is set,
			// it will happen after the children are setup.
			if(hasChildren) {
				// have to set later ... probably only with mustache.
				setTimeout(function(){
					scheduledAsyncSet = true;
				},1);
				// The following would allow a select's value
				// to be undefined.
				// el.selectedIndex = -1;
			}

			// If the element is an input element in a form
			if(el.tagName && el.tagName.toLowerCase() === "input" && el.form){
				parentEvents = [{
					el: el.form,
					eventName: "reset",
					handler: function(){
						set(originalValue);
					}
				}];
			}

			var observer;

			originalValue = get();
			
			return can.compute(originalValue,{
				on: function(updater){
					can.each(event, function(eventName){
						can.bind.call(el, eventName, updater);
					});
					can.each(parentEvents, function(parentEvent){
						can.bind.call(parentEvent.el, parentEvent.eventName, parentEvent.handler);
					});
					if(hasChildren) {
						var onMutation = function (mutations) {
							
							if(stickyCompute) {
								set(stickyCompute());
							}
							
							updater();
						};
						if(can.attr.MutationObserver) {
							observer = new can.attr.MutationObserver(onMutation);
							observer.observe(el, {
								childList: true,
								subtree: true
							});
						} else {
							// TODO: Remove in 3.0. Can't store a function b/c Zepto doesn't support it.
							can.data(can.$(el), "canBindingCallback", {onMutation: onMutation});
						}
					}
					
				},
				off: function(updater){
					can.each(event, function(eventName){
						can.unbind.call(el,eventName, updater);
					});
					can.each(parentEvents, function(parentEvent){
						can.unbind.call(parentEvent.el, parentEvent.eventName, parentEvent.handler);
					});
					if(hasChildren) {
						if(can.attr.MutationObserver) {
							observer.disconnect();
						} else {
							can.data(can.$(el), "canBindingCallback",null);
						}
					}
				},
				get: get,
				set: set
			});
		}
	};
	
	// ## bind
	// An object with helpers that perform bindings in a certain direction.  
	// These use the semaphore to prevent cycles.
	var bind = {
		// ## bind.childToParent
		// Listens to the child and updates the parent when it changes.
		// - `syncChild` - Makes sure the child is equal to the parent after the parent is set.
		childToParent: function(el, parentCompute, childCompute, bindingsSemaphore, attrName, syncChild){
			var parentUpdateIsFunction = typeof parentCompute === "function";
	
			// Updates the parent if 
			var updateParent = function(ev, newVal){
				if (!bindingsSemaphore[attrName]) {
					if(parentUpdateIsFunction) {
						parentCompute(newVal);
						
						if( syncChild ) {
							// If, after setting the parent, it's value is not the same as the child,
							// update the child with the value of the parent.
							// This is used by `can-value`.
							if(parentCompute() !== childCompute()) {
								bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0 )+1;
								can.batch.start();
								childCompute(parentCompute());
								can.batch.after(function(){
									--bindingsSemaphore[attrName];
								});
								can.batch.stop();
							}
						}
					}
					// The parentCompute can sometimes be just an observable if the observable
					// is on a plain JS object. This updates the observable to match whatever the
					// new value is.
					else if(parentCompute instanceof can.Map) {
						parentCompute.attr(newVal, true);
					}
				}
			};
	
			if(childCompute && childCompute.isComputed) {
				childCompute.bind("change", updateParent);
			}
	
			return updateParent;
		},
		// parent -> child binding
		parentToChild: function(el, parentCompute, childUpdate, bindingsSemaphore, attrName){
	
			// setup listening on parent and forwarding to viewModel
			var updateChild = function(ev, newValue){
				// Save the viewModel property name so it is not updated multiple times.
				bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0 )+1;
				can.batch.start();
				childUpdate(newValue);
	
				// only after the batch has finished, reduce the update counter
				can.batch.after(function(){
					--bindingsSemaphore[attrName];
				});
				can.batch.stop();
			};
	
			if(parentCompute && parentCompute.isComputed) {
				parentCompute.bind("change", updateChild);
			}
	
			return updateChild;
		}
	};
	
	// ## getBindingInfo
	// takes a node object like {name, value} and returns
	// an object with information about that binding.
	// Properties:
	// - `parent` - where is the parentName read from: "scope", "attribute", "viewModel".
	// - `parentName` - what is the parent property that should be read.
	// - `child` - where is the childName read from: "scope", "attribute", "viewModel".
	//  - `childName` - what is the child property that should be read.
	// - `parentToChild` - should changes in the parent update the child.
	// - `childToParent` - should changes in the child update the parent.
	// - `bindingAttributeName` - the attribute name that created this binding.
	// - `initializeValues` - should parent and child be initialized to their counterpart.
	// If undefined is return, there is no binding.
	var getBindingInfo = function(node, attributeViewModelBindings, templateType, tagName){
		var bindingInfo,
			attributeName = node.name,
			attributeValue = node.value || "";
		
		// Does this match the new binding syntax?
		var matches = attributeName.match(bindingsRegExp);
		if(!matches) {
			var ignoreAttribute = ignoreAttributesRegExp.test(attributeName);
			var vmName = can.camelize(attributeName);
			
			//!steal-remove-start
			// user tried to pass something like id="{foo}", so give them a good warning
			if(ignoreAttribute) {
				can.dev.warn("can/component: looks like you're trying to pass "+attributeName+" as an attribute into a component, "+
				"but it is not a supported attribute");
			}
			//!steal-remove-end
			
			// if this is handled by another binding or a attribute like `id`.
			if ( ignoreAttribute || viewCallbacks.attr(attributeName) ) {
				return;
			}
			var syntaxRight = attributeValue[0] === "{" && can.last(attributeValue) === "}";
			var isAttributeToChild = templateType === "legacy" ? attributeViewModelBindings[vmName] : !syntaxRight;
			var scopeName = syntaxRight ? attributeValue.substr(1, attributeValue.length - 2 ) : attributeValue;
			if(isAttributeToChild) {
				return {
					bindingAttributeName: attributeName,
					parent: "attribute",
					parentName: attributeName,
					child: "viewModel",
					childName: vmName,
					parentToChild: true,
					childToParent: true
				};
			} else {
				return {
					bindingAttributeName: attributeName,
					parent: "scope",
					parentName: scopeName,
					child: "viewModel",
					childName: vmName,
					parentToChild: true,
					childToParent: true
				};
			}
		}
		
		var twoWay = !!matches[1],
			childToParent = twoWay || !!matches[2],
			parentToChild = twoWay || !childToParent;
		
		var childName = matches[3];
		var isDOM = childName.charAt(0) === "$";
		if(isDOM) {
			bindingInfo = {
				parent: "scope",
				child: "attribute",
				childToParent: childToParent,
				parentToChild: parentToChild,
				bindingAttributeName: attributeName,
				childName: childName.substr(1),
				parentName: attributeValue,
				initializeValues: true
			};
			if(tagName === "select") {
				bindingInfo.stickyParentToChild = true;
			}
			return bindingInfo;
		} else {
			bindingInfo = {
				parent: "scope",
				child: "viewModel",
				childToParent: childToParent,
				parentToChild: parentToChild,
				bindingAttributeName: attributeName,
				childName: can.camelize(childName),
				parentName: attributeValue,
				initializeValues: true
			};
			if(attributeValue.trim().charAt(0) === "~") {
				bindingInfo.stickyParentToChild = true;
			}
			return bindingInfo;
		}

	};
	// Regular expressions for getBindingInfo
	var bindingsRegExp = /\{(\()?(\^)?([^\}\)]+)\)?\}/,
		ignoreAttributesRegExp = /^(data-view-id|class|id|\[[\w\.-]+\]|#[\w\.-])$/i;
	
	
	// ## makeDataBinding
	// Makes a data binding for an attribute `node`.  Returns an object with information
	// about the binding, including an `onTeardown` method that undoes the binding.  
	// If the data binding involves a `viewModel`, an `onCompleteBinding` method is returned on
	// the object.  This method must be called after the element has a `viewModel` with the
	// `viewModel` to complete the binding.
	// 
	// - `node` - an attribute node or an object with a `name` and `value` property.
	// - `el` - the element this binding belongs on.
	// - `bindingData` - an object with:
	//   - `templateType` - the type of template. Ex: "legacy" for mustache.
	//   - `scope` - the `can.view.Scope`,
	//   - `semaphore` - an object that keeps track of changes in different properties to prevent cycles,
	//   - `getViewModel`  - a function that returns the `viewModel` when called.  This function can be passed around (not called) even if the 
	//      `viewModel` doesn't exist yet.
	//   - `attributeViewModelBindings` - properties already specified as being a viewModel<->attribute (as opposed to viewModel<->scope) binding.
	// 
	// Returns:
	// - `undefined` - If this isn't a data binding.
	// - `object` - An object with information about the binding.
	var makeDataBinding = function(node, el, bindingData){
		
		// Get information about the binding.
		var bindingInfo = getBindingInfo(node, bindingData.attributeViewModelBindings, bindingData.templateType, el.nodeName.toLowerCase());
		if(!bindingInfo) {
			return;
		}
		// assign some bindingData props to the bindingInfo
		bindingInfo.alreadyUpdatedChild = bindingData.alreadyUpdatedChild;
		if( bindingData.initializeValues) {
			bindingInfo.initializeValues = true;
		}
		
		// Get computes for the parent and child binding
		var parentCompute = getComputeFrom[bindingInfo.parent](el, bindingData.scope, bindingInfo.parentName, bindingData, bindingInfo.parentToChild),
			childCompute = getComputeFrom[bindingInfo.child](el, bindingData.scope, bindingInfo.childName, bindingData, bindingInfo.childToParent, bindingInfo.stickyParentToChild && parentCompute),
			// these are the functions bound to one compute that update the other.
			updateParent,
			updateChild,
			childLifecycle;
		
		if(bindingData.nodeList) {
			if(parentCompute && parentCompute.isComputed){
				parentCompute.computeInstance.setPrimaryDepth(bindingData.nodeList.nesting+1);
			}
			if(childCompute && childCompute.isComputed){
				childCompute.computeInstance.setPrimaryDepth(bindingData.nodeList.nesting+1);
			}
		}

		// Only bind to the parent if it will update the child.
		if(bindingInfo.parentToChild){
			updateChild = bind.parentToChild(el, parentCompute, childCompute, bindingData.semaphore, bindingInfo.bindingAttributeName);
		}
		
		// This completes the binding.  We can't call it right away because
		// the `viewModel` might not have been created yet.
		var completeBinding = function(){
			if(bindingInfo.childToParent){
				// setup listening on parent and forwarding to viewModel
				updateParent = bind.childToParent(el, parentCompute, childCompute, bindingData.semaphore, bindingInfo.bindingAttributeName,
					bindingData.syncChildWithParent);
			}
			// the child needs to be bound even if
			else if(bindingInfo.stickyParentToChild) {
				childCompute.bind("change", childLifecycle = can.k);
			}
			
			if(bindingInfo.initializeValues) {
				initializeValues(bindingInfo, childCompute, parentCompute, updateChild, updateParent);
			}
			
			
		};
		// This tears down the binding.
		var onTeardown = function() {
			unbindUpdate(parentCompute, updateChild);
			unbindUpdate(childCompute, updateParent);
			unbindUpdate(childCompute, childLifecycle);
		};
		// If this binding depends on the viewModel, which might not have been created,
		// return the function to complete the binding as `onCompleteBinding`.
		if(bindingInfo.child === "viewModel") {
			return {
				value: getValue(parentCompute),
				onCompleteBinding: completeBinding,
				bindingInfo: bindingInfo,
				onTeardown: onTeardown
			};
		} else {
			completeBinding();
			return {
				bindingInfo: bindingInfo,
				onTeardown: onTeardown
			};
			
		}
	};
	
	// ## initializeValues
	// Updates the parent or child value depending on the direction of the binding
	// or if the child or parent is `undefined`.
	var initializeValues = function(bindingInfo, childCompute, parentCompute, updateChild, updateParent){
		var doUpdateParent = false;
		if(bindingInfo.parentToChild && !bindingInfo.childToParent) {
			if(bindingInfo.stickyParentToChild) {
				// call updateChild here to set up the compute
				updateChild({}, getValue(parentCompute));
			}

		}
		else if(!bindingInfo.parentToChild && bindingInfo.childToParent) {
			doUpdateParent = true;
		}
		// Two way
		// Update child or parent depending on who has a value.
		// If both have a value, update the child.
		else if( getValue(childCompute) === undefined) {
			// updateChild
		} else if(getValue(parentCompute) === undefined) {
			doUpdateParent = true;
		}
		
		if(doUpdateParent) {
			updateParent({}, getValue(childCompute) );
		} else {
			if(!bindingInfo.alreadyUpdatedChild) {
				updateChild({}, getValue(parentCompute) );
			}
		}
	};
	
	// For "sticky" select values, we need to know when `<option>`s are
	// added or removed to a `<select>`.  If we don't have 
	// MutationObserver, we need to setup can.view.live to
	// callback when this happens.
	if( !can.attr.MutationObserver ) {
		var updateSelectValue = function(el){
			var bindingCallback = can.data(can.$(el),"canBindingCallback");
			if(bindingCallback) {
				bindingCallback.onMutation(el);
			}
		};
		live.registerChildMutationCallback("select",updateSelectValue);
		live.registerChildMutationCallback("optgroup",function(el){
			updateSelectValue(el.parentNode);
		});
	}
	
	
	// ## isContentEditable
	// Determines if an element is contenteditable.
	// An element is contenteditable if it contains the `contenteditable`
	// attribute set to either an empty string or "true".
	// By default an element is also contenteditable if its immediate parent
	// has a truthy version of the attribute, unless the element is explicitly
	// set to "false".
	var isContentEditable = (function(){
		// A contenteditable element has a value of an empty string or "true"
		var values = {
			"": true,
			"true": true,
			"false": false
		};

		// Tests if an element has the appropriate contenteditable attribute
		var editable = function(el){
			// DocumentFragments do not have a getAttribute
			if(!el || !el.getAttribute) {
				return;
			}

			var attr = el.getAttribute("contenteditable");
			return values[attr];
		};

		return function (el){
			// First check if the element is explicitly true or false
			var val = editable(el);
			if(typeof val === "boolean") {
				return val;
			} else {
				// Otherwise, check the parent
				return !!editable(el.parentNode);
			}
		};
	})(),
		removeBrackets = function(value, open, close){
			open = open || "{";
			close = close || "}";

			if(value[0] === open && value[value.length-1] === close) {
				return value.substr(1, value.length - 2);
			}
			return value;
		},
		getValue = function(value){
			return value && value.isComputed ? value() : value;
		},
		unbindUpdate = function(compute, updateOther){
			if(compute && compute.isComputed && typeof updateOther === "function") {
				compute.unbind("change", updateOther);
			}
		},
		cleanVMName = function(name){
			return name.replace(/@/g,"");
		};

	
	// ## Special Event Types (can-SPECIAL)
	// 
	// A special object, similar to [$.event.special](http://benalman.com/news/2010/03/jquery-special-events/),
	// for adding hooks for special can-SPECIAL types (not native DOM events). Right now, only can-enter is
	// supported, but this object might be exported so that it can be added to easily.
	//
	// To implement a can-SPECIAL event type, add a property to the special object, whose value is a function
	// that returns the following:
	//
	//		// the real event name to bind to
	//		event: "event-name",
	//		handler: function (ev) {
	//			// some logic that figures out if the original handler should be called or not, and if so...
	//			return original.call(this, ev);
	//		}
	var special = {
		enter: function (data, el, original) {
			return {
				event: "keyup",
				handler: function (ev) {
					if (ev.keyCode === 13) {
						return original.call(this, ev);
					}
				}
			};
		}
	};


	can.bindings = {
		behaviors: behaviors,
		getBindingInfo: getBindingInfo,
		special: special
	};
	return can.bindings;
});
