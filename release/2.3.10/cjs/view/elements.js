/*!
 * CanJS - 2.3.10
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Fri, 15 Jan 2016 00:42:09 GMT
 * Licensed MIT
 */

/*can@2.3.10#view/elements*/
var can = require('../util/util.js');
require('./view.js');
var doc = typeof document !== 'undefined' ? document : null;
var selectsCommentNodes = doc && function () {
    return can.$(document.createComment('~')).length === 1;
}();
var elements = {
    tagToContentPropMap: {
        option: doc && 'textContent' in document.createElement('option') ? 'textContent' : 'innerText',
        textarea: 'value'
    },
    attrMap: can.attr.map,
    attrReg: /([^\s=]+)[\s]*=[\s]*/,
    defaultValue: can.attr.defaultValue,
    tagMap: {
        '': 'span',
        colgroup: 'col',
        table: 'tbody',
        tr: 'td',
        ol: 'li',
        ul: 'li',
        tbody: 'tr',
        thead: 'tr',
        tfoot: 'tr',
        select: 'option',
        optgroup: 'option'
    },
    reverseTagMap: {
        col: 'colgroup',
        tr: 'tbody',
        option: 'select',
        td: 'tr',
        th: 'tr',
        li: 'ul'
    },
    selfClosingTags: { col: true },
    getParentNode: function (el, defaultParentNode) {
        return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
    },
    setAttr: can.attr.set,
    getAttr: can.attr.get,
    removeAttr: can.attr.remove,
    contentText: function (text) {
        if (typeof text === 'string') {
            return text;
        }
        if (!text && text !== 0) {
            return '';
        }
        return '' + text;
    },
    after: function (oldElements, newFrag) {
        var last = oldElements[oldElements.length - 1];
        if (last.nextSibling) {
            can.insertBefore(last.parentNode, newFrag, last.nextSibling, can.document);
        } else {
            can.appendChild(last.parentNode, newFrag, can.document);
        }
    },
    replace: function (oldElements, newFrag) {
        var selectedValue, parentNode = oldElements[0].parentNode;
        if (parentNode.nodeName.toUpperCase() === 'SELECT' && parentNode.selectedIndex >= 0) {
            selectedValue = parentNode.value;
        }
        elements.after(oldElements, newFrag);
        if (can.remove(can.$(oldElements)).length < oldElements.length && !selectsCommentNodes) {
            can.each(oldElements, function (el) {
                if (el.nodeType === 8) {
                    el.parentNode.removeChild(el);
                }
            });
        }
        if (selectedValue !== undefined) {
            parentNode.value = selectedValue;
        }
    }
};
can.view.elements = elements;
module.exports = elements;