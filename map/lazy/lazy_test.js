/* jshint asi:true*/
steal("can/map/lazy", "can/map/lazy/map-reference.js", "can/compute", "can/test", function (LazyMap, MapReference) {

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

	test('MapReference.prototype.get and Reference.prototype.getParent', function() {
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

	test('MapReference sets up bubbling for existing observes, removeChildren works', 7, function() {
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
		ref = new MapReference(data, root).hookup();

		person.attr('name.first', 'Dave');
		equal(person._bindings, 1, 'Bound to person');
		ref.removeChildren('some.deeper');
		equal(person._bindings, 0, 'Bindings got removed due to .removeChildren');
		ok(!ref._data.some.deeper, 'Property got removed from data');
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

	module("can/map/lazy");

	test("Basic Map", 4, function () {
		var state = new can.LazyMap({
			category: 5,
			productType: 4
		});

		state.bind("change", function (ev, attr, how, val, old) {
			equal(attr, "category", "correct change name")
			equal(how, "set")
			equal(val, 6, "correct")
			equal(old, 5, "correct")
		});

		state.attr("category", 6);

		state.unbind("change");
	});
//
//	test("Nested Map", 5, function () {
//		var me = new can.LazyMap({
//			name: {
//				first: "Justin",
//				last: "Meyer"
//			}
//		});
//
//		// TODO instanceof can.LazyMap
//		ok(me.attr("name") instanceof can.Map);
//
//		me.bind("change", function (ev, attr, how, val, old) {
//			equal(attr, "name.first", "correct change name")
//			equal(how, "set")
//			equal(val, "Brian", "correct")
//			equal(old, "Justin", "correct")
//		})
//
//		me.attr("name.first", "Brian");
//
//		me.unbind("change")
//
//	})
//
//	test("remove attr", function () {
//		var state = new can.LazyMap({
//			category: 5,
//			productType: 4
//		});
//		state.removeAttr("category");
//		deepEqual(can.LazyMap.keys(state), ["productType"], "one property");
//	});
//
//	test("nested event handlers are not run by changing the parent property (#280)", function () {
//
//		var person = new can.LazyMap({
//			name: {
//				first: "Justin"
//			}
//		})
//		person.bind("name.first", function (ev, newName) {
//			ok(false, "name.first should never be called")
//			//equal(newName, "hank", "name.first handler called back with correct new name")
//		});
//		person.bind("name", function () {
//			ok(true, "name event triggered")
//		})
//
//		person.attr("name", {
//			first: "Hank"
//		});
//
//	});
//
//	test("cyclical objects (#521)", function () {
//
//		var foo = {};
//		foo.foo = foo;
//
//		var fooed = new can.LazyMap(foo);
//
//		ok(true, "did not cause infinate recursion");
//
//		ok(fooed.attr('foo') === fooed, "map points to itself")
//
//		var me = {
//			name: "Justin"
//		}
//		var references = {
//			husband: me,
//			friend: me
//		}
//		var ref = new can.LazyMap(references)
//
//		ok(ref.attr('husband') === ref.attr('friend'), "multiple properties point to the same thing")
//
//	})
//
//	test('Getting attribute that is a can.compute should return the compute and not the value of the compute (#530)', function () {
//		var compute = can.compute('before');
//		var map = new can.LazyMap({
//			time: compute
//		});
//
//		equal(map.time, compute, 'dot notation call of time is compute');
//		equal(map.attr('time'), compute, '.attr() call of time is compute');
//	})
//
//	test('_cid add to original object', function () {
//		var map = new can.LazyMap(),
//			obj = {
//				'name': 'thecountofzero'
//			};
//
//		map.attr('myObj', obj);
//		ok(!obj._cid, '_cid not added to original object');
//	})
//
//	test("can.each used with maps", function () {
//		can.each(new can.LazyMap({
//			foo: "bar"
//		}), function (val, attr) {
//
//			if (attr === "foo") {
//				equal(val, "bar")
//			} else {
//				ok(false, "no properties other should be called " + attr)
//			}
//
//		})
//	})
//
//	test("can.LazyMap serialize triggers reading (#626)", function () {
//		var old = can.__reading;
//
//		var attributesRead = [];
//		var readingTriggeredForKeys = false;
//
//		can.__reading = function (object, attribute) {
//			if (attribute === "__keys") {
//				readingTriggeredForKeys = true;
//			} else {
//				attributesRead.push(attribute);
//			}
//		};
//
//		var testMap = new can.LazyMap({
//			cats: "meow",
//			dogs: "bark"
//		});
//
//		testMap.serialize();
//
//
//
//		ok(can.inArray("cats", attributesRead ) !== -1 && can.inArray( "dogs", attributesRead ) !== -1, "map serialization triggered __reading on all attributes");
//		ok(readingTriggeredForKeys, "map serialization triggered __reading for __keys");
//
//		can.__reading = old;
//	})
//
//	test("Test top level attributes", 7, function () {
//		var test = new can.LazyMap({
//			'my.enable': false,
//			'my.item': true,
//			'my.count': 0,
//			'my.newCount': 1,
//			'my': {
//				'value': true,
//				'nested': {
//					'value': 100
//				}
//			}
//		});
//
//		equal(test.attr('my.value'), true, 'correct');
//		equal(test.attr('my.nested.value'), 100, 'correct');
//		// TODO instanceof can.LazyMap
//		ok(test.attr("my.nested") instanceof can.Map);
//
//		equal(test.attr('my.enable'), false, 'falsey (false) value accessed correctly');
//		equal(test.attr('my.item'), true, 'truthey (true) value accessed correctly');
//		equal(test.attr('my.count'), 0, 'falsey (0) value accessed correctly');
//		equal(test.attr('my.newCount'), 1, 'falsey (1) value accessed correctly');
//	});


});
