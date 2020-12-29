"use strict";
var stealTools = require("steal-tools");
var globalJS = require("steal-tools/lib/build/helpers/global").js;
var baseHelpers = require("steal-tools/lib/build/helpers/base");


var baseNormalize = globalJS.normalize();

stealTools.export({
	steal: {
		config: __dirname+"/package.json!npm"
	},
	options: {
		//verbose: true
	},
	outputs: {
		"+amd": {},
		"global": {
			modules: globalJS.modules(),
			format: "global",
			dest: globalJS.dest(),
			useNormalizedDependencies: globalJS.useNormalizedDependencies(),
			// makes sure can-set and can-connect are namespaced so there's no collision
			normalize: function(depName, depLoad){
				var parsed = baseHelpers.parseModuleName(depLoad.name);
				var res;
				if(parsed.packageName !== "can-connect" && parsed.packageName !== "can-set") {
					res = baseNormalize.apply(this, arguments);
				} else {
					res = "fixture-"+parsed.packageName+"/"+parsed.modulePath
				}
				return res;
			},
			ignore: function(name, load){
				return false
			}
		}
	}
}).catch(function(e){

	setTimeout(function(){
		throw e;
	},1);

});
