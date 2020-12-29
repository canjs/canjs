/*!
 * CanJS - 2.3.17
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 19 Feb 2016 22:54:51 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.3.0-pre.3#simple-dom/document/comment*/
steal('can-simple-dom@0.3.0-pre.3#simple-dom/document/node', function (__can_simple_dom_0_3_0_pre_3_simple_dom_document_node) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _node = __can_simple_dom_0_3_0_pre_3_simple_dom_document_node;
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