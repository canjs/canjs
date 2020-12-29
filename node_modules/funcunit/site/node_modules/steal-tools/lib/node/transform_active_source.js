
// This saves transforms on the source so if a similar transform has already happened,
// it doesn't have to happen again.
module.exports = function(node, key, getSource){
	if(!node.activeSourceKeys) {
		node.activeSourceKeys = [];
	}
	if(!node.transforms){
		node.transforms = {};
	}

	node.activeSourceKeys.push(key);
	var keys = node.activeSourceKeys.join(",");
	
	if( node.transforms[keys] ) {
		node.activeSource = node.transforms[keys];
	} else {
		node.transforms[keys] = node.activeSource = getSource(node, node.activeSource || {
			code: node.load.source
		});
	}
};
