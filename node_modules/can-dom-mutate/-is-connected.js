var globals = require('can-globals');
var util = require('./-util');
var contains = util.contains;
var mutate = {};
var isConnected;
function getIsConnectedFromNode(node) {
	return node.isConnected;
}
function getIsConnectedFromDocument(node) {
	var doc = node.ownerDocument;
	// if node *is* the document, ownerDocument is null
	// However, CanSimpleDom implements this incorrectly, and a document's ownerDocument is itself,
	//   so make both checks
	return doc === null || doc === node || contains(doc, node);
}

function setIsConnected(doc) {
	if(doc) {
		var node = doc.createTextNode("");
		isConnected = 'isConnected' in node.constructor.prototype ?
			getIsConnectedFromNode :
			getIsConnectedFromDocument;
		if(mutate) {
			mutate.isConnected = isConnected;
		}
	} else {
		mutate.isConnected = getIsConnectedFromNode;
	}
}
setIsConnected(globals.getKeyValue("document"));
globals.onKeyValue("document", setIsConnected);

module.exports = mutate;
