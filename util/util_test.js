var can = require('can/util/util');
require('steal-qunit');

require('can/util/inserted/inserted_test');

QUnit.module("can/util/util");

// Problem inspired by attempting to bind a compoments templated event listeners to:
// https://github.com/vote539/socketio-file-upload/blob/master/client.js
QUnit.test("bindable objects with addEventListener, with own trigger mechanism", function() {
	var handlers = {};
	var x = {
		addEventListener: function(ev, cb, bubble) {
			handlers[ev] = cb;
		},
		__trigger: function(ev) {
			var event = document.createEvent("Event");
			event.initEvent(ev, false, false);
			handlers[ev](event);
		}
	};

	QUnit.stop();
	can.bind.call(x, "hello", function() {
		QUnit.ok(true);
		QUnit.start();
	});
	x.__trigger.call(x, "hello");
});
