var QUnit = require("steal-qunit");
var F = require("funcunit");
var mock = require("./lr-helpers");

F.attach(QUnit);

QUnit.module("live-reload - Passing test", {
	beforeEach: function(assert){
		var done = assert.async();
		var harness = this;
		F.open("//tests/live-reload/test.html", function(){
			harness.mock = mock(F.win.steal.loader);
			done();
		});
	},
	afterEach: function(){
		this.mock.reset();
	}
});

QUnit.test("A passing test becomes failing", function(){
	var harness = this;
	F("#qunit-banner").exists().hasClass("qunit-pass",  true, "the test is passing to start");

	F(function(){
		var content = "module.exports = 1;";
		harness.mock.replace("test/tests/live-reload/mod", content);
	});

	F("#qunit-banner").hasClass("qunit-fail", true, "and now it is failing");
});

QUnit.module("live-reload - Failing test", {
	beforeEach: function(assert){
		var done = assert.async();
		var harness = this;
		F.open("//tests/live-reload-failing/test.html", function(){
			harness.mock = mock(F.win.steal.loader);
			done();
		});
	},
	afterEach: function(){
		this.mock.reset();
	}
});

QUnit.test("Removing a failing test will make the tests pass", function(){
	var harness = this;
	F("#qunit-banner").exists().hasClass("qunit-fail",  true, "the test is failing to start");

	function replacement() {/*
		var QUnit = require("steal-qunit");

		QUnit.module("some module");

		QUnit.test("Passing test", function(){
			QUnit.equal(2, 2);
		});

		QUnit.module("another module");

		QUnit.test("Another passing", function(){
			QUnit.equal(1, 1);
		});
	*/}

	F(function(){
		var content = harness.mock.getContent(replacement);
		harness.mock.replace("test/tests/live-reload-failing/test", content);
	});

	F("#qunit-banner").exists().hasClass("qunit-pass",  true, "the test is passing now");
});
