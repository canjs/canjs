"format global";


var get = function(url, cb){
	console.log(url);
	function reqListener () {
		cb(this.responseText);
	}

	var oReq = new XMLHttpRequest();
	oReq.onload = reqListener;
	oReq.open("get", url, true);
	oReq.send();
};

var amdExports = amd({});

var getAMDDeps = function(source){
	var deps = [];
	amdExports.getDefs(source, function(def){
		deps = deps.concat(def.deps);
	});
	return deps;
};

QUnit.module("system-amd-parse plugin");

asyncTest("Basics works", function(){
	get("basics.js", function(basics){
		deepEqual( getAMDDeps(basics), ["foo","bar"]);
		start();
	});
});

asyncTest("named basics works", function(){
	get("named.js", function(basics){
		deepEqual( getAMDDeps(basics), ["foo","bar","car"]);
		start();
	});
});

asyncTest("empty deps works", function(){
	get("empty-deps.js", function(basics){
		deepEqual( getAMDDeps(basics), []);
		start();
	});
});

asyncTest("no deps works", function(){
	get("no-deps.js", function(basics){
		deepEqual( getAMDDeps(basics), []);
		start();
	});
});

asyncTest("named export object", function(){
	get("named-obj.js", function(basics){
		deepEqual( getAMDDeps(basics), []);
		start();
	});
});

asyncTest("cjs dependencies", function(){
	get("cjs-deps.js", function(basics){
		deepEqual( getAMDDeps(basics), ["foo","bar"]);
		start();
	});
});

asyncTest("cjs dependencies", function(){
	get("cjs-deps-named-function.js", function(basics){
		deepEqual( getAMDDeps(basics), ["foo","bar"]);
		start();
	});
});

asyncTest("cjs require dependency", function(){
	get("cjs-require-dep.js", function(basics){
		deepEqual( getAMDDeps(basics), ["zed","foo","bar"]);
		start();
	});
});

asyncTest("bundles", function(){
	get("bundle.js", function(basics){
		deepEqual( getAMDDeps(basics), ["a-1", "b-1","a-2", "b-2","b-3", "b-4"]);
		start();
	});
});

asyncTest("empty obj", function(){
	get("empty-obj.js", function(basics){
		deepEqual( getAMDDeps(basics), []);
		start();
	});
});

asyncTest("empty variable", function(){
	get("empty-variable.js", function(basics){
		deepEqual( getAMDDeps(basics), []);
		start();
	});
});

asyncTest("UMD with multiple defines", function(){
  get("umd-ish.js", function(source){
    var load = { name: "umd-ish", source: source };
    amdExports.processSource({}, load);
    ok(true, "did not throw");
    start();
  });
});


QUnit.start();
