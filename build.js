var stealTools = require("steal-tools");

stealTools.export({
	system: {
		config: __dirname + "/package.json!npm"
	},
	outputs: {
		"+amd": {},
		"+global-js": {
			ignore: function(name, load){
				return false;
			}
		}
	}
}).catch(function(e){
	
	setTimeout(function(){
		throw e;
	},1);
	
});
