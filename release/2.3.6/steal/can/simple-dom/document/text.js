/*!
 * CanJS - 2.3.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Sat, 12 Dec 2015 01:07:53 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.2.20#simple-dom/document/text*/
steal('can-simple-dom@0.2.20#simple-dom/document/node', function (__can_simple_dom_0_2_20_simple_dom_document_node) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _node = __can_simple_dom_0_2_20_simple_dom_document_node;
    var _node2 = _interopRequireDefault(_node);
    function Text(text, ownerDocument) {
        this.nodeConstructor(3, '#text', text, ownerDocument);
    }
    Text.prototype._cloneNode = function () {
        return this.ownerDocument.createTextNode(this.nodeValue);
    };
    Text.prototype = Object.create(_node2['default'].prototype);
    Text.prototype.constructor = Text;
    Text.prototype.nodeConstructor = _node2['default'];
    exports['default'] = Text;
    module.exports = exports['default'];
});