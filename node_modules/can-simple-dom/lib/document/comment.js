var Node = require('./node').Node;

function Comment(text, ownerDocument) {
  this.nodeConstructor(8, '#comment', text, ownerDocument);
}

Comment.prototype._cloneNode = function() {
  return this.ownerDocument.createComment(this.nodeValue);
};

Comment.prototype = Object.create(Node.prototype);
Comment.prototype.constructor = Comment;
Comment.prototype.nodeConstructor = Node;

module.exports = Comment;
