var canRoute = require("can-route");
var QUnit = require("steal-qunit");
var SimpleMap = require("can-simple-map");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var mockRoute = require("./mock-route-binding");
var RouteData = require("../src/routedata");

require("can-observation");

QUnit.module("can-route.data", {
	beforeEach: function(assert) {
		canRoute._teardown();
		canRoute.defaultBinding = "hashchange";
		this.fixture = document.getElementById("qunit-fixture");
	}
});


QUnit.test("can-route.data can be set to an element with a viewModel", function(assert) {
    var element = document.createElement("div");

    var vm = new SimpleMap();
    element[canSymbol.for("can.viewModel")] = vm;

    canRoute.data = element;


    assert.equal(canRoute.data, vm, "works");
});


QUnit.test("Default map registers properties", function(assert) {
    var ready = assert.async();
    mockRoute.start();

    canRoute.register("{type}/{id}");

    canRoute._onStartComplete = function () {
		var after = mockRoute.hash.get();
		assert.equal(after, "cat/5", "same URL");
		assert.equal(canRoute.data.type, "cat", "conflicts should be won by the URL");
		assert.equal(canRoute.data.id, "5", "conflicts should be won by the URL");
		ready();
		mockRoute.stop();
	};

    mockRoute.hash.value = "#!cat/5";
    canRoute.start();
});

QUnit.test("Property defaults influence the Type", function(assert) {
    var ready = assert.async();
    mockRoute.start();

    canRoute.register("{type}/{id}/{more}", { type: "dog", "id": 14, more: null });

    canRoute._onStartComplete = function () {
		var after = mockRoute.hash.get();
		assert.equal(after, "cat/7/stuff", "same URL");
		assert.equal(canRoute.data.type, "cat", "conflicts should be won by the URL");
		assert.deepEqual(canRoute.data.id, 7, "conflicts should be won by the URL");
		assert.deepEqual(canRoute.data.more, "stuff", "null defaults are converted");
		ready();
		mockRoute.stop();
	};

    mockRoute.hash.value = "#!cat/7/stuff";
    canRoute.start();
});
QUnit.test("Default map registers defaults as properties", function(assert) {
		var ready = assert.async();
		mockRoute.start();

		canRoute.register("{page}", { page: "home", path: undefined, prop: 13 });

		canRoute._onStartComplete = function () {
			assert.equal(canRoute.data.path, undefined);
			assert.equal(canRoute.data.prop, 13);

			var howMany = 2;
			var onDone = function(){
				howMany--;
				if(howMany === 0) {
					ready();
					mockRoute.stop();
				}
			};
			canReflect.onKeyValue(canRoute.data, "path", function onPath() {
				canReflect.offKeyValue(canRoute.data, "path", onPath);
				assert.equal(canRoute.data.path, "one");
				onDone();
			});
			canReflect.onKeyValue(canRoute.data, "prop", function onProp() {
				canReflect.offKeyValue(canRoute.data, "prop", onProp);
				assert.deepEqual(canRoute.data.prop, 16);
				onDone();
			});

			mockRoute.hash.value = "#!home&path=one&prop=16";
		};

		mockRoute.hash.value = "#!";
    canRoute.start();
});

QUnit.test("route.register should not read route.data, register first", function (assert) {
	var done = assert.async();
	mockRoute.start();

	canRoute.register("{page}/{subpage}");
	canRoute.data = new RouteData();

	canRoute._onStartComplete = function () {
		assert.ok('page' in canRoute.data);
		assert.ok('subpage' in canRoute.data);
		done();
		mockRoute.stop();
	};

	canRoute.start();
});

QUnit.test("route.register should not read route.data 2, start first", function (assert) {
	var done = assert.async();
	mockRoute.start();

	canRoute.data = new RouteData();
	canRoute.register("{page}/{subpage}");

	canRoute._onStartComplete = function () {
		assert.ok('page' in canRoute.data);
		assert.ok('subpage' in canRoute.data);
		done();
		mockRoute.stop();
	};

	
	canRoute.start();
});
