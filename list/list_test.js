steal("can/util", "can/list", "can/test", "can/compute", "can/view/mustache", function(){
	
	module('can/list');
	
	test('list attr changes length', function () {
		var l = new can.List([
			0,
			1,
			2
		]);
		l.attr(3, 3);
		equal(l.length, 4);
	});
	test('removeAttr on list', function() {
		var l = new can.List([0, 1, 2]);
		l.removeAttr(1);
		equal(l.attr('length'), 2);
		deepEqual(l.attr(), [0, 2]);
	});
	test('list splice', function () {
		var l = new can.List([
			0,
			1,
			2,
			3
		]),
			first = true;
		l.bind('change', function (ev, attr, how, newVals, oldVals) {
			equal(attr, '1');
			if (first) {
				equal(how, 'remove', 'removing items');
				equal(newVals, undefined, 'no new Vals');
			} else {
				deepEqual(newVals, [
					'a',
					'b'
				], 'got the right newVals');
				equal(how, 'add', 'adding items');
			}
			first = false;
		});
		l.splice(1, 2, 'a', 'b');
		deepEqual(l.serialize(), [
			0,
			'a',
			'b',
			3
		], 'serialized');
	});
	test('list pop', function () {
		var l = new can.List([
			0,
			1,
			2,
			3
		]);
		l.bind('change', function (ev, attr, how, newVals, oldVals) {
			equal(attr, '3');
			equal(how, 'remove');
			equal(newVals, undefined);
			deepEqual(oldVals, [3]);
		});
		l.pop();
		deepEqual(l.serialize(), [
			0,
			1,
			2
		]);
	});
	test('remove nested property in item of array map', function () {
		var state = new can.List([{
			nested: true
		}]);
		state.bind('change', function (ev, attr, how, newVal, old) {
			equal(attr, '0.nested');
			equal(how, 'remove');
			deepEqual(old, true);
		});
		state.removeAttr('0.nested');
		equal(undefined, state.attr('0.nested'));
	});
	test('pop unbinds', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0),
			count = 0;
		l.bind('change', function (ev, attr, how, newVal, oldVal) {
			count++;
			if (count === 1) {
				equal(attr, '0.foo', 'count is set');
			} else if (count === 2) {
				equal(how, 'remove');
				equal(attr, '0');
			} else {
				ok(false, 'called too many times');
			}
		});
		equal(o.attr('foo'), 'bar');
		o.attr('foo', 'car');
		l.pop();
		o.attr('foo', 'bad');
	});
	test('splice unbinds', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0),
			count = 0;
		l.bind('change', function (ev, attr, how, newVal, oldVal) {
			count++;
			if (count === 1) {
				equal(attr, '0.foo', 'count is set');
			} else if (count === 2) {
				equal(how, 'remove');
				equal(attr, '0');
			} else {
				ok(false, 'called too many times');
			}
		});
		equal(o.attr('foo'), 'bar');
		o.attr('foo', 'car');
		l.splice(0, 1);
		o.attr('foo', 'bad');
	});
	test('always gets right attr even after moving array items', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0);
		l.unshift('A new Value');
		l.bind('change', function (ev, attr, how) {
			equal(attr, '1.foo');
		});
		o.attr('foo', 'led you');
	});
	test('Array accessor methods', 11, function () {
		var l = new can.List([
			'a',
			'b',
			'c'
		]),
			sliced = l.slice(2),
			joined = l.join(' | '),
			concatenated = l.concat([
				2,
				1
			], new can.List([0]));
		ok(sliced instanceof can.List, 'Slice is an Observable list');
		equal(sliced.length, 1, 'Sliced off two elements');
		equal(sliced[0], 'c', 'Single element as expected');
		equal(joined, 'a | b | c', 'Joined list properly');
		ok(concatenated instanceof can.List, 'Concatenated is an Observable list');
		deepEqual(concatenated.serialize(), [
			'a',
			'b',
			'c',
			2,
			1,
			0
		], 'List concatenated properly');
		l.forEach(function (letter, index) {
			ok(true, 'Iteration');
			if (index === 0) {
				equal(letter, 'a', 'First letter right');
			}
			if (index === 2) {
				equal(letter, 'c', 'Last letter right');
			}
		});
	});
	test('splice removes items in IE (#562)', function () {
		var l = new can.List(['a']);
		l.splice(0, 1);
		ok(!l.attr(0), 'all props are removed');
	});

	test('list sets up computed attributes (#790)', function() {
		var List = can.List.extend({
			i: can.compute(0),
			a: 0
		});

		var l = new List([1]);
		equal(l.attr('i'), 0);

		var Map = can.Map.extend({
			f: can.compute(0)
		});

		var m = new Map();
		m.attr('f');
	});

	test('reverse triggers add/remove events (#851)', function() {
		expect(6);
		var l = new can.List([1,2,3]);

		l.bind('change', function() { ok(true, 'change should be called'); });
		l.bind('set', function() { ok(false, 'set should not be called'); });
		l.bind('add', function() { ok(true, 'add called'); });
		l.bind('remove', function() { ok(true, 'remove called'); });
		l.bind('length', function() { ok(true, 'length should be called'); });

		l.reverse();
	});

	test('filter', function(){
		var l = new can.List([{id: 1, name: "John"}, {id: 2, name: "Mary"}]);

		var filtered = l.filter(function(item){
			return item.name === "Mary";
		});

		notEqual(filtered._cid, l._cid, "not same object");
		equal(filtered.length, 1, "one item");
		equal(filtered[0].name, "Mary", "filter works");
	});
	
	
	test('removing expandos on lists', function(){
		var list = new can.List(["a","b"]);
		
		list.removeAttr("foo");
		
		equal(list.length, 2);
	});
	
	test('sort', function() {
		var list = new can.List([2,1,3,0]);
		var frag = can.view.mustache('<div>{{#list}}{{.}},{{/list}}</div>')({ list:list });
		frag = frag.querySelector('div');
		
		deepEqual( list.serialize(), [2,1,3,0], 'Found starting value' );
		equal( frag.innerHTML, '2,1,3,0,', 'Found starting value (live binding)' );
		
		list.sort();
		deepEqual( list.serialize(), [0,1,2,3], 'Found sorted value' );
		equal( frag.innerHTML, '0,1,2,3,', 'Found sorted value (live binding)' );
	});
	
	test('sort with sortFunction and comparator', function() {
		var list = new can.List([
			{ deep:{ value:2 } },
			{ deep:{ value:1 } },
			{ deep:{ value:3 } },
			{ deep:{ value:0 } }
		]);
		var frag = can.view.mustache('<div>{{#list}}{{deep.value}},{{/list}}</div>')({ list:list });
		frag = frag.querySelector('div');
		
		deepEqual( list.serialize(), [{deep:{value:2}},{deep:{value:1}},{deep:{value:3}},{deep:{value:0}}], 'Found starting value' );
		equal( frag.innerHTML, '2,1,3,0,', 'Found starting value (live binding)' );
		
		list.sort(function(a, b) {
			a = a.deep.value;
			b = b.deep.value;
			return a === b ? 0 : a > b ? -1 : 1;
		});
		deepEqual( list.serialize(), [{deep:{value:3}},{deep:{value:2}},{deep:{value:1}},{deep:{value:0}}], 'Found sortFunction value' );
		equal( frag.innerHTML, '3,2,1,0,', 'Found sortFunction value (live binding)' );
		
		list.sort('deep.value');
		deepEqual( list.serialize(), [{deep:{value:0}},{deep:{value:1}},{deep:{value:2}},{deep:{value:3}}], 'Found comparator value' );
		equal( frag.innerHTML, '0,1,2,3,', 'Found comparator value (live binding)' );
	});
	
	test('sort with config', function() {
		var list = new can.List([
			{ deep:{ label:"Hi",    value:1 } },
			{ deep:{ label:"Yo",    value:2 } },
			{ deep:{ label:"Hey",   value:2 } },
			{ deep:{ label:"Hello", value:1 } }
		]);
		var frag = can.view.mustache('<div>{{#list}}{{deep.label}}[{{deep.value}}],{{/list}}</div>')({ list:list });
		frag = frag.querySelector('div');
		
		list.sort({
			comparators: ["deep.value", "deep.label"],
			order: "descending"
		});
		
		var expected = [
			{ deep:{ label:"Yo",    value:2 } },
			{ deep:{ label:"Hey",   value:2 } },
			{ deep:{ label:"Hi",    value:1 } },
			{ deep:{ label:"Hello", value:1 } }
		];
		
		deepEqual( list.serialize(), expected, 'Found config value' );
		equal( frag.innerHTML, 'Yo[2],Hey[2],Hi[1],Hello[1],', 'Found config value (live binding)' );
	});
	
});
