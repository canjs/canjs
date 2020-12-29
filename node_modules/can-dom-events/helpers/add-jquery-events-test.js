var unit = require('steal-qunit');
var $ = require('jquery');
var addEvents = require('./add-jquery-events');
var domEvents = require('../can-dom-events');

unit.module('add-jquery-events');

unit.test('should work with the jQuery', function (assert) {
	assert.expect(1 + 3);

	var divElement = document.createElement('div');

	var eventType = 'draginit';
	var handler = function (event) {
		assert.equal(event.target, divElement, 'div should be the target');
		assert.equal(event.type, eventType, 'event type should match custom event type');
		assert.equal(event.handleObj.handler, handler, 'callback should be the passed handler');
	};

	// Set up the special event
	$.event.special[eventType] = {
		add: function() {
			assert.ok(true, 'add handler should be called');
		}
	};

	// Bridge can-dom-events + jQuery
	var removeEvents = addEvents($);

	// Listen to and trigger the event; handler should run
	domEvents.addEventListener(divElement, eventType, handler);
	$(divElement).trigger(eventType);

	// Clean up after ourselves :)
	removeEvents();
});
