steal('can/util', 'can/map', function (can) {
	var MapReference = function (obj, map) {
		this._references = {};
		this._map = map;
		this._data = obj;
	};

	var helpers = MapReference.helpers = {
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
						callback(value, currentPath);
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

	can.extend(MapReference.prototype, {
		/**
		 * Add a new reference for a given path and set up bubbling.
		 *
		 * @param {can.Map} map
		 * @param {String|Array} path The path for this reference
		 */
		hookup: function (map, path) {
			if(!map) {
				// Hook everything up, clear references
				this.references = {};
				helpers.visitMaps(this._data, can.proxy(this.hookup, this));
			} else {
				// Add a reference and hook up bubbling
				var pathName = helpers.pathString(path);
				this._references[pathName] = map;
				can.Map.helpers.hookupBubble(map, pathName, this._map);
			}

			return this;
		},

		/**
		 * Remove listeners from the root map to this child or all
		 * references if no child is passed.
		 *
		 * @param {Map|undefined} child The child map to unbind.
		 */
		unhookup: function(child) {
			if(!child) {
				// Teardown all references
				can.each(this._references, can.proxy(this.unhookup, this));
			} else {
				// Unhookup the child from our root map
				can.Map.helpers.unhookup([child], this._map);
			}

			return this;
		},

		/**
		 * Returns the closest Map for the given path and the remaining path.
		 *
		 * @param {String|Array} path The path to search
		 */
		closest: function(path) {
			var currentPath = helpers.getPath(path);
			var prop = currentPath.shift();
			var current = this._data[prop];
			while(prop && !(current instanceof can.Map)) {
				prop = currentPath.shift();
				current = current[prop];
			}
			return {
				map: current,
				remaining: currentPath
			};
		},

		/**
		 * Remove all children and references from data for a given path.
		 *
		 * @param path
		 */
		removeChildren: function (path) {
			path = helpers.getPath(path);

			var refs = this._references;
			var parent = this.getParent(path);
			var lastProperty = path[path.length - 1];
			var value = parent instanceof can.Map ? parent.attr(lastProperty) : parent[lastProperty];

			// In an array we have to hookup everything again so go up one more in our path
			// to remove all references
			if(can.isArray(parent)) {
				path.pop();
			}

			for (var prop in refs) {
				// If a reference is within that path, remove listeners and delete it from
				// our reference store
				if (prop.indexOf(helpers.pathString(path)) === 0) {
					this.unhookup(refs[prop]);
					delete refs[prop];
				}
			}

			// Now delete the actual properties. Use removeAttr if the parent is a map
			if (parent instanceof can.Map) {
				parent.removeAttr(lastProperty);
			} else if(can.isArray(parent)) {
				// Splice if the parent is an array
				parent.splice(lastProperty, 1);
				// Re-initialize reference mappings for the entire array
				helpers.visitMaps(parent, can.proxy(this.hookup, this), path);
			} else {
				// Just delete it otherwise
				delete parent[lastProperty];
			}

			return {
				path: path,
				value: value,
				parent: parent,
				prop: lastProperty
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
			var currentPath = helpers.getPath(path);
			var current = this._data;
			var prop = currentPath.shift();

			while (prop) {
				if (typeof current === 'undefined') {
					throw new Error('can.LazyMap: Property does not exist');
				}

				current = current[prop];

				// If we have a map, use its .attr and return it
				if (current instanceof can.Map) {
					return current._get(helpers.pathString(currentPath));
				}

				prop = currentPath.shift();
			}

			return current;
		},

		insert: function(path, converter) {

		},

		/**
		 * Convert an existing value at the given path using a converter function and replaces it.
		 * Removes all existing references and child properties down this path.
		 *
		 * @param {String|Array} path The path to use
		 * @param {Function} converter A converter function that gets the old value and
		 * current path passed and returns the converted object that should be inserted.
		 */
		replace: function (path, converter) {
			var currentPath = helpers.getPath(path);
			var value = this.get(currentPath);
			var parent = this.getParent(currentPath);

			// If we can't turn this value into something observable
			// we have to walk up to the parent
			if (!can.Map.helpers.canMakeObserve(value)) {
				currentPath.pop();
				value = parent;
				parent = this.getParent(currentPath);
			}

			// The current property name where parent[prop] === value
			var prop = currentPath[currentPath.length - 1];
			var converted = converter(value, currentPath);

			// Delete all children from the current path
			this.removeChildren(currentPath);
			// Hook the converted value up
			this.hookup(converted, currentPath);

			// Assign the converted value to the parent. Use .attr if it is available
			if (parent instanceof can.Map) {
				parent.attr(prop, converted);
			} else {
				parent[prop] = converted;
			}

			return converted;
		}
	});

	return MapReference;
});
