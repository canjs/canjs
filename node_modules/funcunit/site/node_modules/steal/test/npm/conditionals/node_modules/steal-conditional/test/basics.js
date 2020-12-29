var td = require("testdouble");
var loader = require("@loader");

require("../conditional");

QUnit.test("works with relative condition modules", function(assert) {
	var done = assert.async();

	td.replace(loader, "fetch", function(load) {
		return (load.name.indexOf("#foo/browser") !== -1) ?
			Promise.resolve("module.exports = 'chrome';") :
			Promise.reject();
	});

	loader.normalize("jquery/#{../browser}", "steal-conditional@0.0.1#foo/bar/main")
		.then(function(name) {
			assert.equal(name, "jquery/chrome");
			done();
		})
		.then(null, function(err) {
			assert.notOk(err, "should not fail");
			done();
		});
});

QUnit.module("uses pluginLoader's import if available", function(hooks) {
	hooks.beforeEach(function() {
		td.replace(loader, "import");

		td.replace(loader, "pluginLoader", {
			normalize: function(name) {
				return Promise.resolve(name);
			},
			getModuleLoad: function() {
				return { metadata: {} };
			},
			import: function(conditionModule) {
				return conditionModule === "browser" ?
					Promise.resolve({ hasFoo: true }) :
					Promise.reject();
			}
		});
	});

	hooks.afterEach(function() {
		td.reset();
	});

	QUnit.test("works", function(assert) {
		var done = assert.async();

		loader.normalize("jquery#?browser.hasFoo")
			.then(function(name) {
				td.verify(loader.import(), {times: 0, ignoreExtraArgs: true});
				assert.equal(name, "jquery");
				done();
			})
			.catch(function(err) {
				assert.notOk(err, "should work");
				done();
			});
	});
});

QUnit.test("normalize with other plugins work", function(assert) {
	var done = assert.async();

	assert.expect(1);

	loader.config({
		ext: { noop: "steal-noop.js" }
	});

	loader.normalize("foo.noop")
		.then(function(name) {
			assert.equal(name, "foo.noop!steal-noop.js");
			done();
		});
});
