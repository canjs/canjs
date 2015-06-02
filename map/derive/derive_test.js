/* jshint asi: false */
steal("can/map/derive", "can/test", "steal-qunit", function () {

	QUnit.module('can/map/derive');

	test('Map - mapKeys', function () {
		var source = new can.Map({ 
			a: 1, 
			b: 2 
		});

		var derived = source.deriveMap(function(value, key) {
			return key + value;
		}); 
		derived.bind('change', can.noop);
		
		// Initial
		equal(derived.attr('a1'), 1, 'Initial properties derived');
		equal(derived.attr('b2'), 2, 'Initial properties derived');

		// Change
		source.attr('a', 3);
		equal(derived.attr('a3'), 3, 'Changed property derived');

		// Add
		source.attr('c', 4);
		equal(derived.attr('c4'), 4, 'Added property derived');

		// Remove
		source.removeAttr('c');
		equal(derived.attr('c4'), undefined, 'Removed property derived');
	});

	test('List - compact', function () {
		var source = new can.List([0, 1, false, 2, '', 3]);

		var derived = source.deriveList(function (item, index) {
			return !! item;
		});
		derived.bind('change', can.noop);

		derived.each(function (item) {
			ok(item, 'Derived list contains truthy values only');
		});
	})

});
