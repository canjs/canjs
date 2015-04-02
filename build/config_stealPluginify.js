// This file returns the stealPluginify config values

var _ = require('lodash'),
	path = require("path"),
	npmUtils = require("steal/ext/npm-utils"),
	isNpm = npmUtils.moduleName.isNpm;
var modules = require('./config_meta_modules');

var	allModuleNames = _.map(modules,function(mod){
		return mod.moduleName;
	}),
	coreModules = _.map(_.filter(modules, "isDefault"),"moduleName"),
	config = path.join(__dirname,"..","package.json!npm");

var canNormalize = function(name, depLoad, curName){
	if( depLoad.address.indexOf("node_modules") >= 0 ) {
		return denpm(name);
	}
	return "can/"+denpm(name);
};

var npmify = function(moduleName){
	var parsed = {
		packageName: pkg.name,
		modulePath: moduleName,
		version: pkg.version
	};
	return npmUtils.moduleName.create(parsed);
};

var makeStandaloneAndStealUtil = function(lib){
	var libUtilName = "util/"+lib+"/"+lib+".js";
	var configuration = {
		system: {
			config: config,
			main: coreModules,
			paths: {
				"can/util/util": libUtilName
			}
		},
		options : {
			//verbose: true
		},
		outputs: {
			"steal +ignorelibs +dev": {
				graphs: ["can/util/util"],
				dest: function(moduleName){
					moduleName = denpm(moduleName);
					var name;
					if(moduleName === "util/util"){
						name = "dist/steal/can/"+libUtilName;
					} else {
						name = "dist/steal/can/"+moduleName+".js";
					}
					return path.join(__dirname,"..",name);
				},
				format: "steal"
			}
		}
	};
	configuration.outputs[lib+"-core +ignorelibs"] = {
		modules: coreModules,
		dest: path.join(__dirname,"..","dist/can."+lib+".js"),
		normalize: canNormalize
	};
	configuration.outputs[lib+"-core-dev +dev+ignorelibs"] = {
		modules: coreModules,
		dest: path.join(__dirname,"..","dist/can."+lib+".dev.js"),
		normalize: canNormalize
	};
	configuration.outputs[lib+"-core-min +min+ignorelibs"] = {
		modules: coreModules,
		dest: path.join(__dirname,"..","dist/can."+lib+".min.js"),
		normalize: canNormalize
	};
	return configuration;
};

var pkg = require('../package.json');

var makeAmdUtil = function(lib){
	var moduleName = "can/util/"+lib+"/"+lib;
	return {
		system: {
			config: config,
			main: moduleName
		},
		options : {
			//quiet: true
		},
		"outputs":{
			"dev +amddev+ignorelibs": {
				graphs: [moduleName]
			},
			"normal +amd+ignorelibs": {
				graphs: [moduleName]
			}
		}
	};
};

// A mapping of module names to objects from builder.json
var modulesMap = _.indexBy(modules, "moduleName");

// Function to remove the npmness from moduleNames
var denpm = function(moduleName){
	if(isNpm(moduleName)) {
		return moduleName.substr(moduleName.indexOf("#") + 1);
	}
	return moduleName;
};

var testModules = modules.filter(function(mod){
	return mod.hasTest !== false;
}).map(function(mod){
	var name = mod.moduleName.replace("can/", "")+"_test";
	return name;
});

module.exports = function(){
	return {
		"tests": {
			system: {
				main: testModules,
				config: config
			},
			options : {
				//verbose: true
			},
			"outputs" : {
				"all tests": {
					modules: testModules,
					// all test modules
					ignore: allModuleNames.concat([function(moduleName, load){
						if(load.address.indexOf("node_modules") >=0 ) {
							return true;
						}
					}]),
					format: "global",
					dest: path.join(__dirname,"..","test/pluginified/latest.js"),
					minify: false,
					normalize: canNormalize
				}
			}
		},
		// standalone & steal - plugins, jquery core, and jquery steal
		"cjs-jquery": {
			system: {
				config: config,
				main: allModuleNames.concat(['can'])
			},
			options : {
				//verbose: true
			},
			"outputs": {
				"all-plugins": {
					eachModule: [{type: "plugin"}],
					ignore: [{type: "core"}],
					dest: function(moduleName, moduleData){
						if(isNpm(moduleName)) {
							moduleName = "can/" + moduleName.substr(moduleName.indexOf("#") + 1);
							moduleData = modulesMap[moduleName];
						}

						return path.join(__dirname,"..","dist",moduleData.name.toLowerCase()+".js");

						//return path.join(__dirname,"..","dist",moduleData.name.toLowerCase()+".js");
					},
					normalize: canNormalize,
					transpile: "global",
					minify: false
				},
				"jquery-core +ignorelibs" : {
					modules: [{type: "core"}].concat(['can']),
					dest: path.join(__dirname,"..","dist/can.jquery.js"),
					normalize: canNormalize,
					minify: false
				},
				"jquery-core-dev +ignorelibs" : {
					modules: [{type: "core"}],
					dest: path.join(__dirname,"..","dist/can.jquery.dev.js"),
					normalize: canNormalize,
					keepDevelopmentCode: true,
					minify: false
				},
				"jquery-core-min +ignorelibs": {
					modules: [{type: "core"}],
					dest: path.join(__dirname,"..","dist/can.jquery.min.js"),
					normalize: canNormalize,
					minify: true
				},
				"steal +dev": {
					graphs: allModuleNames.concat(["can"]),
					dest: function(moduleName){
						var name;
						moduleName = denpm(moduleName);
						name = "dist/steal/can/"+moduleName+".js";
						return path.join(__dirname,"..",name);
					},
					format: "steal",
					ignore: ["jquery/jquery","jquery"],
					minify: false
				},
				"cjs" : {
					graphs: allModuleNames.concat(['can']),
					useNormalizedDependencies: false,
					normalize: function(depName, depLoad, curName, curLoad ){

						// if its not in node_modules
						if(depLoad.address.indexOf("node_modules") === -1 && curLoad.address.indexOf("node_modules") === -1) {
							// provide its name relative
							var moduleName = path.relative(path.dirname(curLoad.address), depLoad.address);
							if(moduleName[0] !== ".") {
								moduleName = "./"+moduleName
							}
							return moduleName;
						} 
						if(depName === "jquery/jquery") {
							return "jquery"
						}
						return depName;
					},
					dest: function(moduleName){
						var name;

						if(isNpm(moduleName)) {
							moduleName = moduleName.substr(moduleName.lastIndexOf("#")+1);
						}
						
						name = moduleName.replace("can/","")+".js";
						
						return path.join(__dirname,"..", "dist", "cjs", name);
					},
					format: "cjs",
					ignore: function(modelName, load){
						if(load.address.indexOf("/node_modules/") >=0) {
							return true;
						}
					},
					minify: false
				}
			}
		},
		"standalone & steal - core & utils - dojo": makeStandaloneAndStealUtil("dojo"),
		"standalone & steal - core & utils - yui": makeStandaloneAndStealUtil("yui"),
		"standalone & steal - core & utils - zepto": makeStandaloneAndStealUtil("zepto"),
		"standalone & steal - core & utils - mootools": makeStandaloneAndStealUtil("mootools"),
		"amd": {
			system: {
				config: config,
				main: allModuleNames.concat(["can"]),
				map: {
					"can/util/util" : "can/util/library"
				}
			},
			options : {
				quiet: true
			},
			"outputs": {
				"amd-dev +amddev+ignorelibs": {
					graphs: allModuleNames.concat(["can"])
				},
				"amd +amd+ignorelibs": {
					graphs: allModuleNames.concat(["can"])
				}
			}
		},
		"amd-util-jquery": makeAmdUtil("jquery"),
		"amd-util-dojo": makeAmdUtil("dojo"),
		"amd-util-yui": makeAmdUtil("yui"),
		"amd-util-zepto": makeAmdUtil("zepto"),
		"amd-util-mootools": makeAmdUtil("mootools")
	};
};
