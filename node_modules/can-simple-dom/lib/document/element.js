var _node = require("./node");
var nodeRemoveChild = _node.nodeRemoveChild;
var Node = _node.Node;

var CSSStyleDeclaration = require('./style');

let attrSpecial = {
  "class": function(element, value){
    element._className = value;
  }
};


function Element(tagName, ownerDocument) {
  tagName = tagName.toUpperCase();

  this.nodeConstructor(1, tagName, null, ownerDocument);
  this.style = new CSSStyleDeclaration(this);
  this.attributes = [];
  this.tagName = tagName;
}

Element.prototype = Object.create(Node.prototype);
Element.prototype.constructor = Element;
Element.prototype.nodeConstructor = Node;

Element.prototype._cloneNode = function() {
  var node = this.ownerDocument.createElement(this.tagName);

  node.attributes = this.attributes.map(function(attr) {
    return { name: attr.name, value: attr.value, specified: attr.specified };
  });

  return node;
};

Element.prototype.getAttribute = function(_name) {
  var attributes = this.attributes;
  var name = _name.toLowerCase();
  var attr;
  for (var i=0, l=attributes.length; i<l; i++) {
    attr = attributes[i];
    if (attr.name === name) {
      return attr.value;
    }
  }
  return null;
};

Element.prototype.setAttribute = function(){
	return this._setAttribute.apply(this, arguments);
};

Element.prototype._setAttribute = function(_name, value) {

	// make sure value is a string
	value += '';
  var attributes = this.attributes;
  var name = _name.toLowerCase();
  var attr;
  for (var i=0, l=attributes.length; i<l; i++) {
    attr = attributes[i];
    if (attr.name === name) {
      attr.value = value;
      const special = attrSpecial[name];
      if(special) {
        special(this, value);
      }
      return;
    }
  }
  attributes.push({
    name: name,
    value: value,
    specified: true // serializer compat with old IE
  });
  // a map and array
  attributes[name] = value;

  const special = attrSpecial[name];
  if(special) {
    special(this, value);
  }
};

Element.prototype.setAttributeNS = function(namespaceURI, name, value) {
	this._setAttribute(name, value);
	var i = this.attributes.length;
	do {
		i--;
		var attrNode = this.attributes[i];

		if(attrNode.name === name) {
			attrNode.namespaceURI = namespaceURI;
			break;
		}
	} while(i > 0);
};

Element.prototype.hasAttribute = function(_name) {
	var attributes = this.attributes;
	var name = _name.toLowerCase();
	var attr;
	for(var i = 0, len = attributes.length; i < len; i++) {
		attr = attributes[i];
		if(attr.name === name) {
			return true;
		}
	}
	return false;
};

Element.prototype.removeAttribute = function(name) {
  var attributes = this.attributes;
  for (var i=0, l=attributes.length; i<l; i++) {
    var attr = attributes[i];
    if (attr.name === name) {
      attributes.splice(i, 1);
      const special = attrSpecial[name];
      if(special) {
		special(this, undefined);
      }

      delete attributes[name];
      return;
    }
  }
};

Element.prototype.getElementsByTagName = function(name){
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

Element.prototype.getElementById = function(id){
  var cur = this.firstChild, child;
  while(cur) {
	if(cur.attributes && cur.attributes.length) {
		var attr;
		for(var i = 0, len = cur.attributes.length; i < len; i++) {
			attr = cur.attributes[i];
			if(attr.name === "id" && attr.value === id) {
				return cur;
			}
		}
	}
	if(cur.getElementById) {
		child = cur.getElementById(id);
		if(child) {
		  return child;
		}
	}
    cur = cur.nextSibling;
  }
};

function Style(node){
	this.__node = node;
}

if(Object.defineProperty) {
	Object.defineProperty(Element.prototype, "className", {
		configurable: true,
		enumerable: true,
		get: function() { return this._className || ""; },
		set: function(val){
			this._setAttribute("class", val);
			this._className = val;
		}
	});

	Object.defineProperty(Element.prototype, "innerHTML", {
		configurable: true,
		enumerable: true,
		get: function() {
			var html = "";
			var cur = this.firstChild;
			while (cur) {
				html += this.ownerDocument.__serializer.serialize(cur);
				cur = cur.nextSibling;
			}
			return html;
		},
		set: function(html) {
			this.lastChild = this.firstChild = null;
			var fragment;
			if (this.nodeName === "SCRIPT" || this.nodeName === "STYLE") {
				fragment = this.ownerDocument.createTextNode(html);
			} else {
				fragment = this.ownerDocument.__parser.parse(html);
			}
			this.appendChild(fragment);
		}
	});

	Object.defineProperty(Element.prototype, "outerHTML", {
		get: function() {
			return this.ownerDocument.__serializer.serialize(this);
		},
		set: function(html) {
			this.parentNode.replaceChild(this.ownerDocument.__parser.parse(html), this);
		}
	});

	Object.defineProperty(Element.prototype, "textContent", {
		get: function(){
			var fc = this.firstChild;
			return (fc && fc.nodeValue) || "";
		},
		set: function(val){
			while(this.firstChild) {
				nodeRemoveChild.call(this, this.firstChild);
			}
			var tn = this.ownerDocument.createTextNode(val);
			this.appendChild(tn);
		}
	});
}


module.exports = Element;
