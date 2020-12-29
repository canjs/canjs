"use strict";
var stealTools = require("steal-tools");

var modules = [];

stealTools.export({
	steal: {
		config: "package.json!npm",
		main: "can-connect/all"
	},
	options: {
		sourceMaps: true
	},
	outputs: {
		"+cjs": {
			ignore: function(name, load){
				if(load.address.indexOf("node_modules") >= 0 || load.metadata.format === "defined") {
					return true;
				} else {
					var srcIndex = load.name.indexOf("#")+1;
					modules.push( load.name.substr(srcIndex) );
				}
			}
		},
		"+amd": {},
		"+global-js": {
			exports: {
				"jquery": "jQuery"
			}
		}
	}
});
