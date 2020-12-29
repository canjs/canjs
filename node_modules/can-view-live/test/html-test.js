var live = require('can-view-live');
var DefineList = require("can-define/list/list");
var Observation = require("can-observation");
var QUnit = require('steal-qunit');
var SimpleObservable = require("can-simple-observable");
var testHelpers = require('can-test-helpers');
var domMutate = require('can-dom-mutate');
var canReflectDeps = require('can-reflect-dependencies');
var canSymbol = require('can-symbol');
var fragment = require("can-fragment");
var queues = require("can-queues");
var domMutateNode = require("can-dom-mutate/node/node");
var canGlobals = require("can-globals");

QUnit.module("can-view-live.html");

var	afterMutation = function(cb) {
		var doc = canGlobals.getKeyValue("document");
		var div = doc.createElement("div");
		var insertionDisposal = domMutate.onNodeInsertion(div, function(){
			insertionDisposal();
			doc.body.removeChild(div);
			setTimeout(cb, 5);
		});
		setTimeout(function(){
			domMutateNode.appendChild.call(doc.body, div);
		}, 10);
	};

QUnit.test('basics', function(assert) {
	var div = document.createElement('div'),
		span = document.createElement('span');

	div.appendChild(span);
	var items = new DefineList([
		'one',
		'two'
	]);

	var html = new Observation(function itemsHTML() {
		var html = '';
		items.forEach(function (item) {
			html += '<label>' + item + '</label>';
		});
		return html;
	});
	live.html(span, html);
	assert.equal(div.getElementsByTagName('label').length, 2);
	items.push('three');
	assert.equal(div.getElementsByTagName('label').length, 3);
});

QUnit.test('html live binding handles getting a function from a compute', function(assert) {
	assert.expect(5);
	var handler = function(el){
		assert.ok(true, "called handler");
		assert.equal(el.nodeType, Node.COMMENT_NODE, "got a placeholder");
	};

	var div = document.createElement('div'),
		placeholder = document.createTextNode('');
	div.appendChild(placeholder);

	var count = new SimpleObservable(0);
	var html = new Observation(function(){
		if(count.get() === 0) {
			return "<h1>Hello World</h1>";
		} else {
			return handler;
		}
	});

	live.html(placeholder, html);

	assert.equal(div.getElementsByTagName("h1").length, 1, "got h1");
	count.set(1);
	assert.equal(div.getElementsByTagName("h1").length, 0, "got h1");
	count.set(0);
	assert.equal(div.getElementsByTagName("h1").length, 1, "got h1");
});


QUnit.test("Works with Observations - .html", function(assert) {
	var div = document.createElement('div'),
		span = document.createElement('span');
	div.appendChild(span);
	var items = new DefineList([
		'one',
		'two'
	]);
	var html = new Observation(function () {
		var html = '';
		items.forEach(function (item) {
			html += '<label>' + item + '</label>';
		});
		return html;
	});
	live.html(span, html, div);
	assert.equal(div.getElementsByTagName('label').length, 2);
	items.push('three');
	assert.equal(div.getElementsByTagName('label').length, 3);
});

QUnit.test("html live binding handles objects with can.viewInsert symbol", function(assert) {
	assert.expect(2);
	var div = document.createElement("div");
	var options = {};
	var placeholder = document.createTextNode("Placeholder text");
	div.appendChild(placeholder);

	var html = new Observation(function() {
		var d = {};
		d[canSymbol.for("can.viewInsert")] = function() {
			assert.equal(arguments[0], options, "options were passed to symbol function");
			return document.createTextNode("Replaced text");
		};
		return d;
	});

	live.html(placeholder, html, options);

	assert.equal(div.textContent, "Replaced text", "symbol function called");
});

testHelpers.dev.devOnlyTest("child elements must disconnect before parents can re-evaluate", function (assert){
	assert.expect(1);
	var observable = new SimpleObservable("value");

	// this observation should run once ...
	var childObservation = new Observation(function child(){
		assert.ok(true, "called child content once");
		observable.get();
		return "CHILD CONTENT";
	});

	// PARENT OBSERVATION ... should be notified and teardown CHILD OBSERVATION
	var parentObservation = new Observation(function parent(){
		var result = observable.get();
		if(result === "value") {
			var childTextNode = document.createTextNode('');
			var childFrag = document.createDocumentFragment();
			childFrag.appendChild(childTextNode);

			// CHILD OBSERVATION
			live.html(childTextNode, childObservation);

			return childFrag;
		} else {
			return "NEW CONTENT";
		}
	});

	var parentTextNode = document.createTextNode('');
	var div = document.createElement('div');
	//document.body.appendChild(div);
	div.appendChild(parentTextNode);

	//window.queues = queues;

	live.html(parentTextNode, parentObservation);
	//queues.log("flush");
	observable.set("VALUE");
});

testHelpers.dev.devOnlyTest('can-reflect-dependencies', function(assert) {

	var done = assert.async();
	assert.expect(3);

	var div = document.createElement('div'),
		span = document.createElement('span');

	div.appendChild(span);
	document.body.appendChild(div);

	var html = new Observation(function simpleHello() {
		return '<p>Hello</p>';
	});
	live.html(span, html);


	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(div.firstChild)
			.whatChangesMe
			.mutate
			.valueDependencies,
		new Set([html]),
		'whatChangesMe(<div>) shows the observation'
	);

	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(html)
			.whatIChange
			.mutate
			.valueDependencies,
		new Set([div.firstChild]),
		'whatIChange(<observation>) shows the div'
	);

	var undo = domMutate.onNodeDisconnected(div, function checkTeardown () {
		undo();
		setTimeout(function(){


			assert.equal(
				typeof canReflectDeps.getDependencyDataOf(div.firstChild),
				'undefined',
				'dependencies should be clear out when elements is removed'
			);

			done();
		},20);
	});
	// TODO: check this again once domMutate is able to work with normal add / remove
	domMutateNode.removeChild.call( div.parentNode, div);
});

QUnit.test(".html works if it is enqueued twice", function(assert) {
	// enqueue in domUI right away and change again in there
	var div = fragment("<div>PLACEHOLDER</div>").firstChild;
	var html = new SimpleObservable(fragment("<p>1</p>"));

	live.html(div.firstChild, html);
	queues.batch.start();

	queues.domQueue.enqueue(function setHTMLTO3(){
		var frag3 = fragment("<p>3</p>");
		frag3.ID = 3;
		html.set(frag3);
	},null,[],{element: div.firstChild});
	var frag2 = fragment("<p>2</p>");
	frag2.ID = 2;

	html.set(frag2);
	queues.batch.stop();
	assert.ok(true, "got here without an error");

	assert.deepEqual(div.querySelector("p").textContent, "3");
});

QUnit.test("tearing down a .html inside another .html works", function(assert) {
	// this test replicates the behavior of
	//
	// {{#if(person)}}
	//   {{person}}
	// {{/if}}
	//
	// where person is a getter like:
	//
	// get person() {
	//   if (this.showPerson) {
	//     return "Matt";
	//   }
	// }
	var showPerson = new SimpleObservable(true);

	var personObservation = new Observation(function() {
		return showPerson.value ? "Matt" : undefined;
	});

	var personFrag = document.createDocumentFragment();
	var personTextNode = document.createTextNode('');
	personFrag.appendChild(personTextNode);

	// {{person}}
	live.html(personTextNode, personObservation, personFrag);

	var ifPersonObservation = new Observation(function() {
		return personObservation.value ? personFrag : undefined;
	});

	var ifPersonFrag = document.createDocumentFragment();
	var ifPersonTextNode = document.createTextNode('');
	ifPersonFrag.appendChild(ifPersonTextNode);

	// {{#if(person)}}
	live.html(ifPersonTextNode, ifPersonObservation, ifPersonFrag);

	// <!-- if(person) --> <!-- person --> "Matt"  <!-- /if(person) --> <!-- /person -->
	assert.deepEqual(ifPersonFrag.childNodes.length, 5, "initial nodes correct");
	assert.deepEqual(ifPersonFrag.childNodes[2].textContent, "Matt", "initial text node correct");

	showPerson.value = false;

	// <!-- if(person) --> "" <!-- /person -->
	assert.deepEqual(ifPersonFrag.childNodes.length, 3, "nodes torn down correctly");
	assert.deepEqual(ifPersonFrag.childNodes[1].textContent, "", "placeholder text node correct");
});

QUnit.test('Live binding is restored when the placeholder is reconnected', function(assert) {
	var done = assert.async();

	var div = document.createElement('div'),
		span = document.createElement('span');
	document.getElementById("qunit-fixture").appendChild(div);

	div.appendChild(span);
	var items = new DefineList([
		'one',
		'two'
	]);

	var html = new Observation(function itemsHTML() {
		var html = '';
		items.forEach(function (item) {
			html += '<label>' + item + '</label>';
		});
		return html;
	});
	live.html(span, html);
	assert.equal(div.getElementsByTagName('label').length, 2);
	var commentChildren = [].slice.call(div.childNodes, 0).filter(function(node) {
		return node.nodeType === Node.COMMENT_NODE;
	});
	div.removeChild(commentChildren[0]);
	div.removeChild(commentChildren[1]);

	afterMutation(function() {
		items.push('three');

		div.insertBefore(commentChildren[0], div.firstChild);
		div.appendChild(commentChildren[1]);

		afterMutation(function() {
			console.log(	document.getElementById("qunit-fixture").innerHTML);
			assert.equal(div.getElementsByTagName('label').length, 3);
			done();
		});
	});
});
