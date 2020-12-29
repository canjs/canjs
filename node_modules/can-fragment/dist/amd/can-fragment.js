/*can-fragment@1.3.0#can-fragment*/
define('can-fragment', [
    'require',
    'exports',
    'module',
    'can-globals/document/document',
    'can-namespace',
    'can-reflect',
    'can-child-nodes',
    'can-symbol'
], function (require, exports, module) {
    (function (global, require, exports, module) {
        'use strict';
        var getDocument = require('can-globals/document/document');
        var namespace = require('can-namespace');
        var canReflect = require('can-reflect');
        var childNodes = require('can-child-nodes');
        var canSymbol = require('can-symbol');
        var fragmentRE = /^\s*<(\w+)[^>]*>/, toString = {}.toString, toDOMSymbol = canSymbol.for('can.toDOM');
        function makeFragment(html, name, doc) {
            if (name === undefined) {
                name = fragmentRE.test(html) && RegExp.$1;
            }
            if (html && toString.call(html.replace) === '[object Function]') {
                html = html.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, '<$1></$2>');
            }
            var container = doc.createElement('div'), temp = doc.createElement('div');
            if (name === 'tbody' || name === 'tfoot' || name === 'thead' || name === 'colgroup') {
                temp.innerHTML = '<table>' + html + '</table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
            } else if (name === 'col') {
                temp.innerHTML = '<table><colgroup>' + html + '</colgroup></table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
            } else if (name === 'tr') {
                temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
            } else if (name === 'td' || name === 'th') {
                temp.innerHTML = '<table><tbody><tr>' + html + '</tr></tbody></table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild.firstChild;
            } else if (name === 'option') {
                temp.innerHTML = '<select>' + html + '</select>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
            } else {
                container.innerHTML = '' + html;
            }
            return [].slice.call(childNodes(container));
        }
        function fragment(html, doc) {
            if (html && html.nodeType === 11) {
                return html;
            }
            if (!doc) {
                doc = getDocument();
            } else if (doc.length) {
                doc = doc[0];
            }
            var parts = makeFragment(html, undefined, doc), frag = (doc || document).createDocumentFragment();
            for (var i = 0, length = parts.length; i < length; i++) {
                frag.appendChild(parts[i]);
            }
            return frag;
        }
        var makeFrag = function (item, doc) {
            var document = doc || getDocument();
            var frag;
            if (!item || typeof item === 'string') {
                frag = fragment(item == null ? '' : '' + item, document);
            } else if (typeof item[toDOMSymbol] === 'function') {
                return makeFrag(item[toDOMSymbol]());
            } else if (item.nodeType === 11) {
                return item;
            } else if (typeof item.nodeType === 'number') {
                frag = document.createDocumentFragment();
                frag.appendChild(item);
                return frag;
            } else if (canReflect.isListLike(item)) {
                frag = document.createDocumentFragment();
                canReflect.eachIndex(item, function (item) {
                    frag.appendChild(makeFrag(item));
                });
            } else {
                frag = fragment('' + item, document);
            }
            if (!childNodes(frag).length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        };
        module.exports = namespace.fragment = namespace.frag = makeFrag;
    }(function () {
        return this;
    }(), require, exports, module));
});