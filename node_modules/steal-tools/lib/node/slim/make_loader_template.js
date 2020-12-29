var first = require("lodash/first");
var template = require("lodash/template");

var slimPluginsPartial = `
	// delegate loading non plain JS modules to plugins
	var pluginModuleId = steal.plugins[steal.bundles[moduleId]];
	if (pluginModuleId) {
		return stealRequire(pluginModuleId)(moduleId, steal);
	}
`;

var renderProgressivePartial = function(options) {
	var partial = "";

	if (options.progressive) {
		partial = require("./progressive_loader_partial")[options.target](
			options
		);
	}

	return partial;
};

var importSlimExtensionsPartial = `
	(steal.extensions || []).forEach(function(id) {
		stealRequire(id)(stealRequire);
	});
`;

var importSharedBundlesPartial = function(bundles) {
	// get a list of the first node ids inside the shared bundles
	// stealRequire.dynamic expects node ids and not bundle ids
	var ids = bundles.map(function(bundle) {
		return first(bundle.nodes).load.uniqueId;
	});

	return `${JSON.stringify(ids)}.map(stealRequire.dynamic)`;
};

var resolveHook = {
	baseResolve: `
		// hook into resolve to load stuff before the graph is executed
		stealRequire.resolve = function(id) {
			return Promise.resolve(id);
		};
	`,

	resolveIds: `
		(steal.identifiersToResolve || []).map(function(id) {
			return stealRequire.resolve(id, steal).then(function(resolved) {
				resolvedIdentifiers[id] = resolved;
			});
		})
	`,

	stealRequireExtension: `
		if (moduleId === "@empty") {
		  return {};
		}

		if (resolvedIdentifiers[moduleId]) {
		  return stealRequire(resolvedIdentifiers[moduleId]);
		}
	`
};

var renderMainImportPartial = function(options) {
	var result;
	var sharedBundles = options.entryPointSharedBundles || [];
	var prefix = options.target === "node" ? "module.exports = " : "";

	var importMainPartial = options.splitLoader ?
		prefix + "stealRequire.dynamic(<%= mainModuleId  %>);" :
		prefix + "stealRequire(<%= mainModuleId  %>);";

	if (options.resolve && sharedBundles.length) {
		result = `
			var beforeMain = [];
			beforeMain.concat(${resolveHook.resolveIds});
			beforeMain.concat(${importSharedBundlesPartial(sharedBundles)});
			Promise.all(beforeMain).then(function() {
				${importMainPartial}
			});
		`;
	} else if (options.resolve) {
		result = `
			Promise.all(${resolveHook.resolveIds}).then(function() {
				${importMainPartial}
			});
		`;
	} else if (sharedBundles.length) {
		result = `
			Promise.all(${importSharedBundlesPartial(sharedBundles)})
			.then(function() {
				${importMainPartial}
			});
		`;
	} else {
		result = importMainPartial;
	}

	return result;
};

/**
 * Returns the name of the global based on the build target
 * @param {string} target - The target build name
 * @return {string} defaults to "window" if target is falsy.
 */
var getGlobal = function getGlobal(target) {
	return { web: "window", node: "global", worker: "self" }[target];
};

module.exports = function(options) {
	return template(`
		(function(modules) {
			var modulesMap = {};
			var loadedModules = {};
			${options.resolve ? "var resolvedIdentifiers = {};" : ""}

			function addModules(mods) {
				mods.forEach(function(m) { modulesMap[m[0]] = m[1]; });
			}
			addModules(modules);

			function stealRequire(moduleId) {
				if (loadedModules[moduleId]) {
					return loadedModules[moduleId].exports;
				}

				${options.resolve ? resolveHook.stealRequireExtension : ""}

				${options.plugins ? slimPluginsPartial : ""}

				var stealModule = (loadedModules[moduleId] = {
					exports: {}
				});

				modulesMap[moduleId].call(
					${getGlobal(options.target)},
					stealRequire,
					stealModule.exports,
					stealModule
				);

				return stealModule.exports;
			}

			${renderProgressivePartial(options)}

			${options.resolve ? resolveHook.baseResolve : ""}

			${options.extensions ? importSlimExtensionsPartial : ""}

			${renderMainImportPartial(options)}
		})([
			<%= args %>
		]);
	`);
};
