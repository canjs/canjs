var assert = require("assert");
var mockery = require("mockery");
var _has = require("lodash/has");

describe("cmd transform module", function() {
	var ignore;
	var cmdTransform;
	var transformArgs;
	var cmdTransformPath = "../../lib/cli/cmd_transform";

	beforeEach(function() {
		transformArgs = {};

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerAllowable(cmdTransformPath);

		mockery.registerMock("fs", {
			writeFileSync: function() {}
		});

		var transformCb = function(_, options) {
			ignore = options.ignore;
			return {};
		};

		mockery.registerMock("../../index", {
			transform: function(system, options) {
				transformArgs.system = system;
				transformArgs.options = options;
				return Promise.resolve(transformCb);
			}
		});

		cmdTransform = require(cmdTransformPath);
	});

	afterEach(function() {
		mockery.disable();
		mockery.deregisterAll();
	});

	it("exposes the right command", function() {
		assert.equal(cmdTransform.command, "transform");
	});

	it("defaults config option to package.json!npm", function() {
		assert(cmdTransform.builder.config, "package.json!npm");
	});

	it("includes output and ignore options", function() {
		assert(_has(cmdTransform.builder, "out"), "should include out");
		assert(_has(cmdTransform.builder, "ignore"), "should include ignore");
		assert.equal(cmdTransform.builder.out.alias, "o", "should alias output");
	});

	it("handler calls steal.transform", function() {
		cmdTransform.handler({
			minify: true,
			config: "/stealconfig.js"
		});

		assert(_has(transformArgs.system, "config"), "should include system.config");
	});

	it("handler passes ignore array if steal.transform succeeds", function() {
		var promise = cmdTransform.handler({
			config: "/stealconfig.js",
			ignore: "jquery,underscore,moment"
		});

		return promise.then(function() {
			assert.deepEqual(
				ignore,
				["jquery", "underscore", "moment"],
				"should create an array from the comma-separated list"
			);
		});
	});
});
