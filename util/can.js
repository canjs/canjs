/* global global: false */
/* global GLOBALCAN */
/* global self */
/* global WorkerGlobalScope */
var glbl = typeof window !== "undefined" ? window :
	(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ? self : global;

var can = {};

if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
	glbl.can = can;
}

can.global = glbl;

module.exports = exports = can;
