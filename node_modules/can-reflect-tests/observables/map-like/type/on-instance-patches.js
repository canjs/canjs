var QUnit = require("steal-qunit");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");

module.exports = function(name, makeType) {

    QUnit.test(name+" canReflect.onInstancePatches", function(assert){
        var Type = makeType();
        Type[canSymbol.for("can.defineInstanceKey")]("first", {configurable: true, writable: true, enumerable: true});
        Type[canSymbol.for("can.defineInstanceKey")]("last", {configurable: true, writable: true, enumerable: true});
        // TODO: it would be nice to tell if the type supports add / delete
        Type[canSymbol.for("can.defineInstanceKey")]("middle", {configurable: true, writable: true, enumerable: true});

        var calls = [];
        function handler(obj, patches) {
            calls.push([obj, patches]);
        }

        Type[canSymbol.for("can.onInstancePatches")](handler);

        var instance = new Type({first: "Justin", last: "Meyer"});

        canReflect.setKeyValue(instance, "first", "Payal");
        canReflect.setKeyValue(instance, "last", "Shah");
        canReflect.setKeyValue(instance, "middle", "p");

        Type[canSymbol.for("can.offInstancePatches")](handler);

        canReflect.setKeyValue(instance, "first", "Ramiya");
        canReflect.setKeyValue(instance, "last", "Mayer");
        canReflect.setKeyValue(instance, "middle", "P");

        assert.deepEqual(calls,[
            [instance,  [{type: "set",    key: "first", value: "Payal"} ] ],
            [instance, [{type: "set",    key: "last", value: "Shah"} ] ],
            [instance, [{type: "set",    key: "middle", value: "p"} ] ]
        ]);
    });

};
