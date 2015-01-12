var reverseNormalize = function(name){
	if(name === "util/library") {
		return "can/util/library";
	}
	if(name === "dojo" || name === "dojo/dojo") {
		return "dojo/main";
	}
	
	if(name === "can") {
		return "can";
	}
	var parts = name.split("/");
	if(parts.length > 1) {
		parts.splice(parts.length-2,1);
	} 
	return "can/"+parts.join("/");
	
};
var path = require("path");

module.exports = function(){
	return {
		"amddev" : {
			format: "amd",
			useNormalizedDependencies: true,
			normalize: reverseNormalize,
			dest: function(moduleName){
				return path.join(__dirname,"..","dist/amd-dev/"+reverseNormalize(moduleName)+".js");
			},
			removeDevelopmentCode: false
		},
		"amd" : {
			format: "amd",
			useNormalizedDependencies: true,
			normalize: reverseNormalize,
			dest: function(moduleName){
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
	};
};


