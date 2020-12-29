'use strict';

var getDocument = require("can-globals/document/document");
var global = require("can-globals/global/global")();
var setData = require("can-dom-data");
var dev = require("can-log/dev/dev");
var domEvents = require("can-dom-events");
var domMutate = require("can-dom-mutate");
var domMutateNode = require("can-dom-mutate/node");
var getMutationObserver = require("can-globals/mutation-observer/mutation-observer");
var diff = require("can-diff/list/list");
var queues = require("can-queues");

var xmlnsAttrNamespaceURI = "http://www.w3.org/2000/xmlns/";
var xlinkHrefAttrNamespaceURI =  "http://www.w3.org/1999/xlink";
var attrsNamespacesURI = {
	'xmlns': xmlnsAttrNamespaceURI,
	'xlink:href': xlinkHrefAttrNamespaceURI
};


var formElements = {"INPUT": true, "TEXTAREA": true, "SELECT": true, "BUTTON": true},
	// Used to convert values to strings.
	toString = function(value){
		if(value == null) {
			return "";
		} else {
			return ""+value;
		}
	},
	isSVG = function(el){
		return el.namespaceURI === "http://www.w3.org/2000/svg";
	},
	truthy = function() { return true; },
	getSpecialTest = function(special){
		return (special && special.test) || truthy;
	},
	propProp = function(prop, obj){
		obj = obj || {};
		obj.get = function(){
			return this[prop];
		};
		obj.set = function(value){
			if(this[prop] !== value) {
				this[prop] = value;
			}
		};
		return obj;
	},
	booleanProp = function(prop){
		return {
			isBoolean: true,
			set: function(value){
				if(prop in this) {
					this[prop] = value;
				} else {
					domMutateNode.setAttribute.call(this, prop, "");
				}
			},
			remove: function(){
				this[prop] = false;
			}
		};
	},
	setupMO = function(el, callback){
		var attrMO = setData.get(el, "attrMO");
		if(!attrMO) {
			var onMutation = function(){
				callback.call(el);
			};
			var MO = getMutationObserver();
			if(MO) {
				var observer = new MO(onMutation);
				observer.observe(el, {
					childList: true,
					subtree: true
				});
				setData.set(el, "attrMO", observer);
			} else {
				setData.set(el, "attrMO", true);
				setData.set(el, "canBindingCallback", {onMutation: onMutation});
			}
		}
	},
	_findOptionToSelect = function (parent, value) {
		var child = parent.firstChild;
		while (child) {
			if (child.nodeName === "OPTION" && value === child.value) {
				return child;
			}
			if (child.nodeName === "OPTGROUP") {
				var groupChild = _findOptionToSelect(child, value);
				if (groupChild) {
					return groupChild;
				}
			}
			child = child.nextSibling;
		}
	},
	setChildOptions = function(el, value){
		var option;
		if (value != null) {
			option = _findOptionToSelect(el, value);
		}
		if (option) {
			option.selected = true;
		} else {
			el.selectedIndex = -1;
		}
	},
	forEachOption = function (parent, fn) {
		var child = parent.firstChild;
		while (child) {
			if (child.nodeName === "OPTION") {
				fn(child);
			}
			if (child.nodeName === "OPTGROUP") {
				forEachOption(child, fn);
			}
			child = child.nextSibling;
		}
	},
	collectSelectedOptions = function (parent) {
		var selectedValues = [];
		forEachOption(parent, function (option) {
			if (option.selected) {
				selectedValues.push(option.value);
			}
		});
		return selectedValues;
	},
	markSelectedOptions = function (parent, values) {
		forEachOption(parent, function (option) {
			option.selected = values.indexOf(option.value) !== -1;
		});
	},
	// Create a handler, only once, that will set the child options any time
	// the select's value changes.
	setChildOptionsOnChange = function(select, aEL){
		var handler = setData.get(select, "attrSetChildOptions");
		if(handler) {
			return Function.prototype;
		}
		handler = function(){
			setChildOptions(select, select.value);
		};
		setData.set(select, "attrSetChildOptions", handler);
		aEL.call(select, "change", handler);
		return function(rEL){
			setData.clean(select, "attrSetChildOptions");
			rEL.call(select, "change", handler);
		};
	},
	// cache of rules already calculated by `attr.getRule`
	behaviorRules = new Map(),
	// # isPropWritable
	// check if a property is writable on an element by finding its property descriptor
	// on the element or its prototype chain
	isPropWritable = function(el, prop) {
		   var desc = Object.getOwnPropertyDescriptor(el, prop);

		   if (desc) {
				   return desc.writable || desc.set;
		   } else {
				   var proto = Object.getPrototypeOf(el);
				   if (proto) {
						   return isPropWritable(proto, prop);
				   }
		   }

		   return false;
	},
	// # cacheRule
	// add a rule to the rules Map so it does not need to be calculated more than once
	cacheRule = function(el, attrOrPropName, rule) {
		   var rulesForElementType;

		   rulesForElementType = behaviorRules.get(el.prototype);

		   if (!rulesForElementType) {
				   rulesForElementType = {};
				   behaviorRules.set(el.constructor, rulesForElementType);
		   }

		   rulesForElementType[attrOrPropName] = rule;

		   return rule;
	};

var specialAttributes = {
	checked: {
		get: function(){
			return this.checked;
		},
		set: function(val){
			// - `set( truthy )` => TRUE
			// - `set( "" )`     => TRUE
			// - `set()`         => TRUE
			// - `set(undefined)` => false.
			var notFalse = !!val || val === "" || arguments.length === 0;
			this.checked = notFalse;
			if(notFalse && this.type === "radio") {
				this.defaultChecked = true;
			}
		},
		remove: function(){
			this.checked = false;
		},
		test: function(){
			return this.nodeName === "INPUT";
		}
	},
	"class": {
		get: function(){
			if(isSVG(this)) {
				return this.getAttribute("class");
			}
			return this.className;
		},
		set: function(val){
			val = val || "";

			if(isSVG(this)) {
				domMutateNode.setAttribute.call(this, "class", "" + val);
			} else {
				this.className = val;
			}
		}
	},
	disabled: booleanProp("disabled"),
	focused: {
		get: function(){
			return this === document.activeElement;
		},
		set: function(val){
			var cur = attr.get(this, "focused");
			var docEl = this.ownerDocument.documentElement;
			var element = this;
			function focusTask() {
				if (val) {
					element.focus();
				} else {
					element.blur();
				}
			}
			if (cur !== val) {
				if (!docEl.contains(element)) {
					var connectionDisposal = domMutate.onNodeConnected(element, function () {
						connectionDisposal();
						focusTask();
					});
				} else {
					// THIS MIGHT NEED TO BE PUT IN THE MUTATE QUEUE
					queues.enqueueByQueue({
						mutate: [focusTask]
					}, null, []);
				}
			}
			return true;
		},
		addEventListener: function(eventName, handler, aEL){
			aEL.call(this, "focus", handler);
			aEL.call(this, "blur", handler);
			return function(rEL){
				rEL.call(this, "focus", handler);
				rEL.call(this, "blur", handler);
			};
		},
		test: function(){
			return this.nodeName === "INPUT";
		}
	},
	"for": propProp("htmlFor"),
	innertext: propProp("innerText"),
	innerhtml: propProp("innerHTML"),
	innerHTML: propProp("innerHTML", {
		addEventListener: function(eventName, handler, aEL){
			var handlers = [];
			var el = this;
			["change", "blur"].forEach(function(eventName){
				var localHandler = function(){
					handler.apply(this, arguments);
				};
				domEvents.addEventListener(el, eventName, localHandler);
				handlers.push([eventName, localHandler]);
			});

			return function(rEL){
				handlers.forEach( function(info){
					rEL.call(el, info[0], info[1]);
				});
			};
		}
	}),
	required: booleanProp("required"),
	readonly: booleanProp("readOnly"),
	selected: {
		get: function(){
			return this.selected;
		},
		set: function(val){
			val = !!val;
			setData.set(this, "lastSetValue", val);
			this.selected = val;
		},
		addEventListener: function(eventName, handler, aEL){
			var option = this;
			var select = this.parentNode;
			var lastVal = option.selected;
			var localHandler = function(changeEvent){
				var curVal = option.selected;
				lastVal = setData.get(option, "lastSetValue") || lastVal;
				if(curVal !== lastVal) {
					lastVal = curVal;

					domEvents.dispatch(option, eventName);
				}
			};

			var removeChangeHandler = setChildOptionsOnChange(select, aEL);
			domEvents.addEventListener(select, "change", localHandler);
			aEL.call(option, eventName, handler);

			return function(rEL){
				removeChangeHandler(rEL);
				domEvents.removeEventListener(select, "change", localHandler);
				rEL.call(option, eventName, handler);
			};
		},
		test: function(){
			return this.nodeName === "OPTION" && this.parentNode &&
				this.parentNode.nodeName === "SELECT";
		}
	},
	style: {
		set: (function () {
			var el = global.document && getDocument().createElement("div");
			if ( el && el.style && ("cssText" in el.style) ) {
				return function (val) {
					this.style.cssText = (val || "");
				};
			} else {
				return function (val) {
					domMutateNode.setAttribute.call(this, "style", val);
				};
			}
		})()
	},
	textcontent: propProp("textContent"),
	value: {
		get: function(){
			var value = this.value;
			if(this.nodeName === "SELECT") {
				if(("selectedIndex" in this) && this.selectedIndex === -1) {
					value = undefined;
				}
			}
			return value;
		},
		set: function(value){
			var providedValue = value;
			var nodeName = this.nodeName.toLowerCase();
			if(nodeName === "input" || nodeName === "textarea") {
				// Do some input types support non string values?
				value = toString(value);
			}
			if(this.value !== value || nodeName === "option") {
				this.value = value;
			}
			if (nodeName === "input" || nodeName === "textarea") {
				this.defaultValue = value;
			}
			if(nodeName === "select") {
				setData.set(this, "attrValueLastVal", value);
				//If it's null then special case
				setChildOptions(this, value === null ? value : this.value);

				// If not in the document reset the value when inserted.
				var docEl = this.ownerDocument.documentElement;
				if(!docEl.contains(this)) {
					var select = this;
					var connectionDisposal = domMutate.onNodeConnected(select, function () {
						connectionDisposal();
						setChildOptions(select, value === null ? value : select.value);
					});
				}

				// MO handler is only set up **ONCE**
				setupMO(this, function(){
					var value = setData.get(this, "attrValueLastVal");
					attr.set(this, "value", value);
					domEvents.dispatch(this, "change");
				});
			}

			// Warnings area
			//!steal-remove-start
			if(process.env.NODE_ENV !== "production") {
				var settingADateInputToADate = nodeName === "input" && this.type === "date" && (providedValue instanceof Date);
				if(settingADateInputToADate) {
					dev.warn("Binding a Date to the \"value\" property on an <input type=\"date\"> will not work as expected. Use valueAsDate:bind instead. See https://canjs.com/doc/guides/forms.html#Dateinput for more information.");
				}
			}
			//!steal-remove-end
		},
		test: function(){
			return formElements[this.nodeName];
		}
	},
	values: {
		get: function(){
			return collectSelectedOptions(this);
		},
		set: function(values){
			values = values || [];

			// set new DOM state
			markSelectedOptions(this, values);

			// store new DOM state
			setData.set(this, "stickyValues", attr.get(this,"values") );

			// MO handler is only set up **ONCE**
			// TODO: should this be moved into addEventListener?
			setupMO(this, function(){

				// Get the previous sticky state
				var previousValues = setData.get(this,
					"stickyValues");

				// Set DOM to previous sticky state
				attr.set(this, "values", previousValues);

				// Get the new result after trying to maintain the sticky state
				var currentValues = setData.get(this,
					"stickyValues");

				// If there are changes, trigger a `values` event.
				var changes = diff(previousValues.slice().sort(),
					currentValues.slice().sort());

				if (changes.length) {
					domEvents.dispatch(this, "values");
				}
			});
		},
		addEventListener: function(eventName, handler, aEL){
			var localHandler = function(){
				domEvents.dispatch(this, "values");
			};

			domEvents.addEventListener(this, "change", localHandler);
			aEL.call(this, eventName, handler);

			return function(rEL){
				domEvents.removeEventListener(this, "change", localHandler);
				rEL.call(this, eventName, handler);
			};
		}
	}
};

var attr = {
	// cached rules (stored on `attr` for testing purposes)
	rules: behaviorRules,

	// special attribute behaviors (stored on `attr` for testing purposes)
	specialAttributes: specialAttributes,

	// # attr.getRule
	//
	// get the behavior rule for an attribute or property on an element
	//
	// Rule precendence:
	//   1. "special" behaviors - use the special behavior getter/setter
	//   2. writable properties - read and write as a property
	//   3. all others - read and write as an attribute
	//
	// Once rule is determined it will be cached for all elements of the same type
	// so that it does not need to be calculated again
	getRule: function(el, attrOrPropName) {
		var special = specialAttributes[attrOrPropName];
		// always use "special" if available
		// these are not cached since they would have to be cached separately
		// for each element type and it is faster to just look up in the
		// specialAttributes object
		if (special) {
			return special;
		}

		// next use rules cached in a previous call to getRule
		var rulesForElementType = behaviorRules.get(el.constructor);
		var cached = rulesForElementType && rulesForElementType[attrOrPropName];

		if (cached) {
			return cached;
		}

		// if the element doesn't have a property of this name, it must be an attribute
		if (!(attrOrPropName in el)) {
			return this.attribute(attrOrPropName);
		}

		// if there is a property, check if it is writable
		var newRule = isPropWritable(el, attrOrPropName) ?
			this.property(attrOrPropName) :
			this.attribute(attrOrPropName);

		// cache the new rule and return it
		return cacheRule(el, attrOrPropName, newRule);
	},

	attribute: function(attrName) {
		return {
			get: function() {
				return this.getAttribute(attrName);
			},
			set: function(val) {
				if (attrsNamespacesURI[attrName]) {
					domMutateNode.setAttributeNS.call(this, attrsNamespacesURI[attrName], attrName, val);
				} else {
					domMutateNode.setAttribute.call(this, attrName, val);
				}
			}
		};
	},

	property: function(propName) {
		return {
			get: function() {
				return this[propName];
			},
			set: function(val) {
				this[propName] = val;
			}
		};
	},

	findSpecialListener: function(attributeName) {
		return specialAttributes[attributeName] && specialAttributes[attributeName].addEventListener;
	},

	setAttrOrProp: function(el, attrName, val){
		return this.set(el, attrName, val);
	},
	// ## attr.set
	// Set the value an attribute on an element.
	set: function (el, attrName, val) {
		var rule = this.getRule(el, attrName);
		var setter = rule && rule.set;

		if (setter) {
			return setter.call(el, val);
		}
	},
	// ## attr.get
	// Gets the value of an attribute or property.
	// First checks if the property is an `specialAttributes` and if so calls the special getter.
	// Then checks if the attribute or property is a property on the element.
	// Otherwise uses `getAttribute` to retrieve the value.
	get: function (el, attrName) {
		var rule = this.getRule(el, attrName);
		var getter = rule && rule.get;

		if (getter) {
			return rule.test ?
				rule.test.call(el) && getter.call(el) :
				getter.call(el);
		}
	},
	// ## attr.remove
	// Removes an attribute from an element. First checks specialAttributes to see if the attribute is special and has a setter. If so calls the setter with `undefined`. Otherwise `removeAttribute` is used.
	// If the attribute previously had a value and the browser doesn't support MutationObservers we then trigger an "attributes" event.
	remove: function (el, attrName) {
		attrName = attrName.toLowerCase();
		var special = specialAttributes[attrName];
		var setter = special && special.set;
		var remover = special && special.remove;
		var test = getSpecialTest(special);

		if(typeof remover === "function" && test.call(el)) {
			remover.call(el);
		} else if(typeof setter === "function" && test.call(el)) {
			setter.call(el, undefined);
		} else {
			domMutateNode.removeAttribute.call(el, attrName);
		}
	}
};

module.exports = attr;
