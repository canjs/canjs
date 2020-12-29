var slimLoader = require("steal-css/slim");
var QUnit = require("steal-qunit");

QUnit.module("slim");

QUnit.test("Only adds links if not already in the page", function(assert){
	var done = assert.async();

	var config = {
		bundles: {
			"1": 2
		},
		paths: {
			"2": "dist/foo.css"
		}
	};

	Promise.all([
		slimLoader(1, config),
		slimLoader(1, config)
	])
	.then(function(){
		var ss = document.styleSheets;
		var foos = Array.prototype.slice.call(ss).filter(function(link){
			return /foo/.test(link.href);
		});

		assert.equal(foos.length, 1, "There is only 1 link");
	})
	.then(done);
});
