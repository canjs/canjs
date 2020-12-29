var QUnit = require('steal-qunit');
var WeakReferenceSet = require('./weak-reference-set');

QUnit.module("weak-reference-set");

QUnit.test("Multiple entries support #468", function(assert) {
	var set = new WeakReferenceSet();

	var item1 = {};
	var item2 = {};
	var item3 = {};

	var items = [item1, item2, item3];

	for (var index = 0; index < items.length; index++) {
		set.addReference(items[index]);
	}
	
	assert.equal(set.get(item1), item1, "Got the first item");
	assert.equal(set.get(item2), item2, "Got the second item");
	assert.equal(set.get(item3), item3, "Got the third item");
});

QUnit.test("Multiple entries support with multiple reference #468", function(assert) {
	var set = new WeakReferenceSet();

	var obj = {};
	var obj2 = {};

	for (var index = 0; index < 3; index++) {
		set.addReference(obj);
	}

	set.addReference(obj2);

	assert.equal(set.referenceCount(obj), 3, "Got the correct reference count");
	assert.equal(set.referenceCount(obj2), 1, "Got correct reference count for multiple entries");
});

