define("@config", ["@loader"], function(loader) {
loader.config({
	envs: {
		"window-production": {
			meta: {
				"jquerty": {
					exports: "jQuerty"
				}
			}
		}
	}
});
});
System.define("jquerty","window.jQuerty = {name: 'jQuerty'}")
define("bar", ["jquerty"],function(jquerty){
	return {
		name: "bar",
		jquerty: jquerty
	};
});
define("foo",["bar", "@loader"], function(bar, loader){
	if(typeof window !== "undefined" && window.QUnit) {
		QUnit.ok(bar, "got basics/module");
		QUnit.equal(bar.name, "bar", "module name is right");

		QUnit.equal(bar.jquerty.name, "jQuerty", "got global");

		// envs
		QUnit.equal(loader.isEnv("production"), true, "This is production");
		QUnit.equal(loader.isPlatform("window"), true, "This is the window");

		QUnit.start();
		removeMyself();
		return {};
	} else {
		console.log("basics loaded", bar);
	}
});



