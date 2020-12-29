"use strict";
var namespace = require("can-namespace");
var globals = require("can-globals");
var proxyNamespace = require("./src/proxy-namespace");
var temporarilyBind = require("./src/temporarily-bind");

var getGraph = require("./src/get-graph/get-graph");
var formatGraph = require("./src/format-graph/format-graph");
var logWhatIChange = require("./src/what-i-change/what-i-change");
var logWhatChangesMe = require("./src/what-changes-me/what-changes-me");
var getWhatIChange = require("./src/get-what-i-change/get-what-i-change");
var getWhatChangesMe = require("./src/get-what-changes-me/get-what-changes-me");

var Observation = require("can-observation");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var canQueues = require("can-queues");
var mergeDeep = require("can-diff/merge-deep/merge-deep");

var global = globals.getKeyValue("global");

var devtoolsRegistrationComplete = false;
function registerWithDevtools() {
	if (devtoolsRegistrationComplete) {
		return;
	}

	var devtoolsGlobalName =  "__CANJS_DEVTOOLS__";
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
			set: function(devtoolsGlobal) {
				Object.defineProperty(global, devtoolsGlobalName, {
					value: devtoolsGlobal
				});

				devtoolsGlobal.register(devtoolsCanModules);
			},
			configurable: true
		});
	}

	devtoolsRegistrationComplete = true;
}

module.exports = function() {
	namespace.debug = {
		formatGraph: temporarilyBind(formatGraph),
		getGraph: temporarilyBind(getGraph),
		getWhatIChange: temporarilyBind(getWhatIChange),
		getWhatChangesMe: temporarilyBind(getWhatChangesMe),
		logWhatIChange: temporarilyBind(logWhatIChange),
		logWhatChangesMe: temporarilyBind(logWhatChangesMe)
	};

	registerWithDevtools();

	global.can = typeof Proxy !== "undefined" ? proxyNamespace(namespace) : namespace;

	return namespace.debug;
};
