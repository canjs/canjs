steal('can/util', 'can/map', function (can) {
	var ShadowMap = function (obj, map, shadow) {
		this._map = map;
		this._data = obj;
		this._shadowed = shadow;
	};

	var helpers = ShadowMap.helpers = {
		/**
		 * Visits each Map in a nested object structure.
		 *
		 * @param obj
		 * @param callback
		 * @param path
		 * @private
		 */
		visitMaps: function (obj, callback, path) {
			path = path || [];
			can.each(obj, function (value, key) {
				// If the value is something we can iterate over (array or object-like)
				if (can.isArray(value) || typeof value === 'object') {
					var currentPath = path.concat([key]);
					// If not already a map, go into nested object
					if (!(value instanceof can.Map)) {
						helpers.visitMaps(value, callback, currentPath);
					} else {
						// Call back with map and current path
						callback(value, currentPath, obj);
					}
				}
			});
		},

		/**
		 * Returns the path as a string
		 *
		 * @param path
		 * @returns {*}
		 */
		pathString: function (path) {
			return typeof path === 'string' ? path : path.join('.');
		},

		/**
		 * Returns the path as an array.
		 *
		 * @param path
		 * @returns {Array}
		 */
		getPath: function (path) {
			return can.Map.helpers.attrParts(path).slice(0);
		}
	};

	can.extend(ShadowMap.prototype, {
		hookup: function (child, path) {
			if (!child) {
				// Hook up all our initial data
				this._shadowed = {};
				helpers.visitMaps(this._data, can.proxy(this.hookup, this));
			} else {
				// Hook up bubbling between our root map and the child
				var pathName = helpers.pathString(path);
				this.add.apply(this, arguments);
				can.Map.helpers.hookupBubble(child, pathName, this._map);
			}

			return this;
		},

		/**
		 * Remove listeners from the root map to this child or all
		 * references if no child is passed.
		 *
		 * @param {Map|undefined} child The child map to unbind.
		 */
		unhookup: function (child) {
			if (!child) {
				// Teardown all references and bindings between the roo map and all shadowed maps
				helpers.visitMaps(this._shadowed, can.proxy(this.unhookup, this));
				this._shadowed = {};
			} else {
				// Unhookup the child from our root map
				can.Map.helpers.unhookup([child], this._map);
			}

			return this;
		},

		makeObserve: function(value) {
			return this._map.makeObserve(value);
		},

		/**
		 * Add a map to the shadow tree for a given path.
		 *
		 * @param map
		 * @param path
		 */
		add: function (map, path) {
			var currentPath = helpers.getPath(path);
			var current = this._shadowed;
			var currentData = this._data;
			var prop = currentPath.shift();

			while (currentPath.length) {
				if (!current[prop]) {
					current[prop] = can.isArray(currentData[prop]) ? new Array(currentData[prop].length) : {};
				}

				current = current[prop];
				currentData = currentData[prop];

				prop = currentPath.shift();
			}

			current[prop] = map;

			return map;
		},

		walk: function (path) {
			var currentPath = helpers.getPath(path);
			var currentData = this._data;
			var currentShadow = this._shadowed;
			var prop = currentPath.shift();

			while (prop) {
				if (typeof currentData === 'undefined') {
					throw new Error('can.LazyMap: Property does not exist');
				}

				currentData = currentData[prop];
				currentShadow = currentShadow && currentShadow[prop];

				if (currentShadow instanceof can.Map) {
					return {
						data: currentShadow._get(helpers.pathString(currentPath)),
						shadow: currentShadow,
						remaining: currentPath
					};
				}

				prop = currentPath.shift();
			}

			return {
				data: currentData,
				shadow: currentShadow,
				remaining: currentPath
			};
		},

		/**
		 * Returns the parent for a given path.
		 *
		 * @param {String|Array} path The path to use
		 * @returns {*} The parent
		 */
		getParent: function (path) {
			path = helpers.getPath(path);
			return this.get(path.slice(0, path.length - 1));
		},

		/**
		 * Returns the value for a given path.
		 *
		 * @param path
		 * @returns {*}
		 */
		get: function (path) {
			return this.walk(path).data;
		},

		// Converts the value on this path, if it hasn't been converted yet
		replace: function(path) {
			var current = this.walk(path);
			if(current.shadow) {
				return current.shadow;
			}

			this.removeAttr(path);

			return this.add(this.makeObserve(current.data), path);
		},

		set: function (path, value) {
			var currentPath = helpers.getPath(path);
			var current = this.walk(currentPath);
			if (current.remaining.length) {
				current.shadow._set(helpers.getPath(current.remaining), value);
				return this;
			}


			if (!can.Map.helpers.canMakeObserve(value)) {
				// If we can't turn the value into an Observe we need to got up to the parent
				var prop = currentPath.pop();
				// Convert it
				var map = this.replace(currentPath);
				// And set the property
				map._set(prop, value);
			} else {
				// Otherwise we convert this into an observe and add it
				this.add(this.makeObserve(value), currentPath);
			}
		},

		removeAttr: function (path) {
			var currentPath = helpers.getPath(path);
			var prop = currentPath.pop();
			var current = this.walk(currentPath);

			// If we are tracking maps within this path
			if (current.shadow) {
				// Unhook them all
				helpers.visitMaps(current.shadow, can.proxy(this.unhookup, this));

				// Then splice or remove that data out
				if (can.isArray(current.shadow)) {
					current.shadow.splice(prop, 1);
				} else {
					delete current.shadow[prop];
				}
			}

			// Remove from the actual data
			if (can.isArray(current.data)) {
				current.data.splice(prop, 1);
			} else {
				delete current.data[prop];
			}
		}
	});

	return ShadowMap;
});
