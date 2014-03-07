steal('can/util', 'can/map', './shadow_map.js', function (can, Map, ShadowMap) {
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

			this._shadow = new ShadowMap(this._data, this);
			this.bind('change', can.proxy(this._changes, this));
			delete this._init;
		},

		makeObserve: function (child) {
			if (child instanceof can.Map) {
				// We have an `observe` already...
				// Make sure it is not listening to this already
				// It's only listening if it has bindings already.
				if (this._bindings) {
					can.Map.helpers.unhookup([child], this._cid);
				}
			} else if (can.isArray(child)) {
				// else if array create LazyList
				child = new can.LazyList(child);
			} else if (can.Map.helpers.canMakeObserve(child)) {
				// or try to make LazyMap
				child = new can.LazyMap(child);
			}
			return child;
		},

		_bindsetup: function () {
			this._shadow.hookup();
		},

		_bindteardown: function () {
			this._shadow.unhookup();
		},

		removeAttr: function (attr) {
			var data = this._shadow.removeAttr(attr);
			if (can.isArray(data.parent)) {
				this._triggerChange(attr, "remove", undefined, [this.makeObserve(data.value)]);
			} else if (typeof data.value !== 'undefined') { // do not trigger if prop does not exists
				can.batch.trigger(this, data.path.length ? data.path.join(".") + ".__keys" : "__keys");
				this._triggerChange(attr, "remove", undefined, new can.LazyMap(data.value, this));
			}
		},

		_get: function (attr) {
			return this._shadow.replace(attr);
		}
	});

	return can.LazyMap;
});
