var BasicQuery = require("./basic-query");
var QUnit = require("steal-qunit");
var set = require("../set");
var assign = require("can-assign");
var canReflect = require("can-reflect");

QUnit.module("can-query-logic/types/basic-query sorting");

function legacyToQuery(set) {
    var copy = assign({}, set);

    var page = new BasicQuery.RecordRange(copy.start || 0, copy.end || Infinity);

    delete copy.start;
    delete copy.end;

    return new BasicQuery({
        page: page,
        filter: Object.keys(copy).length ? new BasicQuery.KeysAnd(copy) : set.UNIVERSAL
    });
}
function queryToLegacy(query) {
    var legacy = {};
    if(query.page) {
        if( set.isEqual( query.page, set.UNIVERSAL) ) {

        } else {
            legacy.start = query.page.start;
            legacy.end = query.page.end;
        }

    }
    return legacy;
}

function legacyIsEqual(setA, setB) {
    var qA = legacyToQuery(setA),
        qB = legacyToQuery(setB);
    return set.isEqual( qA , qB );
}

function legacyDifference(setA, setB) {
    var qA = legacyToQuery(setA),
        qB = legacyToQuery(setB);
    return queryToLegacy( set.difference( qA , qB ) );
}

function legacyIntersection(setA, setB) {
    var qA = legacyToQuery(setA),
        qB = legacyToQuery(setB);
    return queryToLegacy( set.intersection( qA , qB ) );
}

function legacyUnion(setA, setB) {
    var qA = legacyToQuery(setA),
        qB = legacyToQuery(setB);
    return queryToLegacy( set.union( qA , qB ) );
}

function legacySubset(setA, setB) {
    var qA = legacyToQuery(setA),
        qB = legacyToQuery(setB);
    return set.isSubset( qA , qB );
}

// =============================================
// The following tests are taken from can-setB
// =============================================

QUnit.test('rangeInclusive legacyDifference', function(assert) {
	/*
	 * X = [A0, ..., A99]
	 * Y = [A50, ..., A101]
	 *
	 * X / Y = [A0, ..., A49]
	 */
	var res = legacyDifference({ start: 0, end: 99 }, { start: 50, end: 101 });
	assert.deepEqual(res, { start: 0, end: 49 }, "got a diff");

	/*
	 * let:
	 *   i be the start of set Y
	 *   k be the end of set Y
	 *   0 be the first possible element in X (-infinity)
	 *   n be the last possible element in X (infinity)
	 *
	 * X => universal set
	 * Y = [Ai, ..., Ak]
	 *
	 * X / Y = [A0, ..., A(i-1), Ak, ..., An]
	 * 	more broadly
	 * X / Y = the set of all things not in Y
	 */
	res = legacyDifference({}, { start: 0, end: 10 });
	assert.deepEqual(res, {start: 11, end: Infinity}, 'universal set');

	/*
	 * X = [A0, ..., A49]
	 * Y = [A50, ..., A101]
	 *
	 * X / Y = X
	 */
	res = legacyDifference({ start: 0, end: 49 }, { start: 50, end: 101 });
	assert.deepEqual(res, { start: 0, end: 49 }, "side by side");

	/*
	 * X = [A0, ..., A49]
	 * Y = [A0, ..., A20]
	 *
	 * X / Y = [A21, ..., A49]
	 */
	res = legacyDifference({ start: 0, end: 49 }, { start: 0, end: 20 });
	assert.deepEqual(res, { start: 21, end: 49 }, "first set extends past second");

	/*
	 * X = [A0, ..., A49]
	 * Y = [A20, ..., A49]
	 *
	 * X / Y = [A0, ..., A19]
	 */
	res = legacyDifference({ start: 0, end: 49 }, { start: 20, end: 49 });
	assert.deepEqual(res, { start: 0, end: 19 }, "first set starts before second");
});

QUnit.test('rangeInclusive legacyIntersection', function(assert) {
	/*
	 * X = [A0, A99]
	 * Y = [A50, A101]
	 *
	 * X ∩ Y = [A50, A99]
	 */
	var res = legacyIntersection({ start: 0, end: 99 }, { start: 50, end: 101 });
	assert.deepEqual(res, { start: 50, end: 99 }, "got a intersection");
});

QUnit.test('rangeInclusive legacyIsEqual', function(assert) {

	/*
	 * X = [A0, ..., An]
	 * Y = [A0, ..., An]
	 */
	/*ok(
		legacyIsEqual(
			{start: 0, end: 100},
			{start: 0, end: 100}),
		"they are equal" );*/

	/*
	 * X = [A0, ..., An]
	 * Y = [A0, ..., A(n+1)]
	 */
	assert.ok(
		!legacyIsEqual(
			{start: 0, end: 100},
			{start: 0, end: 101}),
		"they are not equal" );

	/*
	 * X = [A0, ..., An]
	 * Y = [A1, ..., An]
	 */
	assert.ok(
		!legacyIsEqual(
			{start: 0, end: 100},
			{start: 1, end: 100}),
		"they are not equal" );
});

QUnit.test('rangeInclusive legacySubset', function(assert) {
	/*
	 * X = [A0, ..., An]
	 * Y = [A0, ..., An]
	 */
	assert.ok(
		legacySubset(
			{start: 0, end: 100},
			{start: 0, end: 100}),
		"self is a subset" );

	/*
	 * X = [A0, ..., An]
	 * Y = [A0, ..., A(n+1)]
	 */
	assert.ok(
		legacySubset(
			{start: 0, end: 100},
			{start: 0, end: 101}),
		"end extends past subset" );

	/*
	 * X = [A0, ..., An]
	 * Y = [A0, ..., A(n+1)]
	 */
	assert.equal(
		legacySubset(
			{start: 0, end: 101},
			{start: 0, end: 100}),false,
		"non-subset extends past end" );

	/*
	 * X = [A1, ..., An]
	 * Y = [A0, ..., An]
	 */
	assert.ok(
		legacySubset(
			{start: 1, end: 100},
			{start: 0, end: 100}),
		"start extends before subset" );

	/*
	 * X = [A1, ..., An]
	 * Y = [A0, ..., An]
	 */
	assert.ok(
		!legacySubset(
			{start: 0, end: 100},
			{start: 1, end: 100}),
		"non-subset extends before start" );
});


QUnit.test('rangeInclusive legacyUnion', function(assert) {
	/*
	 * X = [A0, ..., A99]
	 * Y = [A50, ..., A101]
	 *
	 * X U Y = [A0, ..., A101]
	 */
	//var res = legacyUnion({ start: 0, end: 99 }, { start: 50, end: 101 });
	//deepEqual(res, { start: 0, end: 101 }, "got a union");

	/*
	 * X = universal set
	 * Y = [A0, ..., A10]
	 *
	 * X U Y = X
	 */
	var res = legacyUnion({}, { start: 0, end: 10 });
	assert.deepEqual(res, {}, "universal set");
	/*
	 * X = [A100, ..., A199]
	 * Y = [A200, ..., A299]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = legacyUnion({start: 100, end: 199}, {start: 200, end: 299});
	assert.deepEqual(res, {start:100, end:299}, "no intersection");

	/*
	 * X = [A200, ..., A299]
	 * Y = [A100, ..., A199]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = legacyUnion({start: 200, end: 299}, {start: 100, end: 199});
	assert.deepEqual(res, {start:100, end:299}, "no intersection with either argument order");

	/*
	 * X = [A200, ..., A299]
	 * Y = [A100, ..., A209]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = legacyUnion({start: 200, end: 299}, {start: 100, end: 209});
	assert.deepEqual(res, {start:100, end:299}, "sets can intersect");

	/*
	 * X = [A200, ..., A299]
	 * Y = [A100, ..., A209]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = legacyUnion({start: 100, end: 209}, {start: 200, end: 299});
	assert.deepEqual(res, {start:100, end:299}, "sets can intersect with either argument order");

	/*
	 * X = [A100, ..., A299]
	 * Y = [A103, ..., A209]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = legacyUnion({start: 100, end: 299}, {start: 103, end: 209});
	assert.deepEqual(res, {start:100, end:299}, "first set contains second");

	/*
	 * X = [A103, ..., A209]
	 * Y = [A100, ..., A299]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = legacyUnion({start: 100, end: 299}, {start: 103, end: 209});
	assert.deepEqual(res, {start:100, end:299}, "second set contains first");

	/*
	 * X = [A100, ..., A299]
	 * Y = [A100, ..., A299]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = legacyUnion({start: 100, end: 299}, {start: 100, end: 299});
	assert.deepEqual(res, {start:100, end:299}, "union of identical sets is the same as those sets");
});



QUnit.test('rangeInclusive set.count', function(assert) {
	/*
	 * X = [A0, ..., A99]
	 * |X| = 100
	 */

    var query = new BasicQuery({
        page: new BasicQuery.RecordRange(0, 99),
        filter: set.UNIVERSAL
    });
    var res = query.count({ start: 0, end: 99 });
	assert.equal(res, 100, "count is right");
});


QUnit.test("index uses can-reflect", function(assert) {

    var query = new BasicQuery({
        sort: "name"
    });
    var obj1Read, obj2Read, itemKeyRead, itemOwnKeyRead;

    var obj1 = canReflect.assignSymbols({},{
            "can.getKeyValue": function(key){
                obj1Read = true;
                return ({id: 5, name: "x"})[key];
            }
        }),
        obj2 = canReflect.assignSymbols({},{
            "can.getKeyValue": function(key){
                obj2Read = true;
                return ({id: 7, name: "d"})[key];
            }
        }),
        item = canReflect.assignSymbols({},{
            "can.getKeyValue": function(key){
                itemKeyRead = true;
                return ({id: 1, name: "j"})[key];
            },
            "can.hasOwnKey": function(key) {
                itemOwnKeyRead = true;
                return key in ({id: 1, name: "j"});
            }
        });


    var res = query.index(item,[obj2, obj1]);
    assert.equal(res, 1, "inserted at 1");

    assert.deepEqual([obj1Read, obj2Read, itemKeyRead, itemOwnKeyRead],
        [true, true, true, true], "read everything");
});

QUnit.test(".index should work with literal objects", function(assert) {
	var query = new BasicQuery({
		sort: "name"
	});

	var items = [{id: 1, name: "Item 0"}, {id: 2, name: "Item 1"}];
	var res = query.index({id: 1, name: "Item 1"}, items);

	assert.equal(res, 1, "Item index at 1");
});
