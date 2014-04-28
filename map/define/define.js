steal('can/util', 'can/observe', function (can) {


	can.Map.helpers.define = function (Map) {
		var define = Map.prototype.define;
		Map.defaultGenerators = {};
		for (var prop in define) {
			if ("value" in define[prop]) {
				if (typeof define[prop].value === "function") {
					Map.defaultGenerators[prop] = define[prop].value;
				} else {
					Map.defaults[prop] = define[prop].value;
				}
			}
			if (typeof define[prop].Value === "function") {
				(function (Constructor) {
					Map.defaultGenerators[prop] = function () {
						return new Constructor();
					};
				})(define[prop].Value);
			}
		}
	};


	var oldSetupDefaults = can.Map.prototype._setupDefaults;
	can.Map.prototype._setupDefaults = function () {
		var defaults = oldSetupDefaults.call(this),
			Map = this.constructor;
		for (var prop in Map.defaultGenerators) {
			defaults[prop] = Map.defaultGenerators[prop].call(this);
		}
		return defaults;
	};


	var proto = can.Map.prototype,
		oldSet = proto.__set;
	proto.__set = function (prop, value, current, success, error) {
		//!steal-remove-start
		var asyncTimer;
		//!steal-remove-end

		// check if there's a setter
		var errorCallback = function (errors) {
				//!steal-remove-start
				clearTimeout(asyncTimer);
				//!steal-remove-end

				var stub = error && error.call(self, errors);
				// if 'validations' is on the page it will trigger
				// the error itself and we dont want to trigger
				// the event twice. :)
				if (stub !== false) {
					can.trigger(self, 'error', [
						prop,
						errors
					], true);
				}
				return false;
			},
			self = this,
			define = this.define && this.define[prop],
			setter = define && define.set,
			getter = define && define.get;


		// if we have a setter
		if (setter) {
			// call the setter, if returned value is undefined,
			// this means the setter is async so we
			// do not call update property and return right away
			can.batch.start();
			var setterCalled = false,

				setValue = setter.call(this, value, function (value) {
					oldSet.call(self, prop, value, current, success, errorCallback);
					setterCalled = true;
					//!steal-remove-start
					clearTimeout(asyncTimer);
					//!steal-remove-end
				}, errorCallback);
			if (getter) {
				// if there's a getter we do nothing
				can.batch.stop();
				return;
			}
			// if it took a setter and returned nothing, don't set the value
			else if (setValue === undefined && !setterCalled && setter.length >= 2) {
				//!steal-remove-start
				asyncTimer = setTimeout(function () {
					can.dev.warn('can/map/setter.js: Setter "' + prop + '" did not return a value or call the setter callback.');
				}, can.dev.warnTimeout);
				//!steal-remove-end
				can.batch.stop();
				return;
			} else {
				if (!setterCalled) {
					oldSet.call(self, prop,
						// if no arguments, we are side-effects only
						setter.length === 0 && setValue === undefined ? value : setValue,
						current,
						success,
						errorCallback);
				}
				can.batch.stop();
				return this;
			}

		} else {
			oldSet.call(self, prop, value, current, success, errorCallback);
		}

		return this;
	};

	var converters = {
		'date': function (str) {
			var type = typeof str;
			if (type === 'string') {
				str = Date.parse(str);
				return isNaN(str) ? null : new Date(str);
			} else if (type === 'number') {
				return new Date(str);
			} else {
				return str;
			}
		},
		'number': function (val) {
			return parseFloat(val);
		},
		'boolean': function (val) {
			if (val === 'false' || val === '0' || !val) {
				return false;
			}
			return true;
		},
		'*': function (val) {
			return val;
		},
		'string': function (val) {
			return '' + val;
		}
	};

	// the old type sets up bubbling
	var oldType = proto.__type;
	proto.__type = function (value, prop) {
		var def = this.define && this.define[prop],
			type = def && def.type,
			Type = def && def.Type,
			newValue = value;

		if (typeof type === "string") {
			type = converters[type];
		}

		if (type || Type) {
			// If there's a type, convert it.
			if (type) {
				newValue = type.call(this, newValue, prop);
			}
			// If there's a Type create a new instance of it
			if (Type && !(newValue instanceof Type)) {
				newValue = new Type(newValue);
			}
			// If the newValue is a Map, we need to hook it up
			return newValue;

		}
		return oldType.call(this, newValue, prop);
	};

	var oldRemove = proto._remove;
	proto._remove = function (prop, current) {
		var remove = this.define && this.define[prop] && this.define[prop].remove,
			res;
		if (remove) {
			can.batch.start();
			res = remove.call(this, current);

			if (res === false) {
				can.batch.stop();
				return;
			} else {

				res = oldRemove.call(this, prop, current);
				can.batch.stop();
				return res;
			}
		}
		return oldRemove.call(this, prop, current);
	};

	var oldSetupComputes = proto._setupComputes;
	proto._setupComputes = function () {
		oldSetupComputes.apply(this, arguments);
		for (var attr in this.define) {
			var def = this.define[attr],
				get = def.get;
			if (get) {
				this[attr] = can.compute.async(def.value, get, this);
				this._computedBindings[attr] = {
					count: 0
				};
			}
		}
	};
	return can.Map;
});
