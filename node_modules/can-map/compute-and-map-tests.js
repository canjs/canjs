/*jshint -W079 */
var Map = require('can-map');
var Observation = require('can-observation');
var SimpleObservable = require("can-simple-observable");
var List = require('can-list');

test('Getting attribute that is observable should return itself and not its value (#530)', function () {
	var compute = new SimpleObservable('before');
	var map = new Map({
		time: compute
	});

	equal(map.time, compute, 'dot notation call of time is compute');
	equal(map.attr('time'), compute, '.attr() call of time is compute');
});

test("can.each used with maps", function () {
	can.each(new Map({
		foo: "bar"
	}), function (val, attr) {

		if (attr === "foo") {
			equal(val, "bar");
		} else {
			ok(false, "no properties other should be called " + attr);
		}

	});
});

test("computed properties don't cause memory leaks", function () {
	var computeMap = Map.extend({
		'name': new Observation(function(){
			return this.attr('first') + this.attr('last');
		})
	}),
		handler = function(){},
		map = new computeMap({
			first: 'Mickey',
			last: 'Mouse'
		});
	map.bind('name', handler);
	map.bind('name', handler);
	equal(map._computedAttrs.name.count, 2, '2 handlers listening to computed property');
	map.unbind('name', handler);
	map.unbind('name', handler);
	equal(map._computedAttrs.name.count, 0, '0 handlers listening to computed property');

});


test('Creating map in compute dispatches all events properly', function() {
	expect(2);

	var source = new SimpleObservable(0);

	var c = new Observation(function() {
		var map = new Map();
		source();
		map.bind("foo", function(){
			ok(true);
		});
		map.attr({foo: "bar"}); //DISPATCH

		return map;
	});

	c.bind("change",function(){});

	can.batch.start();
	source(1);
	can.batch.stop();
});

test("Map::attr setting is observable", function() {
	expect(0);
	var c = new Observation(function() {
		return new Map();
	});

	c.bind('change', function() {
		ok(false, "the compute should not be updated");
	});

	var map = c();

	// recomputes c
	map.attr('foo', 'bar');
});

test('list sets up computed attributes (#790)', function() {
	var L = List.extend({
		i: can.compute(0),
		a: 0
	});

	var l = new L([1]);
	equal(l.attr('i'), 0);

	var Map = can.Map.extend({
		f: can.compute(0)
	});

	var m = new Map();
	m.attr('f');
});
