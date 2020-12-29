var QUnit = require('steal-qunit');
var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var canDefineStreamKefir = require('can-define-stream-kefir');

var canSymbol = require('can-symbol');
var metaSymbol = canSymbol.for('can.meta');

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

QUnit.module('can-define-stream-kefir');

QUnit.test('Stream behavior on multiple properties with merge', function(assert) {
	assert.expect(8);

	var expectedNewVal,
		expectedOldVal,
		caseName;

	var MyMap = DefineMap.extend({
		foo: 'string',
		bar: { type: 'string', value: 'bar' },
		baz: {
			type: 'string',
		    stream: function( stream ) {
				var fooStream = this.stream('.foo');
				var barStream = this.stream('.bar');
				return stream.merge(fooStream).merge(barStream);
		    }
		}
	});

	canDefineStreamKefir(MyMap);

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

QUnit.test("Test if streams are memory safe", function(assert) {
	var done = assert.async();

	var MyMap = DefineMap.extend({
		foo: "string",
		bar: { type: "string", value: "bar" },
		baz: {
			type: "string",
			stream: function(stream) {
				var fooStream = this.stream(".foo");
				var barStream = this.stream(".bar");
				return stream.merge(fooStream).merge(barStream);
			}
		}
	});
	canDefineStreamKefir(MyMap);

	var getNumberOfBindings = function getNumberOfBindings(map) {
		var meta = map[metaSymbol];
		return meta && meta.handlers && meta.handlers.get([]).length;
	};

	var map = new MyMap();
	assert.equal(getNumberOfBindings(map), undefined, "Should have no bindings");

	var handler = function handler(ev, newVal, oldVal) {};
	map.on("baz", handler);
	map.foo = "obaid";
	assert.equal(getNumberOfBindings(map), 3, "Should have 3 bindings");

	map.off("baz", handler);
	poll(
		function() {
			return getNumberOfBindings(map) === 0;
		},
		function() {
			assert.equal(getNumberOfBindings(map), 0, "Should reset the bindings");
			done();
		}
	);
});

QUnit.test('Keep track of change counts on stream', function(assert) {

	var count;

	var Person = DefineMap.extend({
      first: "string",
      last: "string",
      fullName: {
		  get: function() {
			  return this.first + " " + this.last;
		  }
	  },
      fullNameChangeCount: {
          stream: function(setStream) {
              return this.stream(".fullName").scan(function(last){ return last + 1;}, 0);
          }
      }
    });
	canDefineStreamKefir(Person);
    var me = new Person({first: 'Justin', last: 'Meyer'});

	//this increases the count.. should it?
    me.on("fullNameChangeCount", function(ev, newVal){
		assert.equal(newVal, count, "Count should be " + count);
    });

	count = 2;
    me.first = "Obaid"; //outputs: 2 instead of 1

	count = 3;
    me.last = "Ahmed"; //outputs: 3 instead of 2

});


QUnit.test('Update map property based on stream value', function(assert) {
	var expected;
	var Person = DefineMap.extend({
		name: "string",
		lastValidName: {
	    	stream: function(){
				return this.stream(".name").filter(function(name){
	        		return name.indexOf(" ") >= 0;
				});
	    	}
		}
	});
	canDefineStreamKefir(Person);
	var me = new Person({name: "James"});

	me.on("lastValidName", function(lastValid){
		assert.equal(lastValid.target.name, expected, "Updated name to " + expected);
	});

	me.name = "JamesAtherton";

	expected = "James Atherton";
	me.name = "James Atherton";

	me.name = "JustinMeyer";

	expected = "Justin Meyer";
	me.name = "Justin Meyer";

});

QUnit.test('Stream on DefineList', function(assert) {
	var expectedLength;

	var People = DefineList.extend({});

	canDefineStreamKefir(People);

	var people = new People([
	  { first: "Justin", last: "Meyer" },
	  { first: "Paula", last: "Strozak" }
	]);

	var stream = people.stream('length');

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

QUnit.test("Can instantiate define-map instances with properties that have stream definitions.", function(assert) {
	var Locator = DefineMap.extend({
		state: "string",
		city: {
			stream: function(setStream) {
				return this.stream(".state")
					.map(function() {
						return null;
					})
					.merge(setStream);
			}
		}
	});
	canDefineStreamKefir(Locator);

	var locator = new Locator({
		state: "IL",
		city: "Chitown"
	});

	assert.equal(locator.state, "IL", "State in tact, no errors");
	assert.equal(
		typeof locator.city,
		"undefined",
		"Derived value ignored until bound."
	);

	locator.on("city", function() {});
	assert.equal(locator.city, "Chitown", "can still get initial value");

	locator.state = "FL";
	assert.equal(locator.city, null, "Derived value set.");
});
