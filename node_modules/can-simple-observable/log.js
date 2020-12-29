"use strict";
var dev = require("can-log/dev/dev");
var canReflect = require("can-reflect");

// when printing out strings to the console, quotes are not included which
// makes it confusing to tell the actual output from static string messages
function quoteString(x) {
	return typeof x === "string" ? JSON.stringify(x) : x;
}

// To add the `.log` function to a observable
// a.- Add the log function to the propotype:
//	   `Observable.propotype.log = log`
// b.- Make sure `._log` is called by the observable when mutation happens
//     `_.log` should be passed the current value and the value before the mutation
module.exports = function log() {
	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		this._log = function(previous, current) {
			dev.log(
				canReflect.getName(this),
				"\n is  ", quoteString(current),
				"\n was ", quoteString(previous)
			);
		};
	}
	//!steal-remove-end
};
