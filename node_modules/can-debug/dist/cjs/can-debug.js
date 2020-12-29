/*can-debug@2.0.6#can-debug*/
define('can-debug', [
    'require',
    'exports',
    'module',
    'can-namespace',
    'can-globals',
    'can-debug/src/proxy-namespace',
    'can-debug/src/temporarily-bind',
    'can-debug/src/get-graph/get-graph',
    'can-debug/src/format-graph/format-graph',
    'can-debug/src/what-i-change/what-i-change',
    'can-debug/src/what-changes-me/what-changes-me',
    'can-debug/src/get-what-i-change/get-what-i-change',
    'can-debug/src/get-what-changes-me/get-what-changes-me',
    'can-observation',
    'can-symbol',
    'can-reflect',
    'can-queues',
    'can-diff/merge-deep/merge-deep'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var namespace = require('can-namespace');
        var globals = require('can-globals');
        var proxyNamespace = require('can-debug/src/proxy-namespace');
        var temporarilyBind = require('can-debug/src/temporarily-bind');
        var getGraph = require('can-debug/src/get-graph/get-graph');
        var formatGraph = require('can-debug/src/format-graph/format-graph');
        var logWhatIChange = require('can-debug/src/what-i-change/what-i-change');
        var logWhatChangesMe = require('can-debug/src/what-changes-me/what-changes-me');
        var getWhatIChange = require('can-debug/src/get-what-i-change/get-what-i-change');
        var getWhatChangesMe = require('can-debug/src/get-what-changes-me/get-what-changes-me');
        var Observation = require('can-observation');
        var canSymbol = require('can-symbol');
        var canReflect = require('can-reflect');
        var canQueues = require('can-queues');
        var mergeDeep = require('can-diff/merge-deep/merge-deep');
        var global = globals.getKeyValue('global');
        var devtoolsRegistrationComplete = false;
        function registerWithDevtools() {
            if (devtoolsRegistrationComplete) {
                return;
            }
            var devtoolsGlobalName = '__CANJS_DEVTOOLS__';
            var devtoolsCanModules = {
                Observation: Observation,
                Reflect: canReflect,
                Symbol: canSymbol,
                formatGraph: namespace.debug.formatGraph,
                getGraph: namespace.debug.getGraph,
                mergeDeep: mergeDeep,
                queues: canQueues
            };
            if (global[devtoolsGlobalName]) {
                global[devtoolsGlobalName].register(devtoolsCanModules);
            } else {
                Object.defineProperty(global, devtoolsGlobalName, {
                    set: function (devtoolsGlobal) {
                        Object.defineProperty(global, devtoolsGlobalName, { value: devtoolsGlobal });
                        devtoolsGlobal.register(devtoolsCanModules);
                    },
                    configurable: true
                });
            }
            devtoolsRegistrationComplete = true;
        }
        module.exports = function () {
            namespace.debug = {
                formatGraph: temporarilyBind(formatGraph),
                getGraph: temporarilyBind(getGraph),
                getWhatIChange: temporarilyBind(getWhatIChange),
                getWhatChangesMe: temporarilyBind(getWhatChangesMe),
                logWhatIChange: temporarilyBind(logWhatIChange),
                logWhatChangesMe: temporarilyBind(logWhatChangesMe)
            };
            registerWithDevtools();
            global.can = typeof Proxy !== 'undefined' ? proxyNamespace(namespace) : namespace;
            return namespace.debug;
        };
    }(function () {
        return this;
    }(), require, exports, module));
});