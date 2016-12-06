/*!
 * CanJS - 2.3.2
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 13 Nov 2015 23:57:31 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.2.20#simple-dom/document/document-fragment*/
steal('can-simple-dom@0.2.20#simple-dom/document/node', function (__can_simple_dom_0_2_20_simple_dom_document_node) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _node = __can_simple_dom_0_2_20_simple_dom_document_node;
    var _node2 = _interopRequireDefault(_node);
    function DocumentFragment(ownerDocument) {
        this.nodeConstructor(11, '#document-fragment', null, ownerDocument);
    }
    DocumentFragment.prototype._cloneNode = function () {
        return this.ownerDocument.createDocumentFragment();
    };
    DocumentFragment.prototype = Object.create(_node2['default'].prototype);
    DocumentFragment.prototype.constructor = DocumentFragment;
    DocumentFragment.prototype.nodeConstructor = _node2['default'];
    exports['default'] = DocumentFragment;
    module.exports = exports['default'];
});