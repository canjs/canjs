var jasmineAdapter = require("funcunit/browser/adapters/jasmine");
var jasmine2Adapter = require("funcunit/browser/adapters/jasmine2");
var qunitAdapter = require("funcunit/browser/adapters/qunit");
var qunit2Adapter = require("funcunit/browser/adapters/qunit2");
var mochaAdapter = require("funcunit/browser/adapters/mocha");
var FuncUnit = require("funcunit/browser/core");

var noop = function(){};
var defaultAdapter = {
	pauseTest: noop,
	resumeTest: noop,
	assertOK: noop,
	equiv: function(expected, actual){
		return expected == actual;
	}
};

FuncUnit.unit = defaultAdapter;

/**
	* @parent utilities
	* @function FuncUnit.attach F.attach()
	* @signature `attach(runner)`
	*
	* Attach a test runner, either QUnit, Mocha, or Jasmine to FuncUnit
	* which will be used to pause, resume, and make assertions.
	* 
	* @codestart
	* var QUnit = require("qunit");
	* F.attach(QUnit);
	* @codeend
	*
	* @param {Object} runner A test runner to attach to FuncUnit.
	* @body
	*
	* ## Use
	*
	* By default FuncUnit does not control the test runner or make assertions. This is left up to you. So for example if you're using QUnit you might write a test like:
	*
	* @codestart
	* var QUnit = require("qunit");
	* var F = require("funcunit");
	*
	* test("a test", function(){
	*   stop();
	*   F("#clickme").click(function(){
	*			ok("You were clicked!"); 
	*			start();
	*   });
	* });
	* @codeend
	*
	* You can prevent this extra boilerplate by attaching a test runner.
	*
	* @codestart
	* var QUnit = require("qunit");
	* var F = require("funcunit");
	*
	* F.attach(QUnit);
	*
	* test("a test", function(){
	*   F("#clickme").click();
	* });
	* @codeend
	*
	* `F.attach()` works with QUnit, Jasmine, and Mocha.
	*/
FuncUnit.attach = function(runner){
	var unit;
	if(isQUnit(runner)) {
		unit = qunitAdapter(runner);
	} else if(isQUnit2(runner)) {
		unit = qunit2Adapter(runner);
	} else if(isMocha(runner)) {
		unit = mochaAdapter(runner);
	} else if(isJasmine(runner)) {
		unit = jasmineAdapter(runner);
	} else if(isJasmine2(runner)) {
		unit = jasmine2Adapter(runner);
	} else {
		unit = defaultAdapter;
	}

	FuncUnit.unit = unit;
};

function isQUnit(runner) {
	return !!(window.QUnit && runner === window.QUnit && (!runner.version || runner.version.startsWith("1.")));
}

function isQUnit2(runner) {
	return !!(window.QUnit && runner === window.QUnit && runner.version && runner.version.startsWith("2.") );
}

function isMocha(runner) {
	return !!(runner.setup && runner.globals && runner.reporter);
}

function isJasmine(runner) {
	return !!(runner.getEnv && typeof window.waitsFor === "function");
}

function isJasmine2(runner) {
	return !!(runner.getEnv && typeof runner.clock === "function" && !window.waitsFor);
}

/**
	* @parent utilities
	* @function FuncUnit.detach F.detach()
	* @signature `detach(runner)`
	* Removes a test runner from FuncUnit, if one was previously attached with
	* [FuncUnit.attach].
	*/
FuncUnit.detach = function(){
	FuncUnit.unit = defaultAdapter;
};

