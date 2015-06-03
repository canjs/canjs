/* jshint asi: false */
steal("can/map/derive", "can/test", "steal-qunit", function () {

	QUnit.module('can/map/derive');

test('Map - mapKeys', function () {
	console.log('test: Map - mapKeys');
	var source = new can.Map({ 
		a: 1, 
		b: 2 
	});

	var derived = source.deriveMap(function(value, key) {
		return key + value;
	}); 
	derived.bind('change', can.noop);
	
	// Initial
	console.log(derived.attr()); //-> {a1: 1, b2: 2}
	equal(derived.attr('a1'), 1, 'Initial properties derived');
	equal(derived.attr('b2'), 2, 'Initial properties derived');

	// Change
	console.log('>>> Change');
	source.attr('a', 3);
	
	console.log(derived.attr()); //-> {b2: 2, a3: 3}
	equal(derived.attr('a3'), 3, 'Changed property derived');

	// Add
	console.log('>>> Add');
	source.attr('c', 4);

	console.log(derived.attr()); //-> {b2: 2, a3: 3, c4: 4}
	equal(derived.attr('c4'), 4, 'Added property derived');

	// Remove
	console.log('>>> Remove');
	source.removeAttr('c');

	console.log(derived.attr()); //-> {b2: 2, a3: 3}
	equal(derived.attr('c4'), undefined, 'Removed property derived');
});

test('List - compact', function () {
	console.log('test: List - compact');
	var source = new can.List([0, 1, false, 2, '', 3]);

	var derived = source.deriveList(function (item, index) {
		return !! item;
	});

	derived.bind('change', can.noop);

	// Initial
	console.log(derived.attr()); //-> [1, 2, 3] 
	derived.each(function (item) {
		ok(item, 'Derived item is truthy');
	})
	equal(derived.attr('length'), 3, 'Correct number of items derived');

	// Push
	console.log('>>> Push');
	source.push('pushed');
	console.log(derived.attr()); //-> [1, 2, 3, "pushed"]
	equal(derived.attr(3), 'pushed', 'Pushed truthy derived at correct index');

	// Unshift
	console.log('>>> Unshift');
	source.unshift('unshifted');
	console.log(derived.attr()); //-> ["unshifted", 1, 2, 3, "pushed"]
	equal(derived.attr(0), 'unshifted', 'Unshifted truthy derived at correct index');

	// TODO: Remove
	// console.log('>>> Remove');
	// source.splice(2, 1);
	// console.log(derived.attr()); //-> ["unshifted", 1, 3, "pushed"]
	// equal(derived.attr(2), 3, 'Spliced value removed');
});

});
