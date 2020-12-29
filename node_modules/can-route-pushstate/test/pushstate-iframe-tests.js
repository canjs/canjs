/*jshint scripturl:true*/
var domEvents = require('can-dom-events');
var extend = require('can-assign');
var route = require('can-route');
var RoutePushstate = require('../can-route-pushstate');

module.exports.makeTest = function(mapModuleName) {
	QUnit.module("can-route-pushstate with " + mapModuleName, {
		beforeEach: function() {
			route.urlData = new RoutePushstate();
			window.MAP_MODULE_NAME = mapModuleName;
		}
	});


	// Start steal-only
	if (typeof steal !== 'undefined') {

		var makeTestingIframe = function (callback, testHTML) {
			var iframe = document.createElement('iframe');

			window.routeTestReady = function (iCanRoute, loc, history, win) {
				callback({
					route: iCanRoute,
					location: loc,
					history: history,
					window: win,
					iframe: iframe
				}, function () {
					iframe.onload = null;
					iframe.parentNode.removeChild(iframe);
					delete window.routeTestReady;
				});
			};

			testHTML = testHTML || __dirname + "/testing.html";
			iframe.src = testHTML + "?" + Math.random();
			document.getElementById("qunit-fixture").appendChild(iframe);
		};

		QUnit.test("updating the url", function(assert) {
			var done = assert.async();
			makeTestingIframe(function (info, cleanup) {
				info.route.start();
				info.route("/{type}/{id}");
				info.route.attr({
					type: "bar",
					id: "5"
				});

				setTimeout(function () {
					var after = info.location.pathname;
					assert.equal(after, "/bar/5", "path is " + after);
					cleanup();

					done();

				}, 100);
			});

		});

		QUnit.test("currentRule should signal when it is read", function(assert) {
			var done = assert.async();

			makeTestingIframe(function(info, cleanup) {
				info.history.pushState(null, null, "/");

				info.route.register("");
				info.route.register("{page}", { foo: "baz" });
				info.route.start();

				info.window.ObservationRecorder.start();
				info.history.pushState(null, null, "home");
				var deps = info.window.ObservationRecorder.stop();

				assert.ok(deps.valueDependencies.has(info.route.urlData));
				cleanup();
				done();
			});
		});

		QUnit.test("sticky enough routes", function(assert) {
			var done = assert.async();
			makeTestingIframe(function (info, cleanup) {
				info.route("/active");
				info.route("");
				info.history.pushState(null, null, "/active");

				setTimeout(function () {
					var after = info.location.pathname;
					assert.equal(after, "/active");
					cleanup();

					done();
				}, 30);
			});
		});

		QUnit.test("unsticky routes", function(assert) {

			var done = assert.async();
			window.routeTestReady = function (iCanRoute, loc, iframeHistory) {
				// check if we can even test this
				iframeHistory.pushState(null, null, "/bar/" + encodeURIComponent("\/"));
				setTimeout(function timer() {

					if ("/bar/" + encodeURIComponent("\/") === loc.pathname) {
						runTest();

					} else if (loc.pathname.indexOf("/bar/") >= 0) {
						//  encoding doesn't actually work
						assert.ok(true, "can't test!");
						iframe.parentNode.removeChild(iframe);
						done();
					} else {
						setTimeout(timer, 30);
					}
				}, 30);
				var runTest = function () {
					iCanRoute.start();
					iCanRoute("/{type}");
					iCanRoute("/{type}/{id}");
					iCanRoute.attr({
						type: "bar"
					});

					setTimeout(function () {
						var after = loc.pathname;
						assert.equal(after, "/bar", "only type is set");
						iCanRoute.attr({
							type: "bar",
							id: "\/"
						});

						// check for 1 second
						var time = new Date();
						setTimeout(function innerTimer() {
							var after = loc.pathname;

							if (after === "/bar/" + encodeURIComponent("\/")) {
								assert.equal(after, "/bar/" + encodeURIComponent("\/"), "should go to type/id");
								iframe.parentNode.removeChild(iframe);
								done();
							} else if (new Date() - time > 2000) {
								assert.ok(false, "hash is " + after);
								iframe.parentNode.removeChild(iframe);
							} else {
								setTimeout(innerTimer, 30);
							}

						}, 30);

					}, 30);
				};

			};
			var iframe = document.createElement('iframe');
			iframe.src = __dirname + "/testing.html?1";
			document.getElementById("qunit-fixture").appendChild(iframe);
		});


		QUnit.test("clicked hashes work (#259)", function(assert) {

			var done = assert.async();
			window.routeTestReady = function (iCanRoute, loc, hist, win) {
				//win.queues.log("flush");
				iCanRoute(win.location.pathname, {
					page: "index"
				});

				iCanRoute("{type}/{id}");
				iCanRoute.start();

				window.win = win;
				var link = win.document.createElement("a");
				link.href = "/articles/17#references";
				link.innerHTML = "Click Me";

				win.document.body.appendChild(link);
				domEvents.dispatch(link, "click");

				setTimeout(function () {
					assert.deepEqual(extend({}, iCanRoute.attr()), {
						type: "articles",
						id: "17",
					}, "articles have the right route data");

					assert.equal(iCanRoute.matched(), "{type}/{id}", "articles have the right matched route");

					assert.equal(win.location.hash, "#references", "includes hash");

					done();

					iframe.parentNode.removeChild(iframe);

				}, 100);
			};
			var iframe = document.createElement('iframe');
			iframe.src = __dirname + "/testing.html";
			document.getElementById('qunit-fixture').appendChild(iframe);
		});


		QUnit.test("loading a page with a hash works (#95)", function(assert) {
			// For some reason this test stalled.  Adding checks to hopefully
			// identify the cause if this test fails again.
			var routeTestReadyCalled = false;
			setTimeout(function(){
				if(!routeTestReadyCalled) {
					assert.ok(routeTestReadyCalled, "route test ready called");
					done();
				}
			},60000);

			var done = assert.async();
			window.routeTestReady = function (iCanRoute, loc, hist, win) {
				routeTestReadyCalled = true;

				iCanRoute(win.location.pathname, {
					page: "index"
				});

				iCanRoute("{type}/{id}");
				iCanRoute.start();
				assert.equal(win.location.hash, "#thisIsMyHash", "hash right after start");

				// For some reason this test stalled.  Adding checks to hopefully
				// identify the cause if this test fails again.
				var timeoutCalled = false;
				setTimeout(function(){
					if(!timeoutCalled) {
						assert.ok(timeoutCalled, "timeout called");
						done();
					}
				},60000);

				setTimeout(function(){
					timeoutCalled = true;
					assert.equal(win.location.hash, "#thisIsMyHash", "hash right after delay");
					done();
				},100);

			};
			var iframe = document.createElement('iframe');
			iframe.src = __dirname + "/testing.html#thisIsMyHash";
			document.getElementById('qunit-fixture').appendChild(iframe);
		});

		QUnit.test("preventDefault not called when only the hash changes (can-route-pushstate#75)", function(assert) {

			var done = assert.async();
			window.routeTestReady = function (iCanRoute, loc, hist, win) {

				iCanRoute(win.location.pathname, {
					page: "index"
				});

				iCanRoute("{type}/{id}");
				iCanRoute.start();

				var link = win.document.createElement("a");
				link.href = "#hash-target";
				link.innerHTML = "Click Me";

				win.document.body.appendChild(link);

				// Detect if can-route-pushstate’s click handler calls preventDefault by overriding it
				var defaultPrevented = false;
				link.addEventListener('click', function(event) {
					event.preventDefault = function() {
						defaultPrevented = true;
					};
				});

				domEvents.dispatch(link, "click");

				assert.notOk(defaultPrevented, "preventDefault was not called");

				assert.equal(win.location.hash, "#hash-target", "includes hash");

				done();

				iframe.parentNode.removeChild(iframe);
			};
			var iframe = document.createElement('iframe');
			iframe.src = __dirname + "/testing.html";
			document.getElementById('qunit-fixture').appendChild(iframe);
		});

		QUnit.test("javascript:// links do not get pushstated", function(assert) {
			var done = assert.async();
			makeTestingIframe(function (info, cleanup) {
				info.route("{type}", { type: "yay" });
				info.route.start();


				var window = info.window;
				var link = window.document.createElement("a");
				link.href = "javascript://";
				link.innerHTML = "Click Me";

				window.document.body.appendChild(link);
				try {
					domEvents.dispatch(link, "click");
					assert.ok(true, "Clicking javascript:// anchor did not cause a security exception");
				} catch(err) {
					assert.ok(false, "Clicking javascript:// anchor caused a security exception");
				}

				cleanup();
				done();
			});
		});

		QUnit.test("javascript: void(0) links get pushstated", function(assert) {
			var done = assert.async();
			makeTestingIframe(function (info, cleanup) {
				info.route(":type", { type: "yay" });
				info.route.start();


				var window = info.window;
				var link = window.document.createElement("a");
				link.href = "javascript: void(0)";
				link.innerHTML = "Click Me";

				window.document.body.appendChild(link);
				try {
					domEvents.dispatch(link, "click");
					assert.ok(true, "Clicking javascript: void(0) anchor did not cause a security exception");
				} catch(err) {
					assert.ok(false, "Clicking javascript: void(0) anchor caused a security exception");
				}

				cleanup();
				done();
			});
		});

		QUnit.test("links with target=_blank do not get pushstated", function(assert) {
			var done = assert.async();
			makeTestingIframe(function (info, cleanup) {
				info.route(":type", { type: "yay" });
				info.route.start();


				var window = info.window;
				var link = window.document.createElement("a");
				link.href = "/yay";
				link.target = "_blank";
				link.innerHTML = "Click Me";

				window.document.body.appendChild(link);
				try {
					domEvents.dispatch(link, "click");
					assert.ok(true, "Clicking anchor with blank target did not cause a security exception");
				} catch(err) {
					assert.ok(false, "Clicking anchor with blank target caused a security exception");
				}

				cleanup();
				done();
			});
		});

		QUnit.test("clicking on links while holding meta key do not get pushstated", function(assert) {
			var done = assert.async();
			makeTestingIframe(function (info, cleanup) {
				info.route(":type", { type: "yay" });
				info.route.start();


				var window = info.window;
				var link = window.document.createElement("a");
				link.href = "/heyo";
				link.innerHTML = "Click Me";

				window.document.body.appendChild(link);
				try {
					domEvents.dispatch(link, {type: 'click', metaKey: true});
					assert.ok(true, "Clicking anchor with while holding a meta key did not cause a security exception");
				} catch(err) {
					assert.ok(false, "Clicking anchor with while holding a meta key caused a security exception");
				}

				cleanup();
				done();
			});
		});

		if(window.parent === window) {
			// we can't call back if running in multiple frames
			QUnit.test("no doubled history states (#656)", function(assert) {
				var done = assert.async();

				window.routeTestReady = function (iCanRoute, loc, hist, win) {
					function getPage(){
						var path = win.location.pathname;
						// strip root for deparam
						if (path.indexOf(root) === 0) {
							path = path.substr(root.length);
						}
						return win.route.deparam(path).page;
					}

					var root = loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1);
					var stateTest = -1,
						message;

					function nextStateTest() {
						stateTest++;
						win.route.attr("page", "start");

						function nextTest(){
							if (stateTest === 0) {
								message = "route.attr";
								win.route.attr("page", "test");
							} else if (stateTest === 1) {
								message = "history.pushState";
								win.history.pushState(null, null, root + "test/");
							} else {
								done();
								iframe.parentNode.removeChild(iframe);
								return;
							}

							function callBack(){
								// call back, it should always go back to page=start
								win.history.back();

								function checkIfBackToStartAndGoToTheNextTest(){
									var page = getPage();
									if(page === "start") {
										assert.equal(page, "start", message + " passed");
										nextStateTest();
									} else {
										setTimeout(checkIfBackToStartAndGoToTheNextTest,50);
									}
								}
								setTimeout(checkIfBackToStartAndGoToTheNextTest, 50);
							}

							function checkPageIsNotStart(){
								if(getPage() !== "start") {
									callBack();
								} else {
									setTimeout(checkPageIsNotStart,50);
								}
							}

							setTimeout(checkPageIsNotStart, 50);
						}

						function checkThatPageIsStillStart(){
							if(getPage() === "start") {
								nextTest();
							} else {
								setTimeout(checkThatPageIsStillStart,50);
							}
						}

						setTimeout(checkThatPageIsStillStart,50);
					}

					win.route.urlData.root = root;
					win.route("{page}/");
					win.route._onStartComplete = nextStateTest;
					win.route.start();

				};

				var iframe = document.createElement("iframe");
				iframe.src = __dirname + "/testing.html";
				document.getElementById('qunit-fixture').appendChild(iframe);
			});

			QUnit.test("URL's don't greedily match", function(assert) {
				var done = assert.async();
				makeTestingIframe(function(info, cleanup){
					info.route.urlData.root = "testing.html";
					info.route("{module}\\.html");

					info.route._onStartComplete = function(){
						assert.ok(!info.route.attr('module'), 'there is no route match');
						cleanup();

						done();
					};

					info.route.start();

				});
			});

		}

		QUnit.test("routed links must descend from pushstate root (#652)", function(assert) {
			assert.expect(2);
			var done = assert.async();

			var setupRoutesAndRoot = function (iCanRoute, root) {
				iCanRoute("{section}/");
				iCanRoute("{section}/{sub}/");
				iCanRoute.urlData.root = root;
				iCanRoute.start();
			};


			var createLink = function (win, url) {
				var link = win.document.createElement("a");
				link.href = link.innerHTML = url;
				win.document.body.appendChild(link);
				return link;
			};

			// The following makes sure a link that is not "rooted" will
			// behave normally and not call pushState
			makeTestingIframe(function (info, cleanup) {
				setupRoutesAndRoot(info.route, "/app/");
				var link = createLink(info.window, "/route/pushstate/empty.html"); // a link to somewhere outside app

				var clickKiller = function(ev) {
					if(ev.preventDefault) {
						ev.preventDefault();
					}
					return false;
				};
				// kill the click b/c phantom doesn't like it.
				domEvents.addEventListener(info.window.document, "click", clickKiller);

				info.history.pushState = function () {
					assert.ok(false, "pushState should not have been called");
				};

				// click a link and make sure the iframe url changes
				domEvents.dispatch(link, "click");
				cleanup();
				//done();
				setTimeout(next, 10);
			});

			var next = function () {
				makeTestingIframe(function (info, cleanup) {
					info.route.serializedCompute.bind("change", function () {
						// deepEqual doesn't like to compare objects from different contexts
						// so we copy it
						var obj = extend({}, info.route.attr());

						assert.deepEqual(obj, {
							section: "something",
							sub: "test",
						}, "route's data is correct");

						assert.equal(info.route.matched(), "{section}/{sub}/",
							"route's matched property is correct");

						cleanup();
						done();
					});

					setupRoutesAndRoot(info.route, "/app/");
					var link = createLink(info.window, "/app/something/test/");
					domEvents.dispatch(link, "click");



				});
			};
		});

		QUnit.test("replaceStateOn makes changes to an attribute use replaceState (#1137)", function(assert) {
			var done = assert.async();

			makeTestingIframe(function(info, cleanup){
				info.history.pushState = function () {
					assert.ok(false, "pushState should not have been called");
				};

				info.history.replaceState = function () {
					assert.ok(true, "replaceState called");
				};

				info.route.urlData.replaceStateOn("ignoreme");

				info.route.start();
				info.route.attr('ignoreme', 'yes');

				setTimeout(function(){
					cleanup();
					done();
				}, 30);
			});
		});

		QUnit.test("replaceStateOn makes changes to multiple attributes use replaceState (#1137)", function(assert) {
			var done = assert.async();

			makeTestingIframe(function(info, cleanup){
				info.history.pushState = function () {
					assert.ok(false, "pushState should not have been called");
				};

				info.history.replaceState = function () {
					assert.ok(true, "replaceState called");
				};

				info.route.urlData.replaceStateOn("ignoreme", "metoo");

				info.route.start();
				info.route.attr('ignoreme', 'yes');

				setTimeout(function(){
					info.route.attr('metoo', 'yes');

					setTimeout(function(){
						cleanup();
						done();
					}, 30);

				}, 30);
			});
		});

		QUnit.test("replaceStateOnce makes changes to an attribute use replaceState only once (#1137)", function(assert) {
			var done = assert.async();
			var replaceCalls = 0,
				pushCalls = 0;

			makeTestingIframe(function(info, cleanup){
				info.history.pushState = function () {
					pushCalls++;
				};

				info.history.replaceState = function () {
					replaceCalls++;
				};

				info.route.urlData.replaceStateOnce("ignoreme", "metoo");

				info.route.start();
				info.route.attr('ignoreme', 'yes');

				setTimeout(function(){
					info.route.attr('ignoreme', 'no');

					setTimeout(function() {
						assert.equal(replaceCalls, 1);
						assert.equal(pushCalls, 1);
						cleanup();
						done();
					}, 30);

				}, 30);
			});
		});

		QUnit.test("replaceStateOff makes changes to an attribute use pushState again (#1137)", function(assert) {
			var done = assert.async();

			makeTestingIframe(function(info, cleanup){
				info.history.pushState = function () {
					assert.ok(true, "pushState called");
				};

				info.history.replaceState = function () {
					assert.ok(false, "replaceState should not be called called");
				};

				info.route.urlData.replaceStateOn("ignoreme");
				info.route.urlData.replaceStateOff("ignoreme");

				info.route.start();
				info.route.attr('ignoreme', 'yes');

				setTimeout(function(){
					cleanup();
					done();
				}, 30);
			});
		});

		QUnit.test("Binding not added if not using the http/s protocols", function(assert) {
			var done = assert.async();

			makeTestingIframe(function(info, cleanup){
				assert.equal(info.route.defaultBinding, "hashchange", "using hashchange routing");
				cleanup();
				done();
			}, __dirname + "/testing-nw.html");
		});

		QUnit.test("Binding is added if there is no protocol (can-simple-dom uses an empty string as the protocol)", function(assert) {
			var done = assert.async();

			makeTestingIframe(function(info, cleanup){
				assert.ok(true, "We got this far which means things did not blow up");
				cleanup();
				done();
			}, __dirname + "/testing-ssr.html");
		});

		QUnit.test("Calling route.stop() works", function(assert) {
			var done = assert.async();

			makeTestingIframe(function(info, cleanup){
				info.route.start();
				try {
					info.route.stop();
					assert.ok(true, "Able to call stop");
				} catch(err) {
					assert.ok(false, err.message);
				}

				cleanup();
				done();
			});
		});

		QUnit.test("Check if prevent default is called when pushState throws an error (#116)", function(assert) {
			var done = assert.async();

			makeTestingIframe(function(info, cleanup){

				var win = info.window;

				// matching default route to test url.
				info.route(win.location.pathname, {
					page: "index"
				});

				info.route("{type}/{id}");

				info.route.start();

				// creating link that we'll test the prevent default
				var link = win.document.createElement("a");
				link.href = "/articles/17";
				link.innerHTML = "Click Me";
				win.document.body.appendChild(link);

				info.route._onStartComplete = function() {
					var event = win.document.createEvent('HTMLEvents');

					event.preventDefault = function() {
						assert.ok(true, 'prevent default is called');
					};

					// Simulate clicking the link to check if preventDefault is called.
					event.initEvent('click', true, true);

					info.history.pushState = function () {
						throw new Error("an error happened in pushState");
					};

					try {
						link.dispatchEvent(event);
					} finally {
						cleanup();
						done();
					}
				};
			});
		});
	}
}
