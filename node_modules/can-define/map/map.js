"use strict";
var Construct = require("can-construct");
var define = require("can-define");
var defineHelpers = require("../define-helpers/define-helpers");
var ObservationRecorder = require("can-observation-recorder");
var ns = require("can-namespace");
var canLog = require("can-log");
var canLogDev = require("can-log/dev/dev");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var queues = require("can-queues");
var addTypeEvents = require("can-event-queue/type/type");

var keysForDefinition = function(definitions) {
	var keys = [];
	for(var prop in definitions) {
		var definition = definitions[prop];
		if(typeof definition !== "object" || ("serialize" in definition ? !!definition.serialize : !definition.get)) {
			keys.push(prop);
		}
	}
	return keys;
};

function assign(source) {
	queues.batch.start();
	canReflect.assignMap(this, source || {});
	queues.batch.stop();
}
function update(source) {
	queues.batch.start();
	canReflect.updateMap(this, source || {});
	queues.batch.stop();
}
function assignDeep(source){
	queues.batch.start();
	// TODO: we should probably just throw an error instead of cleaning
	canReflect.assignDeepMap(this, source || {});
	queues.batch.stop();
}
function updateDeep(source){
	queues.batch.start();
	// TODO: we should probably just throw an error instead of cleaning
	canReflect.updateDeepMap(this, source || {});
	queues.batch.stop();
}
function setKeyValue(key, value) {
	var defined = defineHelpers.defineExpando(this, key, value);
	if(!defined) {
		this[key] = value;
	}
}
function getKeyValue(key) {
	var value = this[key];
	if(value !== undefined || key in this || Object.isSealed(this)) {
		return value;
	} else {
		ObservationRecorder.add(this, key);
		return this[key];
	}
}

var getSchemaSymbol = canSymbol.for("can.getSchema");

function getSchema() {
	var def = this.prototype._define;
	var definitions = def ? def.definitions : {};
	var schema = {
		type: "map",
		identity: [],
		keys: {}
	};
	return define.updateSchemaKeys(schema, definitions);
}

var sealedSetup = function(props){
	define.setup.call(
		this,
		props || {},
		this.constructor.seal
	);
};


var DefineMap = Construct.extend("DefineMap",{
	setup: function(base){
		var key,
			prototype = this.prototype;
		if(DefineMap) {
			// we have already created
			var result = define(prototype, prototype, base.prototype._define);
				define.makeDefineInstanceKey(this, result);

			addTypeEvents(this);
			for(key in DefineMap.prototype) {
				define.defineConfigurableAndNotEnumerable(prototype, key, prototype[key]);
			}
			// If someone provided their own setup, we call that.
			if(prototype.setup === DefineMap.prototype.setup) {
				define.defineConfigurableAndNotEnumerable(prototype, "setup", sealedSetup);
			}

			var _computedGetter = Object.getOwnPropertyDescriptor(prototype, "_computed").get;
			Object.defineProperty(prototype, "_computed", {
				configurable: true,
				enumerable: false,
				get: function(){
					if(this === prototype) {
						return;
					}
					return _computedGetter.call(this, arguments);
				}
			});
		} else {
			for(key in prototype) {
				define.defineConfigurableAndNotEnumerable(prototype, key, prototype[key]);
			}
		}
		define.defineConfigurableAndNotEnumerable(prototype, "constructor", this);
		this[getSchemaSymbol] = getSchema;
	}
},{
	// setup for only dynamic DefineMap instances
	setup: function(props, sealed){
		if(!this._define) {
			Object.defineProperty(this,"_define",{
				enumerable: false,
				value: {
					definitions: {}
				}
			});
			Object.defineProperty(this,"_data",{
				enumerable: false,
				value: {}
			});
		}
		define.setup.call(
			this,
			props || {},
			sealed === true
		);
	},
	get: function(prop){
		if(prop) {
			return getKeyValue.call(this, prop);
		} else {
			return canReflect.unwrap(this, Map);
		}
	},
	set: function(prop, value){
		if(typeof prop === "object") {
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				canLogDev.warn('can-define/map/map.prototype.set is deprecated; please use can-define/map/map.prototype.assign or can-define/map/map.prototype.update instead');
			}
			//!steal-remove-end
			if(value === true) {
				updateDeep.call(this, prop);
			} else {
				assignDeep.call(this, prop);
			}

		} else {
			setKeyValue.call(this, prop, value);
		}

		return this;
	},
	assignDeep: function(prop) {
		assignDeep.call(this, prop);
		return this;
	},
	updateDeep: function(prop) {
		updateDeep.call(this, prop);
		return this;
	},
	assign: function(prop) {
		assign.call(this, prop);
		return this;
	},
	update: function(prop) {
		update.call(this, prop);
		return this;
	},
	serialize: function () {
		return canReflect.serialize(this, Map);
	},
	deleteKey: defineHelpers.deleteKey,
	forEach: (function(){

		var forEach = function(list, cb, thisarg){
			return canReflect.eachKey(list, cb, thisarg);
		},
			noObserve = ObservationRecorder.ignore(forEach);

		return function(cb, thisarg, observe) {
			return observe === false ? noObserve(this, cb, thisarg) : forEach(this, cb, thisarg);
		};

	})(),
	"*": {
		type: define.types.observable
	}
});

var defineMapProto = {
	// -type-
	"can.isMapLike": true,
	"can.isListLike":  false,
	"can.isValueLike": false,

	// -get/set-
	"can.getKeyValue": getKeyValue,
	"can.setKeyValue": setKeyValue,
	"can.deleteKeyValue": defineHelpers.deleteKey,

	// -shape
	"can.getOwnKeys": function() {
		var keys = canReflect.getOwnEnumerableKeys(this);
		if(this._computed) {
			var computedKeys = canReflect.getOwnKeys(this._computed);

			var key;
			for (var i=0; i<computedKeys.length; i++) {
				key = computedKeys[i];
				if (keys.indexOf(key) < 0) {
					keys.push(key);
				}
			}
		}

		return keys;
	},
	"can.getOwnEnumerableKeys": function(){
		ObservationRecorder.add(this, 'can.keys');
		ObservationRecorder.add(Object.getPrototypeOf(this), 'can.keys');
		return keysForDefinition(this._define.definitions).concat(keysForDefinition(this._instanceDefinitions) );
	},
	"can.hasOwnKey": function(key) {
		return Object.hasOwnProperty.call(this._define.definitions, key) ||
			( this._instanceDefinitions !== undefined && Object.hasOwnProperty.call(this._instanceDefinitions, key) );
	},
	"can.hasKey": function(key) {
		return (key in this._define.definitions) || (this._instanceDefinitions !== undefined && key in this._instanceDefinitions);
	},

	// -shape get/set-
	"can.assignDeep": assignDeep,
	"can.updateDeep": updateDeep,
	"can.unwrap": defineHelpers.reflectUnwrap,
	"can.serialize": defineHelpers.reflectSerialize,

	// observable
	"can.keyHasDependencies": function(key) {
		return !!(this._computed && this._computed[key] && this._computed[key].compute);
	},
	"can.getKeyDependencies": function(key) {
		var ret;
		if(this._computed && this._computed[key] && this._computed[key].compute) {
			ret = {};
			ret.valueDependencies = new Set();
			ret.valueDependencies.add(this._computed[key].compute);
		}
		return ret;
	}
};

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	defineMapProto["can.getName"] = function() {
		return canReflect.getName(this.constructor) + "{}";
	};
}
//!steal-remove-end

canReflect.assignSymbols(DefineMap.prototype, defineMapProto);

canReflect.setKeyValue(DefineMap.prototype, canSymbol.iterator, function() {
	return new define.Iterator(this);
});

// Add necessary event methods to this object.
for(var prop in define.eventsProto) {
	DefineMap[prop] = define.eventsProto[prop];
	Object.defineProperty(DefineMap.prototype, prop, {
		enumerable:false,
		value: define.eventsProto[prop],
		writable: true
	});
}
function getSymbolsForIE(obj){
	return Object.getOwnPropertyNames(obj).filter(function(name){
		return name.indexOf("@@symbol") === 0;
	});
}
// Copy symbols over, but they aren't supported in IE
var eventsProtoSymbols = ("getOwnPropertySymbols" in Object) ?
  Object.getOwnPropertySymbols(define.eventsProto) :
  getSymbolsForIE(define.eventsProto);

eventsProtoSymbols.forEach(function(sym) {
  Object.defineProperty(DefineMap.prototype, sym, {
  	configurable: true,
    enumerable:false,
    value: define.eventsProto[sym],
    writable: true
  });
});


//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	// call `map.log()` to log all event changes
	// pass `key` to only log the matching property, e.g: `map.log("foo")`
	define.defineConfigurableAndNotEnumerable(DefineMap.prototype, "log", defineHelpers.log);
}
//!steal-remove-end

// tells `can-define` to use this
define.DefineMap = DefineMap;

Object.defineProperty(DefineMap.prototype, "toObject", {
	enumerable: false,
	writable: true,
	value: function(){
		canLog.warn("Use DefineMap::get instead of DefineMap::toObject");
		return this.get();
	}
});

module.exports = ns.DefineMap = DefineMap;
