var Document = require('../lib/document');
var Serializer = require('../lib/html-serializer');
var voidMap = require('../lib/void-map');
var _support = require('./support');
var element = _support.element;
var fragment = _support.fragment;
var text = _support.text;
var QUnit = require("steal-qunit");

QUnit.module('can-simple-dom - Element');

// See http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-core.html#ID-B63ED1A3
QUnit.test("appending a document fragment appends the fragment's children and not the fragment itself", function(assert) {
  var document = new Document();

  var frag = document.createDocumentFragment();
  var elem = document.createElement('div');
  var head = document.head;
  var body = document.body;

  assert.ok(!!head, "There is a <head> element");
  assert.ok(!!body, "There is a <body> element");
  assert.strictEqual(body.firstChild, null, "body has no children");

  frag.appendChild(elem);
  body.appendChild(frag);

  assert.strictEqual(body.firstChild.tagName, "DIV", "fragment's child is added as child of document");
});

// See http://www.w3.org/TR/2000/WD-DOM-Level-1-20000929/level-one-core.html#ID-B63ED1A3
QUnit.test("appending a document fragment (via insertBefore) appends the fragment's children and not the fragment itself", function(assert) {
  var document = new Document();

  var frag = document.createDocumentFragment();
  var elem = document.createElement('div');
  var existing = document.createElement('main');
  var body = document.body;
  body.appendChild(existing);

  assert.strictEqual(body.firstChild.tagName, "MAIN", "sanity check: the main element was actually inserted");
  assert.strictEqual(body.lastChild.tagName, "MAIN", "sanity check: the main element was actually inserted");

  frag.appendChild(elem);
  body.insertBefore(frag, existing);

  assert.strictEqual(body.firstChild.tagName, "DIV", "The body's first child is now DIV");
  assert.strictEqual(body.lastChild.tagName, "MAIN", "The body's last child is now MAIN");
});

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-536297177
QUnit.test("child nodes can be access via item()", function(assert) {
  var document = new Document();

  var parent = document.createElement('div');

  var child1 = document.createElement('p');
  var child2 = document.createElement('img');

  assert.strictEqual(parent.childNodes.item(0), null, "attempting to access an item that doesn't exist returns null");

  parent.appendChild(child1);
  parent.appendChild(child2);

  assert.strictEqual(parent.childNodes.item(0), child1);
  assert.strictEqual(parent.childNodes.item(1), child2);
  assert.strictEqual(parent.childNodes.item(2), null);

  parent.removeChild(child1);
  assert.strictEqual(parent.childNodes.item(0), child2);
  assert.strictEqual(parent.childNodes.item(1), null);

  parent.removeChild(child2);

  assert.strictEqual(parent.childNodes.item(0), null);
  assert.strictEqual(parent.childNodes.item(1), null);
});

QUnit.test("insertBefore can insert before the last child node", function(assert) {
  var document = new Document();

  var parent = document.createElement('div');

  var child1 = document.createElement('p');
  var child2 = document.createElement('img');
  var child3 = document.createElement('span');

  parent.appendChild(child1);
  parent.appendChild(child2);

  parent.insertBefore(child3, child2);

  assert.strictEqual(parent.childNodes.item(1), child3);
});

QUnit.test("cloneNode(true) recursively clones nodes", function(assert) {
  var parent = element('div');

  var child1 = element('p');
  var child2 = element('img', { src: "hamster.png" });
  var child3 = element('span');

  parent.appendChild(child1);
  parent.appendChild(child2);
  parent.appendChild(child3);

  var child11 = text('hello');
  var child12 = element('span');
  child12.appendChild(text(' world'));
  var child13 = text('!');

  child1.appendChild(child11);
  child1.appendChild(child12);
  child1.appendChild(child13);

  var clone = parent.cloneNode(true);

  assert.notEqual(parent.firstChild, null);
  assert.notStrictEqual(clone.firstChild, parent.firstChild);

  var clone2 = parent.cloneNode(true);

  assert.notEqual(parent.firstChild, null);
  assert.notStrictEqual(clone2.firstChild, clone.firstChild);
  assert.notStrictEqual(clone2.firstChild, parent.firstChild);

  var actual = new Serializer(voidMap).serialize(fragment(clone));

  assert.equal(actual, '<div><p>hello<span> world</span>!</p><img src="hamster.png"><span></span></div>');
});

QUnit.test("anchor element is created successfully - micro-location works (see #11)", function (assert) {
  assert.expect(0);

  var document = new Document();

  try {
    document.createElement("a");
  } catch (ex) {
    assert.ok(false, "Anchor throws exception");
  }
});

QUnit.test("anchor elements href is reflected on attributes", function(assert) {
	assert.expect(1);
	var document = new Document();
	var el = document.createElement("a");
	el.href = "foo.com";
	assert.equal(el.getAttribute("href"), "foo.com");
});

QUnit.test("style.cssText is two way bound to the style attribute (#13)", function(assert){
  var document = new Document();
  var el = document.createElement('div');
  el.style.cssText = "color: green;";
  assert.equal(el.getAttribute("style"), "color: green;");
});

QUnit.test("replaceChild works", function(assert){
	var document = new Document();
	var parent = document.createElement('div');
	var one = document.createElement('p');
	var two = document.createElement('span');

	parent.appendChild(one);

	assert.equal(parent.firstChild.nodeName, 'P', 'first child is a p');

	var oldChild = parent.replaceChild(two, one);

	assert.equal(oldChild, one, 'correct return value');
	assert.equal(parent.firstChild.nodeName, 'SPAN', 'child is now the span');
});

QUnit.test("Replacing the document's firstChild updates documentElement", function(assert){
	var document = new Document();
	var first = document.documentElement;

	var html = document.createElement("html");
	var head = document.createElement("head");
	var body = document.createElement("body");
	html.appendChild(head);
	html.appendChild(body);
	document.replaceChild(html, document.documentElement);

	assert.equal(document.documentElement, html, "documentElement is updated");
	assert.equal(document.body, body, "document.body is updated");
	assert.equal(document.head, head, "document.head is updated");
});

QUnit.test("setAttribute('class', value) updates the className", function(assert){
	var document = new Document();
	var el = document.createElement("div");
	el.setAttribute("class", "foo bar");

	assert.equal(el.className, "foo bar", "Element's className is same as the attribute class");
});

QUnit.test("setAttribute('class', value) updates an existing className", function (assert) {
	var document = new Document();
	var el = document.createElement("div");
	el.setAttribute("class", "foo bar");
	el.setAttribute("class", "baz foo");

	assert.equal(el.className, "baz foo", "Element's className is updated");
});

QUnit.test("setAttribute('value', number) converts number to string", function (assert) {
	var document = new Document();
	var el = document.createElement("input");
	el.setAttribute("value", 10);

	assert.propEqual(el.value, "10", "Element's value is coerced to a string");
	assert.equal(typeof el.value, "string", "Element's value is coerced to a string");
});

QUnit.test("removeAttribute('class') updates the className", function (assert) {
	var document = new Document();
	var el = document.createElement("div");
	el.setAttribute("class", "foo bar");
	el.removeAttribute("class");

	assert.equal(el.className, '', "Element's className is same as the attribute class");
});

QUnit.test("setAttributeNS() sets the namespaceURI", function(assert) {
	var document = new Document();
	var d = document.createElement('d1');
	var ns = 'http://www.mozilla.org/ns/specialspace';
	d.setAttributeNS(ns, 'align', 'center');
	var attrs = d.attributes;
	assert.equal(attrs[0].namespaceURI, ns, "sets the namespace");
});

QUnit.test("innerHTML does not parse the contents of SCRIPT and STYLE nodes", function (assert) {
  var document = new Document();
  var div = document.createElement("div");
  var script = document.createElement("script");

  try {
    div.innerHTML = "<span>foo</span>";
    assert.ok(0, "should not make it here b/c no parser is shipped");
  } catch (ex) {
    assert.ok(1, "tried to parse content");
  }

  var jsCode = "var foo = '<span>bar</span>';";
  try {
    script.innerHTML = jsCode;
    assert.equal(script.firstChild, script.lastChild, "script has one child");
    assert.equal(script.firstChild.nodeType, 3, "only child is a text node");
    assert.equal(script.firstChild.nodeValue, jsCode, "code matches");
  } catch (ex) {
    assert.ok(0, "should not cause an error")
  }
});

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1734834066
QUnit.test("removeChild should return the removed node", function(assert) {
	var document = new Document();

	var parent = document.createElement('div');

	var child = document.createElement('p');

	parent.appendChild(child);

	var removedNode = parent.removeChild(child);

	assert.strictEqual(removedNode, child, "removeChild should return the removed node");
});

QUnit.test("Input's type property is two-way bound to the attribute", function(assert){
	var document = new Document();
	var input = document.createElement("input");
	input.setAttribute("type", "text");

	assert.equal(input.type, "text");

	input.type = "radio";
	assert.equal(input.type, "radio");
	assert.equal(input.getAttribute("type"), "radio");
});

QUnit.test("Input's value property is two-way bound to the attribute", function(assert){
	var document = new Document();
	var input = document.createElement("input");
	input.setAttribute("value", "foo");

	assert.equal(input.value, "foo");

	input.value = "bar";
	assert.equal(input.value, "bar");
	assert.equal(input.getAttribute("value"), "bar");
});

QUnit.test("Input's checked value is two-way bound", function(assert){
	var document = new Document();
	var input = document.createElement("input");

	input.setAttribute("checked", "");
	assert.ok(input.checked);

	input.checked = false;
	assert.equal(input.hasAttribute("checked"), false);
	assert.equal(input.checked, false);
});

QUnit.test("Select's value attribute is two-way bound", function(assert){
	var document = new Document();
	var select = document.createElement("select");

	select.setAttribute("value", "foo");

	assert.equal(select.value, "foo");

	select.value = "bar";
	assert.equal(select.value, "bar");
	assert.equal(select.getAttribute("value"), "bar");
});

QUnit.test("Option's value attribute is two-way bound", function(assert){
	var document = new Document();
	var option = document.createElement("option");

	option.setAttribute("value", "foo");

	assert.equal(option.value, "foo");

	option.value = "bar";
	assert.equal(option.value, "bar");
	assert.equal(option.getAttribute("value"), "bar");
});

QUnit.test("Option's selected value is tied to parent select's value", function(assert){
	var document = new Document();
	var select = document.createElement("select");
	var option = document.createElement("option");
	select.appendChild(option);

	select.value = "foo";
	option.value = "foo";

	assert.equal(option.selected, true);

	option.value = "bar";
	assert.equal(option.selected, false);

	option.selected = true;
	assert.equal(select.value, "bar");
});

QUnit.test("option's selected property is configurable and enumerable", function(assert){
    var document = new Document();
    var option = document.createElement("option");
    var proto = Object.getPrototypeOf(option);
    var desc = Object.getOwnPropertyDescriptor(proto, "selected");
    assert.equal(desc.enumerable, true, "selected is enumerable");
    assert.equal(desc.configurable, true, "selected is configurable");
});

QUnit.test("The className property is configurable and enumerable", function(assert){
    var document = new Document();
    var option = document.createElement("some-el");
    var proto = Object.getPrototypeOf(option);
    var desc = Object.getOwnPropertyDescriptor(proto, "className");
    assert.equal(desc.enumerable, true, "selected is enumerable");
    assert.equal(desc.configurable, true, "selected is configurable");
});

QUnit.test("The innerHTML property is configurable and enumerable", function(assert){
    var document = new Document();
    var option = document.createElement("some-el");
    var proto = Object.getPrototypeOf(option);
    var desc = Object.getOwnPropertyDescriptor(proto, "innerHTML");
    assert.equal(desc.enumerable, true, "selected is enumerable");
    assert.equal(desc.configurable, true, "selected is configurable");
});

QUnit.test("Elements created in one document but inserted into another have their ownerDocument updated", function(assert){
	var doc1 = new Document();
	var doc2 = new Document();

	var div = doc1.createElement("div");
	var span = doc1.createElement("span");
	div.appendChild(span);
	doc2.body.appendChild(div);

	assert.equal(div.ownerDocument, doc2, "The ownerDocument was updated");
	assert.equal(span.ownerDocument, doc2, "ownerDocument on a child was updated too");
});

QUnit.test("Elements created in one document but inserted into another have their ownerDocument updated (documentElement)", function(assert){
	var doc1 = new Document();
	var doc2 = new Document();

	var html = doc1.createElement("html");
	doc2.replaceChild(html, doc2.documentElement);

	assert.equal(html.ownerDocument, doc2, "The ownerDocument was updated");
});

QUnit.test("Elements created in one document but inserted into another have their ownerDocument updated (DocumentFragment)", function(assert){
	var doc1 = new Document();
	var doc2 = new Document();

	var div = doc1.createElement("div");
	var span = doc1.createElement("span");
	div.appendChild(span);
	var frag = doc1.createDocumentFragment();
	frag.appendChild(div);
	doc2.body.appendChild(frag);

	assert.equal(div.ownerDocument, doc2, "The ownerDocument was updated");
	assert.equal(span.ownerDocument, doc2, "ownerDocument on a child was updated too");
});

QUnit.test("Setting an element's textContent inserts TextNode", function(assert){
	var document = new Document();
	var el = document.createElement("div");
	el.textContent = "foo";

	var tn = el.childNodes.item(0);
	assert.equal(tn.nodeType, 3, "It is a TextNode");
	assert.equal(tn.nodeValue, "foo", "With the text");
	assert.equal(el.textContent, "foo", "Getter works");
});

QUnit.test("Setting textContent when there is already a child", function(assert){
	var document = new Document();
	var el = document.createElement("div");

	// Add a child
	el.appendChild(document.createElement("span"));

	assert.equal(el.childNodes.item(0).nodeName, "SPAN", "starts as a span");

	el.textContent = "hello world";

	var tn = el.childNodes.item(0);
	assert.equal(tn.nodeType, 3, "It is a TextNode");
	assert.equal(tn.nodeValue, "hello world", "With the text");
	assert.equal(el.textContent, "hello world", "Getter works");

	assert.equal(el.childNodes.item(1), null, "span is gone");
});

QUnit.test("compareDocumentPosition", function(assert){
	var document = new Document();
	var parent = document.createElement("div");
	var child = document.createElement("span");

	parent.appendChild(child);
	
	assert.equal( parent.compareDocumentPosition(child), 20, "contains");
});
