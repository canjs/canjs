/* global self */
/* global WorkerGlobalScope */
var global = typeof window !== "undefined" ? window :
	(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ? self : global;

module.exports = global;
