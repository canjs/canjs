import Node from './node';

function Text(text, ownerDocument) {
  this.nodeConstructor(3, '#text', text, ownerDocument);
}

Text.prototype._cloneNode = function() {
  return this.ownerDocument.createTextNode(this.nodeValue);
};

Text.prototype = Object.create(Node.prototype);
Text.prototype.constructor = Text;
Text.prototype.nodeConstructor = Node;

export default Text;
