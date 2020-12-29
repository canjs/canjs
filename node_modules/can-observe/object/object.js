"use strict";
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");
var makeObserve = require("../src/-make-observe");
var eventMixin = require("can-event-queue/map/map");
var typeEventMixin = require("can-event-queue/type/type");
var helpers = require("../src/-helpers");
var makeObject = require("../src/-make-object");
var observableStore = require("../src/-observable-store");
var definitionsSymbol = canSymbol.for("can.typeDefinitions");
var computedHelpers = require("../src/-computed-helpers");
var typeHelpers = require("../src/-type-helpers");

// Setup proxyKeys to look for observations when doing onKeyValue and offKeyValue
var proxyKeys = helpers.assignEverything({},makeObject.proxyKeys());
computedHelpers.addKeyDependencies(proxyKeys);

// ## ObserveObject constructor function
// Works by returning the proxy-wrapped instance.
var ObserveObject = function(props) {
    var prototype = Object.getPrototypeOf(this);

    computedHelpers.ensureDefinition(prototype);
    typeHelpers.ensureDefinition(prototype);

    // Define expando properties from `can.defineInstanceProperty`
    var sourceInstance = this;
    var definitions = prototype[definitionsSymbol] || {};
    for (var key in definitions) {
        Object.defineProperty(sourceInstance, key, definitions[key]);
    }
    // Add properties passed to the constructor.
    if (props !== undefined) {
        canReflect.assign(sourceInstance, props);
    }
    // Create a copy of the proxy keys
    var localProxyKeys = Object.create(proxyKeys);

    // Make sure that the .constructor property isn't proxied.  If it was,
    // `this.constructor` would not be the type.
    localProxyKeys.constructor = this.constructor;

    // Wrap the sourceInstance
    var observable = makeObject.observable(sourceInstance, {
        observe: makeObserve.observe,
        proxyKeys: localProxyKeys,
        shouldRecordObservation: typeHelpers.shouldRecordObservationOnAllKeysExceptFunctionsOnProto
    });
    // Add the proxy to the stores.
    observableStore.proxiedObjects.set(sourceInstance, observable);
    observableStore.proxies.add(observable);
    return observable;
};

eventMixin(ObserveObject.prototype);
typeEventMixin(ObserveObject);
computedHelpers.addMethodsAndSymbols(ObserveObject);
typeHelpers.addMethodsAndSymbols(ObserveObject);

// Allows this to be extended w/o `class`
ObserveObject.extend = helpers.makeSimpleExtender(ObserveObject);



module.exports = ObserveObject;
