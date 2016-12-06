/*!
 * CanJS - 2.3.19
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 05 Mar 2016 00:00:37 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.3.0#simple-dom/html-parser*/
steal('', function () {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function HTMLParser(tokenize, document, voidMap) {
        this.tokenize = tokenize;
        this.document = document;
        this.voidMap = voidMap;
        this.parentStack = [];
    }
    HTMLParser.prototype.isVoid = function (element) {
        return this.voidMap[element.nodeName] === true;
    };
    HTMLParser.prototype.pushElement = function (token) {
        var el = this.document.createElement(token.tagName);
        for (var i = 0; i < token.attributes.length; i++) {
            var attr = token.attributes[i];
            el.setAttribute(attr[0], attr[1]);
        }
        if (this.isVoid(el) || token.selfClosing) {
            return this.appendChild(el);
        }
        this.parentStack.push(el);
    };
    HTMLParser.prototype.popElement = function (token) {
        var el = this.parentStack.pop();
        if (el.nodeName !== token.tagName.toUpperCase()) {
            throw new Error('unbalanced tag');
        }
        this.appendChild(el);
    };
    HTMLParser.prototype.appendText = function (token) {
        var text = this.document.createTextNode(token.chars);
        this.appendChild(text);
    };
    HTMLParser.prototype.appendComment = function (token) {
        var comment = this.document.createComment(token.chars);
        this.appendChild(comment);
    };
    HTMLParser.prototype.appendChild = function (node) {
        var parentNode = this.parentStack[this.parentStack.length - 1];
        parentNode.appendChild(node);
    };
    HTMLParser.prototype.parse = function (html) {
        var fragment = this.document.createDocumentFragment();
        this.parentStack.push(fragment);
        var tokens = this.tokenize(html);
        for (var i = 0, l = tokens.length; i < l; i++) {
            var token = tokens[i];
            switch (token.type) {
            case 'StartTag':
                this.pushElement(token);
                break;
            case 'EndTag':
                this.popElement(token);
                break;
            case 'Chars':
                this.appendText(token);
                break;
            case 'Comment':
                this.appendComment(token);
                break;
            }
        }
        return this.parentStack.pop();
    };
    exports['default'] = HTMLParser;
    module.exports = exports['default'];
});