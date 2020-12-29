var assign = require("lodash/assign");
var merge = require("lodash/merge");

var trace = function(System, BuildSystem, startupCalledPromise, onFulfilled){

	System.pluginLoader = BuildSystem;
	BuildSystem.localLoader = System;

	// override System.config to keep track of the configuration properties set
	var systemConfig = System.config;
	System.config = function(cfg) {
		System.__loaderConfig = System.__loaderConfig || {};
		assign(System.__loaderConfig, cfg);
		systemConfig.apply(System, arguments);
	};

	var systemLocate = System.locate;
	System.locate = function(load) {
		if(load.metadata.parsedModuleName && !load.metadata.packageJson) {
			var pmn = load.metadata.parsedModuleName;
			var packages = this.npmContext.packages, pkg;
			for(var i = 0; i < packages.length; i++) {
				pkg = packages[i];
				if(pkg.name === pmn.packageName && pkg.version === pmn.version) {
					load.metadata.packageJson = pkg;
					break;
				}
			}
		}
		return systemLocate.apply(this, arguments);
	};

	// The BuildSystem loader will execute modules, but wait for the value to come through
	var buildInstantiate = BuildSystem.instantiate;
	BuildSystem.instantiate = function(load){
		var res = buildInstantiate.apply(this, arguments);

		// turn on this flag if you need the module to include its local dependencies in the
		// generated bundle but might want to load different dependencies during build time.
		// E.g: during build, steal-less needs to load the NodeJS version of the less engine but
		// the development bundles need to include the browser version to work correctly.
		if (load.metadata.useLocalDeps) {
			return startupCalledPromise
				.then(function() {
					return System.import(System.configMain);
				})
				.then(function() {
					return System.import(load.name);
				})
				.then(function () {
					return res;
				});
		}
		else {
			// Get the value of the plugin (this will let us check for includeInBuild)
			BuildSystem.import(load.name).then(function(pluginValue){
				//var deps = BuildSystem._traceData.deps[load.name];
				//var dependencies = BuildSystem.getDependencies(load.name);
				var deps = load.metadata.deps || [];
				var dependencies = load.metadata.dependencies || [];
				onFulfilled(load, deps, dependencies, pluginValue);
			});

			return res;
		}
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
