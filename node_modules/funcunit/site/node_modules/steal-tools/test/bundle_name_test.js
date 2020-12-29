var assert = require("assert"),
	crypto = require('crypto'),
	winston = require('winston'),
	nameBundle = require("../lib/bundle/name");

var cutting = function(dirName, module){
	return (dirName + module.substr(module.lastIndexOf('/')+1)).substr(0,24);
};

var dirName = "bundles/";

describe("bundle name without npm package", function() {
	beforeEach(function () {
	});

	it("works with just a normal main modulename", function () {
		var bundle = {
			bundles: ["main"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'main');
	});

	it("remove trailing parts", function () {
		var bundleName = nameBundle.getName({bundles: ["main.js"]});
		assert.equal(bundleName, dirName + 'main');

		bundleName = nameBundle.getName({bundles: ["main/"]});
		assert.equal(bundleName, dirName + 'main');

	});

	it("works with concatenate multiple bundles", function(){
		var bundle = {
			bundles: ["main/bar", "bar/foo"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'bar-foo');

		bundle = {
			bundles: ["main/bar", "bar/foo"],
			buildType: "txt"
		};
		bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'bar-foo.txt!');
	});

	it("works if buildType is a extension", function(){
		var bundles = [{
			bundles: ["main"],
			buildType: "txt"
		}];
		nameBundle(bundles);
		assert.equal(bundles[0].buildType, 'txt');
		assert.equal(bundles[0].name, dirName + 'main.txt!');
	});

	it("with very long name", function() {
		var bundle = {
			bundles: ["deep/folder/structure/with/very/very-very-very-long-name"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'deep/folder/structure/with/very/very-very-very-long-name', "main modules will not cut");


		bundle = {
			bundles: ["main/my-very-long-name", "bar/eman-gnol-yrev-ym"]
		};
		bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'my-very-long-nam-34e05993');


		var bundles = [
			{
				bundles: ["deep/folder/structure/with/very/very/very-long-name"],
				buildType: "txt"
			}
		];
		nameBundle(bundles);
		assert.equal(bundles[0].buildType, 'txt');
		assert.equal(bundles[0].name, dirName + 'deep/folder/structure/with/very/very/very-long-name.txt!');

	});

	it("prevent file collisions", function(){
		var allBundles = [
			{
				bundles: [
					"deep/folder/structure/with/very/very-very-very-long-name",
					"deep/space/nine/is/a/great-series/from-the-90s"
				]
			},
			{
				bundles: [
					"deep/folder/structure/with/very/very-very-very-long-name",
					"deep/space/nine/is/a/great-series/from-the-90s"
				]
			}
		];

		nameBundle(allBundles);

		assert.equal(allBundles[0].name, cutting(dirName, allBundles[0].bundles[0]) + '-f802f7c2');
		assert.equal(allBundles[1].name, cutting(dirName, allBundles[1].bundles[0]) + '-f802f7c2-0');


		allBundles = [
			{
				bundles: [
					"deep/folder/structure/with/very/very-very-very-long-name",
					"deep/space/nine/is/a/great-series/from-the-90s"
				],
				buildType: "txt"
			},
			{
				bundles: [
					"deep/folder/structure/with/very/very-very-very-long-name",
					"deep/space/nine/is/a/great-series/from-the-90s"
				],
				buildType: "txt"
			}
		];

		nameBundle(allBundles);
		assert.equal(allBundles[0].buildType, 'txt');
		assert.equal(allBundles[0].name, cutting(dirName, allBundles[0].bundles[0]) + '-f802f7c2.txt!');
		assert.equal(allBundles[1].name, cutting(dirName, allBundles[1].bundles[0]) + '-f802f7c2-0.txt!');

	});

	it("works with a plugin markup", function() {
		var bundle = {
			bundles: ["index.stache!done-autorender"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'index');

		bundle = {
			bundles: ["main!my-plugin"]
		};
		bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'main');
	});

	it("only return names with chars, numbers and -", function() {
		bundle = {
			bundles: ["main/bar0815.com.js", "bar/foo- bar"]
		};
		bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'bar0815-com-foo-bar');
	});

});

describe("bundle name with npm package", function() {
	beforeEach(function () {
	});

	afterEach(function(){
	});

	it("works for a main package module", function(){
		var bundle = {
			bundles: ["foo@1.0.0#bar"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'foo/bar');
	});

	it("works with concatenate multiple bundles", function(){
		var bundle = {
			bundles: ["foo@1.0.0#component/my-component", "foo@1.0.0#foo"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'my-component-foo');
	});

	it("remove trailing parts", function () {
		var bundle = {
			bundles: ["foo@1.0.0#main/bar/", "foo@1.0.0#foo.js"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'bar-foo');
	});

	it("prevent file collisions", function() {
		var allBundles = [
			{
				bundles: ["pkg@1.0.0#foo", "pkg@1.0.0#bar"]
			},
			{
				bundles: ["pkg@1.0.0#component/foo", "pkg@1.0.0#component/bar"]
			}
		];

		nameBundle(allBundles);
		assert.equal(allBundles[0].name, dirName + 'foo-bar');
		assert.notEqual(allBundles[1].name, dirName + 'foo-bar');
		assert.equal(allBundles[1].name, dirName + 'foo-bar-0');

	});

	it("works with a plugin markup", function(){

		var bundle = {
			bundles: ["mypkg@1.0.0#index.stache!done-autorender"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'mypkg/index');

		bundle = {
			bundles: ["mypkg@1.0.0#main!my-plugin"]
		};
		bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'mypkg/main');
	});

	it("with different module structure", function(){
		var bundle = {
			bundles: ["foo@1.0.0#main", "main"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'main-main');
	});

	it("with different packages", function(){
		var bundle = {
			bundles: ["mypkg@1.0.0#main", "jquery@1.0.0#lib/index"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'main-index');
	});

	it('prevent file collisions with diffrent packages', function() {

		var allBundles = [
			{
				bundles: ["mypkg@1.0.0#main", "jquery@1.0.0#lib/index"]
			},
			{
				bundles: ["otherpkg@1.0.0#main", "moment@1.0.0#lib/index"]
			}
		];

		nameBundle(allBundles);
		assert.equal(allBundles[0].name, dirName + 'main-index');
		assert.equal(allBundles[1].name, dirName + 'main-index-0');
	});

	it("packagename has a dot inside", function() {
		var bundle = {
			bundles: ["mypkg.com@1.0.0#main"]
		};
		var bundleName = nameBundle.getName(bundle);
		assert.equal(bundleName, dirName + 'mypkg.com/main');
	});

});
