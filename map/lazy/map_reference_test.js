steal("can/map/lazy/map_reference.js", "can/compute", "can/test", function (MapReference) {

	module('can/map/lazy/reference');

	test('Initialize MapReference', function() {
		var ref = new MapReference({
			some: {
				nested: 'property',
				deeper: {
					person: new can.Map({ name: { first: 'David', last: 'Luecke' } })
				},
				array: [{ name: 'First' }, new can.Map({ name: 'Second' })]
			}
		}, new can.Map({})).hookup();

		ref.hookup();

		ok(ref._references['some.deeper.person'], 'Person map tracked');
		ok(ref._references['some.array.1'], 'Map in array tracked');
	});

	test('MapReference.prototype.get and walking into nested maps', function() {
		var ref = new MapReference({
			some: {
				nested: 'property',
				deeper: {
					person: new can.Map({ name: { first: 'David', last: 'Luecke' } })
				}
			}
		}, new can.Map({})).hookup();

		equal(ref.get('some.nested'), 'property', 'Got nested property with plain object');
		equal(ref.get('some.deeper.person.name.first'), 'David', 'Got nested reference and uses map for sub-properties');
	});

	test('MapReference.prototype.getParent', function() {
		var data = {
			some: {
				nested: { other: 'property' },
				deeper: {
					person: new can.Map({ name: { first: 'David', last: 'Luecke' } })
				}
			}
		};
		var ref = new MapReference(data, new can.Map({})).hookup();

		equal(ref.getParent('some'), data, 'Direct property returns root object');
		equal(ref.getParent('some.nested.other'), data.some.nested, 'Simple nested property returns expected object');
		equal(ref.getParent('some.deeper.person.name.first'), data.some.deeper.person.attr('name'),
			'Returns correct parent within another map');
	});

	test('MapReference.prototype.replace', function() {
		var data = {
			some: {
				nested: { other: 'property' },
				deeper: {
					person: { name: { first: 'David', last: 'Luecke' } }
				}
			}
		};
		var ref = new MapReference(data, new can.Map({})).hookup();
		var converter = function(obj) {
			return new can.Map(can.extend({ converted: true }, obj));
		};

		ref.replace('some.deeper.person', converter);
		ok(ref._references['some.deeper.person'], 'New reference got added');
		ok(ref._data.some.deeper.person instanceof can.Map, 'Person converted to a map');
		ok(ref._data.some.deeper.person.attr('converted'), 'Converter added property');

		ref.replace('some.nested.other', converter);
		ok(ref._references['some.nested'], 'Trying to convert a primitive value walked up to its parent');
		equal(ref._data.some.nested.attr('other'), 'property', 'Map created with property');
		ok(ref._data.some.nested.attr('converted'), 'Converter ran and set property');
	});

	test('MapReference sets up bubbling for existing observes, removeChildren works and returns data', 8, function() {
		var person = new can.Map({ name: { first: 'David', last: 'Luecke' } });
		var data = {
			some: {
				nested: { other: 'property' },
				deeper: {
					person: person
				}
			}
		};
		var root = new can.Map({});
		var deeper = data.some.deeper;
		var ref;

		root.bind('change', function(ev, prop, how, newVal) {
			ok(true, 'Change event got fired');
			equal(prop, 'some.deeper.person.name.first', 'Got nested property');
			equal(newVal, 'Dave');
		});

		ok(!person._bindings, 'Nothing bound to person');
		ref = new MapReference(data, root).hookup();

		person.attr('name.first', 'Dave');
		equal(person._bindings, 1, 'Bound to person');
		deepEqual(ref.removeChildren('some.deeper'), { path: ['some', 'deeper'], value: deeper, parent: data.some, prop: 'deeper' });
		equal(person._bindings, 0, 'Bindings got removed due to .removeChildren');
		ok(!ref._data.some.deeper, 'Property got removed from data');
	});

	test('MapReference.prototype.removeChildren updates references in arrays', 5, function() {
		var data = {
			nested: {
				other: { prop: new can.Map({ something: 'new' })},
				array: [ 'first', 'second', new can.Map({ name: 'third' }) ]
			}
		};
		var root = new can.Map({});
		var ref = new MapReference(data, root).hookup();

		ok(ref._references['nested.array.2'], 'Nested reference exists');
		ok(ref._references['nested.other.prop'], 'Map reference exists');

		ref.removeChildren('nested.array.1');
		ok(!ref._references['nested.array.2'], 'Old nested reference in array got removed');
		ok(ref._references['nested.array.1'], 'Index for nested reference got updated');
		ok(ref._references['nested.other.prop'], 'Map reference still exists');
	});

	test('converted properties get hooked up', 6, function() {
		var data = {
			some: {
				nested: { other: 'property' }
			}
		};
		var root = new can.Map({});
		var ref = new MapReference(data, root).hookup();

		root.bind('change', function(ev, prop, how, newVal, oldVal) {
			equal(prop, 'some.nested.other', 'Got correct property');
			equal(how, 'set', 'Property set');
			equal(newVal, 'myprop', 'Got new property');
			equal(oldVal, 'property', 'Got old property');
		});

		ref.replace('some.nested', function(obj) {
			return new can.Map(obj);
		});

		ok(ref._data.some.nested instanceof can.Map, 'some.nested converted to a map');
		equal(ref._data.some.nested._bindings, 1, 'Bubbling hooked up');
		ref._data.some.nested.attr('other', 'myprop');
	});

	test('.closest returns closest nested map and remaining path', function() {
		var data = {
			test: new can.Map({ testing: true }),
			some: {
				nested: 'property',
				deeper: {
					person: new can.Map({ name: { first: 'David', last: 'Luecke' } })
				},
				array: [{ name: 'First' }, new can.Map({ name: 'Second' })]
			}
		};
		var ref = new MapReference(data, new can.Map({})).hookup();

		var closest = ref.closest('test.testing');
		deepEqual(closest, { map: data.test, remaining: ['testing'] });

		closest = ref.closest('some.deeper.person');
		deepEqual(closest, { map: data.some.deeper.person, remaining: [] });


	});
});
