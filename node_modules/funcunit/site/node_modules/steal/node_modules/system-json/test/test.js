"format global";

QUnit.module("system-json plugin");

asyncTest("Basics works", function(){
	System.import("test/my.json").then(function(my){
		equal(my.name, "foo", "name is right");
	}).then(start);
});

QUnit.module("jsonOptions");

asyncTest("transform allows you to transform the json object", function(){
	System.jsonOptions = {
		transform: function(load, data){
			delete data.priv;
			return data;
		}
	};

	System.import("test/another.json").then(function(a){
		ok(!a.priv, "Private field excluded");
	}).then(start);
});


QUnit.start();
