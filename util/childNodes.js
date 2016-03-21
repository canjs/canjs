function childNodes(node) {
	var childNodes = node.childNodes;
	if ("length" in childNodes) {
		return childNodes;
	} else {
		var cur = node.firstChild;
		var nodes = [];
		while (cur) {
			nodes.push(cur);
			cur = cur.nextSibling;
		}
		return nodes;
	}
}

module.exports = childNodes;
