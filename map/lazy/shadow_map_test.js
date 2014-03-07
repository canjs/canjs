steal("can/map/lazy/shadow_map.js", "can/compute", "can/test", function (ShadowMap) {
	function makeObserve (child) {
		if (child instanceof can.Map) {
			// We have an `observe` already...
			// Make sure it is not listening to this already
			// It's only listening if it has bindings already.
			if (this._bindings) {
				can.Map.helpers.unhookup([child], this._cid);
			}
		} else if (can.isArray(child)) {
			// else if array create LazyList
			child = new can.List(child);
		} else if (can.Map.helpers.canMakeObserve(child)) {
			// or try to make LazyMap
			child = new can.Map(child);
		}
		return child;
	}

	module('can/map/lazy/shadow_map');

	test('Initialize ShadowMap', 4, function() {
		var data = {
			some: {
				nested: 'property',
				deeper: {
					person: new can.Map({ name: { first: 'David', last: 'Luecke' } })
				},
				array: [{ name: 'First' }, new can.Map({ name: 'Second' })]
			}
		};
		var ref = new ShadowMap(data, new can.Map({})).hookup();

		ref.hookup();

		ok(ref._shadowed.some.deeper.person, 'Person map tracked');
		ok(can.isArray(ref._shadowed.some.array), 'Array tracked');
		equal(ref._shadowed.some.array.length, 2, 'Array has correct length');
		ok(ref._shadowed.some.array[1], 'Map in array tracked');
	});

	test('ShadowMap.prototype.get and walking into nested maps', function() {
		var ref = new ShadowMap({
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

	test('ShadowMap.prototype.walk', function() {
		var person = new can.Map({ name: { first: 'David', last: 'Luecke' } });
		var data = {
			some: {
				nested: 'property',
				deeper: {
					person: person
				}
			}
		};
		var ref = new ShadowMap(data, new can.Map({})).hookup();

		deepEqual(ref.walk('some.nested'), { remaining: [], shadow: undefined, data: 'property' },
			'Walked into simple property');
		deepEqual(ref.walk('some.deeper.person.name.first'), {
			remaining: ['name', 'first'],
			shadow: person,
			data: 'David'
		});
	});

	test('ShadowMap.prototype.getParent', function() {
		var data = {
			some: {
				nested: { other: 'property' },
				deeper: {
					person: new can.Map({ name: { first: 'David', last: 'Luecke' } })
				}
			}
		};
		var ref = new ShadowMap(data, new can.Map({})).hookup();

		equal(ref.getParent('some'), data, 'Direct property returns root object');
		equal(ref.getParent('some.nested.other'), data.some.nested, 'Simple nested property returns expected object');
		equal(ref.getParent('some.deeper.person.name.first'), data.some.deeper.person.attr('name'),
			'Returns correct parent within another map');
	});

	test('ShadowMap sets up bubbling for existing observes, unhookup unbinds.', 6, function() {
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
		var ref;

		root.bind('change', function(ev, prop, how, newVal) {
			ok(true, 'Change event got fired');
			equal(prop, 'some.deeper.person.name.first', 'Got nested property');
			equal(newVal, 'Dave');
		});

		ok(!person._bindings, 'Nothing bound to person');
		ref = new ShadowMap(data, root).hookup();

		person.attr('name.first', 'Dave');
		equal(person._bindings, 1, 'Bound to person');
		ref.unhookup();
		ok(!person._bindings, 'Nothing bound to person anymore');
	});

	test('ShadowMap.prototype.removeChildren also updates arrays', 6, function() {
		var person = new can.Map({ name: { first: 'David', last: 'Luecke' } });
		var third = new can.Map({ name: 'third' });
		var fourth = new can.Map({ name: 'fourth' });
		var data = {
			some: {
				nested: { other: 'property' },
				deeper: {
					person: person
				},
				array: ['first', 'second', third, fourth]
			}
		};
		var root = new can.Map({});
		var ref = new ShadowMap(data, root);

		root.bind('changed', function() {});

		ref.hookup();

		ok(person._bindings, 'Person has bindings');

		ref.removeAttr('some.deeper');

		ok(!data.some.deeper, 'data got updated');
		ok(!person._bindings, 'Bindings on person got removed');
		equal(ref._shadowed.some.array[2], third, 'Item tracked in array');
		equal(ref._shadowed.some.array[3], fourth, 'Item tracked in array');

		ref.removeAttr('some.array.2');
		equal(ref._shadowed.some.array[2], fourth, 'Array location updated');
	});

	test('ShadowMap.prototype.replace', function() {
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
		var ref = new ShadowMap(data, root).hookup();

		root.makeObserve = makeObserve;

		ref.replace('some.nested');
		ok(ref._shadowed.some.nested instanceof can.Map, 'Nested property converted to map');

		equal(ref.replace('some.deeper.person.name'), person, 'Got person when trying to replace existing shadow');
	});

	test('ShadowMap.prototype.set', function() {
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
		var ref = new ShadowMap(data, root).hookup();

		root.makeObserve = makeObserve;

		ref.set('some.deeper.person.name.first', 'Dave');
		equal(ref.get('some.deeper.person.name.first'), 'Dave', 'Primitive property got updated');
		equal(person.attr('name.first'), 'Dave', 'Name updated in map');

		ref.set('some.nested.other', 'newproperty');
		ok(ref._shadowed.some.nested instanceof can.Map, 'Parent of simple property converted to map');
		equal(ref._shadowed.some.nested.attr('other'), 'newproperty', 'Newproperty set in converted map');
	});
});
