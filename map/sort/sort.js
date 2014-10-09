steal('can/util', 'can/list', function (can) {
	
	function defaultSort(comparator) {
		return function(a, b) {
			a = typeof a[comparator] === 'function' ? a[comparator]() : a[comparator];
			b = typeof b[comparator] === 'function' ? b[comparator]() : b[comparator];
			return a === b ? 0 : a < b ? -1 : 1;
		};
	}

	can.extend(can.List.prototype, {
		comparator: undefined,
		sortIndexes: [],

		sort: function (method, silent) {
			var args = [ this.comparator ? defaultSort(this.comparator) : method ];
			
			var oldVal = this.slice(0);
			var newVal = Array.prototype.sort.apply(this, args);
			
			if (!silent) {
				this._triggerChange("0", "remove", undefined, oldVal);
				this._triggerChange("0", "add", newVal, oldVal);
			}
			
			return newVal;
		}
	});
});
