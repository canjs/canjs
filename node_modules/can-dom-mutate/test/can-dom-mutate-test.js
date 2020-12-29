var unit = require('steal-qunit');
var domMutate = require('../can-dom-mutate');
var DOCUMENT = require('can-globals/document/document');
var node = require('../node');
var testUtils = require('./test-utils');
var globals = require('can-globals');
var MUTATION_OBSERVER = require('can-globals/mutation-observer/mutation-observer');
var makeSimpleDocument = require("can-vdom/make-document/make-document");

var test = unit.test;
var moduleMutationObserver = testUtils.moduleMutationObserver;

function mutationObserverTests() {
	test('onNodeConnected should be called when that node is inserted', function (assert) {
		var done = assert.async();
		var doc = globals.getKeyValue('document');
		var parent = testUtils.getFixture();
		var child = doc.createElement('div');

		var undo = domMutate.onNodeConnected(child, function (mutation) {
			var node = mutation.target;
			assert.equal(node, child, 'Node should be the inserted child');

			undo();
			done();
		});

		node.appendChild.call(parent, child);
	});


	test('onNodeDisconnected should be called when that node is removed', function (assert) {
		var done = assert.async();
		var doc = globals.getKeyValue('document');
		var parent = testUtils.getFixture();
		var child = doc.createElement('div');

		var undo = domMutate.onNodeDisconnected(child, function (mutation) {
			var node = mutation.target;
			assert.equal(node, child, 'Node should be the removed child');

			undo();
			done();
		});

		parent.appendChild(child);
		node.removeChild.call(parent, child);
	});

	test('onNodeAttributeChange should be called when that node\'s attributes change', function (assert) {
		var done = assert.async();
		var doc = globals.getKeyValue('document');
		var child = doc.createElement('div');
		var attributeName = 'foo';
		child.setAttribute(attributeName, 'bar');

		var undo = domMutate.onNodeAttributeChange(child, function (mutation) {
			assert.equal(mutation.target, child, 'Node should be the removed child');
			assert.equal(mutation.attributeName, attributeName);
			assert.equal(mutation.oldValue, 'bar');

			undo();
			done();
		});

		node.setAttribute.call(child, attributeName, 'baz');
	});

	test('onConnected should be called when any node is inserted', function (assert) {
		var done = assert.async();
		var parent = testUtils.getFixture();
		var doc = globals.getKeyValue('document');
		var child = doc.createElement('div');

		var undo = domMutate.onConnected(doc.documentElement, function (mutation) {
			if(mutation.target === child) {
				assert.ok(true, 'Node should be the inserted child');

				undo();
				done();
			}
		});

		node.appendChild.call(parent, child);
	});

	test('onInserted should be called with inserted fragment subtree', function (assert) {
		assert.expect(3);
		var done = assert.async();
		var parent = testUtils.getFixture();
		var doc = globals.getKeyValue('document');
		var fragment = doc.createDocumentFragment();
		var child1 = doc.createElement('div');
		child1.id = 'child1';
		var child2 = doc.createElement('div');
		child2.id = 'child2';
		var grandchild = doc.createElement('div');
		grandchild.id = 'grandchild';
		fragment.appendChild(child1);
		fragment.appendChild(child2);
		child2.appendChild(grandchild);

		var dispatchCount = 0;
		var nodes = [child1, child2, grandchild];
		var undo = domMutate.onConnected(doc.documentElement, function (mutation) {
			var target = mutation.target;
			if (nodes.indexOf(target) !== -1) {
				dispatchCount++;
				if (target === child1) {
					assert.ok(true, 'child1 dispatched');
				}
				if (target === child2) {
					assert.ok(true, 'child2 dispatched');
				}
				if (target === grandchild) {
					assert.ok(true, 'grandchild dispatched');
				}
				if (dispatchCount >= nodes.length) {
					undo();
					done();
				}
			}
		});

		node.appendChild.call(parent, fragment);
	});

	test('onDisconnected should be called when any node is removed', function (assert) {
		var done = assert.async();
		var doc = globals.getKeyValue('document');
		var parent = testUtils.getFixture();
		var child = doc.createElement('div');

		var undo = domMutate.onDisconnected(doc.documentElement, function (mutation) {
			if(mutation.target === child) {
				assert.ok(true, 'Node should be the removed child');

				undo();
				done();
			}
		});

		parent.appendChild(child);
		node.removeChild.call(parent, child);
	});

	test('onNodeConnected should be called when that node is inserted into a different document', function(assert){
		var done = assert.async();
		var doc = globals.getKeyValue('document');
		var parent = testUtils.getFixture();

		var doc1 = doc.implementation.createHTMLDocument('doc1');
		var child = doc1.createElement('div');

		var undo = domMutate.onNodeConnected(child, function (mutation) {
			var node = mutation.target;
			assert.equal(node, child, 'Node should be the inserted child');

			undo();
			done();
		});

		node.appendChild.call(parent, child);
	});

	test('onNodeDisconnected does not leak when given a document fragment', function(assert){
		var doc = globals.getKeyValue('document');
		var doc1 = doc.implementation.createHTMLDocument('doc1');
		var frag = doc1.createDocumentFragment();
		frag.appendChild(doc1.createElement('div'));

		// Figure out how many things are listening for MO changes.
		var getListenerCount = function() { return globals.eventHandlers.MutationObserver.length; };
		var previousListenerCount = getListenerCount();

		DOCUMENT(doc1);
		domMutate.onNodeDisconnected(frag, function() {});
		DOCUMENT(doc);

		assert.equal(getListenerCount(), previousListenerCount, "No new listeners added for this fragment");
	});

	test('onNodeConnected should be called when textNode is inserted within a parent', function (assert) {
		var done = assert.async();
		var doc = globals.getKeyValue('document');
		var parent = testUtils.getFixture();
		var child = doc.createTextNode("Hello World");
		var wrapper = doc.createElement("div");
		wrapper.appendChild(child);

		var undo = domMutate.onNodeConnected(child, function (mutation) {
			var node = mutation.target;
			assert.equal(node, child, 'Node should be the inserted child');

			undo();
			done();
		});

		node.appendChild.call(parent, wrapper);
	});


	test('flushRecords works', function(assert){
		var done = assert.async();
		var doc = globals.getKeyValue('document');
		var parent = testUtils.getFixture();
		var wrapper = doc.createElement("div");
		var called = false;
		var teardown = domMutate.onNodeConnected(wrapper, function () {
			teardown();
			called = true;
		});


		node.appendChild.call(parent, wrapper);
		domMutate.flushRecords();
		assert.ok(called, "insertion run immediately");
		setTimeout(done, 1);
	});

	test('onDisconnected after onConnected', function(assert){
		var done = assert.async();
		var doc = globals.getKeyValue('document');
		var parent = testUtils.getFixture();
		var wrapper = doc.createElement("div");
		var called = false;

		var disconnectTeardown = domMutate.onNodeDisconnected(wrapper, function(){
			assert.ok(called, "connected called before disconnected");
			done();
			disconnectTeardown();
		});
		var connectedTeardown = domMutate.onNodeConnected(wrapper, function () {
			called = true;
			assert.ok(true, "connected called");
			connectedTeardown();
		});

		node.appendChild.call(parent, wrapper); // problem here is that it's removed
		node.removeChild.call(parent, wrapper);
	});

	test('no double connected', function(assert){
		assert.expect(1);
		var done = assert.async();

		var doc = globals.getKeyValue('document');


		var outer = doc.createElement("div");
		var inner = doc.createElement("div");

		var connectedTeardown = domMutate.onNodeConnected(inner, function () {
			assert.ok(true, "connected called");

			setTimeout(function(){
				connectedTeardown();
				done();
			},1);

		});

		var parent = testUtils.getFixture();


		node.appendChild.call(parent, outer);
		node.appendChild.call(outer, inner);
	});

	test("flushRecords while processing records issues changes in order", function(assert){
		var done = assert.async();
		var doc = globals.getKeyValue('document');

		var parent = testUtils.getFixture();

		var firstDiv = doc.createElement("div"),
			secondDiv = doc.createElement("div"),
			thirdDiv = doc.createElement("div");

		var order = [];

		var firstConnectedTeardown = domMutate.onNodeConnected(firstDiv, function () {
			order.push("first");
			node.appendChild.call(parent, thirdDiv);
			domMutate.flushRecords();
			firstConnectedTeardown();
		});

		var secondConnectedTeardown = domMutate.onNodeConnected(secondDiv, function () {
			order.push("second");
			secondConnectedTeardown();
		});

		var thirdConnectedTeardown = domMutate.onNodeConnected(thirdDiv, function () {
			order.push("third");
			assert.deepEqual(order, ["first","second","third"]);
			order.push("third");
			thirdConnectedTeardown();
			done();
		});

		node.appendChild.call(parent, firstDiv);
		node.appendChild.call(parent, secondDiv);
	});

	test("Works with no document", function(assert) {
		var lastDoc = globals.getKeyValue("document");
		try {
			globals.setKeyValue("document", null);
			assert.ok(true, "Able to set the document to null like happens in SSR");
		} catch(e) {
			assert.ok(false, e.message);
		} finally {
			globals.setKeyValue("document", lastDoc);
		}
	});
}

moduleMutationObserver('can-dom-mutate with real document', DOCUMENT(), mutationObserverTests);
testUtils.moduleWithMutationObserver('can-dom-mutate with real document', function() {
	test('changing the MutationObserver tears down the mutation observer', function (assert) {
		assert.expect(2);
		var doc = globals.getKeyValue('document');
		var done = assert.async();
		var parent = testUtils.getFixture();
		var wrapper = doc.createElement("div");

		var undoA = domMutate.onNodeConnected(wrapper, function () {
			assert.ok(true, "this will still be called b/c it's on the document");
			undoA();
		});
		MUTATION_OBSERVER(MUTATION_OBSERVER());
		var undoB = domMutate.onNodeConnected(wrapper, function (mutation) {
			var node = mutation.target;
			assert.equal(node, wrapper, 'Node should be the inserted child');

			undoB();
			done();
		});

		node.appendChild.call(parent, wrapper);
	});
});
moduleMutationObserver('can-dom-mutate with SimpleDocument', makeSimpleDocument(), mutationObserverTests);
