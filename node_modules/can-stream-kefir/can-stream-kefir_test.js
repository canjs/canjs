var QUnit = require('steal-qunit');
var canStream = require('can-stream-kefir');
var compute = require('can-compute');
var canReflect = require('can-reflect');
var DefineList = require('can-define/list/list');

QUnit.module('can-stream-kefir');

QUnit.test('Compute changes can be streamed', function(assert) {
	var c = compute(0);
	var stream = canStream.toStream(c);
	var computeVal;

	stream.onValue(function (newVal) {
		computeVal = newVal;
	});

	assert.equal(computeVal, 0);
	c(1);

	assert.equal(computeVal, 1);
	c(2);

	assert.equal(computeVal, 2);
	c(3);

	assert.equal(computeVal, 3);
});

QUnit.test('Compute streams do not bind to the compute unless activated', function(assert) {
	var c = compute(0);
	var stream = canStream.toStream(c);
	assert.notOk(c.computeInstance.bound, "should not be bound");

	stream.onValue(function() {});
	assert.ok(c.computeInstance.bound, "should be bound");
});

QUnit.test('Compute stream values can be piped into a compute', function(assert) {
	var expected = 0;
	var c1 = compute(0);
	var c2 = compute(0);

	var resultCompute = canStream.toStream(c1).merge(  canStream.toStream(c2) );

	resultCompute.onValue(function (val) {
		assert.equal(val, expected);
	});

	expected = 1;
	c1(1);

	expected = 2;
	c2(2);

	expected = 3;
	c1(3);
});



QUnit.test('Computed streams fire change events', function(assert) {
	var expected = 0;
	var c1 = compute(expected);
	var c2 = compute(expected);

	var resultCompute = canStream.toStream(c1).merge(  canStream.toStream(c2) );

	resultCompute.onValue(function (newVal) {
		assert.equal(expected, newVal);
	});

	expected = 1;
	c1(expected);

	expected = 2;
	c2(expected);

	expected = 3;
	c1(expected);
});





QUnit.test('Create a stream from a compute with shorthand method: toStream', function(assert) {
	var expected = 0;
	var c1 = compute(0);

	var resultCompute = canStream.toStream(c1);

	resultCompute.onValue(function (val) {
		assert.equal(val, expected);
	});

	expected = 1;
	c1(1);

});



QUnit.test("toCompute(streamMaker) can-define-stream#17", function(assert) {
	var c = compute("a");
	var letterStream = canStream.toStream(c);

	var streamedCompute = canStream.toCompute(function(setStream){
		return setStream.merge(letterStream);
	});

	streamedCompute.on("change", function(ev, newVal){

	});

	assert.deepEqual( streamedCompute(), "a" );

	c(1);

	assert.deepEqual( streamedCompute(), 1 );

	c("b");

	assert.deepEqual( streamedCompute(), "b" );
});

QUnit.test("setting test", function(assert) {

	var c = canStream.toCompute(function(setStream){
		return setStream;
	});

	c(5);
	// listen to the compute for it to have a value
	c.on("change", function(){});

	// immediate value
	assert.equal( c(), 5);
});


QUnit.test('Stream on DefineList', function(assert) {
	var expectedLength;

	var people = new DefineList([
	  { first: "Justin", last: "Meyer" },
	  { first: "Paula", last: "Strozak" }
	]);



	var stream = canStream.toStream(people, ".length");

	expectedLength = 2;

	stream.onValue(function(newLength) {
		assert.equal(newLength, expectedLength, 'List size changed');
	});

	expectedLength = 3;
	people.push({
		first: 'Obaid',
		last: 'Ahmed'
	});

	expectedLength = 2;
	people.pop();
});


QUnit.test('Computes with an initial value of undefined do not emit', function(assert) {
	var expectedLength;

	var people = new DefineList([
	  { first: "Justin", last: "Meyer" },
	  { first: "Paula", last: "Strozak" }
	]);



	var stream = canStream.toStream(people, "length");

	expectedLength = 2;

	stream.onValue(function(event) {
		assert.equal(event.args[0], expectedLength, 'List size changed');
	});

	expectedLength = 3;
	people.push({
		first: 'Obaid',
		last: 'Ahmed'
	});

	expectedLength = 2;
	people.pop();
});

QUnit.test('getValueDependencies - stream from compute', function(assert) {
	var c = compute(0);
	var stream = canStream.toStream(c);

	assert.deepEqual(canReflect.getValueDependencies(stream), {
		valueDependencies: new Set([c])
	});
});

QUnit.test('getValueDependencies - streamedCompute', function(assert) {
	var mergeStream;
	var c = compute("a");
	var letterStream = canStream.toStream(c);

	var makeStream = function makeStream(setStream){
		return (mergeStream = setStream.merge(letterStream));
	};

	var streamedCompute = canStream.toCompute(makeStream);

	assert.deepEqual(
		canReflect.getKeyDependencies(streamedCompute.computeInstance, "change"),
		{
			valueDependencies: new Set([ mergeStream ])
		}
	);
});
