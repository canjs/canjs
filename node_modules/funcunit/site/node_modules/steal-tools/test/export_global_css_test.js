var assert = require("assert");
var stealExport = require("../lib/build/export");
var rmdir = require("rimraf");
var testHelpers = require("./helpers");

var find = testHelpers.find;
var open = testHelpers.open;

describe("+global-css", function(){
	it("Builds even if there is no css", function(done){
		rmdir(__dirname + "/exports_basics/dist", function(err){
			if(err) return done(err);

			stealExport({
				system: {
					config: __dirname + "/exports_basics/package.json!npm",
					main: "app/main-no-css"
				},
				options: { quiet: true },
				outputs: {
					"+global-css": {},
					"+global-js": {
						exports: {
							"app/main-no-css": "MOD"
						}
					}
				}
			}).then(function(){
				open("test/exports_basics/prod-no-css.html",
					function(browser, close) {
					find(browser, "MOD", function(mod){
						assert.equal(mod.foo, "this is a blank main",
									 "did export the js");
						close();
					}, close);
				}, done);
			});
		});
	});
});
