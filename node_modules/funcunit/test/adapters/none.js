var $ = require('jquery');
var F = require('funcunit');
var QUnit = require('steal-qunit');

QUnit.module('Adapters', {
	setup: function() {
		$('#qunit-fixture').append(
			'<a class=\'clickme\' href=\'javascript://\'>clickme</a>' +
			'<div class=\'clickresult\'></div>'
		);

		$('.clickme').click(function() {
			$('.clickresult').text("clicked");
		});
	}
});

test('QUnit with no adapter test', function() {
	stop();

	F.wait(1000);
	F('.clickme').click();
	F('.clickresult').text('clicked', function() {
		ok('clicked the text');
		start();
	});
});
