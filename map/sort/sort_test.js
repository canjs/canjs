steal("can/map/sort", "can/test", "can/view/mustache", "steal-qunit", function () {
	QUnit.module('can/map/sort');

	test('list events', 12, function () {
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
			ok(true, 'move called');
			equal(item.name, 'Zed');
			equal(newPos, 3);
			equal(oldPos, 0);
		});
		// a remove directly on this list
		list.bind('remove', function (ev, items, oldPos) {
			ok(true, 'remove called');
			equal(items.length, 1);
			equal(items[0].name, 'Alexis');
			equal(oldPos, 0, 'put in right spot');
		});
		list.bind('add', function (ev, items, pos) {
			ok(true, 'add called');
			equal(items.length, 1);
			equal(items[0].name, 'Alexis');
			equal(pos, 0, 'got sorted position');
		});
		list.push({
			name: 'Alexis'
		});
		// now lets remove alexis ...
		list.splice(0, 1);
		list[0].attr('name', 'Zed');
	});


	test('sort() events', 14, function () {
		var list = new can.List([{
			name: 'Justin'
		}, {
			name: 'Brian'
		}, {
			name: 'Austin'
		}, {
			name: 'Mihael'
		}]);
		list.bind('remove', function (ev, items, oldPos) {
			ok(true, 'remove called');
			equal(items.length, 4, 'remove all elements');
			equal(items[0].name, 'Justin', 'remove elements in old order');
		});
		list.bind('add', function (ev, items) {
			ok(true, 'add called');
			equal(items.length, 4, 'add items correct length');
			equal(items[0].name, 'Austin', 'add items in sorted order (1/4)');
			equal(items[1].name, 'Brian', 'add items in sorted order (2/4)');
			equal(items[2].name, 'Justin', 'add items in sorted order (3/4)');
			equal(items[3].name, 'Mihael', 'add items in sorted order (4/4)');
			equal(list.length, 4, 'list correct length');
			equal(list[0].name, 'Austin', 'list in sorted order (1/4)');
			equal(list[1].name, 'Brian', 'list in sorted order (2/4)');
			equal(list[2].name, 'Justin', 'list in sorted order (3/4)');
			equal(list[3].name, 'Mihael', 'list in sorted order (4/4)');
		});
		list.comparator = 'name';
		list.sort();
	});

	test('list sort with func', 1, function () {
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

	test('list sort with containing Map attribute', 4, function () {
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

	test('live binding with comparator (#170)', function () {
		var renderer = can.view.mustache('<ul>{{#items}}<li>{{text}}</li>{{/items}}</ul>'),
			el = document.createElement('div'),
			items = new can.List([{
				text: 'First'
			}]);
		el.appendChild(renderer({
			items: items
		}));
		equal(el.getElementsByTagName('li')
			.length, 1, 'Found one li');
		items.push({
			text: 'Second'
		});
		equal(el.getElementsByTagName('li')
			.length, 2, 'Live binding rendered second li');
	});

	test('live binding with comparator and {{#key}}', function () {
		var renderer = can.view.mustache('<ul>{{#items}}<li>{{text}}</li>{{/items}}</ul>'),
			el = document.createElement('div'),
			items = new can.List([{
				text: 'CCC'
			}, {
				text: 'BBB'
			}]);
		el.appendChild(renderer({
			items: items
		}));
		equal(el.getElementsByTagName('li')[0].innerHTML, 'CCC',
			'Unsorted list, 1st item');
		equal(el.getElementsByTagName('li')[1].innerHTML, 'BBB',
			'Unsorted list, 2nd item');

		items.comparator = 'text';
		items.sort();
		equal(el.getElementsByTagName('li')[0].innerHTML, 'BBB',
			'Sorted list, 1st item');
		equal(el.getElementsByTagName('li')[1].innerHTML, 'CCC',
			'Sorted list, 2nd item');

		items.push({
			text: 'AAA'
		});
		equal(el.getElementsByTagName('li')[0].innerHTML, 'AAA',
			'Push to sorted list, 1st item');
		equal(el.getElementsByTagName('li').length, 3,
			'Push to sorted list, correct length');
	});

	test('live binding with comparator and {{#each key}}', function () {
		var renderer = can.view.mustache('<ul>{{#each items}}<li>{{text}}</li>{{/each}}</ul>'),
			el = document.createElement('div'),
			items = new can.List([{
				text: 'CCC'
			}, {
				text: 'BBB'
			}]);
		el.appendChild(renderer({
			items: items
		}));
		equal(el.getElementsByTagName('li')[0].innerHTML, 'CCC',
			'Unsorted list, 1st item');
		equal(el.getElementsByTagName('li')[1].innerHTML, 'BBB',
			'Unsorted list, 2nd item');

		items.comparator = 'text';
		items.sort();
		equal(el.getElementsByTagName('li')[0].innerHTML, 'BBB',
			'Sorted list, 1st item');
		equal(el.getElementsByTagName('li')[1].innerHTML, 'CCC',
			'Sorted list, 2nd item');

		items.push({
			text: 'AAA'
		});
		equal(el.getElementsByTagName('li')[0].innerHTML, 'AAA',
			'Push to sorted list, 1st item');
		equal(el.getElementsByTagName('li').length, 3,
			'Push to sorted list, correct length');
	});
});
