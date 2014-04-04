// # can/map/sort/sort.js
//
// A plugin that enables smart sorting of can.Lists. It can do that in multiple ways:
// * by invoking a comparator function provided as an argument to the sort() method,
// * by using a comparator function defined in each contained can.Map
//
// It also listens to changes in the List, and positions changed elements to their appropriate place in the List.

steal('can/util', 'can/list', function (can) {
	var proto = can.List.prototype,
		_changes = proto._changes,
		setup = proto.setup;

	// Extends the can.List prototype
	can.extend(proto, {
		comparator: undefined,
		sortIndexes: [],

		/**
		 * @hide
		 */
		// Calculates the index the item would have in a can.List if the list was sorted.
		sortedIndex: function (item) {
			var itemCompare = item.attr(this.comparator),
				equaled = 0;
			for (var i = 0, length = this.length; i < length; i++) {
				if (item === this[i]) {
					equaled = -1;
					continue;
				}
				if (itemCompare <= this[i].attr(this.comparator)) {
					return i + equaled;
				}
			}
			return i + equaled;
		},

		/**
		 * @hide
		 */
		// Prepares arguments for the sort method of the Array prototype, and invokes the sort after the arguments have been prepared. It handles various sorting cases (comparator function, comparator method, and delegation to Array).
		sort: function (method, silent) {
			var comparator = this.comparator,
				args = comparator ? [

					function (a, b) {
						a = typeof a[comparator] === 'function' ? a[comparator]() : a[comparator];
						b = typeof b[comparator] === 'function' ? b[comparator]() : b[comparator];
						return a === b ? 0 : a < b ? -1 : 1;
					}
				] : [method];
			if (!silent) {
				can.trigger(this, 'reset');
			}
			return Array.prototype.sort.apply(this, args);
		}
	});

	var getArgs = function (args) {
		return args[0] && can.isArray(args[0]) ? args[0] : can.makeArray(args);
	};

	// Takes certain methods from can.List prototype and depending on the method replaces them with a function that does the same thing, but invokes sorting afterwards.
	//
	// It also suspends triggering events on each sort-move by setting the silent flag to true while sorting and only triggers events after the list has been sorted.
	can.each({
		/**
		 * @function push
		 * Add items to the end of the list. Example:
		 *
		 *     var l = new can.List([]);
		 *
		 *     l.bind('change', function(
		 *         ev,        // the change event
		 *         attr,      // the attr that was changed, for multiple items, "*" is used
		 *         how,       // "add"
		 *         newVals,   // an array of new values pushed
		 *         oldVals,   // undefined
		 *         where      // the location where these items where added
		 *         ) {
		 *
		 *     })
		 *
		 *     l.push('0','1','2');
		 *
		 * @param {...*} [...items] items to add to the end of the list.
		 * @return {Number} the number of items in the array
		 */
		push: "length",
		/**
		 * @function unshift
		 * Add items to the start of the list. This is very similar to
		 * [can.List::push]. Example:
		 *
		 *     var l = new can.List(["a","b"]);
		 *     l.unshift(1,2,3) //-> 5
		 *     l.attr() //-> [1,2,3,"a","b"]
		 *
		 * @param {...*} [...items] items to add to the start of the list.
		 * @return {Number} the length of the array.
		 */
		unshift: 0
	},
	/**
	 * adds a method where
	 * @param where items in the array should be added
	 * @param name method name
	 */
	function (where, name) {
		var proto = can.List.prototype,
		old = proto[name];
		proto[name] = function () {
			var args = getArgs(arguments),
			len = where ? this.length : 0;
			var res = old.apply(this, arguments);
			if (this.comparator && args.length) {
				this.sort(null, true);
				can.batch.trigger(this, 'reset', [args]);
				this._triggerChange('' + len, 'add', args, undefined);
			}
			return res;
		};
	});

	// Overrides the _changes callback that gets triggered when
	// an element in an List changes.
	//
	// Since this is a sorted List, the change needs to appropriately
	// handled, which in turn means that the changed element needs to be
	// positioned to it's correct location inside the List.
	//
	// Events are triggered after the move has happened.
	proto._changes = function (ev, attr, how, newVal, oldVal) {
		// Checks if the attribute name is numeric, which means
		// elements of can.List are changing.
		if (this.comparator && /^\d+./.test(attr)) {
			var index = +/^\d+/.exec(attr)[0],
				item = this[index];
			if (typeof item !== 'undefined') {
				var newIndex = this.sortedIndex(item);
				if (newIndex !== index) {
					[].splice.call(this, index, 1);
					[].splice.call(this, newIndex, 0, item);
					can.trigger(this, 'move', [
						item,
						newIndex,
						index
					]);
					can.trigger(this, 'change', [
						attr.replace(/^\d+/, newIndex),
						how,
						newVal,
						oldVal
					]);
					return;
				}
			}
		}
		_changes.apply(this, arguments);
	};

	// Override setup for sorting
	proto.setup = function (instances, options) {
		setup.apply(this, arguments);
		if (this.comparator) {
			this.sort();
		}
	};
	return can.Map;
});
