@property {function} steal.done
@parent StealJS.functions

A promise for when the application has loaded. Useful if you want to automatically run some code (like tests) after everything has loaded.

@signature `steal.done()`

@return {Promise} A promise that will resolve when the [config.configMain] and [config.main] have loaded.

@body

## Use

Calling **steal.done** is useful in scenarios where you need to start some process after the dependency graph of your application has been fully imported. For example (used with [@steal]):

    var steal = require("@steal");
	var QUnit = require("qunit");

	steal.done().then(function(){
      QUnit.load();
	});

This will start running QUnit tests after all modules have loaded.
