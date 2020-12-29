var canRoute = require("can-route");
var RouteData = require("../src/routedata");

var RouteMock = require("can-route-mock");

var oldDefault;

module.exports = {
	start: function() {
		// discard old hash
		this.hash = new RouteMock();
		oldDefault = canRoute.urlData;
		canRoute.urlData = this.hash;

		this.hash.value = "";
		canRoute.data = new RouteData();
		//canRoute._setup();
	},
	stop: function() {
		canRoute._teardown();
		canRoute.urlData = oldDefault;

		this.hash = new RouteMock();
		canRoute.data = new RouteData();
		//canRoute.bindings.mock.unbind();
		//canRoute._setup();
	}
};
