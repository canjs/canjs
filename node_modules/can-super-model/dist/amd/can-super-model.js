/*can-super-model@1.1.1#can-super-model*/
define([
    'require',
    'exports',
    'module',
    'can-connect',
    'can-connect/constructor',
    'can-connect/can/map',
    'can-connect/can/ref',
    'can-connect/constructor/store',
    'can-connect/data/callbacks',
    'can-connect/data/callbacks-cache',
    'can-connect/data/combine-requests',
    'can-connect/data/localstorage-cache',
    'can-connect/data/parse',
    'can-connect/data/url',
    'can-connect/fall-through-cache',
    'can-connect/real-time',
    'can-connect/constructor/callbacks-once',
    'can-define/list',
    'can-define/map',
    'can-namespace',
    'can-reflect',
    'can-query-logic'
], function (require, exports, module) {
    var connect = require('can-connect');
    var connectConstructor = require('can-connect/constructor');
    var canMap = require('can-connect/can/map');
    var canRef = require('can-connect/can/ref');
    var constructorStore = require('can-connect/constructor/store');
    var dataCallbacks = require('can-connect/data/callbacks');
    var callbacksCache = require('can-connect/data/callbacks-cache');
    var combineRequests = require('can-connect/data/combine-requests');
    var localCache = require('can-connect/data/localstorage-cache');
    var dataParse = require('can-connect/data/parse');
    var dataUrl = require('can-connect/data/url');
    var fallThroughCache = require('can-connect/fall-through-cache');
    var realTime = require('can-connect/real-time');
    var callbacksOnce = require('can-connect/constructor/callbacks-once');
    var DefineList = require('can-define/list');
    var DefineMap = require('can-define/map');
    var namespace = require('can-namespace');
    var canReflect = require('can-reflect');
    var QueryLogic = require('can-query-logic');
    function superModel(optionsOrUrl) {
        var options = typeof optionsOrUrl === 'string' ? { url: optionsOrUrl } : optionsOrUrl;
        if (typeof options.Map === 'undefined') {
            options.Map = DefineMap.extend({ seal: false }, {});
        }
        if (typeof options.List === 'undefined') {
            options.List = options.Map.List || DefineList.extend({ '#': options.Map });
        }
        options = canReflect.assignDeep({}, options);
        if (!options.name) {
            options.name = canReflect.getName(options.Map) + '.connection';
        }
        if (!options.queryLogic) {
            options.queryLogic = new QueryLogic(options.Map);
        }
        var behaviors = [
            connectConstructor,
            canMap,
            canRef,
            constructorStore,
            dataCallbacks,
            combineRequests,
            dataParse,
            dataUrl,
            realTime,
            callbacksOnce
        ];
        if (typeof localStorage !== 'undefined') {
            if (!options.cacheConnection) {
                options.cacheConnection = connect([localCache], {
                    name: options.name + '.cacheConnection',
                    idProp: options.idProp,
                    queryLogic: options.queryLogic
                });
            }
            behaviors.push(callbacksCache, fallThroughCache);
        }
        return connect(behaviors, options);
    }
    module.exports = namespace.superModel = superModel;
});