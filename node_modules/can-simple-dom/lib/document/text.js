var Node = require('./node').Node;

function Text(text, ownerDocument) {
  this.nodeConstructor(3, '#text', text, ownerDocument);
}

Text.prototype._cloneNode = function() {
  return this.ownerDocument.createTextNode(this.nodeValue);
};

Text.prototype = Object.create(Node.prototype);
Text.prototype.constructor = Text;
Text.prototype.nodeConstructor = Node;

module.exports = Text;
