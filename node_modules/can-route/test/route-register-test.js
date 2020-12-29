var canRoute = require("can-route");
var QUnit = require("steal-qunit");
var testHelpers = require("can-test-helpers");

QUnit.module("can-route .register", {
	beforeEach: function(assert) {
		canRoute.routes = {};
	}
});

testHelpers.dev.devOnlyTest("should warn when two routes have same map properties", function (assert) {
	var teardown = testHelpers.dev.willWarn(/two routes were registered with matching keys/);

	canRoute.register("{page}/{subpage}");
	canRoute.register("foo/{page}/{subpage}");

	assert.equal(teardown(), 1);
});

testHelpers.dev.devOnlyTest("should warn when two routes have same map properties - including defaults", function (assert) {
	var teardown = testHelpers.dev.willWarn(/two routes were registered with matching keys/);

	canRoute.register("foo/{page}/{subpage}");
	canRoute.register("{page}/{subpage}");

	assert.equal(teardown(), 1);
});

testHelpers.dev.devOnlyTest("should not warn when two routes have same map properties - but different defaults(#36)", function (assert) {
	var teardown = testHelpers.dev.willWarn(/two routes were registered with matching keys/);

	canRoute.register("login", { "page": "auth", "subpage": "login" });
	canRoute.register("signup", { "page": "auth", "subpage": "signup" });

	assert.equal(teardown(), 0);
});

testHelpers.dev.devOnlyTest("should not be display warning for matching keys when the routes do not match (#99)", function (assert) {
	var expectedWarningText = "two routes were registered with matching keys:\n" +
		"\t(1) route.register(\"login\", {\"page\":\"auth\"})\n" +
		"\t(2) route.register(\"signup\", {\"page\":\"auth\"})\n" +
		"(1) will always be chosen since it was registered first";

	var teardown = testHelpers.dev.willWarn(expectedWarningText);

	//should warn
	canRoute.register("login", { "page":"auth" });
	canRoute.register("signup", { "page":"auth" });

	//should not warn
	canRoute.register("login2/", { "page":"auth2" });
	canRoute.register("login2", { "page":"auth2" });

	//should not warn
	canRoute.register("login3", { "page":"auth3" });
	canRoute.register("login3", { "page":"auth3" });

	assert.equal(teardown(), 1);
});
