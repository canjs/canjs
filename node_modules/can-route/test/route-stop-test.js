var canRoute = require("can-route");
var QUnit = require("steal-qunit");
var SimpleMap = require("can-simple-map");
var mock = require("./mock-route-binding");

require("can-observation");

QUnit.module("can-route.stop", {
	beforeEach: function(assert) {
		mock.stop();
		canRoute.defaultBinding = "mock";
		this.fixture = document.getElementById("qunit-fixture");
	}
});

QUnit.test("Calling route.stop() tears down bindings", function(assert) {
	var done = assert.async();
	mock.start();

	canRoute.routes = {};
	canRoute.register("{page}");
	canRoute.start();

	canRoute.data.set("page", "home");

	var hash = mock.hash;
	setTimeout(function(){
		assert.equal(hash.get(), "home", "set to home");

		canRoute.stop();
		canRoute.data = new SimpleMap({page: "home"});
		canRoute.start();

		canRoute.data.set("page", "cart");

		setTimeout(function(){
			assert.equal(hash.get(), "cart", "now it is the cart");
			done();
		}, 30);
	}, 30);
});
