var assert = require("assert");
var cmdBuild = require("../../lib/cli/cmd_build");

describe("cli integration tests", function() {	
	var exit;
	beforeEach(function() {
		exit = process.exit;
	});
	
	afterEach(function() {
		process.exit = exit;
	});
	
	it("should return non-zero exit code on failure", function(done) {
		process.exit = function(code) {
			assert(code === 1);
			done();
		};
		cmdBuild.handler({
			config: "/stealconfig.js",
			main: "file-not-found"
		});
	});
});
