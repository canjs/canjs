'use strict';
var namespace = require('can-namespace');
var CID = require("can-cid");
var domData = require("can-dom-data");
var canDev = require("can-log/dev/dev");

var slice = [].slice;
function unwrap(obj, key) {
    return function() {
	var args = slice.call(arguments, 0);
	args.unshift(this);
	return obj[key].apply(obj, args);
    };
}

var domDataState = {

	getCid: function() {
		// TODO log warning! to use can-cid directly
		return CID.get(this);
	},

	cid: function(){
		// TODO log warning!
		return CID(this);
	},

	expando: CID.domExpando,

	_data: domData._data,
	get: unwrap(domData, "get"),
	set: unwrap(domData, "set"),
	clean: unwrap(domData, "clean"),
	delete: unwrap(domData, "delete"),
};

if (namespace.domDataState) {
	throw new Error("You can't have two versions of can-dom-data-state, check your dependencies");
} else {
	module.exports = namespace.domDataState = domDataState;
}

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	canDev.warn('can-dom-data-state is deprecated; please use can-dom-data instead: https://github.com/canjs/can-dom-data');
}
//!steal-remove-end
