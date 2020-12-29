var assert = require("assert");
var stealExport = require("../lib/build/export");
var rmdir = require("rimraf");
var testHelpers = require("./helpers");

var find = testHelpers.find;
var open = testHelpers.open;


describe("+standalone", function(){
	it("Works with exporting a module from a dependency", function(done){
		this.timeout(10000);
		stealExport({
			system: {
				config: __dirname+"/exports_basics/package.json!npm"
			},
			options: { quiet: true },
			"outputs": {
				"+standalone": {
					exports: {
						"foo": "FOO.foo"
					},
					dest: __dirname + "/exports_basics/out.js"
				}
			}
		})
		.then(function() {
			open("test/exports_basics/global.html",
				 function(browser, close) {
				find(browser,"FOO", function(foo){
					assert.equal(foo.foo.bar.name, "bar", "it worked");
					close();
				}, close);
			}, done);
		}, done);
	});

	it("Works when using dest as a function", function(done){
		this.timeout(10000);

		stealExport({
			system: {
				config: __dirname + "/exports_basics/package.json!npm"
			},
			options: { quiet: true },
			outputs: {
				"+standalone": {
					exports: { "foo": "FOO.foo" },
					dest: function(){
						return __dirname + "/exports_basics/out.js"
					}
				}
			}
		})
		.then(function(){
			open("test/exports_basics/global.html",
				 function(browser, close) {
				find(browser,"FOO", function(foo){
					assert.equal(foo.foo.bar.name, "bar", "it worked");
					close();
				}, close);
			}, done);
		});
	});
});
