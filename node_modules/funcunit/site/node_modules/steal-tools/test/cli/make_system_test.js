var path = require("path");
var assert = require("assert");
var makeSystem = require("../../lib/cli/make_system");

describe("makeSystem", function() {
	it("includes main if argv.main provided", function() {
		var system = makeSystem({
			main: "path/to/main",
			config: "package.json!npm"
		});
		assert.equal(system.main, "path/to/main");

		system = makeSystem({
			config: "package.json!npm"
		});
		assert(
			typeof system.main === "undefined",
			"main should not be defined"
		);
	});

	it("builds config path if relative", function() {
		var cwd = process.cwd();
		var system = makeSystem({ config: "package.json!npm" });
		assert.equal(system.config, path.join(cwd, "package.json!npm"));
	});

	it("returns absolute config path as-is", function() {
		var system = makeSystem({ config: "/my-config" });
		assert.equal(system.config, "/my-config");
	});
});
