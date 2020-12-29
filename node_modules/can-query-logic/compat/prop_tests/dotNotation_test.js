var QUnit = require("steal-qunit");

var set = require('../set-core'),
  props = require("../props");

QUnit.module("can-set props.dotNotation");

/*
 * For the dotNotation prop, we define sets like so:
 *
 * For a property 'n.p', with value 'IL'
 * x ∈ X | x.n.p = 'IL'
 *
 */
QUnit.test('dotNotation set membership', function(assert) {
  /*
   * For a property 'n.p', with value 'IL'
   * x ∈ X | x.n.p == 'IL'
   */
  var prop = props.dotNotation('n.p'),
    alg = new set.Algebra(prop),
    res = alg.isMember({'n.p': 'IL'}, {n:{p:'IL'}});
  assert.ok(res, "object with nested property is member of set using dotNotation");

  /*
   * For a property 'n.p', with value 'IL'
   * x ∉ X | x.n.p != 'IL'
   */
  res = alg.isMember({'n.p': 'IL'}, {n:{p:'MI'}});
  assert.ok(res === false, "object with nested property not a member of set using dotNotation");

  /*
   * For a property 'n.p.s', with value 'IL'
   * x ∈ X | x.n.p.s == 'IL'
   */
  prop = props.dotNotation('n.p.s');
  alg = new set.Algebra(prop);
  res = alg.isMember({'n.p.s': 'IL'}, {n:{p:{s:'IL'}}});
  assert.ok(res, "object with deep nested property is member of set using dotNotation");
});

QUnit.test('dotNotation set equality', function(assert) {
  var prop = props.dotNotation('n.p'),
    alg = new set.Algebra(prop),
    set1 = {'n.p': 'IL'},
    set2 = {'n.p': 'IL'},
    set3 = {'n.p': 'MI'},
    set4 = {n:{p:'MI'}};

  /*
   * {x | x ∈ X, x.n.p == 'IL'} = {y | y ∈ Y, y.n.p == 'IL'}
   */
  assert.ok(alg.equal(set1, set2) && alg.equal(set2, set1), "sets with dotNotation properties are equivalent");

  /*
   * {x | x ∈ X, x.n.p == 'IL'} != {y | y ∈ Y, y.n.p == 'MI'}
   */
  assert.ok(alg.equal(set1, set3) === false, "sets with dotNotation properties are not equivalent");

  /*
   * {x | x ∈ X, x.n.p == 'MI'} = {y | y ∈ Y, y.n.p == 'MI'}
   */
  assert.ok(alg.equal(set4, set3) === false, "sets with dotNotation properties are equivalent to sets with nested properties");
});

QUnit.test('dotNotation set subset', function(assert) {
  var alg = new set.Algebra(
      props.dotNotation('address.state'),
      props.dotNotation('address.city')
    ),
    set1 = {'address.state': 'IL'},
    set2 = {'address.state': 'IL', 'address.city': 'Chicago'},
    set3 = {address: {state: 'IL', city: 'Chicago'}};

  /*
   * {x | x ∈ X, x.address.state = 'IL', x.address.city = 'Chicago'} ⊆ {y | y ∈ Y, y.address.state == 'IL'}
   */
  assert.ok(alg.subset(set2, set1), "sets with dotNotation property is a subset of another dotNotation set");

  /*
   * {x | x ∈ X, x.address.state = 'IL', x.address.city = 'Chicago'} ⊆ {y | y ∈ Y, y.address.state == 'IL'}
   */
  assert.ok(alg.subset(set3, set1), "sets with nested property notation is a subset of a dotNotation set");

  /*
   * {y | y ∈ Y, y.address.state == 'IL'} ⊆ ξ
   */
  assert.ok(alg.subset(set1, {}), "sets with dotNotation properties are subsets of the universal set");

  /*
   * ξ ⊄ {y | y ∈ Y, y.address.state == 'IL'}
   */
  assert.ok(alg.subset({}, set1) === false, "the universal set is not a subset of a set with dotNotation");
});
