"use strict";
var stealTools = require("steal-tools");

stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm"
	},
	outputs: {
		"+amd": {},
		"+standalone": {
			exports: {
				"can-util/namespace": "can"
			}
		}
	}
}).catch(function(e){
	
	setTimeout(function(){
		throw e;
	},1);
	
});
