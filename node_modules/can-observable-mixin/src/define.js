"use strict";

const canReflect = require("can-reflect");

let define; //jshint ignore:line
const Observation = require("can-observation");
const ObservationRecorder = require("can-observation-recorder");
const AsyncObservable = require("can-simple-observable/async/async");
const SettableObservable = require("can-simple-observable/settable/settable");
const ResolverObservable = require("can-simple-observable/resolver/resolver");

const eventQueue = require("can-event-queue/map/map");
const addTypeEvents = require("can-event-queue/type/type");
const queues = require("can-queues");

const assign = require("can-assign");
const canLogDev = require("can-log/dev/dev");

const defineLazyValue = require("can-define-lazy-value");
const type = require("can-type");

const newSymbol = Symbol.for("can.new"),
	serializeSymbol = Symbol.for("can.serialize"),
	inSetupSymbol = Symbol.for("can.initializing"),
	isMemberSymbol = Symbol.for("can.isMember"),
	hasBeenDefinedSymbol = Symbol.for("can.hasBeenDefined"),
	canMetaSymbol = Symbol.for("can.meta"),
	baseTypeSymbol = Symbol.for("can.baseType");

let eventsProto,
	make, makeDefinition, getDefinitionsAndMethods, getDefinitionOrMethod;

// UTILITIES
function isDefineType(func){
	return func && (func.canDefineType === true || func[newSymbol] );
}

function observableType() {
	throw new Error("This is not currently implemented.");
}

let AsyncFunction;
const browserSupportsAsyncFunctions = (function() {
	try {
		AsyncFunction = (async function(){}).constructor;
		return true;
	} catch(e) {
		return false;
	}
}());
function isAsyncFunction(fn) {
	if (!browserSupportsAsyncFunctions) {
		return false;
	}
	return fn && fn instanceof AsyncFunction;
}

const peek = ObservationRecorder.ignore(canReflect.getValue.bind(canReflect));

let Object_defineNamedPrototypeProperty = Object.defineProperty;
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

function defineNotWritableAndNotEnumerable(obj, prop, value) {
	Object.defineProperty(obj, prop, {
		value: value,
		enumerable: false,
		writable: false
	});
}

function eachPropertyDescriptor(map, cb, ...args){
	for(const prop of Object.getOwnPropertyNames(map)) {
		if(map.hasOwnProperty(prop)) {
			cb.call(map, prop, Object.getOwnPropertyDescriptor(map, prop), ...args);
		}
	}
}

function getEveryPropertyAndSymbol(obj) {
	const props = Object.getOwnPropertyNames(obj);
	const symbols = ("getOwnPropertySymbols" in Object) ?
	  Object.getOwnPropertySymbols(obj) : [];
	return props.concat(symbols);
}

module.exports = define = function(typePrototype, defines, baseDefine, propertyDefaults = {}) {
	// default property definitions on _data
	let prop,
		dataInitializers = Object.create(baseDefine ? baseDefine.dataInitializers : null),
		// computed property definitions on _computed
		computedInitializers = Object.create(baseDefine ? baseDefine.computedInitializers : null),
		required = new Set();

	const result = getDefinitionsAndMethods(defines, baseDefine, typePrototype, propertyDefaults);
	result.dataInitializers = dataInitializers;
	result.computedInitializers = computedInitializers;
	result.required = required;

	// Goes through each property definition and creates
	// a `getter` and `setter` function for `Object.defineProperty`.
	canReflect.eachKey(result.definitions, function(definition, property){
		// Add this as a required property
		if(definition.required === true) {
			required.add(property);
		}

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
			const map = this;
			const data = {};
			for (const prop in dataInitializers) {
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
			const map = this;
			const data = Object.create(null);
			for (const prop in computedInitializers) {
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
	const iteratorSymbol = Symbol.iterator || Symbol.for("iterator");
	if(!typePrototype[iteratorSymbol]) {
		defineConfigurableAndNotEnumerable(typePrototype, iteratorSymbol, function(){
			return new define.Iterator(this);
		});
	}

	return result;
};

const onlyType = function(obj){
	for(const prop in obj) {
		if(prop !== "type") {
			return false;
		}
	}
	return true;
};

const callAsync = function(fn) {
	return function asyncResolver(lastSet, resolve){
		let newValue = fn.call(this, resolve, lastSet);

		// This should really be happening in can-simple-observable/async/
		// But that would be a breaking change so putting it here.
		if(canReflect.isPromise(newValue)) {
			newValue.then(resolve);
			return undefined;
		}

		return newValue;
	};
};

define.extensions = function () {};

define.isEnumerable = function(definition) {
	return typeof definition !== "object" ||
		("serialize" in definition ?
			!!definition.serialize :
			(!definition.get && !definition.async && !definition.value));
};

// typePrototype - the prototype of the type we are defining `prop` on.
// `definition` - the user provided definition
define.property = function(typePrototype, prop, definition, dataInitializers, computedInitializers, defaultDefinition) {
	const propertyDefinition = define.extensions.apply(this, arguments);

	if (propertyDefinition) {
		definition = makeDefinition(prop, propertyDefinition, defaultDefinition || {}, typePrototype);
	}

	const type = definition.type;

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		if(!definition.set && definition.get && definition.get.length === 0 && ( "default" in definition ) ) {
			canLogDev.warn("can-observable-object: default value for property " +
					canReflect.getName(typePrototype)+"."+ prop +
					" ignored, as its definition has a zero-argument getter and no setter");
		}

	if(!definition.set && definition.get && definition.get.length === 0 && ( definition.type && definition.type !== defaultDefinition.type ) ) {
			canLogDev.warn("can-observable-object: type value for property " +
					canReflect.getName(typePrototype)+"."+ prop +
					" ignored, as its definition has a zero-argument getter and no setter");
		}
	}

	for (let defFuncProp of ['get', 'set', 'value']) {
		const propType = definition[defFuncProp] && typeof definition[defFuncProp];
		if (propType && propType !== 'function') {
			canLogDev.error(`can-observable-object: "${defFuncProp}" for property ${canReflect.getName(typePrototype)}.${prop}` +
				` is expected to be a function, but it's a ${propType}.`);
			return;
		}
	}
	//!steal-remove-end

	// Special case definitions that have only `type: "*"`.
	if (type && onlyType(definition) && type === type.Any) {
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
	let dataProperty = definition.get || definition.async || definition.value ? "computed" : "data",

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
		if(definition.value) {
			Object.defineProperty(definition.value, "name", {
				value: canReflect.getName(typePrototype) + "'s " + prop + " value",
				configurable: true
			});
		}
	}
	//!steal-remove-end

	// Determine the type converter
	let typeConvert = function(val) {
		return val;
	};

	if (type) {
		typeConvert = make.set.type(prop, type, typeConvert);
	}

	// make a setter that's going to fire of events
	const eventsSetter = make.set.events(prop, reader, setter, make.eventType[dataProperty](prop));
	if(definition.value) {
		computedInitializers[prop] = make.resolver(prop, definition, typeConvert);
	}
	// Determine a function that will provide the initial property value.
	else if (definition.default !== undefined) {

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			// If value is an object or array, give a warning
			if (definition.default !== null && typeof definition.default === 'object') {
				canLogDev.warn("can-observable-object: The default value for " + canReflect.getName(typePrototype)+"."+prop + " is set to an object. This will be shared by all instances of the DefineMap. Use a function that returns the object instead.");
			}
			// If value is a constructor, give a warning
			if (definition.default && canReflect.isConstructorLike(definition.default)) {
				canLogDev.warn("can-observable-object: The \"default\" for " + canReflect.getName(typePrototype)+"."+prop + " is set to a constructor. Did you mean \"Default\" instead?");
			}
		}
		//!steal-remove-end

		getInitialValue = ObservationRecorder.ignore(make.get.defaultValue(prop, definition, typeConvert, eventsSetter));
	}

	// If property has a getter, create the compute that stores its data.
	if (definition.get) {
		computedInitializers[prop] = make.compute(prop, definition.get, getInitialValue);
	}
	else if (definition.async) {
		computedInitializers[prop] = make.compute(prop, callAsync(definition.async), getInitialValue);
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
				canLogDev.warn("can-observable-object: Set value for property " +
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

	// Define the property.
	Object_defineNamedPrototypeProperty(typePrototype, prop, {
		get: getter,
		set: setter,
		enumerable: define.isEnumerable(definition),
		configurable: true
	});
};

define.makeDefineInstanceKey = function(constructor) {
	constructor[Symbol.for("can.defineInstanceKey")] = function(property, value) {
		define.hooks.finalizeClass(this);
		const defineResult = this.prototype._define;
		if(value && typeof value.value !== "undefined") {
			value.default = value.value;
			value.type = type.Any;
			delete value.value;
		}
		const definition = getDefinitionOrMethod(property, value, defineResult.defaultDefinition, this);
		if(definition && typeof definition === "object") {
			define.property(this.prototype, property, definition, defineResult.dataInitializers, defineResult.computedInitializers, defineResult.defaultDefinition);
			defineResult.definitions[property] = definition;
		} else {
			defineResult.methods[property] = definition;
		}

		this.prototype.dispatch({
			action: "can.keys",
			type: "can.keys",
			target: this.prototype
		});
	};
};

// Makes a simple constructor function.
define.Constructor = function(defines, sealed) {
	const constructor = function DefineConstructor(props) {
		Object.defineProperty(this, inSetupSymbol, {
			configurable: true,
			enumerable: false,
			value: true,
			writable: true
		});
		define.setup.call(this, props, sealed);
		this[inSetupSymbol] = false;
	};
	const result = define(constructor.prototype, defines);
	addTypeEvents(constructor);
	define.makeDefineInstanceKey(constructor, result);
	return constructor;
};

// A bunch of helper functions that are used to create various behaviors.
make = {
	computeObj: function(map, prop, observable) {
		const computeObj = {
			oldValue: undefined,
			compute: observable,
			count: 0,
			handler: function(newVal) {
				let oldValue = computeObj.oldValue;
				computeObj.oldValue = newVal;

				map.dispatch({
					action: "prop",
					key: prop,
					value: newVal,
					oldValue: oldValue,
					type: prop,
					target: map
				}, [newVal, oldValue]);
			}
		};
		return computeObj;
	},
	resolver: function(prop, definition, typeConvert) {
		const getDefault = make.get.defaultValue(prop, definition, typeConvert);
		return function(){
			const map = this;
			const defaultValue = getDefault.call(this);
			const computeObj = make.computeObj(map, prop, new ResolverObservable(definition.value, map, defaultValue, {
				resetUnboundValueInGet: true
			}));
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
			const map = this;
			const defaultValue = defaultValueFn && defaultValueFn.call(this);
			let observable, computeObj;

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
		events: function(prop, getCurrent, setData/*, eventType*/) {
			return function(newVal) {
				if (this[inSetupSymbol]) {
					setData.call(this, newVal);
				}
				else {
					const current = getCurrent.call(this);
					if (newVal !== current) {
						let dispatched;
						setData.call(this, newVal);

						dispatched = {
							patches: [{type: "set", key: prop, value: newVal}],
							action: "prop",
							key: prop,
							value: newVal,
							oldValue: current,
							type: prop,
							target: this
						};

						//!steal-remove-start
						if(process.env.NODE_ENV !== 'production') {
							dispatched.reasonLog = [ canReflect.getName(this) + "'s", prop, "changed to", newVal, "from", current ];
						}
						//!steal-remove-end

						this.dispatch(dispatched, [newVal, current]);
					}
				}
			};
		},
		eventDispatcher: function(map, prop, current, newVal) {
			if (map[inSetupSymbol]) {
				return;
			}
			else {
				if (newVal !== current) {
					const dispatched = {
						patches: [{type: "set", key: prop, value: newVal}],
						action: "prop",
						key: prop,
						value: newVal,
						oldValue: current,
						type: prop,
						target: map
					};

					//!steal-remove-start
					if(process.env.NODE_ENV !== 'production') {
						dispatched.reasonLog = [ canReflect.getName(this) + "'s", prop, "changed to", newVal, "from", current ];
					}
					//!steal-remove-end

					eventQueue.dispatch.call(map, dispatched, [newVal, current]);
				}
			}
		},
		setter: function(prop, setter, getCurrent, setEvents, hasGetter) {
			return function(value) {
				//!steal-remove-start
				var asyncTimer;
				//!steal-remove-end

				const self = this;

				// call the setter, if returned value is undefined,
				// this means the setter is async so we
				// do not call update property and return right away

				queues.batch.start();
				const setterCalled = false,
					current = getCurrent.call(this),
					setValue = setter.call(this, value, current);

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
									canLogDev.warn('can-observable-object: Setter "' + canReflect.getName(self)+"."+prop + '" did not return a value or call the setter callback.');
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
						//!steal-remove-start
						if(process.env.NODE_ENV !== 'production') {
							try {
								return set.call(this, canReflect.convert(newValue, type));
							} catch (error) {
								if (error.type === 'can-type-error') {
									const typeName = canReflect.getName(type[baseTypeSymbol]);
									const valueType = typeof newValue;
									let message  = '"' + newValue + '"' +  ' ('+ valueType + ') is not of type ' + typeName + '. Property ' + prop + ' is using "type: ' + typeName + '". ';
									message += 'Use "' + prop + ': type.convert(' + typeName + ')" to automatically convert values to ' + typeName + 's when setting the "' + prop + '" property.';
									error.message = message;
									
								}
								throw error;
							}
						}
						//!steal-remove-end
						return set.call(this, canReflect.convert(newValue, type));
					};
				}
			}
			return setter;
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
				const observable = this._computed[prop].compute;
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
				let value = definition.default;
				if (value !== undefined) {
					// call `get default() { ... }` but not `default() { ... }`
					if (typeof value === "function" && value.isAGetter) {
						value = value.call(this);
					}
					value = typeConvert.call(this, value);
				}
				if(definition.set) {
					// TODO: there's almost certainly a faster way of making this happen
					// But this is maintainable.

					let VALUE;
					let sync = true;

					const setter = make.set.setter(prop, definition.set, function(){}, function(value){
						if(sync) {
							VALUE = value;
						} else {
							callSetter.call(this, value);
						}
					}, definition.get);

					setter.call(this,value);
					sync = false;

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
			return function(/*val*/) {
				const compute = this._computed[prop].compute;
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

define.behaviors = ["get", "set", "value", "type", "serialize"];

// This cleans up a particular behavior and adds it to the definition
const addBehaviorToDefinition = function(definition, behavior, descriptor, def, prop, typePrototype) {
	if(behavior === "enumerable") {
		// treat enumerable like serialize
		definition.serialize = !!def[behavior];
	}
	else if(behavior === "type") {
		const behaviorDef = def[behavior];
		if (typeof behaviorDef !== 'undefined') {
			definition[behavior] = behaviorDef;
		}
	}
	else {
		// This is a good place to do warnings? This gets called for every behavior
		// Both by .define() and .property()
		const value = descriptor.get || descriptor.value;
		if (descriptor.get) {
			value.isAGetter = true;
		}
		if(behavior === "async") {
			if(value.length === 1 && isAsyncFunction(value)) {
				canLogDev.warn(`${canReflect.getName(typePrototype)}: async property [${prop}] should not be an async function and also use the resolve() argument. Remove the argument and return a value from the async function instead.`);
			}
		}

		definition[behavior] = value;
	}
};

// This is called by `define.property` AND `getDefinitionOrMethod` (which is called by `define`)
// Currently, this is adding default behavior
// copying `type` over, and even cleaning up the final definition object
makeDefinition = function(prop, def, defaultDefinition, typePrototype) {
	let definition = {};

	eachPropertyDescriptor(def, function(behavior, descriptor) {
		addBehaviorToDefinition(definition, behavior, descriptor, def, prop, typePrototype);
	});
	// only add default if it doesn't exist
	canReflect.eachKey(defaultDefinition, function(value, prop){
		if(definition[prop] === undefined) {
			if(prop !== "type") {
				definition[prop] = value;
			}
		}
	});

	if (def.type) {
		const value = def.type;
		const serialize = value[serializeSymbol];
		if(serialize) {
			definition.serialize = function(val){
				return serialize.call(val);
			};
		}
		definition.type = type.normalize(value);
	}

	const noTypeDefined = !definition.type && (!defaultDefinition.type ||
		defaultDefinition.type && defaultDefinition.typeSetByDefault);

	if (definition.hasOwnProperty("default")) {
		if (typeof definition.default === "function" && !definition.default.isAGetter && noTypeDefined) {
			definition.type = type.normalize(Function);
		}

		if (canReflect.isPrimitive(definition.default) && noTypeDefined) {
			if (definition.default === null || typeof definition.default === 'undefined') {
				definition.type = type.Any;
			} else {
				definition.type = type.normalize(definition.default.constructor);
			}
		}
	}

	// if there's no type definition, take it from the defaultDefinition
	if(!definition.type) {
		const defaultsCopy = canReflect.assignMap({}, defaultDefinition);
		definition = canReflect.assignMap(defaultsCopy, definition);
	}

	if(canReflect.size(definition) === 0) {
		definition.type = type.Any;
		// `setByDefault` indicates that the default type can be
		// overridden by an inferred type
		definition.typeSetByDefault = true;
	}

	return definition;
};

// called by `can.defineInstanceKey` and `getDefinitionsAndMethods`
// returns the value or the definition object.
// calls makeDefinition
// This is dealing with a string value
getDefinitionOrMethod = function(prop, value, defaultDefinition, typePrototype){
	// Clean up the value to make it a definition-like object
	let definition;
	let definitionType;
	if(canReflect.isPrimitive(value)) {
		if (value === null || typeof value === 'undefined') {
			definitionType = type.Any;
		} else {
			// only include type from defaultDefininition
			// if it came from propertyDefaults
			definitionType = defaultDefinition.typeSetByDefault ?
				type.normalize(value.constructor) :
				defaultDefinition.type;
		}
		definition = {
			default: value,
			type: definitionType
		};
	}
    // copies a `Type`'s methods over
	else if(value && (value[serializeSymbol] || value[newSymbol]) ) {
		if(value[isMemberSymbol]) {
			definition = { type: value };
		} else {
			definition = { type: type.normalize(value) };
		}
	}
	else if(typeof value === "function") {
		if(canReflect.isConstructorLike(value)) {
			definition = { type: type.normalize(value) };
		} else {
			definition = { default: value, type: Function };
		}
	} else if( Array.isArray(value) ) {
		definition = { type: type.normalize(Array) };
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
getDefinitionsAndMethods = function(defines, baseDefines, typePrototype, propertyDefaults) {
	// make it so the definitions include base definitions on the proto
	const definitions = Object.create(baseDefines ? baseDefines.definitions : null);
	let methods = {};
	// first lets get a default if it exists
	let defaultDefinition;
	if(propertyDefaults) {
		defaultDefinition = getDefinitionOrMethod("*", propertyDefaults, {}, typePrototype);
	} else {
		defaultDefinition = Object.create(null);
	}

	function addDefinition(prop, propertyDescriptor, skipGetDefinitionForMethods) {
		let value;
		if(propertyDescriptor.get || propertyDescriptor.set) {
			value = { get: propertyDescriptor.get, set: propertyDescriptor.set };
		} else {
			value = propertyDescriptor.value;
		}

		if(prop === "constructor" || skipGetDefinitionForMethods && typeof value === "function") {
			methods[prop] = value;
			return;
		} else {
			const result = getDefinitionOrMethod(prop, value, defaultDefinition, typePrototype);
			const resultType = typeof result;
			if(result && resultType === "object" && canReflect.size(result) > 0) {
				definitions[prop] = result;
			}
			else {
				// Removed adding raw values that are not functions
				if (resultType === "function") {
					methods[prop] = result;
				}
				//!steal-remove-start
				else if (resultType !== 'undefined') {
					if(process.env.NODE_ENV !== 'production') {
						// Ex: {prop: 0}
						canLogDev.error(canReflect.getName(typePrototype)+"."+prop + " does not match a supported definitionObject. See: https://canjs.com/doc/can-observable-object/object.types.definitionObject.html");
					}
				}
				//!steal-remove-end
			}
		}
	}

	eachPropertyDescriptor(typePrototype, addDefinition, true);
	eachPropertyDescriptor(defines, addDefinition);
	if(propertyDefaults) {
		// we should move this property off the prototype.
		defineConfigurableAndNotEnumerable(defines, "*", propertyDefaults);
	}
	return { definitions: definitions, methods: methods, defaultDefinition: defaultDefinition };
};

eventsProto = eventQueue({});

function setupComputed(instance, eventName) {
	const computedBinding = instance._computed && instance._computed[eventName];
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
	const computedBinding = instance._computed && instance._computed[eventName];
	if (computedBinding) {
		if (computedBinding.count === 1) {
			computedBinding.count = 0;
			canReflect.offValue(computedBinding.compute, computedBinding.handler,"notify");
		} else {
			computedBinding.count--;
		}
	}
}

assign(eventsProto, {
	_eventSetup: function() {},
	_eventTeardown: function() {},
	addEventListener: function(eventName/*, handler, queue*/) {
		setupComputed(this, eventName);
		return eventQueue.addEventListener.apply(this, arguments);
	},

	// ### unbind
	// Stops listening to an event.
	// If this is the last listener of a computed property,
	// stop forwarding events of the computed property to this map.
	removeEventListener: function(eventName/*, handler*/) {
		teardownComputed(this, eventName);
		return eventQueue.removeEventListener.apply(this, arguments);

	}
});
eventsProto.on = eventsProto.bind = eventsProto.addEventListener;
eventsProto.off = eventsProto.unbind = eventsProto.removeEventListener;


const onKeyValueSymbol = Symbol.for("can.onKeyValue");
const offKeyValueSymbol = Symbol.for("can.offKeyValue");

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

define.finalizeInstance = function() {
	defineNotWritableAndNotEnumerable(this, "constructor", this.constructor);
	defineNotWritableAndNotEnumerable(this, canMetaSymbol, Object.create(null));
};

define.setup = function(props, sealed) {
	const requiredButNotProvided = new Set(this._define.required);
	const definitions = this._define.definitions;
	const instanceDefinitions = Object.create(null);
	const map = this;
	canReflect.eachKey(props, function(value, prop){
		if(requiredButNotProvided.has(prop)) {
			requiredButNotProvided.delete(prop);
		}
		if(definitions[prop] !== undefined) {
			map[prop] = value;
		} else {
			if(sealed) {
				throw new Error(`The type ${canReflect.getName(map.constructor)} is sealed, but the property [${prop}] has no definition.`);
			}

			define.expando(map, prop, value);
		}
	});
	if(canReflect.size(instanceDefinitions) > 0) {
		defineConfigurableAndNotEnumerable(this, "_instanceDefinitions", instanceDefinitions);
	}
	if(requiredButNotProvided.size) {
		let msg;
		const missingProps = Array.from(requiredButNotProvided);
		let thisName = canReflect.getName(this);
		if(requiredButNotProvided.size === 1) {
			msg = `${thisName}: Missing required property [${missingProps[0]}].`;
		} else {
			msg = `${thisName}: Missing required properties [${missingProps.join(", ")}].`;
		}

		throw new Error(msg);
	}
};


const returnFirstArg = function(arg){
	return arg;
};

// TODO Why is this exported, does it need to be?
define.normalizeTypeDefinition = type.normalize;

define.expando = function(map, prop, value) {
	if(define._specialKeys[prop]) {
		// ignores _data and _computed
		return true;
	}
	// first check if it's already a constructor define
	const constructorDefines = map._define.definitions;
	if(constructorDefines && constructorDefines[prop]) {
		return;
	}
	// next if it's already on this instances
	let instanceDefines = map._instanceDefinitions;
	if(!instanceDefines) {
		if(Object.isSealed(map)) {
			let errorMessage = `Cannot set property [${prop}] on sealed instance of ${canReflect.getName(map)}`;
			throw new Error(errorMessage);
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
		const defaultDefinition = map._define.defaultDefinition || { type: observableType };
		define.property(map, prop, defaultDefinition, {},{});
		// possibly convert value to List or DefineMap
		if(defaultDefinition.type) {
			map._data[prop] = define.make.set.type(prop, defaultDefinition.type, returnFirstArg).call(map, value);
		} else {
			map._data[prop] = observableType(value);
		}

		instanceDefines[prop] = defaultDefinition;
		if(!map[inSetupSymbol]) {
			queues.batch.start();
			map.dispatch({
				action: "can.keys",
				type: "can.keys",
				target: map
			});
			if(Object.prototype.hasOwnProperty.call(map._data, prop)) {
				map.dispatch({
					action: "add",
					key: prop,
					type: prop,
					value: map._data[prop],
					target: map,
					patches: [{type: "add", key: prop, value: map._data[prop]}],
				},[map._data[prop], undefined]);
			} else {
				map.dispatch({
					action: "set",
					type: "set",
					value: map._data[prop],
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
let simpleGetterSetters = {};
define.makeSimpleGetterSetter = function(prop){
	if(simpleGetterSetters[prop] === undefined) {

		const setter = make.set.events(prop, make.get.data(prop), make.set.data(prop), make.eventType.data(prop) );

		simpleGetterSetters[prop] = {
			get: make.get.data(prop),
			set: function(newVal){
				return setter.call(this, observableType(newVal));
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
	let key;
	if(this.definitions.length) {
		key = this.definitions.shift();

		// Getters should not be enumerable
		const def = this.obj._define.definitions[key];
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

define.updateSchemaKeys = function(schema, definitions) {
	for(const prop in definitions) {
		const definition = definitions[prop];
		if(definition.serialize !== false ) {
			if(definition.type) {
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


define.hooks = {
	finalizeClass: function(Type) {
		let hasBeenDefined = Type.hasOwnProperty(hasBeenDefinedSymbol);
		if(!hasBeenDefined) {
			let prototypeObject = Type.prototype;
			// check for `static props = {}`
			// fall back to `static define = {}` if `props` doesn't exist
			let defines = typeof Type.props === "object" ?
				Type.props :
				typeof Type.define === "object" ?
					Type.define :
					{};
			define(prototypeObject, defines, null, Type.propertyDefaults);
			Type[hasBeenDefinedSymbol] = true;
		}
	},
	initialize: function(instance, props) {
		const firstInitialize = !instance.hasOwnProperty(canMetaSymbol);
		const sealed = instance.constructor.seal;

		if (firstInitialize) {
			define.finalizeInstance.call(instance);
		}

		if (!instance[canMetaSymbol].initialized) {
			defineConfigurableAndNotEnumerable(instance, inSetupSymbol, true);

			define.setup.call(instance, props, sealed);

			// set inSetup to false so events can be dispatched
			instance[inSetupSymbol] = false;

			// set instance as initialized so this is only called once
			instance[canMetaSymbol].initialized = true;
		}

		// only seal in dev mode for performance reasons.
		//!steal-remove-start
		if(process.env.NODE_ENV !== 'production') {
			// only seal the first time initialize is called
			// even if meta.initialized is reset to false
			if (firstInitialize) {
				/* jshint -W030 */
				instance._data;
				instance._computed;
				if(sealed === true) {
					Object.seal(instance);
				}
			}
		}
		//!steal-remove-end
	},
	expando: define.expando,
	normalizeTypeDefinition: type.normalize //define.normalizeTypeDefinition
};