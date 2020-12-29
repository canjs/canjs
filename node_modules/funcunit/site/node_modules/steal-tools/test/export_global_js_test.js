var assert = require("assert");
var stealExport = require("../lib/build/export");
var rmdir = require("rimraf");
var testHelpers = require("./helpers");

var find = testHelpers.find;
var open = testHelpers.open;

describe("+global-js", function(){
	describe("How ES modules are exported", function(){
		beforeEach(function(done){
			rmdir(__dirname + "/exports_es/dist", function(err){
				if(err) return done(err);
				done();
			});
		});

		it("Exports to an object if multiple exports are used", function(done){
			stealExport({
				system: {
					config: __dirname + "/exports_es/package.json!npm",
					main: "app/multi"
				},
				options: { quiet: true },
				outputs: {
					"+global-js": {
						exports: {
							"app/multi": "MOD"
						}
					}
				}
			}).then(function(){
				open("test/exports_es/prod.html",
					function(browser, close) {
					find(browser, "MOD", function(mod){
						assert.equal(mod.a(), "a");
						assert.equal(mod.b(), "b");
						close();
					}, close);
				}, done);
			});
		});

		it("Exports to a single value, if there is only a single default export (traceur)",
		   function(done){
			stealExport({
				system: {
					config: __dirname + "/exports_es/package.json!npm",
					main: "app/single",
					transpiler: "traceur"
				},
				options: { quiet: true },
				outputs: {
					"+global-js": {
						exports: {
							"app/single": "MOD"
						}
					}
				}
			}).then(function(){
				open("test/exports_es/prod.html",
					function(browser, close) {
					find(browser, "MOD", function(mod){
						assert.equal(mod(), "worked");
						close();
					}, close);
				}, done);
			});
		});

		it("Exports to a single value, if there is only a single default export (babel)",
		   function(done){
			stealExport({
				system: {
					config: __dirname + "/exports_es/package.json!npm",
					main: "app/single",
					transpiler: "babel"
				},
				options: { quiet: true },
				outputs: {
					"+global-js": {
						exports: {
							"app/single": "MOD"
						}
					}
				}
			}).then(function(){
				open("test/exports_es/prod.html",
					function(browser, close) {
					find(browser, "MOD", function(mod){
						assert.equal(mod(), "worked");
						close();
					}, close);
				}, done);
			});
		});

	});
});
