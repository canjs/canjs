var assert = require("assert");
var mockery = require("mockery");
var _has = require("lodash/has");
var _isEmpty = require("lodash/isEmpty");

describe("cmd export module", function() {
	var cmdExport;
	var exportConfig;
	var cmdExportPath = "../../lib/cli/cmd_export";

	beforeEach(function() {
		exportConfig = {};

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerAllowable(cmdExportPath);

		mockery.registerMock("../../index", {
			export: function(config) {
				exportConfig = config;
				return { then: function() {} };
			}
		});

		cmdExport = require(cmdExportPath);
	});

	afterEach(function() {
		mockery.disable();
		mockery.deregisterAll();
	});

	it("exposes the right command", function() {
		assert.equal(cmdExport.command, "export");
	});

	it("defaults config option to package.json!npm", function() {
		assert(cmdExport.builder.config, "package.json!npm");
	});

	it("includes default output options", function() {
		assert(_has(cmdExport.builder, "cjs"), "should include cjs");
		assert(_has(cmdExport.builder, "amd"), "should include amd");
		assert(_has(cmdExport.builder, "global"), "should include global");
		assert(_has(cmdExport.builder, "all"), "should include all");
		assert(_has(cmdExport.builder, "standalone", "should include standalone"));
	});

	it("handler calls steal.export", function() {
		cmdExport.handler({
			minify: true,
			config: "/stealconfig.js"
		});

		assert(_has(exportConfig, "system"), "should include system");
		assert(_has(exportConfig, "options"), "should include options");
		assert(_has(exportConfig, "outputs"), "should include outputs");
	});

	describe("standalone", function(){
		it("flag works by itself", function() {
			cmdExport.handler({
				config: "/stealconfig.js",
				standalone: true
			});

			var outputs = exportConfig.outputs;
			var len = Object.keys(outputs).length;

			assert.equal(len, 1, "There is one output");
			assert(_has(outputs, "+standalone"), "standalone output added");
		});

		it("can take the dest", function() {
			cmdExport.handler({
				config: "/stealconfig.js",
				standalone: true,
				dest: __dirname + "/foo.js"
			});

			var opt = exportConfig.outputs["+standalone"];

			assert.equal(opt.dest, __dirname + "/foo.js", "took the dest option");
		});

		it("flag works combined with others", function(){
			cmdExport.handler({
				config: "/stealconfig.js",
				standalone: true,
				amd: true
			});

			var outputs = exportConfig.outputs;
			var len = Object.keys(outputs).length;

			assert.equal(len, 2, "there are two outputs");
			assert(_has(outputs, "+standalone"), "has standalone");
			assert(_has(outputs, "+amd"), "has amd");

			assert(_isEmpty(outputs["+standalone"]), "standalone has no options");
			assert(_isEmpty(outputs["+amd"]), "amd has no options");
		});
	});

});
