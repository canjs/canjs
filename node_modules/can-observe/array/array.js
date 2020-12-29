"use strict";
// ## can-observe/array/array
//
var canSymbol = require("can-symbol");
var makeArray = require("../src/-make-array");
var makeObserve = require("../src/-make-observe");
var eventMixin = require("can-event-queue/map/map");
var typeEventMixin = require("can-event-queue/type/type");
var helpers = require("../src/-helpers");
var observableStore = require("../src/-observable-store");
var computedHelpers = require("../src/-computed-helpers");
var typeHelpers = require("../src/-type-helpers");

var definitionsSymbol = canSymbol.for("can.typeDefinitions");

// Setup proxyKeys to look for observations when doing onKeyValue and offKeyValue
var proxyKeys = helpers.assignEverything({},makeArray.proxyKeys());

var ObserveArray;
if ( /*helpers.supportsClass*/ false) {
    /*ObserveArray = class ObserveArray extends Array {
        constructor(items) {
            super();
            var prototype = Object.getPrototypeOf(this);
            var constructor = this.constructor;
            var instance = this;
            var definitions = prototype[definitionsSymbol] || {};
            for (var key in definitions) {
                Object.defineProperty(instance, key, definitions[key]);
            }
            this.push.apply(this, items);

            return makeArray.observable(instance, {
                observe: makeObserve.observe,
                proxyKeys: {
                    constructor: constructor
                }
            });
        }
    };*/
} else {

    var ObserveArray = function(items) {
        var prototype = Object.getPrototypeOf(this);

        computedHelpers.ensureDefinition(prototype);
        typeHelpers.ensureDefinition(prototype);

        var instance = this;
        var definitions = prototype[definitionsSymbol] || {};
        for (var key in definitions) {
            Object.defineProperty(instance, key, definitions[key]);
        }
        this.push.apply(this, items || []);

        var localProxyKeys = Object.create(proxyKeys);
        localProxyKeys.constructor = this.constructor;

        var observable = makeArray.observable(instance, {
            observe: makeObserve.observe,
            proxyKeys: localProxyKeys,
            shouldRecordObservation: typeHelpers.shouldRecordObservationOnAllKeysExceptFunctionsOnProto
        });
        observableStore.proxiedObjects.set(instance, observable);
        observableStore.proxies.add(observable);
        return observable;
    };
    ObserveArray.prototype = Object.create(Array.prototype);
}

eventMixin(ObserveArray.prototype);
typeEventMixin(ObserveArray);
computedHelpers.addMethodsAndSymbols(ObserveArray);
typeHelpers.addMethodsAndSymbols(ObserveArray);

ObserveArray.extend = helpers.makeSimpleExtender(ObserveArray);



module.exports = ObserveArray;
