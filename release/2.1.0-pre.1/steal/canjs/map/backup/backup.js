/*!
 * CanJS - 2.1.0-pre.1
 * http://canjs.us/
 * Copyright (c) 2014 Bitovi
 * Mon, 05 May 2014 20:37:28 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
//allows you to backup and restore a map instance
steal('can/util', 'can/map', 'can/util/object', function (can) {
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
	can.extend(can.Map.prototype, {

		backup: function () {
			this._backupStore = this._attrs();
			return this;
		},
		isDirty: function (checkAssociations) {
			return this._backupStore && !can.Object.same(this._attrs(), this._backupStore, undefined, undefined, undefined, !! checkAssociations);
		},
		restore: function (restoreAssociations) {
			var props = restoreAssociations ? this._backupStore : flatProps(this._backupStore, this);
			if (this.isDirty(restoreAssociations)) {
				this._attrs(props, true);
			}
			return this;
		}
	});
	return can.Map;
});
