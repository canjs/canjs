"use strict";
/* jshint -W079 */
var namespace = require('can-namespace');
var Map = require('can-map');
var bubble = require('can-map/bubble');
var mapHelpers = require('can-map/map-helpers');
var queues = require('can-queues');
var canEvent = require('can-event-queue/map/map');
var ObservationRecorder = require('can-observation-recorder');

var CID = require('can-cid');
var canReflect = require('can-reflect');
var assign = require('can-assign');
var types = require('can-types');
var canSymbol = require('can-symbol');
var CIDMap = require("can-cid/map/map");

// Helpers for `observable` lists.
var splice = [].splice,
	// test if splice works correctly
	spliceRemovesProps = (function () {
		// IE's splice doesn't remove properties
		var obj = {
			0: "a",
			length: 1
		};
		splice.call(obj, 0, 1);
		return !obj[0];
	})();

// Function that serializes the passed arg if
// type does not match MapType of `this` list
// then adds to args array
var serializeNonTypes = function(MapType, arg, args) {
	if(arg && arg.serialize && !(arg instanceof MapType)) {
		args.push(new MapType(arg.serialize()));
	} else {
		args.push(arg);
	}
};

var List = Map.extend(
	{
		Map: Map
	},
	{
		setup: function (instances, options) {
			this.length = 0;
			CID(this, ".map");
			this._setupComputedProperties();
			instances = instances === undefined ? [] : canReflect.toArray(instances);
			var teardownMapping;

			if (canReflect.isPromise(instances)) {
				this.replace(instances);
			} else {
				teardownMapping = instances.length && mapHelpers.addToMap(instances, this);
				this.push.apply(this, instances);
			}

			if (teardownMapping) {
				teardownMapping();
			}

			// this change needs to be ignored
			assign(this, options);
		},
		_triggerChange: function (attr, how, newVal, oldVal) {
			queues.batch.start();
			// `batchTrigger` direct add and remove events...
			var index = +attr, patches;
			// Make sure this is not nested and not an expando

			if (!~(""+attr).indexOf('.') && !isNaN(index)) {
				if(bubble.isBubbling(this, "change")) {
					canEvent.dispatch.call(this, {
						type: "change",
						target: this
					}, [attr, how, newVal, oldVal]);
				}
				if (how === 'add') {
					patches = [{insert: newVal, index: index, deleteCount: 0, type: "splice"}];
					canEvent.dispatch.call(this, {type: how, patches: patches}, [newVal, index]);
					canEvent.dispatch.call(this, 'length', [this.length]);
					canEvent.dispatch.call(this, 'can.patches', [patches]);
				} else if (how === 'remove') {
					patches = [{index: index, deleteCount: oldVal.length, type: "splice"}];
					canEvent.dispatch.call(this, {type: how, patches: patches}, [oldVal, index]);
					canEvent.dispatch.call(this, 'length', [this.length]);
					canEvent.dispatch.call(this, 'can.patches', [patches]);
				} else {
					canEvent.dispatch.call(this, how, [newVal, index]);
				}

			} else {
				Map.prototype._triggerChange.apply(this, arguments);
			}
			queues.batch.stop();
		},
		__get: function(prop){
			prop = isNaN(+prop) || (prop % 1) ? prop : +prop;
			if(typeof prop === "number") {
				ObservationRecorder.add(this, "can.patches");
				return this.___get( "" + prop );
			} else {
				return Map.prototype.__get.call(this, prop);
			}
		},
		___get: function (attr) {
			if (attr) {
				var computedAttr = this._computedAttrs[attr];
				if(computedAttr && computedAttr.compute) {
					return canReflect.getValue(computedAttr.compute);
				}

				if (this[attr] && this[attr].isComputed && typeof this.constructor.prototype[attr] === "function" ) {
					return canReflect.getValue(this[attr]);
				} else {
					return this[attr];
				}
			} else {
				return this;
			}
		},
		__set: function (prop, value, current) {
			// We want change events to notify using integers if we're
			// setting an integer index. Note that <float> % 1 !== 0;
			prop = isNaN(+prop) || (prop % 1) ? prop : +prop;

			// Check to see if we're doing a .attr() on an out of
			// bounds index property.
			if (typeof prop === "number") {
				if( prop > this.length - 1 ) {
					var newArr = new Array((prop + 1) - this.length);
					newArr[newArr.length-1] = value;
					this.push.apply(this, newArr);
					return newArr;
				} else {
					this.splice(prop,1,value);
					return this;
				}
			}

			return Map.prototype.__set.call(this, ""+prop, value, current);
		},
		___set: function (attr, val) {
			this[attr] = val;
			if (+attr >= this.length) {
				this.length = (+attr + 1);
			}
		},
		__remove: function(prop, current) {
			// if removing an expando property
			if(isNaN(+prop)) {
				delete this[prop];
				this._triggerChange(prop, "remove", undefined, current);
			} else {
				this.splice(prop, 1);
			}
		},
		_each: function (callback) {
			var data = this.___get();
			for (var i = 0; i < data.length; i++) {
				callback(data[i], i);
			}
		},
		// Returns the serialized form of this list.
		/**
		 * @hide
		 * Returns the serialized form of this list.
		 */
		serialize: function () {
			return canReflect.serialize(this, CIDMap);
		},
		splice: function (index, howMany) {
			var args = canReflect.toArray(arguments),
				added =[],
				i, len, listIndex,
				allSame = args.length > 2;

			index = index || 0;

			// converting the arguments to the right type
			for (i = 0, len = args.length-2; i < len; i++) {
				listIndex = i + 2;
				args[listIndex] = this.__type(args[listIndex], listIndex);
				added.push(args[listIndex]);

				// Now lets check if anything will change
				if(this[i+index] !== args[listIndex]) {
					allSame = false;
				}
			}

			// if nothing has changed, then return
			if(allSame && this.length <= added.length) {
				return added;
			}

			// default howMany if not provided
			if (howMany === undefined) {
				howMany = args[1] = this.length - index;
			}

			var removed = splice.apply(this, args);

			// delete properties for browsers who's splice sucks (old ie)
			if (!spliceRemovesProps) {
				for (i = this.length; i < removed.length + this.length; i++) {
					delete this[i];
				}
			}

			queues.batch.start();
			if (howMany > 0) {
				// tears down bubbling
				bubble.removeMany(this, removed);
				this._triggerChange("" + index, "remove", undefined, removed);
			}
			if (args.length > 2) {
				// make added items bubble to this list
				bubble.addMany(this, added);
				this._triggerChange("" + index, "add", added, removed);
			}
			queues.batch.stop();
			return removed;
		}
	}),

	// Converts to an `array` of arguments.
	getArgs = function (args) {
		return args[0] && Array.isArray(args[0]) ?
			args[0] :
			canReflect.toArray(args);
	};
// Create `push`, `pop`, `shift`, and `unshift`
canReflect.eachKey({
		/**
		 * @function can-list.prototype.push push
		 * @parent can-list.prototype
		 * @description Add elements to the end of a list.
		 * @signature `list.push(...elements)`
		 *
		 * `push` adds elements onto the end of a List.
		 *
		 * @param {*} elements the elements to add to the List
		 *
		 * @return {Number} the new length of the List
		 *
		 * @body
		 * `push` adds elements onto the end of a List here is an example:
		 *
		 * ```
		 * var list = new List(['Alice']);
		 *
		 * list.push('Bob', 'Eve');
		 * list.attr(); // ['Alice', 'Bob', 'Eve']
		 * ```
		 *
		 * If you have an array you want to concatenate to the end
		 * of the List, you can use `apply`:
		 *
		 * ```
		 * var names = ['Bob', 'Eve'],
		 *     list = new List(['Alice']);
		 *
		 * list.push.apply(list, names);
		 * list.attr(); // ['Alice', 'Bob', 'Eve']
		 * ```
		 *
		 * ## Events
		 *
		 * `push` causes _change_, _add_, and _length_ events to be fired.
		 *
		 * ## See also
		 *
		 * `push` has a counterpart in [can-list.prototype.pop], or you may be
		 * looking for [can-list.prototype.unshift] and its counterpart [can-list.prototype.shift].
		 */
		push: "length",
		/**
		 * @function can-list.prototype.unshift unshift
		 * @parent can-list.prototype
		 * @description Add elements to the beginning of a List.
		 * @signature `list.unshift(...elements)`
		 *
		 * `unshift` adds elements onto the beginning of a List.
		 *
		 * @param {*} elements the elements to add to the List
		 *
		 * @return {Number} the new length of the List
		 *
		 * @body
		 * `unshift` adds elements to the front of the list in bulk in the order specified:
		 *
		 * ```
		 * var list = new List(['Alice']);
		 *
		 * list.unshift('Bob', 'Eve');
		 * list.attr(); // ['Bob', 'Eve', 'Alice']
		 * ```
		 *
		 * If you have an array you want to concatenate to the beginning
		 * of the List, you can use `apply`:
		 *
		 * ```
		 * var names = ['Bob', 'Eve'],
		 *     list = new List(['Alice']);
		 *
		 * list.unshift.apply(list, names);
		 * list.attr(); // ['Bob', 'Eve', 'Alice']
		 * ```
		 *
		 * ## Events
		 *
		 * `unshift` causes _change_, _add_, and _length_ events to be fired.
		 *
		 * ## See also
		 *
		 * `unshift` has a counterpart in [can-list.prototype.shift], or you may be
		 * looking for [can-list.prototype.push] and its counterpart [can-list.prototype.pop].
		 */
		unshift: 0
	},
	// Adds a method
	// `name` - The method name.
	// `where` - Where items in the `array` should be added.
	function (where, name) {
		var orig = [][name];
		List.prototype[name] = function () {
			// Get the items being added.
			var args = [],
				// Where we are going to add items.
				len = where ? this.length : 0,
				i = arguments.length,
				res, val;

			// Go through and convert anything to a `map` that needs to be converted.
			while (i--) {
				val = arguments[i];
				args[i] = bubble.set(this, i, this.__type(val, i) );
			}

			// Call the original method.
			res = orig.apply(this, args);

			if (!this.comparator || args.length) {

				this._triggerChange("" + len, "add", args, undefined);
			}

			return res;
		};
	});

canReflect.eachKey({
		/**
		 * @function can-list.prototype.pop pop
		 * @parent can-list.prototype
		 * @description Remove an element from the end of a List.
		 * @signature `list.pop()`
		 *
		 * `pop` removes an element from the end of a List.
		 *
		 * @return {*} the element just popped off the List, or `undefined` if the List was empty
		 *
		 * @body
		 * `pop` is the opposite action from [can-list.prototype.push]:
		 *
		 * ```
		 * var list = new List(['Alice', 'Bob', 'Eve']);
		 * list.attr(); // ['Alice', 'Bob', 'Eve']
		 *
		 * list.pop(); // 'Eve'
		 * list.pop(); // 'Bob'
		 * list.pop(); // 'Alice'
		 * list.pop(); // undefined
		 * ```
		 *
		 * ## Events
		 *
		 * `pop` causes _change_, _remove_, and _length_ events to be fired if the List is not empty
		 * when it is called.
		 *
		 * ## See also
		 *
		 * `pop` has its counterpart in [can-list.prototype.push], or you may be
		 * looking for [can-list.prototype.unshift] and its counterpart [can-list.prototype.shift].
		 */
		pop: "length",
		/**
		 * @function can-list.prototype.shift shift
		 * @parent can-list.prototype
		 * @description Remove en element from the front of a list.
		 * @signature `list.shift()`
		 *
		 * `shift` removes an element from the beginning of a List.
		 *
		 * @return {*} the element just shifted off the List, or `undefined` if the List is empty
		 *
		 * @body
		 * `shift` is the opposite action from `[can-list.prototype.unshift]`:
		 *
		 * ```
		 * var list = new List(['Alice']);
		 *
		 * list.unshift('Bob', 'Eve');
		 * list.attr(); // ['Bob', 'Eve', 'Alice']
		 *
		 * list.shift(); // 'Bob'
		 * list.shift(); // 'Eve'
		 * list.shift(); // 'Alice'
		 * list.shift(); // undefined
		 * ```
		 *
		 * ## Events
		 *
		 * `pop` causes _change_, _remove_, and _length_ events to be fired if the List is not empty
		 * when it is called.
		 *
		 * ## See also
		 *
		 * `shift` has a counterpart in [can-list.prototype.unshift], or you may be
		 * looking for [can-list.prototype.push] and its counterpart [can-list.prototype.pop].
		 */
		shift: 0
	},
	// Creates a `remove` type method
	function (where, name) {
		List.prototype[name] = function () {
			if (!this.length) {
				// For shift and pop, we just return undefined without
				// triggering events.
				return undefined;
			}

			var args = getArgs(arguments),
				len = where && this.length ? this.length - 1 : 0;

			var res = [][name].apply(this, args);

			// Create a change where the args are
			// `len` - Where these items were removed.
			// `remove` - Items removed.
			// `undefined` - The new values (there are none).
			// `res` - The old, removed values (should these be unbound).
			this._triggerChange("" + len, "remove", undefined, [res]);

			if (res && res.removeEventListener) {
				bubble.remove(this, res);
			}

			return res;
		};
	});

assign(List.prototype, {
	/**
	 * @function can-list.prototype.indexOf indexOf
	 * @parent can-list.prototype
	 * @description Look for an item in a List.
	 * @signature `list.indexOf(item)`
	 *
	 * `indexOf` finds the position of a given item in the List.
	 *
	 * @param {*} item the item to find
	 *
	 * @return {Number} the position of the item in the List, or -1 if the item is not found.
	 *
	 * @body
	 * ```
	 * var list = new List(['Alice', 'Bob', 'Eve']);
	 * list.indexOf('Alice');   // 0
	 * list.indexOf('Charlie'); // -1
	 * ```
	 *
	 * It is trivial to make a `contains`-type function using `indexOf`:
	 *
	 * ```
	 * function(list, item) {
	 *     return list.indexOf(item) >= 0;
	 * }
	 * ```
	 */
	indexOf: function (item, fromIndex) {
		ObservationRecorder.add(this, "length");
		for(var i = fromIndex || 0, len = this.length; i < len; i++) {
			if(this.attr(i) === item) {
				return i;
			}
		}
		return -1;
	},

	/**
	 * @function can-list.prototype.join join
	 * @parent can-list.prototype
	 * @description Join a List's elements into a string.
	 * @signature `list.join(separator)`
	 *
	 * `join` turns a List into a string by inserting _separator_ between the string representations
	 * of all the elements of the List.
	 *
	 * @param {String} separator the string to seperate elements with
	 *
	 * @return {String} the joined string
	 *
	 * @body
	 * ```
	 * var list = new List(['Alice', 'Bob', 'Eve']);
	 * list.join(', '); // 'Alice, Bob, Eve'
	 *
	 * var beatles = new List(['John', 'Paul', 'Ringo', 'George']);
	 * beatles.join('&'); // 'John&Paul&Ringo&George'
	 * ```
	 */
	join: function () {
		ObservationRecorder.add(this, "length");
		return [].join.apply(this, arguments);
	},

	/**
	 * @function can-list.prototype.reverse reverse
	 * @parent can-list.prototype
	 * @description Reverse the order of a List.
	 * @signature `list.reverse()`
	 *
	 * `reverse` reverses the elements of the List in place.
	 *
	 * @return {can-list} the List, for chaining
	 *
	 * @body
	 * ```
	 * var list = new List(['Alice', 'Bob', 'Eve']);
	 * var reversedList = list.reverse();
	 *
	 * reversedList.attr(); // ['Eve', 'Bob', 'Alice'];
	 * list === reversedList; // true
	 * ```
	 */
	reverse: function() {
		var list = [].reverse.call(canReflect.toArray(this));
		return this.replace(list);
	},

	/**
	 * @function can-list.prototype.slice slice
	 * @parent can-list.prototype
	 * @description Make a copy of a part of a List.
	 * @signature `list.slice([start[, end]])`
	 *
	 * `slice` creates a copy of a portion of the List.
	 *
	 * @param {Number} [start=0] the index to start copying from
	 *
	 * @param {Number} [end] the first index not to include in the copy
	 * If _end_ is not supplied, `slice` will copy until the end of the list.
	 *
	 * @return {can-list} a new `can-list` with the extracted elements
	 *
	 * @body
	 * ```
	 * var list = new List(['Alice', 'Bob', 'Charlie', 'Daniel', 'Eve']);
	 * var newList = list.slice(1, 4);
	 * newList.attr(); // ['Bob', 'Charlie', 'Daniel']
	 * ```
	 *
	 * `slice` is the simplest way to copy a List:
	 *
	 * ```
	 * var list = new List(['Alice', 'Bob', 'Eve']);
	 * var copy = list.slice();
	 *
	 * copy.attr();   // ['Alice', 'Bob', 'Eve']
	 * list === copy; // false
	 * ```
	 */
	slice: function () {
		// tells computes to listen on length for changes.
		ObservationRecorder.add(this, "length");
		var temp = Array.prototype.slice.apply(this, arguments);
		return new this.constructor(temp);
	},

	/**
	 * @function can-list.prototype.concat concat
	 * @parent can-list.prototype
	 * @description Merge many collections together into a List.
	 * @signature `list.concat(...args)`
	 * @param {Array|can-list|*} args Any number of arrays, Lists, or values to add in
	 * For each parameter given, if it is an Array or a List, each of its elements will be added to
	 * the end of the concatenated List. Otherwise, the parameter itself will be added.
	 *
	 * @body
	 * `concat` makes a new List with the elements of the List followed by the elements of the parameters.
	 *
	 * ```
	 * var list = new List();
	 * var newList = list.concat(
	 *     'Alice',
	 *     ['Bob', 'Charlie']),
	 *     new List(['Daniel', 'Eve']),
	 *     {f: 'Francis'}
	 * );
	 * newList.attr(); // ['Alice', 'Bob', 'Charlie', 'Daniel', 'Eve', {f: 'Francis'}]
	 * ```
	 */
	concat: function() {
		var args = [],
			MapType = this.constructor.Map;
		// Go through each of the passed `arguments` and
		// see if it is list-like, an array, or something else
		canReflect.each(arguments, function(arg) {
			if((canReflect.isObservableLike(arg) && canReflect.isListLike(arg)) || Array.isArray(arg)) {
				// If it is list-like we want convert to a JS array then
				// pass each item of the array to serializeNonTypes
				var arr = (canReflect.isObservableLike(arg) && canReflect.isListLike(arg)) ? canReflect.toArray(arg) : arg;
				canReflect.each(arr, function(innerArg) {
					serializeNonTypes(MapType, innerArg, args);
				});
			}
			else {
				// If it is a Map, Object, or some primitive
				// just pass arg to serializeNonTypes
				serializeNonTypes(MapType, arg, args);
			}
		});

		// We will want to make `this` list into a JS array
		// as well (We know it should be list-like), then
		// concat with our passed in args, then pass it to
		// list constructor to make it back into a list
		return new this.constructor(Array.prototype.concat.apply(canReflect.toArray(this), args));
	},

	/**
	 * @function can-list.prototype.forEach forEach
	 * @parent can-list.prototype
	 * @description Call a function for each element of a List.
	 * @signature `list.forEach(callback[, thisArg])`
	 * @param {function(element, index, list)} callback a function to call with each element of the List
	 * The three parameters that _callback_ gets passed are _element_, the element at _index_, _index_ the
	 * current element of the list, and _list_ the List the elements are coming from. _callback_ is
	 * not invoked for List elements that were never initialized.
	 * @param {Object} [thisArg] the object to use as `this` inside the callback
	 *
	 * @body
	 * `forEach` calls a callback for each element in the List.
	 *
	 * ```
	 * var list = new List([1, 2, 3]);
	 * list.forEach(function(element, index, list) {
	 *     list.attr(index, element * element);
	 * });
	 * list.attr(); // [1, 4, 9]
	 * ```
	 */
	forEach: function (cb, thisarg) {
		var item;
		for (var i = 0, len = this.attr("length"); i < len; i++) {
			item = this.attr(i);
			if (item !== undefined && cb.call(thisarg || item, item, i, this) === false) {
				break;
			}
		}
		return this;
	},

	/**
	 * @function can-list.prototype.replace replace
	 * @parent can-list.prototype
	 * @description Replace all the elements of a List.
	 * @signature `list.replace(collection)`
	 * @param {Array|can-list|can.Deferred} collection the collection of new elements to use
	 * If a [can.Deferred] is passed, it must resolve to an `Array` or `can-list`.
	 * The elements of the list are not actually removed until the Deferred resolves.
	 *
	 * @body
	 * `replace` replaces all the elements of this List with new ones.
	 *
	 * `replace` is especially useful when `can-list`s are live-bound into `[can-control]`s,
	 * and you intend to populate them with the results of a `[can-model]` call:
	 *
	 * ```
	 * can.Control({
	 *     init: function() {
	 *         this.list = new Todo.List();
	 *         // live-bind the list into the DOM
	 *         this.element.html(can.view('list.stache', this.list));
	 *         // when this AJAX call returns, the live-bound DOM will be updated
	 *         this.list.replace(Todo.findAll());
	 *     }
	 * });
	 * ```
	 *
	 * Learn more about [can.Model.List making Lists of models].
	 *
	 * ## Events
	 *
	 * A major difference between `replace` and `attr(newElements, true)` is that `replace` always emits
	 * an _add_ event and a _remove_ event, whereas `attr` will cause _set_ events along with an _add_ or _remove_
	 * event if needed. Corresponding _change_ and _length_ events will be fired as well.
	 *
	 * The differences in the events fired by `attr` and `replace` are demonstrated concretely by this example:
	 * ```
	 * var attrList = new List(['Alexis', 'Bill']);
	 * attrList.bind('change', function(ev, index, how, newVals, oldVals) {
	 *     console.log(index + ', ' + how + ', ' + newVals + ', ' + oldVals);
	 * });
	 *
	 * var replaceList = new List(['Alexis', 'Bill']);
	 * replaceList.bind('change', function(ev, index, how, newVals, oldVals) {
	 *     console.log(index + ', ' + how + ', ' + newVals + ', ' + oldVals);
	 * });
	 *
	 * attrList.attr(['Adam', 'Ben'], true);         // 0, set, Adam, Alexis
	 *                                               // 1, set, Ben, Bill
	 * replaceList.replace(['Adam', 'Ben']);         // 0, remove, undefined, ['Alexis', 'Bill']
	 *                                               // 0, add, ['Adam', 'Ben'], ['Alexis', 'Bill']
	 *
	 * attrList.attr(['Amber'], true);               // 0, set, Amber, Adam
	 *                                               // 1, remove, undefined, Ben
	 * replaceList.replace(['Amber']);               // 0, remove, undefined, ['Adam', 'Ben']
	 *                                               // 0, add, Amber, ['Adam', 'Ben']
	 *
	 * attrList.attr(['Alice', 'Bob', 'Eve'], true); // 0, set, Alice, Amber
	 *                                               // 1, add, ['Bob', 'Eve'], undefined
	 * replaceList.replace(['Alice', 'Bob', 'Eve']); // 0, remove, undefined, Amber
	 *                                               // 0, add, ['Alice', 'Bob', 'Eve'], Amber
	 * ```
	 */
	replace: function (newList) {
		if (canReflect.isPromise(newList)) {
			if(this._promise) {
				this._promise.__isCurrentPromise = false;
			}
			var promise = this._promise = newList;
			promise.__isCurrentPromise = true;
			var self = this;
			newList.then(function(newList){
				if(promise.__isCurrentPromise) {
					self.replace(newList);
				}
			});
		} else {
			newList = newList === undefined ? [] : canReflect.toArray(newList);
			this.splice.apply(this, [0, this.length].concat(newList));
		}

		return this;
	},
	filter: function (callback, thisArg) {
		var filteredList = new this.constructor(),
			self = this,
			filtered;
		this.forEach(function(item, index, list){
			filtered = callback.call( thisArg || self, item, index, self);
			if(filtered){
				filteredList.push(item);
			}
		});
		return filteredList;
	},
	map: function (callback, thisArg) {
		var filteredList = new List(),
			self = this;
		this.forEach(function(item, index, list){
			var mapped = callback.call( thisArg || self, item, index, self);
			filteredList.push(mapped);

		});
		return filteredList;
	},
	sort: function(compareFunction) {
		var sorting = Array.prototype.slice.call(this);
		Array.prototype.sort.call(sorting, compareFunction);
		this.splice.apply(this, [0,sorting.length].concat(sorting) );
		return this;
	}
});

// change some map stuff to include list stuff
var oldType = Map.prototype.__type;
Map.prototype.__type = function(value, prop){

	if (typeof value === "object" && Array.isArray(value) ) {

		var cached = mapHelpers.getMapFromObject(value);
		if(cached) {
			return cached;
		}

		return new List(value);

	}
	return oldType.apply(this, arguments);
};

var oldSetup = Map.setup;
Map.setup = function(){
	oldSetup.apply(this, arguments);
	if (!(this.prototype instanceof List)) {
		this.List = Map.List.extend({
			Map: this
		}, {});
	}
};

if(!types.DefaultList) {
	types.DefaultList = List;
}

// Setup other symbols

canReflect.assignSymbols(List.prototype,{
	// -type-

	"can.isMoreListLikeThanMapLike":  true,
	"can.isListLike":  true,

	// -get/set-
	"can.getKeyValue": List.prototype._get,
	"can.setKeyValue": List.prototype._set,
	"can.deleteKeyValue": List.prototype._remove,

	// -shape
	"can.getOwnEnumerableKeys": function(){
		return Object.keys(this._data || {}).concat(this.map(function(val, index) {
			return index;
		}));
	},

	// -shape get/set-
	"can.assignDeep": function(source){
		queues.batch.start();
		// TODO: we should probably just throw an error instead of cleaning
		canReflect.assignDeepList(this, source);
		queues.batch.stop();
	},
	"can.updateDeep": function(source){
		queues.batch.start();
		// TODO: we should probably just throw an error instead of cleaning
		canReflect.updateDeepList(this, source);
		queues.batch.stop();
	},

	"can.unwrap": mapHelpers.reflectUnwrap,
	"can.serialize": mapHelpers.reflectSerialize,

	// observable
	"can.onKeysAdded": function(handler) {
		this[canSymbol.for("can.onKeyValue")]("add", handler);
	},
	"can.onKeysRemoved":  function(handler) {
		this[canSymbol.for("can.onKeyValue")]("remove", handler);
	},
	"can.splice": function(index, deleteCount, insert){
		this.splice.apply(this, [index, deleteCount].concat(insert));
	},
	"can.onPatches": function(handler,queue){
		this[canSymbol.for("can.onKeyValue")]("can.patches", handler,queue);
	},
	"can.offPatches": function(handler,queue) {
		this[canSymbol.for("can.offKeyValue")]("can.patches", handler,queue);
	}
});




// @@can.keyHasDependencies and @@can.getKeyDependencies same as can-map

Map.List = List;
module.exports = namespace.List = List;
