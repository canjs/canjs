var Node = require('./document/node').Node;
var Element = require('./document/element');
var Text = require('./document/text');
var Comment = require ('./document/comment');
var DocumentFragment = require('./document/document-fragment');
var AnchorElement = require('./document/anchor-element');
var InputElement = require('./document/input-element');
var OptionElement = require('./document/option-element');
var SelectElement = require('./document/select-element');

var noop = Function.prototype;

function Document() {
  this.nodeConstructor(9, '#document', null, this);
  var documentElement = new Element('html', this);
  var body = new Element('body', this);
  var head = new Element('head', this);
  documentElement.appendChild(head);
  documentElement.appendChild(body);
  this.appendChild(documentElement);
  var self = this;
  this.implementation = {
    createHTMLDocument: function(content){
      var document = new Document();
      var frag =  self.__parser.parse(content);

      var body = Element.prototype.getElementsByTagName.call(frag,"body")[0];
      var head = Element.prototype.getElementsByTagName.call(frag,"head")[0];

      if(!body && !head) {
        document.body.appendChild(frag);
      } else {
        if(body) {
          document.documentElement.replaceChild(body, document.body);
        }
        if(head) {
          document.documentElement.replaceChild(head, document.head);
        }
        document.documentElement.appendChild(frag);
      }
      document.__addSerializerAndParser(self.__serializer, self.__parser);
      return document;

    }
  };
}

Document.prototype = Object.create(Node.prototype);
Document.prototype.constructor = Document;
Document.prototype.nodeConstructor = Node;

const specialElements = {
  "a": AnchorElement,
  "input": InputElement,
  "option": OptionElement,
  "select": SelectElement
};

Document.prototype.createElement = function(tagName) {
  var Special = specialElements[tagName.toLowerCase()];
  if(Special) {
    return new Special(tagName, this);
  }

  return new Element(tagName, this);
};

Document.prototype.createTextNode = function(text) {
  return new Text(text, this);
};

Document.prototype.createComment = function(text) {
  return new Comment(text, this);
};

Document.prototype.createDocumentFragment = function() {
  return new DocumentFragment(this);
};

Document.prototype.getElementsByTagName = function(name){
	name = name.toUpperCase();
	var elements = [];
	var cur = this.firstChild;
	while(cur) {
		if(cur.nodeType === Node.ELEMENT_NODE) {
			if(cur.nodeName === name || name === "*") {
				elements.push(cur);
			}
			elements.push.apply(elements, cur.getElementsByTagName(name));
		}
		cur = cur.nextSibling;
	}
	return elements;
};
Document.prototype.getElementById = function(id){
  return Element.prototype.getElementById.apply(this.documentElement, arguments);
};

Document.prototype.__addSerializerAndParser = function(serializer, parser){
  this.__parser = parser;
  this.__serializer = serializer;
}

if(Object.defineProperty) {
  Object.defineProperty(Document.prototype, "currentScript", {
    get: function(){
      var scripts = this.getElementsByTagName("script");
      var first = scripts[scripts.length - 1];
      if(!first) {
        first = this.createElement("script");
      }
      return first;
    }
  });

	Object.defineProperty(Document.prototype, "documentElement", {
		get: function(){
			return this.firstChild;
		},
		// Noop the setter so if any code tries to set the documentElement
		// It does not throw.
		set: noop
	});

	function firstOfKind(root, nodeName) {
		if(root == null) return null;
		var node = root.firstChild;
		while(node) {
			if(node.nodeName === nodeName) {
				return node;
			}
			node = node.nextSibling;
		}
		return null;
	}

	["head", "body"].forEach(function(localName){
		var nodeName = localName.toUpperCase();
		Object.defineProperty(Document.prototype, localName, {
			get: function() {
				return firstOfKind(this.documentElement, nodeName);
			},
			set: noop
		});
	});
}

module.exports = Document;
