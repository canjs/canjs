var Node = require('./node').Node;

function DocumentFragment(ownerDocument) {
  this.nodeConstructor(11, '#document-fragment', null, ownerDocument);
}

DocumentFragment.prototype._cloneNode = function() {
  return this.ownerDocument.createDocumentFragment();
};

DocumentFragment.prototype = Object.create(Node.prototype);
DocumentFragment.prototype.constructor = DocumentFragment;
DocumentFragment.prototype.nodeConstructor = Node;

module.exports = DocumentFragment;
