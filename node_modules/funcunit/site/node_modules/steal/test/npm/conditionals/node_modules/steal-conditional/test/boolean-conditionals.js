var td = require("testdouble");
var loader = require("@loader");
var helpers = require("./runner-helpers")(System);

require("../conditional");

QUnit.module("boolean conditionals");

QUnit.module("cjs - invalid condition module export", function(hooks) {
	hooks.beforeEach(function() {
		td.replace(loader, "fetch", function(load) {
			return load.name === "browser" ?
				Promise.resolve("exports.hasFoo = 'not a boolean';") :
				Promise.reject();
		});
	});

	hooks.afterEach(function() {
		td.reset();
	});

	QUnit.test("rejects promise", testInvalidConditionModuleExport);
});

QUnit.module("es6 - invalid condition module export", function(hooks) {
	hooks.beforeEach(function() {
		loader.delete("browser");
		var oldFetch = this.oldFetch = loader.fetch;

		loader.fetch = function(load) {
			return load.name === "browser" ?
				Promise.resolve("export const hasFoo = 'not a boolean';") :
				oldFetch.call(loader, load);
		};
	});

	hooks.afterEach(function() {
		loader.fetch = this.oldFetch;
	});

	QUnit.test("rejects promise", testInvalidConditionModuleExport);
});

QUnit.module("cjs - false condition without `.` modifier", function(hooks) {
	hooks.beforeEach(function() {
		loader.delete("browser");

		td.replace(loader, "fetch", function(load) {
			return load.name === "browser" ?
				Promise.resolve("module.exports = false;") :
				Promise.reject();
		});
	});

	hooks.afterEach(function() {
		td.reset();
	});

	QUnit.test("normalizes name to special @empty module",
			   testFalseConditionWithoutModifier);
});

QUnit.module("es6 - false condition without `.` modifier", function(hooks) {
	hooks.beforeEach(function() {
		loader.delete("browser");
		var oldFetch = this.oldFetch = loader.fetch;

		loader.fetch = function(load) {
			return load.name === "browser" ?
				Promise.resolve("export default false;") :
				oldFetch.call(loader, load);
		};
	});

	hooks.afterEach(function() {
		loader.fetch = this.oldFetch;
	});

	QUnit.test("normalizes name to special @empty module",
			   testFalseConditionWithoutModifier);
});

QUnit.module("cjs - false condition with `.` modifier", function(hooks) {
	hooks.beforeEach(function() {
		loader.delete("browser");

		td.replace(loader, "fetch", function(load) {
			return load.name === "browser" ?
				Promise.resolve("exports.hasFoo = false;") :
				Promise.reject();
		});
	});

	hooks.afterEach(function() {
		td.reset();
	});

	QUnit.test("normalizes name to special @empty module",
			   testFalseConditionWithModifier);
});

QUnit.module("es6 - false condition with `.` modifier", function(hooks) {
	hooks.beforeEach(function() {
		loader.delete("browser");
		var oldFetch = this.oldFetch = loader.fetch;

		loader.fetch = function(load) {
			return load.name === "browser" ?
				Promise.resolve("export const hasFoo = false;") :
				oldFetch.call(loader, load);
		};
	});

	hooks.afterEach(function() {
		loader.fetch = this.oldFetch;
	});

	QUnit.test("normalizes name to special @empty module",
			   testFalseConditionWithModifier);
});

QUnit.module("cjs - true condition with `.` modifier", function(hooks) {
	hooks.beforeEach(function() {
		loader.delete("browser");

		td.replace(loader, "fetch", function(load) {
			return load.name === "browser" ?
				Promise.resolve("exports.hasFoo = true;") :
				Promise.reject();
		});
	});

	hooks.afterEach(function() {
		td.reset();
	});

	QUnit.test("removes the condition from the module name",
			   testTrueConditionWithModifier);
});

QUnit.module("es6 - true condition with `.` modifier", function(hooks) {
	hooks.beforeEach(function() {
		loader.delete("browser");
		var oldFetch = this.oldFetch = loader.fetch;

		loader.fetch = function(load) {
			return load.name === "browser" ?
				Promise.resolve("export const hasFoo = true;") :
				oldFetch.call(loader, load);
		};
	});

	hooks.afterEach(function() {
		loader.fetch = this.oldFetch;
	});

	QUnit.test("normalizes name to special @empty module",
			   testTrueConditionWithModifier);
});

QUnit.module("with boolean conditional in a npm package name", function(hooks) {
	hooks.beforeEach(function() {
		this.loader = helpers.clone()
			.rootPackage({
				name: "parent",
				main: "main.js",
				version: "1.0.0"
			})
			.withPackages([
				{
				name: "jquery",
				main: "main.js",
				version: "1.0.0"
			}
			]).loader;

		this.loader.import = function(conditionModule) {
			return conditionModule === "browser" ?
				Promise.resolve({ hasFoo: true }) :
				Promise.reject();
		};
	});

	QUnit.test("normalizes the npm package name correctly", function(assert) {
		var done = assert.async();

		this.loader.normalize("jquery#?browser.hasFoo")
			.then(function(name) {
				assert.equal(name, "jquery@1.0.0#main");
				done();
			})
			.catch(function(err) {
				assert.notOk(err, "should not fail");
				done();
			});
	});
});

QUnit.module("conditional module build", function(hooks) {
	var env;

	hooks.beforeEach(function() {
		env = loader.env;

		loader.env = "build-development";

		td.replace(loader, "getModuleLoad", function() {
			return { metadata: {} };
		});

		td.replace(loader, "import", function(conditionModule) {
			var m = { default: true };

			return conditionModule === "needs-jquery" ?
				Promise.resolve(m) :
				Promise.reject();
		});
	});

	hooks.afterEach(function() {
		td.reset();
		loader.env = env;
	});

	QUnit.test("conditional module is added to bundles", function(assert) {
		var done = assert.async();

		loader.normalize("jquery#?needs-jquery")
			.then(function(name) {
				assert.ok(loader.bundle.indexOf("jquery") !== -1);
				assert.equal(name, "@empty");
				done();
			})
			.catch(function(err) {
				assert.notOk(err, "should not fail");
				done();
			});
	});
});


function testInvalidConditionModuleExport(assert) {
	var done = assert.async();

	// browser.hasFoo must be a boolean
	loader.normalize("jquery#?browser.hasFoo")
		.then(function() {
			assert.ok(false, "should be rejected");
			done();
		})
		.catch(function(err) {
			var re = /isn't resolving to a boolean/;
			assert.ok(re.test(err.message));
			done();
		});
}

function testFalseConditionWithoutModifier(assert) {
	var done = assert.async();

	loader.normalize("jquery#?browser")
		.then(function(name) {
			assert.equal(name, "@empty");
			done();
		})
		.catch(function(err) {
			assert.notOk(err, "should not fail");
			done();
		});
}

function testFalseConditionWithModifier(assert) {
	var done = assert.async();

	loader.normalize("jquery#?browser.hasFoo")
		.then(function(name) {
			assert.equal(name, "@empty");
			done();
		})
		.catch(function(err) {
			assert.notOk(err, "should not fail");
			done();
		});
}

function testTrueConditionWithModifier(assert) {
	var done = assert.async();

	loader.normalize("jquery#?browser.hasFoo")
		.then(function(name) {
			assert.equal(name, "jquery");
			done();
		})
		.catch(function(err) {
			assert.notOk(err, "should not fail");
			done();
		});
}
