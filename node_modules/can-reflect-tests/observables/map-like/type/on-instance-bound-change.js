var QUnit = require("steal-qunit");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");

module.exports = function(name, makeType) {

    QUnit.test(name+" canReflect.onInstanceBoundChange", function(assert){
        var Type = makeType();
        Type[canSymbol.for("can.defineInstanceKey")]( "prop", {configurable: true, writable: true, enumerable: true});

        var calls = [];
        function handler(obj, patches) {
            calls.push([obj, patches]);
        }

        Type[canSymbol.for("can.onInstanceBoundChange")](handler);

        var instance = new Type({prop: "value"});
        var bindHandler = function(){};
        canReflect.onKeyValue(instance, "prop", bindHandler);
        canReflect.offKeyValue(instance, "prop", bindHandler);

        Type[canSymbol.for("can.offInstanceBoundChange")](handler);
        canReflect.onKeyValue(instance, "prop", bindHandler);
        canReflect.offKeyValue(instance, "prop", bindHandler);

        assert.deepEqual(calls,[
            [instance,  true ],
            [instance, false ]
        ]);
    });

};
