'use strict';

var QUnit = require('steal-qunit');
var canLog = require("./can-log");

if(typeof console !== "undefined") {

	QUnit.module("can-log");

	QUnit.test("log.log works", function(assert) {
		assert.expect(1);
		var log = console.log;
		console.log = function(msg){
			assert.equal(msg, "it worked");
			console.log = log;
		};

		canLog.log("it worked");
	});

	QUnit.test("log.warn works", function(assert) {
		assert.expect(1);
		var warn = console.warn;
		console.warn = function(msg){
			assert.equal(msg, "it worked");
			console.warn = warn;
		};

		canLog.warn("it worked");
	});

	QUnit.test("log.error works", function(assert) {
		assert.expect(1);
		var error = console.error;
		console.error = function(msg){
			assert.equal(msg, "an error");
			console.error = error;
		};

		canLog.error("an error");
	});
}
