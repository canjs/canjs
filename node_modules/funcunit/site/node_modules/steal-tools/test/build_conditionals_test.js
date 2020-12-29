var path = require("path");
var fs = require("fs-extra");
var rmdir = require("rimraf");
var assert = require("assert");
var denodeify = require("pdenodeify");
var testHelpers = require("./helpers");
var multiBuild = require("../lib/build/multi");

describe("build app using steal-conditional", function() {
	var find = testHelpers.find;
	var open = testHelpers.open;
	var prmdir = denodeify(rmdir);
	var basePath = path.join(__dirname, "conditionals");
	var booleanPath = path.join(basePath, "boolean", "node_modules");
	var substitutionPath = path.join(basePath, "substitution", "node_modules");

	before(function() {
		return copyDependencies();
	});

	it("simple substitution works", function(done) {
		var config = {
			config: path.join(basePath, "substitution", "package.json!npm")
		};

		prmdir(path.join(basePath, "substitution", "dist"))
			.then(function() {
				return multiBuild(config, { minify: false, quiet: true });
			})
			.then(function() {
				var bundlesPath = path.join(basePath, "substitution", "main.js");

				if (!fs.existsSync(bundlesPath)) {
					throw new Error("No build files found");
				}
			})
			.then(function() {
				var page = path.join(
					"test", "conditionals", "substitution", "index.html"
				);

				open(page, function(browser, close) {
					find(browser, "translations", function(translations) {
						assert.equal(translations.en, "hello, world!");
						assert.equal(translations.es, "hola, mundo!");
						close();
					}, close);
				}, done);
			})
			.catch(done);
	});

	it("simple boolean conditional works", function(done) {
		this.timeout(20000);

		var options = {
			config: path.join(basePath, "boolean", "package.json!npm")
		};

		prmdir(path.join(basePath, "boolean", "dist"))
			.then(function() {
				return multiBuild(options, { minify: false, quiet: true });
			})
			.then(function() {
				var bundlesPath = path.join(
					basePath, "boolean", "dist", "bundles", "main.js"
				);

				if (!fs.existsSync(bundlesPath)) {
					throw new Error("No build files found");
				}
			})
			.then(function() {
				var page = path.join(
					"test", "conditionals", "boolean", "index.html"
				);

				open(page, function(browser, close) {
					find(browser, "variable", function(variable) {
						assert.equal(variable, "foo");
						close();
					}, close);
				}, done);
			})
			.catch(done);
	});

	function copyDependencies() {
		var prmdir = denodeify(rmdir);
		var pcopy = denodeify(fs.copy);

		var srcModulesPath = path.join(__dirname, "..", "node_modules");

		return prmdir(booleanPath)
			.then(function() {
				return prmdir(substitutionPath);
			})
			.then(function() {
				return pcopy(
					path.join(srcModulesPath, "steal-conditional"),
					path.join(booleanPath, "steal-conditional")
				);
			})
			.then(function() {
				return pcopy(
					path.join(srcModulesPath, "steal-conditional"),
					path.join(substitutionPath, "steal-conditional")
				);
			});
	}
});
