"use strict";
var Construct = require("can-construct");
var define = require("can-define");
var make = define.make;
var queues = require("can-queues");
var addTypeEvents = require("can-event-queue/type/type");

var ObservationRecorder = require("can-observation-recorder");
var canLog = require("can-log");
var canLogDev = require("can-log/dev/dev");
var defineHelpers = require("../define-helpers/define-helpers");

var assign = require("can-assign");
var diff = require("can-diff/list/list");
var ns = require("can-namespace");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var singleReference = require("can-single-reference");

var splice = [].splice;
var runningNative = false;

var identity = function(x) {
	return x;
};

// symbols aren't enumerable ... we'd need a version of Object that treats them that way
var localOnPatchesSymbol = "can.patches";

var makeFilterCallback = function(props) {
	return function(item) {
		for (var prop in props) {
			if (item[prop] !== props[prop]) {
				return false;
			}
		}
		return true;
	};
};

var onKeyValue = define.eventsProto[canSymbol.for("can.onKeyValue")];
var offKeyValue = define.eventsProto[canSymbol.for("can.offKeyValue")];
var getSchemaSymbol = canSymbol.for("can.getSchema");
var inSetupSymbol = canSymbol.for("can.initializing");

function getSchema() {
	var definitions = this.prototype._define.definitions;
	var schema = {
		type: "list",
		keys: {}
	};
	schema = define.updateSchemaKeys(schema, definitions);
	if(schema.keys["#"]) {
		schema.values = definitions["#"].Type;
		delete schema.keys["#"];
	}

	return schema;
}

/** @add can-define/list/list */
var DefineList = Construct.extend("DefineList",
	/** @static */
	{
		setup: function(base) {
			if (DefineList) {
				addTypeEvents(this);
				var prototype = this.prototype;
				var result = define(prototype, prototype, base.prototype._define);
				define.makeDefineInstanceKey(this, result);

				var itemsDefinition = result.definitions["#"] || result.defaultDefinition;

				if (itemsDefinition) {
					if (itemsDefinition.Type) {
						this.prototype.__type = make.set.Type("*", itemsDefinition.Type, identity);
					} else if (itemsDefinition.type) {
						this.prototype.__type = make.set.type("*", itemsDefinition.type, identity);
					}
				}
				this[getSchemaSymbol] = getSchema;
			}
		}
	},
	/** @prototype */
	{
		// setup for only dynamic DefineMap instances
		setup: function(items) {
			if (!this._define) {
				Object.defineProperty(this, "_define", {
					enumerable: false,
					value: {
						definitions: {
							length: { type: "number" },
							_length: { type: "number" }
						}
					}
				});
				Object.defineProperty(this, "_data", {
					enumerable: false,
					value: {}
				});
			}
			define.setup.call(this, {}, false);
			Object.defineProperty(this, "_length", {
				enumerable: false,
				configurable: true,
				writable: true,
				value: 0
			});
			if (items) {
				this.splice.apply(this, [ 0, 0 ].concat(canReflect.toArray(items)));
			}
		},
		__type: define.types.observable,
		_triggerChange: function(attr, how, newVal, oldVal) {

			var index = +attr;
			// `batchTrigger` direct add and remove events...

			// Make sure this is not nested and not an expando
			if ( !isNaN(index)) {
				var itemsDefinition = this._define.definitions["#"];
				var patches, dispatched;
				if (how === 'add') {
					if (itemsDefinition && typeof itemsDefinition.added === 'function') {
						ObservationRecorder.ignore(itemsDefinition.added).call(this, newVal, index);
					}

					patches = [{type: "splice", insert: newVal, index: index, deleteCount: 0}];
					dispatched = {
						type: how,
						action: "splice",
						insert: newVal,
						index: index,
						deleteCount: 0,
						patches: patches
					};

					//!steal-remove-start
					if(process.env.NODE_ENV !== 'production') {
						dispatched.reasonLog = [ canReflect.getName(this), "added", newVal, "at", index ];
					}
					//!steal-remove-end
					this.dispatch(dispatched, [ newVal, index ]);

				} else if (how === 'remove') {
					if (itemsDefinition && typeof itemsDefinition.removed === 'function') {
						ObservationRecorder.ignore(itemsDefinition.removed).call(this, oldVal, index);
					}

					patches = [{type: "splice", index: index, deleteCount: oldVal.length}];
					dispatched = {
						type: how,
						patches: patches,
						action: "splice",
						index: index, deleteCount: oldVal.length,
						target: this
					};
					//!steal-remove-start
					if(process.env.NODE_ENV !== 'production') {
						dispatched.reasonLog = [ canReflect.getName(this), "remove", oldVal, "at", index ];
					}
					//!steal-remove-end
					this.dispatch(dispatched, [ oldVal, index ]);

				} else {
					this.dispatch(how, [ newVal, index ]);
				}
			} else {
				this.dispatch({
					type: "" + attr,
					target: this
				}, [ newVal, oldVal ]);
			}
		},
		get: function(index) {
			if (arguments.length) {
				if(isNaN(index)) {
					ObservationRecorder.add(this, index);
				} else {
					ObservationRecorder.add(this, "length");
				}
				return this[index];
			} else {
				return canReflect.unwrap(this, Map);
			}
		},
		set: function(prop, value) {
			// if we are setting a single value
			if (typeof prop !== "object") {
				// We want change events to notify using integers if we're
				// setting an integer index. Note that <float> % 1 !== 0;
				prop = isNaN(+prop) || (prop % 1) ? prop : +prop;
				if (typeof prop === "number") {
					// Check to see if we're doing a .attr() on an out of
					// bounds index property.
					if (typeof prop === "number" &&
						prop > this._length - 1) {
						var newArr = new Array((prop + 1) - this._length);
						newArr[newArr.length - 1] = value;
						this.push.apply(this, newArr);
						return newArr;
					}
					this.splice(prop, 1, value);
				} else {
					var defined = defineHelpers.defineExpando(this, prop, value);
					if (!defined) {
						this[prop] = value;
					}
				}

			}
			// otherwise we are setting multiple
			else {
				//!steal-remove-start
				if(process.env.NODE_ENV !== 'production') {
					canLogDev.warn('can-define/list/list.prototype.set is deprecated; please use can-define/list/list.prototype.assign or can-define/list/list.prototype.update instead');
				}
				//!steal-remove-end

				//we are deprecating this in #245
				if (canReflect.isListLike(prop)) {
					if (value) {
						this.replace(prop);
					} else {
						canReflect.assignList(this, prop);
					}
				} else {
					canReflect.assignMap(this, prop);
				}
			}
			return this;
		},
		assign: function(prop) {
			if (canReflect.isListLike(prop)) {
				canReflect.assignList(this, prop);
			} else {
				canReflect.assignMap(this, prop);
			}
			return this;
		},
		update: function(prop) {
			if (canReflect.isListLike(prop)) {
				canReflect.updateList(this, prop);
			} else {
				canReflect.updateMap(this, prop);
			}
			return this;
		},
		assignDeep: function(prop) {
			if (canReflect.isListLike(prop)) {
				canReflect.assignDeepList(this, prop);
			} else {
				canReflect.assignDeepMap(this, prop);
			}
			return this;
		},
		updateDeep: function(prop) {
			if (canReflect.isListLike(prop)) {
				canReflect.updateDeepList(this, prop);
			} else {
				canReflect.updateDeepMap(this, prop);
			}
			return this;
		},
		_items: function() {
			var arr = [];
			this._each(function(item) {
				arr.push(item);
			});
			return arr;
		},
		_each: function(callback) {
			for (var i = 0, len = this._length; i < len; i++) {
				callback(this[i], i);
			}
		},
		splice: function(index, howMany) {
			var args = canReflect.toArray(arguments),
				added = [],
				i, len, listIndex,
				allSame = args.length > 2,
				oldLength = this._length;

			index = index || 0;

			// converting the arguments to the right type
			for (i = 0, len = args.length - 2; i < len; i++) {
				listIndex = i + 2;
				args[listIndex] = this.__type(args[listIndex], listIndex);
				added.push(args[listIndex]);

				// Now lets check if anything will change
				if (this[i + index] !== args[listIndex]) {
					allSame = false;
				}
			}

			// if nothing has changed, then return
			if (allSame && this._length <= added.length) {
				return added;
			}

			// default howMany if not provided
			if (howMany === undefined) {
				howMany = args[1] = this._length - index;
			}

			runningNative = true;
			var removed = splice.apply(this, args);
			runningNative = false;

			queues.batch.start();
			if (howMany > 0) {
				// tears down bubbling
				this._triggerChange("" + index, "remove", undefined, removed);
			}
			if (args.length > 2) {
				this._triggerChange("" + index, "add", added, removed);
			}

			this.dispatch('length', [ this._length, oldLength ]);

			queues.batch.stop();
			return removed;
		},

		/**
		 */
		serialize: function() {
			return canReflect.serialize(this, Map);
		}
	}
);

for(var prop in define.eventsProto) {
	Object.defineProperty(DefineList.prototype, prop, {
		enumerable:false,
		value: define.eventsProto[prop],
		writable: true
	});
}

var eventsProtoSymbols = ("getOwnPropertySymbols" in Object) ?
  Object.getOwnPropertySymbols(define.eventsProto) :
  [canSymbol.for("can.onKeyValue"), canSymbol.for("can.offKeyValue")];

eventsProtoSymbols.forEach(function(sym) {
  Object.defineProperty(DefineList.prototype, sym, {
  	configurable: true,
    enumerable:false,
    value: define.eventsProto[sym],
    writable: true
  });
});

// Converts to an `array` of arguments.
var getArgs = function(args) {
	return args[0] && Array.isArray(args[0]) ?
		args[0] :
		canReflect.toArray(args);
};
// Create `push`, `pop`, `shift`, and `unshift`
canReflect.eachKey({
	push: "length",
	unshift: 0
},
	// Adds a method
	// `name` - The method name.
	// `where` - Where items in the `array` should be added.
	function(where, name) {
		var orig = [][name];
		DefineList.prototype[name] = function() {
			// Get the items being added.
			var args = [],
				// Where we are going to add items.
				len = where ? this._length : 0,
				i = arguments.length,
				res, val;

			// Go through and convert anything to a `map` that needs to be converted.
			while (i--) {
				val = arguments[i];
				args[i] = this.__type(val, i);
			}

			// Call the original method.
			runningNative = true;
			res = orig.apply(this, args);
			runningNative = false;

			if (!this.comparator || args.length) {
				queues.batch.start();
				this._triggerChange("" + len, "add", args, undefined);
				this.dispatch('length', [ this._length, len ]);
				queues.batch.stop();
			}

			return res;
		};
	});

canReflect.eachKey({
	pop: "length",
	shift: 0
},
	// Creates a `remove` type method
	function(where, name) {
		var orig = [][name];
		DefineList.prototype[name] = function() {
			if (!this._length) {
				// For shift and pop, we just return undefined without
				// triggering events.
				return undefined;
			}

			var args = getArgs(arguments),
				len = where && this._length ? this._length - 1 : 0,
				oldLength = this._length ? this._length : 0,
				res;

			// Call the original method.
			runningNative = true;
			res = orig.apply(this, args);
			runningNative = false;

			// Create a change where the args are
			// `len` - Where these items were removed.
			// `remove` - Items removed.
			// `undefined` - The new values (there are none).
			// `res` - The old, removed values (should these be unbound).
			queues.batch.start();
			this._triggerChange("" + len, "remove", undefined, [ res ]);
			this.dispatch('length', [ this._length, oldLength ]);
			queues.batch.stop();

			return res;
		};
	});

canReflect.eachKey({
	"map": 3,
	"filter": 3,
	"reduce": 4,
	"reduceRight": 4,
	"every": 3,
	"some": 3
},
function a(fnLength, fnName) {
	DefineList.prototype[fnName] = function() {
		var self = this;
		var args = [].slice.call(arguments, 0);
		var callback = args[0];
		var thisArg = args[fnLength - 1] || self;

		if (typeof callback === "object") {
			callback = makeFilterCallback(callback);
		}

		args[0] = function() {
			var cbArgs = [].slice.call(arguments, 0);
			// use .get(index) to ensure observation added.
			// the arguments are (item, index) or (result, item, index)
			cbArgs[fnLength - 3] = self.get(cbArgs[fnLength - 2]);
			return callback.apply(thisArg, cbArgs);
		};
		var ret = Array.prototype[fnName].apply(this, args);

		if(fnName === "map") {
			return new DefineList(ret);
		}
		else if(fnName === "filter") {
			return new self.constructor(ret);
		} else {
			return ret;
		}
	};
});

assign(DefineList.prototype, {
	includes: (function(){
		var arrayIncludes =  Array.prototype.includes;
		if(arrayIncludes){
			return function includes() {
				return arrayIncludes.apply(this, arguments);
			};
		} else {
			return function includes() {
				throw new Error("DefineList.prototype.includes must have Array.prototype.includes available. Please add a polyfill to this environment.");
			};
		}
	})(),
	indexOf: function(item, fromIndex) {
		for (var i = fromIndex || 0, len = this.length; i < len; i++) {
			if (this.get(i) === item) {
				return i;
			}
		}
		return -1;
	},
	lastIndexOf: function(item, fromIndex) {
		fromIndex = typeof fromIndex === "undefined" ? this.length - 1: fromIndex;
		for (var i = fromIndex; i >= 0; i--) {
			if (this.get(i) === item) {
				return i;
			}
		}
		return -1;
	},
	join: function() {
		ObservationRecorder.add(this, "length");
		return [].join.apply(this, arguments);
	},
	reverse: function() {
		// this shouldn't be observable
		var list = [].reverse.call(this._items());
		return this.replace(list);
	},
	slice: function() {
		// tells computes to listen on length for changes.
		ObservationRecorder.add(this, "length");
		var temp = Array.prototype.slice.apply(this, arguments);
		return new this.constructor(temp);
	},
	concat: function() {
		var args = [];
		// Go through each of the passed `arguments` and
		// see if it is list-like, an array, or something else
		canReflect.eachIndex(arguments, function(arg) {
			if (canReflect.isListLike(arg)) {
				// If it is list-like we want convert to a JS array then
				// pass each item of the array to this.__type
				var arr = Array.isArray(arg) ? arg : canReflect.toArray(arg);
				arr.forEach(function(innerArg) {
					args.push(this.__type(innerArg));
				}, this);
			} else {
				// If it is a Map, Object, or some primitive
				// just pass arg to this.__type
				args.push(this.__type(arg));
			}
		}, this);

		// We will want to make `this` list into a JS array
		// as well (We know it should be list-like), then
		// concat with our passed in args, then pass it to
		// list constructor to make it back into a list
		return new this.constructor(Array.prototype.concat.apply(canReflect.toArray(this), args));
	},
	forEach: function(cb, thisarg) {
		var item;
		for (var i = 0, len = this.length; i < len; i++) {
			item = this.get(i);
			if (cb.call(thisarg || item, item, i, this) === false) {
				break;
			}
		}
		return this;
	},
	replace: function(newList) {
		var patches = diff(this, newList);

		queues.batch.start();
		for (var i = 0, len = patches.length; i < len; i++) {
			this.splice.apply(this, [
				patches[i].index,
				patches[i].deleteCount
			].concat(patches[i].insert));
		}
		queues.batch.stop();

		return this;
	},
	sort: function(compareFunction) {
		var sorting = Array.prototype.slice.call(this);
		Array.prototype.sort.call(sorting, compareFunction);
		this.splice.apply(this, [0,sorting.length].concat(sorting) );
		return this;
	}
});

// Add necessary event methods to this object.
for (var prop in define.eventsProto) {
	DefineList[prop] = define.eventsProto[prop];
	Object.defineProperty(DefineList.prototype, prop, {
		enumerable: false,
		value: define.eventsProto[prop],
		writable: true
	});
}

Object.defineProperty(DefineList.prototype, "length", {
	get: function() {
		if (!this[inSetupSymbol]) {
			ObservationRecorder.add(this, "length");
		}
		return this._length;
	},
	set: function(newVal) {
		if (runningNative) {
			this._length = newVal;
			return;
		}

		// Don't set _length if:
		//  - null or undefined
		//  - a string that doesn't convert to number
		//  - already the length being set
		if (newVal == null || isNaN(+newVal) || newVal === this._length) {
			return;
		}

		if (newVal > this._length - 1) {
			var newArr = new Array(newVal - this._length);
			this.push.apply(this, newArr);
		}
		else {
			this.splice(newVal);
		}
	},
	enumerable: true
});

DefineList.prototype.attr = function(prop, value) {
	canLog.warn("DefineMap::attr shouldn't be called");
	if (arguments.length === 0) {
		return this.get();
	} else if (prop && typeof prop === "object") {
		return this.set.apply(this, arguments);
	} else if (arguments.length === 1) {
		return this.get(prop);
	} else {
		return this.set(prop, value);
	}
};
DefineList.prototype.item = function(index, value) {
	if (arguments.length === 1) {
		return this.get(index);
	} else {
		return this.set(index, value);
	}
};
DefineList.prototype.items = function() {
	canLog.warn("DefineList::get should should be used instead of DefineList::items");
	return this.get();
};

var defineListProto = {
	// type
	"can.isMoreListLikeThanMapLike": true,
	"can.isMapLike": true,
	"can.isListLike": true,
	"can.isValueLike": false,
	// get/set
	"can.getKeyValue": DefineList.prototype.get,
	"can.setKeyValue": DefineList.prototype.set,

	// Called for every reference to a property in a template
	// if a key is a numerical index then translate to length event
	"can.onKeyValue": function(key, handler, queue) {
		var translationHandler;
		if (isNaN(key)) {
			return onKeyValue.apply(this, arguments);
		}
		else {
			translationHandler = function() {
				handler(this[key]);
			};
			//!steal-remove-start
			if(process.env.NODE_ENV !== 'production') {
				Object.defineProperty(translationHandler, "name", {
					value: "translationHandler(" + key + ")::" + canReflect.getName(this) + ".onKeyValue('length'," + canReflect.getName(handler) + ")",
				});
			}
			//!steal-remove-end
			singleReference.set(handler, this, translationHandler, key);
			return onKeyValue.call(this, 'length',  translationHandler, queue);
		}
	},
	// Called when a property reference is removed
	"can.offKeyValue": function(key, handler, queue) {
		var translationHandler;
		if ( isNaN(key)) {
			return offKeyValue.apply(this, arguments);
		}
		else {
			translationHandler = singleReference.getAndDelete(handler, this, key);
			return offKeyValue.call(this, 'length',  translationHandler, queue);
		}
	},

	"can.deleteKeyValue": function(prop) {
		// convert string key to number index if key can be an integer:
		//   isNaN if prop isn't a numeric representation
		//   (prop % 1) if numeric representation is a float
		//   In both of the above cases, leave as string.
		prop = isNaN(+prop) || (prop % 1) ? prop : +prop;
		if(typeof prop === "number") {
			this.splice(prop, 1);
		} else if(prop === "length" || prop === "_length") {
			return; // length must not be deleted
		} else {
			this.set(prop, undefined);
		}
		return this;
	},
	// shape get/set
	"can.assignDeep": function(source){
		queues.batch.start();
		canReflect.assignList(this, source);
		queues.batch.stop();
	},
	"can.updateDeep": function(source){
		queues.batch.start();
		this.replace(source);
		queues.batch.stop();
	},

	// observability
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
	},
	/*"can.onKeysAdded": function(handler,queue) {
		this[canSymbol.for("can.onKeyValue")]("add", handler,queue);
	},
	"can.onKeysRemoved": function(handler,queue) {
		this[canSymbol.for("can.onKeyValue")]("remove", handler,queue);
	},*/
	"can.splice": function(index, deleteCount, insert){
		this.splice.apply(this, [index, deleteCount].concat(insert));
	},
	"can.onPatches": function(handler,queue){
		this[canSymbol.for("can.onKeyValue")](localOnPatchesSymbol, handler,queue);
	},
	"can.offPatches": function(handler,queue) {
		this[canSymbol.for("can.offKeyValue")](localOnPatchesSymbol, handler,queue);
	}
};

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	defineListProto["can.getName"] = function() {
		return canReflect.getName(this.constructor) + "[]";
	};
}
//!steal-remove-end

canReflect.assignSymbols(DefineList.prototype, defineListProto);

canReflect.setKeyValue(DefineList.prototype, canSymbol.iterator, function() {
	var index = -1;
	if(typeof this.length !== "number") {
		this.length = 0;
	}
	return {
		next: function() {
			index++;
			return {
				value: this[index],
				done: index >= this.length
			};
		}.bind(this)
	};
});

//!steal-remove-start
if(process.env.NODE_ENV !== 'production') {
	// call `list.log()` to log all event changes
	// pass `key` to only log the matching event, e.g: `list.log("add")`
	DefineList.prototype.log = defineHelpers.log;
}
//!steal-remove-end

define.DefineList = DefineList;

module.exports = ns.DefineList = DefineList;
