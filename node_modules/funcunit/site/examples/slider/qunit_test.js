module('slider', {
	setup: function() {
		$('#qunit-test-area').html($('<div>'));
		$('#qunit-test-area div').slider();
	}
});

test('drag slider', function() {
	F('#qunit-test-area a').drag('+200 +0', function() {
		var value = $('#qunit-test-area div').slider('option', 'value');
		ok(value > 0, 'value after 200px should not be 0');
	});
});