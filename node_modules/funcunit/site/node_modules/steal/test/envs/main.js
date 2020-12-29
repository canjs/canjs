define(['@loader','mod'], function(loader,module){

	if(typeof window !== "undefined" && window.QUnit) {
		QUnit.ok(module, "got envs/mod");
		QUnit.equal(module.name, "module", "module name is right");
		QUnit.equal(loader.FOO, "bar", "config dep's env settings are not overwrite");
		QUnit.equal(loader.isEnv("staging"), true, "isEnv works");
		QUnit.equal(loader.isPlatform("window"), true, "Is a browser window");

		QUnit.equal(loader.map.mod, "other", "main config's map is applied");
		QUnit.equal(loader.map.something, "else", "dep config's map is applied");

		QUnit.start();
		removeMyself();
	} else {
		console.log("envs loaded", module);
	}

});
