var foo = require("~/polyfill#?./some/deep/folder/dont-load-it");
var bar = require("~/some/deep/#{./some/deep/folder/which}");

QUnit.module("relative condition module names");

QUnit.test("works", function(assert) {
	assert.equal(bar, "bar", "should load '~/some/deep/foo'");
	assert.notOk(foo === "polyfill", "should not load polyfill");
});

require("~/some/deep/folder/test");

QUnit.start();
