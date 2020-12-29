var QUnit = require("steal-qunit");
var shape = require("../reflections/shape/shape");
var type = require("../reflections/type/type");
require("./set");

function assertSetMatchesArray(assert, set, array, msg) {
	assert.equal(set.size, array.length, msg + " - size matches");

	for (var i=0; i<array.length; i++) {
		assert.ok(set.has(array[i]), msg + " - set contains " + array[i]);
	}
}

if(typeof Set !== "undefined") {
    QUnit.module("can-reflect/types/set Set");

    QUnit.test("isListLike", function(assert) {
        assert.ok( type.isListLike(new Set()), "isListLike" );
        assert.ok( type.isMoreListLikeThanMapLike(new Set()), "isMoreListLikeThanMapLike" );

    });

    QUnit.test("shape.each", function(assert) {
        var arr = ["a","b"];
        var set = new Set();
        arr.forEach(function(val) {
          set.add(val);
        });

        var count = 0;
        shape.each(set, function(value){
            assert.equal(value, arr[count++], "got the right values back");
        });
    });

    QUnit.test("shape.update", function(assert) {
        var set = new Set(["a","b"]);

        shape.update(set, ["a","a","c"]);

        assertSetMatchesArray(assert, set, [ "a", "c" ], ".update");
    });

    QUnit.test("shape.assign", function(assert) {
        var arr = ["a","b"];
        var set = new Set();
        arr.forEach(function(val) {
          set.add(val);
        });

        shape.assign(set, ["a","a","c"]);

        assertSetMatchesArray(assert, set, [ "a", "b", "c" ], ".assign");
    });
}

if(typeof WeakSet !== "undefined") {
    QUnit.module("can-reflect/types/set WeakSet");

    QUnit.test("isListLike", function(assert) {
        assert.ok( type.isListLike(new WeakSet()), "isListLike" );
        assert.ok( type.isMoreListLikeThanMapLike(new WeakSet()), "isMoreListLikeThanMapLike" );

    });

    QUnit.test("shape.each", function(assert) {
        var arr = [{},{}];
        var set = new WeakSet(arr);

        try {
            shape.each(set, function(){});
        } catch(e) {
            assert.ok(true, "Error "+e.message);
        }

    });

    QUnit.test("shape.update", function(assert) {
        var a = {}, b = {}, c = {};
        var set = new WeakSet([a, b]);
        try {
            shape.update(set, [a,a, c]);
        } catch(e) {
            assert.ok(true, "Error "+e.message);
        }
    });

    QUnit.test("shape.assign", function(assert) {
        var a = {}, b = {}, c = {};
        var set = new WeakSet([a,b]);

        shape.assign(set, [a,a,c]);

        // should have everything
        assert.ok(set.has(a));
        assert.ok(set.has(b));
        assert.ok(set.has(c));

    });
}
