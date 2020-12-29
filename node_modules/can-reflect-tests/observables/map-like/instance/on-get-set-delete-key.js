var QUnit = require("steal-qunit");
var canReflect = require("can-reflect");

module.exports = function(name, makeInstance) {

    QUnit.test(name+" onKeyValue, setKeyValue, getKeyValue, deleteKeyValue, getOwnKeys", function(assert){
        var instance = makeInstance();

        var onKeyValues = [];
        assert.notOk( canReflect.isBound(instance), "not bound");
        canReflect.onKeyValue(instance,"prop",function(value){
            onKeyValues.push(value);
        });

        assert.ok( canReflect.isBound(instance), "bound");

        canReflect.setKeyValue(instance,"prop", "FIRST");
        canReflect.getOwnKeys(instance,["prop"], ".getOwnKeys has set prop");

        assert.equal( canReflect.getKeyValue(instance,"prop"), "FIRST", ".getKeyValue");

        canReflect.deleteKeyValue(instance,"prop");

        assert.equal( canReflect.getKeyValue(instance,"prop"), undefined, ".deleteKeyValue made it undefined");

        assert.deepEqual(onKeyValues,["FIRST", undefined], "onKeyValue");
        assert.deepEqual( canReflect.getOwnEnumerableKeys(instance) , [], ".getOwnKeys loses deleted prop");
    });

};
