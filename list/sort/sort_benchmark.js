steal('can/test/benchmarks.js', 'node_modules/lodash', 'can/list', 'can/list/sort', function (benchmarks, _) {

	can.ajax({
		url: '20k.txt'
	}).then(function (file) {

		window.numbers = file.split('\n')/*.slice(0, 100000)*/;
		window.setup = function () {
			// Create a list
			window.list = new can.List();

			// Activate the sort plugin
			window.list.attr('comparator', can.List.prototype._comparator);

			// Start the clock
			window.s = +new Date();

			// Reset
			window.probe1 = 0;
			window.probe2 = 0;
		};

		window.cleanup = function () {
			// Stop the clock
			// var time = +new Date() - window.s;

			// Compare against control
			// var passed = _.isEqual(window.sortedNumbers, window.list.attr ?
			// 	window.list.attr() :
			// 	window.list);

			// Clear up memory
			window.list.splice(0, window.list.length);

			// Print results
			// console.log(time, window.probe1, window.probe2, passed);
		};

		// Make comparisons faster by using numbers, not strings
		can.each(window.numbers, function (num, i) {
			window.numbers[i] = parseInt(num, 10);
		});

		// Control
		window.sortedNumbers = window.numbers.slice(0).sort(can.List.prototype._comparator);

		benchmarks.add('Sorting items via native .sort([comparator])', function () {

			// Display an intermittent timer
			window.s = +new Date();

			// Create a list
			var list = window.list = window.numbers.slice(0);
			list.sort(can.List.prototype._comparator);

			window.cleanup();
		});

		benchmarks.add('Adding items via .push([list])', function () {

			window.setup();

			// Add the items to the sorted list
			window.list.push.apply(window.list, window.numbers);

			window.cleanup();
		});

		benchmarks.add('Adding items via .splice(0, 0, [list])', function () {

			window.setup();

			// Add the items to the sorted list
			window.list.splice.apply(window.list, [0, 0].concat(window.numbers));

			window.cleanup();
		});

		benchmarks.add('Adding items via .each([list]) + .push([item])', function () {

			window.setup();

			// Add the items to the sorted list
			can.each(window.numbers, function (num) {
				window.list.push(num);
			});

			window.cleanup();
		});


		benchmarks.run();
	});
});