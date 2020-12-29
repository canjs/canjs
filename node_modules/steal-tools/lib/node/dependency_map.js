/**
 * @method stealTools.node.dependencyMap
 *
 * Creating a mapping from pre-normalized dependency names to the normalized version.
 * Save the mapping as `dependencyMap` on the node itself. Transpile will use this
 * information.
 */
module.exports = function(node) {
	var deps = node.deps || [];
	var dependencies = node.dependencies || [];
	var map = {};

	for(var i = 0, len = deps.length; i < len; i++) {
		map[deps[i]] = dependencies[i];
	}

	return map;
};
