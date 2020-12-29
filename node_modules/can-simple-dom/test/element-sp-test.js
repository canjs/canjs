var Document = require('../can-simple-dom');
var QUnit = require('steal-qunit');
var Parser = require('../lib/html-parser');
var voidMap = require('../lib/void-map');
var Serializer = require('../lib/html-serializer');
var tokenize = require('../lib/default-tokenize');

QUnit.module('can-simple-dom - Element with serialization and parsing');

QUnit.test("document.implementation is supported (#23)", function(assert) {

  var document = new Document();
  document.__addSerializerAndParser(new Serializer(voidMap), new Parser(tokenize, document, voidMap));

  assert.ok(document.implementation, "implementation exists");
  var doc2 = document.implementation.createHTMLDocument("");
  assert.ok(doc2.body, "has a body");
});

QUnit.test("innerHTML supported", function(assert) {

  var document = new Document();
  document.__addSerializerAndParser(new Serializer(voidMap), new Parser(tokenize, document, voidMap));

  document.body.innerHTML = "<span class='bar'>HI</span>";

  assert.equal( document.body.firstChild.nodeName, "SPAN");
  assert.equal( document.body.firstChild.className, "bar");
  assert.equal( document.body.firstChild.firstChild.nodeValue, "HI");

  assert.equal( document.body.innerHTML, "<span class=\"bar\">HI</span>");
});

QUnit.test("outerHTML supported", function(assert) {

  var document = new Document();
  document.__addSerializerAndParser(new Serializer(voidMap), new Parser(tokenize, document, voidMap));

  document.body.innerHTML = "<span/><div id='item'>HI</div><span/>";

  var item = document.getElementById('item');

  assert.equal( item.outerHTML, "<div id=\"item\">HI</div>", "getter");
  item.outerHTML = "<label>IT</label>";

  assert.equal( document.body.innerHTML,  "<span></span><label>IT</label><span></span>", "setter");
});
