(function(global) {

	global.globalModule = "This is a global module";

	if(typeof define === "function") {
		define(function() {
			return global.globalModule;
		});
	}

})(window);
