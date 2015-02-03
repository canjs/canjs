// This file returns the stealPluginify config values

var _ = require('lodash'),
	path = require("path");
var modules = require('./config_meta_modules'),
	allModuleNames = _.map(modules,function(mod){
		return mod.moduleName;
	}),
	coreModules = _.map(_.filter(modules, "isDefault"),"moduleName"),
	config = path.join(__dirname,"..","package.json!npm");

var canNormalize = function(name, depLoad, curName){
	if( depLoad.address.indexOf("node_modules") >= 0 ) {
		return name;
	}
	return "can/"+name;
};

var makeStandaloneAndStealUtil = function(lib){
	var libUtilName = "util/"+lib+"/"+lib+".js";
	var configuration = {
		system: {
			config: config,
			main: coreModules,
			paths: {
				"util/util": "src/"+libUtilName
			}
		},
		options : {
			//verbose: true
		},
		outputs: {
			"steal +ignorelibs": {
				graphs: ["util/util"],
				dest: function(moduleName){
					var name;
					if(moduleName === "can/util/util"){
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
		dest: path.join(__dirname,"..","dist/can."+lib+".js")
	};
	configuration.outputs[lib+"-core-dev +dev+ignorelibs"] = {
		dest: path.join(__dirname,"..","dist/can."+lib+".dev.js")
	};
	configuration.outputs[lib+"-core-min +min+ignorelibs"] = {
		dest: path.join(__dirname,"..","dist/can."+lib+".min.js")
	};
	return configuration;
};

var pkg = require('../package.json');

var makeAmdUtil = function(lib){
	var moduleName = "util/"+lib+"/"+lib;
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


module.exports = function(){
	return {
		"tests": {
			system: {
				main: ["can/construct/construct_test"]
				/*
				modules.filter(function(mod){
					return mod.hasTest !== false;
				}).map(function(mod){
					return mod.moduleName+"_test";
				})*/,
				config: config
			},
			options : {
				verbose: true
			},
			"outputs" : {
				"all tests": {
					// all test modules
					ignore: allModuleNames.concat([function(moduleName, load){
						if(load.address.indexOf("node_modules") >=0 ) {
							return true;
						}
					}]),
					format: "global",
					dest: path.join(__dirname,"..","test/pluginified/latest.js"),
					minify: false
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
						return path.join(__dirname,"..","dist",moduleData.name.toLowerCase()+".js");
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
				"steal": {
					graphs: allModuleNames,
					dest: function(moduleName){
						var name;
						if(moduleName === "util/util"){
							name = "dist/steal/can/util/jquery/jquery.js";
						} else {
							name = "dist/steal/can/"+moduleName+".js";
						}
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
						
						name = moduleName.replace("can/","")+".js";
						
						return path.join(__dirname,"..",name);
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
					"util/util" : "util/library"
				},
				paths: {
					"util/library": "src/util/jquery/jquery.js"
				}
			},
			options : {
				quiet: true
			},
			"outputs": {
				"amd-dev +amddev": {
					graphs: allModuleNames.concat(["can"])
				},
				"amd +amd": {
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