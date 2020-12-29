'use strict';

var globals = require('can-globals/can-globals-instance');

/* globals WorkerGlobalScope */
// A bit of weirdness to avoid complaining linters
var funcConstructor = Function;


/**
 * @module {function} can-globals/is-browser-window/is-web-worker is-web-worker
 * @parent can-globals/modules
 * @signature `isWebWorker()`
 *
 * Returns `true` if the code is running within a [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker).
 *
 * ```js
 * var isWebWorker = require("can-globals/is-web-worker/is-web-worker");
 * var GLOBAL = require("can-globals/global/global");
 *
 * if(isWebWorker()) {
 *   ...
 * }
 * ```
 *
 * @return {Boolean} True if the environment is a web worker.
 */

globals.define('isWebWorker', function(){
    var global = funcConstructor('return this')();
    return typeof WorkerGlobalScope !== "undefined" &&
        (global instanceof WorkerGlobalScope);
});

module.exports = globals.makeExport('isWebWorker');
