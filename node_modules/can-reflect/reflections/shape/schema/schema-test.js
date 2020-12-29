var QUnit = require('steal-qunit');
var canSymbol = require('can-symbol');
var schemaReflections = require("./schema");
var shapeReflections = require("../shape");

QUnit.module('can-reflect: shape reflections: schema');

var MyType = function(id){
    this._id = id;
    this.name = "nameValue";
};
MyType[canSymbol.for("can.getSchema")] = function(){
    return {
        identity: ["_id"]
    };
};

MyType.prototype.method = function(){};

QUnit.test("getSchema", function(assert) {

    var schema = schemaReflections.getSchema(MyType);
    assert.deepEqual(schema, {
        identity: ["_id"]
    });

    var instance = new MyType("_id");
    schema = schemaReflections.getSchema(instance);
    assert.deepEqual(schema, {
        identity: ["_id"]
    });

});

QUnit.test('cloneKeySort', function (assert) {
    var obj = {
        "z": 0,
        "a": 0
    };

    var same = {
        "a": 0,
        "z": 0
    };

    assert.equal( JSON.stringify( schemaReflections.cloneKeySort(obj) ), JSON.stringify( same ) );
});

QUnit.test('cloneKeySort with strings', function (assert) {
    var obj = {
        "z": "0",
        "a": "0"
    };

    var same = {
        "a": "0",
        "z": "0"
    };

    assert.equal( JSON.stringify( schemaReflections.cloneKeySort(obj) ), JSON.stringify( same ) );
});

QUnit.test('cloneKeySort with dates', function (assert) {
    var obj = {
        "z": new Date(1999000),
        "a": new Date(2001000)
    };

    var same = {
        "a": new Date(2001000),
        "z": new Date(1999000)
    };

    var sorted = schemaReflections.cloneKeySort(obj);

    assert.equal( JSON.stringify( sorted ), JSON.stringify( same ) );
    assert.equal( sorted.a.getTime(), 2001000 );
});

QUnit.test("getIdentity", function(assert){

    var value = new MyType(5);

    assert.equal( schemaReflections.getIdentity(value),  5, "used schema" );

    assert.equal(
        schemaReflections.getIdentity(value, {
            identity: ["_id","name"]
        }),
        '{"_id":5,"name":"nameValue"}');

});

QUnit.test("getSchema returns undefined when there is not schema", function(assert) {

    assert.equal(schemaReflections.getSchema(function(){}), undefined, "is undefined");

});

QUnit.test("getSchema returns undefined when passed undefined", function(assert) {

    assert.equal(schemaReflections.getSchema(undefined), undefined, "is undefined");

});

QUnit.test("canReflect.convert", function(assert) {
    var res =  schemaReflections.convert("1", Number);
    assert.equal(typeof res, "number", "is right type");
    assert.equal(res, 1, "string -> number");
    assert.equal( schemaReflections.convert("Infinity", Number), Infinity, "string -> number");
    assert.equal( schemaReflections.convert(1, String), "1", "string");
    assert.equal( schemaReflections.convert(true, String), "true", "boolean -> string");
    assert.equal( schemaReflections.convert(false, String), "false", "boolean -> string");

    assert.equal( schemaReflections.convert("true", Boolean), true, "string true -> boolean");
    //assert.equal( schemaReflections.convert("false", Boolean), false, "string false -> boolean");
    //assert.equal( schemaReflections.convert("1", Boolean), false, "string 1 -> boolean false");

    // Basic constructor tests
    var MyConstructor = function(val){
        this.val = val;
    };
    MyConstructor.prototype.method = function(){};

    assert.equal( schemaReflections.convert("abc", MyConstructor).val, "abc", "creates new instance");

    var abc= new MyConstructor("abc");
    assert.equal( schemaReflections.convert(abc, MyConstructor), abc, "is instance");

    // MaybeString type
    var MaybeString = shapeReflections.assignSymbols({},{
        "can.new": function(val){
            if (val == null) {
                return val;
            }
            return '' + val;
        }
    });

    assert.equal( schemaReflections.convert("1", MaybeString), "1", "'1' -> MaybeString");
    assert.equal( schemaReflections.convert(null, MaybeString), null, "null -> MaybeString");

    // Convert symbol
    var toStringIsh = function(val){
        if (val == null) {
            return val;
        }
        return '' + val;
    };

    assert.equal( schemaReflections.convert("1", toStringIsh), "1", "'1' -> MaybeString");
    assert.equal( schemaReflections.convert(null, toStringIsh), null, "null -> MaybeString");
});
