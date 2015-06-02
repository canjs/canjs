steal('can/compute', 'can/util', 'can/list', function () {
	
	var setup = can.Map.prototype.setup;

	var DerivedMap = can.Map.extend({},
	{
		_bindsetup: function () {
			var self = this; 

			this._indexKeys(this._source._getKeys());
			
			this._source.bind('change', function (ev, attr, how) {
				if (how === 'add') {
					self._indexKeys([attr]);
				} else if (how === 'remove') {
					// TODO: Remove bindings
				}
			});
		},
		_indexKeys: function (keys) {
			var self = this;

			can.each(keys, function (key) {
				var meta = self._getMeta(key);

				// Update the derived list when the key/value changes
				meta.value.bind('change', self._makeValueChangeHandler(meta));
				meta.key.bind('change', self._makeKeyChangeHandler(meta));
				
				// Manually set the initial values
				self.attr(meta.key(), meta.value());
			});
		},
		_makeKeyChangeHandler: function (meta) {
			return can.proxy(function (ev, newVal, oldVal) {
				this.removeAttr(oldVal);
				this.attr(newVal, meta.value());
			}, this);
		},
		_makeValueChangeHandler: function (meta) {
			return can.proxy(function (ev, newVal) {
				this.attr(meta.key(), newVal);
			}, this);
		},
		_getMeta: function (key) {
			var sourceKey = can.compute(key);
			
			var meta = {
				sourceKey: sourceKey,
				key: can.compute(function () {
					var key = sourceKey();
					var result = this._keyFn(this._source.attr(key), key);
					return result; 
				}, this),
				value: can.compute(function () {
					var key = sourceKey();
					var result = this._valueFn(this._source.attr(key), key);
					return result;
				}, this),
			};

			return meta;
		},
		setup: function (source, keyFn, valueFn) {
			this._source = source;
			this._meta = []; 

			// TODO: Figure out how to make these computes without 
			// them being considered values in the Map/List. 
			// Also, how can you change the function a map is based on?
			this._keyFn = keyFn || function (item, key) { return key; };
			this._valueFn = valueFn || function (item) { return item; };

			return setup.apply(this);
		}
	});

	var DerivedList = DerivedMap.extend({},
	{
		_bindsetup: function () {
			var self = this; 

			this._indexKeys(this._source._getKeys());
			
			this._source.bind('add', function (ev, newItems, index) {
				self._indexKeys(this._getKeys.call(newItems));
			});
		},
	});

	// Public API
	can.extend(can.Map.prototype, {
		_getKeys: function () {
			var keys = []; 

			this.each(function (value, key) {
				keys.push(key);
			});
			
			return keys;
		},
		deriveMap: function (keyFn, valueFn) {
			return new DerivedMap(this, keyFn, valueFn);
		},
		deriveList: function (keyFn, valueFn) {
			return new DerivedList(this, keyFn, valueFn);
		}
	}); 
});