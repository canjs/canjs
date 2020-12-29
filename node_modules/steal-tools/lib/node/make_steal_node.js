var fs =  require("fs");
var path = require("path");

exports.withPromises = function() {
	return makeNode(
		fs.readFileSync(
			path.join(require.resolve("steal"), "..", "steal-with-promises.js"),
			"utf8"
		)
	);
};

exports.withoutPromises = function() {
	return makeNode(
		fs.readFileSync(
			path.join(require.resolve("steal"), "..", "steal.js"),
			"utf8"
		)
	);
};

function makeNode(source) {
	return {
		load: {
			metadata: {format: "global"},
			source: source,
			name: "steal"
		},
		dependencies: [],
		deps: []
	};
}
