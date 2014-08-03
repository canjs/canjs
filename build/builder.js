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
	var parts = name.split("/");
	if(parts.length > 1) {
		parts.splice(parts.length-2,1);
	}
	return parts.join("/");
};


var makeStandaloneAndStealUtil = function(lib){
	var libUtilName = "util/"+lib+"/"+lib+".js";
	return {
		"graph":{
			system: {
				config: config,
				main: coreModules,
				paths: {
					"can/util/util": libUtilName
				}
			},
			options : {
				quiet: true
			}
		},
		outputs: {
			"dojo-core +ignorelibs" : {
				out: path.join(__dirname,"..","dist/can."+lib+".js")
			},
			"dojo-core-dev +dev+ignorelibs" : {
				out: path.join(__dirname,"..","dist/can."+lib+".dev.js")
			},
			"dojo-core-min +min+ignorelibs": {
				out: path.join(__dirname,"..","dist/can."+lib+".min.js")
			},
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
};

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
					quiet: true
				}
			},
			"outputs" : {
				"all tests": {
					ignore: allModuleNames,
					format: "global",
					out: path.join(__dirname,"..","test/pluginified/2.1.3.test.js"),
					minify: false
				}
			}
		},
		"standalone & steal - plugins, jquery core, and jquery steal": {
			"graph":{
				system: {
					config: config,
					main: allModuleNames
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
				"jquery-core" : {
					module: [{type: "core"}],
					ignore: ["jquery/jquery","jquery"],
					out: path.join(__dirname,"..","dist/can.jquery.js"),
					minify: false
				},
				"jquery-core-dev" : {
					module: "can/can",
					ignore: ["jquery/jquery","jquery"],
					out: path.join(__dirname,"..","dist/can.jquery.dev.js"),
					keepDevelopmentCode: false,
					minify: false
				},
				"jquery-core-min": {
					module: "can/can",
					ignore: ["jquery/jquery","jquery"],
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
		"amd - util - mootools": makeAmdUtil("mootools"),
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
			ignore: ["dojo","dojo/dojo","jquery","jquery/jquery"]
		}
	}, 
	function(err){
		if(err) {
			setTimeout(function(){
				throw err;
			},1)
		}
	});
