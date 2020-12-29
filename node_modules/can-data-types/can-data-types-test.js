var dataTypes = require("./can-data-types");
var QUnit = require("steal-qunit");
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var MaybeNumber = dataTypes.MaybeNumber;
var isMemberSymbol = canSymbol.for("can.isMember");

QUnit.module('can-data-types');

QUnit.test('MaybeBoolean', function(assert) {
    assert.equal( canReflect.convert("true", dataTypes.MaybeBoolean), true, "converted");

    assert.equal(canReflect.new(dataTypes.MaybeBoolean, "true") , true);

    assert.equal(dataTypes.MaybeBoolean[Symbol.for("can.isMember")](true)    , true);
    assert.equal(dataTypes.MaybeBoolean[Symbol.for("can.isMember")]("true")  , false);
    assert.equal(dataTypes.MaybeBoolean[Symbol.for("can.isMember")](null) , true);
});

QUnit.test('MaybeDate', function(assert) {
    var date = new Date(2018,0,1);
    assert.equal( canReflect.convert(date.toString(), dataTypes.MaybeDate).getTime(), date.getTime(), "converted");

    assert.deepEqual(canReflect.new(dataTypes.MaybeDate, "2018-1-31") , new Date( Date.parse("2018-1-31") ), "new" );

    assert.equal(dataTypes.MaybeDate[Symbol.for("can.isMember")](new Date()) , true);
    assert.equal(dataTypes.MaybeDate[Symbol.for("can.isMember")]({})  , false);
    assert.equal(dataTypes.MaybeDate[Symbol.for("can.isMember")](null) , true);


});

QUnit.test('MaybeNumber', function(assert) {
    assert.equal( canReflect.convert("5", MaybeNumber), 5, "converted");

    assert.equal( canReflect.new(MaybeNumber, "1"), 1);

    assert.equal( MaybeNumber[isMemberSymbol](1)    , true);
    assert.equal( MaybeNumber[isMemberSymbol]("1")  , false);
    assert.equal( MaybeNumber[isMemberSymbol](null) , true);
});

QUnit.test('MaybeString', function(assert) {
    assert.equal( canReflect.convert(1, dataTypes.MaybeString), "1", "converted");

    assert.equal( canReflect.new(dataTypes.MaybeString, 1) , "1");

    assert.equal( dataTypes.MaybeString[Symbol.for("can.isMember")]("1")    , true);
    assert.equal( dataTypes.MaybeString[Symbol.for("can.isMember")](1)  , false);
    assert.equal( dataTypes.MaybeString[Symbol.for("can.isMember")](null) , true);

});
