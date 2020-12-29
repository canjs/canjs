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

describe("inferred from source content", function(){

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
			exists(__dirname + "/basics/dist/images/logo.png"),
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

	it("includes steal.production.js in the dist folder", function(){
		assert(
			exists(__dirname + "/basics/dist/node_modules/steal/steal.production.js"),
			"steal.production.js included"
		);
	});

	it("works with font-face", function(){
		assert(
			exists(__dirname + "/basics/dist/fonts/foo.eot"),
			"eot font moved"
		);
		assert(
			exists(__dirname + "/basics/dist/fonts/foo.woff"),
			"woff font moved"
		);
		assert(
			exists(__dirname + "/basics/dist/fonts/foo.svg"),
			"svg font moved"
		);
	});

});

describe("provided as a glob", function(){

	before(function(done){
		rimraf(__dirname + "/basics/dist").then(function(){
			this.buildPromise = stealTools.build({
				config: __dirname + "/basics/package.json!npm"
			}, {
				quiet: true
			});

			this.bundlePromise = this.buildPromise.then(function(buildResult){
				return bundleAssets(buildResult, {
					infer: false,
					glob: "test/basics/docs/**/*"
				});
			});

			return this.bundlePromise;

		}.bind(this)).then(function(){
			done();
		});
	});

	it("Copies over the files provided by the glob", function(){
		assert(exists(__dirname + "/basics/dist/docs/hello.json"), "doc copied");
	});

	it("infer: false prevents copying of css images", function(){
		assert(!exists(__dirname + "/basics/dist/images"), "images not copied");
	});

});
