"use strict";
//allows you to backup and restore a map instance
var canReflect = require('can-reflect');
var SimpleObservable = require('can-simple-observable');
var diffDeep = require("can-diff/deep/deep");
var diffMap = require("can-diff/map/map");

var flatProps = function (a, cur) {
	var obj = {};
	for (var prop in a) {
		if (typeof a[prop] !== 'object' || a[prop] === null || a[prop] instanceof Date) {
			obj[prop] = a[prop];
		} else {
			obj[prop] = cur[prop];//cur.attr(prop);
		}
	}
	return obj;
};

var assignNonEnumerable = function(base, props) {
	for(var prop in props) {
		Object.defineProperty(base, prop, {
			enumerable: false,
			configurable: true,
			writable: true,
			value: props[prop]
		});
	}
};

var observables = new WeakMap();

function getBackup(map) {
	var obs = observables.get(map);
	if(!obs) {
		obs = new SimpleObservable();
		observables.set(map, obs);
	}
	return obs;
}

function defineBackup(Map) {
	assignNonEnumerable(Map.prototype, {

		backup: function () {
			var store = getBackup(this);
			canReflect.setValue(store, this.serialize());
			return this;
		},

		isDirty: function (checkAssociations) {
			var store = getBackup(this);
			var backupStore = canReflect.getValue(store);
			if(!backupStore){
				return false;
			}
			var currentValue = this.serialize();
			var patches;
			if(!! checkAssociations) {
				patches = diffDeep(currentValue, backupStore);
			} else {
				patches = diffMap(currentValue, backupStore).filter(function(patch){
					// only keep those that are not a set of deep object
					if(patch.type !== "set") {
						return true;
					} else {
						// check values .. if both objects ... we are not dirty ...
						var curVal = currentValue[patch.key],
							backupVal = backupStore[patch.key];
						var twoObjectsCompared = curVal && backupVal && typeof curVal === "object" && typeof backupVal === "object";
						return !twoObjectsCompared;
					}
				});
			}
			return patches.length;
		},

		restore: function (restoreAssociations) {
			var store = getBackup(this);
			var curVal = canReflect.getValue(store);
			var props = restoreAssociations ? curVal : flatProps(curVal, this);
			if (this.isDirty(restoreAssociations)) {
				for(var prop in props) {
					this[prop] = props[prop];
				}
			}
			return this;
		}
	});

	return Map;
}

module.exports = exports = defineBackup;
