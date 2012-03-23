steal('can/util/mvc.js')
.then('funcunit/qunit', 
	  'can/test/fixture.js')
.then(function() {
	// Set the test timeout to five minutes
	QUnit.config.testTimeout = 300000;
	var oldmodule = module,
		library = 'jQuery';
	if (window.STEALDOJO){
		library = 'Dojo';
	} else if( window.STEALMOO) {
		library = 'Mootools';
	} else if(window.STEALYUI){
		library = 'YUI';
	} else if(window.STEALZEPTO){
		library = 'Zepto';
	}
	window.module = function(name, testEnvironment) {
		oldmodule(library + '/' + name, testEnvironment);
	}
})
.then('./mvc_test.js',
	  'can/construct/construct_test.js',
	  'can/observe/observe_test.js',
	  'can/view/view_test.js',
	  'can/control/control_test.js',
	  'can/model/model_test.js',
	  'can/view/ejs/ejs_test.js')
