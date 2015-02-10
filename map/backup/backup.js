//allows you to backup and restore a map instance
steal('can/util', 'can/compute', 'can/map', 'can/util/object', function (can) {
	var flatProps = function (a, cur) {
		var obj = {};
		for (var prop in a) {
			if (typeof a[prop] !== 'object' || a[prop] === null || a[prop] instanceof Date) {
				obj[prop] = a[prop];
			} else {
				obj[prop] = cur.attr(prop);
			}
		}
		return obj;
	};

	var oldSetup = can.Map.prototype.setup;

	can.extend(can.Map.prototype, {
		setup: function() {
			this._backupStore = can.compute();
			return oldSetup.apply(this, arguments);
		},

		backup: function () {
			this._backupStore(this.attr());
			return this;
		},
		isDirty: function (checkAssociations) {
			return this._backupStore() && !can.Object.same(this.attr(), this._backupStore(), undefined, undefined, undefined, !! checkAssociations);
		},
		restore: function (restoreAssociations) {
			var props = restoreAssociations ? this._backupStore() : flatProps(this._backupStore(), this);
			if (this.isDirty(restoreAssociations)) {
				this.attr(props, true);
			}
			return this;
		}
	});
	return can.Map;
});
