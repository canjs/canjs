steal("can/list/sort", "can/test", "can/view/mustache", "can/view/stache", "can/model", "steal-qunit", function () {
	QUnit.module('can/list/sort');

	test('List events', (4*3), function () {
		var list = new can.List([{
			name: 'Justin'
		}, {
			name: 'Brian'
		}, {
			name: 'Austin'
		}, {
			name: 'Mihael'
		}]);
		list.comparator = 'name';
		list.sort();
		// events on a list
		// - move - item from one position to another
		//          due to changes in elements that change the sort order
		// - add (items added to a list)
		// - remove (items removed from a list)
		// - reset (all items removed from the list)
		// - change something happened
		// a move directly on this list
		list.bind('move', function (ev, item, newPos, oldPos) {
			ok(ev, '"move" event passed `ev`');
			equal(item.name, 'Zed', '"move" event passed correct `item`');
			equal(newPos, 3, '"move" event passed correct `newPos`');
			equal(oldPos, 0, '"move" event passed correct `oldPos`');
		});

		// a remove directly on this list
		list.bind('remove', function (ev, items, oldPos) {
			ok(ev, '"remove" event passed ev');
			equal(items.length, 1, '"remove" event passed correct # of `item`\'s');
			equal(items[0].name, 'Alexis', '"remove" event passed correct `item`');
			equal(oldPos, 0, '"remove" event passed correct `oldPos`');
		});

		list.bind('add', function (ev, items, index) {
			ok(ev, '"add" event passed ev');
			equal(items.length, 1, '"add" event passed correct # of items');
			equal(items[0].name, 'Alexis', '"add" event passed correct `item`');
			equal(index, 0, '"add" event passed correct `index`');
		});

		// Push: Should result in a "add" event
		list.push({
			name: 'Alexis'
		});

		// Splice: Should result in a "remove" event
		list.splice(0, 1);

		// Update: Should result in a "move" event
		list[0].attr('name', 'Zed');
	});

	test('Passing a comparator function to sort()', 1, function () {
		var list = new can.List([{
			priority: 4,
			name: 'low'
		}, {
			priority: 1,
			name: 'high'
		}, {
			priority: 2,
			name: 'middle'
		}, {
			priority: 3,
			name: 'mid'
		}]);
		list.sort(function (a, b) {
			// Sort functions always need to return the -1/0/1 integers
			if (a.priority < b.priority) {
				return -1;
			}
			return a.priority > b.priority ? 1 : 0;
		});
		equal(list[0].name, 'high');
	});

	test('Passing a comparator string to sort()', 1, function () {
		var list = new can.List([{
			priority: 4,
			name: 'low'
		}, {
			priority: 1,
			name: 'high'
		}, {
			priority: 2,
			name: 'middle'
		}, {
			priority: 3,
			name: 'mid'
		}]);
		list.sort('priority');
		equal(list[0].name, 'high');
	});

	test('Defining a comparator property', 1, function () {
		var list = new can.List([{
			priority: 4,
			name: 'low'
		}, {
			priority: 1,
			name: 'high'
		}, {
			priority: 2,
			name: 'middle'
		}, {
			priority: 3,
			name: 'mid'
		}]);
		list.comparator = 'priority';
		list.sort();
		equal(list[0].name, 'high');
	});

	test('Defining a comparator property that is a function of a can.Map', 4, function () {
		var list = new can.Map.List([
			new can.Map({
				text: 'Bbb',
				func: can.compute(function () {
					return 'bbb';
				})
			}),
			new can.Map({
				text: 'abb',
				func: can.compute(function () {
					return 'abb';
				})
			}),
			new can.Map({
				text: 'Aaa',
				func: can.compute(function () {
					return 'aaa';
				})
			}),
			new can.Map({
				text: 'baa',
				func: can.compute(function () {
					return 'baa';
				})
			})
		]);
		list.comparator = 'func';
		list.sort();
		equal(list.attr()[0].text, 'Aaa');
		equal(list.attr()[1].text, 'abb');
		equal(list.attr()[2].text, 'baa');
		equal(list.attr()[3].text, 'Bbb');
	});

	test('Sorts primitive items', function () {
		var list = new can.List(['z', 'y', 'x']);
		list.sort();

		equal(list[0], 'x', 'Moved string to correct index');
	});



	function renderedTests (templateEngine, helperType, renderer) {
		test('Insert pushed item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([{
				id: 'b'
			}]);
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			/// Check that the template rendered an item
			equal(firstElText, 'b',
				'First LI is a "b"');

			// Add another item
			items.push({
				id: 'a'
			});

			// Get the text of the first <li> in the <div>
			firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the template rendered that item at the correct index
			equal(firstElText, 'a',
				'An item pushed into the list is rendered at the correct position');

		});

		// TODO: Test that push and sort have the result in the same output

		test('Insert unshifted item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([
				{ id: 'a' },
				{ id: 'c' }
			]);
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			/// Check that the template rendered an item
			equal(firstElText, 'a', 'First LI is a "a"');

			// Attempt to add an item to the beginning of the list
			items.unshift({
				id: 'b'
			});

			// Get the text of the first <li> in the <div>
			firstElText = el.getElementsByTagName('li')[1].innerText;

			// Check that the template rendered that item at the correct index
			equal(firstElText, 'b',
				'An item unshifted into the list is rendered at the correct position');

		});

		test('Insert spliced item at correct index with ' + templateEngine + ' using ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([
				{ id: 'b' },
				{ id: 'c' }
			]);
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "b" is at the beginning of the list
			equal(firstElText, 'b',
				'First LI is a b');

			// Add a "1" to the middle of the list
			items.splice(1, 0, {
				id: 'a'
			});

			// Get the text of the first <li> in the <div>
			firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "a" was added to the beginning of the list despite
			// the splice
			equal(firstElText, 'a',
				'An item spliced into the list at the wrong position is rendered ' +
				'at the correct position');

		});

		// TODO: Test adding and removing items at the same time with .splice()

		test('Moves rendered item to correct index after "set" using ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([
				{ id: 'x' },
				{ id: 'y' },
				{ id: 'z' }
			]);
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "x" is at the beginning of the list
			equal(firstElText, 'x', 'First LI is a "x"');

			// Change the ID of the last item so that it's sorted above the first item
			items.attr('2').attr('id', 'a');

			// Get the text of the first <li> in the <div>
			firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "a" was added to the beginning of the list despite
			// the splice
			equal(firstElText, 'a', 'The last item was moved to the first position ' +
				'after it\'s value was changed');

		});

		test('Move DOM items when list is sorted with  ' + templateEngine + ' using the ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([
				{ id: 4 },
				{ id: 1 },
				{ id: 6 },
				{ id: 3 },
				{ id: 2 },
				{ id: 8 },
				{ id: 0 },
				{ id: 5 },
				{ id: 6 },
				{ id: 9 },
			]);

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "4" is at the beginning of the list
			equal(firstElText, 4, 'First LI is a "4"');

			// Sort the list in-place
			items.comparator = 'id';
			items.sort();

			firstElText = el.getElementsByTagName('li')[0].innerText;

			equal(firstElText, 0, 'The `0` was moved to beginning of the list' +
				'once sorted.');

		});

		test('Supress events during sort with ' + templateEngine + ' using the ' + helperType +' helper', function () {
			var el = document.createElement('div');

			var items = new can.List([
				{ id: 4 },
				{ id: 1 },
				{ id: 6 },
				{ id: 3 },
				{ id: 2 },
				{ id: 8 },
				{ id: 0 },
				{ id: 5 },
				{ id: 6 },
				{ id: 9 },
			]);

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			var firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "4" is at the beginning of the list
			equal(firstElText, 4, 'First LI is a "4"');

			// Sort the list in-place
			items.comparator = 'id';

			// Use the default comparator, but don't fire events
			items.sort(undefined, true);

			firstElText = el.getElementsByTagName('li')[0].innerText;

			// Check that the "4" is at the beginning of the list
			equal(firstElText, 4, 'The first LI has not changed as a result of the sort');

		});

		test('Push multiple items with ' + templateEngine + ' using the ' + helperType +' helper (#1509)', function () {
			var el = document.createElement('div');

			var items = new can.List();
			items.comparator = 'id';

			// Render the template and place inside the <div>
			el.appendChild(renderer({
				items: items
			}));

			items.bind('add', function (ev, items) {
				equal(items.length, 1, 'One single item was added');
			});

			items.push([
				{ id: 4 },
				{ id: 1 },
				{ id: 6 }
			]);

			var liLength = el.getElementsByTagName('li').length;

			equal(liLength, 3, 'The correct number of items have been rendered');

		});

	}

	var blockHelperTemplate = '<ul>{{#items}}<li>{{id}}</li>{{/items}}';
	var eachHelperTemplate = '<ul>{{#each items}}<li>{{id}}</li>{{/each}}';

	renderedTests('Mustache', '{{#block}}', can.view.mustache(blockHelperTemplate));
	renderedTests('Stache', '{{#block}}', can.stache(blockHelperTemplate));
	renderedTests('Mustache', '{{#each}}', can.view.mustache(eachHelperTemplate));
	renderedTests('Stache', '{{#each}}', can.stache(eachHelperTemplate));


	test('Sort primitive values without a comparator defined', function () {
		var list = new can.List([8,5,2,1,5,9,3,5]);
		list.sort();
		equal(list[0], 1, 'Sorted the list in ascending order');
	});

	test('Sort primitive values with a comparator function defined', function () {
		var list = new can.List([8,5,2,1,5,9,3,5]);
		list.comparator = function (a, b) {
			return a === b ? 0 : a < b ? 1 : -1;
		};
		list.sort();
		equal(list[0], 9, 'Sorted the list in descending order');
	});

	test('The "destroyed" event bubbles on a sorted list', 2, function () {

		var list = new can.Model.List([
			new can.Model({ name: 'Joe' }),
			new can.Model({ name: 'Max' }),
			new can.Model({ name: 'Pim' })
		]);

		list.comparator = 'name';

		list.bind('destroyed', function (ev) {
			ok(true, '"destroyed" event triggered');
		});

		list.attr(0).destroy();

		equal(list.attr('length'), 2, 'item removed');
	});

});
