// # can/map/map_hepers
// Helper functions that are primarily used to serialize
// a map, or create a map from a JS Object.

steal('can/util', function(){
	
	
	// ## Helpers

	// A temporary map of Maps that have been made from plain JS objects.
	var madeMap = null;
	// Clears out map of converted objects.
	var teardownMap = function () {
		for (var cid in madeMap) {
			if (madeMap[cid].added) {
				delete madeMap[cid].obj._cid;
			}
		}
		madeMap = null;
	};
	// Retrieves a Map instance from an Object.
	var getMapFromObject = function (obj) {
		return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
	};
	// A temporary map of Maps
	var serializeMap = null;
	
	var mapHelpers;
	return mapHelpers = {
		// ### can.mapHelpers.attrParts
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
		getMapFromObject: getMapFromObject,
		/**
		 * @hide
		 * Tracks Map instances created from JS Objects
		 * @param {Object} obj original Object
		 * @param {can.Map} instance the can.Map instance
		 * @return {Function} function to clear out object mapping
		 */
		// ### can.mapHelpers.addToMap
		// Tracks Map instances created from JS objects
		addToMap: function (obj, instance) {
			var teardown;
			// Setup a fresh mapping if `madeMap` is missing.
			if (!madeMap) {
				teardown = teardownMap;
				madeMap = {};
			}
			// Record if Object has a `_cid` before adding one.
			var hasCid = obj._cid;
			var cid = can.cid(obj);
		
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
		/**
		 * @hide
		 * Determines if `obj` can be made into an observable
		 * @param {Object} obj Object to check
		 * @return {Boolean} whether `obj` can be made into an observable
		 */
		// ### can.mapHelpers.canMakeObserve
		// Determines if an object can be made into an observable.
		canMakeObserve: function (obj) {
			return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj) );
		},
		/**
		 * @hide
		 * Serializes a Map or Map.List
		 * @param {can.Map|can.List} map The observable.
		 * @param {String} how To serialize using `attr` or `serialize`.
		 * @param {String} where Object or Array to put properties in.
		 * @return {Object|Array} serialized Map or List data.
		 */
		// ### can.mapHelpers.serialize
		// Serializes a Map or Map.List
		serialize: function (map, how, where) {
			var cid = can.cid(map),
				firstSerialize = false;
			if(!serializeMap) {
				firstSerialize = true;
				// Serialize might call .attr() so we need to keep different map
				serializeMap = {
					attr: {},
					serialize: {}
				};
			}
			serializeMap[how][cid] = where;
			// Go through each property.
			map.each(function (val, name) {
				// If the value is an `object`, and has an `attrs` or `serialize` function.
				var result,
					isObservable =  can.isMapLike(val),
					serialized = isObservable && serializeMap[how][can.cid(val)];
				if( serialized ) {
					result = serialized;
				} else {
					if(how === "serialize") {
						result = mapHelpers._serialize(map, name, val);
					} else {
						result = mapHelpers._getValue(map, name, val, how);
					}
				}
				// this is probably removable
				if(result !== undefined){
					where[name] = result;
				}
			});
		
			can.__observe(map, '__keys');
			if(firstSerialize) {
				serializeMap = null;
			}
			return where;
		},
		_serialize: function(map, name, val){
			return mapHelpers._getValue(map, name, val, "serialize");
		},
		_getValue: function(map, name, val, how){
			if( can.isMapLike(val) ) {
				return val[how]();
			} else {
				return val;
			}
		},
		define: null
	};
	
	
});


