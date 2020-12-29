var assert = require("assert");
var mockery = require("mockery");

describe("cmd build module", function() {
	var cmdBuild;
	var buildArgs;
	var cmdBuildPath = "../../lib/cli/cmd_build";

	beforeEach(function() {
		buildArgs = {};

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerAllowable(cmdBuildPath);

		mockery.registerMock("../../index", {
			build: function(system, options) {
				buildArgs.system = system;
				buildArgs.options = options;
				return { then: function() {} };
			}
		});

		cmdBuild = require(cmdBuildPath);
	});

	afterEach(function() {
		mockery.disable();
		mockery.deregisterAll();
	});

	it("exposes the right command", function() {
		assert.equal(cmdBuild.command, "build");
	});

	it("defaults config option to package.json!npm", function() {
		assert(cmdBuild.builder.config, "package.json!npm");
	});

	it("handler calls steal.build", function() {
		cmdBuild.handler({
			minify: true,
			config: "/stealconfig.js"
		});

		assert.deepEqual(buildArgs.system, {
			config: "/stealconfig.js"
		});

		assert(buildArgs.options.minify);
	});

	it("bundles-path works", function(){
		cmdBuild.handler({
			config: "/stealconfig.js",
			bundlesPath: "foo"
		});

		assert.deepEqual(buildArgs.system, {
			config: "/stealconfig.js",
			bundlesPath: "foo"
		});
	});
});
