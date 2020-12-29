'use strict';

var QUnit = require('steal-qunit');
var domEvents = require('can-dom-events');
var definition = require('./can-event-dom-radiochange');
var compat = require('./compat');
var canNamespace = require('can-namespace');

function fixture () {
	return document.getElementById("qunit-fixture");
}

var compatWithNew = {
	name: 'compat with can-dom-events',
	domEvents: domEvents,
	setup: function () {
		this.removeEvent = compat(domEvents);
	},
	teardown: function () {
		this.removeEvent();
	}
};

var rawNewDomEvents = {
	name: 'plain with can-dom-events',
	domEvents: domEvents,
	setup: function () {
		this.removeEvent = domEvents.addEvent(definition);
	},
	teardown: function () {
		this.removeEvent();
	}
};

var suites = [
	compatWithNew,
	rawNewDomEvents
];

function runTests (mod) {
	QUnit.module(mod.name, {
		beforeEach: mod.setup,
		afterEach: mod.teardown
	});

	var domEvents = mod.domEvents;

	QUnit.test("subscription to an untracked radio should call listener", function (assert) {
		assert.expect(1);
		var listener = document.createElement('input');
		listener.id = 'listener';
		listener.type = 'radio';
		listener.name = 'myfield';
		domEvents.addEventListener(listener, 'radiochange', function handler () {
			assert.ok(true, 'called from other element');
			domEvents.removeEventListener(listener, 'radiochange', handler);
		});

		var radio = document.createElement('input');
		radio.id = 'radio';
		radio.type = 'radio';
		radio.name = 'myfield';

		fixture().appendChild(listener);
		fixture().appendChild(radio);

		radio.setAttribute('checked', 'checked');
		domEvents.dispatch(radio, 'change');
	});

	QUnit.test("subscription to a tracked radio should call itself", function (assert) {
		assert.expect(1);
		var radio = document.createElement('input');
		radio.id = 'selfish';
		radio.type = 'radio';
		radio.name = 'anynamejustsothereisaname';
		domEvents.addEventListener(radio, 'radiochange', function handler () {
			assert.ok(true, 'called from self');
			domEvents.removeEventListener(radio, 'radiochange', handler);
		});

		fixture().appendChild(radio);

		radio.setAttribute('checked', 'checked');
		domEvents.dispatch(radio, 'change');
	});
}

suites.forEach(runTests);

QUnit.module("can-event-dom-radiochange plain");

QUnit.test("adds event to can-namespace", function(assert) {
	assert.equal(canNamespace.domEventRadioChange, definition, "event is added");
});
