/* jshint asi:true */
/* jshint -W079 */
require("./route-observable-iframe-test");
var canRoute = require("can-route");
var QUnit = require("steal-qunit");
var canReflect = require("can-reflect");
var stacheKey = require("can-stache-key");
var ObservableObject = require("can-observable-object");
var Observation = require("can-observation");
var queues = require("can-queues");
window.queues = queues;
var type = require("can-type");
var mockRoute = require("./mock-route-binding");
var RouteData = require("../src/routedata");

require("can-observation");

QUnit.module("can-route with can-observable-object", {
	beforeEach: function(assert) {
		canRoute.routes = {};
		canRoute._teardown();
		canRoute.urlData = canRoute.bindings.hashchange;
		//canRoute.defaultBinding = "hashchange";
		this.fixture = document.getElementById("qunit-fixture");
	}
});

if ("onhashchange" in window) {
	if (typeof steal !== "undefined") {
		QUnit.test(
			"canRoute.map: conflicting route values, hash should win (canjs/canjs#979)",
			function(assert) {
				var done = assert.async();
				mockRoute.start();

				var appState = new ObservableObject({ type: "dog", id: "4" });
				canRoute.data = appState;

				canRoute.register("{type}/{id}");

				canRoute._onStartComplete = function() {
					var after = mockRoute.hash.get();
					assert.equal(after, "cat/5", "same URL");
					assert.equal(
						appState.get("type"),
						"cat",
						"conflicts should be won by the URL"
					);
					assert.equal(
						appState.get("id"),
						"5",
						"conflicts should be won by the URL"
					);
					done();
					mockRoute.stop();
				};

				mockRoute.hash.value = "#!cat/5";
				canRoute.start();
			}
		);

		QUnit.test(
			"canRoute.map: route is initialized from URL first, then URL params are added from canRoute.data (canjs/canjs#979)",
			function(assert) {
				var done = assert.async();
				mockRoute.start();

				var appState = new ObservableObject({ section: "home" });
				canRoute.data = appState;

				canRoute.register("{type}/{id}");

				canRoute._onStartComplete = function() {
					assert.equal(mockRoute.hash.value, "cat/5&section=home", "same URL");
					assert.equal(
						appState.get("type"),
						"cat",
						"hash populates the appState"
					);
					assert.equal(appState.get("id"), "5", "hash populates the appState");
					assert.equal(
						appState.get("section"),
						"home",
						"appState keeps its properties"
					);
					assert.ok(
						canRoute.data === appState,
						"canRoute.data is the same as appState"
					);

					mockRoute.stop();
					done();
				};

				mockRoute.hash.value = "#!cat/5"; // type and id get added ... this will call update url to add everything
				canRoute.start();
			}
		);

		QUnit.test("sticky enough routes (canjs#36)", function(assert) {
			var done = assert.async();

			mockRoute.start();
			canRoute.register("active");
			canRoute.register("");

			mockRoute.hash.set("#active");
			canRoute.start();

			setTimeout(function() {
				var after = mockRoute.hash.get();
				assert.equal(after, "active");
				mockRoute.stop();
				done();
			}, 30);
		});

		QUnit.test("canRoute.current is live-bindable (#1156)", function(assert) {
			var ready = assert.async();
			mockRoute.start();

			canRoute.start();
			var isOnTestPage = new Observation(function isCurrent() {
				return canRoute.isCurrent({ page: "test" });
			});

			canReflect.onValue(isOnTestPage, function isCurrentChanged() {
				// unbind now because isCurrent depends on urlData
				isOnTestPage.off();
				mockRoute.stop();
				ready();
			});

			assert.equal(
				canRoute.isCurrent({ page: "test" }),
				false,
				"initially not on test page"
			);
			setTimeout(function() {
				canRoute.data.set("page", "test");
			}, 20);
		});

		QUnit.test("can.compute.read should not call canRoute (#1154)", function(
			assert
		) {
			var ready = assert.async();
			mockRoute.start();
			canRoute.attr("page", "test");
			canRoute.start();

			var val = stacheKey.read({ route: canRoute }, stacheKey.reads("route"))
				.value;

			setTimeout(function() {
				assert.equal(val, canRoute, "read correctly");
				mockRoute.stop();
				ready();
			}, 1);
		});

		QUnit.test("routes should deep clean", function(assert) {
			var ready = assert.async();
			assert.expect(2);

			mockRoute.start();

			var hash1 = canRoute.url({
				panelA: {
					name: "fruit",
					id: 15,
					show: true
				}
			});
			var hash2 = canRoute.url({
				panelA: {
					name: "fruit",
					id: 20,
					read: false
				}
			});
			mockRoute.hash.value = hash1;
			mockRoute.hash.value = hash2;

			canRoute._onStartComplete = function() {
				assert.equal(canRoute.data.get("panelA").id, 20, "id should change");
				assert.equal(
					canRoute.data.get("panelA").show,
					undefined,
					"show should be removed"
				);
				mockRoute.stop();
				ready();
			};

			canRoute.start();
		});

		QUnit.test(
			"updating bound ObservableObject causes single update with a coerced string value",
			function(assert) {
				var ready = assert.async();
				assert.expect(1);

				canRoute.start();

				class MyMap extends ObservableObject {
					static get propertyDefaults() {
						return {
							type: type.maybeConvert(String)
						};
					}
				}

				var appVM = new MyMap();

				canRoute.data = appVM;

				canRoute._onStartComplete = function() {
					appVM.on("action", function(ev, newVal) {
						assert.strictEqual(newVal, "10");
					});

					appVM.set("action", 10);

					// check after 30ms to see that we only have a single call
					setTimeout(function() {
						mockRoute.stop();
						ready();
					}, 5);
				};
				canRoute.start();
			}
		);

		QUnit.test("hash doesn't update to itself with a !", function(assert) {
			var done = assert.async();
			window.routeTestReady = function(iCanRoute, loc) {
				iCanRoute.start();
				iCanRoute.register("{path}");

				iCanRoute.attr("path", "foo");
				setTimeout(function() {
					var counter = 0;
					try {
						assert.equal(loc.hash, "#!foo");
					} catch (e) {
						done();
						throw e;
					}

					iCanRoute.serializedCompute.bind("change", function() {
						counter++;
					});

					loc.hash = "bar";
					setTimeout(function() {
						try {
							assert.equal(loc.hash, "#bar");
							assert.equal(counter, 1); //sanity check -- bindings only ran once before this change.
						} finally {
							done();
						}
					}, 100);
				}, 100);
			};
			var iframe = document.createElement("iframe");
			iframe.src = __dirname + "/define-testing.html?1";
			this.fixture.appendChild(iframe);
		});
	}

	QUnit.test("escaping periods", function(assert) {
		canRoute.routes = {};
		canRoute.register("{page}\\.html", {
			page: "index"
		});

		var obj = canRoute.deparam("can.Control.html");
		assert.deepEqual(obj, {
			page: "can.Control"
		});

		assert.equal(
			canRoute.param({
				page: "can.Control"
			}),
			"can.Control.html"
		);
	});

	if (typeof require !== "undefined") {
		QUnit.test("correct stringing", function(assert) {
			mockRoute.start();

			canRoute.data = new RouteData();
			canRoute.routes = {};

			canRoute.attr({
				number: 1,
				bool: true,
				string: "hello",
				array: [1, true, "hello"]
			});

			assert.deepEqual(canRoute.attr(), {
				number: "1",
				bool: "true",
				string: "hello",
				array: ["1", "true", "hello"]
			});
			canReflect.update(canRoute.data, {});

			canRoute.attr({
				number: 1,
				bool: true,
				string: "hello",
				array: [2, false, "world"],
				obj: {
					number: 3,
					array: [4, true]
				}
			});

			assert.deepEqual(
				canRoute.attr(),
				{
					number: "1",
					bool: "true",
					string: "hello",
					array: ["2", "false", "world"],
					obj: {
						number: "3",
						array: ["4", "true"]
					}
				},
				"nested object"
			);

			canRoute.routes = {};
			canRoute.register("{type}/{id}");
			canRoute.start();

			canReflect.update(canRoute.data, {});

			canRoute.attr({
				type: "page",
				id: 10,
				sort_by_name: true
			});

			assert.propEqual(canRoute.attr(), {
				type: "page",
				id: "10",
				sort_by_name: "true"
			});
		});
	}

	QUnit.test("on/off binding", function(assert) {
		canRoute.routes = {};
		assert.expect(1);

		canRoute.on("foo", function() {
			assert.ok(true, "foo called");

			canRoute.off("foo");

			canRoute.attr("foo", "baz");
		});

		canRoute.attr("foo", "bar");
	});

	QUnit.test(
		"two way binding canRoute.map with ObservableObject instance",
		function(assert) {
			assert.expect(2);
			var done = assert.async();
			mockRoute.start();

			class AppState extends ObservableObject {
				static get propertyDefaults() {
					return {
						type: type.maybeConvert(String)
					};
				}
			}
			var appState = new AppState();

			canRoute.data = appState;
			canRoute.start();

			canRoute.serializedCompute.bind("change", function() {
				assert.equal(
					canRoute.attr("name"),
					"Brian",
					"appState is bound to canRoute"
				);
				canRoute.serializedCompute.unbind("change");
				appState.name = undefined;

				setTimeout(function() {
					assert.equal(mockRoute.hash.get(), "");
					mockRoute.stop();
					done();
				}, 20);
			});

			appState.set("name", "Brian");
		}
	);

	QUnit.test(".url with merge=true", function(assert) {
		mockRoute.start();

		class AppState extends ObservableObject {
			static get propertyDefaults() {
				return {
					type: type.maybeConvert(String)
				};
			}
		}
		var appState = new AppState({});

		canRoute.data = appState;
		canRoute.start();

		var done = assert.async();

		appState.set("foo", "bar");

		// TODO: expose a way to know when the url has changed.
		setTimeout(function() {
			var result = canRoute.url({ page: "recipe", id: 5 }, true);
			assert.equal(result, "#!&foo=bar&page=recipe&id=5");

			mockRoute.stop();
			done();
		}, 20);
	});
}

QUnit.test("param with whitespace in interpolated string (#45)", function(
	assert
) {
	canRoute.routes = {};
	canRoute.register("{ page }", {
		page: "index"
	});

	var res = canRoute.param({
		page: "index"
	});
	assert.equal(res, "");

	canRoute.register("pages/{ p1 }/{    p2   }/{	p3	}", {
		p1: "index",
		p2: "foo",
		p3: "bar"
	});

	res = canRoute.param({
		p1: "index",
		p2: "foo",
		p3: "bar"
	});
	assert.equal(res, "pages///");

	res = canRoute.param({
		p1: "index",
		p2: "baz",
		p3: "bar"
	});
	assert.equal(res, "pages//baz/");
});

QUnit.test(
	"triggers __url event anytime a there's a change to individual properties",
	function(assert) {
		mockRoute.start();

		class AppState extends ObservableObject {
			static get propertyDefaults() {
				return {
					type: type.maybeConvert(String)
				};
			}
			static get props() {
				return {
					page: type.maybeConvert(String),
					section: type.maybeConvert(String)
				};
			}
		}
		var appState = new AppState({});

		canRoute.data = appState;
		canRoute.register("{page}");
		canRoute.register("{page}/{section}");

		var done = assert.async();
		canRoute.start();

		var timeoutID = setTimeout(function page_two() {
			canRoute.data.page = "two";
		}, 50);

		var matchedCount = 0;
		var onMatchCall = {
			1: function section_a() {
				canRoute.data.section = "a";
			},
			2: function section_b() {
				canRoute.data.section = "b";
			},
			3: function() {
				// 1st call is going from undefined to empty string
				assert.equal(
					matchedCount,
					3,
					"calls __url event every time a property is changed"
				);

				mockRoute.stop();
				clearTimeout(timeoutID);
				done();
			}
		};
		canRoute.on("__url", function updateMatchedCount() {
			// any time a route property is changed, not just the matched route
			matchedCount++;
			onMatchCall[matchedCount]();
		});
	}
);

QUnit.test(
	"updating unserialized prop on bound ObservableObject causes single update without a coerced string value",
	function(assert) {
		var ready = assert.async();
		assert.expect(1);
		canRoute.routes = {};
		mockRoute.start();

		class AppState extends ObservableObject {
			static get props() {
				return {
					action: {
						serialize: false,
						type: type.Any
					}
				};
			}
		}
		var appVM = new AppState();

		canRoute.data = appVM;
		canRoute.start();

		appVM.bind("action", function(ev, newVal) {
			assert.equal(typeof newVal, "function");
		});

		appVM.set("action", function() {});

		// check after 30ms to see that we only have a single call
		setTimeout(function() {
			mockRoute.stop();
			ready();
		}, 5);
	}
);
