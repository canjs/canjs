var BasicQuery = require("./basic-query");
var QUnit = require("steal-qunit");

QUnit.module("can-query-logic/types/basic-query filterFrom");


var getId = function(d){ return d.id; };
var items = [
	{ id: 0, note: 'C', type: 'eh' },
	{ id: 1, note: 'D', type: 'critical' },
	{ id: 2, note: 'E', type: 'critical' },
	{ id: 3, note: 'F', type: 'eh' },
	{ id: 4, note: 'G', type: 'critical' },
	{ id: 5, note: 'A' },
	{ id: 6, note: 'B', type: 'critical' },
	{ id: 7, note: 'C', type: 'critical' }
];

QUnit.test("against non ranged set", function(assert) {
	/*
	 * 1. set b = {} evaluates to all available entities -- the univeral set
	 * 2. set a = { type: 'critical', start: 1, end: 3 } evaluates to entities
	 * 		in set b that have a type property of 'critical'
	 *		e.g. [
	 *			{ id: 1, type: 'critical' },
	 *			{ id: 2, type: 'critical' }, // index 1
	 *			{ id: 4, type: 'critical' }, // index 2
	 *			{ id: 6, type: 'critical' }, // index 3
	 *			{ id: 7, type: 'critical' }
	 *		]
	 * 3. set a is further reduced to the entities at indices 1 through 3
	 *		e.g. [
	 *			{ id: 2, type: 'critical' },
	 *			{ id: 4, type: 'critical' },
	 *			{ id: 6, type: 'critical' }
	 *		]
	 */
    var query = new BasicQuery({
        filter: new BasicQuery.KeysAnd({ type: 'critical'}),
        page: new BasicQuery.RecordRange(1,3)
    });
    var res = query.filterFrom(items);

	assert.deepEqual(res && res.map(getId), [2,4,6]);
});

QUnit.test("ordered ascending and paginated", function(assert) {
	/*
	 * 1. set b = {} evaluates to all available entities -- the univeral set
	 * 2. set a = { type: 'critical', sort: 'note ASC', start: 1, end: 3 }
	 * 		evaluates to entities in set b that have a type property of 'critical'
	 * 		sorted by the note property
	 *		e.g. [
	 *			{ id: 6, note: 'B', type: 'critical' },
	 *			{ id: 7, note: 'C', type: 'critical' }, // index 1
	 *			{ id: 1, note: 'D', type: 'critical' }, // index 2
	 *			{ id: 2, note: 'E', type: 'critical' }, // index 3
	 *			{ id: 4, note: 'G', type: 'critical' }
	 *		]
	 * 3. set a is further reduced to the entities at indices 1 through 3
	 *		e.g. [
	 *			{ id: 7, note: 'C', type: 'critical' },
	 *			{ id: 1, note: 'D', type: 'critical' },
	 *			{ id: 2, note: 'E', type: 'critical' },
	 *		]
	 */

    var query = new BasicQuery({
        filter: new BasicQuery.KeysAnd({ type: 'critical'}),
        page: new BasicQuery.RecordRange(1,3),
        sort: 'note'
    });
    var res = query.filterFrom(items);

 	assert.deepEqual(res && res.map(getId), [7,1,2]);
});

QUnit.test("ordered descending and paginated", function(assert) {
	/*
	 * 1. set b = {} evaluates to all available entities -- the univeral set
	 * 2. set a = { type: 'critical', sort: 'note DESC', start: 1, end: 3 }
	 * 		evaluates to entities in set b that have a type property of 'critical'
	 * 		sorted by the note property
	 *		e.g. [
	 *			{ id: 4, note: 'G', type: 'critical' },
	 *			{ id: 2, note: 'E', type: 'critical' }, // index 1
	 *			{ id: 1, note: 'D', type: 'critical' }, // index 2
	 *			{ id: 7, note: 'C', type: 'critical' }, // index 3
	 *			{ id: 6, note: 'B', type: 'critical' },
	 *		]
	 * 3. set a is further reduced to the entities at indices 1 through 3
	 */

    var query = new BasicQuery({
        filter: new BasicQuery.KeysAnd({ type: 'critical'}),
        page: new BasicQuery.RecordRange(1,3),
        sort: '-note'
    });
    var res = query.filterFrom(items);

    assert.deepEqual(res && res.map(getId), [2,1,7]);
});

QUnit.test("against paginated set", function(assert) {

    var query = new BasicQuery({
        filter: new BasicQuery.KeysAnd({ type: 'critical'}),
        page: new BasicQuery.RecordRange(21,23)
    });
    var fromQuery = new BasicQuery({
        filter: new BasicQuery.KeysAnd({ type: 'critical'}),
        page: new BasicQuery.RecordRange(20,27)
    });

    var res = query.filterFrom(items, fromQuery);

	assert.deepEqual(res && res.map(getId), [2,4,6]);
});

QUnit.test("returns undefined against incompatible set", function(assert) {
    var query = new BasicQuery({
        filter: new BasicQuery.KeysAnd({ note: 'C' })
    });
    var fromQuery = new BasicQuery({
        filter: new BasicQuery.KeysAnd({ type: 'critical' })
    });
	var res;
	try {
		res = query.filterFrom(items, fromQuery);
	} catch(e) {
		assert.ok(true, "throws an error");
	}
	assert.notOk(res, "did not throw an error");
});
