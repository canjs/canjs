"use strict";
// # can/map/map_hepers
// Helper functions that are primarily used to serialize
// a map, or track the maps created from plain JavaScript objects.
// `can.Map` handles cycles in objects nicely!
var CID = require('can-cid');
var assign = require("can-assign");
var canReflect = require('can-reflect');
var canSymbol = require("can-symbol");
// ## POJOs to Map instance helpers

// ### madeMap
// A temporary map of Maps that have been made from plain JS objects.
// `{POJO_CID: {obj: POJO, instance: MAP, added: Boolean}}`
var madeMap = null;

// ### teardownMap
// Clears out map of converted objects and removes temporary `cids`.
var teardownMap = function () {
	for (var cid in madeMap) {
		if (madeMap[cid].added) {
			delete madeMap[cid].obj._cid;
		}
	}
	madeMap = null;
};

var mapHelpers = {
	// ### mapHelpers.attrParts
	// Parses attribute name into its parts.
	attrParts: function (attr, keepKey) {
		//Keep key intact
		if (keepKey ) {
			return [attr];
		}
		// Split key on '.'
		return typeof attr === "object" ? attr : ("" + attr)
			.split(".");
	},

	// ### can.mapHelpers.canMakeObserve
	// Determines if an object can be made into an observable.
	canMakeObserve: function (obj) {
		return obj && !canReflect.isPromise(obj) && (Array.isArray(obj) || canReflect.isPlainObject(obj) );
	},
	reflectSerialize: function(unwrapped){
		this.forEach(function(val, name){
			if( this.___serialize ) {
				val = this.___serialize(name, val);
			} else {
				val = canReflect.serialize(val);
			}
			if(val !== undefined) {
				unwrapped[name] = val;
			}
		}, this);
		return unwrapped;
	},
	reflectUnwrap: function(unwrapped){
		this.forEach(function(value, key){
			if(value !== undefined) {
				unwrapped[key] = canReflect.unwrap(value);
			}
		});
		return unwrapped;
	},
	removeSpecialKeys: function(map) {
		if(map) {
			["_data", "constructor", "_cid", "__bindEvents"].forEach(function(key) {
				delete map[key];
			});
		}
		return map;
	},
	// ### mapHelpers.serialize
	// Serializes a Map or Map.List by recursively calling the `how`
	// method on any child objects. This is able to handle
	// cycles.
	// `map` - the map or list to serialize.
	// `how` - the method to call recursively.
	// `where` - the target Object or Array that becomes the serialized result.
	serialize: (function(){

		// A temporary mapping of map cids to the serialized result.
		var serializeMap = null;

		return function (map, how, where) {
			var cid = CID(map),
				firstSerialize = false;

			// If there isn't an existing serializeMap, this means
			// this is the initial non-recursive call to this function.
			// We mark this  as the first call, and then setup the serializeMap.
			// The serialize map is further devided into `how` because
			// `.serialize` might call `.attr`.
			if(!serializeMap) {
				firstSerialize = true;
				serializeMap = {
					attr: {},
					serialize: {}
				};
			}

			serializeMap[how][cid] = where;
			// Go through each property.
			map.forEach(function (val, name) {
				// If the value is an `object`, and has an `attr` or `serialize` function.
				var result,
					isObservable = canReflect.isObservableLike(val),
					serialized = isObservable && serializeMap[how][CID(val)];

				if( serialized ) {
					result = serialized;
				} else {
					// special attr or serializer
					if(map["___"+how]) {
						result =  map["___"+how](name, val);
					} else {
						result = mapHelpers.getValue(map, name, val, how);
					}
				}
				// this is probably removable
				if(result !== undefined){
					where[name] = result;
				}
			});

			if(firstSerialize) {
				serializeMap = null;
			}
			return where;
		};
	})(),

	// ## getValue
	// If `val` is an observable, calls `how` on it; otherwise
	// returns the value of `val`.
	getValue: function(map, name, val, how){
		if(how === "attr") {
			how = canSymbol.for("can.getValue");
		}
		if( canReflect.isObservableLike(val) && val[how] ) {
			return val[how]();
		} else {
			return val;
		}
	},

	// ## define
	// A hook to call whenever a Map is defined.
	// We need a better place for this.
	define: null,

	// ## addComputedAttr
	// Adds a compute so it will control the behavior of an
	// attribute.  Each computedAttrs object has:
	// - `compute` - the compute that will be read and updated.
	// - `count` - the number of bindings to this individual property.
	//   This is used to know when to bind `handler` to the compute.
	// - `handler` - a function that when bound to `compute` forwards all
	//   events to `map`.
	addComputedAttr: function(map, attrName, compute){
		map._computedAttrs[attrName] = {
			compute: compute,
			count: 0,
			handler: function (newVal, oldVal) {
				map._triggerChange(attrName, "set", newVal, oldVal);
			}
		};
	},

	// ### can.mapHelpers.addToMap
	// Tracks map instances created from JS objects.
	// This should be called whenever an instance is created for a particular object.
	// This may return a `teardown` function that should be called after all instances
	// might be created.
	//
	// While creating map instances from plain ole JS objects (POJOs), it's
	// possible that the same JS object exists as two different properties and
	// we want only one map instance created for one JS object.
	//
	// ```
	// var obj = {name: "I am everywhere"}
	// var map = new can.Map({obj1: obj, obj2: obj});
	// ok( map.attr("obj1") === map.attr("obj2") )
	// ```
	//
	// This works by temporarily adding a `cid` to any found POJO object
	// and storing it in a temporary Object that maps those `cid`s to
	// the POJO and the instance created for it.
	// The `teardown` function removes those temporary `cid`s and
	// clears the map for memory safety.
	addToMap: function addToMap(obj, instance) {
		var teardown;

		// Setup a fresh mapping if `madeMap` is missing.
		if (!madeMap) {
			teardown = teardownMap;
			madeMap = {};
		}

		// Record if Object has a `_cid` before adding one.
		var hasCid = obj._cid;
		var cid = CID(obj);

		// Only update if there already isn't one already.
		if (!madeMap[cid]) {

			madeMap[cid] = {
				obj: obj,
				instance: instance,
				added: !hasCid
			};
		}
		return teardown;
	},

	// ### getMapFromObject
	// Returns the map instance already created for this object `obj` or
	// `undefined` if nothing has been already created.
	getMapFromObject: function (obj) {
		return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
	},
	twoLevelDeepExtend: function (destination, source) {
		for (var prop in source) {
			destination[prop] = destination[prop] || {};
			assign(destination[prop], source[prop]);
		}
	}
};

module.exports = exports = mapHelpers;
