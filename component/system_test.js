var QUnit = require("steal-qunit");
var loader = require("@loader");

QUnit.module("can/component/component/system");

test("Basics works", function(){
	expect(1);

	loader.import("can/component/examples/hello-world.component!").then(function(r){
		ok("Loaded successfully");
		start();
	});
	stop();
});

test("from works", function(){
	expect(1);

	loader.import("can/component/examples/frankenstein.component!").then(function(r){
		equal(typeof r.viewModel, "function", "external viewModel was loaded");
		start();
	});
	stop();
});
