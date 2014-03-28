steal("can/util", "can/view/mustache", "can/control", function (can) {
	// # bindings.js
	// `can.view.bindings`: In-template event bindings and two-way bindings

	// ## can-value
	// Implement the `can-value` special attribute
	// 
	// Usage: &lt;input can-value="name" /&gt;
	// 
	// When a view engine finds this attribute, it will call this callback
	can.view.attr("can-value", function (el, data) {

		// What is the value of this attribute? It should be a string representing 
		// some value in the current scope to cross-bind to.
		var attr = el.getAttribute("can-value"),
			// Turn the attribute passed in into a compute.  If the user passed in can-value="name" and the current 
			// scope of the template is some object called data, the compute representing this can-value will be the 
			// data.attr('name') property.
			value = data.scope.computeData(attr, {
				args: []
			})
				.compute,
			trueValue,
			falseValue;

		// Depending on the type of element, this attribute has different behavior
		// 
		// If we're an input type...
		if (el.nodeName.toLowerCase() === "input") {
			if (el.type === "checkbox") {
				// If the element is a checkbox and has an attribute called "can-true-value", 
				// set up a compute that toggles the value of the checkbox to "true" based on another attribute. 
				// For example, &lt;input type='checkbox' can-value='foo' can-true-value='trueVal' /&gt;
				if (can.attr.has(el, "can-true-value")) {
					trueValue = data.scope.compute(el.getAttribute("can-true-value"));
				} else {
					trueValue = can.compute(true);
				}
				if (can.attr.has(el, "can-false-value")) {
					falseValue = data.scope.compute(el.getAttribute("can-false-value"));
				} else {
					falseValue = can.compute(false);
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

	// ## can-EVENT
	// The following section contains code for implementing the can-EVENT attribute. 
	// This binds on a wildcard attribute name. Whenever a view is being processed 
	// and can-xxx (anything starting with can-), this callback will be run.  Inside, its setting up an event handler 
	// that calls a method identified by the value of this attribute.
	can.view.attr(/can-[\w\.]+/, function (el, data) {

		// the attribute name is the function to call
		var attributeName = data.attributeName,
			// The event type to bind on is deteremined by whatever is after can-
			// 
			// For example, can-submit binds on the submit event.
			event = attributeName.substr("can-".length),
			// This is the method that the event will initially trigger. It will look up the method by the string name 
			// passed in the attribute and call it.
			handler = function (ev) {
				// The attribute value, representing the name of the method to call (i.e. can-submit="foo" foo is the 
				// name of the method)
				var attr = el.getAttribute(attributeName),
					scopeData = data.scope.read(attr, {
						returnObserveMethods: true,
						isArgument: true
					});
				return scopeData.value.call(scopeData.parent, data.scope._context, can.$(this), ev);
			};

		// This code adds support for special event types, like can-enter="foo".
		if (special[event]) {
			// special.enter (or any special[event]) is a function that returns an object containing an event and a handler. 
			// These are to be used for binding. For example, when a user adds a can-enter attribute, we'll bind on the 
			// keyup event, and the handler performs special logic to determine on keyup if the enter key was pressed.
			var specialData = special[event](data, el, handler);
			handler = specialData.handler;
			event = specialData.event;
		}
		// bind the handler defined above to the element we're currently processing and the event name provided in this 
		// attribute name (can-click="foo")
		can.bind.call(el, event, handler);
	});


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
			// handle selects by calling set after this thread so the rest of the element can finish rendering
			if (this.element[0].nodeName.toUpperCase() === "SELECT") {
				// need to wait until end of turn ...
				setTimeout(can.proxy(this.set, this), 1);
			} else {
				this.set();
			}

		},
		// if the live bound data changes, call set the reflect this in the dom
		"{value} change": "set",
		set: function () {
			//this may happen in some edgecases, esp. with selects that are not in DOM after the timeout has fired
			if (!this.element) {
				return;
			}
			var val = this.options.value();
			// set the element's value to match the attribute that was passed in
			this.element[0].value = (typeof val === 'undefined' ? '' : val);
		},
		// if the input value changes, ...
		"change": function () {
			//this may happen in some edgecases, esp. with selects that are not in DOM after the timeout has fired
			if (!this.element) {
				return;
			}
			// set the value of the attribute passed in to reflect what the user typed
			this.options.value(this.element[0].value);
		}
	}),
	// ### Checked 
	// A can.Control that manages the two-way bindings on a checkbox element.  When can-value is found as an attribute 
	// on a checkbox, the callback above instantiates this Checked control on the checkbox element.
		Checked = can.Control.extend({
			init: function () {
				// if its not a checkbox, its a radio input
				this.isCheckbox = (this.element[0].type.toLowerCase() === "checkbox");
				this.check();
			},
			// value is the compute representing the can-value for this element.  For example can-value="foo" and current 
			// scope is someObj, value is the compute representing someObj.attr('foo')
			"{value} change": "check",
			"{trueValue} change": "check",
			"{falseValue} change": "check",
			check: function () {
				if (this.isCheckbox) {
					var value = this.options.value(),
						trueValue = this.options.trueValue() || true;

					this.element[0].checked = (value === trueValue);
				} 
				// its a radio input type
				else {
					var setOrRemove = this.options.value() === this.element[0].value ?
						"set" : "remove";

					can.attr[setOrRemove](this.element[0], 'checked', true);

				}

			},
			// This event is triggered by the DOM.  If a change event occurs, we must set the value of the compute (options.value).
			"change": function () {

				if (this.isCheckbox) {
					// If the checkbox is checked and the trueValue compute (if it was used) is true, set value to true.
					// 
					// If its not checked and the falseValue compute (if it was used) is false, set value to false.
					this.options.value(this.element[0].checked ? this.options.trueValue() : this.options.falseValue());
				} 
				// radio input type
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
				this.set();
			},
			// Since this control extends Value (above), the set method will be called when the value compute changes (and on init).
			set: function () {

				var newVal = this.options.value();

				if (typeof newVal === 'string') {
					//when given a string, try to extract all the options from it (i.e. "a;b;c;d")
					newVal = newVal.split(this.delimiter);
					this.isString = true;
				} else if (newVal) {
					//when given something else, try to make it an array and deal with it
					newVal = can.makeArray(newVal);
				}

				// make an object containing all the options passed in for convenient lookup
				var isSelected = {};
				can.each(newVal, function (val) {
					isSelected[val] = true;
				});

				// go through each &lt;option/&gt; element
				can.each(this.element[0].childNodes, function (option) {
					// if it has a value property (meaning it is a valid option)
					if (option.value) {
						// set its value to true if it was in the list of vals that were set
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
				// get an array of the currently selected values
				var value = this.get(),
					currentValue = this.options.value();

				// If the compute is a string, set its value to the joined version of the values array (i.e. "foo;bar")
				if (this.isString || typeof currentValue === "string") {
					this.isString = true;
					this.options.value(value.join(this.delimiter));
				} else if (currentValue instanceof can.List) {
					// If the compute is a can.List, replace its current contents with the new array of values
					currentValue.attr(value, true);
				} else {
					// Otherwise set the value to the array of values selected in the input.
					this.options.value(value);
				}

			}
		});

});
