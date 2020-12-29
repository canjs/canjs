'use strict';
var namespace = require('can-namespace');

var isEmptyObject = function(obj){
	/* jshint -W098 */
	for(var prop in obj) {
		return false;
	}
	return true;
};

var data = new WeakMap();

// delete this node's `data`
// returns true if the node was deleted.
var deleteNode = function(node) {
	var nodeDeleted = false;
	if (data.has(node)) {
		nodeDeleted = true;
		data.delete(node);
	}
	return nodeDeleted;
};

var setData = function(node, name, value) {
	var store = data.get(node);
	if (store === undefined) {
		store = {};
		data.set(node, store);
	}
	if (name !== undefined) {
		store[name] = value;
	}
	return store;
};

/*
 * Core of domData that does not depend on mutationDocument
 * This is separated in order to prevent circular dependencies
 */
var domData = {
	_data: data,

	get: function(node, key) {
		var store = data.get(node);
		return key === undefined ? store : store && store[key];
	},

	set: setData,

	clean: function(node, prop) {
		var itemData = data.get(node);
		if (itemData && itemData[prop]) {
			delete itemData[prop];
		}
		if (isEmptyObject(itemData)) {
			deleteNode(node);
		}
	},

	delete: deleteNode
};

if (namespace.domData) {
	throw new Error("You can't have two versions of can-dom-data, check your dependencies");
} else {
	module.exports = namespace.domData = domData;
}
