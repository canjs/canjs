var QUnit = require("steal-qunit");
var canReflect = require("can-reflect");

module.exports = function(name, makeInstance) {

    QUnit.test(name+" onEvent, setKeyValue, getKeyValue, deleteKeyValue, getOwnKeys", function(assert){
        var instance = makeInstance();

        var events = [];
        assert.notOk( canReflect.isBound(instance), "not bound");
        canReflect.onEvent(instance,"prop",function(event){
            events.push(event);
        });

        assert.ok( canReflect.isBound(instance), "bound");

        canReflect.setKeyValue(instance,"prop", "FIRST");
        canReflect.getOwnKeys(instance,["prop"], ".getOwnKeys has set prop");

        assert.equal( canReflect.getKeyValue(instance,"prop"), "FIRST", ".getKeyValue");

        canReflect.deleteKeyValue(instance,"prop");

        assert.equal( canReflect.getKeyValue(instance,"prop"), undefined, ".deleteKeyValue made it undefined");

        assert.deepEqual(
			events.map(function(event){
				return {
					action: event.action,
					value: event.value,
					oldValue: event.oldValue,
					key: event.key,
					target: instance
				};
			}),
			[
				{action: "add", value: "FIRST", oldValue: undefined, key: "prop", target: instance},
				{action: "delete", value: undefined, oldValue: "FIRST", key: "prop", target: instance}
			],
			"onEvent");

        assert.deepEqual( canReflect.getOwnEnumerableKeys(instance) , [], ".getOwnKeys loses deleted prop");
    });

};
