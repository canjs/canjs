steal('can/util/mvc.js')
.then('funcunit/qunit', 
	  'can/test/fixture.js')
.then(function() {
	// Set the test timeout to five minutes
	QUnit.config.testTimeout = 300000;
})
.then('./mvc_test.js',
	  'can/construct/construct_test.js',
	  'can/observe/observe_test.js',
	  'can/view/view_test.js',
	  'can/control/control_test.js',
	  'can/model/model_test.js',
	  'can/view/ejs/ejs_test.js')
