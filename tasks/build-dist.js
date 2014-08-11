var _ = require('lodash'),
	path = require("path");

var stealToolsBuilder = require('steal-tools-builder');

var modules = require('./modules'),
	allModuleNames = _.map(modules,"moduleName"),
	coreModules = _.map(_.filter(modules, "isDefault"),"moduleName"),
	config = path.join(__dirname,"..","stealconfig.js");

var reverseNormalize = function(name){
	if(name === "can/util/library") {
		return "can/util/library";
	}
	if(name === "dojo" || name === "dojo/dojo") {
		return "dojo/main";
	}
	var parts = name.split("/");
	if(parts.length > 1) {
		parts.splice(parts.length-2,1);
	}
	return parts.join("/");
};

var makeStandaloneAndStealUtil = function(lib){
	var libUtilName = "util/"+lib+"/"+lib+".js";
	var configuration = {
		"graph":{
			system: {
				config: config,
				main: coreModules,
				paths: {
					"can/util/util": libUtilName
				}
			},
			options : {
				//verbose: true
			}
		},
		outputs: {
			"steal +ignorelibs": {
				graphs: ["can/util/util"],
				out: function(moduleName){
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
		out: path.join(__dirname,"..","dist/can."+lib+".js")
	};
	configuration.outputs[lib+"-core-dev +dev+ignorelibs"] = {
		out: path.join(__dirname,"..","dist/can."+lib+".dev.js")
	};
	configuration.outputs[lib+"-core-min +min+ignorelibs"] = {
		out: path.join(__dirname,"..","dist/can."+lib+".min.js")
	};
	return configuration;
};

var pkg = require('../package.json');

var makeAmdUtil = function(lib){
	var moduleName = "can/util/"+lib+"/"+lib;
	return {
		"graph": {
			system: {
				config: config,
				main: moduleName
			},
			options : {
				quiet: true
			}
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


module.exports = function(grunt){
	
	grunt.registerTask("build-dist", function(){
		var done = this.async();
		var options = this.options();
		stealToolsBuilder(
		{
			"tests": {
				"graph": {
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
					}
				},
				"outputs" : {
					"all tests": {
						ignore: allModuleNames,
						format: "global",
						out: path.join(__dirname,"..","test/pluginified/latest.js"),
						minify: false
					}
				}
			},
			"standalone & steal - plugins, jquery core, and jquery steal": {
				"graph":{
					system: {
						config: config,
						main: allModuleNames
					},
					options : {
						// verbose: true
					}
				},
				"outputs": {
					"all-plugins": {
						eachModule: [{type: "plugin"}],
						ignore: [{type: "core"}],
						out: function(moduleName, moduleData){
							return path.join(__dirname,"..","dist",moduleData.name.toLowerCase()+".js");
						},
						transpile: "global",
						minify: false
					},
					"jquery-core +ignorelibs" : {
						modules: [{type: "core"}],
						out: path.join(__dirname,"..","dist/can.jquery.js"),
						minify: false
					},
					"jquery-core-dev +ignorelibs" : {
						modules: [{type: "core"}],
						out: path.join(__dirname,"..","dist/can.jquery.dev.js"),
						keepDevelopmentCode: true,
						minify: false
					},
					"jquery-core-min +ignorelibs": {
						modules: [{type: "core"}],
						out: path.join(__dirname,"..","dist/can.jquery.min.js"),
						minify: true
					},
					"steal": {
						graphs: allModuleNames,
						out: function(moduleName){
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
					}
				}
			},
			"standalone & steal - core & utils - dojo": makeStandaloneAndStealUtil("dojo"),
			"standalone & steal - core & utils - yui": makeStandaloneAndStealUtil("yui"),
			"standalone & steal - core & utils - zepto": makeStandaloneAndStealUtil("zepto"),
			"standalone & steal - core & utils - mootools": makeStandaloneAndStealUtil("mootools"),
			"amd": {
				"graph": {
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
					}
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
			"amd - util - jquery": makeAmdUtil("jquery"),
			"amd - util - dojo": makeAmdUtil("dojo"),
			"amd - util - yui": makeAmdUtil("yui"),
			"amd - util - zepto": makeAmdUtil("zepto"),
			"amd - util - mootools": makeAmdUtil("mootools")
		}, 
		modules, 
		{
			"amddev" : {
				
				format: "amd",
				useNormalizedDependencies: true,
				normalize: reverseNormalize,
				out: function(moduleName){
					return path.join(__dirname,"..","dist/amd-dev/"+reverseNormalize(moduleName)+".js");
				},
				removeDevelopmentCode: false
			},
			"amd" : {
				format: "amd",
				useNormalizedDependencies: true,
				normalize: reverseNormalize,
				out: function(moduleName){
					return path.join(__dirname,"..","dist/amd/"+reverseNormalize(moduleName)+".js");
				}
			},
			"dev": {
				removeDevelopmentCode: false
			},
			"min": {
				minify: true
			},
			ignorelibs: {
				ignore: ["dojo","dojo/dojo","dojo/main",
				"jquery","jquery/jquery",
				"mootools/mootools","mootools",
				"zepto","zepto/zepto",
				"yui","yui/yui"]
			}
		}, 
		done);
	
	});
};