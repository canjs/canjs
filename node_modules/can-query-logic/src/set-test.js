var set = require("./set");
var QUnit = require("steal-qunit");

QUnit.module("can-query-logic/set");

QUnit.test(".ownAndMemberValue", function(assert) {
	assert.deepEqual( set.ownAndMemberValue(1, "1"), {
		own: 1,
		member: 1
	}, "1 and '1'");

	assert.deepEqual( set.ownAndMemberValue({
		valueOf: function(){ return null; }
	}, "1"), {
		own: null,
		member: "1"
	}, "{null} and '1'");
});

QUnit.test(".isDefinedAndHasMembers", function(assert) {
	assert.equal(set.isDefinedAndHasMembers({}), true);
	assert.equal(set.isDefinedAndHasMembers(set.UNIVERSAL), true);
	assert.equal(set.isDefinedAndHasMembers(set.UNDEFINABLE), false);
});
