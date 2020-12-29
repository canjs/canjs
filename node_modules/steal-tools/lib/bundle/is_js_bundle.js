/**
 * Whether the bundle contains only JavaScript nodes
 * @param {Object} bundle - The bundle
 * @return {boolean}
 */
module.exports = function isJavaScriptBundle(bundle) {
	return bundle.buildType == null || bundle.buildType === "js";
};
