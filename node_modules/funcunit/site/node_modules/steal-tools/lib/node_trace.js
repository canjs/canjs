var steal = require("steal");
var fs = require("fs");
var asap = require("pdenodeify");
var readFile = asap(fs.readFile);
var clone = require("lodash").cloneDeep;
var getESModuleImports = require("./load/get_es_module_imports");

module.exports = function(load){
	load = clone(load);
	load.metadata.deps = [];

	var localSteal = steal.clone();
	var System = localSteal.System;
	System.preventModuleExecution = true;
	trap(System);

	if(load.metadata.useSource) {
		return compare(load.source);
	}

	var address = load.address.replace("file:", "");
	return readFile(address, "utf8").then(compare);

	function compare(source){
		return Promise.resolve().then(function(){
			var plugin = load.metadata.plugin;
			var translatePromise;
			if(plugin && plugin.translate) {
				load.source = source;
				translatePromise = Promise.resolve(
					plugin.translate.call(System, load));
			} else {
				translatePromise = Promise.resolve(source);
			}
			return translatePromise;
		})
		.then(function(source){
			if(source) {
				load.source = source;
			}

			return System.instantiate(load).then(function(result){
				var deps = result ? result.deps : getESModuleImports(load);

				// If this is a plugin then the plugin is a dependency but not
				// returned as such by instantiate.
				if(load.metadata.plugin){
					var pluginDep = load.metadata.pluginName;
					if(!~deps.indexOf(pluginDep)) deps.push(pluginDep);
				}

				return {
					source: load.source,
					deps: deps,
					virtualModules: System.virtualDefines
				};
			});
		});
	}

};

function trap(System) {
	// trap defines so we know about them.
	System.virtualDefines = [];
	System.define = function(name, source){
		this.virtualDefines.push({name:name,source:source});
	};

	// prevent fetch
	System.fetch = function(){
		return Promise.resolve('');
	};
}
