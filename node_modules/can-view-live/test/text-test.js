var live = require('can-view-live');
var Observation = require("can-observation");
var QUnit = require('steal-qunit');
var SimpleObservable = require("can-simple-observable");
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var testHelpers = require('can-test-helpers');
var canReflectDeps = require('can-reflect-dependencies');
var canGlobals = require('can-globals');
var canReflect = require("can-reflect");

QUnit.module("can-view-live.text", {
	beforeEach: function() {
		this.fixture = document.getElementById('qunit-fixture');
	}
});

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

var esc = function(str) {
	return str.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
};

QUnit.test('text', function(assert) {
	var div = document.createElement('div'),
		span = document.createElement('span');
	div.appendChild(span);
	var value = new SimpleObservable(['one', 'two']);

	var text = new Observation(function html() {
		var html = '';
		value.get().forEach(function(item) {
			html += '<label>' + item + '</label>';
		});
		return html;
	});
	live.text(span, text);
	assert.equal(div.innerHTML, esc('<label>one</label><label>two</label>'));
	value.set(['one', 'two', 'three']);
	assert.equal(div.innerHTML, esc('<label>one</label><label>two</label><label>three</label>'));
});

QUnit.test('text binding is memory safe (#666)', function(assert) {

	var div = document.createElement('div'),
		span = document.createElement('span'),
		text = new Observation(function() {
			return 'foo';
		});
	div.appendChild(span);

	domMutateNode.appendChild.call(this.fixture, div);

	live.text(span, text);
	domMutateNode.removeChild.call(this.fixture, div);
	var done = assert.async();
	setTimeout(function() {
		assert.notOk(canReflect.isBound(text), "not bound");
		done();
	}, 100);
});

testHelpers.dev.devOnlyTest('can-reflect-dependencies', function(assert) {
	var done = assert.async();
	assert.expect(3);

	var div = document.createElement('div');
	var placeholder = document.createTextNode("");

	div.appendChild(placeholder);
	document.body.appendChild(div);

	var value = new SimpleObservable(['one', 'two']);
	var text = new Observation(function html() {
		return value.get()
			.map(function(item) {
				return '<label>' + item + '</label>';
			})
			.join('');
	});

	live.text(placeholder, text);

	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(placeholder)
			.whatChangesMe
			.mutate
			.valueDependencies,
		new Set([text]),
		'whatChangesMe(<div>) shows the observation'
	);

	assert.deepEqual(
		canReflectDeps
			.getDependencyDataOf(text)
			.whatIChange
			.mutate
			.valueDependencies,
		new Set([placeholder]),
		'whatChangesMe(observation) shows the PlaceHolder node'
	);

	var undo = domMutate.onNodeDisconnected(div, function checkTeardown () {
		undo();
		setTimeout(function(){
			assert.equal(
				typeof canReflectDeps.getDependencyDataOf(placeholder),
				'undefined',
				'dependencies should be clear out when elements is removed'
			);

			done();
		},10);

	});
	domMutateNode.removeChild.call(div.parentNode, div);
});

QUnit.test('Live binding is restored when the text node is reconnected', function(assert) {
	var done = assert.async();

	var div = document.createElement('div'),
		textNode = document.createTextNode('');
	this.fixture.appendChild(div);
	div.appendChild(textNode);
	var value = new SimpleObservable('one');
	live.text(textNode, value);
	assert.equal(div.innerHTML, 'one');
	// case 1:  don't run teardown due to synchronous reconnection
	div.appendChild(textNode);

	afterMutation(function() {
		value.set('two');

		assert.equal(div.innerHTML, 'two');

		// case 2:  teardown, then set up again after mutations.
		div.removeChild(textNode);

		afterMutation(function() {
			// live binding is off while the node is disconnected.
			value.set('three');
			assert.equal(textNode.nodeValue, 'two');
			div.appendChild(textNode);

			afterMutation(function() {
				// value is recomputed on reconnection.
				assert.equal(div.innerHTML, 'three');

				// live binding continues after reconnected.
				value.set('four');
				assert.equal(div.innerHTML, 'four');

				done();
			});
		});
	});
});

QUnit.test("Removing the documentElement tears down correctly", function(assert) {
	var done = assert.async();
	assert.expect(1);

	var realDoc = canGlobals.getKeyValue('document');
	var doc = document.implementation.createHTMLDocument("testing");
	canGlobals.setKeyValue('document', doc);
	var tn = doc.createTextNode("foo");

	domMutate.onNodeDisconnected(doc.body, function() {
		canGlobals.setKeyValue('document', realDoc);
		assert.ok(true, 'Removal fired');
		done();
	});

	var text = new Observation(function() { return "foo"; });

	domMutateNode.appendChild.call(doc.body, tn);
	live.text(tn, text);
	domMutateNode.removeChild.call(doc, doc.documentElement);
});
