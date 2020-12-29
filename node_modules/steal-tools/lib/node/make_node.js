var nodeSource = require("./source");

module.exports = function(name, source, type){
	return {
		load: {
			metadata: {
				format: type || "global",
				dependencies: [],
				deps: []
			},
			source: source || "",
			name: name
		},
		dependencies: [],
		deps: [],
		activeSource: {
			code: source || ""
		},
		activeSourceKeys: [],
		transforms: {},
		getSource: function(){
			return nodeSource(this);
		}
	};
};
