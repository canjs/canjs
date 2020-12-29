"use strict";
var shape = require("../reflections/shape/shape");
var CanSymbol = require("can-symbol");

function keysPolyfill() {
  var keys = [];
  var currentIndex = 0;

  this.forEach(function(val, key) { // jshint ignore:line
    keys.push(key);
  });

  return {
    next: function() {
      return {
        value: keys[currentIndex],
        done: (currentIndex++ === keys.length)
      };
    }
  };
}

if (typeof Map !== "undefined") {
  shape.assignSymbols(Map.prototype, {
    "can.getOwnEnumerableKeys": Map.prototype.keys,
    "can.setKeyValue": Map.prototype.set,
    "can.getKeyValue": Map.prototype.get,
    "can.deleteKeyValue": Map.prototype["delete"],
    "can.hasOwnKey": Map.prototype.has
  });

  if (typeof Map.prototype.keys !== "function") {
    Map.prototype.keys = Map.prototype[CanSymbol.for("can.getOwnEnumerableKeys")] = keysPolyfill;
  }
}

if (typeof WeakMap !== "undefined") {
  shape.assignSymbols(WeakMap.prototype, {
    "can.getOwnEnumerableKeys": function() {
      throw new Error("can-reflect: WeakMaps do not have enumerable keys.");
    },
    "can.setKeyValue": WeakMap.prototype.set,
    "can.getKeyValue": WeakMap.prototype.get,
    "can.deleteKeyValue": WeakMap.prototype["delete"],
    "can.hasOwnKey": WeakMap.prototype.has
  });
}
