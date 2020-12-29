const QUnit = require("steal-qunit");
const canSymbol = require("can-symbol");

const mixinMapProps = require("../src/mixin-mapprops");

QUnit.module("can-observable-mixin - mixins(Array)");

QUnit.test(".update works", function(assert) {
	class MyArray extends mixinMapProps(Array) {}

	let arr = new MyArray();
	arr.push(1, 2, 3, 4);
	assert.equal(arr.length, 4);

	arr.update([]);
	assert.equal(arr.length, 0);
});

QUnit.test(".updateDeep works", function(assert) {
	class MyArray extends mixinMapProps(Array) {}

	let arr = new MyArray();
	arr.push(1, 2, 3, 4);
	assert.equal(arr.length, 4);

	arr.updateDeep([]);
	assert.equal(arr.length, 0);
});

// Needed for canReflect.updateDeepList
QUnit.test("implements 'can.updateDeep' symbol", function(assert) {
	class MyArray extends mixinMapProps(Array) {}

	let arr = new MyArray();
	arr.push(1, 2, 3, 4);
	assert.equal(typeof arr[canSymbol.for("can.updateDeep")], "function");

	arr[canSymbol.for("can.updateDeep")]([]);
	assert.equal(arr.length, 0);
});
