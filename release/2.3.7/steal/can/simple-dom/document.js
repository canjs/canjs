/*!
 * CanJS - 2.3.7
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 16 Dec 2015 03:10:33 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.2.23#simple-dom/document*/
steal('can-simple-dom@0.2.23#simple-dom/document/node', 'can-simple-dom@0.2.23#simple-dom/document/element', 'can-simple-dom@0.2.23#simple-dom/document/text', 'can-simple-dom@0.2.23#simple-dom/document/comment', 'can-simple-dom@0.2.23#simple-dom/document/document-fragment', 'can-simple-dom@0.2.23#simple-dom/document/anchor-element', function (__can_simple_dom_0_2_23_simple_dom_document_node, __can_simple_dom_0_2_23_simple_dom_document_element, __can_simple_dom_0_2_23_simple_dom_document_text, __can_simple_dom_0_2_23_simple_dom_document_comment, __can_simple_dom_0_2_23_simple_dom_document_document_fragment, __can_simple_dom_0_2_23_simple_dom_document_anchor_element) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _documentNode = __can_simple_dom_0_2_23_simple_dom_document_node;
    var _documentNode2 = _interopRequireDefault(_documentNode);
    var _documentElement = __can_simple_dom_0_2_23_simple_dom_document_element;
    var _documentElement2 = _interopRequireDefault(_documentElement);
    var _documentText = __can_simple_dom_0_2_23_simple_dom_document_text;
    var _documentText2 = _interopRequireDefault(_documentText);
    var _documentComment = __can_simple_dom_0_2_23_simple_dom_document_comment;
    var _documentComment2 = _interopRequireDefault(_documentComment);
    var _documentDocumentFragment = __can_simple_dom_0_2_23_simple_dom_document_document_fragment;
    var _documentDocumentFragment2 = _interopRequireDefault(_documentDocumentFragment);
    var _documentAnchorElement = __can_simple_dom_0_2_23_simple_dom_document_anchor_element;
    var _documentAnchorElement2 = _interopRequireDefault(_documentAnchorElement);
    function Document() {
        this.nodeConstructor(9, '#document', null, this);
        this.documentElement = new _documentElement2['default']('html', this);
        this.body = new _documentElement2['default']('body', this);
        this.documentElement.appendChild(this.body);
        this.appendChild(this.documentElement);
    }
    Document.prototype = Object.create(_documentNode2['default'].prototype);
    Document.prototype.constructor = Document;
    Document.prototype.nodeConstructor = _documentNode2['default'];
    var specialElements = { 'a': _documentAnchorElement2['default'] };
    Document.prototype.createElement = function (tagName) {
        var Special = specialElements[tagName.toLowerCase()];
        if (Special) {
            return new Special(tagName, this);
        }
        return new _documentElement2['default'](tagName, this);
    };
    Document.prototype.createTextNode = function (text) {
        return new _documentText2['default'](text, this);
    };
    Document.prototype.createComment = function (text) {
        return new _documentComment2['default'](text, this);
    };
    Document.prototype.createDocumentFragment = function () {
        return new _documentDocumentFragment2['default'](this);
    };
    Document.prototype.getElementsByTagName = function (name) {
        name = name.toUpperCase();
        var elements = [];
        var cur = this.firstChild;
        while (cur) {
            if (cur.nodeType === _documentNode2['default'].ELEMENT_NODE) {
                if (cur.nodeName === name || name === '*') {
                    elements.push(cur);
                }
                elements.push.apply(elements, cur.getElementsByTagName(name));
            }
            cur = cur.nextSibling;
        }
        return elements;
    };
    Document.prototype.getElementById = function (id) {
        return _documentElement2['default'].prototype.getElementById.apply(this.documentElement, arguments);
    };
    if (Object.defineProperty) {
        Object.defineProperty(Document.prototype, 'currentScript', {
            get: function get() {
                var scripts = this.getElementsByTagName('script');
                var first = scripts[scripts.length - 1];
                if (!first) {
                    first = this.createElement('script');
                }
                return first;
            }
        });
    }
    exports['default'] = Document;
    module.exports = exports['default'];
});