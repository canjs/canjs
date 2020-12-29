module.exports = source;

function source(node, sourceProp) {
	var activeSource = node.activeSource && node.activeSource.code;

	return sourceProp ?
		node[sourceProp] :
		(
			activeSource ||
			node.normalizedSource ||
			node.minifiedSource ||
			node.transpiledSource ||
			node.load.source
		);
}

source.node = function(node, sourceProp) {
	if (sourceProp) {
		return node[sourceProp];
	}

	return (
		node.activeSource || {
			code: source(node)
		}
	);
};
