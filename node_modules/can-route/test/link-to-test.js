var canRoute = require("can-route");
var QUnit = require("steal-qunit");

QUnit.module("can-route .linkTo",{
	beforeEach: function(assert) {
		canRoute.routes = {};
	}
});


QUnit.test("linkTo", function(assert) {
	canRoute.routes = {};
	canRoute.register("{foo}");
	var res = canRoute.link("Hello", {
		foo: "bar",
		baz: "foo"
	});
	assert.equal(res, "<a href=\"#!bar&baz=foo\">Hello</a>");
});
