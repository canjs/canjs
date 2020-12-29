var assert = require("assert");
var stealTools = require("steal-tools");
var bundleAssets = require("../lib/main");
var asap = require("pdenodeify");
var fs = require("fs-extra");
var rimraf = asap(fs.remove);
var exists = require("is-there");
var uniq = require("lodash.uniq");
var sinon = require('sinon');

var copySpy;

describe("removeDots", function() {
	var removeDots = require("../lib/remove_dots");

	it("works with forward slashes", function() {
		assert.equal(removeDots("./images/logo.png"), "images/logo.png");
		assert.equal(removeDots("../../images/logo.png"), "images/logo.png");
	});

	it("works with backward slashes", function() {
		assert.equal(removeDots(".\\images\\logo.png"), "images\\logo.png");
		assert.equal(removeDots("..\\..\\images\\logo.png"), "images\\logo.png");
	});
});

describe("inferred from source content", function(){
	this.timeout(5000);

	before(function(done){
		copySpy = sinon.spy(fs, "copy");
		rimraf(__dirname + "/basics/dist").then(function(){

			this.buildPromise = stealTools.build({
				main: ["main", "home"],
				config: __dirname + "/basics/package.json!npm"
			}, {
				quiet: true,
				minify: false
			});

			this.bundlePromise = this.buildPromise.then(bundleAssets);

			return this.bundlePromise;

		}.bind(this)).then(function(){
			done();
		}, done);
	});
	after(function(){
		fs.copy.restore();
	});

	it("moves assets it finds in css", function(){
		assert(
			exists.file(__dirname + "/basics/dist/images/logo.png"),
			"logo moved to the destination folder"
		);
	});

	it("moves assets only once", function(){
		var destinations = [];
		for(var i = 0; i < copySpy.callCount; i++) {
			destinations.push(copySpy.getCall(i).args[1]);
		}
		assert(
			destinations.length === uniq(destinations).length,
			"assets copied once"
		);
	});

	it("rewrites contents of css to point to moved location", function(){
		var css = fs.readFileSync(__dirname + "/basics/dist/bundles/main.css", "utf8");
		assert(css.indexOf("url(../images/logo.png)") > 0, "urls were rewritten");
	});

	it("works with font-face", function(){
		assert(
			exists.file(__dirname + "/basics/dist/fonts/foo.eot"),
			"eot font moved"
		);
		assert(
			exists.file(__dirname + "/basics/dist/fonts/foo.woff"),
			"woff font moved"
		);
		assert(
			exists.file(__dirname + "/basics/dist/fonts/foo.svg"),
			"svg font moved"
		);
	});

});

describe("provided as a glob", function(){
	this.timeout(5000);
	before(function(done){
		fs.removeSync(__dirname + "/basics/dist");

		const buildPromise = stealTools.build({
			config: __dirname + "/basics/package.json!npm"
		}, {
			quiet: true
		}).then(function (buildResult) {
			return bundleAssets(buildResult, {
				infer: false,
				glob: ["test/basics/docs/**/*", "test/basics/fonts/*.woff"]
			});
		}).then(function (builtResult) {
			done();
		});
	});

	it("Copies over the files provided by the glob", function(){
		assert(exists(__dirname + "/basics/dist/docs/hello.json"), "json copied");
		assert(exists(__dirname + "/basics/dist/fonts/foo.woff"), "font copied");
	});

	it("Updates bundle reference to file copied by the glob", function(){
		var css = fs.readFileSync(__dirname + "/basics/dist/bundles/basics/main.css", "utf8");
		assert(css.indexOf("url(../../fonts/foo.woff)") > 0, "urls were rewritten");
	});

	it("infer: false prevents copying of css images", function(){
		assert(!exists.directory(__dirname + "/basics/dist/images"), "images not copied");
	});
});

describe("when globbing a directory that contains files", function(){
	this.timeout(5000);
	before(function(done){
		fs.removeSync(__dirname + "/basics/dist");

		const buildPromise = stealTools.build({
			config: __dirname + "/basics/package.json!npm"
		}, {
			quiet: true
		}).then(function (buildResult) {
			return bundleAssets(buildResult, {
				infer: false,
				glob: "test/basics/docs/**"
			});
		}).then(function (builtResult) {
			done();
		});
	});

	it("JSON file was copied over", function(){
		assert(exists.file(__dirname + "/basics/dist/docs/hello.json"), "doc copied");
	});
});

