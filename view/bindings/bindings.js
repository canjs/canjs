steal("can/util", "can/view/mustache", "can/control", function (can) {
	// # bindings.js
	// `can.view.bindings`: In-template event bindings and two-way bindings

	// Register the can-value special attribute
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

	// Implementing the can-EVENT syntax. This binds on a wildcard attribute name. Whenever a view is being processed 
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

		if (special[event]) {
			var specialData = special[event](data, el, handler);
			handler = specialData.handler;
			event = specialData.event;
		}
		// bind the handler defined above to the element we're currently processing and the event name provided in this 
		// attribute name (can-click="foo")
		can.bind.call(el, event, handler);
	});


	// a can.Control that manages the two-way bindings on most inputs.  When can-value is found as an attribute 
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
	// a can.Control that manages the two-way bindings on a checkbox element.  When can-value is found as an attribute 
	// on a checkbox, the callback above instantiates this Checked control on the checkbox element.
		Checked = can.Control.extend({
			init: function () {
				// if its not a checkbox, its a radio input
				this.isCheckebox = (this.element[0].type.toLowerCase() === "checkbox");
				this.check();
			},
			"{value} change": "check",
			"{trueValue} change": "check",
			"{falseValue} change": "check",
			check: function () {
				if (this.isCheckebox) {
					var value = this.options.value(),
						trueValue = this.options.trueValue() || true;

					this.element[0].checked = (value === trueValue);
				} 
				// its a radio input
				else {
					var setOrRemove = this.options.value() === this.element[0].value ?
						"set" : "remove";

					can.attr[setOrRemove](this.element[0], 'checked', true);

				}

			},
			"change": function () {

				if (this.isCheckebox) {
					this.options.value(this.element[0].checked ? this.options.trueValue() : this.options.falseValue());
				} else {
					if (this.element[0].checked) {
						this.options.value(this.element[0].value);
					}
				}

			}
		}),
		Multiselect = Value.extend({
			init: function () {
				this.delimiter = ";";
				this.set();
			},

			set: function () {

				var newVal = this.options.value();

				if (typeof newVal === 'string') {
					//when given a string, try to extract all the options from it
					newVal = newVal.split(this.delimiter);
					this.isString = true;
				} else if (newVal) {
					//when given something else, try to make it an array and deal with it
					newVal = can.makeArray(newVal);
				}

				//jQuery.val is required here, which will break compatibility with other libs
				var isSelected = {};
				can.each(newVal, function (val) {
					isSelected[val] = true;
				});

				can.each(this.element[0].childNodes, function (option) {
					if (option.value) {
						option.selected = !! isSelected[option.value];
					}

				});

			},

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

			'change': function () {
				var value = this.get(),
					currentValue = this.options.value();

				if (this.isString || typeof currentValue === "string") {
					this.isString = true;
					this.options.value(value.join(this.delimiter));
				} else if (currentValue instanceof can.List) {
					currentValue.attr(value, true);
				} else {
					this.options.value(value);
				}

			}
		});

});
