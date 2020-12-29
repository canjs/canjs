var QUnit = require("steal-qunit2");
var F = require("funcunit");
var $ = require("jquery");

F.attach(QUnit);

QUnit.module("Adapters 2", {
	beforeEach: function() {
		$("#qunit-fixture").append(
			"<a class='clickme' href='javascript://'>clickme</a><div class='clickresult'></div>"
		);
		$(".clickme").click(function() {
			$(".clickresult").text("clicked");
		});
	}
});

QUnit.test("QUnit adapter test", function(assert) {
	F.wait(1000);
	F(".clickme").click();
	F(".clickresult").text("clicked", "clicked the link");
});

QUnit.module("QUnit 2 adapter unit tests");

QUnit.test("QUnit2 call count", function(assert) {
	var adapter = require("../../browser/adapters/qunit2");

	var stats = {
		async: 0,
		ok: 0,
		done: 0,
		equiv: 0
	};

	var fakeAssert = {
		async: function() {
			stats.async += 1;
			return function done() {
				stats.done += 1;
			};
		},
		ok: function() {
			stats.ok += 1;
		},
		test: {}
		
	};

	var fakeQunit = {
		test: function(title, cb) {
			return cb(fakeAssert);
		},
		equiv: function() {
			stats.equiv += 1;
		},
		config : { current : { assert : fakeAssert }}
	};
	
	var adapted = adapter(fakeQunit);

	fakeQunit.test("test", function() {});
	adapted.pauseTest();
	adapted.resumeTest();
	adapted.assertOK();
	adapted.equiv();

	QUnit.assert.deepEqual(stats, {
		async: 1,
		done: 1,
		ok: 1,
		equiv: 1
	});
});
