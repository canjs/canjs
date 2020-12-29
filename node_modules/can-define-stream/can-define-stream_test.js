var QUnit = require('steal-qunit');
var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var defineStream = require('can-define-stream');
var compute = require('can-compute');
var canStream = require('can-stream');

var canSymbol = require('can-symbol');
var metaSymbol = canSymbol.for('can.meta');

QUnit.module('can-define-stream');

// Create a placeholder streaming interface:
var id = 0;
var canStreamInterface = {
	toStream: function(c) {
		return {
			id: ++id,
			onValue: function(callback) {
				callback["_computeHandler"+this.id] = function(ev, newVal) {
					callback(newVal);
				};

				c.on('change', callback["_computeHandler"+this.id]);
				callback( c());
			},
			offValue: function(callback){
				c.off('change',callback["_computeHandler"+this.id]);
			}
		};
	},
	toCompute: function(makeStream, context) {
		var lastValue,
			streamHandler;

		var setCallbacks = [];
		var setterStream = {
			onValue: function(callback){
				setCallbacks.push(callback);
			},
			offValue: function(callback) {
				var index = setCallbacks.indexOf(callback);
				setCallbacks.splice(index, 1);
			}
		};

		var valueStream = makeStream.call(context, setterStream);

		// Create a compute that will bind to the resolved stream when bound
		return compute(undefined, {

			// When the compute is read, use that last value
			get: function () {
				return lastValue;
			},
			set: function (val) {
				setCallbacks.forEach(function(cb){
					cb(val);
				});
				return val;
			},

			on: function (updated) {
				streamHandler = function (newVal, oldVal) {
					lastValue = newVal;
					updated(lastValue);
				};
				valueStream.onValue(streamHandler);
			},

			off: function () {
				valueStream.offValue(streamHandler);
			}
		});
	}
};

var canStreaming = canStream(canStreamInterface);

var poll = function poll(fn, callback, timeout, interval) {
	var endTime = Number(new Date()) + (timeout || 2000);
	interval = interval || 100;

	(function p() {
		if (fn()) {
			callback();
		} else if (Number(new Date()) < endTime) {
			setTimeout(p, interval);
		} else {
			callback();
		}
	})();
};

QUnit.test('Stream behavior on multiple properties with merge', function(assert) {
	assert.expect(8);

	var expectedNewVal,
		expectedOldVal,
		caseName;


	var MyMap = DefineMap.extend('MyMap', {
		foo: 'string',
		bar: { type: 'string', value: 'bar' },
		baz: {
			type: 'string',
			stream: function( setStream ) {
				var mergedCompute = compute();
				var mergeValue = function(val) {
					mergedCompute(val);
				};
				this.stream('.foo').onValue(mergeValue);
				this.stream('.bar').onValue(mergeValue);
				setStream.onValue(mergeValue);

				return canStreaming.toStream(mergedCompute);
			}
		}
	});


	defineStream(canStreaming)(MyMap);

	var map = new MyMap();

	map.foo = 'foo-1';

	assert.equal( map.baz, undefined, "read value before binding");

	map.on("baz", function(ev, newVal, oldVal){
		assert.equal(newVal, expectedNewVal, caseName+ " newVal");
		assert.equal(oldVal, expectedOldVal, caseName+ " oldVal");
	});


	assert.equal( map.baz, 'bar', "read value immediately after binding");

	caseName = "setting foo";
	expectedOldVal = 'bar';
	expectedNewVal = 'foo-2';
	map.foo = 'foo-2';

	caseName = "setting bar";
	expectedOldVal = expectedNewVal;
	expectedNewVal = 'new bar';
	map.bar = 'new bar';

	caseName = "setting baz setter";
	expectedOldVal = expectedNewVal;
	expectedNewVal = 'new baz';
	map.baz = 'new baz';
});

QUnit.test('Test if streams are memory safe', function(assert) {
	var done = assert.async();

	var MyMap = DefineMap.extend({
		foo: 'string',
		bar: { type: 'string', value: 'bar' },
		baz: {
			type: 'string',
			stream: function( setStream ) {
				var fooStream = this.stream('.foo');
				var barStream = this.stream('.bar');

				var lastValue;
				var UPDATER;
				var setLastValue = function(value){
					lastValue = value;
					UPDATER(value);
				};

				var mergedCompute = compute(undefined, {
					on: function(updater) {
						UPDATER = updater;
						fooStream.onValue(setLastValue);
						barStream.onValue(setLastValue);
						setStream.onValue(setLastValue);
					},
					off: function(){
						fooStream.offValue(setLastValue);
						barStream.offValue(setLastValue);
						setStream.offValue(setLastValue);
					},
					get: function(){
						return lastValue;
					}
				});

				return canStreaming.toStream(mergedCompute);
			}
		}
	});

	defineStream(canStreaming)(MyMap);

	var getNumberOfBindings = function(map) {
		var meta = map[metaSymbol];
		return meta && meta.handlers && meta.handlers.get([]).length;
	};

	var map = new MyMap();
	assert.equal(getNumberOfBindings(map), undefined, 'Should have no bindings');

	var handler = function(ev, newVal, oldVal){};
	map.on('baz', handler);
	assert.equal(getNumberOfBindings(map), 3, 'Should have 3 bindings');

	map.off('baz', handler);
	poll(
		function() {
			return getNumberOfBindings(map) === 0;
		},
		function() {
			assert.equal(getNumberOfBindings(map), 0, 'Should reset the bindings');
			done();
		}
	);
});

QUnit.test('Stream on DefineList', function(assert) {
	var expectedLength;

	var PeopleList = DefineList.extend({});

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function() {
						callback.apply(null, arguments);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {}
	};
	var canStreaming = canStream(canStreamInterface);
	defineStream(canStreaming)(PeopleList);

	var people = new PeopleList([
	  { first: "Justin", last: "Meyer" },
	  { first: "Paula", last: "Strozak" }
	]);

	var stream = people.stream('.length');

	expectedLength = 2;
	stream.onValue(function(ev, val) {
		assert.equal(val, expectedLength, 'List size changed');
	});

	expectedLength = 3;
	people.push({
		first: 'Obaid',
		last: 'Ahmed'
	});

	expectedLength = 2;
	people.pop();
});
