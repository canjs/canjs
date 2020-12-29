/* jshint asi:true,scripturl:true */
var QUnit = require('steal-qunit');
var RoutePushstate = require('../can-route-pushstate');
var route = require('can-route');
var globals = require('can-globals');

module.exports.makeTest = function(mapModuleName) {
	var mapModuleImport = System.import(mapModuleName);

	QUnit.module("can-route-pushstate with " + mapModuleName, {
		beforeEach: function(assert) {
			return mapModuleImport.then(function(MapModule) {
				route.data = new MapModule();
				route.urlData = new RoutePushstate();
			});
		}
	});

	QUnit.test("deparam", function(assert) {
		route.routes = {};
		route("{page}", {
			page: "index"
		});

		var obj = route.deparam("can.Control");
		assert.deepEqual(obj, {
			page: "can.Control"
		});

		obj = route.deparam("");
		assert.deepEqual(obj, {
			page: "index"
		});

		obj = route.deparam("can.Control?where=there");
		assert.deepEqual(obj, {
			page: "can.Control",
			where: "there"
		});

		route.routes = {};
		route("{page}/{index}", {
			page: "index",
			index: "foo"
		});

		obj = route.deparam("can.Control/?where=there");
		assert.deepEqual(obj, {
			page: "can.Control",
			index: "foo",
			where: "there"
		});
	});

	QUnit.test("deparam of invalid url", function(assert) {
		var obj;

		route.routes = {};
		route("pages/{var1}/{var2}/{var3}", {
			var1: 'default1',
			var2: 'default2',
			var3: 'default3'
		});

		// This path does not match the above route, and since the hash is not
		// a &key=value list there should not be data.
		obj = route.deparam("pages//");
		assert.deepEqual(obj, {});

		// A valid path with invalid parameters should return the path data but
		// ignore the parameters.
		obj = route.deparam("pages/val1/val2/val3?invalid-parameters");
		assert.deepEqual(obj, {
			var1: 'val1',
			var2: 'val2',
			var3: 'val3'
		});
	})

	QUnit.test("deparam of url with non-generated hash (manual override)", function(assert) {
		var obj;

		route.routes = {};

		// This won't be set like this by route, but it could easily happen via a
		// user manually changing the URL or when porting a prior URL structure.
		obj = route.deparam("?page=foo&bar=baz&where=there");
		assert.deepEqual(obj, {
			page: 'foo',
			bar: 'baz',
			where: 'there'
		});
	})

	QUnit.test("param", function(assert) {
		route.routes = {};
		route("pages/{page}", {
			page: "index"
		})

		var res = route.param({
			page: "foo"
		});
		assert.equal(res, "pages/foo")

		res = route.param({
			page: "foo",
			index: "bar"
		});
		assert.equal(res, "pages/foo?index=bar")

		route("pages/{page}/{foo}", {
			page: "index",
			foo: "bar"
		})

		res = route.param({
			page: "foo",
			foo: "bar",
			where: "there"
		});
		assert.equal(res, "pages/foo/?where=there")

		// There is no matching route so the hash should be empty.
		res = route.param({});
		assert.equal(res, "")

		route.routes = {};

		res = route.param({
			page: "foo",
			bar: "baz",
			where: "there"
		});
		assert.equal(res, "?page=foo&bar=baz&where=there")

		res = route.param({});
		assert.equal(res, "")
	});

	QUnit.test("symmetry", function(assert) {
		route.routes = {};

		var obj = {
			page: "=&[]",
			nestedArray: ["a"],
			nested: {
				a: "b"
			}
		}

		var res = route.param(obj)

		var o2 = route.deparam(res)
		assert.deepEqual(o2, obj)
	})

	QUnit.test("light param", function(assert) {
		route.routes = {};
		route("{page}", {
			page: "index"
		})

		var res = route.param({
			page: "index"
		});
		assert.equal(res, "")

		route("pages/{p1}/{p2}/{p3}", {
			p1: "index",
			p2: "foo",
			p3: "bar"
		})

		res = route.param({
			p1: "index",
			p2: "foo",
			p3: "bar"
		});
		assert.equal(res, "pages///")

		res = route.param({
			p1: "index",
			p2: "baz",
			p3: "bar"
		});
		assert.equal(res, "pages//baz/")
	});

	QUnit.test('param doesnt add defaults to params', function(assert) {
		route.routes = {};

		route("pages/{p1}", {
			p2: "foo"
		})
		var res = route.param({
			p1: "index",
			p2: "foo"
		});
		assert.equal(res, "pages/index")
	})

	QUnit.test("param-deparam", function(assert) {

		route("{page}/{type}", {
			page: "index",
			type: "foo"
		})

		var data = {
			page: "can.Control",
			type: "document",
			bar: "baz",
			where: "there"
		};
		var res = route.param(data);
		var obj = route.deparam(res);

		assert.deepEqual(obj, data, "{page}/{type} with query string");
		data = {
			page: "can.Control",
			type: "foo",
			bar: "baz",
			where: "there"
		};
		res = route.param(data);
		obj = route.deparam(res);

		assert.deepEqual(data, obj, "{page}/{type} with query string");

		data = {
			page: " a ",
			type: " / "
		};
		res = route.param(data);
		obj = route.deparam(res);
		delete obj.route;
		assert.deepEqual(obj, data, "slashes and spaces")

		data = {
			page: "index",
			type: "foo",
			bar: "baz",
			where: "there"
		};
		// adding the / should not be necessary.  route.deparam removes / if the root starts with /
		res = "/" + route.param(data);
		obj = route.deparam(res);
		delete obj.route;
		assert.deepEqual(data, obj, "/{page}/{type} starting slash with removed defaults");

		route.routes = {};

		data = {
			page: "foo",
			bar: "baz",
			where: "there"
		};
		res = route.param(data);
		obj = route.deparam(res);
		assert.deepEqual(data, obj)
	})

	QUnit.test("deparam-param", function(assert) {
		route.routes = {};
		route("{foo}/{bar}", {
			foo: 1,
			bar: 2
		});
		var res = route.param({
			foo: 1,
			bar: 2
		});
		assert.equal(res, "/", "empty slash")

		// you really should deparam with root ..
		var deparamed = route.deparam("//")
		assert.deepEqual(deparamed, {
			foo: 1,
			bar: 2
		})
	})

	QUnit.test("precedent", function(assert) {
		route.routes = {};
		route("{who}", {
			who: "index"
		});
		route("search/{search}");

		var obj = route.deparam("can.Control");
		assert.deepEqual(obj, {
			who: "can.Control"
		});

		obj = route.deparam("search/can.Control");
		assert.deepEqual(obj, {
			search: "can.Control"
		}, "bad deparam");

		assert.equal(route.param({
			search: "can.Control"
		}),
			"search/can.Control", "bad param");

		assert.equal(route.param({
			who: "can.Control"
		}),
			"can.Control");
	})

	QUnit.test("better matching precedent", function(assert) {
		route.routes = {};
		route("{type}", {
			who: "index"
		});
		route("{type}/{id}");

		assert.equal(route.param({
			type: "foo",
			id: "bar"
		}),
			"foo/bar");
	})

	QUnit.test("linkTo", function(assert) {
		route.routes = {};
		route("/{foo}");
		var res = route.link("Hello", {
			foo: "bar",
			baz: 'foo'
		});
		assert.equal(res, '<a href="/bar?baz=foo">Hello</a>');
	})

	QUnit.test("param with route defined", function(assert) {
		route.routes = {};
		route("holler")
		route("foo");

		var res = route.param({
			foo: "abc"
		}, "foo");

		assert.equal(res, "foo?foo=abc")
	})

	QUnit.test("route endings", function(assert) {
		route.routes = {};
		route("foo", {
			foo: true
		});
		route("food", {
			food: true
		})

		var res = route.deparam("food")
		assert.ok(res.food, "we get food back")

	});

	QUnit.test("strange characters", function(assert) {
		route.routes = {};
		route("{type}/{id}");
		var res = route.deparam("foo/" + encodeURIComponent("\/"))
		assert.equal(res.id, "\/")
		res = route.param({
			type: "bar",
			id: "\/"
		});
		assert.equal(res, "bar/" + encodeURIComponent("\/"))
	});


	QUnit.test("empty default is matched even if last", function(assert) {

		route.routes = {};
		route("{who}");
		route("", {
			foo: "bar"
		});

		var obj = route.deparam("");
		assert.deepEqual(obj, {
			foo: "bar"
		});
	});

	QUnit.test("order matched", function(assert) {
		route.routes = {};
		route("{foo}");
		route("{bar}")

		var obj = route.deparam("abc");
		assert.deepEqual(obj, {
			foo: "abc"
		});
	});

	QUnit.test("param order matching", function(assert) {
		route.routes = {};
		route("", {
			bar: "foo"
		});
		route("something/{bar}");
		var res = route.param({
			bar: "foo"
		});
		assert.equal(res, "", "picks the shortest, best match");

		// picks the first that matches everything ...
		route.routes = {};

		route("{recipe}", {
			recipe: "recipe1",
			task: "task3"
		});

		route("{recipe}/{task}", {
			recipe: "recipe1",
			task: "task3"
		});

		res = route.param({
			recipe: "recipe1",
			task: "task3"
		});

		assert.equal(res, "", "picks the first match of everything");

		res = route.param({
			recipe: "recipe1",
			task: "task2"
		});
		assert.equal(res, "/task2")
	});

	QUnit.test("dashes in routes", function(assert) {
		route.routes = {};
		route.register("{foo}-{bar}");

		var obj = route.deparam("abc-def");
		assert.deepEqual(obj, {
			foo: "abc",
			bar: "def"
		});
	});

	QUnit.test("teardown in Node", function(assert) {
		var global = globals.getKeyValue('global');
		var document = globals.getKeyValue('document');
		var isNode = globals.getKeyValue('isNode');

		try {
			globals.setKeyValue('isNode', true);
			route.urlData.onUnbound();

			assert.ok(true, "Did not attempt to teardown in Node");
		} catch(e) {
			assert.ok(false, "Tried to teardown in Node");
		}
		finally {
			globals.setKeyValue('global', global);
			globals.setKeyValue('document', document);
			globals.setKeyValue('isNode', isNode);
		}
	});

	QUnit.test('shouldCallPushState', function(assert) {
		var global = globals.getKeyValue('global');
		var document = globals.getKeyValue('document');
		var isNode = globals.getKeyValue('isNode');

		route.register("{type}/{id}");

		var a = document.createElement("a");
		a.setAttribute("href", "/books/40");
		document.getElementById("qunit-fixture").appendChild(a);

		var event = document.createEvent('HTMLEvents');
		event.initEvent('click', true, true);

		globals.setKeyValue('isNode', true);

		assert.ok(route.urlData.shouldCallPushState(a, event), "Push state should be called");

		globals.setKeyValue('global', global);
		globals.setKeyValue('document', document);
		globals.setKeyValue('isNode', isNode);

	});

	QUnit.test('shouldCallPushState on SVG', function(assert) {
		var global = globals.getKeyValue('global');
		var document = globals.getKeyValue('document');
		var isNode = globals.getKeyValue('isNode');

		route.register("{type}/{id}");

		var a = document.createElementNS("http://www.w3.org/1999/xlink", "a");
		var event = document.createEvent('HTMLEvents');
		a.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/books/40");
		event.initEvent('click', true, true);

		globals.setKeyValue('isNode', true);

		assert.ok(route.urlData.shouldCallPushState(a, event), "Push state should be called");

		globals.setKeyValue('global', global);
		globals.setKeyValue('document', document);
		globals.setKeyValue('isNode', isNode);

	});

}
