var unit = require('steal-qunit');
var domMutate = require('../can-dom-mutate');
var getDocument = require('can-globals/document/document');
var node = require('./node');
var testUtils = require('../test/test-utils');
var makeSimpleDocument = require("can-vdom/make-document/make-document");
var isConnected = require("../-is-connected");

var test = unit.test;
var moduleWithMutationObserver = testUtils.moduleWithMutationObserver;
var moduleWithoutMutationObserver = testUtils.moduleWithoutMutationObserver;
var moduleMutationObserver = testUtils.moduleMutationObserver;
var mock = testUtils.mock;

function neverCall(assert, obj, methodName) {
	return mock(obj, methodName, function () {
		assert.ok(false, methodName + ' should not be called');
	});
}

unit.module("can-dom-mutate/node document selector");
test("isConnected() uses isConnected where available", function(assert) {
	assert.expect(4);
	var doc = getDocument();
	var fakenode = {
		get isConnected() {
			assert.strictEqual(doc.constructor, getDocument().constructor, "with real document")
			return true;
		},
		get ownerDocument() {
			if ('isConnected' in doc) {
				assert.notStrictEqual(doc.constructor, getDocument().constructor, "with SimpleDocument")
			} else {
				// IE 11 doesn't support isConnected, so both isConnected() calls will go through here
				assert.ok(true, "Native Node.prototype does not support isConnected");
			}
			return null;
		}
	};

	assert.ok(isConnected.isConnected(fakenode), "Real document connected");
	getDocument(makeSimpleDocument());
	assert.ok(isConnected.isConnected(fakenode), "SimpleDocument connected");
	getDocument(doc);
});


function onNodeRemovedTest(){
	test('removeChild dispatches onNodeRemoved', function (assert) {
		var done = assert.async();
		var parent = testUtils.getFixture();
		var child = document.createElement('div');
		parent.appendChild(child);

		var undo = domMutate.onNodeRemoved(child, function() {
			assert.ok(true, 'this was called');
			undo();
			done();
		});

		node.removeChild.call(parent, child);
	});
}
moduleMutationObserver('can-dom-mutate/node with real document', getDocument(), onNodeRemovedTest);
moduleMutationObserver('can-dom-mutate/node with SimpleDocument', makeSimpleDocument(), onNodeRemovedTest);

moduleWithMutationObserver('can-dom-mutate/node', function () {
	QUnit.test('appendChild should not call domMutate.dispatchNodeInsertion', function (assert) {
		var parent = testUtils.getFixture();
		var child = document.createElement('div');
		var undo = neverCall(assert, domMutate, 'dispatchNodeInsertion');

		node.appendChild.call(parent, child);
		undo();

		assert.ok(parent.contains(child), 'child should be in parent');
	});

	QUnit.test('insertBefore should not call domMutate.dispatchNodeInsertion', function (assert) {
		var parent = testUtils.getFixture();
		var sibling = document.createElement('span');
		var child = document.createElement('div');
		var undo = neverCall(assert, domMutate, 'dispatchNodeInsertion');

		parent.appendChild(sibling);
		node.insertBefore.call(parent, child, sibling);
		undo();

		assert.ok(parent.contains(child), 'child should be in parent');
	});

	QUnit.test('removeChild should not call domMutate.dispatchNodeRemoval', function (assert) {
		var parent = testUtils.getFixture();
		var child = document.createElement('div');
		var undo = neverCall(assert, domMutate, 'dispatchNodeRemoval');

		parent.appendChild(child);
		node.removeChild.call(parent, child);
		undo();

		assert.ok(!parent.contains(child), 'child should not be in parent');
	});

	QUnit.test('replaceChild should not call domMutate.dispatchNodeRemoval+Insertion', function (assert) {
		var parent = testUtils.getFixture();
		var sibling = document.createElement('span');
		var child = document.createElement('div');
		var undoRemoval = neverCall(assert, domMutate, 'dispatchNodeRemoval');
		var undoInsertion = neverCall(assert, domMutate, 'dispatchNodeInsertion');

		parent.appendChild(sibling);
		node.replaceChild.call(parent, child, sibling);
		undoRemoval();
		undoInsertion();

		assert.ok(!parent.contains(sibling), 'sibling should not be in parent');
		assert.ok(parent.contains(child), 'child should be in parent');
	});

	QUnit.test('setAttribute should not call domMutate.dispatchNodeAttributeChange', function (assert) {
		var parent = testUtils.getFixture();
		var element = document.createElement('div');
		var undo = neverCall(assert, domMutate, 'dispatchNodeAttributeChange');
		parent.appendChild(element);

		node.setAttribute.call(element, 'data-foo', 'bar');
		undo();

		assert.equal(element.getAttribute('data-foo'), 'bar', 'Attribute should be set');
	});

	QUnit.test('setAttributeNS should not call domMutate.dispatchNodeAttributeChange', function (assert) {
		var svgNamespaceURI =  "http://www.w3.org/2000/svg";
		var xlinkHrefAttrNamespaceURI =  "http://www.w3.org/1999/xlink";
		var xlinkHrefAttr = "xlink:href";
		var origValue = "node/icons.svg#circle";
		var newValue = "node/icons.svg#triangle";

		var parent = testUtils.getFixture();

		var svg = document.createElementNS(svgNamespaceURI, "svg");
		var svgUse = document.createElementNS(svgNamespaceURI, "use");
		svgUse.setAttributeNS(xlinkHrefAttrNamespaceURI, xlinkHrefAttr, origValue);
		svg.appendChild(svgUse);

		var undo = neverCall(assert, domMutate, 'dispatchNodeAttributeChange');
		parent.appendChild(svg);

		node.setAttributeNS.call(svgUse, xlinkHrefAttrNamespaceURI, xlinkHrefAttr, newValue);
		undo();

		assert.equal(svgUse.getAttribute(xlinkHrefAttr), newValue, 'Attribute should be set');
	});

	QUnit.test('removeAttribute should not call domMutate.dispatchNodeAttributeChange', function (assert) {
		var parent = testUtils.getFixture();
		var element = document.createElement('div');
		var undo = neverCall(assert, domMutate, 'dispatchNodeAttributeChange');
		parent.appendChild(element);

		node.removeAttribute.call(element, 'data-foo');
		node.setAttribute.call(element, 'data-foo', 'bar');
		node.removeAttribute.call(element, 'data-foo');
		undo();

		assert.equal(element.getAttribute('data-foo'), null, 'Attribute should not be set');
	});
});

function withoutMutationObserverTests () {
	QUnit.test('appendChild should call domMutate.dispatchNodeInsertion', function (assert) {
		var doc = getDocument();
		var done = assert.async();
		var parent = testUtils.getFixture();
		var child = doc.createElement('div');

		var undo = mock(domMutate, 'dispatchNodeInsertion', function (node, parentNode) {
			assert.equal(node, child, 'Should pass the child being appended');
			assert.equal(parentNode , parent, 'Should pass the parent');
			assert.ok(parent.contains(node), 'Node should be in parent before dispatch is called');
			undo();
			done();
		});

		node.appendChild.call(parent, child);
	});

	function getFragmentInsertionTest () {
		var doc = getDocument();
		var fragment = doc.createDocumentFragment();
		var child1 = doc.createElement('div');
		var child2 = doc.createElement('div');
		var grandchild = doc.createElement('div');
		fragment.appendChild(child1);
		fragment.appendChild(child2);
		child2.appendChild(grandchild);

		return {
			fragment: fragment,
			check: function (assert) {
				var nodes = [child1, child2];
				var dispatches = 0;
				var undoInsertion = mock(domMutate, 'dispatchNodeInsertion', function (node) {
					dispatches++;
					assert.ok(nodes.indexOf(node) !== -1, 'child node added');
					if (dispatches >= nodes.length) {
						undoInsertion();
					}
				});
			}
		};
	}

	QUnit.test('appendChild should dispatch fragment children to dispatchNodeInserted', function (assert) {
		assert.expect(2);
		var parent = testUtils.getFixture();
		var fragTest = getFragmentInsertionTest();
		fragTest.check(assert);
		node.appendChild.call(parent, fragTest.fragment);
	});

	QUnit.test('insertBefore should call domMutate.dispatchNodeInsertion', function (assert) {
		var done = assert.async();
		var doc = getDocument();
		var parent = testUtils.getFixture();
		var sibling = doc.createElement('span');
		var child = doc.createElement('div');

		var undo = mock(domMutate, 'dispatchNodeInsertion', function (node, parentNode) {
			assert.equal(node, child, 'Should pass the child being appended');
			assert.equal(parentNode, parent, 'Should pass the parent node');
			assert.ok(parent.contains(node), 'Node should be in parent before dispatch is called');
			undo();
			done();
		});

		parent.appendChild(sibling);
		node.insertBefore.call(parent, child, sibling);
	});

	QUnit.test('insertBefore should dispatch fragment children to dispatchNodeInserted', function (assert) {
		assert.expect(2);
		var doc = getDocument();
		var parent = testUtils.getFixture();
		var sibling = doc.createElement('div');
		parent.appendChild(sibling);

		var fragTest = getFragmentInsertionTest();
		fragTest.check(assert);
		node.insertBefore.call(parent, fragTest.fragment, sibling);
	});

	QUnit.test('removeChild should call domMutate.dispatchNodeRemoval', function (assert) {
		var done = assert.async();
		var doc = getDocument();
		var parent = testUtils.getFixture();
		var child = doc.createElement('div');

		var undo = mock(domMutate, 'dispatchNodeRemoval', function (node, parentNode) {
			assert.equal(node, child, 'Should pass the child being removed');
			assert.equal(parent, parentNode, 'Should pass the parent node');
			assert.ok(!parent.contains(node), 'Node should be removed before dispatch is called');
			undo();
			done();
		});

		parent.appendChild(child);
		node.removeChild.call(parent, child);
	});

	QUnit.test('replaceChild should call domMutate.dispatchNodeRemoval+Insertion', function (assert) {
		var done = assert.async();
		var doc = getDocument();
		var parent = testUtils.getFixture();
		var sibling = doc.createElement('span');
		var child = doc.createElement('div');
		var isSiblingRemoved = false;

		var undoRemoval = mock(domMutate, 'dispatchNodeRemoval', function (node, parentNode) {
			assert.equal(node, sibling, 'Should pass the sibling being removed');
			assert.equal(parent, parentNode, 'Should pass the parent');
			assert.ok(!parent.contains(node), 'Node should be removed before dispatch is called');
			undoRemoval();
			isSiblingRemoved = true;
		});

		var undoInsertion = mock(domMutate, 'dispatchNodeInsertion', function (node, parentNode) {
			assert.ok(isSiblingRemoved, 'Sibling should be removed before the child is inserted (as far as dispatch order is concerned)');
			assert.equal(node, child, 'Should pass the child being inserted');
			assert.equal(parentNode, parent, 'Should not pass a callback');
			assert.ok(parent.contains(node), 'Node should be inserted before dispatch is called');
			undoInsertion();
			done();
		});

		parent.appendChild(sibling);
		node.replaceChild.call(parent, child, sibling);
	});

	QUnit.test('replaceChild should dispatch fragment children to dispatchNodeInserted', function (assert) {
		assert.expect(3);
		var doc = getDocument();
		var parent = testUtils.getFixture();
		var sibling = doc.createElement('div');
		parent.appendChild(sibling);

		var fragTest = getFragmentInsertionTest();
		fragTest.check(assert);

		var undoRemoval = mock(domMutate, 'dispatchNodeRemoval', function (node) {
			assert.equal(node, sibling, 'sibling should be removed');
			undoRemoval();
		});

		node.replaceChild.call(parent, fragTest.fragment, sibling);
	});

	QUnit.test('setAttribute should call domMutate.dispatchNodeAttributeChange', function (assert) {
		var done = assert.async();
		var doc = getDocument();
		var element = doc.createElement('div');
		element.setAttribute('data-foo', 'bar');

		var undo = mock(domMutate, 'dispatchNodeAttributeChange', function (node, attributeName, oldAttributeValue, callback) {
			assert.equal(node, element, 'Should pass the element whose attribute is changing');
			assert.equal(attributeName, 'data-foo', 'Should pass the changed attribute name');
			assert.equal(oldAttributeValue, 'bar', 'Should pass the old attribute value');
			assert.equal(callback, undefined, 'Should not pass a callback');
			assert.equal(element.getAttribute('data-foo'), 'baz', 'Node should have the new attribute value');
			undo();
			done();
		});

		node.setAttribute.call(element, 'data-foo', 'baz');
	});

	QUnit.test('setAttributeNS should call domMutate.dispatchNodeAttributeChange', function (assert) {
		var done = assert.async();

		var svgNamespaceURI =  "http://www.w3.org/2000/svg";
		var xlinkHrefAttrNamespaceURI =  "http://www.w3.org/1999/xlink";
		var xlinkHrefAttr = "xlink:href";
		var origValue = "node/icons.svg#circle";
		var newValue = "node/icons.svg#triangle";

		var doc = getDocument();

		var svg = document.createElementNS(svgNamespaceURI, "svg");
		var svgUse = document.createElementNS(svgNamespaceURI, "use");
		svgUse.setAttributeNS(xlinkHrefAttrNamespaceURI, xlinkHrefAttr, origValue);
		svg.appendChild(svgUse);

		var undo = mock(domMutate, 'dispatchNodeAttributeChange', function (node, attributeName, oldAttributeValue, callback) {
			assert.equal(node, svgUse, 'Should pass the element whose attribute is changing');
			assert.equal(attributeName, xlinkHrefAttr, 'Should pass the changed attribute name');
			assert.equal(oldAttributeValue, origValue, 'Should pass the old attribute value');
			assert.equal(callback, undefined, 'Should not pass a callback');
			assert.equal(svgUse.getAttribute(xlinkHrefAttr), newValue, 'Node should have the new attribute value');
			undo();
			done();
		});

		node.setAttributeNS.call(svgUse, xlinkHrefAttrNamespaceURI, xlinkHrefAttr, newValue);
	});

	QUnit.test('removeAttribute should call domMutate.dispatchNodeAttributeChange', function (assert) {
		var done = assert.async();
		var doc = getDocument();
		var element = doc.createElement('div');
		element.setAttribute('data-foo', 'bar');

		var undo = mock(domMutate, 'dispatchNodeAttributeChange', function (node, attributeName, oldAttributeValue, callback) {
			assert.equal(node, element, 'Should pass the element whose attribute is changing');
			assert.equal(attributeName, 'data-foo', 'Should pass the changed attribute name');
			assert.equal(oldAttributeValue, 'bar', 'Should pass the old attribute value');
			assert.equal(callback, undefined, 'Should not pass a callback');
			assert.equal(element.getAttribute('data-foo'), null, 'Node attribute value should have been removed');
			undo();
			done();
		});

		node.removeAttribute.call(element, 'data-foo');
	});

	QUnit.test("connected should be called if element is inserted to a disconnected element and then the parent is inserted )#64", function(assert){
		var done = assert.async();
		var fixture = testUtils.getFixture();
		var parent = document.createElement('div');
		var child = document.createElement('div');




		var undo = domMutate.onNodeConnected(child, function() {
			assert.ok(true, 'this was called');
			undo();
			done();
		});


		node.appendChild.call(parent, child);
		node.appendChild.call(fixture, parent);
	});
};
moduleWithoutMutationObserver('can-dom-mutate/node with real document', getDocument(), withoutMutationObserverTests);
moduleWithoutMutationObserver('can-dom-mutate/node with SimpleDocument', makeSimpleDocument(), withoutMutationObserverTests);


function notInDocumentTests() {
	/*
		We do not want insertion events to dispatched when a node
		is inserted into a parent which is not in the document.
		For example, inserting a node into a document fragment
		should not trigger an insertion event.

		The same applied to removal events. Removal events should
		only fire when the node is removed from the document.

		Attribute changes can fire at any time as that is observed
		at the node level, not the document.
	*/

	QUnit.skip('appendChild should not call dispatchNodeInsertion', function (assert) {
		assert.expect(1);
		var doc = getDocument();
		var fragment = doc.createDocumentFragment();
		var child = doc.createElement('div');
		var undo = mock(domMutate, 'dispatchNodeInsertion', function (el, callback, dispatchConnected) {
			assert.equal(dispatchConnected, false, 'We should not dispatch connected things');
		});

		node.appendChild.call(fragment, child);
		undo();
	});

	QUnit.skip('insertBefore should not call dispatchNodeInsertion', function (assert) {
		assert.expect(1);
		var doc = getDocument();
		var fragment = doc.createDocumentFragment();
		var child = doc.createElement('div');
		var reference = doc.createElement('span');
		fragment.appendChild(reference);

		var undo = mock(domMutate, 'dispatchNodeInsertion', function (el, callback, dispatchConnected) {
			assert.equal(dispatchConnected, false, 'We should not dispatch connected things');
		});

		node.insertBefore.call(fragment, child, reference);
		undo();
	});

	QUnit.skip('removeChild should not call dispatchNodeRemoval', function (assert) {
		assert.expect(1);
		var doc = getDocument();
		var fragment = doc.createDocumentFragment();
		var child = doc.createElement('div');
		fragment.appendChild(child);

		var undo = mock(domMutate, 'dispatchNodeRemoval', function (el, callback, dispatchConnected) {
			assert.equal(dispatchConnected, false, 'We should not dispatch connected things');
		});

		node.removeChild.call(fragment, child);
		undo();
	});

	QUnit.skip('replaceChild should not call dispatchNodeRemoval+Insertion', function (assert) {
		assert.expect(2);
		var doc = getDocument();
		var fragment = doc.createDocumentFragment();
		var child = doc.createElement('div');
		var oldChild = doc.createElement('span');
		fragment.appendChild(oldChild);

		var undoRemoval = mock(domMutate, 'dispatchNodeRemoval', function (el, callback, dispatchConnected) {
			assert.equal(dispatchConnected, false, 'We should not dispatch connected things');
		});
		var undoInsertion = mock(domMutate, 'dispatchNodeInsertion', function (el, callback, dispatchConnected) {
			assert.equal(dispatchConnected, false, 'We should not dispatch connected things');
		});

		node.replaceChild.call(fragment, child, oldChild);
		undoRemoval();
		undoInsertion();
	});

	QUnit.test('removeChild on the documentElement', function(assert) {
		var done = assert.async();
		var doc = getDocument();
		var doc1 = doc.implementation.createHTMLDocument('doc1');
		getDocument(doc1);

		var undo = domMutate.onNodeDisconnected(doc1.documentElement, function() {
			assert.ok(true, 'this was called');
			getDocument(doc);
			undo();
			done();
		});


		node.removeChild.call(doc1, doc1.documentElement);

	});
}
moduleWithoutMutationObserver('can-dom-mutate/node (not in real document)', getDocument(), notInDocumentTests);
moduleWithoutMutationObserver('can-dom-mutate/node (not in SimpleDocument)', makeSimpleDocument(), notInDocumentTests);
