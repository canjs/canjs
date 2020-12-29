var QUnit = require("steal-qunit");

var set = require('../compat'),
	props = set.props;

QUnit.module("can-set compat props.boolean");

/*
 * For the boolean prop, we define sets like so:
 *
 * For a property p,
 * x ∈ {} | x.p = true
 * 				 x.p = false
 *
 *
 */
QUnit.test('boolean set.difference', function(assert) {

	var prop = props.boolean('completed');

	/*
	 * x ∈ {} | x.completed = true OR x.completed = false
	 * y ∈ Y | y.completed = true
	 *
	 * z ∈ (X / Y) | y.completed = false
	 */
	var res = set.difference({} , { completed: true }, prop);
	assert.deepEqual(res, {completed: false}, "inverse of true");

	/*
	 * x ∈ {} | x.completed = true OR x.completed = false
	 * y ∈ Y | y.completed = true
	 *
	 * z ∈ (X / Y) | y.completed = false
	 */
	res = set.difference({}, { completed: false }, prop);
	assert.deepEqual(res, {completed: true} , "inverse of false");
});

/*
 * x ∈ X | x.completed = true
 * y ∈ Y | y.completed = false
 * c ∈ {} | c.completed = true OR c.completed = false
 *
 * (X U Y) = c
 */
QUnit.test('boolean set.union', function(assert) {
	var prop = props.boolean('completed');
	var res = set.union({completed: false} , { completed: true }, prop);
	assert.deepEqual(res, {}, "union of true and false is entire boolean set");
});

/*
 * x ∈ X | x.foo = 'bar'
 * y ∈ Y | y.completed = true
 *
 * f = {foo: 'bar'}
 * fC = {foo: 'bar', completed: true}
 * fNotC = {foo: 'bar', completed: false}
 * c = {completed: true}
 * notC = {completed: false}
 *
 * x = [f, fC, fNotC]
 * y = [fC, c]
 *
 * z ∈ (X U Y) | z.foo = 'bar' AND y.completed = true
 *
 * z = [fC]
 *
 * Only requires that one property is always on an element
 */
QUnit.test('boolean set.intersection', function(assert) {
	var prop = props.boolean('completed');
	var res = set.intersection({foo: "bar"} , { completed: true }, prop);
	assert.deepEqual(res, {foo: "bar", completed: true}, "intersection is false (#4)");
});


QUnit.test('strings false and true are treated as booleans', function(assert) {
	var prop = props.boolean('completed');
	var res;

	res = set.isSubset({} , { completed: "true" }, prop);
	assert.ok(!res, "{} and 'true' not a subset");
	res = set.isSubset({} , { completed: "false" }, prop);
	assert.ok(!res, "{} and 'false' not a subset");

	res = set.isSubset({ completed: "true" }, {}, prop);
	assert.ok(res, "subset");

	res = set.isSubset({ completed: "false" }, {}, prop);
	assert.ok(res, "subset");

	res = set.union({completed: 'false'} , { completed: 'true' }, prop);
	assert.deepEqual(res, {}, "union of true and false is entire boolean set");

	res = set.isEqual({completed: false} , { completed: "false" }, prop);
	assert.ok(res, "false and 'false'");
});
