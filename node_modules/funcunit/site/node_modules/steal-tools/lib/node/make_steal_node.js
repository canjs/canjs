var fs =  require('fs'),
	path = require('path');

module.exports = function(configuration){
	var stealPath = path.join(require.resolve("steal"), "/../steal");

	return {
		load: {
			metadata: {format: "global"},
			source: fs.readFileSync(path.join(stealPath+
				(configuration.options.minify ? ".production" : "")+
				".js")),
			name: "steal"
		},
		dependencies: [],
		deps: []
	};
};
