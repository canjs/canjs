steal('can/util/mvc.js')
.then('funcunit/qunit', 
	  'can/util/fixture')
.then(function() {
	var oldmodule = window.module,
		library = 'jQuery';
	// Set the test timeout to five minutes
	QUnit.config.hidepassed = true;
	QUnit.config.testTimeout = 300000;

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
