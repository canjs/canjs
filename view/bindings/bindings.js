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

		var attr = can.trim(removeBrackets(el.getAttribute("can-value"))),
			// Turn the attribute passed in into a compute.  If the user passed in can-value="name" and the current
			// scope of the template is some object called data, the compute representing this can-value will be the
			// data.attr('name') property.
			value = data.scope.computeData(attr, {
				args: []
			})
				.compute,
			trueValue,
			falseValue;

		// Depending on the type of element, this attribute has different behavior. can.Controls are defined (further below
		// in this file) for each type of input. This block of code collects arguments and instantiates each can.Control. There
		// is one for checkboxes/radios, another for multiselect inputs, and another for everything else.
		if (el.nodeName.toLowerCase() === "input") {
			if (el.type === "checkbox") {
				// If the element is a checkbox and has an attribute called "can-true-value",
				// set up a compute that toggles the value of the checkbox to "true" based on another attribute.
				//
				// 		<input type='checkbox' can-value='sex' can-true-value='male' can-false-value='female' />
				if (can.attr.has(el, "can-true-value")) {
					trueValue = el.getAttribute("can-true-value");
				} else {
					trueValue = true;
				}
				if (can.attr.has(el, "can-false-value")) {
					falseValue = el.getAttribute("can-false-value");
				} else {
					falseValue = false;
				}
			}

			if (el.type === "checkbox" || el.type === "radio") {
				// For checkboxes and radio buttons, create a Checked can.Control around the input.  Pass in
				// the compute representing the can-value and can-true-value and can-false-value properties (if
				// they were used).
				new Checked(el, {
					value: value,
					trueValue: trueValue,
					falseValue: falseValue
				});
				return;
			}
		}
		if (el.nodeName.toLowerCase() === "select" && el.multiple) {
			// For multiselect enabled select inputs, we instantiate a special control around that select element
			// called Multiselect
			new Multiselect(el, {
				value: value
			});
			return;
		}
		// For contenteditable elements, we instantiate a Content control.
		if (isContentEditable(el)) {
			new Content(el, {
				value: value
			});
			return;
		}
		// The default case. Instantiate the Value control around the element. Pass it the compute representing
		// the observable attribute property that was set.
		new Value(el, {
			value: value
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

				//!steal-remove-start
				if (!scopeData.value) {
					can.dev.warn("can/view/bindings: " + attributeName + " couldn't find method named " + expr.methodExpr.key, {
						element: el,
						scope: data.scope
					});
					return null;
				}
				//!steal-remove-end

				
				
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

	// ## Two way binding can.Controls
	// Each type of input that is supported by view/bindings is wrapped with a special can.Control.  The control serves
	// two functions:
	// 1. Bind on the property changing (the compute we're two-way binding to) and change the input value.
	// 2. Bind on the input changing and change the property (compute) we're two-way binding to.
	// There is one control per input type. There could easily be more for more advanced input types, like the HTML5 type="date" input type.


	// ### Value
	// A can.Control that manages the two-way bindings on most inputs.  When can-value is found as an attribute
	// on an input, the callback above instantiates this Value control on the input element.
	var Value = can.Control.extend({
		init: function () {
			// Handle selects by calling `set` after this thread so the rest of the element can finish rendering.
			if (this.element[0].nodeName.toUpperCase() === "SELECT") {
				setTimeout(can.proxy(this.set, this), 1);
			} else {
				this.set();
			}

		},
		// If the live bound data changes, call set to reflect the change in the dom.
		"{value} change": "set",
		set: function () {
			// This may happen in some edgecases, esp. with selects that are not in DOM after the timeout has fired
			if (!this.element) {
				return;
			}
			var val = this.options.value();
			// For https://github.com/bitovi/canjs/issues/1679. We don't want to set
			// null or undefined on select fields because Chrome shows it as blank
			if(val == null && this.element[0].nodeName.toUpperCase() !== "SELECT") {
				val = '';
			}

			// Set the element's value to match the attribute that was passed in
			if(val != null) {
				this.element[0].value = val;
			}
		},
		// If the input value changes, this will set the live bound data to reflect the change.
			// If the input value changes, this will set the live bound data to reflect the change.
		"change": function () {
			// This may happen in some edgecases, esp. with selects that are not in DOM after the timeout has fired
			if (!this.element) {
				return;
			}
			var el = this.element[0];

			// Set the value of the attribute passed in to reflect what the user typed
			this.options.value(el.value);
			var newVal = this.options.value();

			// If the newVal isn't the same as the input, set it's value
			if(el.value !== newVal) {
				el.value = newVal;
			}
		}
	}),
	// ### Checked
	// A can.Control that manages the two-way bindings on a checkbox element.  When can-value is found as an attribute
	// on a checkbox, the callback above instantiates this Checked control on the checkbox element.
		Checked = can.Control.extend({
			init: function () {
				// If its not a checkbox, its a radio input
				this.isCheckbox = (this.element[0].type.toLowerCase() === "checkbox");
				this.check();
			},
			// `value` is the compute representing the can-value for this element.  For example can-value="foo" and current
			// scope is someObj, value is the compute representing someObj.attr('foo')
			"{value} change": "check",
			check: function () {
				// jshint eqeqeq: false
				if (this.isCheckbox) {
					var value = this.options.value(),
						trueValue = this.options.trueValue || true;
					// If `can-true-value` attribute was set, check if the value is equal to that string value, and set
					// the checked property based on their equality.
					this.element[0].checked = (value == trueValue);
				}
				// Its a radio input type
				else {
					var setOrRemove = this.options.value() == this.element[0].value ?
						"set" : "remove";

					can.attr[setOrRemove](this.element[0], 'checked', true);

				}

			},
			// This event is triggered by the DOM.  If a change event occurs, we must set the value of the compute (options.value).
			"change": function () {
				if (this.isCheckbox) {
					// If the checkbox is checked and can-true-value was used, set value to the string value of can-true-value.  If
					// can-false-value was used and checked is false, set value to the string value of can-false-value.
					this.options.value(this.element[0].checked ? this.options.trueValue : this.options.falseValue);
				}
				// Radio input type
				else {
					if (this.element[0].checked) {
						this.options.value(this.element[0].value);
					}
				}

			}
		}),
		// ### Multiselect
		// A can.Control that handles select input with the "multiple" attribute (meaning more than one can be selected at once).
		Multiselect = Value.extend({
			init: function () {
				this.delimiter = ";";
				// Call `set` after this thread so the rest of the element can finish rendering.
				setTimeout(can.proxy(this.set, this), 1);
			},
			// Since this control extends Value (above), the set method will be called when the value compute changes (and on init).
			set: function () {

				var newVal = this.options.value();


				// When given a string, try to extract all the options from it (i.e. "a;b;c;d")
				if (typeof newVal === 'string') {
					newVal = newVal.split(this.delimiter);
					this.isString = true;
				}
				// When given something else, try to make it an array and deal with it
				else if (newVal) {
					newVal = can.makeArray(newVal);
				}

				// Make an object containing all the options passed in for convenient lookup
				var isSelected = {};
				can.each(newVal, function (val) {
					isSelected[val] = true;
				});

				// Go through each &lt;option/&gt; element, if it has a value property (its a valid option), then
				// set its selected property if it was in the list of vals that were just set.
				can.each(this.element[0].childNodes, function (option) {
					if (option.value) {
						option.selected = !! isSelected[option.value];
					}

				});

			},
			// A helper function used by the 'change' handler below. Its purpose is to return an array of selected
			// values, like ["foo", "bar"]
			get: function () {
				var values = [],
					children = this.element[0].childNodes;

				can.each(children, function (child) {
					if (child.selected && child.value) {
						values.push(child.value);
					}
				});

				return values;
			},
			// Called when the user changes this input in any way.
			'change': function () {
				// Get an array of the currently selected values
				var value = this.get(),
					currentValue = this.options.value();

				// If the compute is a string, set its value to the joined version of the values array (i.e. "foo;bar")
				if (this.isString || typeof currentValue === "string") {
					this.isString = true;
					this.options.value(value.join(this.delimiter));
				}
				// If the compute is a can.List, replace its current contents with the new array of values
				else if (currentValue instanceof can.List) {
					currentValue.attr(value, true);
				}
				// Otherwise set the value to the array of values selected in the input.
				else {
					this.options.value(value);
				}

			}
		}),
		Content = can.Control.extend({
			init: function () {
				this.set();
				this.on("blur", "setValue");
			},
			"{value} change": "set",
			set: function () {
				var val = this.options.value();
				this.element[0].innerHTML = (typeof val === 'undefined' ? '' : val);
			},
			setValue: function () {
				this.options.value(this.element[0].innerHTML);
			}
		});

	var setElement = function(el, prop, value) {
		if(el.nodeName.toLowerCase() === "input" && el.type === "checkbox") {
			var trueValue = true;
			// If `can-true-value` attribute was set, check if the value is equal to that string value, and set
			// the checked property based on their equality.
			el.checked = (value == trueValue); // jshint ignore:line
		} else {
			can.attr.set(el, prop, value == null ? "" : value);
		}
	};

	var elementCompute = function(el, prop, event){
		return can.compute(el[prop],{
			on: function(updater){
				can.bind.call(el,event, updater);
			},
			off: function(updater){
				can.unbind.call(el,event, updater);
			},
			get: function(){
				return can.attr.get(el, prop);
			},
			set: function(value){
				setElement(el, prop, value);
			}
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
			propName: matches[3]
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
			childCompute = elementCompute(el, attrName.substr(1), "change");
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
	var bindChildToParent = function(el, parentUpdate, childCompute, bindingsSemaphore, attrName){
		var updateScope = function(ev, newVal){
			if (!bindingsSemaphore[attrName]) {
				parentUpdate(newVal);
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
		var parentCompute = getScopeCompute(el, attrData.scope, el.getAttribute(attrName) || ".", options);
		
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
			updateScope = bindChildToParent(el, parentCompute, childCompute, bindingsSemaphore, attrName);
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
		} else if(parentCompute() === undefined) {
			updateScope({}, getValue(childCompute) );
		} else {
			updateChild({}, getValue(parentCompute) );
		}
	};
	
	var dataBindingsRegExp = /^\{[^\}]+\}$/;
	can.view.attr(dataBindingsRegExp, function(el, attrData){
		if(can.data(can.$(el),"preventDataBindings")){
			return;
		}
		var attrNameInfo = attributeNameInfo(attrData.attributeName);
		attrNameInfo.initializeValues = true;
		
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
