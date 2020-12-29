var Document = require('../lib/document');

var root = typeof window !== "undefined" ? window : global;

var document = exports.document = new Document();

exports.element = function(tagName, attrs) {
  var el = document.createElement(tagName);
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  for (var i=2; i<arguments.length; i++) {
    el.appendChild(arguments[i]);
  }
  return el;
};

exports.fragment = function() {
  var frag = document.createDocumentFragment();
  for (var i=0; i<arguments.length; i++) {
    frag.appendChild(arguments[i]);
  }
  return frag;
};

exports.text = function(s) {
  return document.createTextNode(s);
};

exports.comment = function(s) {
  return document.createComment(s);
};
