var $ = require("jquery");
var F = require("funcunit");
var Zone = require("can-zone");
var Mocha = require("steal-mocha");
var assert = require('chai').assert;

F.attach(Mocha);

describe('funcunit', function() {
	beforeEach(function() {
		$('#testarea').append(
			'<a class=\'clickme\' href=\'javascript://\'>clickme</a>' +
			'<div class=\'clickresult\'></div>'
		);

		$('.clickme').click(function() {
			$('.clickresult').text("clicked");
		});
	});

	afterEach(function() {
		$('#testarea').empty();
	});

	it('should pass', function(done) {
		F.wait(1000);
		F('.clickme').click();
		F('.clickresult').text('clicked', 'clicked the link');

		F.add(done);
	});

	it.skip('should fail', function(done) {
		// override funcunit timeout so this test breaks fast.
		F.timeout = 500;

		var myZone = new Zone();

		var promise = myZone.run(function() {
			F('.clickresult').text('clickedz', 'clicked the link');
		});

		promise.then(function() {
			assert(false, '.clickresult text should not be "clickedz"');
		});

		promise.catch(function(error) {
			assert(error, 'F().text should fail');
			done();
		});
	});
});
