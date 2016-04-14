require('can');
require('steal-qunit');

QUnit.module('can/util/inserted');

test('jquery', function () {
	var el = $('<div>');
	el.bind('inserted', function () {
		ok(true, 'inserted called');
	});
	$('#qunit-fixture').append(el);
});
