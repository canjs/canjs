var compute = require('can-compute');
var QUnit = require('steal-qunit');
require('can-event/batch/batch');
var canAsync = require("can-event/async/async");
//require('./read_test');

QUnit.module('can-compute async',{
	beforeEach: function(assert) {
		canAsync.async();
	},
	afterEach: function(assert) {
		canAsync.sync();
	}
});

QUnit.test('async basics', function(assert) {
	assert.expect(2);
	var done = assert.async();
	var canAsync = require("can-event/async/async");
	canAsync.async();

	var first = compute("Justin");
	var last = compute("Meyer");

	var fullName = compute(function(){
		return first() + " " + last();
	});

	fullName.on("change", function(ev, newVal, oldVal){
		assert.equal( newVal,  "Payal Shah", "newVal");
		assert.equal( oldVal, "Justin Meyer", "oldVal");
		done();
	});

	first("Payal");
	last("Shah");
});

QUnit.test('async can immediately read', function(assert) {
	assert.expect(4);
	var done = assert.async();
	var canAsync = require("can-event/async/async");
	canAsync.async();

	var compute = require("can-compute");

	var first = compute("Justin");
	var last = compute("Meyer");

	var fullName = compute(function(){
		return first() + " " + last();
	});
	var firedEvents = false;
	fullName.on("change", function(ev, newVal, oldVal){
		assert.equal( newVal,  "Payal Shah", "change newVal");
		assert.equal( oldVal, "Justin Meyer", "change oldVal");
		firedEvents = true;
		done();
	});

	first("Payal");
	last("Shah");

	assert.equal( fullName(),  "Payal Shah");
	assert.ok(firedEvents, "fired events");
});

QUnit.test("setting compute.async with a observable dependency gets a new value and can re-compute", function(assert) {
	assert.expect(4);
	// this is needed for define with a set and get.
	var c = compute(1);
	var add;

	var async = compute.async(1, function(curVal){
		add = curVal;
		return c()+add;
	});


	assert.equal( async(), 2, "can read unbound");

	async.bind("change", function(ev, newVal, oldVal){
		assert.equal(newVal, 3, "change new val");
		assert.equal(oldVal, 2, "change old val");
	});


	async(2);

	assert.equal( async(), 3, "can read unbound");
});

QUnit.test('compute.async getter has correct when length === 1', function(assert) {
	var m = {};

	var getterCompute = compute.async(false, function (singleArg) {
		assert.equal(this, m, 'getter has the right context');
	}, m);

	getterCompute.bind('change', function(){});
});

