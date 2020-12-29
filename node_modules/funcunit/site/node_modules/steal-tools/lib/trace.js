var assign = require("lodash").assign;
var merge = require("lodash").merge;

var trace = function(System, BuildSystem, onFulfilled){

	System.pluginLoader = BuildSystem;
	BuildSystem.localLoader = System;

	//System.preventModuleExecution = true;

	// The BuildSystem loader will execute modules, but wait for the value to come through
	var buildInstantiate = BuildSystem.instantiate;
	BuildSystem.instantiate = function(load){

		var res = buildInstantiate.apply(this, arguments);

		// Get the value of the plugin (this will let us check for includeInBuild)
		BuildSystem.import(load.name).then(function(pluginValue){
			//var deps = BuildSystem._traceData.deps[load.name];
			//var dependencies = BuildSystem.getDependencies(load.name);
			var deps = load.metadata.deps || [];
			var dependencies = load.metadata.dependencies || [];
			onFulfilled(load, deps, dependencies, pluginValue);
		});

		return res;

	};

	var buildConfig = BuildSystem.config;
	BuildSystem.config = function(cfg){
		// Merge meta configuration
		if(cfg && cfg.meta && this.meta) {
			cfg = assign({}, cfg, {
				meta: merge({}, this.meta, cfg.meta)
			});
		}
		buildConfig.call(this, cfg);
	};

	System.preventModuleExecution = true;
	System.allowModuleExecution(System.configMain);

	// Override instantiate
	var systemInstantiate = System.instantiate;
	System.instantiate = function(load){
		// Figure out if there's a plugin
		var pluginName = load.metadata.pluginName;

		if(load.name === "babel") {
			load.metadata.format = "global";
			// If there are no dependants prevent this from being added to
			// the dependancy graph.
			if(System.getDependants(load.name).length === 0) {
				load.metadata.includeInDependencyGraph = false;
			}
		}

		var res = systemInstantiate.apply(this, arguments);

		return Promise.resolve(res).then(function fullfill(instantiateResult){
			var deps = load.metadata.deps || [];
			var dependencies = load.metadata.dependencies || [];
			if(pluginName) {
				deps = deps.concat([pluginName]);
				dependencies = dependencies.concat([pluginName]);
			}

			// If the config is a global mark it as cjs so that it will be converted
			// to AMD by transpile. Needed because of this bug:
			// https://github.com/ModuleLoader/es6-module-loader/issues/231
			if(load.name === System.configMain && load.metadata.format === "global") {
				load.metadata.format = "cjs";
			}

			if(load.metadata.includeInDependencyGraph !== false) {
				onFulfilled(load, deps, dependencies);
			}

			return instantiateResult;
		});
	};
};

module.exports = trace;

