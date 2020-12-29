	if( isNode && !isNW ) {
		require('steal-systemjs');

		global.steal = makeSteal(System);
		global.steal.System = System;
		global.steal.dev = require("./ext/dev.js");
		steal.clone = cloneSteal;
		module.exports = global.steal;
		global.steal.addSteal = addSteal;
		require("system-json");

	} else {
		var oldSteal = global.steal;
		global.steal = makeSteal(System);
		global.steal.startup(oldSteal && typeof oldSteal == 'object' && oldSteal)
			.then(null, function(error){
				if(typeof console !== "undefined") {
					// Hide from uglify
					var c = console;
					var type = c.error ? "error" : "log";
					c[type](error, error.stack);
				}
			});
		global.steal.clone = cloneSteal;
		global.steal.addSteal = addSteal;
	}

})(typeof window == "undefined" ? (typeof global === "undefined" ? this : global) : window);
