steal('can/util', 'can/map', './map-reference.js', function (can, Map, MapReference) {
	can.LazyMap = can.Map.extend({
		setup: function (obj) {
			can.cid(this, ".map");
			// Sets all `attrs`.
			this._init = 1;
			this._setupComputes();
			var teardownMapping = obj && can.Map.helpers.addToMap(obj, this);
			this._data = can.extend(can.extend(true, {}, this.constructor.defaults || {}), obj);

			if (teardownMapping) {
				teardownMapping();
			}

			this._references = new MapReference(this._data, this);
			this.bind('change', can.proxy(this._changes, this));
			delete this._init;
		},

		_bindsetup: function() {
			this._references.hookup();
		},

		_bindteardown: function () {
			this._references.unhookup();
		}
	});
});
