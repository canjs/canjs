/**
 * TODO: fix this, and make a real non-jquery implementation of can.data
 * This module requires the nodelist to implement their own data, which of course
 * is not a great idea. this is a temprary measure to be fixed
 */

var makeArray = require('can/util/array/makeArray');
var nodeList = require('can/util/node-list');

// data.js
// ---------
// _jQuery-like data methods._
var data = {}, dataAttr = nodeList.fn.data,
	uuid = nodeList.uuid = +new Date(),
	exp = nodeList.expando = 'Zepto' + uuid;

function getData(node, name) {
	var id = node[exp],
		store = id && data[id];
	return name === undefined ? store || setData(node) :
		(store && store[name]) || dataAttr.call(nodeList(node), name);
}

function setData(node, name, value) {
	var id = node[exp] || (node[exp] = ++uuid),
		store = data[id] || (data[id] = {});
	if (name !== undefined) {
		store[name] = value;
	}
	return store;
}

nodeList.fn.data = function (name, value) {
	return value === undefined ?
		this.length === 0 ? undefined : getData(this[0], name) :
		this.each(function (idx) {
			setData(this, name, $.isFunction(value) ?
				value.call(this, idx, getData(this, name)) : value);
		});
};
nodeList.cleanData = function (elems) {
	// trigger all the events ... then remove the data
	for (var i = 0, elem;
		(elem = elems[i]) !== undefined; i++) {
		can.trigger(elem, "removed", [], false);
	}
	for (i = 0;
		(elem = elems[i]) !== undefined; i++) {
		var id = elem[exp];
		delete data[id];
	}

};

module.exports = function (wrapped) {
	return wrapped.data.apply(wrapped, makeArray(arguments).slice(1));
};
