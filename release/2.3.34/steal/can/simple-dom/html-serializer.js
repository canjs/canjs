/*!
 * CanJS - 2.3.34
 * http://canjs.com/
 * Copyright (c) 2018 Bitovi
 * Fri, 20 Apr 2018 19:04:13 GMT
 * Licensed MIT
 */

/*can-simple-dom@0.3.0#simple-dom/html-serializer*/
steal('', function () {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function HTMLSerializer(voidMap) {
        this.voidMap = voidMap;
    }
    HTMLSerializer.prototype.openTag = function (element) {
        return '<' + element.nodeName.toLowerCase() + this.attributes(element.attributes) + '>';
    };
    HTMLSerializer.prototype.closeTag = function (element) {
        return '</' + element.nodeName.toLowerCase() + '>';
    };
    HTMLSerializer.prototype.isVoid = function (element) {
        return this.voidMap[element.nodeName] === true;
    };
    HTMLSerializer.prototype.attributes = function (namedNodeMap) {
        var buffer = '';
        for (var i = 0, l = namedNodeMap.length; i < l; i++) {
            buffer += this.attr(namedNodeMap[i]);
        }
        return buffer;
    };
    HTMLSerializer.prototype.escapeAttrValue = function (attrValue) {
        return attrValue.replace(/[&"]/g, function (match) {
            switch (match) {
            case '&':
                return '&amp;';
            case '"':
                return '&quot;';
            }
        });
    };
    HTMLSerializer.prototype.attr = function (attr) {
        if (!attr.specified) {
            return '';
        }
        if (attr.value) {
            return ' ' + attr.name + '="' + this.escapeAttrValue(attr.value) + '"';
        }
        return ' ' + attr.name;
    };
    HTMLSerializer.prototype.escapeText = function (textNodeValue) {
        return textNodeValue.replace(/[&<>]/g, function (match) {
            switch (match) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            }
        });
    };
    HTMLSerializer.prototype.text = function (text) {
        var parentNode = text.parentNode;
        if (parentNode && (parentNode.nodeName === 'STYLE' || parentNode.nodeName === 'SCRIPT')) {
            return text.nodeValue;
        }
        return this.escapeText(text.nodeValue);
    };
    HTMLSerializer.prototype.comment = function (comment) {
        return '<!--' + comment.nodeValue + '-->';
    };
    HTMLSerializer.prototype.serialize = function (node) {
        var buffer = '';
        var next;
        switch (node.nodeType) {
        case 1:
            buffer += this.openTag(node);
            break;
        case 3:
            buffer += this.text(node);
            break;
        case 8:
            buffer += this.comment(node);
            break;
        default:
            break;
        }
        next = node.firstChild;
        if (next) {
            while (next) {
                buffer += this.serialize(next);
                next = next.nextSibling;
            }
        } else if (node.nodeType === 1 && node.textContent) {
            buffer += node.textContent;
        }
        if (node.nodeType === 1 && !this.isVoid(node)) {
            buffer += this.closeTag(node);
        }
        return buffer;
    };
    exports['default'] = HTMLSerializer;
    module.exports = exports['default'];
});