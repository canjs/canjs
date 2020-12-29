var QUnit = require("steal-qunit");

var set = require('../compat'),
	props = set.props;

QUnit.module("can-set props.limitOffset");

QUnit.test('offsetLimit set.equal', function(assert) {

	/*
	 * X = [A0, ..., An]
	 * Y = [A0, ..., An]
	 */
	assert.ok(
		set.isEqual(
			{offset: 0, limit: 99},
			{offset: 0, limit: 99},
			props.offsetLimit("offset", "limit")),
		"they are equal" );

	/*
	 * X = [A0, ..., An]
	 * Y = [A0, ..., A(n+1)]
	 */
	assert.ok(
		!set.isEqual(
			{offset: 0, limit: 100},
			{offset: 0, limit: 101},
			props.offsetLimit("offset", "limit")),
		"they are not equal" );

	/*
	 * X = [A0, ..., An]
	 * Y = [A1, ..., An]
	 */
	assert.ok(
		!set.isEqual(
			{offset: 0, limit: 100},
			{offset: 1, limit: 100},
			props.offsetLimit("offset", "limit")),
		"they are not equal" );
});




QUnit.test('offsetLimit set.union', function(assert) {
	var prop = props.offsetLimit('offset', 'limit'), res;


	/*
	 * X = [A0, ..., A99]
	 * Y = [A50, ..., A101]
	 *
	 * X U Y = [A0, ..., A101]
	 */
	 res = set.union({ offset: 0, limit: 100 }, { offset: 50, limit: 52 }, prop);
	 assert.deepEqual(res, { offset: 0, limit: 102 }, "got a union");

	/*
	 * X = universal set
	 * Y = [A0, ..., A10]
	 *
	 * X U Y = X
	 */
	res = set.union({}, { offset: 0, limit: 10 }, prop);
	assert.deepEqual(res, {}, "universal set");

	/*
	 * X = [A100, ..., A199]
	 * Y = [A200, ..., A299]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = set.union({offset: 100, limit: 100}, {offset: 200, limit: 100}, prop);
	assert.deepEqual(res, {offset:100, limit:200}, "no intersection");

	/*
	 * X = [A200, ..., A299]
	 * Y = [A100, ..., A199]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = set.union({offset: 200, limit: 100}, {offset: 100, limit: 100}, prop);
	assert.deepEqual(res, {offset:100, limit:200}, "no intersection with either argument order");



	/*
	 * X = [A200, ..., A299]
	 * Y = [A100, ..., A209]
	 *
	 * X U Y = [A100, ..., A299]
	 */
	res = set.union({offset: 100, limit: 110}, {offset: 200, limit: 100}, prop);
	assert.deepEqual(res, {offset:100, limit:200}, "sets can intersect with either argument order");


});



QUnit.test('rangeInclusive set.count', function(assert) {
	var prop = props.offsetLimit('offset', 'limit');

	/*
	 * X = [A0, ..., A99]
	 * |X| = 100
	 */
	var res = set.count({ offset: 0, limit: 100 }, prop);
	assert.equal(res, 100, "count is right");
});

QUnit.test('rangeInclusive set.intersection', function(assert) {
	var prop = props.offsetLimit('offset', 'limit');

	/*
	 * X = [A0, A99]
	 * Y = [A50, A101]
	 *
	 * X ∩ Y = [A50, A99]
	 */
	var res = set.intersection({ offset: 0, limit: 100 }, { offset: 50, limit: 52 }, prop);
	assert.deepEqual(res, { offset: 50, limit: 50 }, "got a intersection");
});
