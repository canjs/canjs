var unit = require('steal-qunit');
var removeEvent = require("./add-global");
var domEvents = require('can-dom-events');

unit.module("can-event-dom-enter/add-global/add-global");

// Duplicated code from can-event-dom-enter-test
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

unit.test("enter event part of the global registry", function (assert) {
    assert.expect(1);
    var input = document.createElement("input");
    domEvents.addEventListener(input, "enter", function() {
        assert.ok(true, "enter key detected");
    });
    pressEnter(input);
});
