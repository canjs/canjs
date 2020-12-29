/**
 * Whether the node is a plugin that won't be included in the build
 * @param {Object} node - A node from the dependency graph
 * @return {boolean}
 */
module.exports = function isPluginExcludedFromBuild(node) {
	return Boolean(
		node.isPlugin && (!node.value.includeInBuild || node.value.pluginBuilder)
	);
};
