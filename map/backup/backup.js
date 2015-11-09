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

		backup: function (options) {

			options = options || {}

			if (options === true){
				options = {serialize: true, removeAttr: false}
			}
			if (typeof options === 'string'){
				options = {fn: options, removeAttr: false}
			}
			options.fn = options.fn || (options.serialize ? 'serialize' : 'attr')
			options.removeAttr = options.removeAttr === undefined ? true : options.removeAttr

			this._backupStore.options = can.extend({}, options)
			this._backupStore(this[options.fn]());
			return this;
		},
		isDirty: function (checkAssociations) {
			var options = this._backupStore.options
			return this._backupStore() && !can.Object.same(this[options.fn](), this._backupStore(), undefined, undefined, undefined, !! checkAssociations);
		},
		restore: function (restoreAssociations) {
			var options = this._backupStore.options
			var props = restoreAssociations ? this._backupStore() : flatProps(this._backupStore(), this);
			if (this.isDirty(restoreAssociations)) {
				this.attr(props, options.removeAttr);
			}
			return this;
		}
	});
	return can.Map;
});
