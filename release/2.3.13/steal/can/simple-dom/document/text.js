/*!
 * CanJS - 2.3.13
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Mon, 01 Feb 2016 23:57:40 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.3.0-pre.2#simple-dom/document/text*/
steal('can-simple-dom@0.3.0-pre.2#simple-dom/document/node', function (__can_simple_dom_0_3_0_pre_2_simple_dom_document_node) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _node = __can_simple_dom_0_3_0_pre_2_simple_dom_document_node;
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