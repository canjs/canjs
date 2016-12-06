/*!
 * CanJS - 2.3.14
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Sat, 06 Feb 2016 00:01:32 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*can-simple-dom@0.3.0-pre.2#simple-dom/document/node*/
define('simple-dom/document/node', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    function Node(nodeType, nodeName, nodeValue, ownerDocument) {
        this.nodeType = nodeType;
        this.nodeName = nodeName;
        this.nodeValue = nodeValue;
        this.ownerDocument = ownerDocument;
        this.childNodes = new ChildNodes(this);
        this.parentNode = null;
        this.previousSibling = null;
        this.nextSibling = null;
        this.firstChild = null;
        this.lastChild = null;
    }
    Node.prototype._cloneNode = function () {
        return new Node(this.nodeType, this.nodeName, this.nodeValue, this.ownerDocument);
    };
    Node.prototype.cloneNode = function (deep) {
        var node = this._cloneNode();
        if (deep) {
            var child = this.firstChild, nextChild = child;
            while (nextChild) {
                nextChild = child.nextSibling;
                node.appendChild(child.cloneNode(true));
                child = nextChild;
            }
        }
        return node;
    };
    Node.prototype.appendChild = function (node) {
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            insertFragment(node, this, this.lastChild, null);
            return node;
        }
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        node.parentNode = this;
        var refNode = this.lastChild;
        if (refNode === null) {
            this.firstChild = node;
            this.lastChild = node;
        } else {
            node.previousSibling = refNode;
            refNode.nextSibling = node;
            this.lastChild = node;
        }
        return node;
    };
    function insertFragment(fragment, newParent, before, after) {
        if (!fragment.firstChild) {
            return;
        }
        var firstChild = fragment.firstChild;
        var lastChild = firstChild;
        var node = firstChild;
        firstChild.previousSibling = before;
        if (before) {
            before.nextSibling = firstChild;
        } else {
            newParent.firstChild = firstChild;
        }
        while (node) {
            node.parentNode = newParent;
            lastChild = node;
            node = node.nextSibling;
        }
        lastChild.nextSibling = after;
        if (after) {
            after.previousSibling = lastChild;
        } else {
            newParent.lastChild = lastChild;
        }
        fragment.firstChild = null;
        fragment.lastChild = null;
    }
    var nodeInsertBefore = Node.prototype.insertBefore = function (node, refNode) {
        if (refNode == null) {
            return this.appendChild(node);
        }
        if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            insertFragment(node, this, refNode ? refNode.previousSibling : null, refNode);
            return node;
        }
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        node.parentNode = this;
        var previousSibling = refNode.previousSibling;
        if (previousSibling) {
            previousSibling.nextSibling = node;
            node.previousSibling = previousSibling;
        }
        refNode.previousSibling = node;
        node.nextSibling = refNode;
        if (this.firstChild === refNode) {
            this.firstChild = node;
        }
        return node;
    };
    var nodeRemoveChild = Node.prototype.removeChild = function (refNode) {
        if (this.firstChild === refNode) {
            this.firstChild = refNode.nextSibling;
        }
        if (this.lastChild === refNode) {
            this.lastChild = refNode.previousSibling;
        }
        if (refNode.previousSibling) {
            refNode.previousSibling.nextSibling = refNode.nextSibling;
        }
        if (refNode.nextSibling) {
            refNode.nextSibling.previousSibling = refNode.previousSibling;
        }
        refNode.parentNode = null;
        refNode.nextSibling = null;
        refNode.previousSibling = null;
    };
    Node.prototype.replaceChild = function (newChild, oldChild) {
        nodeInsertBefore.call(this, newChild, oldChild);
        nodeRemoveChild.call(this, oldChild);
        return oldChild;
    };
    Node.prototype.addEventListener = function () {
    };
    Node.prototype.removeEventListner = function () {
    };
    Node.ELEMENT_NODE = 1;
    Node.ATTRIBUTE_NODE = 2;
    Node.TEXT_NODE = 3;
    Node.CDATA_SECTION_NODE = 4;
    Node.ENTITY_REFERENCE_NODE = 5;
    Node.ENTITY_NODE = 6;
    Node.PROCESSING_INSTRUCTION_NODE = 7;
    Node.COMMENT_NODE = 8;
    Node.DOCUMENT_NODE = 9;
    Node.DOCUMENT_TYPE_NODE = 10;
    Node.DOCUMENT_FRAGMENT_NODE = 11;
    Node.NOTATION_NODE = 12;
    function ChildNodes(node) {
        this.node = node;
    }
    ChildNodes.prototype.item = function (index) {
        var child = this.node.firstChild;
        for (var i = 0; child && index !== i; i++) {
            child = child.nextSibling;
        }
        return child;
    };
    module.exports = Node;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/document/element*/
define('simple-dom/document/element', [
    'exports',
    'module',
    'simple-dom/document/node'
], function (exports, module, _node) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _Node = _interopRequireDefault(_node);
    var attrSpecial = {
        'class': function _class(element, value) {
            element._className = value;
        }
    };
    function Element(tagName, ownerDocument) {
        tagName = tagName.toUpperCase();
        this.nodeConstructor(1, tagName, null, ownerDocument);
        this.style = new Style(this);
        this.attributes = [];
        this.tagName = tagName;
    }
    Element.prototype = Object.create(_Node['default'].prototype);
    Element.prototype.constructor = Element;
    Element.prototype.nodeConstructor = _Node['default'];
    Element.prototype._cloneNode = function () {
        var node = this.ownerDocument.createElement(this.tagName);
        node.attributes = this.attributes.map(function (attr) {
            return {
                name: attr.name,
                value: attr.value,
                specified: attr.specified
            };
        });
        return node;
    };
    Element.prototype.getAttribute = function (_name) {
        var attributes = this.attributes;
        var name = _name.toLowerCase();
        var attr;
        for (var i = 0, l = attributes.length; i < l; i++) {
            attr = attributes[i];
            if (attr.name === name) {
                return attr.value;
            }
        }
        return null;
    };
    Element.prototype.setAttribute = function () {
        return this._setAttribute.apply(this, arguments);
    };
    Element.prototype._setAttribute = function (_name, value) {
        var attributes = this.attributes;
        var name = _name.toLowerCase();
        var attr;
        for (var i = 0, l = attributes.length; i < l; i++) {
            attr = attributes[i];
            if (attr.name === name) {
                attr.value = value;
                return;
            }
        }
        attributes.push({
            name: name,
            value: value,
            specified: true
        });
        attributes[name] = value;
        var special = attrSpecial[name];
        if (special) {
            special(this, value);
        }
    };
    Element.prototype.removeAttribute = function (name) {
        var attributes = this.attributes;
        for (var i = 0, l = attributes.length; i < l; i++) {
            var attr = attributes[i];
            if (attr.name === name) {
                attributes.splice(i, 1);
                delete attributes[name];
                return;
            }
        }
    };
    Element.prototype.getElementsByTagName = function (name) {
        name = name.toUpperCase();
        var elements = [];
        var cur = this.firstChild;
        while (cur) {
            if (cur.nodeType === _Node['default'].ELEMENT_NODE) {
                if (cur.nodeName === name || name === '*') {
                    elements.push(cur);
                }
                elements.push.apply(elements, cur.getElementsByTagName(name));
            }
            cur = cur.nextSibling;
        }
        return elements;
    };
    Element.prototype.contains = function (child) {
        child = child.parentNode;
        while (child) {
            if (child === this) {
                return true;
            }
            child = child.parentNode;
        }
        return false;
    };
    Element.prototype.getElementById = function (id) {
        var cur = this.firstChild, child;
        while (cur) {
            if (cur.attributes && cur.attributes.length) {
                var attr;
                for (var i = 0, len = cur.attributes.length; i < len; i++) {
                    attr = cur.attributes[i];
                    if (attr.name === 'id' && attr.value === id) {
                        return cur;
                    }
                }
            }
            if (cur.getElementById) {
                child = cur.getElementById(id);
                if (child) {
                    return child;
                }
            }
            cur = cur.nextSibling;
        }
    };
    function Style(node) {
        this.__node = node;
    }
    if (Object.defineProperty) {
        Object.defineProperty(Element.prototype, 'className', {
            get: function get() {
                return this._className;
            },
            set: function set(val) {
                this._setAttribute('class', val);
                this._className = val;
            }
        });
        Object.defineProperty(Style.prototype, 'cssText', {
            get: function get() {
                return this.__node.getAttribute('style') || '';
            },
            set: function set(val) {
                this.__node._setAttribute('style', val);
            }
        });
        Object.defineProperty(Element.prototype, 'innerHTML', {
            get: function get() {
                var html = '';
                var cur = this.firstChild;
                while (cur) {
                    html += this.ownerDocument.__serializer.serialize(cur);
                    cur = cur.nextSibling;
                }
                return html;
            },
            set: function set(html) {
                this.lastChild = this.firstChild = null;
                var fragment = this.ownerDocument.__parser.parse(html);
                this.appendChild(fragment);
            }
        });
        Object.defineProperty(Element.prototype, 'outerHTML', {
            get: function get() {
                return this.ownerDocument.__serializer.serialize(this);
            },
            set: function set(html) {
                this.parentNode.replaceChild(this.ownerDocument.__parser.parse(html), this);
            }
        });
    }
    module.exports = Element;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/document/text*/
define('simple-dom/document/text', [
    'exports',
    'module',
    'simple-dom/document/node'
], function (exports, module, _node) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _Node = _interopRequireDefault(_node);
    function Text(text, ownerDocument) {
        this.nodeConstructor(3, '#text', text, ownerDocument);
    }
    Text.prototype._cloneNode = function () {
        return this.ownerDocument.createTextNode(this.nodeValue);
    };
    Text.prototype = Object.create(_Node['default'].prototype);
    Text.prototype.constructor = Text;
    Text.prototype.nodeConstructor = _Node['default'];
    module.exports = Text;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/document/comment*/
define('simple-dom/document/comment', [
    'exports',
    'module',
    'simple-dom/document/node'
], function (exports, module, _node) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _Node = _interopRequireDefault(_node);
    function Comment(text, ownerDocument) {
        this.nodeConstructor(8, '#comment', text, ownerDocument);
    }
    Comment.prototype._cloneNode = function () {
        return this.ownerDocument.createComment(this.nodeValue);
    };
    Comment.prototype = Object.create(_Node['default'].prototype);
    Comment.prototype.constructor = Comment;
    Comment.prototype.nodeConstructor = _Node['default'];
    module.exports = Comment;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/document/document-fragment*/
define('simple-dom/document/document-fragment', [
    'exports',
    'module',
    'simple-dom/document/node'
], function (exports, module, _node) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _Node = _interopRequireDefault(_node);
    function DocumentFragment(ownerDocument) {
        this.nodeConstructor(11, '#document-fragment', null, ownerDocument);
    }
    DocumentFragment.prototype._cloneNode = function () {
        return this.ownerDocument.createDocumentFragment();
    };
    DocumentFragment.prototype = Object.create(_Node['default'].prototype);
    DocumentFragment.prototype.constructor = DocumentFragment;
    DocumentFragment.prototype.nodeConstructor = _Node['default'];
    module.exports = DocumentFragment;
});
/*micro-location@0.1.5#lib/micro-location*/
function Location() {
    this.init.apply(this, arguments);
}
Location.prototype = {
    init: function (protocol, host, hostname, port, pathname, search, hash) {
        this.protocol = protocol;
        this.host = host;
        this.hostname = hostname;
        this.port = port || '';
        this.pathname = pathname || '';
        this.search = search || '';
        this.hash = hash || '';
        if (protocol) {
            with (this)
                this.href = protocol + '//' + host + pathname + search + hash;
        } else if (host) {
            with (this)
                this.href = '//' + host + pathname + search + hash;
        } else {
            with (this)
                this.href = pathname + search + hash;
        }
    },
    params: function (name) {
        if (!this._params) {
            var params = {};
            var pairs = this.search.substring(1).split(/[;&]/);
            for (var i = 0, len = pairs.length; i < len; i++) {
                if (!pairs[i])
                    continue;
                var pair = pairs[i].split(/=/);
                var key = decodeURIComponent(pair[0].replace(/\+/g, '%20'));
                var val = decodeURIComponent(pair[1].replace(/\+/g, '%20'));
                if (!params[key])
                    params[key] = [];
                params[key].push(val);
            }
            this._params = params;
        }
        switch (typeof name) {
        case 'undefined':
            return this._params;
        case 'object':
            return this.build(name);
        }
        return this._params[name] ? this._params[name][0] : null;
    },
    build: function (params) {
        if (!params)
            params = this._params;
        var ret = new Location();
        var _search = this.search;
        if (params) {
            var search = [];
            for (var key in params)
                if (params.hasOwnProperty(key)) {
                    var val = params[key];
                    switch (typeof val) {
                    case 'object':
                        for (var i = 0, len = val.length; i < len; i++) {
                            search.push(encodeURIComponent(key) + '=' + encodeURIComponent(val[i]));
                        }
                        break;
                    default:
                        search.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
                    }
                }
            _search = '?' + search.join('&');
        }
        with (this)
            ret.init.apply(ret, [
                protocol,
                host,
                hostname,
                port,
                pathname,
                _search,
                hash
            ]);
        return ret;
    }
};
Location.regexp = new RegExp('^(?:(https?:)//(([^:/]+)(:[^/]+)?))?([^#?]*)(\\?[^#]*)?(#.*)?$');
Location.parse = function (string) {
    var matched = String(string).match(this.regexp);
    var ret = new Location();
    ret.init.apply(ret, matched.slice(1));
    return ret;
};
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = { Location: factory() };
    } else if (typeof define === 'function' && define.amd) {
        define('lib/micro-location', [], function () {
            return { Location: factory() };
        });
    } else {
        root.Location = factory();
    }
}(this, function () {
    return Location;
}));
/*can-simple-dom@0.3.0-pre.2#simple-dom/extend*/
define('simple-dom/extend', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    module.exports = function (a, b) {
        for (var p in b) {
            a[p] = b[p];
        }
        return a;
    };
    ;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/document/anchor-element*/
define('simple-dom/document/anchor-element', [
    'exports',
    'module',
    'simple-dom/document/element',
    'lib/micro-location',
    'simple-dom/extend'
], function (exports, module, _element, _microLocation, _extend) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _Element = _interopRequireDefault(_element);
    var _microLocation2 = _interopRequireDefault(_microLocation);
    var _extend2 = _interopRequireDefault(_extend);
    var Location = _microLocation2['default'].Location || _microLocation2['default'];
    function AnchorElement(tagName, ownerDocument) {
        this.elementConstructor(tagName, ownerDocument);
        (0, _extend2['default'])(this, Location.parse(''));
    }
    AnchorElement.prototype = Object.create(_Element['default'].prototype);
    AnchorElement.prototype.constructor = AnchorElement;
    AnchorElement.prototype.elementConstructor = _Element['default'];
    AnchorElement.prototype.setAttribute = function (_name, value) {
        _Element['default'].prototype.setAttribute.apply(this, arguments);
        if (_name.toLowerCase() === 'href') {
            (0, _extend2['default'])(this, Location.parse(value));
        }
    };
    module.exports = AnchorElement;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/document*/
define('simple-dom/document', [
    'exports',
    'module',
    'simple-dom/document/node',
    'simple-dom/document/element',
    'simple-dom/document/text',
    'simple-dom/document/comment',
    'simple-dom/document/document-fragment',
    'simple-dom/document/anchor-element'
], function (exports, module, _documentNode, _documentElement, _documentText, _documentComment, _documentDocumentFragment, _documentAnchorElement) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _Node = _interopRequireDefault(_documentNode);
    var _Element = _interopRequireDefault(_documentElement);
    var _Text = _interopRequireDefault(_documentText);
    var _Comment = _interopRequireDefault(_documentComment);
    var _DocumentFragment = _interopRequireDefault(_documentDocumentFragment);
    var _AnchorElement = _interopRequireDefault(_documentAnchorElement);
    function Document() {
        this.nodeConstructor(9, '#document', null, this);
        this.documentElement = new _Element['default']('html', this);
        this.body = new _Element['default']('body', this);
        this.documentElement.appendChild(this.body);
        this.appendChild(this.documentElement);
        var self = this;
        this.implementation = {
            createHTMLDocument: function createHTMLDocument(content) {
                var document = new Document();
                var frag = self.__parser.parse(content);
                var body = _Element['default'].prototype.getElementsByTagName.call(frag, 'body')[0];
                var head = _Element['default'].prototype.getElementsByTagName.call(frag, 'head')[0];
                if (!body && !head) {
                    document.body.appendChild(frag);
                } else {
                    if (body) {
                        document.documentElement.replaceChild(body, document.body);
                    }
                    if (head) {
                        document.documentElement.replaceChild(head, document.head);
                    }
                    document.documentElement.appendChild(frag);
                }
                document.__addSerializerAndParser(self.__serializer, self.__parser);
                return document;
            }
        };
    }
    Document.prototype = Object.create(_Node['default'].prototype);
    Document.prototype.constructor = Document;
    Document.prototype.nodeConstructor = _Node['default'];
    var specialElements = { 'a': _AnchorElement['default'] };
    Document.prototype.createElement = function (tagName) {
        var Special = specialElements[tagName.toLowerCase()];
        if (Special) {
            return new Special(tagName, this);
        }
        return new _Element['default'](tagName, this);
    };
    Document.prototype.createTextNode = function (text) {
        return new _Text['default'](text, this);
    };
    Document.prototype.createComment = function (text) {
        return new _Comment['default'](text, this);
    };
    Document.prototype.createDocumentFragment = function () {
        return new _DocumentFragment['default'](this);
    };
    Document.prototype.getElementsByTagName = function (name) {
        name = name.toUpperCase();
        var elements = [];
        var cur = this.firstChild;
        while (cur) {
            if (cur.nodeType === _Node['default'].ELEMENT_NODE) {
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
        return _Element['default'].prototype.getElementById.apply(this.documentElement, arguments);
    };
    Document.prototype.__addSerializerAndParser = function (serializer, parser) {
        this.__parser = parser;
        this.__serializer = serializer;
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
    module.exports = Document;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/html-parser*/
define('simple-dom/html-parser', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
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
    module.exports = HTMLParser;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/html-serializer*/
define('simple-dom/html-serializer', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
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
    module.exports = HTMLSerializer;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/void-map*/
define('simple-dom/void-map', [
    'exports',
    'module'
], function (exports, module) {
    'use strict';
    module.exports = {
        AREA: true,
        BASE: true,
        BR: true,
        COL: true,
        COMMAND: true,
        EMBED: true,
        HR: true,
        IMG: true,
        INPUT: true,
        KEYGEN: true,
        LINK: true,
        META: true,
        PARAM: true,
        SOURCE: true,
        TRACK: true,
        WBR: true
    };
});
/*can-simple-dom@0.3.0-pre.2#simple-dom/dom*/
define('simple-dom/dom', [
    'exports',
    'simple-dom/document/node',
    'simple-dom/document/element',
    'simple-dom/document',
    'simple-dom/html-parser',
    'simple-dom/html-serializer',
    'simple-dom/void-map'
], function (exports, _documentNode, _documentElement, _document, _htmlParser, _htmlSerializer, _voidMap) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { 'default': obj };
    }
    var _Node = _interopRequireDefault(_documentNode);
    var _Element = _interopRequireDefault(_documentElement);
    var _Document = _interopRequireDefault(_document);
    var _HTMLParser = _interopRequireDefault(_htmlParser);
    var _HTMLSerializer = _interopRequireDefault(_htmlSerializer);
    var _voidMap2 = _interopRequireDefault(_voidMap);
    function createDocument(serializer, parser) {
        var doc = new _Document['default']();
        doc.__serializer = serializer;
        doc.__parser = parser;
        return doc;
    }
    exports.Node = _Node['default'];
    exports.Element = _Element['default'];
    exports.Document = _Document['default'];
    exports.HTMLParser = _HTMLParser['default'];
    exports.HTMLSerializer = _HTMLSerializer['default'];
    exports.voidMap = _voidMap2['default'];
    exports.createDocument = createDocument;
});
/*can-simple-dom@0.3.0-pre.2#simple-dom*/
define('simple-dom', [
    'exports',
    'simple-dom/dom'
], function (exports, _simpleDomDom) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};
            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key))
                        newObj[key] = obj[key];
                }
            }
            newObj['default'] = obj;
            return newObj;
        }
    }
    function _defaults(obj, defaults) {
        var keys = Object.getOwnPropertyNames(defaults);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = Object.getOwnPropertyDescriptor(defaults, key);
            if (value && value.configurable && obj[key] === undefined) {
                Object.defineProperty(obj, key, value);
            }
        }
        return obj;
    }
    if (typeof window !== 'undefined') {
        window.SimpleDOM = _simpleDomDom;
    }
    _defaults(exports, _interopRequireWildcard(_simpleDomDom));
});
/*can@2.3.14#util/vdom/build_fragment/make_parser*/
define('can/util/vdom/build_fragment/make_parser', [
    'can/view/parser/parser',
    'simple-dom'
], function (canParser, simpleDOM) {
    return function (document) {
        return new simpleDOM.HTMLParser(function (string) {
            var tokens = [];
            var currentTag, currentAttr;
            canParser(string, {
                start: function (tagName, unary) {
                    currentTag = {
                        type: 'StartTag',
                        attributes: [],
                        tagName: tagName
                    };
                },
                end: function (tagName, unary) {
                    tokens.push(currentTag);
                    currentTag = undefined;
                },
                close: function (tagName) {
                    tokens.push({
                        type: 'EndTag',
                        tagName: tagName
                    });
                },
                attrStart: function (attrName) {
                    currentAttr = [
                        attrName,
                        ''
                    ];
                    currentTag.attributes.push(currentAttr);
                },
                attrEnd: function (attrName) {
                },
                attrValue: function (value) {
                    currentAttr[1] += value;
                },
                chars: function (value) {
                    tokens.push({
                        type: 'Chars',
                        chars: value
                    });
                },
                comment: function (value) {
                    tokens.push({
                        type: 'Comment',
                        chars: value
                    });
                },
                special: function (value) {
                },
                done: function () {
                }
            });
            return tokens;
        }, document, simpleDOM.voidMap);
    };
});
/*can@2.3.14#util/vdom/document/document*/
define('can/util/vdom/document/document', [
    'can/util/can',
    'simple-dom',
    'can/util/vdom/build_fragment/make_parser'
], function (can, simpleDOM, makeParser) {
    var document = new simpleDOM.Document();
    var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
    var parser = makeParser(document);
    document.__addSerializerAndParser(serializer, parser);
    can.simpleDocument = document;
    return document;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();