var QUnit = require("steal-qunit");
var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
var globals = require("can-globals");
var domMutate = require("can-dom-mutate");
var domMutateNode = require("can-dom-mutate/node");
var canSymbol = require("can-symbol");

var stacheTestHelpers = require("../test/helpers")(document);

require("./-portal");

QUnit.module("can-stache #portal helper");

QUnit.test("basics", function(assert) {
	var el = document.createElement("div");
	var template = stache("{{#portal(root)}}hello {{name}}{{/portal}}");
	var vm = new DefineMap({name: "Matthew", root: el});

	template(vm);

	var cleaned = stacheTestHelpers.cloneAndClean(el);

	assert.equal(cleaned.firstChild.nextSibling.nodeValue, "Matthew");

	vm.name ="Wilbur";
	assert.equal(stacheTestHelpers.cloneAndClean(el).firstChild.nextSibling.nodeValue, "Wilbur");
});

QUnit.test("element is observable", function(assert) {
	var el = document.createElement("div");
	var template = stache("{{#portal(root)}}{{name}}{{/}}");
	var vm = new DefineMap({name: "Matthew", root: null});

	template(vm);

	vm.root = el;
	assert.equal(stacheTestHelpers.cloneAndClean(el).firstChild.nodeValue, "Matthew");
});

QUnit.test("element changes", function(assert) {
	var one = document.createElement("div");
	var two = document.createElement("div");

	var template = stache("{{#portal(root)}}{{name}}{{/}}");
	var vm = new DefineMap({name: "Matthew", root: one});

	template(vm);
	assert.equal(stacheTestHelpers.cloneAndClean(one).firstChild.nodeValue, "Matthew");

	vm.root = two;
	assert.equal(stacheTestHelpers.cloneAndClean(two).firstChild.nodeValue, "Matthew");
	assert.equal(one.firstChild, null, "One had its children removed");
});

QUnit.test("tears down when the element is removed", function(assert) {
	var doc = document.implementation.createHTMLDocument("test");
	globals.setKeyValue("document", doc);

	var el = doc.createElement("div");
	domMutateNode.appendChild.call(doc.body, el);

	var template = stache("{{#portal(root)}}{{name}}{{/}}");
	var vm = new DefineMap({name: "Matthew", root: el});

	template(vm);
	assert.equal(stacheTestHelpers.cloneAndClean(el).firstChild.nodeValue, "Matthew");
	var done = assert.async();
	domMutate.onNodeRemoved(el, function() {
		// parent nodes removed is always called first ... this fixes it
		setTimeout(function(){
			assert.equal( vm[canSymbol.for("can.meta")].handlers.get(["name"]).length, 0, "no handlers");
			done();
		},1);

	});


	domMutateNode.removeChild.call(doc.body, el);
});

QUnit.test("conditionally rendering a portal", function(assert) {
	var one = document.createElement("div");
	var two = document.createElement("span");

	var template = stache("{{#eq(page, 'one')}}{{#portal(this.one)}}{{name}}{{/portal}}{{/eq}}" +
		"{{#eq(page, 'two')}}{{#portal(this.two)}}{{name}}{{/portal}}{{/eq}}");

	var vm = new DefineMap({page: "one", name: "Matthew", one: one, two: two});

	template(vm);
	assert.equal(stacheTestHelpers.cloneAndClean(one).firstChild.nodeValue, "Matthew");
	assert.equal(stacheTestHelpers.cloneAndClean(two).firstChild, null, "nothing rendered to two");

	vm.page = "two";
	assert.equal(stacheTestHelpers.cloneAndClean(one).firstChild, null, "nothing rendered to one");
	assert.equal(stacheTestHelpers.cloneAndClean(two).firstChild.nodeValue, "Matthew");
});

QUnit.test("Doesn't mess with existing DOM", function(assert) {
	var el = document.createElement("div");
	el.appendChild(document.createTextNode("Hello"));
	var template = stache("{{#portal(root)}}{{name}}{{/portal}}");
	var vm = new DefineMap({name: "Matthew", root: el});

	template(vm);
	assert.equal(stacheTestHelpers.cloneAndClean(el).firstChild.nodeValue, "Hello", "existing content left alone");
	assert.equal(stacheTestHelpers.cloneAndClean(el).firstChild.nextSibling.nodeValue, "Matthew");
});

QUnit.test("Adds the done.keepNode symbol to nodes", function(assert) {
	var el = document.createElement("div");
	var template = stache("{{#portal(root)}}<span>one</span><div>two</div>{{/portal}}");
	var vm = new DefineMap({ root: el });
	template(vm);

	var child = el.firstChild;
	do {
		assert.ok(child[canSymbol.for("done.keepNode")], "symbol added to this node");
		child = child.nextSibling;
	} while(child);
});

QUnit.test("Doesn't do anything if there isn't a place to put the content", function(assert) {
	var view = stache("{{#portal(root)}}<span>two</span>{{/portal}}");
	var vm = new DefineMap({ root: null });
	var frag = view(vm);

	assert.equal(frag.firstChild.nodeType, 8, "Only rendered the comment node");
});

QUnit.test("Dynamic content outside portal", function(assert) {
	var view = stache("{{#portal(root)}}<span>two</span>{{/portal}}<div>{{#if(showThing)}}<span>one</span>{{/if}}</div>");
	var vm = new DefineMap({ showThing: false, root: null });
	var frag = view(vm);

	var div = frag.querySelector("div");

	assert.equal(div.firstChild.firstChild, null, "nothing rendered in the div yet");

	// Flip the conditional
	vm.showThing = true;

	assert.equal(stacheTestHelpers.cloneAndClean(div).firstChild.firstChild.nodeValue, "one", "shows the template content");

	// Set the element
	vm.root = div;
	assert.equal(stacheTestHelpers.cloneAndClean(div).firstChild.nextSibling.firstChild.nodeValue, "two", "shows the portaled content");
});

QUnit.test("Works when DOM nodes are removed outside of stache", function(assert) {
	var view = stache("{{#if(show)}}{{#portal(root)}} <span>tests</span> {{/portal}}{{/if}}");
	var root = document.createElement("div");
	var vm = new DefineMap({ root: root, show: true });
	view(vm);

	var badScript = function() {
		domMutateNode.removeChild.call(root, root.firstChild);
	};

	badScript();

	try {
		vm.show = false;
		assert.ok(true, "Did not throw");
	} catch(e) {
		assert.ok(false, e);
	}

});
