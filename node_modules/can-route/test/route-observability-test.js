var canRoute = require("can-route");
var QUnit = require("steal-qunit");
var mockRoute = require("./mock-route-binding");
var DefineMap = require("can-define/map/");

QUnit.module("can-route observablility",{
	beforeEach: function(assert) {
		canRoute.routes = {};
	}
});

QUnit.test("on/off binding", function(assert) {
	canRoute.routes = {};
	assert.expect(1);
	canRoute.on("foo", function () {
		assert.ok(true, "foo called");

		canRoute.off("foo");

		canRoute.attr("foo", "baz");
	});

	canRoute.attr("foo", "bar");
});

//var queues = require("can-queues");
//queues.log("flush");
QUnit.test("currentRule() compute", function(assert) {

	mockRoute.start();
	var done = assert.async();

	var AppState = DefineMap.extend({
		seal: false
	}, {
		type: "string",
		subtype: "string"
	});
	var appState = new AppState();

	canRoute.data = appState;
	canRoute.register("{type}", { type: "foo" });
	canRoute.register("{type}/{subtype}");
	canRoute.start();

	assert.equal(appState.route, undefined, "should not set route on appState");
	assert.equal(canRoute.currentRule(), "{type}", "should set route.currentRule property");
	appState.subtype = "bar";
	var check = function(){
		if(canRoute.currentRule() === "{type}/{subtype}") {
			assert.ok(true, "moved to right route");
			mockRoute.stop();
			done();
		} else {
			setTimeout(check, 20);
		}
	};
	check();

});
