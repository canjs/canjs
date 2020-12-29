/*can-value@1.1.1#can-value*/
'use strict';
var canKey = require('can-key');
var canReflect = require('can-reflect');
var keyObservable = require('can-simple-observable/key/key');
var namespace = require('can-namespace');
var Observation = require('can-observation');
var SimpleObservable = require('can-simple-observable');
var SettableObservable = require('can-simple-observable/settable/settable');
module.exports = namespace.value = {
    bind: function (object, keyPath) {
        return keyObservable(object, keyPath);
    },
    from: function (object, keyPath) {
        var observationFunction = function () {
            return canKey.get(object, keyPath);
        };
        return new Observation(observationFunction);
    },
    returnedBy: function (getter, context, initialValue) {
        if (getter.length === 1) {
            return new SettableObservable(getter, context, initialValue);
        } else {
            return new Observation(getter, context);
        }
    },
    to: function (object, keyPath) {
        var observable = keyObservable(object, keyPath);
        var symbolsToAssign = { 'can.getValue': null };
        return canReflect.assignSymbols(observable, symbolsToAssign);
    },
    with: function (initialValue) {
        return new SimpleObservable(initialValue);
    }
};