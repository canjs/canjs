var assert = require("assert");
var mockery = require("mockery");

describe("cmd live-reload module", function() {
	var cmdBuild;
	var liveArgs;
	var cmdBuildPath = "../../lib/cli/cmd_live_reload";

	var exit;
	beforeEach(function() {
		exit = process.exit;

		liveArgs = {};

		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerAllowable(cmdBuildPath);

		mockery.registerMock("../stream/live", function(system, options){
			liveArgs.system = system;
			liveArgs.options = options;
		});

		cmdBuild = require(cmdBuildPath);
	});

	afterEach(function() {
		process.exit = exit;

		mockery.disable();
		mockery.deregisterAll();
	});

	it("defaults minify to be false", function() {
		cmdBuild.handler({
			config: "package.json!npm"
		});
		assert.ok(liveArgs.options.quiet, "defaults to quiet");
	});

	it("fails if ssl-cert is provided without ssl-key", function(done) {
		process.exit = function(code) {
			assert(code > 0, "Requires ssl-key config option if ssl-cert provided");
			done();
		};
		cmdBuild.handler({
			config: "",
			sslCert: "./keys/cert.pem"
		});
	});

	it("fails if ssl-key is provided without ssl-cert", function(done) {
		process.exit = function(code) {
			assert(code > 0, "Requires ssl-cert config option if ssl-key provided");
			done();
		};
		cmdBuild.handler({
			config: "",
			sslKey: "./keys/key.pem"
		});
	});
});
