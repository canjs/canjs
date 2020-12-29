/*can-define-rest-model@1.2.0#can-define-rest-model*/
define([
    'require',
    'exports',
    'module',
    'can-connect/constructor',
    'can-connect/can/map',
    'can-connect/data/parse',
    'can-connect/data/url',
    'can-define/list',
    'can-define/map',
    'can-namespace',
    'can-connect/base'
], function (require, exports, module) {
    var constructor = require('can-connect/constructor');
    var canMap = require('can-connect/can/map');
    var dataParse = require('can-connect/data/parse');
    var dataUrl = require('can-connect/data/url');
    var DefineList = require('can-define/list');
    var DefineMap = require('can-define/map');
    var namespace = require('can-namespace');
    var base = require('can-connect/base');
    function defineRestModel(optionsOrUrl) {
        var options = typeof optionsOrUrl === 'string' ? { url: optionsOrUrl } : optionsOrUrl;
        if (typeof options.Map === 'undefined') {
            options.Map = DefineMap.extend({ seal: false }, {});
        }
        if (typeof options.List === 'undefined') {
            options.List = options.Map.List || DefineList.extend({ '#': options.Map });
        }
        var connection = [
            base,
            dataUrl,
            dataParse,
            constructor,
            canMap
        ].reduce(function (prev, behavior) {
            return behavior(prev);
        }, options);
        connection.init();
        return connection;
    }
    module.exports = namespace.defineRestModel = defineRestModel;
});