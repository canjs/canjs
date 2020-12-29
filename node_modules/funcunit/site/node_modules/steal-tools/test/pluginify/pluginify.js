steal('basics/module', './common.js', './global.js', function(module, cjs, global){
	
	window.RESULT = {
		name: "pluginified",
		module: module,
		cjs: cjs,
		global: global
	};

	
});
