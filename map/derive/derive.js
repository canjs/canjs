steal('can/compute', 'can/util', 'can/list', function () {
	
	var mixin = function (proto, props) {
		return can.extend({
			_bindsetup: function () {
				var self = this; 

				this._indexKeys(can.Map.keys(this._source));
				
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
				var _meta = [];

				can.each(keys, function (key) {
					var meta = self._getMeta(key);

					// Update the derived list when the key/value changes
					meta.key.bind('change', function (ev, newKey, oldKey) {
						// self._updateKey(meta, oldKey);
						self._updateKeyAndLog(meta, oldKey);
					});
					meta.value.bind('change', function () {
						// self._updateValue(meta);
						self._updateValueAndLog(meta);
					});
					
					// Manually set the initial values
					// self._updateKey(meta);
					self._updateKeyAndLog(meta);

					self._saveMeta(meta);
				});

				return _meta;
			},
			_saveMeta: function (meta) {
				this._meta[meta.sourceKey()] = meta;
			},
			_updateKeyAndLog: function (meta, oldKey) {
				console.log('Update:', oldKey, '>', meta.key(), '=', meta.value());
				if (meta.key() === meta.value()) {
				}
				this._updateKey(meta, oldKey);
				console.log('Result:', this.attr());
			},
			_updateValueAndLog: function (meta) {
				console.log('Set:', meta.key(), meta.value());
				this._updateValue(meta);
				console.log('Result:', this.attr());
			},
			_updateKey: function (meta, oldKey) {
				var key = meta.key();
				var value = meta.value();

				if (!! oldKey || oldKey === 0) {
					this.removeAttr(oldKey);
				}
				
				// Only allow truthy keys to be set, or 0 (int)
				if (!! key || key === 0) {
					this.attr(key, value);
				}
			},
			_updateValue: function (meta) {
				var key = meta.key();
				
				if (!! key || key === 0) {
					this.attr(meta.key(), meta.value());
				}
			},
			_getMeta: function (key) {
				var sourceKey = can.compute(key);

				// Keep this out of the compute so that changes to the list
				// don't force the compute to re-evalaute
				
				var derivedValue = can.compute(function () {
					var i = sourceKey();
					var item;

					// TODO: Find a MUCH more elegant way to do this
					if (this instanceof can.List) {
						item = this._source[sourceKey()];
					} else {
						item = this._source.attr(sourceKey());
					}

					var result = this._valueFn(item, i);
					return result;
				}, this);
				
				var derivedKeyValue = can.compute(function () {
					var i = sourceKey();
					var mappedKey = this._keyFn(derivedValue(), i);
					var derivedKey = this._deriveKey.call(this, mappedKey, i);
					return derivedKey; 
				}, this);

				var meta = {
					sourceKey: sourceKey,
					key: derivedKeyValue,
					value: derivedValue
				};
				return meta;
			},
			_deriveKey: function (mappedKey, sourceKey) {
				if (typeof mappedKey !== 'boolean') {
					// Convert to a string
					return '' + mappedKey;
				}

				// Only allow setting booleans to `false` on Maps
				return ! mappedKey ? undefined : sourceKey;
			},
			_getMetaObject: function () {
				return {};
			},
			setup: function (source, keyFn, valueFn) {
				this._source = source;
				this._meta = this._getMetaObject(); 

				// TODO: Figure out how to make these computes without 
				// them being considered values in the Map/List. 
				// Also, how can you change the function a map is based on?
				this._keyFn = keyFn || function (item, key) { return key; };
				this._valueFn = valueFn || function (item) { return item; };

				return proto.setup.apply(this);
			}
		}, props);
	};

	var DerivedMap = can.Map.extend({}, mixin(can.Map.prototype));

	var DerivedList = can.List.extend({}, mixin(can.List.prototype, {
		_saveMeta: function (meta) {
			this._meta.splice(meta.sourceKey(), 0, meta);
		},
		_deriveKey: function (mappedIndex, sourceIndex) {
			if (typeof mappedIndex === 'boolean') {
				return mappedIndex ? this._mapIndex.apply(this, [sourceIndex]) : undefined;
			} else {
				return +mappedIndex; // Convert to an int
			}
		},
		_mapIndex: function (comparedSourceIndex) {
			var self = this;
			var mapping = {};
			var maxPreIndex = 0;
			var preItemMeta;
			var key; 

			can.each(this._meta, function (itemMeta) {
				var itemSourceIndex = itemMeta.sourceKey();
				var val = self._source.attr(itemSourceIndex);
				if (typeof itemMeta.key() === 'undefined') {
					return;
				}

				if (itemSourceIndex < comparedSourceIndex && itemSourceIndex > maxPreIndex) {
					maxPreIndex = itemSourceIndex;
				}

				mapping[itemSourceIndex] = itemMeta.key();
			});

			var index = typeof mapping[maxPreIndex] !== 'undefined' ? mapping[maxPreIndex] + 1 : 0;
			return index;
		},
		_updateKey: function (meta, oldVal) { 
			var key = meta.key();
			var value = meta.value(); 

			if (oldVal) {
				this.splice(oldVal, 1);
			}
			
			if (typeof key !== 'undefined') {
				this.splice(key, 0, value);
			}
		},
		_bindsetup: function () {
			var self = this;

			this._indexKeys(this._source.keys());
			
			this._source.bind('add', function (ev, newItems, index) {
				self._indexKeys(this.keys.call(newItems, index));
			});
		},
		_getMetaObject: function () {
			return [];
		},
	}));

	// Public API changes
	can.extend(can.Map.prototype, {
		deriveMap: function (keyFn, valueFn) {
			return new DerivedMap(this, keyFn, valueFn);
		},
		deriveList: function (keyFn, valueFn) {
			return new DerivedList(this, keyFn, valueFn);
		}
	}); 

	can.extend(can.List.prototype, {
		keys: function (offset) {
			var keys = []; 
			offset = typeof offset === 'number' ? offset : 0;

			this.forEach(function (item, i) {
				keys.push(i + offset);
			});

			return keys;
		}
	});
});