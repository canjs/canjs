var sort = require("./can-sort-object");
var QUnit = require("steal-qunit");

QUnit.module("can-sort-object");

QUnit.test('basics', function (assert) {
    var obj = {
        "z": 0,
        "a": 0
    };

    var same = {
        "a": 0,
        "z": 0
    };

    assert.equal( JSON.stringify( sort(obj) ), JSON.stringify( same ) );
});

QUnit.test('strings', function (assert) {
    var obj = {
        "z": "0",
        "a": "0"
    };

    var same = {
        "a": "0",
        "z": "0"
    };

    assert.equal( JSON.stringify( sort(obj) ), JSON.stringify( same ) );
});
