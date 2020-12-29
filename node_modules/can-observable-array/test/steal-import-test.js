import QUnit from "steal-qunit";
import ObservableArray from "../src/can-observable-array";

QUnit.module("using steal import");

QUnit.test("it works", function(assert) {
	class Todos extends ObservableArray {}

	const todos = new Todos([
		{ name: "walk the dog" },
		{ name: "cook dinner", completed: true }
	]);

	assert.equal(todos.length, 2);
});
