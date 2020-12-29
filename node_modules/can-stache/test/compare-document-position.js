/* global getChildNodes */
module.exports = function(Node) {

  Node.DOCUMENT_POSITION_DISCONNECTED = 1;
  Node.DOCUMENT_POSITION_PRECEDING = 2;
  Node.DOCUMENT_POSITION_FOLLOWING = 4;
  Node.DOCUMENT_POSITION_CONTAINS = 8;
  Node.DOCUMENT_POSITION_CONTAINED_BY = 16;
  Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = 32;

  Node.prototype.compareDocumentPosition = function(other) {
    function getFirstNodeByOrder(nodes, nodeOne, nodeTwo) {
      return nodes.reduce(function(result, node) {
        if (result !== false) {
          return result;
        } else if (node === nodeOne) {
          return nodeOne;
        } else if (node === nodeTwo) {
          return nodeTwo;
        } else if (node.childNodes) {
          return getFirstNodeByOrder(getChildNodes(node), nodeOne, nodeTwo);
        } else {
          return false;
        }
      }, false);
    }

    function isAncestor(source, target) {
      while (target.parentNode) {
        target = target.parentNode;
        if (target === source) {
          return true;
        }
      }
      return false;
    }

    function eitherContains(left, right) {
      return isAncestor(left, right) ?
        Element.DOCUMENT_POSITION_CONTAINED_BY + Element.DOCUMENT_POSITION_FOLLOWING :
        isAncestor(right, left) ?
        Element.DOCUMENT_POSITION_CONTAINS + Element.DOCUMENT_POSITION_PRECEDING :
        false;
    }

    function getRootNode(node) {
      while (node.parentNode) {
        node = node.parentNode;
      }
      return node;
    }

    if (this === other) {
      return 0;
    }

    var referenceRoot = getRootNode(this);
    var otherRoot = getRootNode(other);

    if (referenceRoot !== otherRoot) {
      return Element.DOCUMENT_POSITION_DISCONNECTED;
    }

    var result = eitherContains(this, other);
    if (result) {
      return result;
    }

    var first = getFirstNodeByOrder([referenceRoot], this, other);
    return first === this ?
      Element.DOCUMENT_POSITION_FOLLOWING :
      first === other ?
      Element.DOCUMENT_POSITION_PRECEDING :
      Element.DOCUMENT_POSITION_DISCONNECTED;
  };

};
