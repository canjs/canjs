var QUnit = require("steal-qunit");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");

module.exports = function(name, makeType) {

    QUnit.test(name+" canReflect.defineInstanceKey with enumerable", function(assert){
        var Type = makeType();
    	Type[canSymbol.for("can.defineInstanceKey")]("prop", {configurable: true, writable: true, enumerable: true});

    	Type[canSymbol.for("can.defineInstanceKey")]("nonEnum", {enumerable: false, value: 0, configurable: true, writable: true});

    	var t = new Type();
        assert.equal(canReflect.getKeyValue(t,"nonEnum"), 0, "default value used");

        canReflect.setKeyValue(t,"prop","5");
    	t.prop = "5";
    	assert.equal(t.prop, "5", "value set");
    	assert.deepEqual( canReflect.serialize(t), {prop: "5"}, "enumerable respected");
    });

};
