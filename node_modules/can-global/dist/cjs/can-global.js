/*can-global@1.0.0#can-global*/
var GLOBAL;
module.exports = function (setGlobal) {
    if (setGlobal !== undefined) {
        GLOBAL = setGlobal;
    }
    if (GLOBAL) {
        return GLOBAL;
    } else {
        return GLOBAL = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self : typeof process === 'object' && {}.toString.call(process) === '[object process]' ? global : window;
    }
};