var unit = require('steal-qunit');
var jQuery = require('jquery');
var addEvent = require('./add-event-jquery');

unit.module('add-event-jquery');

var mockEvent = function (firstEvent, secondEvent, addSpy, removeSpy) {
	return {
		defaultEventName: firstEvent,
		addEventListener: function (target, eventName, handler) {
			addSpy(this, arguments);
			this.addEventListener(target, secondEvent, handler);
		},
		removeEventListener: function (target, eventName, handler) {
			removeSpy(this, arguments);
			this.removeEventListener(target, secondEvent, handler);
		}
	};
};

unit.test('should work with the jQuery', function (assert) {
	assert.expect(1 + (2 * 3));

	var input = document.createElement('input');
	var handler = function () {
		assert.ok(true, 'handler should be called');
	};

	var customEventType = 'boi3';
	var lowerEventType = 'boi2';
	var hookSpy = function (context, args) {
		var target = args[0];
		var eventType = args[1];
		var callback = args[2];
		assert.equal(target, input, 'input should be the target');
		assert.equal(eventType, customEventType, 'event type should match custom event type');
		assert.equal(callback, handler, 'callback should be the passed handler');
	};

	var event = mockEvent(customEventType, lowerEventType, hookSpy, hookSpy);
	var removeEvent = addEvent(jQuery, event, customEventType);

	$(input).on(customEventType, handler);
	$(input).trigger(lowerEventType);
	$(input).on(customEventType, handler);

	removeEvent();
});
