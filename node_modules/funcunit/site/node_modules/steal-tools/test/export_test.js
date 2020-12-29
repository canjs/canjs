var assert = require("assert"),
	fs = require("fs-extra"),
	path = require("path"),
	rmdir = require("rimraf"),
	stealExport = require("../lib/build/export"),
	testHelpers = require("./helpers");

var find = testHelpers.find;
var open = testHelpers.open;

describe("export", function(){
	it("basics work", function(done){

		stealExport({

			system: {
				main: "pluginifier_builder/pluginify",
				config: __dirname+"/stealconfig.js"
			},
			options: {
				quiet: true
			},
			"outputs": {
				"basics standalone": {
					modules: ["basics/module/module"],
					dest: function(){
						return __dirname+"/out/basics.js"
					},
					minify: false
				},
				"pluginify without basics": {
					modules: ["pluginifier_builder/pluginify"],
					ignore: ["basics/module/module"],
					dest: function(){
						return __dirname+"/out/pluginify.js"
					},
					minify: false
				}
			}
		}).then(function(){
			open("test/pluginifier_builder/index.html", function(browser, close){

				find(browser,"RESULT", function(result){
					assert.ok(result.module, "has module");
					assert.ok(result.cjs,"has cjs module");
					assert.equal(result.name, "pluginified");
					close();
				}, close);

			}, done);

		}, done);
	});

	it("works with multiple mains", function(done){
		stealExport({

			system: {
				main: [
					"pluginifier_builder/pluginify",
					"pluginifier_builder/common"
				],
				config: __dirname+"/stealconfig.js"
			},
			options: {
				quiet: true
			},
			"outputs": {
				"basics standalone": {
					modules: ["basics/module/module"],
					dest: function(){
						return __dirname+"/out/basics.js"
					},
					minify: false
				},
				"pluginify without basics": {
					modules: ["pluginifier_builder/pluginify"],
					ignore: ["basics/module/module"],
					dest: function(){
						return __dirname+"/out/pluginify.js"
					},
					minify: false
				}
			}
		}).then(function(){
			open("test/pluginifier_builder/index.html", function(browser, close){

				find(browser,"RESULT", function(result){
					assert.ok(result.module, "has module");
					assert.ok(result.cjs,"has cjs module");
					assert.equal(result.name, "pluginified");
					close();
				}, close);

			}, done);

		}, done);
	});

	it("passes the load objects to normalize and dest", function(done){
		var destCalls = 0;

		stealExport({

			system: {
				main: "pluginifier_builder_load/main",
				config: __dirname+"/stealconfig.js"
			},
			options: {
				quiet: true
			},
			"outputs": {
				"cjs": {
					graphs: ["pluginifier_builder_load/main"],
					useNormalizedDependencies: false,
					format: "cjs",
					normalize: function(name, load, curName, curLoad, loader) {
						assert.equal(name, "./bar");
						assert.equal(load.name, "pluginifier_builder_load/bar");
						assert.equal(curName, "pluginifier_builder_load/main");
						assert.equal(curLoad.name, "pluginifier_builder_load/main");
						assert.equal(loader.main, "pluginifier_builder_load/main");
						return name;
					},
					ignore: function(moduleName, load){
						switch(destCalls++) {
							case 0:
								assert.equal(load.name, "pluginifier_builder_load/main");
								break;
							case 2:
								assert.equal(load.name, "pluginifier_builder_load/bar");
								return true;
								break;
							default:
								assert.ok(false, "should not be called "+moduleName+"."+destCalls);
								break;
						}
					},
					dest: function(moduleName, moduleData, load){
						switch(destCalls++) {
							case 1:
								assert.equal(load.name, "pluginifier_builder_load/main");
								break;
							default:
								assert.ok(false, "should not be called "+moduleName+"."+destCalls);
								break;
						}
						return __dirname+"/out/"+moduleName+".js"
					},
					minify: false
				}
			}
		}).then(function(err){

			done();

		}, done);
	});

	it("evaled globals do not have exports in their scope (#440)", function(done){

		stealExport({

			system: {
				main: "pluginifier_builder_exports/pluginify",
				config: __dirname+"/stealconfig.js"
			},
			options: {
				quiet: true
			},
			"outputs": {
				"pluginify without basics": {
					modules: ["pluginifier_builder_exports/pluginify"],
					dest: function(){
						return __dirname+"/out/pluginify_exports.js"
					},
					minify: false,
					format: "global"
				}
			}
		}).then(function(){
			open("test/pluginifier_builder_exports/index.html", function(browser, close){

				find(browser,"RESULT", function(result){
					assert.equal(result.name, "pluginified");
					close();
				}, close);

			}, done);

		}, done);
	});

	describe("eachModule", function(){
		it("works", function(done){
			stealExport({
				system: {
					main: "pluginifier_builder/pluginify",
					config: __dirname+"/stealconfig.js"
				},
				options: {
					quiet: true
				},
				"outputs": {
					"basics standalone": {
						eachModule: ["basics/module/module"],
						dest: function(){
							return __dirname+"/out/basics.js"
						},
						minify: false
					}
				}
			}).then(function(){
				open("test/pluginifier_builder/index.html",
					 function(browser, close){

					find(browser,"RESULT", function(result){
						assert.ok(result.module, "has module");
						assert.ok(result.cjs,"has cjs module");
						assert.equal(result.name, "pluginified");
						close();
					}, close);
				}, done);
			}, done);

		});
	});

	describe("helpers", function(){
		beforeEach(function(done) {
			rmdir(path.join(__dirname, "pluginifier_builder_helpers", "node_modules"), function(error){

				if(error){ return done(error); }

				rmdir(path.join(__dirname, "pluginifier_builder_helpers", "dist"), function(error){

					if(error){ return done(error); }

					fs.copy(
						path.join(__dirname, "..", "node_modules","jquery"),
						path.join(__dirname, "pluginifier_builder_helpers", "node_modules", "jquery"),
						function(error){
							if(error) { return done(error); }

							fs.copy(
								path.join(__dirname, "..", "node_modules","cssify"),
								path.join(__dirname, "pluginifier_builder_helpers", "node_modules", "cssify"),
								function(error){
									if(error) { return done(error); }
									done();
								}
							);
						}
					);

				});

			});
		});

		it("+cjs", function(done){
			this.timeout(10000);

			stealExport({
				system: { config: __dirname+"/pluginifier_builder_helpers/package.json!npm" },
				options: { quiet: true },
				"outputs": {
					"+cjs": {}
				},
			}).then(function(){
				var browserify = require("browserify");

				var b = browserify();
				b.add(path.join(__dirname, "pluginifier_builder_helpers/browserify.js"));
				var out = fs.createWriteStream(path.join(__dirname, "pluginifier_builder_helpers/browserify-out.js"));
				b.bundle().pipe(out);
				out.on('finish', function(){
					open("test/pluginifier_builder_helpers/browserify.html", function(browser, close) {
						find(browser,"WIDTH", function(width){

							assert.equal(width, 200, "with of element");
							close();
						}, close);
					}, done);
				});


			}, function(e) {
				done(e);
			});

		});


		it("+cjs with dest", function(done){
			this.timeout(10000);

			stealExport({

				system: { config: __dirname+"/pluginifier_builder_helpers/package.json!npm" },
				options: { quiet: true },
				"outputs": {
					"+cjs": {dest: __dirname+"/pluginifier_builder_helpers/cjs"}
				}
			}).then(function(){

				var browserify = require("browserify");

				var b = browserify();
				b.add(path.join(__dirname, "pluginifier_builder_helpers/browserify-cjs.js"));
				var out = fs.createWriteStream(path.join(__dirname, "pluginifier_builder_helpers/browserify-out.js"));
				b.bundle().pipe(out);
				out.on('finish', function(){
					open("test/pluginifier_builder_helpers/browserify.html", function(browser, close) {
						find(browser,"WIDTH", function(width){

							assert.equal(width, 200, "with of element");
							close();
						}, close);
					}, done);
				});


			}, done);

		});



		// NOTICE: this test uses a modified version of the css plugin to better work
		// in HTMLDOM
		it("+amd", function(done){
			this.timeout(10000);

			stealExport({

				system: { config: __dirname+"/pluginifier_builder_helpers/package.json!npm" },
				options: { quiet: true },
				"outputs": {
					"+amd": {}
				}
			}).then(function(){

				open("test/pluginifier_builder_helpers/amd.html", function(browser, close) {
					find(browser,"WIDTH", function(width){
						assert.equal(width, 200, "with of element");
						close();
					}, close);
				}, done);


			}, done);

		});

		it("+global-css +global-js", function(done){
			this.timeout(10000);

			stealExport({

				system: { config: __dirname+"/pluginifier_builder_helpers/package.json!npm" },
				options: { quiet: true },
				"outputs": {
					"+global-css": {},
					"+global-js": { exports: {"jquery": "jQuery"} }
				}
			}).then(function(err){

				open("test/pluginifier_builder_helpers/global.html", function(browser, close) {
					find(browser,"WIDTH", function(width){
						assert.equal(width, 200, "width of element");
						assert.ok(browser.window.TABS, "got tabs");
						close();
					}, close);
				}, done);


			}, done);
		});

		it("+cjs +amd +global-css +global-js using Babel", function(done){
			this.timeout(10000);
			stealExport({
				system: {
					config: __dirname+"/pluginifier_builder_helpers/package.json!npm",
					transpiler: "babel"
				},
				options: { quiet: true },
				"outputs": {
					"+cjs": {},
					"+amd": {},
					"+global-js": {
						exports: {
							"jquery": "jQuery"
						}
					},
					"+global-css": {}
				}
			})
			.then(function() {
				open("test/pluginifier_builder_helpers/global.html", function(browser, close) {
					find(browser,"WIDTH", function(width){
						assert.equal(width, 200, "width of element");
						assert.ok(browser.window.TABS, "got tabs");
						close();
					}, close);
				}, done);
			}, done);
		});

		it("ignore: false will not ignore node_modules for globals", function(done){
			this.timeout(10000);
			stealExport({
				system: {
					config: __dirname + "/ignore_false/package.json!npm"
				},
				options: { quiet: true },
				outputs: {
					"+global-js": {
						ignore: false
					}
				}
			}).then(function(){
				open("test/ignore_false/prod.html", function(browser, close) {
					find(browser, "MODULE", function(mod){
						assert.equal(mod.dep, "a dep");
						assert.equal(mod.other, "other");
						close();
					}, close);
				}, done);
			}, done);
		});

	});

	describe("npm package.json builds", function(){
		describe("ignore", function(){
			it("works with unnormalized names", function(done){
				stealExport({
					system: {
						config: __dirname+"/npm/package.json!npm",
						main: "npm-test/main",
						transpiler: "babel"
					},
					options: { quiet: true },
					"outputs": {
						"+global-js": {
							modules: ["npm-test/main"],
							minify: false,
							ignore: ["npm-test/child"],
							exports: {
								"jquery": "$"
							}
						},
					}
				})
				.then(check);

				function check() {
					openPage(function(moduleValue){
						var child = moduleValue.child;
						assert.equal(child, undefined, "Child ignored in build");
					}, done);
				}

				function openPage(callback, done) {
					open("test/npm/prod-global.html", function(browser, close){
						find(browser,"MODULE", function(moduleValue){
							callback(moduleValue);
							close();
						}, close);
					}, done);
				}


			});
		});
	});

	describe("Source Maps", function(){
		this.timeout(5000);

		beforeEach(function(done){
			rmdir(__dirname+"/pluginifier_builder_helpers/dist", function(err){
				done(err);
			});
		});

		it("+cjs +amd +global-css +global-js works", function(done){
			this.timeout(10000);
			stealExport({
				system: {
					config: __dirname+"/pluginifier_builder_helpers/package.json!npm",
					transpiler: "babel"
				},
				options: {
					quiet: true,
					sourceMaps: true
				},
				"outputs": {
					"+cjs": {},
					"+amd": {},
					"+global-js": { exports: {"jquery": "jQuery"} },
					"+global-css": {}
				}
			})
			.then(verify)
			.then(done, done);
		});

		function read(filename){
			var data = fs.readFileSync(__dirname +
									   "/pluginifier_builder_helpers/dist/" +
									   filename,
			"utf8");
			if(/\.map/.test(filename)) return JSON.parse(data);
			return data;
		}

		function verify() {
			var globalJsMap = read("global/tabs.js.map");
			assert.equal(globalJsMap.sources[1], "../../../src/tabs.js", "Relative to source file");
			assert.equal(globalJsMap.file, "tabs.js", "Refers to generated file");

			var globalJs = read("global/tabs.js");
			assert(globalJs.indexOf("//# sourceMappingURL=tabs.js.map") > 0, "sourceMappingURL comment included.");

			var globalCssMap = read("global/tabs.css.map");
			assert.equal(globalCssMap.file, "tabs.css", "Refers to generated css");

			var globalCss = read("global/tabs.css");
			assert(globalCss.indexOf("/*# sourceMappingURL=tabs.css.map */") > 0, "sourceMappingURL comment included");
		}

	});
});
