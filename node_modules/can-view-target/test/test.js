/* jshint indent:false */
var target = require('can-view-target');
var simpleDom = require('can-simple-dom');
var QUnit = require('steal-qunit');
var MUTATION_OBSERVER = require('can-globals/mutation-observer/mutation-observer');

QUnit.module("can-view-target");

QUnit.test("basics", function(assert) {

	// "<h1 class='foo {{#selected}}selected{{/selected}}' ><span>Hello {{message}}!</span></h1>"
	var classCallback = function( ){
		assert.equal(this.nodeName.toLowerCase(), "h1", "class on the right element");
		this.className = "selected";
	},
		attributesCallback = function(){
			assert.equal(this.nodeName.toLowerCase(), "h1", "attributes on the right element");
		},
		textNodeCallback = function( ){
			assert.equal(this.nodeType, 3, "got a text node");
			this.nodeValue = "World";
		};



	var data = target([{
		tag: "h1",
		attrs: {
			"id" : "myh1",
			"class" : classCallback
		},
		attributes: [attributesCallback],
		children: [{
			tag: "span",
			children: [
				"Hello ",
				textNodeCallback,
				"!"
			]
		}]
	}]);

	assert.equal( data.clone.childNodes.length, 1, "there is one child");

	var h1 = data.clone.childNodes[0];
	assert.equal( h1.nodeName.toLowerCase(), "h1", "there is one h1");
	assert.equal( h1.id, "myh1", "the h1 has the right id");

	assert.equal( h1.childNodes.length, 1, "the h1 has span");

	assert.equal( h1.childNodes[0].childNodes.length, 3, "the span has 3 children");

	assert.deepEqual( data.paths,
		[{
			path: [0],
			callbacks: [
				{ callback: classCallback },
				{ callback: attributesCallback }
			],
			paths: [{
				path: [0,1],
				callbacks: [
					{callback: target.keepsTextNodes ? textNodeCallback : data.paths[0].paths[0].callbacks[0].callback }
				]
			}]
		}] );

	var result = data.hydrate();

	var newH1 = result.childNodes[0];
	assert.equal(newH1.className, "selected", "got selected class name");
	assert.equal(newH1.innerHTML.toLowerCase(), "<span>hello world!</span>");

});


QUnit.test("replacing items", function(assert) {
	var data = target([
		function(){
			this.parentNode.insertBefore(document.createTextNode("inserted"), this.nextSibling);
		},
		"hi",
		function(){
			assert.equal(this.previousSibling.nodeValue, "hi", "previous is as expected");
		}]);

	data.hydrate();
});

QUnit.test("comments", function(assert) {
	function foo(el) { el.nodeValue = "val"; }
	var data = target([
		{ tag: "h1" },
		{comment: "foo bar"},
		{comment: "bax", callbacks: [foo]}
	]);
	var node = data.clone.childNodes[1];
	assert.equal(node.nodeValue, "foo bar", "node value is right");
	assert.equal(node.nodeType, 8, "node is a comment");
	assert.deepEqual(data.paths[0].path, [2], "node path is right");
	assert.deepEqual(data.paths[0].callbacks, [{callback: foo}], "node callback is right");
});


QUnit.test("paths should be run in reverse order (#966)", function(assert) {

	var data = target([{
		tag: "h1",
		attributes: [function(){}],
		children:  [
			function(){
				this.parentNode.insertBefore(document.createElement("div"), this.nextSibling);
			},
			{
				tag: "span",
				children: [function(){
					assert.equal(this.nodeType,3, "got an element");
				}]
			}
		]
	}]);
	data.hydrate();
});

QUnit.test("renderToVirtualDOM", function(assert) {

	var simpleDocument = new simpleDom.Document();

	// <h1>{{#if foo}}<span></span>{{/if}}foo</h1>
	var innerData = target([
		{
			tag: "span"
		}
	], simpleDocument);


	var outerData = target([
		{
			tag: "h1",
			children: [
				function(data){
					this.parentNode.insertBefore(innerData.hydrate(data), this);
					this.parentNode.removeChild(this);
				},
				"foo"
			]
		}
	], simpleDocument);

	var out = outerData.hydrate({foo: true});

	assert.equal(out.firstChild.nodeName, "H1");

	assert.equal(out.firstChild.firstChild.nodeName, "SPAN");
	assert.equal(out.firstChild.lastChild.nodeValue, "foo");

});

QUnit.test('cloneNode works in IE11', function(assert) {
	var frag = document.createDocumentFragment();
	var text = document.createTextNode('some-text');
	var MO = MUTATION_OBSERVER();
	var observer;

	frag.appendChild(text);

	var clone = target.cloneNode(frag);

	assert.equal(clone.childNodes.length, 1, 'cloneNode should work');

	if (MO) {
		observer = new MO(function(mutations) {});
		observer.observe(document.documentElement, { childList: true, subtree: true });

		clone = target.cloneNode(frag);

		assert.equal(clone.childNodes.length, 1, 'cloneNode should work after creating MutationObserver');
	}
});

QUnit.test('cloneNode keeps non-default element namespace', function(assert) {
	var frag = document.createDocumentFragment();
	var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	frag.appendChild(svg);

	var clone = target.cloneNode(frag);

	assert.equal(clone.firstChild.namespaceURI, 'http://www.w3.org/2000/svg', 'cloneNode should keep non-default element namespace');
});

QUnit.test("SVG namespaceURI", function(assert) {
	var data = target([{
		tag: "svg",
		attrs: {
			"xmlns" : {
				value: "http://www.w3.org/2000/svg", 
				namespaceURI: "http://www.w3.org/2000/xmlns/"
			}
		}
	}]);
	var frag = data.hydrate();
	assert.equal(frag.firstChild.getAttributeNode("xmlns").namespaceURI, 'http://www.w3.org/2000/xmlns/');
})
