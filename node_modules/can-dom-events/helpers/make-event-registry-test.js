var unit = require('steal-qunit');
var makeEventRegistry = require('./make-event-registry');

unit.module('make-event-registry');

unit.test('add should register the event with the given eventType', function (assert) {
	var eventType = 'boi';
	var registry = makeEventRegistry();
	var exampleEvent = {
		defaultEventType: 'cake',
		addEventListener: function () {},
		removeEventListener: function () {}
	};

	registry.add(exampleEvent, eventType);
	assert.equal(registry.has(eventType), true, 'event should be registered at "' + eventType + '"');
});

unit.test('add should use the event\'s defaultEventType unless eventType is provided', function (assert) {
	var eventType = 'boi';
	var registry = makeEventRegistry();
	var exampleEvent = {
		defaultEventType: eventType,
		addEventListener: function () {},
		removeEventListener: function () {}
	};

	registry.add(exampleEvent);
	assert.equal(registry.has(eventType), true, 'event should be registered at "' + eventType + '"');
});

unit.test('has should return whether an event is registered', function (assert) {
	var eventType = 'boi';
	var exampleEvent = {
		defaultEventType: eventType,
		addEventListener: function () {},
		removeEventListener: function () {}
	};

	var registry = makeEventRegistry();

	assert.equal(registry.has(eventType), false, 'initial registry should not have the event');
    
	var remove = registry.add(exampleEvent);
	assert.equal(registry.has(eventType), true, 'updated registry should have the event');

	remove();
	assert.equal(registry.has(eventType), false, 'empty registry should not have the event');
});

unit.test('get should return the register event', function (assert) {
	var eventType = 'boi';
	var exampleEvent = {
		defaultEventType: eventType,
		addEventListener: function () {},
		removeEventListener: function () {}
	};

	var registry = makeEventRegistry();

	assert.equal(registry.get(eventType), undefined, 'initial registry should not have the event');
    
	var remove = registry.add(exampleEvent);
	assert.equal(registry.get(eventType), exampleEvent, 'updated registry should have the event');

	remove();
	assert.equal(registry.get(eventType), undefined, 'empty registry should not have the event');
});
