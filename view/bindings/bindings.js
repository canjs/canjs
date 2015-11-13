// # can/view/bindings/bindings.js
//
// This file defines the `can-value` attribute for two-way bindings and the `can-EVENT` attribute
// for in template event bindings. These are usable in any mustache template, but mainly and documented
// for use within can.Component.

steal("can/util", "can/view/stache/expression.js", "can/view/callbacks", "can/control", "can/view/scope", "can/view/href", function (can, expression) {
	/**
	 * @function isContentEditable
	 * @hide
	 *
	 * Determines if an element is contenteditable.
	 *
	 * An element is contenteditable if it contains the `contenteditable`
	 * attribute set to either an empty string or "true".
	 *
	 * By default an element is also contenteditable if its immediate parent
	 * has a truthy version of the attribute, unless the element is explicitly
	 * set to "false".
	 *
	 * @param {HTMLElement} el
	 * @return {Boolean} returns if the element is editable
	 */
	// Function for determining of an element is contenteditable
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
		};

	// ## can-value
	// Implement the `can-value` special attribute
	//
	// ### Usage
	//
	// 		<input can-value="name" />
	//
	// When a view engine finds this attribute, it will call this callback. The value of the attribute
	// should be a string representing some value in the current scope to cross-bind to.
	can.view.attr("can-value", function (el, data) {
		var propName = "$value",
			attrValue = can.trim(removeBrackets(el.getAttribute("can-value"))),
			getterSetter;

		if (el.nodeName.toLowerCase() === "input" && ( el.type === "checkbox" || el.type === "radio" ) ) {

			var property = getScopeCompute(el, data.scope, attrValue, {});
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

		bindings(el, data, {
			attrValue: attrValue,
			propName: propName,
			childToParent: true,
			parentToChild: true,
			initializeValues: true,
			syncChildWithParent: true,
			legacyBindings: true
		});

	});

	// ## Special Event Types (can-SPECIAL)

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

	var handleEvent = function (el, data) {

		// Get the `event` name and if we are listening to the element or viewModel.
		// The attribute name is the name of the event.
		var attributeName = data.attributeName,
		// The old way of binding is can-X
			legacyBinding = attributeName.indexOf('can-') === 0,
			event = attributeName.indexOf('can-') === 0 ?
				attributeName.substr("can-".length) :
				removeBrackets(attributeName, '(', ')'),
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

				// We grab the first item and treat it as a method that
				// we'll call.
				var scopeData = data.scope.read(expr.methodExpr.key, {
					isArgument: true
				});

				// We break out early if the first argument isn't available
				// anywhere.

				if (!scopeData.value) {
					scopeData = data.scope.read(expr.methodExpr.key, {
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


				var args = expr.args(localScope, null)(),
					hash = expr.hash(localScope, null)();

				if(!can.isEmptyObject(hash)) {
					args.push(hash);
				}

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
	};

	// ## can-EVENT
	// The following section contains code for implementing the can-EVENT attribute.
	// This binds on a wildcard attribute name. Whenever a view is being processed
	// and can-xxx (anything starting with can-), this callback will be run.  Inside, its setting up an event handler
	// that calls a method identified by the value of this attribute.
	can.view.attr(/can-[\w\.]+/, handleEvent);
	// ## (EVENT)
	can.view.attr(/^\([\$?\w\.]+\)$/, handleEvent);



	var elementCompute = function(el, prop, event, options){
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

		var hasChildren = el.nodeName.toLowerCase() === "select",
			isMultiselectValue = prop === "value" && hasChildren && el.multiple,
			isStringValue,
			lastSet,
			scheduledAsyncSet = false,
			set = function(newVal){
				// Templates write parent's out before children.  This should probably change.
				// But it means we don't do a set immediately.
				if(hasChildren && !scheduledAsyncSet) {
					scheduledAsyncSet = true;
					setTimeout(function(){
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
					if(!options.legacyBindings && hasChildren && ("selectedIndex" in el)) {
						el.selectedIndex = -1;
					}
					can.attr.setAttrOrProp(el, prop, newVal == null ? "" : newVal);
					
					
				}
				return newVal;

			};
		
		// Parent is hydrated before children.  So we do
		// a tiny wait to do any sets.
		if(hasChildren) {
			// have to set later ... probably only with mustache.
			setTimeout(function(){
				scheduledAsyncSet = true;
			},1);
		}

		return can.compute(el[prop],{
			on: function(updater){
				can.each(event, function(eventName){
					can.bind.call(el,eventName, updater);
				});
			},
			off: function(updater){
				can.each(event, function(eventName){
					can.unbind.call(el,eventName, updater);
				});
			},
			get: function(){
				if(isMultiselectValue) {

					var values = [],
						children = el.childNodes;

					can.each(children, function (child) {
						if (child.selected && child.value) {
							values.push(child.value);
						}
					});

					return isStringValue ? values.join(";"): values;
				}

				return can.attr.get(el, prop);
			},
			set: set
		});
	};

	var getValue = function(value){
		return value && value.isComputed ? value() : value;
	};

	var bindingsRegExp = /\{(\()?(\^)?([^\}\)]+)\)?\}/;
	var attributeNameInfo = function(attributeName){
		var matches = attributeName.match(bindingsRegExp);
		if(!matches) {
			return {
				childToParent: true,
				parentToChild: true,
				propName: attributeName
			};
		}
		var twoWay = !!matches[1],
			childToParent = twoWay || !!matches[2],
			parentToChild = twoWay || !childToParent;


		return {
			childToParent: childToParent,
			parentToChild: parentToChild,
			propName: matches[3],
			syntaxStyle: 'new'
		};
	};

	// parent compute
	var getScopeCompute = function(el, scope, scopeProp, options){
		var parentExpression = expression.parse(scopeProp,{baseMethodType: "Call"});
		return parentExpression.value(scope, new can.view.Scope());
	};
	// child compute
	var getElementCompute = function(el, attributeName, options){

		var attrName = can.camelize( options.propName || attributeName.substr(1) ),
			firstChar = attrName.charAt(0),
			isDOM = firstChar === "$",
			childCompute;

		if(isDOM) {
			childCompute = elementCompute(el, attrName.substr(1), undefined, options);
		} else {
			var childExpression = expression.parse(attrName,{baseMethodType: "Call"});
			var childContext = can.viewModel(el);
			var childScope = new can.view.Scope(childContext);
			childCompute = childExpression.value(childScope, new can.view.Scope(), {});
		}
		return childCompute;
	};

	// parent -> child binding
	var bindParentToChild = function(el, parentCompute, childUpdate, bindingsSemaphore, attrName){

		// setup listening on parent and forwarding to viewModel
		var updateChild = function(ev, newValue){
			// Save the viewModel property name so it is not updated multiple times.
			bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0 )+1;
			childUpdate(newValue);

			// only after the batch has finished, reduce the update counter
			can.batch.after(function(){
				--bindingsSemaphore[attrName];
			});
		};

		if(parentCompute && parentCompute.isComputed) {
			parentCompute.bind("change", updateChild);

			can.one.call(el, 'removed', function() {
				parentCompute.unbind("change", updateChild);
			});

		}

		return updateChild;
	};

	// child -> parent binding
	// el -> the element
	// parentUpdate -> a method that updates the parent
	//
	var bindChildToParent = function(el, parentUpdate, childCompute, bindingsSemaphore, attrName, syncChild){
		var parentUpdateIsFunction = typeof parentUpdate === "function";

		var updateScope = function(ev, newVal){
			if (!bindingsSemaphore[attrName]) {
				if(parentUpdateIsFunction) {
					parentUpdate(newVal);
					if( syncChild ) {
						if(parentUpdate() !== childCompute()) {
							bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0 )+1;
							childCompute(parentUpdate());
							can.batch.after(function(){
								--bindingsSemaphore[attrName];
							});
						}
					}
				} else if(parentUpdate instanceof can.Map) {
					parentUpdate.attr(newVal, true);
				}
			}
		};

		if(childCompute && childCompute.isComputed) {
			childCompute.bind("change", updateScope);

			can.one.call(el, 'removed', function() {
				childCompute.unbind("change", updateScope);
			});
		}

		return updateScope;
	};


	// parentToChild, childToParent, initializeValues
	var bindings = function(el, attrData, options){

		var attrName = attrData.attributeName;
		// Get what we are binding to from the scope
		var parentCompute = getScopeCompute(el, attrData.scope, options.attrValue || el.getAttribute(attrName) || ".", options);

		// Get what we are binding to from the child
		var childCompute = getElementCompute(el, options.propName || attrName.replace(/^\{/,"").replace(/\}$/,""), options);

		// tracks which viewModel property is currently updating
		var bindingsSemaphore = {},
			updateChild,
			updateScope;

		if(options.parentToChild){
			// setup listening on parent and forwarding to viewModel
			updateChild = bindParentToChild(el, parentCompute, childCompute, bindingsSemaphore, attrName);
		}
		if(options.childToParent){
			// setup event binding on viewModel and forward to parent.
			updateScope = bindChildToParent(el, parentCompute, childCompute, bindingsSemaphore, attrName, options.syncChildWithParent);
		}

		if(options.initializeValues) {
			initializeValues(options, childCompute, parentCompute, updateChild, updateScope);
		}

		return {
			parentCompute: parentCompute,
			childCompute: childCompute
		};
	};
	var initializeValues = function(options, childCompute, parentCompute, updateChild, updateScope){

		if(options.parentToChild && !options.childToParent) {
			updateChild({}, getValue(parentCompute) );
		}
		else if(!options.parentToChild && options.childToParent) {
			updateScope({}, getValue(childCompute) );
		}
		// Two way
		// Update child or parent depending on who has a value.
		// If both have a value, update the child.
		else if( getValue(childCompute) === undefined) {
			updateChild({}, getValue(parentCompute) );
		} else if(getValue(parentCompute) === undefined) {
			updateScope({}, getValue(childCompute) );
		} else {
			updateChild({}, getValue(parentCompute) );
		}
	};

	//!steal-remove-start
	
	var syntaxWarning = function(el, attrData) {
		can.dev.warn('can/view/bindings/bindings.js: mismatched binding syntax - ' + attrData.attributeName);
	};
		
	can.view.attr(/^\(.+\}$/, syntaxWarning);

	can.view.attr(/^\{.+\)$/, syntaxWarning);

	can.view.attr(/^\(\{.+\}\)$/, syntaxWarning);
	
	//!steal-remove-end

	var dataBindingsRegExp = /^\{[^\}]+\}$/;
	can.view.attr(dataBindingsRegExp, function(el, attrData){
		if(can.data(can.$(el),"preventDataBindings")){
			return;
		}
		var attrNameInfo = attributeNameInfo(attrData.attributeName);
		attrNameInfo.initializeValues = true;
		attrNameInfo.templateType = attrData.templateType;
		bindings(el, attrData, attrNameInfo);
	});

	// #ref-export shorthand
	can.view.attr(/\*[\w\.\-_]+/, function(el, attrData) {
		if(el.getAttribute(attrData.attributeName)) {
			console.warn("&reference attributes can only export the view model.");
		}

		var name = can.camelize( attrData.attributeName.substr(1).toLowerCase() );

		var viewModel = can.viewModel(el);
		var refs = attrData.scope.getRefs();
		refs._context.attr("*"+name, viewModel);

	});

	return {
		getParentCompute: getScopeCompute,
		bindParentToChild: bindParentToChild,
		bindChildToParent: bindChildToParent,
		setupDataBinding: bindings,
		// a regular expression that
		dataBindingsRegExp: dataBindingsRegExp,
		attributeNameInfo: attributeNameInfo,
		initializeValues: initializeValues
	};
});
