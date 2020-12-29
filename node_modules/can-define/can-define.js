"use strict";
"format cjs";

var ns = require("can-namespace");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");

var Observation = require("can-observation");
var ObservationRecorder = require("can-observation-recorder");
var AsyncObservable = require("can-simple-observable/async/async");
var SettableObservable = require("can-simple-observable/settable/settable");
var ResolverObservable = require("can-simple-observable/resolver/resolver");

var eventQueue = require("can-event-queue/map/map");
var addTypeEvents = require("can-event-queue/type/type");
var queues = require("can-queues");

var assign = require("can-assign");
var canLogDev = require("can-log/dev/dev");

var stringToAny = require("can-string-to-any");
var defineLazyValue = require("can-define-lazy-value");

var MaybeBoolean = require("can-data-types/maybe-boolean/maybe-boolean"),
    MaybeDate = require("can-data-types/maybe-date/maybe-date"),
    MaybeNumber = require("can-data-types/maybe-number/maybe-number"),
    MaybeString = require("can-data-types/maybe-string/maybe-string");

var newSymbol = canSymbol.for("can.new"),
	serializeSymbol = canSymbol.for("can.serialize"),
	inSetupSymbol = canSymbol.for("can.initializing");

var eventsProto, define,
	make, makeDefinition, getDefinitionsAndMethods, getDefinitionOrMethod;

// UTILITIES
function isDefineType(func){
	return func && (func.canDefineType === true || func[newSymbol] );
}

var peek = ObservationRecorder.ignore(canReflect.getValue.bind(canReflect));

var Object_defineNamedPrototypeProperty = Object.defineProperty;
//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	Object_defineNamedPrototypeProperty = function(obj, prop, definition) {
		if (definition.get) {
			Object.defineProperty(definition.get, "name", {
				value: "get "+canReflect.getName(obj) + "."+prop,
				writable: true,
				configurable: true
			});
		}
		if (definition.set) {
			Object.defineProperty(definition.set, "name", {
				value:  "set "+canReflect.getName(obj) + "."+prop,
				configurable: true
			});
		}
		return Object.defineProperty(obj, prop, definition);
	};
}
//!steal-remove-end


function defineConfigurableAndNotEnumerable(obj, prop, value) {
	Object.defineProperty(obj, prop, {
		configurable: true,
		enumerable: false,
		writable: true,
		value: value
	});
}

function eachPropertyDescriptor(map, cb){
	for(var prop in map) {
		if(map.hasOwnProperty(prop)) {
			cb.call(map, prop, Object.getOwnPropertyDescriptor(map,prop));
		}
	}
}

function getEveryPropertyAndSymbol(obj) {
	var props = Object.getOwnPropertyNames(obj);
	var symbols = ("getOwnPropertySymbols" in Object) ?
	  Object.getOwnPropertySymbols(obj) : [];
	return props.concat(symbols);
}

function cleanUpDefinition(prop, definition, shouldWarn, typePrototype){
	// cleanup `value` -> `default`
	if(definition.value !== undefined && ( typeof definition.value !== "function" || definition.value.length === 0) ){

		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			if(shouldWarn) {
				canLogDev.warn(
					"can-define: Change the 'value' definition for " + canReflect.getName(typePrototype)+"."+prop + " to 'default'."
				);
			}
		}
		//!steal-remove-end

		definition.default = definition.value;
		delete definition.value;
	}
	// cleanup `Value` -> `DEFAULT`
	if(definition.Value !== undefined  ){
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			if(shouldWarn) {
				canLogDev.warn(
					"can-define: Change the 'Value' definition for " + canReflect.getName(typePrototype)+"."+prop + " to 'Default'."
				);
			}
		}
		//!steal-remove-end
		definition.Default = definition.Value;
		delete definition.Value;
	}
}

function isValueResolver(definition) {
	// there's a function and it has one argument
	return typeof definition.value === "function" && definition.value.length;
}

module.exports = define = ns.define = function(typePrototype, defines, baseDefine) {
	// default property definitions on _data
	var prop,
		dataInitializers = Object.create(baseDefine ? baseDefine.dataInitializers : null),
		// computed property definitions on _computed
		computedInitializers = Object.create(baseDefine ? baseDefine.computedInitializers : null);

	var result = getDefinitionsAndMethods(defines, baseDefine, typePrototype);
	result.dataInitializers = dataInitializers;
	result.computedInitializers = computedInitializers;


	// Goes through each property definition and creates
	// a `getter` and `setter` function for `Object.defineProperty`.
	canReflect.eachKey(result.definitions, function(definition, property){
		define.property(typePrototype, property, definition, dataInitializers, computedInitializers, result.defaultDefinition);
	});

	// Places a `_data` on the prototype that when first called replaces itself
	// with a `_data` object local to the instance.  It also defines getters
	// for any value that has a default value.
	if(typePrototype.hasOwnProperty("_data")) {
		for (prop in dataInitializers) {
			defineLazyValue(typePrototype._data, prop, dataInitializers[prop].bind(typePrototype), true);
		}
	} else {
		defineLazyValue(typePrototype, "_data", function() {
			var map = this;
			var data = {};
			for (var prop in dataInitializers) {
				defineLazyValue(data, prop, dataInitializers[prop].bind(map), true);
			}
			return data;
		});
	}

	// Places a `_computed` on the prototype that when first called replaces itself
	// with a `_computed` object local to the instance.  It also defines getters
	// that will create the property's compute when read.
	if(typePrototype.hasOwnProperty("_computed")) {
		for (prop in computedInitializers) {
			defineLazyValue(typePrototype._computed, prop, computedInitializers[prop].bind(typePrototype));
		}
	} else {
		defineLazyValue(typePrototype, "_computed", function() {
			var map = this;
			var data = Object.create(null);
			for (var prop in computedInitializers) {
				defineLazyValue(data, prop, computedInitializers[prop].bind(map));
			}
			return data;
		});
	}

	// Add necessary event methods to this object.
	getEveryPropertyAndSymbol(eventsProto).forEach(function(prop){
		Object.defineProperty(typePrototype, prop, {
			enumerable: false,
			value: eventsProto[prop],
			configurable: true,
			writable: true
		});
	});
	// also add any symbols
	// add so instance defs can be dynamically added
	Object.defineProperty(typePrototype,"_define",{
		enumerable: false,
		value: result,
		configurable: true,
		writable: true
	});

	// Places Symbol.iterator or @@iterator on the prototype
	// so that this can be iterated with for/of and canReflect.eachIndex
	var iteratorSymbol = canSymbol.iterator || canSymbol.for("iterator");
	if(!typePrototype[iteratorSymbol]) {
		defineConfigurableAndNotEnumerable(typePrototype, iteratorSymbol, function(){
			return new define.Iterator(this);
		});
	}

	return result;
};

var onlyType = function(obj){
	for(var prop in obj) {
		if(prop !== "type") {
			return false;
		}
	}
	return true;
};

define.extensions = function () {};

// typePrototype - the prototype of the type we are defining `prop` on.
// `definition` - the user provided definition
define.property = function(typePrototype, prop, definition, dataInitializers, computedInitializers, defaultDefinition) {
	var propertyDefinition = define.extensions.apply(this, arguments);

	if (propertyDefinition) {
		definition = makeDefinition(prop, propertyDefinition, defaultDefinition || {}, typePrototype);
	}

	var type = definition.type;

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		var hasZeroArgGetter = definition.get && definition.get.length === 0;
		var noSetter = !definition.set;
		var defaultInDefinition = ( "default" in definition || "Default" in definition );
		var typeInDefinition = (definition.type && defaultDefinition && definition.type !== defaultDefinition.type) ||
			(definition.Type && defaultDefinition && definition.Type !== defaultDefinition.Type);

		if(hasZeroArgGetter && noSetter && defaultInDefinition) {
			var defaultOrDefault = "default" in definition ? "default" : "Default";
				canLogDev.warn("can-define: " + defaultOrDefault + " value for property " +
						canReflect.getName(typePrototype)+"."+ prop +
						" ignored, as its definition has a zero-argument getter");
		}

		if(hasZeroArgGetter && noSetter && typeInDefinition) {
			var typeOrType = definition.type ? "type" : "Type";
			canLogDev.warn("can-define: " + typeOrType + " value for property " +
					canReflect.getName(typePrototype)+"."+ prop +
					" ignored, as its definition has a zero-argument getter");
		}

		if (type && canReflect.isConstructorLike(type) && !isDefineType(type)) {
			canLogDev.warn(
				"can-define: the definition for " + canReflect.getName(typePrototype) + "."+
                prop +
				" uses a constructor for \"type\". Did you mean \"Type\"?"
			);
		}
	}
	//!steal-remove-end

	// Special case definitions that have only `type: "*"`.
	if (type && onlyType(definition) && type === define.types["*"]) {
		Object_defineNamedPrototypeProperty(typePrototype, prop, {
			get: make.get.data(prop),
			set: make.set.events(prop, make.get.data(prop), make.set.data(prop), make.eventType.data(prop)),
			enumerable: true,
			configurable: true
		});
		return;
	}
	definition.type = type;

	// Where the value is stored.  If there is a `get` the source of the value
	// will be a compute in `this._computed[prop]`.  If not, the source of the
	// value will be in `this._data[prop]`.
	var dataProperty = definition.get || isValueResolver(definition) ? "computed" : "data",

		// simple functions that all read/get/set to the right place.
		// - reader - reads the value but does not observe.
		// - getter - reads the value and notifies observers.
		// - setter - sets the value.
		reader = make.read[dataProperty](prop),
		getter = make.get[dataProperty](prop),
		setter = make.set[dataProperty](prop),
		getInitialValue;

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		if (definition.get) {
			Object.defineProperty(definition.get, "name", {
				value: canReflect.getName(typePrototype) + "'s " + prop + " getter",
				configurable: true
			});
		}
		if (definition.set) {
			Object.defineProperty(definition.set, "name", {
				value: canReflect.getName(typePrototype) + "'s " + prop + " setter",
				configurable: true
			});
		}
		if(isValueResolver(definition)) {
			Object.defineProperty(definition.value, "name", {
				value: canReflect.getName(typePrototype) + "'s " + prop + " value",
				configurable: true
			});
		}
	}
	//!steal-remove-end

	// Determine the type converter
	var typeConvert = function(val) {
		return val;
	};

	if (definition.Type) {
		typeConvert = make.set.Type(prop, definition.Type, typeConvert);
	}
	if (type) {
		typeConvert = make.set.type(prop, type, typeConvert);
	}

	// make a setter that's going to fire of events
	var eventsSetter = make.set.events(prop, reader, setter, make.eventType[dataProperty](prop));
	if(isValueResolver(definition)) {
		computedInitializers[prop] = make.valueResolver(prop, definition, typeConvert);
	}
	// Determine a function that will provide the initial property value.
	else if ((definition.default !== undefined || definition.Default !== undefined)) {

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			// If value is an object or array, give a warning
			if (definition.default !== null && typeof definition.default === 'object') {
				canLogDev.warn("can-define: The default value for " + canReflect.getName(typePrototype)+"."+prop + " is set to an object. This will be shared by all instances of the DefineMap. Use a function that returns the object instead.");
			}
			// If value is a constructor, give a warning
			if (definition.default && canReflect.isConstructorLike(definition.default)) {
				canLogDev.warn("can-define: The \"default\" for " + canReflect.getName(typePrototype)+"."+prop + " is set to a constructor. Did you mean \"Default\" instead?");
			}
		}
		//!steal-remove-end

		getInitialValue = ObservationRecorder.ignore(make.get.defaultValue(prop, definition, typeConvert, eventsSetter));
	}

	// If property has a getter, create the compute that stores its data.
	if (definition.get) {
		computedInitializers[prop] = make.compute(prop, definition.get, getInitialValue);
	}
	// If the property isn't a getter, but has an initial value, setup a
	// default value on `this._data[prop]`.
	else if (getInitialValue) {
		dataInitializers[prop] = getInitialValue;
	}


	// Define setter behavior.

	// If there's a `get` and `set`, make the setter get the `lastSetValue` on the
	// `get`'s compute.
	if (definition.get && definition.set) {
		// the compute will set off events, so we can use the basic setter
		setter = make.set.setter(prop, definition.set, make.read.lastSet(prop), setter, true);

        // If there's zero-arg `get`, warn on all sets in dev mode
        if (definition.get.length === 0 ) {
            //!steal-remove-start
            if(process.env.NODE_ENV !== 'production') {
                canLogDev.warn("can-define: Set value for property " +
                    canReflect.getName(typePrototype)+"."+ prop +
                    " ignored, as its definition has a zero-argument getter");
            }
            //!steal-remove-end
        }
	}
	// If there's a `set` and no `get`,
	else if (definition.set) {
		// Add `set` functionality to the eventSetter.
		setter = make.set.setter(prop, definition.set, reader, eventsSetter, false);
	}
	// If there's neither `set` or `get` or `value` (resolver)
	else if (dataProperty === "data") {
		// make a set that produces events.
		setter = eventsSetter;
	}
	// If there's zero-arg `get` but not `set`, warn on all sets in dev mode
	else if (definition.get && definition.get.length < 1) {
		setter = function() {
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				canLogDev.warn("can-define: Set value for property " +
					canReflect.getName(typePrototype)+"."+ prop +
					" ignored, as its definition has a zero-argument getter and no setter");
			}
			//!steal-remove-end
		};
	}

	// Add type behavior to the setter.
	if (type) {
		setter = make.set.type(prop, type, setter);
	}
	if (definition.Type) {
		setter = make.set.Type(prop, definition.Type, setter);
	}

	// Define the property.
	Object_defineNamedPrototypeProperty(typePrototype, prop, {
		get: getter,
		set: setter,
		enumerable: "serialize" in definition ? !!definition.serialize : !definition.get,
		configurable: true
	});
};
define.makeDefineInstanceKey = function(constructor) {
	constructor[canSymbol.for("can.defineInstanceKey")] = function(property, value) {
		var defineResult = this.prototype._define;
		if(typeof value === "object") {
			// change `value` to default.
			cleanUpDefinition(property, value, false, this);
		}
		var definition = getDefinitionOrMethod(property, value, defineResult.defaultDefinition, this);
		if(definition && typeof definition === "object") {
			define.property(constructor.prototype, property, definition, defineResult.dataInitializers, defineResult.computedInitializers, defineResult.defaultDefinition);
			defineResult.definitions[property] = definition;
		} else {
			defineResult.methods[property] = definition;
		}

		this.prototype.dispatch({
			action: "can.keys",
			type: "can.keys", // TODO: Remove in 6.0
			target: this.prototype
		});
	};
};

// Makes a simple constructor function.
define.Constructor = function(defines, sealed) {
	var constructor = function DefineConstructor(props) {
		Object.defineProperty(this, inSetupSymbol, {
			configurable: true,
			enumerable: false,
			value: true,
			writable: true
		});
		define.setup.call(this, props, sealed);
		this[inSetupSymbol] = false;
	};
	var result = define(constructor.prototype, defines);
	addTypeEvents(constructor);
	define.makeDefineInstanceKey(constructor, result);
	return constructor;
};

// A bunch of helper functions that are used to create various behaviors.
make = {

	computeObj: function(map, prop, observable) {
		var computeObj = {
			oldValue: undefined,
			compute: observable,
			count: 0,
			handler: function(newVal) {
				var oldValue = computeObj.oldValue;
				computeObj.oldValue = newVal;

				map.dispatch({
					action: "set",
					key: "prop",
					target: map,
					value: newVal,
					oldValue: oldValue,
					type: prop, // TODO: Remove in 6.0
				}, [newVal, oldValue]);
			}
		};
		return computeObj;
	},
	valueResolver: function(prop, definition, typeConvert) {
		var getDefault = make.get.defaultValue(prop, definition, typeConvert);
		return function(){
			var map = this;
			var defaultValue = getDefault.call(this);
			var computeObj = make.computeObj(map, prop, new ResolverObservable(definition.value, map, defaultValue));
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				Object.defineProperty(computeObj.handler, "name", {
					value: canReflect.getName(definition.value).replace('value', 'event emitter')
				});
			}
			//!steal-remove-end
			return computeObj;
		};
	},
	// Returns a function that creates the `_computed` prop.
	compute: function(prop, get, defaultValueFn) {

		return function() {
			var map = this,
				defaultValue = defaultValueFn && defaultValueFn.call(this),
				observable, computeObj;

			if(get.length === 0) {
				observable = new Observation(get, map);
			} else if(get.length === 1) {
				observable = new SettableObservable(get, map, defaultValue);
			} else {
				observable = new AsyncObservable(get, map, defaultValue);
			}

			computeObj = make.computeObj(map, prop, observable);

			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				Object.defineProperty(computeObj.handler, "name", {
					value: canReflect.getName(get).replace('getter', 'event emitter')
				});
			}
			//!steal-remove-end

			return computeObj;
		};
	},
	// Set related helpers.
	set: {
		data: function(prop) {
			return function(newVal) {
				this._data[prop] = newVal;
			};
		},
		computed: function(prop) {
			return function(val) {
				canReflect.setValue( this._computed[prop].compute, val );
			};
		},
		events: function(prop, getCurrent, setData, eventType) {
			return function(newVal) {
				if (this[inSetupSymbol]) {
					setData.call(this, newVal);
				}
				else {
					var current = getCurrent.call(this);
					if (newVal === current) {
						return;
					}
					var dispatched;
					setData.call(this, newVal);

						dispatched = {
							patches: [{type: "set", key: prop, value: newVal}],
							target: this,
							action: "set",
							value: newVal,
							oldValue: current,
							key: prop,
							type: prop // TODO: Remove in 6.0
						};

					//!steal-remove-start
					if(process.env.NODE_ENV !== 'production') {
						var lastItem, lastFn;
						dispatched.reasonLog = [ canReflect.getName(this) + "'s", prop, "changed to", newVal, "from", current ];

						// If there are observations currently recording, this isn't a good time to
						//   mutate values: it's likely a cycle, and even if it doesn't cycle infinitely,
						//   it will likely cause unnecessary recomputation of derived values.  Warn the user.
						if(ObservationRecorder.isRecording() && queues.stack().length && !this[inSetupSymbol]) {
							lastItem = queues.stack()[queues.stack().length - 1];
							lastFn = lastItem.context instanceof Observation ? lastItem.context.func : lastItem.fn;
							var mutationWarning = "can-define: The " + prop + " property on " +
								canReflect.getName(this) +
								" is being set in " +
								(canReflect.getName(lastFn) || canReflect.getName(lastItem.fn)) +
								". This can cause infinite loops and performance issues. " +
								"Use the value() behavior for " +
								prop +
								" instead, and listen to other properties and observables with listenTo(). https://canjs.com/doc/can-define.types.value.html";
							canLogDev.warn(mutationWarning);
							queues.logStack();
						}
					}
					//!steal-remove-end

					this.dispatch(dispatched, [newVal, current]);
				}
			};
		},
		setter: function(prop, setter, getCurrent, setEvents, hasGetter) {
			return function(value) {
				//!steal-remove-start
				var asyncTimer;
				//!steal-remove-end

				var self = this;

				// call the setter, if returned value is undefined,
				// this means the setter is async so we
				// do not call update property and return right away

				queues.batch.start();
				var setterCalled = false,
					current = getCurrent.call(this),
					setValue = setter.call(this, value, function(value) {
						setEvents.call(self, value);

						setterCalled = true;
						//!steal-remove-start
						if(process.env.NODE_ENV !== 'production') {
							clearTimeout(asyncTimer);
						}
						//!steal-remove-end
					}, current);

				if (setterCalled) {
					queues.batch.stop();
				} else {
					if (hasGetter) {
						// we got a return value
						if (setValue !== undefined) {
							// if the current `set` value is returned, don't set
							// because current might be the `lastSetVal` of the internal compute.
							if (current !== setValue) {
								setEvents.call(this, setValue);
							}
							queues.batch.stop();
						}
						// this is a side effect, it didn't take a value
						// so use the original set value
						else if (setter.length === 0) {
							setEvents.call(this, value);
							queues.batch.stop();
							return;
						}
						// it took a value
						else if (setter.length === 1) {
							// if we have a getter, and undefined was returned,
							// we should assume this is setting the getters properties
							// and we shouldn't do anything.
							queues.batch.stop();
						}
						// we are expecting something
						else {
							//!steal-remove-start
							if(process.env.NODE_ENV !== 'production') {
								asyncTimer = setTimeout(function() {
									canLogDev.warn('can-define: Setter "' + canReflect.getName(self)+"."+prop + '" did not return a value or call the setter callback.');
								}, canLogDev.warnTimeout);
							}
							//!steal-remove-end
							queues.batch.stop();
							return;
						}
					} else {
						// we got a return value
						if (setValue !== undefined) {
							// if the current `set` value is returned, don't set
							// because current might be the `lastSetVal` of the internal compute.
							setEvents.call(this, setValue);
							queues.batch.stop();
						}
						// this is a side effect, it didn't take a value
						// so use the original set value
						else if (setter.length === 0) {
							setEvents.call(this, value);
							queues.batch.stop();
							return;
						}
						// it took a value
						else if (setter.length === 1) {
							// if we don't have a getter, we should probably be setting the
							// value to undefined
							setEvents.call(this, undefined);
							queues.batch.stop();
						}
						// we are expecting something
						else {
							//!steal-remove-start
							if(process.env.NODE_ENV !== 'production') {
								asyncTimer = setTimeout(function() {
									canLogDev.warn('can/map/setter.js: Setter "' + canReflect.getName(self)+"."+prop + '" did not return a value or call the setter callback.');
								}, canLogDev.warnTimeout);
							}
							//!steal-remove-end
							queues.batch.stop();
							return;
						}
					}


				}
			};
		},
		type: function(prop, type, set) {
			function setter(newValue) {
				return set.call(this, type.call(this, newValue, prop));
			}
			if(isDefineType(type)) {
				// TODO: remove this `canDefineType` check in a future release.
				if(type.canDefineType) {
					return setter;
				} else {
					return function setter(newValue){
						return set.call(this, canReflect.convert(newValue, type));
					};
				}
			}
			// If type is a nested object: `type: {foo: "string", bar: "number"}`
			if (typeof type === "object") {
				return make.set.Type(prop, type, set);
			} else {
				return setter;
			}
		},
		Type: function(prop, Type, set) {
			// `type`: {foo: "string"}
			if(Array.isArray(Type) && define.DefineList) {
				Type = define.DefineList.extend({
					"#": Type[0]
				});
			} else if (typeof Type === "object") {
				if(define.DefineMap) {
					Type = define.DefineMap.extend(Type);
				} else {
					Type = define.Constructor(Type);
				}
			}
			return function(newValue) {
				if (newValue instanceof Type || newValue == null) {
					return set.call(this, newValue);
				} else {
					return set.call(this, new Type(newValue));
				}
			};
		}
	},
	// Helpes that indicate what the event type should be.  These probably aren't needed.
	eventType: {
		data: function(prop) {
			return function(newVal, oldVal) {
				return oldVal !== undefined || this._data.hasOwnProperty(prop) ? "set" : "add";
			};
		},
		computed: function() {
			return function() {
				return "set";
			};
		}
	},
	// Helpers that read the data in a non-observable way.
	read: {
		data: function(prop) {
			return function() {
				return this._data[prop];
			};
		},
		computed: function(prop) {
			// might want to protect this
			return function() {
				return canReflect.getValue( this._computed[prop].compute );
			};
		},
		lastSet: function(prop) {
			return function() {
				var observable = this._computed[prop].compute;
				if(observable.lastSetValue) {
					return canReflect.getValue(observable.lastSetValue);
				}
			};
		}
	},
	// Helpers that read the data in an observable way.
	get: {
		// uses the default value
		defaultValue: function(prop, definition, typeConvert, callSetter) {
			return function() {
				var value = definition.default;
				if (value !== undefined) {
					if (typeof value === "function") {
						value = value.call(this);
					}
					value = typeConvert.call(this, value);
				}
				else {
					var Default = definition.Default;
					if (Default) {
						value = typeConvert.call(this,new Default());
					}
				}
				if(definition.set) {
					// TODO: there's almost certainly a faster way of making this happen
					// But this is maintainable.

					var VALUE;
					var sync = true;

					var setter = make.set.setter(prop, definition.set, function(){}, function(value){
						if(sync) {
							VALUE = value;
						} else {
							callSetter.call(this, value);
						}
					}, definition.get);

					setter.call(this,value);
					sync= false;

					// VALUE will be undefined if the callback is never called.
					return VALUE;


				}
				return value;
			};
		},
		data: function(prop) {
			return function() {
				if (!this[inSetupSymbol]) {
					ObservationRecorder.add(this, prop);
				}

				return this._data[prop];
			};
		},
		computed: function(prop) {
			return function(val) {
				var compute = this._computed[prop].compute;
				if (ObservationRecorder.isRecording()) {
					ObservationRecorder.add(this, prop);
					if (!canReflect.isBound(compute)) {
						Observation.temporarilyBind(compute);
					}
				}

				return peek(compute);
			};
		}
	}
};

define.behaviors = ["get", "set", "value", "Value", "type", "Type", "serialize"];

// This cleans up a particular behavior and adds it to the definition
var addBehaviorToDefinition = function(definition, behavior, value) {
	if(behavior === "enumerable") {
		// treat enumerable like serialize
		definition.serialize = !!value;
	}
	else if(behavior === "type") {
		var behaviorDef = value;
		if(typeof behaviorDef === "string") {
			behaviorDef = define.types[behaviorDef];
			if(typeof behaviorDef === "object" && !isDefineType(behaviorDef)) {
				assign(definition, behaviorDef);
				behaviorDef = behaviorDef[behavior];
			}
		}
		if (typeof behaviorDef !== 'undefined') {
			definition[behavior] = behaviorDef;
		}
	}
	else {
		definition[behavior] = value;
	}
};

// This is called by `define.property` AND `getDefinitionOrMethod` (which is called by `define`)
// Currently, this is adding default behavior
// copying `type` over, and even cleaning up the final definition object
makeDefinition = function(prop, def, defaultDefinition, typePrototype) {

	var definition = {};

	canReflect.eachKey(def, function(value, behavior) {
		addBehaviorToDefinition(definition, behavior, value);
	});
	// only add default if it doesn't exist
	canReflect.eachKey(defaultDefinition, function(value, prop){
		if(definition[prop] === undefined) {
			if(prop !== "type" && prop !== "Type") {
				definition[prop] = value;
			}
		}
	});

	// normalize Type that implements can.new
	if(def.Type) {
		var value = def.Type;

		var serialize = value[serializeSymbol];
		if(serialize) {
			definition.serialize = function(val){
				return serialize.call(val);
			};
		}
		if(value[newSymbol]) {
			definition.type = value;
			delete definition.Type;
		}
	}

	// We only want to add a defaultDefinition if def.type is not a string
	// if def.type is a string it is handled in addDefinition
	if(typeof def.type !== 'string') {
		// if there's no type definition, take it from the defaultDefinition
		if(!definition.type && !definition.Type) {
            var defaultsCopy = canReflect.assignMap({},defaultDefinition);
            definition = canReflect.assignMap(defaultsCopy, definition);
		}

		if( canReflect.size(definition) === 0 ) {
			definition.type = define.types["*"];
		}
	}
	cleanUpDefinition(prop, definition, true, typePrototype);
	return definition;
};

// called by `can.defineInstanceKey` and `getDefinitionsAndMethods`
// returns the value or the definition object.
// calls makeDefinition
// This is dealing with a string value
getDefinitionOrMethod = function(prop, value, defaultDefinition, typePrototype){
	// Clean up the value to make it a definition-like object
	var definition;
	if(typeof value === "string") {
		definition = {type: value};
	}
    // copies a `Type`'s methods over
	else if(value && (value[serializeSymbol] || value[newSymbol]) ) {
		definition = { Type: value };
	}
	else if(typeof value === "function") {
		if(canReflect.isConstructorLike(value)) {
			definition = {Type: value};
		}
		// or leaves as a function
	} else if( Array.isArray(value) ) {
		definition = {Type: value};
	} else if( canReflect.isPlainObject(value) ){
		definition = value;
	}

	if(definition) {
		return makeDefinition(prop, definition, defaultDefinition, typePrototype);
	}
	else {
		return value;
	}
};
// called by can.define
getDefinitionsAndMethods = function(defines, baseDefines, typePrototype) {
	// make it so the definitions include base definitions on the proto
	var definitions = Object.create(baseDefines ? baseDefines.definitions : null);
	var methods = {};
	// first lets get a default if it exists
	var defaults = defines["*"],
		defaultDefinition;
	if(defaults) {
		delete defines["*"];
		defaultDefinition = getDefinitionOrMethod("*", defaults, {});
	} else {
		defaultDefinition = Object.create(null);
	}

	eachPropertyDescriptor(defines, function( prop, propertyDescriptor ) {

		var value;
		if(propertyDescriptor.get || propertyDescriptor.set) {
			value = {get: propertyDescriptor.get, set: propertyDescriptor.set};
		} else {
			value = propertyDescriptor.value;
		}

		if(prop === "constructor") {
			methods[prop] = value;
			return;
		} else {
			var result = getDefinitionOrMethod(prop, value, defaultDefinition, typePrototype);
			if(result && typeof result === "object" && canReflect.size(result) > 0) {
				definitions[prop] = result;
			}
			else {
				// Removed adding raw values that are not functions
				if (typeof result === 'function') {
					methods[prop] = result;
				}
				//!steal-remove-start
				else if (typeof result !== 'undefined') {
					if(process.env.NODE_ENV !== 'production') {
                    	// Ex: {prop: 0}
						canLogDev.error(canReflect.getName(typePrototype)+"."+prop + " does not match a supported propDefinition. See: https://canjs.com/doc/can-define.types.propDefinition.html");
					}
				}
				//!steal-remove-end
			}
		}
	});
	if(defaults) {
		// we should move this property off the prototype.
		defineConfigurableAndNotEnumerable(defines,"*", defaults);
	}
	return {definitions: definitions, methods: methods, defaultDefinition: defaultDefinition};
};

eventsProto = eventQueue({});

function setupComputed(instance, eventName) {
	var computedBinding = instance._computed && instance._computed[eventName];
	if (computedBinding && computedBinding.compute) {
		if (!computedBinding.count) {
			computedBinding.count = 1;
			canReflect.onValue(computedBinding.compute, computedBinding.handler, "notify");
			computedBinding.oldValue = peek(computedBinding.compute);
		} else {
			computedBinding.count++;
		}

	}
}
function teardownComputed(instance, eventName){
	var computedBinding = instance._computed && instance._computed[eventName];
	if (computedBinding) {
		if (computedBinding.count === 1) {
			computedBinding.count = 0;
			canReflect.offValue(computedBinding.compute, computedBinding.handler,"notify");
		} else {
			computedBinding.count--;
		}
	}
}

var canMetaSymbol = canSymbol.for("can.meta");
assign(eventsProto, {
	_eventSetup: function() {},
	_eventTeardown: function() {},
	addEventListener: function(eventName, handler, queue) {
		setupComputed(this, eventName);
		return eventQueue.addEventListener.apply(this, arguments);
	},

	// ### unbind
	// Stops listening to an event.
	// If this is the last listener of a computed property,
	// stop forwarding events of the computed property to this map.
	removeEventListener: function(eventName, handler) {
		teardownComputed(this, eventName);
		return eventQueue.removeEventListener.apply(this, arguments);

	}
});
eventsProto.on = eventsProto.bind = eventsProto.addEventListener;
eventsProto.off = eventsProto.unbind = eventsProto.removeEventListener;


var onKeyValueSymbol = canSymbol.for("can.onKeyValue");
var offKeyValueSymbol = canSymbol.for("can.offKeyValue");

canReflect.assignSymbols(eventsProto,{
	"can.onKeyValue": function(key){
		setupComputed(this, key);
		return eventQueue[onKeyValueSymbol].apply(this, arguments);
	},
	"can.offKeyValue": function(key){
		teardownComputed(this, key);
		return eventQueue[offKeyValueSymbol].apply(this, arguments);
	}
});

delete eventsProto.one;

define.setup = function(props, sealed) {
	Object.defineProperty(this,"constructor", {value: this.constructor, enumerable: false, writable: false});
	Object.defineProperty(this,canMetaSymbol, {value: Object.create(null), enumerable: false, writable: false});

	/* jshint -W030 */

	var definitions = this._define.definitions;
	var instanceDefinitions = Object.create(null);
	var map = this;
	canReflect.eachKey(props, function(value, prop){
		if(definitions[prop] !== undefined) {
			map[prop] = value;
		} else {
			define.expando(map, prop, value);
		}
	});
	if(canReflect.size(instanceDefinitions) > 0) {
		defineConfigurableAndNotEnumerable(this, "_instanceDefinitions", instanceDefinitions);
	}
	// only seal in dev mode for performance reasons.
	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		this._data;
		this._computed;
		if(sealed !== false) {
			Object.seal(this);
		}
	}
	//!steal-remove-end
};


var returnFirstArg = function(arg){
	return arg;
};

define.expando = function(map, prop, value) {
	if(define._specialKeys[prop]) {
		// ignores _data and _computed
		return true;
	}
	// first check if it's already a constructor define
	var constructorDefines = map._define.definitions;
	if(constructorDefines && constructorDefines[prop]) {
		return;
	}
	// next if it's already on this instances
	var instanceDefines = map._instanceDefinitions;
	if(!instanceDefines) {
		if(Object.isSealed(map)) {
			return;
		}
		Object.defineProperty(map, "_instanceDefinitions", {
			configurable: true,
			enumerable: false,
			writable: true,
			value: {}
		});
		instanceDefines = map._instanceDefinitions;
	}
	if(!instanceDefines[prop]) {
		var defaultDefinition = map._define.defaultDefinition || {type: define.types.observable};
		define.property(map, prop, defaultDefinition, {},{});
		// possibly convert value to List or DefineMap
		if(defaultDefinition.type) {
			map._data[prop] = define.make.set.type(prop, defaultDefinition.type, returnFirstArg).call(map, value);
		} else if (defaultDefinition.Type && canReflect.isConstructorLike(defaultDefinition.Type)) {
			map._data[prop] = define.make.set.Type(prop, defaultDefinition.Type, returnFirstArg).call(map, value);
		} else {
			map._data[prop] = define.types.observable(value);
		}

		instanceDefines[prop] = defaultDefinition;
		if(!map[inSetupSymbol]) {
			queues.batch.start();
			map.dispatch({
				action: "can.keys",
				target: map,
				type: "can.keys" // TODO: Remove in 6.0
			});
			if(Object.prototype.hasOwnProperty.call(map._data, prop)) {
				map.dispatch({
					action: "add",
					target: map,
					value:  map._data[prop],
					oldValue: undefined,
					key: prop,
					type: prop, // TODO: Remove in 6.0
					patches: [{type: "add", key: prop, value: map._data[prop]}],
				},[map._data[prop], undefined]);
			} else {
				map.dispatch({
					type: "set",
					target: map,
					patches: [{type: "add", key: prop, value: map._data[prop]}],
				},[map._data[prop], undefined]);
			}
			queues.batch.stop();
		}
		return true;
	}
};
define.replaceWith = defineLazyValue;
define.eventsProto = eventsProto;
define.defineConfigurableAndNotEnumerable = defineConfigurableAndNotEnumerable;
define.make = make;
define.getDefinitionOrMethod = getDefinitionOrMethod;
define._specialKeys = {_data: true, _computed: true};
var simpleGetterSetters = {};
define.makeSimpleGetterSetter = function(prop){
	if(simpleGetterSetters[prop] === undefined) {

		var setter = make.set.events(prop, make.get.data(prop), make.set.data(prop), make.eventType.data(prop) );

		simpleGetterSetters[prop] = {
			get: make.get.data(prop),
			set: function(newVal){
				return setter.call(this, define.types.observable(newVal));
			},
			enumerable: true,
            configurable: true
		};
	}
	return simpleGetterSetters[prop];
};

define.Iterator = function(obj){
	this.obj = obj;
	this.definitions = Object.keys(obj._define.definitions);
	this.instanceDefinitions = obj._instanceDefinitions ?
		Object.keys(obj._instanceDefinitions) :
		Object.keys(obj);
	this.hasGet = typeof obj.get === "function";
};

define.Iterator.prototype.next = function(){
	var key;
	if(this.definitions.length) {
		key = this.definitions.shift();

		// Getters should not be enumerable
		var def = this.obj._define.definitions[key];
		if(def.get) {
			return this.next();
		}
	} else if(this.instanceDefinitions.length) {
		key = this.instanceDefinitions.shift();
	} else {
		return {
			value: undefined,
			done: true
		};
	}

	return {
		value: [
			key,
			this.hasGet ? this.obj.get(key) : this.obj[key]
		],
		done: false
	};
};



function isObservableValue(obj){
	return canReflect.isValueLike(obj) && canReflect.isObservableLike(obj);
}

define.types = {
	// To be made into a type ... this is both lazy {time: '123-456'}
	'date': MaybeDate,
	'number': MaybeNumber,
	'boolean': MaybeBoolean,
	'observable': function(newVal) {
			if(Array.isArray(newVal) && define.DefineList) {
					newVal = new define.DefineList(newVal);
			}
			else if(canReflect.isPlainObject(newVal) &&  define.DefineMap) {
					newVal = new define.DefineMap(newVal);
			}
			return newVal;
	},
	'stringOrObservable': function(newVal) {
		if(Array.isArray(newVal)) {
			return new define.DefaultList(newVal);
		}
		else if(canReflect.isPlainObject(newVal)) {
			return new define.DefaultMap(newVal);
		}
		else {
			return canReflect.convert( newVal, define.types.string);
		}
	},
	/**
	 * Implements HTML-style boolean logic for attribute strings, where
	 * any string, including "", is truthy.
	 */
	'htmlbool': function(val) {
		if (val === '') {
			return true;
		}
		return !!stringToAny(val);
	},
	'*': function(val) {
		return val;
	},
	'any': function(val) {
		return val;
	},
	'string': MaybeString,

	'compute': {
		set: function(newValue, setVal, setErr, oldValue) {
			if (isObservableValue(newValue) ) {
				return newValue;
			}
			if (isObservableValue(oldValue)) {
				canReflect.setValue(oldValue,newValue);
				return oldValue;
			}
			return newValue;
		},
		get: function(value) {
			return isObservableValue(value) ? canReflect.getValue(value) : value;
		}
	}
};

define.updateSchemaKeys = function(schema, definitions) {
	for(var prop in definitions) {
		var definition = definitions[prop];
		if(definition.serialize !== false ) {
			if(definition.Type) {
				schema.keys[prop] = definition.Type;
			} else if(definition.type) {
				schema.keys[prop] = definition.type;
			} else {
				schema.keys[prop] = function(val){ return val; };
			}
			 // some unknown type
			if(definitions[prop].identity === true) {
				schema.identity.push(prop);
			}
		}
	}
	return schema;
};
