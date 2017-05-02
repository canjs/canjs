steal("can/util", "can/map", "can/map/bubble.js","can/map/map_helpers.js",function (can, Map, bubble, mapHelpers) {

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

	/**
	 * @add can.List
	 */
	var list = Map.extend(
		/**
		 * @static
		 */
		{
			/**
			 * @property {can.Map} can.List.Map
			 *
			 * @description Specify the Map type used to make objects added to this list observable.
			 *
			 * @option {can.Map} When objects are added to a can.List, those objects are
			 * converted into can.Map instances.  For example:
			 *
			 *     var list = new can.List();
			 *     list.push({name: "Justin"});
			 *
			 *     var map = list.attr(0);
			 *     map.attr("name") //-> "Justin"
			 *
			 * By changing [can.List.Map], you can specify a different type of Map instance to
			 * create. For example:
			 *
			 *     var User = can.Map.extend({
			 *       fullName: function(){
			 *         return this.attr("first")+" "+this.attr("last")
			 *       }
			 *     });
			 *
			 *     User.List = can.List.extend({
			 *       Map: User
			 *     }, {});
			 *
			 *     var list = new User.List();
			 *     list.push({first: "Justin", last: "Meyer"});
			 *
			 *     var user = list.attr(0);
			 *     user.fullName() //-> "Justin Meyer"
			 *
			 *
			 *
			 */
			Map: Map
			/**
			 * @function can.Map.extend
			 *
			 * @signature `can.List.extend([name,] [staticProperties,] instanceProperties)`
			 *
			 * Creates a new extended constructor function. Learn more at [can.Construct.extend].
			 *
			 * @param {String} [name] If provided, adds the extened List constructor function
			 * to the window at the given name.
			 *
			 * @param {Object} [staticProperties] Properties and methods
			 * directly on the constructor function. The most common property to set is [can.List.Map].
			 *
			 * @param {Object} [instanceProperties] Properties and methods on instances of this list type.
			 *
			 * @body
			 *
			 * ## Use
			 *
			 *
			 */
		},
		/**
		 * @prototype
		 */
		{
			setup: function (instances, options) {
				this.length = 0;
				can.cid(this, ".map");
				this._setupComputedProperties();
				instances = instances || [];
				var teardownMapping;

				if (can.isPromise(instances)) {
					this.replace(instances);
				} else {
					teardownMapping = instances.length && mapHelpers.addToMap(instances, this);
					this.push.apply(this, can.makeArray(instances || []));
				}

				if (teardownMapping) {
					teardownMapping();
				}

				// this change needs to be ignored
				can.simpleExtend(this, options);
			},
			_triggerChange: function (attr, how, newVal, oldVal) {

				Map.prototype._triggerChange.apply(this, arguments);
				// `batchTrigger` direct add and remove events...
				var index = +attr;
				// Make sure this is not nested and not an expando
				if (!~(""+attr).indexOf('.') && !isNaN(index)) {

					if (how === 'add') {
						can.batch.trigger(this, how, [newVal, index]);
						can.batch.trigger(this, 'length', [this.length]);
					} else if (how === 'remove') {
						can.batch.trigger(this, how, [oldVal, index]);
						can.batch.trigger(this, 'length', [this.length]);
					} else {
						can.batch.trigger(this, how, [newVal, index]);
					}

				}

			},
			___get: function (attr) {
				if (attr) {
					var computedAttr = this._computedAttrs[attr];
					if (computedAttr && computedAttr.compute) {
						// return computedAttr.compute();
						return computedAttr.compute();
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
				if (typeof prop === "number" &&
					prop > this.length - 1) {
					var newArr = new Array((prop + 1) - this.length);
					newArr[newArr.length-1] = value;
					this.push.apply(this, newArr);
					return newArr;
				}

				return can.Map.prototype.__set.call(this, ""+prop, value, current);
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
				return mapHelpers.serialize(this, 'serialize', []);
			},
			/**
			 * @function can.List.prototype.each each
			 * @description Call a function on each element of a List.
			 * @signature `list.each( callback(item, index) )`
			 *
			 * `each` iterates through the Map, calling a function
			 * for each element.
			 *
			 * @param {function(*, Number)} callback the function to call for each element
			 * The value and index of each element will be passed as the first and second
			 * arguments, respectively, to the callback. If the callback returns false,
			 * the loop will stop.
			 *
			 * @return {can.List} this List, for chaining
			 *
			 * @body
			 * ```
			 * var i = 0;
			 * new can.Map([1, 10, 100]).each(function(element, index) {
			 *     i += element;
			 * });
			 *
			 * i; // 111
			 *
			 * i = 0;
			 * new can.Map([1, 10, 100]).each(function(element, index) {
			 *     i += element;
			 *     if(index >= 1) {
			 *         return false;
			 *     }
			 * });
			 *
			 * i; // 11
			 * ```
			 */
			//
			/**
			 * @function can.List.prototype.splice splice
			 * @description Insert and remove elements from a List.
			 * @signature `list.splice(index[, howMany[, ...newElements]])`
			 * @param {Number} index where to start removing or inserting elements
			 *
			 * @param {Number} [howMany] the number of elements to remove
			 * If _howMany_ is not provided, `splice` will remove all elements from `index` to the end of the List.
			 *
			 * @param {*} newElements elements to insert into the List
			 *
			 * @return {Array} the elements removed by `splice`
			 *
			 * @body
			 * `splice` lets you remove elements from and insert elements into a List.
			 *
			 * This example demonstrates how to do surgery on a list of numbers:
			 *
			 * ```
			 * var list = new can.List([0, 1, 2, 3]);
			 *
			 * // starting at index 2, remove one element and insert 'Alice' and 'Bob':
			 * list.splice(2, 1, 'Alice', 'Bob');
			 * list.attr(); // [0, 1, 'Alice', 'Bob', 3]
			 * ```
			 *
			 * ## Events
			 *
			 * `splice` causes the List it's called on to emit _change_ events,
			 * _add_ events, _remove_ events, and _length_ events. If there are
			 * any elements to remove, a _change_ event, a _remove_ event, and a
			 * _length_ event will be fired. If there are any elements to insert, a
			 * separate _change_ event, an _add_ event, and a separate _length_ event
			 * will be fired.
			 *
			 * This slightly-modified version of the above example should help
			 * make it clear how `splice` causes events to be emitted:
			 *
			 * ```
			 * var list = new can.List(['a', 'b', 'c', 'd']);
			 * list.bind('change', function(ev, attr, how, newVals, oldVals) {
			 *     console.log('change: ' + attr + ', ' + how + ', ' + newVals + ', ' + oldVals);
			 * });
			 * list.bind('add', function(ev, newVals, where) {
			 *     console.log('add: ' + newVals + ', ' + where);
			 * });
			 * list.bind('remove', function(ev, oldVals, where) {
			 *     console.log('remove: ' + oldVals + ', ' + where);
			 * });
			 * list.bind('length', function(ev, length) {
			 *     console.log('length: ' + length + ', ' + this.attr());
			 * });
			 *
			 * // starting at index 2, remove one element and insert 'Alice' and 'Bob':
			 * list.splice(2, 1, 'Alice', 'Bob'); // change: 2, 'remove', undefined, ['c']
			 *                                    // remove: ['c'], 2
			 *                                    // length: 5, ['a', 'b', 'Alice', 'Bob', 'd']
			 *                                    // change: 2, 'add', ['Alice', 'Bob'], ['c']
			 *                                    // add: ['Alice', 'Bob'], 2
			 *                                    // length: 5, ['a', 'b', 'Alice', 'Bob', 'd']
			 * ```
			 *
			 * More information about binding to these events can be found under [can.List.attr attr].
			 */
			splice: function (index, howMany) {
				var args = can.makeArray(arguments),
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

				can.batch.start();
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
				can.batch.stop();
				return removed;
			},
			_getAttrs: function(){
				return mapHelpers.serialize(this, 'attr', []);
			},
			_setAttrs: function (items, remove) {
				// Create a copy.
				items = can.makeArray(items);

				can.batch.start();
				this._updateAttrs(items, remove);
				can.batch.stop();
			},

			_updateAttrs: function (items, remove) {
				var len = Math.min(items.length, this.length);

				for (var prop = 0; prop < len; prop++) {
					var curVal = this[prop],
						newVal = items[prop];

					if ( can.isMapLike(curVal) && mapHelpers.canMakeObserve(newVal)) {
						curVal.attr(newVal, remove);
						//changed from a coercion to an explicit
					} else if (curVal !== newVal) {
						this._set(prop+"", newVal);
					} else {

					}
				}
				if (items.length > this.length) {
					// Add in the remaining props.
					this.push.apply(this, items.slice(this.length));
				} else if (items.length < this.length && remove) {
					this.splice(items.length);
				}
			}
		}),

		// Converts to an `array` of arguments.
		getArgs = function (args) {
			return args[0] && can.isArray(args[0]) ?
				args[0] :
				can.makeArray(args);
		};
	// Create `push`, `pop`, `shift`, and `unshift`
	can.each({
			/**
			 * @function can.List.prototype.push push
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
			 * var list = new can.List(['Alice']);
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
			 *     list = new can.List(['Alice']);
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
			 * `push` has a counterpart in [can.List::pop pop], or you may be
			 * looking for [can.List::unshift unshift] and its counterpart [can.List::shift shift].
			 */
			push: "length",
			/**
			 * @function can.List.prototype.unshift unshift
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
			 * var list = new can.List(['Alice']);
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
			 *     list = new can.List(['Alice']);
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
			 * `unshift` has a counterpart in [can.List::shift shift], or you may be
			 * looking for [can.List::push push] and its counterpart [can.List::pop pop].
			 */
			unshift: 0
		},
		// Adds a method
		// `name` - The method name.
		// `where` - Where items in the `array` should be added.
		function (where, name) {
			var orig = [][name];
			list.prototype[name] = function () {
				can.batch.start();
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
				can.batch.stop();
				return res;
			};
		});

	can.each({
			/**
			 * @function can.List.prototype.pop pop
			 * @description Remove an element from the end of a List.
			 * @signature `list.pop()`
			 *
			 * `pop` removes an element from the end of a List.
			 *
			 * @return {*} the element just popped off the List, or `undefined` if the List was empty
			 *
			 * @body
			 * `pop` is the opposite action from `[can.List.push push]`:
			 *
			 * ```
			 * var list = new can.List(['Alice', 'Bob', 'Eve']);
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
			 * `pop` has its counterpart in [can.List::push push], or you may be
			 * looking for [can.List::unshift unshift] and its counterpart [can.List::shift shift].
			 */
			pop: "length",
			/**
			 * @function can.List.prototype.shift shift
			 * @description Remove en element from the front of a list.
			 * @signature `list.shift()`
			 *
			 * `shift` removes an element from the beginning of a List.
			 *
			 * @return {*} the element just shifted off the List, or `undefined` if the List is empty
			 *
			 * @body
			 * `shift` is the opposite action from `[can.List::unshift unshift]`:
			 *
			 * ```
			 * var list = new can.List(['Alice']);
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
			 * `shift` has a counterpart in [can.List::unshift unshift], or you may be
			 * looking for [can.List::push push] and its counterpart [can.List::pop pop].
			 */
			shift: 0
		},
		// Creates a `remove` type method
		function (where, name) {
			list.prototype[name] = function () {
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
				can.batch.start();
				this._triggerChange("" + len, "remove", undefined, [res]);

				if (res && res.unbind) {
					bubble.remove(this, res);
				}
				can.batch.stop();
				return res;
			};
		});

	can.extend(list.prototype, {
		/**
		 * @function can.List.prototype.indexOf indexOf
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
		 * var list = new can.List(['Alice', 'Bob', 'Eve']);
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
			can.__observe(this, "length");
			return can.inArray(item, this, fromIndex);
		},

		/**
		 * @function can.List.prototype.join join
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
		 * var list = new can.List(['Alice', 'Bob', 'Eve']);
		 * list.join(', '); // 'Alice, Bob, Eve'
		 *
		 * var beatles = new can.List(['John', 'Paul', 'Ringo', 'George']);
		 * beatles.join('&'); // 'John&Paul&Ringo&George'
		 * ```
		 */
		join: function () {
			can.__observe(this, "length");
			return [].join.apply(this, arguments);
		},

		/**
		 * @function can.List.prototype.reverse reverse
		 * @description Reverse the order of a List.
		 * @signature `list.reverse()`
		 *
		 * `reverse` reverses the elements of the List in place.
		 *
		 * @return {can.List} the List, for chaining
		 *
		 * @body
		 * ```
		 * var list = new can.List(['Alice', 'Bob', 'Eve']);
		 * var reversedList = list.reverse();
		 *
		 * reversedList.attr(); // ['Eve', 'Bob', 'Alice'];
		 * list === reversedList; // true
		 * ```
		 */
		reverse: function() {
			var list = [].reverse.call(can.makeArray(this));
			return this.replace(list);
		},

		/**
		 * @function can.List.prototype.slice slice
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
		 * @return {can.List} a new `can.List` with the extracted elements
		 *
		 * @body
		 * ```
		 * var list = new can.List(['Alice', 'Bob', 'Charlie', 'Daniel', 'Eve']);
		 * var newList = list.slice(1, 4);
		 * newList.attr(); // ['Bob', 'Charlie', 'Daniel']
		 * ```
		 *
		 * `slice` is the simplest way to copy a List:
		 *
		 * ```
		 * var list = new can.List(['Alice', 'Bob', 'Eve']);
		 * var copy = list.slice();
		 *
		 * copy.attr();   // ['Alice', 'Bob', 'Eve']
		 * list === copy; // false
		 * ```
		 */
		slice: function () {
			// tells computes to listen on length for changes.
			can.__observe(this, "length");
			var temp = Array.prototype.slice.apply(this, arguments);
			return new this.constructor(temp);
		},

		/**
		 * @function can.List.prototype.concat concat
		 * @description Merge many collections together into a List.
		 * @signature `list.concat(...args)`
		 * @param {Array|can.List|*} args Any number of arrays, Lists, or values to add in
		 * For each parameter given, if it is an Array or a List, each of its elements will be added to
		 * the end of the concatenated List. Otherwise, the parameter itself will be added.
		 *
		 * @body
		 * `concat` makes a new List with the elements of the List followed by the elements of the parameters.
		 *
		 * ```
		 * var list = new can.List();
		 * var newList = list.concat(
		 *     'Alice',
		 *     ['Bob', 'Charlie']),
		 *     new can.List(['Daniel', 'Eve']),
		 *     {f: 'Francis'}
		 * );
		 * newList.attr(); // ['Alice', 'Bob', 'Charlie', 'Daniel', 'Eve', {f: 'Francis'}]
		 * ```
		 */
		concat: function () {
			var args = [];
			can.each(can.makeArray(arguments), function (arg, i) {
				args[i] = arg instanceof can.List ? arg.serialize() : arg;
			});
			return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
		},

		/**
		 * @function can.List.prototype.forEach forEach
		 * @description Call a function for each element of a List.
		 * @signature `list.forEach(callback[, thisArg])`
		 * @param {function(element, index, list)} callback a function to call with each element of the List
		 * The three parameters that _callback_ gets passed are _element_, the element at _index_, _index_ the
		 * current element of the list, and _list_ the List the elements are coming from.
		 * @param {Object} [thisArg] the object to use as `this` inside the callback
		 *
		 * @body
		 * `forEach` calls a callback for each element in the List.
		 *
		 * ```
		 * var list = new can.List([1, 2, 3]);
		 * list.forEach(function(element, index, list) {
		 *     list.attr(index, element * element);
		 * });
		 * list.attr(); // [1, 4, 9]
		 * ```
		 */
		forEach: function (cb, thisarg) {
			return can.each(this, cb, thisarg || this);
		},

		/**
		 * @function can.List.prototype.replace replace
		 * @description Replace all the elements of a List.
		 * @signature `list.replace(collection)`
		 * @param {Array|can.List|can.Deferred} collection the collection of new elements to use
		 * If a [can.Deferred] is passed, it must resolve to an `Array` or `can.List`.
		 * The elements of the list are not actually removed until the Deferred resolves.
		 *
		 * @body
		 * `replace` replaces all the elements of this List with new ones.
		 *
		 * `replace` is especially useful when `can.List`s are live-bound into `[can.Control]`s,
		 * and you intend to populate them with the results of a `[can.Model]` call:
		 *
		 * ```
		 * can.Control({
		 *     init: function() {
		 *         this.list = new Todo.List();
		 *         // live-bind the list into the DOM
		 *         this.element.html(can.view('list.mustache', this.list));
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
		 * var attrList = new can.List(['Alexis', 'Bill']);
		 * attrList.bind('change', function(ev, index, how, newVals, oldVals) {
		 *     console.log(index + ', ' + how + ', ' + newVals + ', ' + oldVals);
		 * });
		 *
		 * var replaceList = new can.List(['Alexis', 'Bill']);
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
			if (can.isPromise(newList)) {
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
				this.splice.apply(this, [0, this.length].concat(can.makeArray(newList || [])));
			}

			return this;
		},
		filter: function (callback, thisArg) {
			var filteredList = new this.constructor(),
				self = this,
				filtered;
			this.each(function(item, index, list){
				filtered = callback.call( thisArg || self, item, index, self);
				if(filtered){
					filteredList.push(item);
				}
			});
			return filteredList;
		},
		map: function (callback, thisArg) {
			var filteredList = new can.List(),
				self = this;
			this.each(function(item, index, list){
				var mapped = callback.call( thisArg || self, item, index, self);
				filteredList.push(mapped);

			});
			return filteredList;
		}
	});
	can.List = Map.List = list;
	return can.List;
});
