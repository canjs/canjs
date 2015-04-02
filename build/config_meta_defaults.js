var isNpm = require("steal/ext/npm-utils").moduleName.isNpm;

// Function to remove the npmness from moduleNames
var denpm = function(moduleName){
	if(isNpm(moduleName)) {
		return moduleName.substr(moduleName.indexOf("#") + 1);
	}
	return moduleName;
};

var reverseNormalize = function(name, load, baseName, baseLoad){
	name = denpm(name);

	if(name === "dist/jquery") {
		return "jquery";
	}

	if(name === 'mootools/mootools' || name === 'yui/yui' || name === 'zepto/zepto') {
		return name.split('/')[0];
	}

	if(load.address.indexOf("node_modules") >= 0 ||
			load.address.indexOf("bower_components") >= 0 ||
			load.address.indexOf("lib/") >= 0) {
		return name.replace(/@.*/,"");
	}


	if(name === "util/library") {
		return "can/util/library";
	}

	if(name === "dojo" || name === "dojo/dojo") {
		return "dojo/main";
	}
	
	if(name === "can") {
		return name;
	}

	if(name === 'util/can') {
		return 'can/util/can';
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
			dest: function(moduleName, moduleData, load){
				return path.join(__dirname,"..","dist/amd-dev/"+reverseNormalize(moduleName, load)+".js");
			},
			removeDevelopmentCode: false
		},
		"amd" : {
			format: "amd",
			useNormalizedDependencies: true,
			normalize: reverseNormalize,
			dest: function(moduleName, moduleData, load){
				return path.join(__dirname,"..","dist/amd/"+reverseNormalize(moduleName, load)+".js");
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
			"yui","yui/yui"].concat([function(moduleName, load){
				if(load.address.indexOf("node_modules") >= 0) {
					return true;
				}
			}])
		}
	};
};


