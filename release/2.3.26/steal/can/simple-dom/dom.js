/*!
 * CanJS - 2.3.26
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 18 Aug 2016 00:56:47 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.3.0#simple-dom/dom*/
steal('can-simple-dom@0.3.0#simple-dom/document/node', 'can-simple-dom@0.3.0#simple-dom/document/element', 'can-simple-dom@0.3.0#simple-dom/document', 'can-simple-dom@0.3.0#simple-dom/html-parser', 'can-simple-dom@0.3.0#simple-dom/html-serializer', 'can-simple-dom@0.3.0#simple-dom/void-map', function (__can_simple_dom_0_3_0_simple_dom_document_node, __can_simple_dom_0_3_0_simple_dom_document_element, __can_simple_dom_0_3_0_simple_dom_document, __can_simple_dom_0_3_0_simple_dom_html_parser, __can_simple_dom_0_3_0_simple_dom_html_serializer, __can_simple_dom_0_3_0_simple_dom_void_map) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _documentNode = __can_simple_dom_0_3_0_simple_dom_document_node;
    var _documentNode2 = _interopRequireDefault(_documentNode);
    var _documentElement = __can_simple_dom_0_3_0_simple_dom_document_element;
    var _documentElement2 = _interopRequireDefault(_documentElement);
    var _document = __can_simple_dom_0_3_0_simple_dom_document;
    var _document2 = _interopRequireDefault(_document);
    var _htmlParser = __can_simple_dom_0_3_0_simple_dom_html_parser;
    var _htmlParser2 = _interopRequireDefault(_htmlParser);
    var _htmlSerializer = __can_simple_dom_0_3_0_simple_dom_html_serializer;
    var _htmlSerializer2 = _interopRequireDefault(_htmlSerializer);
    var _voidMap = __can_simple_dom_0_3_0_simple_dom_void_map;
    var _voidMap2 = _interopRequireDefault(_voidMap);
    function createDocument(serializer, parser) {
        var doc = new _document2['default']();
        doc.__serializer = serializer;
        doc.__parser = parser;
        return doc;
    }
    exports.Node = _documentNode2['default'];
    exports.Element = _documentElement2['default'];
    exports.Document = _document2['default'];
    exports.HTMLParser = _htmlParser2['default'];
    exports.HTMLSerializer = _htmlSerializer2['default'];
    exports.voidMap = _voidMap2['default'];
    exports.createDocument = createDocument;
});