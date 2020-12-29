var eachDependants = require("./each_dependants");

module.exports = function(graph, name) {
	var deps = [];
	eachDependants(graph, name, function(depName) {
		deps.push(depName);
	});
	return deps;
};
