steal('can/map', 'can/list', 'can/test/benchmarks.js', function (Map, List, benchmarks) {
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
});
