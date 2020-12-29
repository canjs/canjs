var _ = require('lodash');
var	fs = require('fs-extra');
var path = require('path');
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


// config {system: {}, options: {}, outputs: {}}
module.exports = function(config, defaults, modules){
	return new Promise(function(resolve, reject) {

		logging.setup(config.options || {}, config.system || {});

		// allow defaults that overwrite our helpers
		var defaultHelpers = _.clone(helpers);
		_.assign(defaultHelpers, defaults);

		// converts to an array of outputs
		config.outputs = _.map(config.outputs || config.transforms, function(output, name){

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
		});

		var modulesMap = _.keyBy(modules,"moduleName");
		var finished = function(){
			if(errors.length) {
				reject(errors);
			} else {
				resolve();
			}
		};

		// writing utils
		var fileWrites = 0,
			errors = [],
			writeFile = function(filename, data){
				var code = data.code;
				var map = data.map;
				var check = function(){
					fileWrites--;
					if(fileWrites === 0) {
						finished();
					}
				};

				fileWrites++;
				fs.mkdirs(path.dirname(filename), function(err){
					if(err) {
						errors.push(err);
						check();
					} else {
						fs.writeFile(filename, code, function(err){
							if(err) {
								errors.push(err);
							}
							var sourceMaps = map && config.options &&
								config.options.sourceMaps;
							if(sourceMaps) {
								fs.writeFile(filename+".map", map+"", function(err){
									if(err) { errors.push(err); }
									check();
								});
								return;
							}
							check();
						});
					}
				});
			};


		var transform,
			transformAndWriteOut = function(moduleNames, out, extraOptions){
				extraOptions = extraOptions || {};
				var outputOptions = _.assign(extraOptions, out.output, {
					ignore: extraOptions.ignore || out.output.ignore
				});

				var result = transform(moduleNames, outputOptions ),
					filePath;

				if(typeof out.output.dest === "string") {
					filePath = out.output.dest;
				} else {
					// pull out the moduleNames
					var loads = ( typeof moduleNames === "string" ?
						transform.graph[moduleNames].load :
						moduleNames.map(function(moduleName){
							return transform.graph[moduleName].load;
						}) );


					filePath = out.output.dest(moduleNames, modulesMap[moduleNames], loads, transform.loader);
				}
				winston.info("> "+filePath);
				writeFile(filePath, result);
			};

		var processOutput = function(out){
			winston.info("OUTPUT: "+out.name);

			var loader = transform.loader;
			var mods, doTransform;
			// write out each module and its dependencies in the list
			if(out.output.eachModule) {
				if(Array.isArray( out.output.eachModule) ) {
					mods = normalized(out.output.eachModule);
				} else {
					mods = normalized(_.map( _.filter(modules, out.output.eachModule), "moduleName"));
				}

				doTransform = function(mods, ignores){
					mods.forEach(function(mod){
						transformAndWriteOut(mod, out, {
							ignore: ignores
						});
					});
				};

			// write out the graphs
			} else if(out.output.graphs){
				if(typeof out.output.graphs === "function") {
					mods = normalized(out.output.graphs(loader));
				} else {
					mods = normalized(out.output.graphs);
				}

				doTransform = function(mods, ignores){
					eachGraph(transform.graph, mods, function(name, node){
						if(node && !transformImport.matches(ignores, name, node.load)) {
							transformAndWriteOut(name, out, {ignoreAllDependencies: true});
						}
					});
				};
			// write out all the modules combined
			} else {
				if(Array.isArray( out.output.modules) ) {
					mods = normalized(out.output.modules);
				} else if(typeof out.output.modules === "function"){
					mods = normalized(out.output.modules(loader));
				} else if(out.output.modules) {
					mods = normalized([out.output.modules]);
				}
				doTransform = function(mods, ignores){
					transformAndWriteOut(mods, out, {
						ignore: ignores
					});
				};
			}

			Promise.all(mods).then(function(mods) {
				var ignore = out.output.ignore || [];
				Promise.all(normalized(ignore))
				.then(function(outputIgnore){
					var ignores = transformImport.getAllIgnores(outputIgnore,
																transform.graph);
					doTransform(mods, ignores);
				});
			});

			// Give an array of moduleNames, normalize them.
			function normalized(mods) {
				if(mods && !Array.isArray(mods)) {
					mods = [mods];
				}

				return (mods || []).map(function(moduleName) {
					if(typeof moduleName !== "string") {
						return Promise.resolve(moduleName);
					}
					return loader.normalize(moduleName);
				});
			}

		};

		fileWrites++;
		transformImport(config.system, config.options).then(function(configPluginify){
			fileWrites--;
			transform = configPluginify;
			config.outputs.forEach(processOutput);

		})["catch"](function(e){
			reject(e);
		});
	});
};
