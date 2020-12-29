"use strict";

var QUnit = require("steal-qunit");

var set  = require("./set");
var canReflect = require("can-reflect");

QUnit.module("can-key/set");

QUnit.test("set single root", function (assert) {
	var root = {
		foo: "bar"
	};
	set(root, "foo", "baz");
	assert.equal(root.foo, "baz", "got 'baz'");
});

QUnit.test("set deep objects", function (assert) {
	var root = {
		foo: {
			bar: "baz"
		}
	};
	set(root, "foo.bar", "new");
	assert.equal(root.foo.bar, "new", "got 'new'");
});

QUnit.test("set with numeric index", function (assert) {
	var list = [1, 2, 3];
	set(list, 0, "one");

	assert.equal(list[0], "one", "set the 1st element of the list");

	set(list, 1, "two");
	assert.equal(list[1], "two", "set the 2nd element of the list");
});

QUnit.test("set on an object that does not exist", function (assert) {
	var root = {
		foo: {}
	};
	var errorThrown;
	try {
		set(root, "foo.bar.baz", "new");
	} catch (error) {
		errorThrown = error;
	}
	assert.ok(errorThrown instanceof TypeError, "error was thrown");
	assert.equal(root.foo.bar, undefined, "original object was not modified");
});

QUnit.test("works with reflected APIs", function(assert) {
    var obj = canReflect.assignSymbols({}, {
        "can.getKeyValue": function(key) {
            return this._data[key];
        },
        "can.setKeyValue": function(key, value) {
            this._data[key] = value;
        }
    });
    obj._data = {foo: {
        bar: "zed"
    }};

    set(obj, "foo.bar", "baz");
    assert.equal(obj._data.foo.bar, "baz", "got 'baz'");
});

if (typeof Map !== undefined) {
    QUnit.test("works with Map", function(assert) {
        var map = new Map();
        map.set("first", {second: "third"});
        set(map, "first.second", "3rd");
        assert.equal(map.get("first").second, "3rd");
    });
}
