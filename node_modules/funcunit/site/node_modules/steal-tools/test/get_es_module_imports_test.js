var assert = require("assert");
var getESModuleImports = require("../lib/load/get_es_module_imports");

describe("getESModuleImports", function() {
	it("returns imports list", function() {
		var load = {
			address: "path/to/file",
			source: "import foo from 'src/lib'"
		};

		assert.deepEqual(getESModuleImports(load), [ "src/lib" ]);
	});

	it("returns empty array for non-ES2015 modules", function() {
		var load = {
			address: "path/to/module",
			source:
				"var foo = require('./lib/foo');" +
				"module.exports = {};"
		};

		assert.deepEqual(getESModuleImports(load), []);
	});

	it("returns empty array for modules with no module specifiers", function() {
		var load = {
			address: "path/to/module",
			source:
				"export default 42;" +
				"export function foo() {};"
		};

		assert.deepEqual(getESModuleImports(load), []);
	});

	it("works with exports that use module specifiers", function() {
		var load = {
			address: "path/to/module",
			source:
				"export * from 'src/foo';" +
				"export * from 'src/bar';"
		};

		assert.deepEqual(
			getESModuleImports(load),
			[ "src/foo", "src/bar" ]
		);
	});

	it("works with multiple imports", function() {
		var load = {
			address: "path/to/file",
			source:
				"import foo from 'src/foo';" +
				"import { bar } from 'src/bar';" +
				"import * as lib from 'src/baz';"
		};

		assert.deepEqual(
			getESModuleImports(load),
			[ "src/foo", "src/bar", "src/baz" ]
		);
	});

	it("works with imports and exports mixed", function() {
		var load = {
			address: "path/to/file",
			source:
				"import foo from 'src/foo';" +
				"import { bar } from 'src/bar';" +
				"export * from 'src/baz';"
		};

		assert.deepEqual(
			getESModuleImports(load),
			[ "src/foo", "src/bar", "src/baz" ]
		);
	});

	it("sets a generated address if missing", function() {
		var load = {
			source: "var foo = 5"
		};

		getESModuleImports(load);
		assert.equal(load.address, "anon1");
	});
});
