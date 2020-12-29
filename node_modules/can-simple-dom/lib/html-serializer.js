var REG_ESCAPE_ALL = /[<>&]/g;
var REG_ESCAPE_PRESERVE_ENTITIES = /[<>]|&(?:#?[a-zA-Z0-9]+;)?/g;

function HTMLSerializer(voidMap) {
  this.voidMap = voidMap;
}

HTMLSerializer.prototype.openTag = function(element) {
  return '<' + element.nodeName.toLowerCase() + this.attributes(element.attributes) + '>';
};

HTMLSerializer.prototype.closeTag = function(element) {
  return '</' + element.nodeName.toLowerCase() + '>';
};

HTMLSerializer.prototype.isVoid = function(element) {
  return this.voidMap[element.nodeName] === true;
};

HTMLSerializer.prototype.attributes = function(namedNodeMap) {
  var buffer = '';
  for (var i=0, l=namedNodeMap.length; i<l; i++) {
    buffer += this.attr(namedNodeMap[i]);
  }
  return buffer;
};

HTMLSerializer.prototype.escapeAttrValue = function(attrValue) {
  return attrValue.replace(/"|&(?:#?[a-zA-Z0-9]+;)?/g, function(match) {
    switch(match) {
      case '&':
        return '&amp;';
      case '\"':
        return '&quot;';
      default:
        return match;
    }
  });
};

HTMLSerializer.prototype.attr = function(attr) {
  if (!attr.specified) {
    return '';
  }
  if (attr.value) {
    if (attr.name === 'href' || attr.name === 'src') {
      return ' ' + attr.name + '="' + attr.value + '"';
    }
    return ' ' + attr.name + '="' + this.escapeAttrValue(attr.value) + '"';
  }
  return ' ' + attr.name;
};

HTMLSerializer.prototype.escapeText = function(textNodeValue, escapeAll) {
  return textNodeValue.replace(escapeAll ? REG_ESCAPE_ALL : REG_ESCAPE_PRESERVE_ENTITIES, function(match) {
    switch(match) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      default:
        return match;
    }
  });
};

// see https://html.spec.whatwg.org/multipage/dom.html#metadata-content
var metadataContentTags = {
    style: true,
    script: true,
    template: true
};
function isMetadataTag (elem) {
  return !!elem && metadataContentTags[elem.nodeName.toLowerCase()];
}

HTMLSerializer.prototype.text = function(text) {
  if (isMetadataTag(text.parentNode)) {
    return text.nodeValue;
  }

  return this.escapeText(text.nodeValue);
};

HTMLSerializer.prototype.comment = function(comment) {
  return '<!--'+comment.nodeValue+'-->';
};


HTMLSerializer.prototype.serialize = function(node) {
  var buffer = '';
  var next;

  // open
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
  if(next) {
  	while(next) {
  	  buffer += this.serialize(next);
  	  next = next.nextSibling;
  	}
  } else if(node.nodeType === 1 && node.textContent){
    buffer += this.escapeText(node.textContent, true);
  }

  if (node.nodeType === 1 && !this.isVoid(node)) {
    buffer += this.closeTag(node);
  }

  return buffer;
};

module.exports = HTMLSerializer;
