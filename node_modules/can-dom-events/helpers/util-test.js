var unit = require('steal-qunit');
var util = require('./util');

unit.module('util');

unit.test('util.isDomEventTarget works', function (assert) {
	// Our definition of what can be addEventListener-ed to
	// is more strict than EventTarget.
	// It must be a DOM Node, Document, or window.
	var element = document.createElement('div');
	assert.equal(util.isDomEventTarget(element), true, 'Elements work');

	assert.equal(util.isDomEventTarget(document), true, 'Documents work');

	assert.equal(util.isDomEventTarget(window), true, 'Window works');

	assert.equal(util.isDomEventTarget(8), false, 'Numbers should not work');
	assert.equal(util.isDomEventTarget("foo"), false, 'Strings should not work');
	assert.equal(util.isDomEventTarget({a: 1}), false, 'Plain objects should not work');

	var textNode = document.createTextNode('boi');
	assert.equal(util.isDomEventTarget(textNode), false, 'Text nodes should not work');
});

unit.test('util.createEvent should merge the eventData object properties', function (assert) {
	var target = document.createElement('input');
	var enterCode = 13;
	var event = util.createEvent(target, {keyCode: enterCode});
	assert.equal(event.keyCode, enterCode);
});

unit.test('util.createEvent should use eventData.type as the eventType', function (assert) {
	var target = document.createElement('input');
	var eventType = 'foo';
	var event = util.createEvent(target, {type: eventType});
	assert.equal(event.type, eventType);
});
