/*can-debug@2.0.6#src/get-what-changes-me/get-what-changes-me*/
define('can-debug/src/get-what-changes-me/get-what-changes-me', [
    'require',
    'exports',
    'module',
    'can-debug/src/get-data/get-data',
    'can-debug/src/get-graph/get-graph'
], function (require, exports, module) {
    'use strict';
    var getData = require('can-debug/src/get-data/get-data');
    var getGraph = require('can-debug/src/get-graph/get-graph');
    module.exports = function getWhatChangesMe(obj, key) {
        var gotKey = arguments.length === 2;
        return getData(gotKey ? getGraph(obj, key) : getGraph(obj), 'whatChangesMe');
    };
});