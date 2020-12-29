var winston = require('winston');
var trace = require("../trace");
var steal = require("steal");
var omit = require("lodash/omit");
var assign = require("lodash/assign");
var clone = require("lodash/cloneDeep");
var addParseAMD = require("steal-parse-amd");
var makeDeferred = require("../make-deferred");
var isUndefined = require("lodash/isUndefined");
var makePredefinedPluginDependencies = require('./make_predefined_plugin_dependencies');

var formatMap = {
	'amd-parse' : 'amd'
};

var SystemRegistry = global.SystemRegistry = {};

module.exports = function makeGraph(config, options) {
	options = options || {};
	winston.info('OPENING: ' + (config.main || config.config || config.configMain));
	var oldGlobalSystem = global.System;
	// get all modules that are configured in the metadata object
	var configMeta = clone(config.meta || {});

	// This version of steal, and its System, will be configured exactly like
	// a page that might run will be configured.
	// However, `trace` will prevent its "code" from actually running.
	var localSteal = steal.clone();
	addParseAMD( localSteal.System );

	localSteal.System.config({ env: "build-development" });
	localSteal.System.config(omit(config, ["meta"]));
	if(options.localStealConfig) {
		localSteal.System.config(options.localStealConfig);
	}


	// Extensions and plugins can mutate these objects so the slim loader
	// is able to handle special cases, like runtime mapping of userland
	// module identifiers (like: "~/state/state") to slim numeric ids.
	localSteal.System.slimConfig = options.slimConfig || makeSlimConfig();

	localSteal.System.normalizeMap = {};
	localSteal.System.systemName = (localSteal.System.systemName||"")+"-local";

	// This version of steal, and its System can be used to load
	// modules that need to actually run code. The most common example is
	// plugins that transform their code.
	var buildSteal = steal.clone();

	// TODO: add test that fails if the following is uncommented.
	// Special types don't work that write to AMD if we add parseAMD to this.
	//addParseAMD( buildSteal.System );
	// It should be configured exactly like `localSteal`
	buildSteal.System.config(omit(config, ["meta"]));
	buildSteal.System.systemName = (buildSteal.System.systemName ||"")+ "-build";

	if(options.previousLoader && options.previousLoader._newLoader) {
		options.previousLoader._newLoader(localSteal.System);
	}

	// This is needed for "virtual module" configuration.
	// TODO replace with something better.
	if(options.system) {
		buildSteal.System.config(options.system);
		localSteal.System.config(options.system);
	}

	// Except that it does not have a System.main so `startup` will
	// not load the main module.  But it will load @config and @dev.
	delete buildSteal.System.main;
	buildSteal.System.config({ env: "build"	});

	if (options.buildStealConfig) {
		buildSteal.System.config(options.buildStealConfig);
	}

	// Set the build as the global objects
	global.steal = buildSteal;
	global.System = buildSteal.System;

	// And kick off startup to get @config and @dev.
	var buildPromise = buildSteal.startup();
	SystemRegistry[buildSteal.System.systemName] = buildSteal.System;
	SystemRegistry[localSteal.System.systemName] = localSteal.System;

	// The graph object we are creating.
	var graph = {};
	var startupCalledDfd = makeDeferred();

	function traceCallback(load, deps, dependencies, pluginValue){
		if(formatMap[load.metadata.format]) {
			load.metadata.format= formatMap[load.metadata.format];
		}

		winston.debug( (localSteal.System.systemName||"") +'+ ' + load.name+ (
			localSteal.System.bundle ? "-"+localSteal.System.bundle : ""));
		// there could have been an old load from the BuildSystem
		var oldLoad = graph[load.name];

		var loadNode = graph[load.name] = {};
		loadNode.load = load;
		loadNode.deps = deps;
		loadNode.dependencies = dependencies;
		loadNode.value = oldLoad && oldLoad.value;

		if(arguments.length === 4){
			// only mark as plugin if there was an oldLoad
			loadNode.isPlugin = !oldLoad;
			loadNode.value = pluginValue;
		}
	}

	// Setup trace to callback when a module is found.
	trace(localSteal.System, buildSteal.System, startupCalledDfd.promise,
		traceCallback);

	return buildPromise.then(function(){

		buildSteal.System.config({ meta: configMeta });
		buildSteal.System.config(buildSteal.System.buildConfig || {});

		// Set the instantiate-less version of steal and System as global.
		global.steal = localSteal;
		global.System = localSteal.System;
		// Kickoff loading @config, @dev, and System.main modules.

		// set config one more time on startup.  This is to make sure the final values
		// are these values.
		var localConfig = omit(config, ["config","systemName"]);
		assign(localConfig, ignoredMetas(config.meta, buildSteal.System.meta));

		var appPromise = localSteal.startup(localConfig);
		startupCalledDfd.resolve();

		return appPromise.then(function(){
			var main = localSteal.System.main;

			if (isUndefined(main)) {
				return Promise.reject(
					new Error(
						"Attribute 'main' is required\n" +
						"Add 'main' to the StealConfig object or to your StealJS configuration file.\n" +
						"See http://stealjs.com/docs/steal-tools.StealConfig.html for more details."
					)
				);
			}

			var mains = Array.isArray(main) ? main : [main];
			var normalizedPromises = mains.map(function(main){
				return Promise.resolve(localSteal.System.normalize(main));
			});

			return Promise.all(normalizedPromises)
				.then(function(main) {
					localSteal.System.main = main.length > 1 ? main : main[0];
					return main;
				})
				.then(function(mains){
					global.System = oldGlobalSystem;
					makePredefinedPluginDependencies(graph);

					return {
						graph: graph,
						steal: localSteal,
						loader: localSteal.System,
						buildLoader: buildSteal.System,
						mains: mains
					};
				});
		});
	});
};

// Create a config of the ignored meta modules
function ignoredMetas(cfgs, metas){
	cfgs = cfgs || {};
	Object.keys(metas).forEach(function(name){
		var cfg = metas[name];
		if(cfg && cfg.bundle === false) {
			cfgs[name] = cfg;
		}
	});
	return { meta: cfgs };
}

// Creates a config of special modules that alter the default loader behavior.
//	- "extensions": manipulate the default module resolution (steal-conditional)
//	- "toMap": list of module identifiers that won't be converted statically
//		to numeric ids and need to be resolved during runtime (dynamic imports)
//	- "identifiersToResolve": list of module identifiers that will be manipulated
//		by the resolve hook exposed by extensions.
function makeSlimConfig() {
	var slimLoaderConfig = {};

	Object.defineProperties(slimLoaderConfig, {
		extensions: {
			value: [],
			enumerable: true
		},
		toMap: {
			value: [],
			enumerable: true
		},
		identifiersToResolve: {
			value: [],
			enumerable: true
		}
	});

	return slimLoaderConfig;
}
