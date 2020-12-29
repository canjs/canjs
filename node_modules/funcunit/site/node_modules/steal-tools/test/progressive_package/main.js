require("dep1");

System.import("bundleA").then(function(a){
	System.import("bundleB").then(function(b){
		window.MODULE = {
			a: a,
			b: b,
			foo: System.FOO
		};

		if(System.isEnv("development")) {
			console.log("bundles loaded", window.MODULE);
		}
	});
});
