/*!
 * CanJS - 2.3.3
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Mon, 30 Nov 2015 23:22:54 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.2.20#simple-dom/document/comment*/
steal('can-simple-dom@0.2.20#simple-dom/document/node', function (__can_simple_dom_0_2_20_simple_dom_document_node) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _node = __can_simple_dom_0_2_20_simple_dom_document_node;
    var _node2 = _interopRequireDefault(_node);
    function Comment(text, ownerDocument) {
        this.nodeConstructor(8, '#comment', text, ownerDocument);
    }
    Comment.prototype._cloneNode = function () {
        return this.ownerDocument.createComment(this.nodeValue);
    };
    Comment.prototype = Object.create(_node2['default'].prototype);
    Comment.prototype.constructor = Comment;
    Comment.prototype.nodeConstructor = _node2['default'];
    exports['default'] = Comment;
    module.exports = exports['default'];
});