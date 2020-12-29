/*can-debug@2.0.6#src/what-changes-me/what-changes-me*/
define('can-debug/src/what-changes-me/what-changes-me', [
    'require',
    'exports',
    'module',
    'can-debug/src/log-data/log-data',
    'can-debug/src/get-data/get-data',
    'can-debug/src/get-graph/get-graph'
], function (require, exports, module) {
    'use strict';
    var log = require('can-debug/src/log-data/log-data');
    var getData = require('can-debug/src/get-data/get-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    module.exports = function logWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        var data = getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatChangesMe');
        if (data) {
            log(data);
        }
    };
});