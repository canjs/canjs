steal('sourcemaps/module', './styles.less!', function(module){

	steal.dev.assert(true);
	
	if(window.QUnit) {
		QUnit.ok(module, "got basics/module");
		QUnit.equal(module.name, "module", "module name is right");
		
		QUnit.equal(module.es6module.name, "es6Module", "steal loads ES6");
		
		QUnit.equal(module.es6module.amdModule.name, "amdmodule", "ES6 loads amd");
		
		QUnit.start();
		removeMyself();
	} else {
		window.MODULE = module;
	}

	steal.dev.assert(true);
	
});
