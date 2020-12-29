var QUnit = require("steal-qunit");

var set = require('../compat'),
	props = set.props;

QUnit.module("can-set compat props.enum");

QUnit.test('enum set.intersection', function(assert) {
	/*
	 * For a property p,
	 * x ∈ {} | x.p exists
	 */
	var prop = props["enum"]('type',['new','prep','deliver','delivered']);

	/*
   * x ∈ X ∀ x
   * y ∈ Y | y.type = 'new'
   *
   * (X ∩ Y) = Y
	 */
	var res = set.intersection({} , { type: 'new' }, prop);
	assert.deepEqual(res, {type: 'new' }, "single enum intersected with universal set is idempotent");

	/*
   * x ∈ X ∀ x
   * y ∈ Y | y.type = 'new' OR y.type = 'prep'
   *
   * (X ∩ Y) = Y
	 */
	res = set.intersection({} , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, {type: ['new','prep'] }, "array enum intersected with unversal set is idempotent");

	/*
   * x ∈ X | x.type = 'prep'
   * y ∈ Y | y.type = 'new' OR y.type = 'prep'
   *
   * z ∈ (X ∩ Y) | z.type = 'prep'
	 */
	res = set.intersection({type: ['prep'] } , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, {type: 'prep' }, "items v items intersection");


	/*
	 * x ∈ X | x.type exists
	 * y ∈ Y | y.type = 'new' OR y.type = 'prep'
	 *
	 * (X ∩ Y) = Y
	 */
	res = set.intersection({type: [] } , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, set.EMPTY, "empty v array intersection");

	/*
	 * x ∈ X | x.type = 'new'
	 * y ∈ Y ∀ y
	 *
	 * (X ∩ Y) = X
	 */
	res = set.intersection({ type: 'new' },{}, prop);
	assert.deepEqual(res, {type: 'new' }, "single v all");
});

QUnit.test('enum set.difference', function(assert) {
	var prop = props["enum"]('type',['new','prep','deliver','delivered']),
		res;
	/*
	 * x ∈ {} | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 */

	/*
	 * x ∈ {} | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 * y ∈ Y | y.type ∈ ['new']
	 *
	 * z ∈ ({} / Y) | z.type ∈ ['prep', 'deliver', 'delivered']
	 */
	res = set.difference({} , { type: 'new' }, prop);
	assert.deepEqual(res, {type: ['prep','deliver','delivered'] }, "difference from universal set");

	/*
	 * x ∈ {} | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 * y ∈ Y | y.type ∈ ['new', 'prep']
	 *
	 * z ∈ ({} / Y) | z.type = ['deliver', 'delivered']
	 */
	res = set.difference({} , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, {type: ['deliver','delivered'] }, "difference from universal set");

	/*
	 * x ∈ X | x.type ∈ ['prep']
	 * y ∈ Y | y.type ∈ ['new', 'prep']
	 *
	 * X / Y = ∅
	 */
	res = set.difference({type: ['prep'] } , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, set.EMPTY, "difference from a superset");

	/*
	 * {} = {type: []}
	 */
	res = set.difference({  } , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, {type: ['deliver','delivered'] }, "empty enum definition is same as universal set");

	/*
	 * x ∈ X | x.type ∈ ['prep']
	 * y ∈ {} | y.type exists
	 *
	 * X / {} = ∅
	 */
	res = set.difference({ type: 'new' },{}, prop);
	assert.deepEqual(res, set.EMPTY, "all");
});

QUnit.test('enum set.union', function(assert) {
	var prop = props["enum"]('type',['new','prep','deliver','delivered']);
	/*
	 * x ∈ {} | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 * ({} U Y) = {} ∀ Y
	 */

	/*
	 * ({} U Y) = {} ∀ Y
	 */
	var res = set.union({} , { type: 'new' }, prop);
	assert.deepEqual(res, {}, "all");

	/*
	 * ({} U Y) = {} ∀ Y
	 */
	res = set.union({} , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, {}, "intersection");


	/*
	 * X ⊂ Y
	 * (X U Y) = Y
	 */
	res = set.union({type: ['prep'] } , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, { type: ['prep','new'] }, "union of a superset is superset");


	/*
	 * ({} U Y) = {} ∀ Y
	 * {type: []} = {}
	 */
	res = set.union({} , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, { }, "intersection");

	/*
	 * (Y U {}) = {} ∀ Y
	 */
	res = set.union({ type: 'new' },{}, prop);
	assert.deepEqual(res, {}, "all");

	/*
	 * x ∈ X | x ∉ Y
	 * y ∉ Y | y ∉ X
	 *
	 * X U Y = {}
	 */
	res = set.union({type: ['deliver','delivered'] } , { type: ['new','prep'] }, prop);
	assert.deepEqual(res, {}, "intersection");
});


QUnit.test('enum set.equal', function(assert) {
	var prop = props["enum"]('type',['new','prep','deliver','delivered']),
		res;
	/*
	 * x ∈ {} | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 */

	/*
	 * x ∈ {} | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 * y ∈ Y | y.type = 'new'
	 *
	 * {} != Y
	 */
	//res = set.isEqual({} , { type: 'new' }, prop);
	//deepEqual(res, false, "proper subset is not the universal set");

	/*
	 * x ∈ {} | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 * y ∈ Y | y.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 *
	 * {} = Y
	 */
	res = set.isEqual({} , { type: ['new','prep','deliver','delivered'] }, prop);
	assert.deepEqual(res, true, "subset of all possible enums is the same as universal set");

	/*
	 * x ∈ X | x.type ∈ ['new']
	 * y ∈ Y | y.type ∈ ['new']
	 *
	 * X = Y
	 */
	res = set.isEqual({type: ['prep'] } , { type: ['prep'] }, prop);
	assert.deepEqual(res, true, "identical sets with single array enum are equal");

	/*
	 * x ∈ X | x.type = 'new'
	 * y ∈ Y | y.type ∈ 'new'
	 *
	 * X = Y
	 */
	res = set.isEqual({type: 'prep'} , { type: 'prep' }, prop);
	assert.deepEqual(res, true, "identical sets with single property enum are equal");

	/*
	 * x ∈ X | x.type = 'new'
	 * y ∈ Y | y.type ∈ 'prep'
	 *
	 * Y != X
	 */
	res = set.isEqual({ type: 'new' },{type: 'prep'}, prop);
	assert.deepEqual(res, false, "two sets with different enum properties are not equal");

});

QUnit.test('enum set.isSubset', function(assert) {
	var prop = props["enum"]('type',['new','prep','deliver','delivered']);
	/*
	 * x ∈ X | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 * {} = X
	 * Y ⊆ X ∀ Y
	 */

	/*
	 * Y ⊂ {}
	 * {} ⊄ Y
	 */
	var res = set.isSubset({} , { type: 'new' }, prop);
	assert.deepEqual(res, false, "universal set is not a subset");

	/*
	 * y ∈ Y | y.type = 'new'
	 * Y ⊆ X ∀ Y
	 */
	res = set.isSubset({ type: 'new' }, {} , prop);
	assert.deepEqual(res, true, "any single enum is a subset of universal set");

	/*
	 * Y = {}
	 * Y ⊆ X ∀ Y
	 */
	res = set.isSubset({} , { type: ['new','prep','deliver','delivered'] }, prop);
	assert.deepEqual(res, true, "enum set matching definition of universal set is a subset of universal set");

	/*
	 * y ∈ Y | x.type ∈ ['prep']
	 * Y ⊆ X ∀ Y
	 */
	res = set.isSubset({type: ['prep'] } , { type: ['prep'] }, prop);
	assert.deepEqual(res, true, "any list of possible enums are subset of universal set");

	/*
	 * y ∈ Y | x.type = 'prep'
	 * Y ⊆ X ∀ Y
	 */
	res = set.isSubset({type: 'prep'} , { type: 'prep' }, prop);
	assert.deepEqual(res, true, "intersection");

	/*
	 * x ∈ X | x.type = 'new'
	 * y ∈ Y | x.type = 'prep'
	 *
	 * X ⊄ Y
	 */
	res = set.isSubset({ type: 'new' },{type: 'prep'}, prop);
	assert.deepEqual(res, false, "all");

	/*
	 * x ∈ X | x.type ∈ ['new', 'prep', 'deliver', 'delivered']
	 * Y ⊆ X ∀ Y
	 */
	res = set.isSubset({type: 'prep'} , { type: ['new','prep','deliver','delivered'] }, prop);
	assert.deepEqual(res, true, "intersection");
});
