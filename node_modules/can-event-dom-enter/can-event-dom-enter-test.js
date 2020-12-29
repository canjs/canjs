'use strict';

var unit = require('steal-qunit');
var domEvents = require('can-dom-events');
var definition = require('./can-event-dom-enter');
var compat = require('./compat');
var canNamespace = require('can-namespace');
var enterEventType = 'test-enter';

function makeEnterEvent() {
	try {
		// IE doesn't support this syntax
		return new window.KeyboardEvent("keyup", {key: "Enter"});
	} catch (e) {
		var event = document.createEvent("KeyboardEvent");
		// See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent
		event.initKeyboardEvent("keyup", true, false, document.parentWindow, "Enter", 16, "", false, "en-US");
		return event;
	}
}

function pressKey (target, keyCode) {
	var keyupEvent = {
		type: 'keyup',
		keyCode: keyCode
	};
	domEvents.dispatch(target, keyupEvent);
}

function pressEnter(target) {
	pressKey(target, 13);
}

var supportsKeyboardEvents = (function () {
	if (typeof KeyboardEvent === 'undefined') {
		return false;
	}
	try {
		var eventType = 'keyup';
		var isSupported = false;
		var target = document.createElement('input');
		var handler = function (event) {
			if (event.key === 'Enter') {
				isSupported = true;
			}
		};
		target.addEventListener(eventType, handler);
		target.dispatch(makeEnterEvent());
		target.removeEventListener(eventType, handler);
		return isSupported;
	} catch (error) {
		return false;
	}
});

var compatWithNew = {
	name: 'compat with can-dom-events',
	domEvents: domEvents,
	beforeEach: function () {
		this.removeEvent = compat(domEvents, enterEventType);
	},
	afterEach: function () {
		this.removeEvent();
	}
};

var rawNewDomEvents = {
	name: 'plain with can-dom-events',
	domEvents: domEvents,
	beforeEach: function () {
		this.removeEvent = domEvents.addEvent(definition, enterEventType);
	},
	afterEach: function () {
		this.removeEvent();
	}
};

var suites = [
	compatWithNew,
	rawNewDomEvents
];

function runTests (mod) {
	unit.module(mod.name, {
		beforeEach: mod.beforeEach,
		afterEach: mod.afterEach
	});

	var domEvents = mod.domEvents;

	unit.test("calls enter event handler when enter key is pressed", function (assert) {
		assert.expect(1);
		var input = document.createElement("input");
		domEvents.addEventListener(input, enterEventType, function() {
			assert.ok(true, "enter key detected");
		});
		pressEnter(input);
	});

	if (supportsKeyboardEvents) {
		unit.test("works for KeyboardEvent's", function(assert) {
			assert.expect(1);
			var input = document.createElement("input");
			domEvents.addEventListener(input, enterEventType, function handler() {
				domEvents.removeEventListener(input, enterEventType, handler);
				assert.ok(true, "enter key detected");
			});
			domEvents.dispatch(input, makeEnterEvent());
		});
	}

	unit.test("does not call enter event handler when a different key is pressed", function(assert) {
		assert.expect(1);
		var input = document.createElement("input");
		domEvents.addEventListener(input, enterEventType, function handler() {
			domEvents.removeEventListener(input, enterEventType, handler);
			assert.ok(true, 'passed');
		});
		pressKey(input, 27); // not enter
		pressEnter(input);
	});

	unit.test("successfully removes enter event handler", function(assert) {
		assert.expect(1);
		var input = document.createElement("input");
		var enterEventHandler = function() {
			assert.ok(true);
		};
		domEvents.addEventListener(input, enterEventType, enterEventHandler);
		pressEnter(input);
		domEvents.removeEventListener(input, enterEventType, enterEventHandler);
		pressEnter(input);
	});

	unit.test("can have multiple enter event handlers and can remove them seperately", function(assert) {
		assert.expect(5);

		var input = document.createElement("input");
		var generateEvtHandler = function() {
			return function() {
				assert.ok(true);
			};
		};
		var firstEvtHandler = generateEvtHandler();
		var secondEvtHandler = generateEvtHandler();
		domEvents.addEventListener(input, enterEventType, firstEvtHandler);
		domEvents.addEventListener(input, enterEventType, secondEvtHandler);

		pressEnter(input); // +2
		pressEnter(input); // +2

		domEvents.removeEventListener(input, enterEventType, firstEvtHandler);
		pressEnter(input); // +1

		domEvents.removeEventListener(input, enterEventType, secondEvtHandler);
		pressEnter(input); // +0
	});

	unit.test("still handles other event types appropriately", function(assert) {
		assert.expect(1);
		var button = document.createElement("button");
		domEvents.addEventListener(button, "focus", function() {
			assert.ok(true, 'handles focus event still');
		});
		domEvents.dispatch(button, 'focus');
	});
}

suites.forEach(runTests);

unit.module("can-event-dom-enter plain");

unit.test("can use custom addEventListener and removeEventListener (#3)", function(assert){
	assert.expect(2);
	var handler = function(){};
	var button = document.createElement("button");
	definition.addEventListener.call({
		addEventListener: function(){
			assert.ok(true, "called custom addEventListener");
		}
	},button,"enter", handler);

	definition.removeEventListener.call({
		removeEventListener: function(){
			assert.ok(true, "called custom removeEventListener");
		}
	},button,"enter", handler);
});

unit.test("adds event to can-namespace", function(assert) {
	assert.equal(canNamespace.domEventEnter, definition, "event is added");
});
