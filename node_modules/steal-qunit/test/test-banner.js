var QUnit = require("steal-qunit");
var F = require("funcunit");

F.attach(QUnit);

QUnit.module("Banner - Test one passing", {
	beforeEach: function(assert){
		var done = assert.async();
		F.open("//tests/run-one/all-pass.html?testId=a205d21a", function(){
			done();
		});
	}
});

QUnit.test("Banner shows as passing", function(){
	F("#qunit-banner").hasClass("qunit-pass", true, "Is passing");
});

QUnit.module("Banner - Test one failing - Running all tests", {
	beforeEach: function(assert){
		var done = assert.async();
		F.open("//tests/run-one/one-fail.html", function(){
			done();
		});
	}
});

QUnit.test("Banner shows as failing", function(){
	F("#qunit-banner").hasClass("qunit-fail", true, "Is failing");
});

QUnit.module("Banner - Test one failing - Running failed test", {
	beforeEach: function(assert){
		var done = assert.async();
		F.open("//tests/run-one/one-fail.html?testId=108cbb26", function(){
			done();
		});
	}
});

QUnit.test("Banner shows as failing", function(){
	F("#qunit-banner").hasClass("qunit-fail", true, "Is failing");
});

QUnit.module("Banner - Test one failing - Running passing test", {
	beforeEach: function(assert){
		var done = assert.async();
		F.open("//tests/run-one/one-fail.html?testId=a205d21a", function(){
			done();
		});
	}
});

QUnit.test("Banner shows as passing", function(){
	F("#qunit-banner").hasClass("qunit-pass", true, "Is passing");
});