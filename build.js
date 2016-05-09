var stealTools = require("steal-tools");

stealTools.export({
	system: {
		config: __dirname + "/package.json!npm"
	},
	options: {
		useNormalizedDependencies: false
	},
	outputs: {
		"+global-js": {
			ignore: false
		}
	}
}).catch(function(e){
	
	setTimeout(function(){
		throw e;
	},1);
	
});
