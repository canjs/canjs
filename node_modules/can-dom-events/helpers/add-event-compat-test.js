var unit = require('steal-qunit');
var addEvent = require('./add-event-compat');
var domEvents = require('../can-dom-events');

var oldDomEventsMock = function (addSpy, removeSpy) {
	return {
		addEventListener: function () {
			addSpy(this, arguments);
			this.addEventListener.apply(this, arguments);
		},
		removeEventListener: function () {
			removeSpy(this, arguments);
			this.removeEventListener.apply(this, arguments);
		},
		dispatch: function () {}
	};
};

unit.module('add-event-compat');

var mockEvent = function (addSpy, removeSpy) {
	return {
		defaultEventType: 'boi',
		addEventListener: function (target, eventName, handler) {
			addSpy(this, arguments);
			this.addEventListener(target, 'boi2', handler);
		},
		removeEventListener: function (target, eventName, handler) {
			removeSpy(this, arguments);
			this.removeEventListener(target, 'boi2', handler);
		}
	};
};

unit.test('should work with the can-dom-events', function (assert) {
	assert.expect(1 + (2 * 4));

	var input = document.createElement('input');
	var handler = function () {
		assert.ok(true, 'handler should be called');
	};

	var customEventType = 'boi3';
	var hookSpy = function (context, args) {
		assert.equal(context, domEvents, 'real domEvents should be context');
		var target = args[0];
		var eventType = args[1];
		var callback = args[2];
		assert.equal(target, input, 'input should be the target');
		assert.equal(eventType, customEventType, 'event type should match custom event type');
		assert.equal(callback, handler, 'callback should be the passed handler');
	};

	var event = mockEvent(hookSpy, hookSpy);
	var removeEvent = addEvent(domEvents, event, customEventType);

	domEvents.addEventListener(input, customEventType, handler);
	domEvents.dispatch(input, 'boi2');
	domEvents.removeEventListener(input, customEventType, handler);

	removeEvent();
});

unit.test('should work with the can-dom-events (no custom event type)', function (assert) {
	assert.expect(1 + (2 * 4));

	var input = document.createElement('input');
	var handler = function () {
		assert.ok(true, 'handler should be called');
	};

	var customEventType = 'boi';
	var hookSpy = function (context, args) {
		assert.equal(context, domEvents, 'real domEvents should be context');
		var target = args[0];
		var eventType = args[1];
		var callback = args[2];
		assert.equal(target, input, 'input should be the target');
		assert.equal(eventType, customEventType, 'event type should match custom event type');
		assert.equal(callback, handler, 'callback should be the passed handler');
	};

	var event = mockEvent(hookSpy, hookSpy);
	var removeEvent = addEvent(domEvents, event);

	domEvents.addEventListener(input, customEventType, handler);
	domEvents.dispatch(input, 'boi2');
	domEvents.removeEventListener(input, customEventType, handler);

	removeEvent();
});

unit.test('should work with the can-util/dom/events', function (assert) {
	assert.expect(1 + (2 * (2 + 3)));

	var input = document.createElement('input');
	var handler = function () {
		assert.ok(true, 'handler should be called');
	};

	var customEventType = 'boi3';
	var eventsSpy = function (context, args) {
		var target = context;
		var eventType = args[0];
		var callback = args[1];
		// NOTE: boi3 calls boi2 so they both are run through here
		if (eventType === customEventType) {
			assert.equal(target, input, 'input should be the target');
			assert.equal(callback, handler, 'callback should be the passed handler');
		}
	};
	var oldEvents = oldDomEventsMock(eventsSpy, eventsSpy);

	var hookSpy = function (context, args) {
		var target = args[0];
		var eventType = args[1];
		var callback = args[2];
		assert.equal(target, input, 'input should be the target');
		assert.equal(eventType, customEventType, 'event type should match custom event type');
		assert.equal(callback, handler, 'callback should be the passed handler');
	};

	var event = mockEvent(hookSpy, hookSpy);
	var removeEvent = addEvent(oldEvents, event, customEventType);

	oldEvents.addEventListener.call(input, customEventType, handler);
	domEvents.dispatch(input, 'boi2');
	oldEvents.removeEventListener.call(input, customEventType, handler);

	removeEvent();
});

unit.test('should work with the can-util/dom/events (no custom event type)', function (assert) {
	assert.expect(1 + (2 * (2 + 3)));

	var input = document.createElement('input');
	var handler = function () {
		assert.ok(true, 'handler should be called');
	};

	var customEventType = 'boi';
	var eventsSpy = function (context, args) {
		var target = context;
		var eventType = args[0];
		var callback = args[1];
		// NOTE: boi3 calls boi2 so they both are run through here
		if (eventType === customEventType) {
			assert.equal(target, input, 'input should be the target');
			assert.equal(callback, handler, 'callback should be the passed handler');
		}
	};
	var oldEvents = oldDomEventsMock(eventsSpy, eventsSpy);

	var hookSpy = function (context, args) {
		var target = args[0];
		var eventType = args[1];
		var callback = args[2];
		assert.equal(target, input, 'input should be the target');
		assert.equal(eventType, customEventType, 'event type should match custom event type');
		assert.equal(callback, handler, 'callback should be the passed handler');
	};

	var event = mockEvent(hookSpy, hookSpy);
	var removeEvent = addEvent(oldEvents, event);

	oldEvents.addEventListener.call(input, customEventType, handler);
	domEvents.dispatch(input, 'boi2');
	oldEvents.removeEventListener.call(input, customEventType, handler);

	removeEvent();
});

unit.test('should not override can-util/dom/events twice for the same eventType', function (assert) {
	var done = assert.async();
	var input = document.createElement('input');
	var event = {
		addEventListener: function (target, eventType, handler) {
			target.addEventListener(eventType, handler);
		},
		removeEventListener: function (target, eventType, handler) {
			target.removeEventListener(eventType, handler);
		}
	};

	var eventsSpy = function () {};
	var oldEvents = oldDomEventsMock(eventsSpy, eventsSpy);

	var removeEvent1 = addEvent(oldEvents, event, 'foo');
	var removeEvent2 = addEvent(oldEvents, event, 'foo');
	var handler = function () {
		removeEvent1();
		removeEvent2();
		assert.ok(true, 'This handler should only be called once');
		done();
	};

	oldEvents.addEventListener.call(input, 'foo', handler);
	domEvents.dispatch(input, 'foo');
	oldEvents.removeEventListener.call(input, 'foo', handler);
});
