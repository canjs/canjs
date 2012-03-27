steal('can/util/mvc.js')
.then('funcunit/qunit', 
	  'can/test/fixture.js')
.then(function() {
	// Set the test timeout to five minutes
	QUnit.config.testTimeout = 300000;
})