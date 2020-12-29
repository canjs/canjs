"use strict";
module.exports = {
	observable: function(fn, options) {
		return function() {
			var ret = fn.apply(this, arguments);
			if (ret && typeof ret === "object") {
				ret = options.observe(ret);
			}
			return ret;
		};
	}
};