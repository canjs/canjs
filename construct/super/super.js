steal('can/util', 'can/construct', function (can, Construct) {
	// tests if we can get super in .toString()
	var isFunction = can.isFunction,
		fnTest = /xyz/.test(function () {
			return this.xyz;
		}) ? /\b_super\b/ : /.*/,
		getset = ['get', 'set'],
		getSuper = function (base, name, fn) {
			return function () {
				var tmp = this._super,
					ret;
				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = base[name];
				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				ret = fn.apply(this, arguments);
				this._super = tmp;
				return ret;
			};
		};

	can.Construct._defineProperty = function(addTo, base, name, descriptor) {
		var _super = Object.getOwnPropertyDescriptor(base, name);
		if(_super) {
			can.each(getset, function (method) {
				if(isFunction(_super[method]) && isFunction(descriptor[method])) {
					descriptor[method] = getSuper(_super, method, descriptor[method]);
				} else if(!isFunction(descriptor[method])) {
					descriptor[method] = _super[method];
				}
			});
		}

		Object.defineProperty(addTo, name, descriptor);
	};

	// overwrites a single property so it can still call super
	can.Construct._overwrite = function (addTo, base, name, val) {
		// Check if we're overwriting an existing function
		addTo[name] = isFunction(val) && isFunction(base[name]) && fnTest.test(val) ?
			getSuper(base, name, val) : val;
	};
	return can;
});
