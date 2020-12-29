var canRoute = require("can-route");
var QUnit = require("steal-qunit");
var canReflect = require("can-reflect");

QUnit.module("can-route with can-observable-object in an iframe", {
	beforeEach: function() {
		canRoute._teardown();
		canRoute.urlData = canRoute.bindings.hashchange;
		//canRoute.defaultBinding = "hashchange";
		this.fixture = document.getElementById("qunit-fixture");
	}
});

if ("onhashchange" in window) {
	var teardownRouteTest;
	var setupRouteTest = function(assert, callback) {
		var testarea = document.getElementById("qunit-fixture");
		var iframe = document.createElement("iframe");
		var done = assert.async();
		window.routeTestReady = function() {
			var args = canReflect.toArray(arguments);
			args.unshift(iframe);
			callback.apply(null, args);
		};
		iframe.src = __dirname + "/observable-testing.html?" + Math.random();
		testarea.appendChild(iframe);
		teardownRouteTest = function() {
			setTimeout(function() {
				testarea.removeChild(iframe);
				setTimeout(function() {
					done();
				}, 10);
			}, 1);
		};
	};

	if (typeof steal !== "undefined") {
		QUnit.test("listening to hashchange (#216, #124)", function(assert) {
			setupRouteTest(assert, function(iframe, iCanRoute) {
				assert.ok(!iCanRoute.data.bla, "Value not set yet");

				iCanRoute.bind("bla", function() {
					assert.equal(
						iCanRoute.data.get("bla"),
						"blu",
						"Got route change event and value is as expected"
					);
					teardownRouteTest();
				});

				iCanRoute._onStartComplete = function() {
					iframe.src = iframe.src + "#!bla=blu";
				};

				iCanRoute.start();
			});
		});

		QUnit.test("updating the hash", function(assert) {
			setupRouteTest(assert, function(iframe, iCanRoute, loc) {
				iCanRoute._onStartComplete = function() {
					var after = loc.href.substr(loc.href.indexOf("#"));
					assert.equal(after, "#!bar/" + encodeURIComponent("/"));

					teardownRouteTest();
				};

				iCanRoute.start();
				iCanRoute.register("{type}/{id}");
				iCanRoute.attr({
					type: "bar",
					id: "/"
				});
			});
		});

		QUnit.test("unsticky routes", function(assert) {
			setupRouteTest(assert, function(iframe, iCanRoute, loc) {
				iCanRoute.register("{type}");
				iCanRoute.register("{type}/{id}");

				iCanRoute._onStartComplete = function() {
					iCanRoute.attr({
						type: "bar"
					});

					setTimeout(function() {
						var after = loc.href.substr(loc.href.indexOf("#"));
						assert.equal(after, "#!bar");
						iCanRoute.attr({
							type: "bar",
							id: "/"
						});

						// check for 1 second
						var time = new Date();
						setTimeout(function innerTimer() {
							var after = loc.href.substr(loc.href.indexOf("#"));
							var isMatch = after === "#!bar/" + encodeURIComponent("/");
							var isWaitingTooLong = new Date() - time > 5000;
							if (isMatch || isWaitingTooLong) {
								assert.equal(
									after,
									"#!bar/" + encodeURIComponent("/"),
									"should go to type/id " + (new Date() - time)
								);
								teardownRouteTest();
							} else {
								setTimeout(innerTimer, 30);
							}
						}, 30);
					}, 150);
				};
				iCanRoute.start();
			});
		});
	}
}
