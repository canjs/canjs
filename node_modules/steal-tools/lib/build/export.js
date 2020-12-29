var _ = require('lodash');
var	fs = require('fs-extra');
var path = require('path');
var denodeify = require("pdenodeify");
var eachGraph = require("../graph/each_dependencies");
var transformImport = require("../build/transform");
var helpers = require('./helpers/helpers');
var winston = require('winston');
var logging = require("../logger");

var mergeModules = function(items, modules){
	var i = 0,
		item;
	while(i < items.length) {
		item = items[i];
		if(typeof item === "object" && !(item instanceof RegExp) ) {
			var moduleNames = _.map( _.filter(modules, item), "moduleName");
			items.splice.apply(items,[i,1].concat(moduleNames));
			i = i + moduleNames.length;
		} else {
			i++;
		}
	}
};

var addDefaults = function(name, obj, defaults){
	var helpers = [];

	name.replace(/\+([\w-]+)/g,function(whole, part){
		var defs = defaults[part];
		if(defs) {
			if(typeof defs === "function") {
				defs = defs(obj);
				_.assign(obj, defs);
			} else {
				_.defaults(obj, defs);
			}
			helpers.push(part);
		}

	});

	if(helpers.length) {
		winston.debug("  added helpers: "+helpers.join(","));
	}
};

/**
 * Normalize module names
 * @param {string|Array.<string>} mods A module name (or a list of them)
 * @return {Array.<Promise.<string>>} An array of promises that resolved
 *									to normalized module names.
 */
function normalize(loader, mods) {
	var modNames = (mods && !Array.isArray(mods)) ? [mods] : mods;

	return (modNames || []).map(function(moduleName) {
		return !_.isString(moduleName) ?
			Promise.resolve(moduleName) :
			loader.normalize(moduleName);
	});
}

function writeFile(filename, data, config) {
	var code = data.code;
	var map = data.map;
	var mkdir = denodeify(fs.mkdirs);
	var writeFile = denodeify(fs.writeFile);

	return mkdir(path.dirname(filename))
		.then(function() {
			return writeFile(filename, code);
		})
		.then(function() {
			var sourceMaps = map && config.options &&
				config.options.sourceMaps;

			if (sourceMaps) {
				return writeFile(filename + ".map", map+"");
			}
		});
}

// config {steal: {}, options: {}, outputs: {}}
module.exports = function(config, defaults, modules){
	logging.setup(config.options || {}, config.steal || {});

	// allow defaults that overwrite our helpers
	var defaultHelpers = _.assign(_.clone(helpers), defaults);

	// converts to an array of outputs
	config.outputs = _.map(
		config.outputs || config.transforms,
		function(output, name) {
			addDefaults(name, output, defaultHelpers || {}, config.options || {});

			// merge modules and graphs
			mergeModules(output.modules || [], modules);
			mergeModules(output.eachModule || [], modules);
			mergeModules(output.graphs || [], modules);
			mergeModules(output.ignore || [], modules);

			return {
				name: name,
				output: output
			};
		}
	);

	var transformAndWriteOut = function(transform, moduleNames, out, outputOptions) {
		var modulesMap = _.keyBy(modules, "moduleName");

		var options = _.assign({}, outputOptions, out.output, {
			ignore: outputOptions.ignore || out.output.ignore
		});

		return transform(moduleNames, options)
		.then(function(result){
			var filePath;

			if (_.isUndefined(out.output.dest)) {
				return Promise.reject(new Error(
					"Attribute 'dest' is required\n" +
					"Add 'dest' to the ExportOutput object.\n" +
					"See http://stealjs.com/docs/steal-tools.export.output.html#dest for more details."
				));
			}
			else if (_.isString(out.output.dest)) {
				filePath = out.output.dest;
			}
			else if (_.isFunction(out.output.dest)) {
				// pull out the load objects of the modules being written out
				var loads = (_.isString(moduleNames) ?
					transform.graph[moduleNames].load :
					moduleNames.map(function(moduleName){
						return transform.graph[moduleName].load;
					}));

				filePath = out.output.dest(moduleNames,
					modulesMap[moduleNames], loads, transform.loader);
			}

			winston.info("> " + filePath);
			return writeFile(filePath, result, config);
		});
	};

	var processOutput = function(transform, out) {
		winston.info("OUTPUT: " + out.name);

		var modsPromise;
		var doTransform;
		var loader = transform.loader;

		// write out each module and its dependencies in the list
		if(out.output.eachModule) {
			if (Array.isArray(out.output.eachModule)) {
				modsPromise = normalize(loader, out.output.eachModule);
			}
			else {
				modsPromise = normalize(loader, _.map(
					_.filter(modules, out.output.eachModule),
					"moduleName"
				));
			}

			doTransform = function(mods, ignores){
				return Promise.all(mods.map(function(mod) {
					return transformAndWriteOut(transform, mod, out, {
						ignore: ignores
					});
				}));
			};
		// write out the graphs
		} else if(out.output.graphs){
			if (typeof out.output.graphs === "function") {
				modsPromise = normalize(loader, out.output.graphs(loader));
			}
			else {
				modsPromise = normalize(loader, out.output.graphs);
			}

			doTransform = function(mods, ignores) {
				var promises = [];

				eachGraph(transform.graph, mods, function(name, node) {
					if(node && !transformImport.matches(ignores, name, node.load)) {
						var promise = transformAndWriteOut(transform, name, out, {
							ignoreAllDependencies: true
						});
						promises.push(promise);
					}
				});

				return Promise.all(promises);
			};
		// write out all the modules combined
		} else {
			if(Array.isArray( out.output.modules) ) {
				modsPromise = normalize(loader, out.output.modules);
			} else if(typeof out.output.modules === "function"){
				modsPromise = normalize(loader, out.output.modules(loader));
			} else if(out.output.modules) {
				modsPromise = normalize(loader, [out.output.modules]);
			}
			doTransform = function(mods, ignores){
				return transformAndWriteOut(transform, mods, out, {
					ignore: ignores
				});
			};
		}

		var normalized;
		return Promise.all(modsPromise)
			.then(function(mods) {
				normalized = mods;
				var ignore = out.output.ignore || [];

				return Promise.all(normalize(loader, ignore));
			})
			.then(function(outputIgnore){
				var ignores = transformImport
					.getAllIgnores(outputIgnore, transform.graph);

				return doTransform(normalized, ignores);
			});
	};

	if (!config.steal) {
		var message;
		if(config.system) {
			message = "The 'system' option was removed in 1.0, use 'steal' instead: http://stealjs.com/docs/steal-tools.export.object.html";
		} else {
			message = "A 'steal' option is required.";
		}
		return Promise.reject(new Error(message));
	}

	return transformImport(config.steal, config.options)
		.then(function(configPluginify){
			var buildResult = configPluginify.data;
			return Promise.all(config.outputs.map(function(out) {
				return processOutput(configPluginify, out);
			}))
			.then(function(){
				return buildResult;
			});
		});
};
