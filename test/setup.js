steal('can/util/mvc.js')
.then('funcunit/qunit', 
	  'can/util/fixture')
.then(function() {
	var oldmodule = window.module;

	// Set the test timeout to five minutes
	QUnit.config.hidepassed = true;
	QUnit.config.testTimeout = 300000;

	if(window.TESTINGLIBRARY !== undefined) {
		window.module = function(name, testEnvironment) {
			oldmodule(TESTINGLIBRARY + '/' + name, testEnvironment);
		}
	}
})
