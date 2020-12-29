
module.exports = function(node, options = {}){
	delete node.activeSourceKeys;
	node.activeSource = {
		code: node.load.source
	};
	if(options.removeSourceNodes) {
		delete node.sourceNode;
	}
};
