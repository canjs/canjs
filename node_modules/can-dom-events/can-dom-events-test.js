var unit = require('steal-qunit');
var domEvents = require('./can-dom-events');

unit.module('can-dom-events');

unit.test('domEvents.addEventListener works', function (assert) {
	// We check that our handler gets called if we add it through domEvents.
	// NOTE: the event is not triggered via domEvents.dispatch to isolate this test.
	assert.expect(1);

	var input = document.createElement('input');
	var eventType = 'click';
	var event;
	var qf = document.querySelector('#qunit-fixture');
	qf.appendChild(input);

	var handler = function () {
		assert.ok(true, 'event handler should be called');
	};

	domEvents.addEventListener(input, eventType, handler);
	if (typeof Event === "function") {
		event = new Event(eventType);
	} else {
		event = document.createEvent('Event');
		event.initEvent(eventType, true, false);
	}
	input.dispatchEvent(event);
	domEvents.removeEventListener(input, eventType, handler);
});

unit.test('domEvents.removeEventListener works', function (assert) {
	// We check that our handler gets called if we add/remove it through domEvents.
	// NOTE: the event is not triggered via domEvents.dispatch to isolate this test.
	assert.expect(1);

	var input = document.createElement('input');
	var eventType = 'click';
	var event, event2;
	var qf = document.querySelector('#qunit-fixture');
	qf.appendChild(input);
	var handler = function () {
		assert.ok(true, 'event handler should be called');
	};

	domEvents.addEventListener(input, eventType, handler);

	if (typeof Event === "function") {
		event = new Event(eventType);
	} else {
		event = document.createEvent('Event');
		event.initEvent(eventType, true, true);
	}
	input.dispatchEvent(event);

	domEvents.removeEventListener(input, eventType, handler);

	if (typeof Event === "function") {
		event2 = new Event(eventType);
	} else {
		event2 = document.createEvent('Event');
		event2.initEvent(eventType, true, true);
	}
	input.dispatchEvent(event2);
});

unit.test('domEvents.dispatch works', function (assert) {
	// NOTE: dispatching should work no matter how a listener was add.
	// So we use the native addEventListener to isolate the dispatch.
	assert.expect(1);

	var input = document.createElement('input');
	var eventType = 'click';
	var qf = document.querySelector('#qunit-fixture');
	qf.appendChild(input);
	var handler = function () {
		assert.ok(true, 'event handler should be called');
	};

	input.addEventListener(eventType, handler);


	domEvents.dispatch(input, eventType);

	input.removeEventListener(eventType, handler);
});

unit.test('domEvents.addDelegateListener works', function (assert) {
	var done = assert.async();
	var grandparent = document.createElement('div');
	var parent = document.createElement('div');
	var child = document.createElement('input');

	grandparent.appendChild(parent);
	parent.appendChild(child);

	domEvents.addDelegateListener(grandparent, 'click', 'input', function handler (event) {
		domEvents.removeDelegateListener(grandparent, 'click', 'input', handler);

		assert.equal(event.type, 'click', 'should be click event');
		assert.equal(event.target, child, 'should have input as the event.target');

		done();
	});

	domEvents.dispatch(child, 'click');
});

unit.test('domEvents.removeDelegateListener works', function (assert) {
	assert.expect(2);
	var grandparent = document.createElement('div');
	var parent = document.createElement('div');
	var child = document.createElement('input');

	grandparent.appendChild(parent);
	parent.appendChild(child);

	var handler = function handler (event) {
		assert.equal(event.type, 'click', 'should be click event');
		assert.equal(event.target, child, 'should have input as the event.target');
	};

	domEvents.addDelegateListener(grandparent, 'click', 'input', handler);

	domEvents.dispatch(child, 'click');

	domEvents.removeDelegateListener(grandparent, 'click', 'input', handler);

	domEvents.dispatch(child, 'click');
});

unit.test("can call removeDelegateListener without having previously called addDelegateListener", function (assert) {
	var ul = document.createElement("ul");
	domEvents.removeDelegateListener(ul, "click", "li", function(){});
	assert.ok(true, "Calling removeDelegateListener does not throw");
});

unit.test("delegate events: focus should work using capture phase", function (assert) {
	var done = assert.async();
	var parent = document.createElement('div');
	var child = document.createElement('input');

	parent.appendChild(child);
	document.getElementById('qunit-fixture').appendChild(parent);

	domEvents.addDelegateListener(parent, "focus", "input", function handler (event) {
		domEvents.removeDelegateListener.call(parent, "focus", "input", handler);

		assert.equal(event.type, 'focus', 'should be focus event');
		assert.equal(event.target, child, 'should have input as event target');
		done();
	});

	domEvents.dispatch(child, "focus", false);
});

unit.test("delegate events: blur should work using capture phase", function (assert) {
	var done = assert.async();
	var parent = document.createElement('div');
	var child = document.createElement('input');

	parent.appendChild(child);
	document.getElementById('qunit-fixture').appendChild(parent);

	domEvents.addDelegateListener(parent, "blur", "input", function handler (event) {
		domEvents.removeDelegateListener.call(parent, "blur", "input", handler);

		assert.equal(event.type, 'blur', 'should be blur event');
		assert.equal(event.target, child, 'should have input as event target');
		done();
	});

	domEvents.dispatch(child, "blur", false);
});

unit.test('domEvents.addDelegateListener handles document correctly', function (assert) {
	var html = document.querySelector('html');
	var handler = function handler() {};

	domEvents.addDelegateListener(html, 'click', 'input', handler);
	domEvents.dispatch(html, 'click');
	domEvents.removeDelegateListener(html, 'click', 'input', handler);
	assert.ok(true, 'works');
});

unit.test('domEvents.addDelegateListener call inner-most handler first (#62)', function (assert) {
	var done = assert.async();
	var grandparent = document.createElement('div');
	var parent = document.createElement('p');
	var child = document.createElement('input');

	grandparent.appendChild(parent);
	parent.appendChild(child);

	var handlerCallCount = 0;

	var paragraphClickHandler = function paragraphClickHandler() {
		assert.equal(++handlerCallCount, 2, 'outer handler called second');
	};

	var inputClickHandler = function inputClickHandler() {
		assert.equal(++handlerCallCount, 1, 'inner handler called first');
	};

	domEvents.addDelegateListener(grandparent, 'click', 'p', paragraphClickHandler);
	domEvents.addDelegateListener(grandparent, 'click', 'input', inputClickHandler);

	domEvents.dispatch(child, 'click');

	domEvents.removeDelegateListener(grandparent, 'click', 'p', paragraphClickHandler);
	domEvents.removeDelegateListener(grandparent, 'click', 'input', inputClickHandler);

	done();
});

['stopPropagation', 'stopImmediatePropagation'].forEach(function(stopMethod) {
	unit.test('domEvents.addDelegateListener should have a working ev.' + stopMethod + ' (#62)', function (assert) {
		var done = assert.async();
		var grandparent = document.createElement('div');
		var parent = document.createElement('p');
		var child = document.createElement('input');

		grandparent.appendChild(parent);
		parent.appendChild(child);

		var paragraphClickHandler = function paragraphClickHandler() {
			assert.ok(false, stopMethod + ' works');
		};

		var inputClickHandler = function inputClickHandler(event) {
			event[stopMethod]();
			assert.ok(true, 'inner-most click handler called first');
		};

		domEvents.addDelegateListener(grandparent, 'click', 'p', paragraphClickHandler);
		domEvents.addDelegateListener(grandparent, 'click', 'input', inputClickHandler);

		domEvents.dispatch(child, 'click');

		domEvents.removeDelegateListener(grandparent, 'click', 'p', paragraphClickHandler);
		domEvents.removeDelegateListener(grandparent, 'click', 'input', inputClickHandler);

		done();
	});

	unit.test('domEvents.addDelegateListener should call the actual ev.' + stopMethod + ' (#62)', function (assert) {
		var done = assert.async();
		var parent = document.createElement('p');
		var child = document.createElement('input');

		parent.appendChild(child);

		var qf = document.querySelector('#qunit-fixture');
		qf.appendChild(parent);

		var delegatedClickHandler = function delegatedClickHandler(event) {
			event[stopMethod]();
			assert.ok(true, 'inner-most click handler called first');
		};

		var documentClickHandler = function documentClickHandler() {
			assert.ok(false, stopMethod + ' works');
		};

		domEvents.addDelegateListener(parent, 'click', 'input', delegatedClickHandler);
		domEvents.addEventListener(document, 'click', documentClickHandler);

		domEvents.dispatch(child, 'click');

		domEvents.removeDelegateListener(parent, 'click', 'input', delegatedClickHandler);
		domEvents.removeEventListener(document, 'click', documentClickHandler);

		done();
	});
});

require('./helpers/make-event-registry-test');
require('./helpers/add-event-compat-test');
require('./helpers/add-event-jquery-test');
require('./helpers/add-jquery-events-test');
require('./helpers/util-test');
