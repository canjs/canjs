"use strict";
var queues = require("can-queues");
var canEvent = require("./event");
var canReflect = require("can-reflect");
var Observation = require("can-observation");
var attr = require("./behaviors");
var getEventName = require("./get-event-name");
var canReflectDeps = require("can-reflect-dependencies");
var ObservationRecorder = require("can-observation-recorder");
var SettableObservable = require("can-simple-observable/settable/settable");
var canAssign = require("can-assign");
var canSymbol = require("can-symbol");

var onValueSymbol = canSymbol.for('can.onValue');
var offValueSymbol = canSymbol.for('can.offValue');
var onEmitSymbol = canSymbol.for('can.onEmit');
var offEmitSymbol = canSymbol.for('can.offEmit');

// We register a namespaced radiochange event with the global
// event registry so it does not interfere with user-defined events.
var domEvents = require("can-dom-events");
var radioChangeEvent = require("can-event-dom-radiochange");
var internalRadioChangeEventType = "can-attribute-observable-radiochange";
domEvents.addEvent(radioChangeEvent, internalRadioChangeEventType);

var isSelect = function isSelect(el) {
	return el.nodeName.toLowerCase() === "select";
};

var isMultipleSelect = function isMultipleSelect(el, prop) {
	return isSelect(el) && prop === "value" && el.multiple;
};

var slice = Array.prototype.slice;

function canUtilAEL () {
	var args = slice.call(arguments, 0);
	args.unshift(this);
	return domEvents.addEventListener.apply(null, args);
}

function canUtilREL () {
	var args = slice.call(arguments, 0);
	args.unshift(this);
	return domEvents.removeEventListener.apply(null, args);
}

function AttributeObservable(el, prop, bindingData, event) {
	if(typeof bindingData === "string") {
		event = bindingData;
		bindingData = undefined;
	}

	this.el = el;
	this.bound = false;
	this.prop = isMultipleSelect(el, prop) ? "values" : prop;
	this.event = event || getEventName(el, prop);
	this.handler = this.handler.bind(this);

	// If we have an event
	// remove onValue/offValue and add onEvent
	if (event !== undefined) {
		this[onValueSymbol] = null;
		this[offValueSymbol] = null;
		this[onEmitSymbol] = AttributeObservable.prototype.on;
		this[offEmitSymbol] = AttributeObservable.prototype.off;
	}


	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		// register what changes the element's attribute
		canReflectDeps.addMutatedBy(this.el, this.prop, this);

		canReflect.assignSymbols(this, {
			"can.getName": function getName() {
				return (
					"AttributeObservable<" +
					el.nodeName.toLowerCase() +
					"." +
					this.prop +
					">"
				);
			}
		});
	}
	//!steal-remove-end
}

AttributeObservable.prototype = Object.create(SettableObservable.prototype);

canAssign(AttributeObservable.prototype, {
	constructor: AttributeObservable,

	get: function get() {
		if (ObservationRecorder.isRecording()) {
			ObservationRecorder.add(this);
			if (!this.bound) {
				Observation.temporarilyBind(this);
			}
		}
		var value = attr.get(this.el, this.prop);
		if (typeof value === 'function') {
			value = value.bind(this.el);
		}
		return value;
	},

	set: function set(newVal) {
		var setterDispatchedEvents = attr.setAttrOrProp(this.el, this.prop, newVal);
		// update the observation internal value
		if(!setterDispatchedEvents) {
			this._value = newVal;
		}


		return newVal;
	},

	handler: function handler(newVal, event) {
		var old = this._value;
		var queuesArgs = [];
		this._value = attr.get(this.el, this.prop);

		// If we have an event then we want to enqueue on all changes
		// otherwise only enquue when there are changes to the value
		if (event !== undefined || this._value !== old) {
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				if (typeof this._log === "function") {
					this._log(old, newVal);
				}
			}
			//!steal-remove-end


			queuesArgs = [
				this.handlers.getNode([]),
  			this,
  			[newVal, old]
  		];
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				queuesArgs = [
					this.handlers.getNode([]),
					this,
					[newVal, old]
					/* jshint laxcomma: true */
					,null
					,[this.el,this.prop,"changed to", newVal, "from", old, "by", event]
					/* jshint laxcomma: false */
				];
			}
			//!steal-remove-end
			// adds callback handlers to be called w/i their respective queue.
			queues.enqueueByQueue.apply(queues, queuesArgs);
		}
	},

	onBound: function onBound() {
		var observable = this;

		observable.bound = true;

		// make sure `this.handler` gets the new value instead of
		// the event object passed to the event handler
		observable._handler = function(event) {
			observable.handler(attr.get(observable.el, observable.prop), event);
		};

		if (observable.event === internalRadioChangeEventType) {
			canEvent.on.call(observable.el, "change", observable._handler);
		}

		var specialBinding = attr.findSpecialListener(observable.prop);
		if (specialBinding) {
			observable._specialDisposal = specialBinding.call(observable.el, observable.prop, observable._handler, canUtilAEL);
		}

		canEvent.on.call(observable.el, observable.event, observable._handler);

		// initial value
		this._value = attr.get(this.el, this.prop);
	},

	onUnbound: function onUnbound() {
		var observable = this;

		observable.bound = false;

		if (observable.event === internalRadioChangeEventType) {
			canEvent.off.call(observable.el, "change", observable._handler);
		}

		if (observable._specialDisposal) {
			observable._specialDisposal.call(observable.el, canUtilREL);
			observable._specialDisposal = null;
		}

		canEvent.off.call(observable.el, observable.event, observable._handler);
	},

	valueHasDependencies: function valueHasDependencies() {
		return true;
	},

	getValueDependencies: function getValueDependencies() {
		var m = new Map();
		var s = new Set();
		s.add(this.prop);
		m.set(this.el, s);
		return {
			keyDependencies: m
		};
	}
});

canReflect.assignSymbols(AttributeObservable.prototype, {
	"can.isMapLike": false,
	"can.getValue": AttributeObservable.prototype.get,
	"can.setValue": AttributeObservable.prototype.set,
	"can.onValue": AttributeObservable.prototype.on,
	"can.offValue": AttributeObservable.prototype.off,
	"can.valueHasDependencies": AttributeObservable.prototype.hasDependencies,
	"can.getValueDependencies": AttributeObservable.prototype.getValueDependencies
});

module.exports = AttributeObservable;
