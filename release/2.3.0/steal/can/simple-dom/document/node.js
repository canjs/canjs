/*!
 * CanJS - 2.3.0
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 23 Oct 2015 20:30:08 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.2.20#simple-dom/document/node*/
steal('', function () {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function Node(nodeType, nodeName, nodeValue, ownerDocument) {
        this.nodeType = nodeType;
        this.nodeName = nodeName;
        this.nodeValue = nodeValue;
        this.ownerDocument = ownerDocument;
        this.childNodes = new ChildNodes(this);
        this.parentNode = null;
        this.previousSibling = null;
        this.nextSibling = null;
        this.firstChild = null;
        this.lastChild = null;
    }
    Node.prototype._cloneNode = function () {
        return new Node(this.nodeType, this.nodeName, this.nodeValue, this.ownerDocument);
    };
    Node.prototype.cloneNode = function (deep) {
        var node = this._cloneNode();
        if (deep) {
            var child = this.firstChild, nextChild = child;
            while (nextChild) {
                nextChild = child.nextSibling;
                node.appendChild(child.cloneNode(true));
                child = nextChild;
            }
        }
        return node;
    };
    Node.prototype.appendChild = function (node) {
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            insertFragment(node, this, this.lastChild, null);
            return node;
        }
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        node.parentNode = this;
        var refNode = this.lastChild;
        if (refNode === null) {
            this.firstChild = node;
            this.lastChild = node;
        } else {
            node.previousSibling = refNode;
            refNode.nextSibling = node;
            this.lastChild = node;
        }
        return node;
    };
    function insertFragment(fragment, newParent, before, after) {
        if (!fragment.firstChild) {
            return;
        }
        var firstChild = fragment.firstChild;
        var lastChild = firstChild;
        var node = firstChild;
        firstChild.previousSibling = before;
        if (before) {
            before.nextSibling = firstChild;
        } else {
            newParent.firstChild = firstChild;
        }
        while (node) {
            node.parentNode = newParent;
            lastChild = node;
            node = node.nextSibling;
        }
        lastChild.nextSibling = after;
        if (after) {
            after.previousSibling = lastChild;
        } else {
            newParent.lastChild = lastChild;
        }
        fragment.firstChild = null;
        fragment.lastChild = null;
    }
    Node.prototype.insertBefore = function (node, refNode) {
        if (refNode == null) {
            return this.appendChild(node);
        }
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            insertFragment(node, this, refNode ? refNode.previousSibling : null, refNode);
            return node;
        }
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        node.parentNode = this;
        var previousSibling = refNode.previousSibling;
        if (previousSibling) {
            previousSibling.nextSibling = node;
            node.previousSibling = previousSibling;
        }
        refNode.previousSibling = node;
        node.nextSibling = refNode;
        if (this.firstChild === refNode) {
            this.firstChild = node;
        }
        return node;
    };
    Node.prototype.removeChild = function (refNode) {
        if (this.firstChild === refNode) {
            this.firstChild = refNode.nextSibling;
        }
        if (this.lastChild === refNode) {
            this.lastChild = refNode.previousSibling;
        }
        if (refNode.previousSibling) {
            refNode.previousSibling.nextSibling = refNode.nextSibling;
        }
        if (refNode.nextSibling) {
            refNode.nextSibling.previousSibling = refNode.previousSibling;
        }
        refNode.parentNode = null;
        refNode.nextSibling = null;
        refNode.previousSibling = null;
    };
    Node.prototype.addEventListener = function () {
    };
    Node.prototype.removeEventListner = function () {
    };
    Node.ELEMENT_NODE = 1;
    Node.ATTRIBUTE_NODE = 2;
    Node.TEXT_NODE = 3;
    Node.CDATA_SECTION_NODE = 4;
    Node.ENTITY_REFERENCE_NODE = 5;
    Node.ENTITY_NODE = 6;
    Node.PROCESSING_INSTRUCTION_NODE = 7;
    Node.COMMENT_NODE = 8;
    Node.DOCUMENT_NODE = 9;
    Node.DOCUMENT_TYPE_NODE = 10;
    Node.DOCUMENT_FRAGMENT_NODE = 11;
    Node.NOTATION_NODE = 12;
    function ChildNodes(node) {
        this.node = node;
    }
    ChildNodes.prototype.item = function (index) {
        var child = this.node.firstChild;
        for (var i = 0; child && index !== i; i++) {
            child = child.nextSibling;
        }
        return child;
    };
    exports['default'] = Node;
    module.exports = exports['default'];
});