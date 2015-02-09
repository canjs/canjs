// This file returns the stealPluginify config values

var _ = require('lodash'),
	path = require("path");
var modules = require('./config_meta_modules'),
	allModuleNames = _.map(modules,"moduleName"),
	coreModules = _.map(_.filter(modules, "isDefault"),"moduleName"),
	config = path.join(__dirname,"..","stealconfig.js");



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
			"steal +ignorelibs": {
				graphs: ["can/util/util"],
				dest: function(moduleName){
					var name;
					if(moduleName === "can/util/util"){
						name = "dist/steal/"+libUtilName;
					} else {
						name = "dist/steal/"+moduleName+".js";
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


module.exports = function(){
	return {
		"tests": {
			system: {
				main: modules.filter(function(mod){
					return mod.hasTest !== false;
				}).map(function(mod){
					return mod.moduleName+"_test";
				}),
				config: config
			},
			options : {
				// verbose: true
			},
			"outputs" : {
				"all tests": {
					ignore: allModuleNames,
					format: "global",
					dest: path.join(__dirname,"..","test/pluginified/latest.js"),
					minify: false
				}
			}
		},
		"standalone & steal - plugins, jquery core, and jquery steal": {
			system: {
				config: config,
				main: allModuleNames.concat(['can/can'])
			},
			options : {
				// verbose: true
			},
			"outputs": {
				"all-plugins": {
					eachModule: [{type: "plugin"}],
					ignore: [{type: "core"}],
					dest: function(moduleName, moduleData){
						return path.join(__dirname,"..","dist",moduleData.name.toLowerCase()+".js");
					},
					transpile: "global",
					minify: false
				},
				"jquery-core +ignorelibs" : {
					modules: [{type: "core"}],
					dest: path.join(__dirname,"..","dist/can.jquery.js"),
					minify: false
				},
				"jquery-core-dev +ignorelibs" : {
					modules: [{type: "core"}],
					dest: path.join(__dirname,"..","dist/can.jquery.dev.js"),
					keepDevelopmentCode: true,
					minify: false
				},
				"jquery-core-min +ignorelibs": {
					modules: [{type: "core"}],
					dest: path.join(__dirname,"..","dist/can.jquery.min.js"),
					minify: true
				},
				"steal": {
					graphs: allModuleNames,
					dest: function(moduleName){
						var name;
						if(moduleName === "can/util/util"){
							name = "dist/steal/can/util/jquery/jquery.js";
						} else {
							name = "dist/steal/"+moduleName+".js";
						}
						return path.join(__dirname,"..",name);
					},
					format: "steal",
					ignore: ["jquery/jquery","jquery"],
					minify: false
				},
				"cjs" : {
					graphs: allModuleNames.concat(['can/can']),
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
						return depName;
					},
					dest: function(moduleName){
						var name;
						if(moduleName === "can/util/util"){
							name = "dist/cjs/util/jquery/jquery.js";
						} else {
							name = "dist/cjs/"+moduleName.replace("can/","")+".js";
						}
						return path.join(__dirname,"..",name);
					},
					format: "cjs",
					ignore: ["jquery/jquery","jquery"],
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
				main: allModuleNames,
				map: {
					"can/util/util" : "can/util/library"
				},
				paths: {
					"can/util/library": "util/jquery/jquery.js"
				}
			},
			options : {
				quiet: true
			},
			"outputs": {
				"amd-dev +amddev": {
					graphs: allModuleNames
				},
				"amd +amd": {
					graphs: allModuleNames
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