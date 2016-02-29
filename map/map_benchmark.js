var can = require('can/util/util');
require('can/map/map');
require('can/list/list');
var benchmarks = require('can/test/benchmarks.js');

var objects, map;
benchmarks.add('Adding a big array to an object', function () {
	objects = [];
	for (var i = 0; i < 10; i++) {
		objects.push({
			prop: 'prop',
			nest: {
				prop: 'prop',
				nest: {
					prop: 'prop'
				}
			}
		});
	}
}, function () {
	map = new can.Map();
	map.attr('obj', objects);
});

var NumbersMap;
benchmarks.add('Overwriting defaults', function () {
	NumbersMap = can.Map.extend({
		numbers: [1, 2, 3, 4, 5, 6],
		foo: 'string',
		bar: {},
		zed: false
	});
}, function () {
	new NumbersMap();
	new NumbersMap({
		numbers: ['a', 'b', 'c', 'd']
	});
	new NumbersMap({
		foo: 'blah blah blah'
	});
});
