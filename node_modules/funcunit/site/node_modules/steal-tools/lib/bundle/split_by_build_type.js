
var nodeSize = require('../node/size');

module.exports = function(bundles){
	var splitBundles = [];
	bundles.forEach(function(bundle){
		var typeToBundle = {};
		
		bundle.nodes.forEach(function(node){
			
			var buildType = node.load.metadata.buildType || "js";
			
			var buildTypeBundle = typeToBundle[buildType];
			if(!buildTypeBundle) {
				buildTypeBundle = typeToBundle[buildType] = {
					size: 0,
					nodes: [],
					bundles: bundle.bundles,
					buildType: buildType
				};
			}
			
			buildTypeBundle.nodes.push(node);
			buildTypeBundle.size += nodeSize(node);
		});
		for(var buildType in typeToBundle) {
			splitBundles.push(typeToBundle[buildType]);
		}
	});
	return splitBundles;
};
