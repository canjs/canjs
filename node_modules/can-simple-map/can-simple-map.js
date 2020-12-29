"use strict";
var Construct = require("can-construct");
var eventQueue = require("can-event-queue/map/map");
var queues = require("can-queues");
var ObservationRecorder = require("can-observation-recorder");
var canReflect = require("can-reflect");
var dev = require("can-log/dev/dev");
var canSymbol = require("can-symbol");

// Ensure the "obj" passed as an argument has an object on @@can.meta
var ensureMeta = function ensureMeta(obj) {
	var metaSymbol = canSymbol.for("can.meta");
	var meta = obj[metaSymbol];

	if (!meta) {
		meta = {};
		canReflect.setKeyValue(obj, metaSymbol, meta);
	}

	return meta;
};

// this is a very simple can-map like object
var SimpleMap = Construct.extend("SimpleMap",
	{
		// ### setup
		// A setup function for the instantiation of a simple-map.
		setup: function(initialData){
			this._data = {};
			if(initialData && typeof initialData === "object") {
				this.attr(initialData);
			}
		},
		// ### attr
		// The main get/set interface simple-map.
		// Either sets or gets one or more properties depending on how it is called.
		attr: function(prop, value) {
			var self = this;

			if(arguments.length === 0 ) {
				ObservationRecorder.add(this,"can.keys");
				var data = {};
				canReflect.eachKey(this._data, function(value, prop){
					ObservationRecorder.add(this, prop);
					data[prop] = value;
				}, this);
				return data;
			}
			else if(arguments.length > 1) {
				var had = this._data.hasOwnProperty(prop);
				var old = this._data[prop];
				this._data[prop] = value;
				if(old !== value) {


					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						if (typeof this._log === "function") {
							this._log(prop, value, old);
						}
					}
					//!steal-remove-end

					var dispatched = {
						keyChanged: !had ? prop : undefined,
						type: prop
					};
					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						dispatched = {
							keyChanged: !had ? prop : undefined,
							type: prop,
							reasonLog: [ canReflect.getName(this) + "'s", prop, "changed to", value, "from", old ],
						};
					}
					//!steal-remove-end

					this.dispatch(dispatched, [value, old]);
				}

			}
			// 1 argument
			else if(typeof prop === 'object') {
				queues.batch.start();
				canReflect.eachKey(prop, function(value, key) {
					self.attr(key, value);
				});
				queues.batch.stop();
			}
			else {
				if(prop !== "constructor") {
					ObservationRecorder.add(this, prop);
					return this._data[prop];
				}

				return this.constructor;
			}
		},
		serialize: function(){
			return canReflect.serialize(this, Map);
		},
		get: function(){
			return this.attr.apply(this, arguments);
		},
		set: function(){
			return this.attr.apply(this, arguments);
		},
		// call `.log()` to log all property changes
		// pass a single property to only get logs for said property, e.g: `.log("foo")`
		log: function(key) {
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				var quoteString = function quoteString(x) {
					return typeof x === "string" ? JSON.stringify(x) : x;
				};
				var meta = ensureMeta(this);
				meta.allowedLogKeysSet = meta.allowedLogKeysSet || new Set();

				if (key) {
					meta.allowedLogKeysSet.add(key);
				}

				this._log = function(prop, current, previous, log) {
					if (key && !meta.allowedLogKeysSet.has(prop)) {
						return;
					}
					dev.log(
						canReflect.getName(this),
						"\n key ", quoteString(prop),
						"\n is  ", quoteString(current),
						"\n was ", quoteString(previous)
					);
				};
			}
			//!steal-remove-end
		}
	}
);

eventQueue(SimpleMap.prototype);

var simpleMapProto = {
	// -type-
	"can.isMapLike": true,
	"can.isListLike": false,
	"can.isValueLike": false,

	// -get/set-
	"can.getKeyValue": SimpleMap.prototype.get,
	"can.setKeyValue": SimpleMap.prototype.set,
	"can.deleteKeyValue": function(prop) {
		var dispatched;
		if( this._data.hasOwnProperty(prop) ) {
			var old = this._data[prop];
			delete this._data[prop];

			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				if (typeof this._log === "function") {
					this._log(prop, undefined, old);
				}
			}
			//!steal-remove-end
			dispatched = {
				keyChanged: prop,
				type: prop
			};
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				dispatched = {
					keyChanged: prop,
					type: prop,
					reasonLog: [ canReflect.getName(this) + "'s", prop, "deleted", old ]
				};
			}
			//!steal-remove-end
			this.dispatch(dispatched, [undefined, old]);
		}
	},


	// -shape
	"can.getOwnEnumerableKeys": function(){
		ObservationRecorder.add(this, 'can.keys');
		return Object.keys(this._data);
	},

	// -shape get/set-
	"can.assignDeep": function(source){
		queues.batch.start();
		// TODO: we should probably just throw an error instead of cleaning
		canReflect.assignMap(this, source);
		queues.batch.stop();
	},
	"can.updateDeep": function(source){
		queues.batch.start();
		// TODO: we should probably just throw an error instead of cleaning
		canReflect.updateMap(this, source);
		queues.batch.stop();
	},
	"can.keyHasDependencies": function(key) {
		return false;
	},
	"can.getKeyDependencies": function(key) {
		return undefined;
	},
	"can.hasOwnKey": function(key){
		return this._data.hasOwnProperty(key);
	}
};

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	simpleMapProto["can.getName"] = function() {
		return canReflect.getName(this.constructor) + "{}";
	};
}
//!steal-remove-end
canReflect.assignSymbols(SimpleMap.prototype,simpleMapProto);

// Setup other symbols


module.exports = SimpleMap;
