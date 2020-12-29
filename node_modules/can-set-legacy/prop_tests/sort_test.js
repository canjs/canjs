var QUnit = require("steal-qunit");

var set = require('../can-set-legacy'),
	props = set.props;

var canReflect = require("can-reflect");

QUnit.module("can-set-legacy props.sort");

QUnit.test('set.difference', function(assert) {
	var prop = props.sort('sort'), res;

	res = set.difference({sort: "foo"}, { completed: true }, prop);
	assert.deepEqual(res, set.UNDEFINABLE /*{sort: "foo", completed: {$ne: true}}*/, "diff should be true");

	res = set.difference({ completed: true }, { completed: true, sort: "foo" }, prop);
	assert.equal(res, set.EMPTY, "the same except for sort");


	res = set.difference({ completed: true }, { sort: "foo"}, prop);
	assert.equal(res, set.EMPTY, "nothing in completed:true that isn't in everything");

	res = set.difference({ completed: true }, { foo: 'bar', sort: "foo" }, prop);
	assert.equal(res, set.UNDEFINABLE, "we can diff, it exists, we don't know what it is though");
});


QUnit.test('set.union', function(assert) {
	var prop = props.sort('sort'),
		res;
	// set / subset
	res = set.union({sort: "name"}, { completed: true }, prop);
	assert.deepEqual(res , {}, "set / subset sort left");

	res = set.union({}, { completed: true, sort: "name" }, prop);
	assert.deepEqual(res , {}, "set / subset sort right");

	res = set.union({ sort: "name" }, { completed: true, sort: "namer" }, prop);
	assert.deepEqual(res , {}, "set / subset both sorts");

	res = set.union({ completed: true }, {sort: "foo"}, prop);
	assert.deepEqual(res , {}, "subset / set");

	res = set.union({foo: "bar", sort: "foo"},{foo: "bar"}, prop);
	assert.deepEqual(res, {foo: "bar"}, "equal");

	res = set.union({foo: "bar"},{foo: "zed", sort: "foo"}, prop);
	assert.deepEqual(res, {foo: ["bar","zed"]}, "values not equal");

	res = set.union({foo: "bar", sort: "foo"},{name: "A"}, prop);
	assert.deepEqual(res, set.UNDEFINABLE, "values not equal");
});

QUnit.test('set.union Array', function(assert) {
	var prop = props.sort('sort');
	var res = set.union({foo: ["a","b"], sort: "foo"}, { foo: ["a","c"] },
		prop);

	assert.deepEqual(res , {foo: ["a","b","c"]}, "set / subset");
});

QUnit.test('set.count', function(assert) {
	assert.ok( set.count({ sort: 'name' }) === Infinity, "defaults to infinity");
	assert.ok( set.count({foo: "bar", sort: "foo"},{}) === Infinity, "defaults to infinity");

});

QUnit.test('set.intersection', function(assert) {

	var prop = props.sort('sort'), res;

	res = set.intersection({} , { sort: 'name' }, prop);
	assert.deepEqual(res, {}, "no sort if only one is sorted");

	res = set.intersection({ sort: 'name' } , { sort: 'name' }, prop);
	assert.deepEqual(res, {sort: 'name'}, "equal");

	res = set.intersection({type: 'new'} , { sort: 'name', userId: 5 }, prop);
	assert.deepEqual(res, {type: 'new', userId: 5 }, "");

	res = set.intersection({type: 'new', sort: "age"} , { sort: 'name', userId: 5 }, prop);
	assert.deepEqual(res, {type: 'new', userId: 5 }, "");
});

QUnit.test('set.intersection Array', function(assert) {
	var prop = props.sort('sort');
	var res = set.intersection({foo: ["a","b"], sort: 'foo'},
		{ foo: ["a","c"] }, prop);

	assert.deepEqual(res , {foo: "a"}, "intersection");
});

QUnit.test('set.isSubset', function(assert) {

	var algebra = new set.Algebra(props.sort('sort'),
		set.props.ignore("foo"),
		set.props.ignore("bar"),
		set.props.ignore("kind"),
		set.props.ignore("count")
	);

	assert.ok( algebra.isSubset(
		{ type : 'FOLDER', sort: "thing" },
		{ type : 'FOLDER' } ), 'equal sets with sort on the left');

	assert.ok( algebra.isSubset(
		{ type : 'FOLDER' },
		{ type : 'FOLDER', sort: "thing" } ), 'equal sets with sort on the right');

	assert.ok( algebra.isSubset(
		{ type : 'FOLDER', parentId : 5, sort: 'thing' },
		{ type : 'FOLDER'} ), 'sub set with sort on the left');

	assert.ok( algebra.isSubset(
		{ type : 'FOLDER', parentId : 5 },
		{ type : 'FOLDER', sort: 'thing'} ), 'sub set with sort on the right');

	assert.ok(!algebra.isSubset(
		{ type: 'FOLDER', sort: 'thing' },
		{ type: 'FOLDER', parentId: 5 }), 'wrong way with sort on the left');

	assert.ok(!algebra.isSubset(
		{ type: 'FOLDER' },
		{ type: 'FOLDER', parentId: 5, sort: 'thing' }), 'wrong way with sort on the right');

	assert.ok(!algebra.isSubset(
		{ type: 'FOLDER', parentId: 7, sort: 'thing' },
		{ type: 'FOLDER', parentId: 5 }), 'different values with sort on the left');

	assert.ok(!algebra.isSubset(
		{ type: 'FOLDER', parentId: 7 },
		{ type: 'FOLDER', parentId: 5, sort: 'thing' }), 'different values with sort on the right');

});

QUnit.test('set.isSubset with range', function(assert) {
	var algebra = new set.Algebra(props.sort('sort'),props.rangeInclusive('start','end'));

	// add sort .. same .. different
	// add range .. same ... more ... less
	// same
	// right
	// left
	var addSort = function(set, value){
		set.sort = value;
	};

	var sort = {
		left: function(setA, setB) {
			addSort(setA, "prop");
		},
		right: function(setA, setB) {
			addSort(setB, "prop");
		},
		same: function(setA, setB) {
			addSort(setA, "prop");
			addSort(setB, "prop");
		},
		different: function(setA, setB) {
			addSort(setA, "propA");
			addSort(setB, "propB");
		}
	};
	var addRange = function(set, start, end) {
		set.start = start;
		set.end = end;
	};

	var range = {
		left: function(setA,setB){
			addRange(setA, 0,9);
		},
		right: function(setA,setB){
			addRange(setB, 0,9);
		},
		same: function(setA,setB){
			addRange(setA, 0,9);
			addRange(setB, 0,9);
		},
		superLeft: function(setA,setB){
			addRange(setA, 0,9);
			addRange(setB, 3,7);
		},
		superRight: function(setA,setB){
			addRange(setB, 0,9);
			addRange(setA, 3,7);
		}
	};

	var sets = {
		same: function(setA, setB){ },
		superLeft: function(setA, setB){
			setB.type = "apples";
		},
		superRight: function(setA, setB){
			setA.type = "apples";
		}
	};


	var make = function(){
		var setA = {},
			setB = {};
		canReflect.eachIndex(arguments, function(method){
			method(setA, setB);
		});
		return {left: setA, right: setB};
	};
	var assertSubset = function(methods, result){
		var sets = make.apply(null, methods);
		assert.equal( algebra.isSubset(sets.left, sets.right), result, JSON.stringify(sets.left)+" ⊂ "+JSON.stringify(sets.right)+" = "+result );
	};

	//assertSubset([sets.superRight, range.right, sort.right], false);
	assertSubset([sets.same, range.same, sort.different], undefined);
	//assertSubset([sets.same, range.same, sort.same], true);

	//assertSubset([sets.same, range.superRight, sort.left], false);
	//assertSubset([sets.same, range.superRight, sort.same], true);
});

QUnit.test("set.index", function(assert) {
	var algebra = new set.Algebra(props.sort('sort'));

	var index = algebra.index(
		{sort: "name"},
		[{id: 1, name:"g"}, {id: 2, name:"j"}, {id: 3, name:"m"}, {id: 4, name:"s"}],
		{name: "k"});
	assert.equal(index, 2);
});


QUnit.test("set.filterMembers (#14)", function(assert) {
	var algebra = new set.Algebra(props.sort('sort'));
	var subset = algebra.filterMembers({sort: "name"},{},[{id: 1, name:"s"}, {id: 2, name:"j"}, {id: 3, name:"m"}, {id: 4, name:"g"}]);
	assert.deepEqual(subset, [ {id: 4, name:"g"},{id: 2, name:"j"}, {id: 3, name:"m"},{id: 1, name:"s"}]);
});


QUnit.test("set.unionMembers", function(assert) {
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.boolean('complete')
	);

	// a,b,aItems, bItems
	var union = algebra.unionMembers(
		{sort: "name", complete: true},
		{sort: "name", complete: false},
		[{id: 4, name:"g", complete: true}, {id: 3, name:"m", complete: true}],
		[{id: 2, name:"j", complete: false},{id: 1, name:"s", complete: false} ]);

	assert.deepEqual(union, [
		{id: 4, name:"g", complete: true},
		{id: 2, name:"j", complete: false},
		{id: 3, name:"m", complete: true},
		{id: 1, name:"s",complete: false}]);
});

QUnit.test("set.union keeps sort", function(assert) {
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.boolean('complete')
	);

	var union = algebra.union(
		{sort: "name", complete: true},
		{sort: "name", complete: false});

	assert.deepEqual(union, {sort: "name"});
});

QUnit.test("paginated and sorted is subset (#17)", function(assert) {
	var algebra = new set.Algebra(
		props.sort('sort'),
		props.rangeInclusive('start','end')
	), res;

	// res = algebra.isSubset({start: 0, end: 100, sort: "name"},{start: 0, end: 100, sort: "name"});
	// equal(res, true, "parent:paginate+order child:paginate+order (same set)");

	res = algebra.isSubset({start: 0, end: 100, sort: "name"},{start: 0, end: 100, sort: "age"});
	assert.equal(res, undefined, "parent:paginate+order child:paginate+order (different order)");

	// REMOVE FROM THE parent
	// parent:order
	res = algebra.isSubset({start: 0, end: 100, sort: "name"},{sort: "name"});
	assert.equal(res, true, "parent:order child:paginate+order");

	res = algebra.isSubset({sort: "name"},{sort: "name"});
	assert.equal(res, true, "parent:order child:order (same)");
	res = algebra.isSubset({sort: "name"},{sort: "age"});
	assert.equal(res, true, "parent:order child:order (different)");

	res = algebra.isSubset({start: 0, end: 100},{sort: "name"});
	assert.equal(res, true, "parent:order child:paginate");

	res = algebra.isSubset({start: 0, end: 100, sort: "age"},{sort: "name"});
	assert.equal(res, true, "parent:order child:paginate+order");

	// parent:paginate
	res = algebra.isSubset({start: 0, end: 100, sort: "name"},{start: 0, end: 100});
	assert.equal(res, undefined, "parent:paginate child:paginate+order");

	res = algebra.isSubset({sort: "name"},{start: 0, end: 100});
	assert.equal(res, false, "parent:paginate child:order (same)");


	res = algebra.isSubset({start: 0, end: 100, sort: "name"},{});
	assert.equal(res, true, "parent:-- child:paginate+order");



	res = algebra.isSubset({start: 10, end: 90, sort: "name"},{start: 0, end: 100, sort: "name"});
	assert.equal(res, true, "child in smaller range, same sort");

	res = algebra.isSubset({start: 10, end: 90, sort: "name"},{start: 0, end: 100, sort: "age"});
	assert.equal(res, undefined, "child in smaller range, but different sort");
});
