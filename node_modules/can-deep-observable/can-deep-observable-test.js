const DeepObservable = require("./can-deep-observable");
const canReflect = require("can-reflect");
const ObservableObject = require("can-observable-object");
const Observation = require("can-observation");
const QUnit = require("steal-qunit");

QUnit.module("can-deep-observable");

QUnit.test("Can convert deep objects", function(assert) {
	var out = canReflect.convert({
		a: "b",
		inner: {
			c: "d",
			deep: { e: "f" }
		},
		array: [
			{one: "two"}
		]
	}, DeepObservable);

	assert.ok(canReflect.isObservableLike(out), "is an observable");
	assert.ok(canReflect.isObservableLike(out.inner), "inner object is observable");
	assert.ok(canReflect.isObservableLike(out.inner.deep), "deep object is observable");
	assert.ok(canReflect.isObservableLike(out.array), "array is observable");
	assert.ok(Array.isArray(out.array), "array is still an array");
});

QUnit.test("Can be used as a type with ObservableObject", function(assert) {
	class Faves extends ObservableObject {
		static get props() {
			return {
				person: DeepObservable
			};
		}
	}

	let faves = new Faves({
		person: {
			name: { first: "Matthew", last: "Phillips" },
			birthday: new Date()
		}
	});

	assert.ok(canReflect.isObservableLike(faves.person), "converted");
	assert.ok(canReflect.isObservableLike(faves.person.name), "converted");
	assert.equal(faves.person.name.first, "Matthew", "strings left alone");
	assert.ok(faves.person.birthday instanceof Date, "dates left alone");
});

QUnit.test("canReflect.new DeepObservable creates a nested observable", function(assert) {
	let obj = canReflect.new(DeepObservable, {
		prop: "A",
		nested: {
			prop: "A"
		}
	});

	let obs = new Observation(function(){
		return obj.prop + " " + obj.nested.prop;
	});

	obj.prop = "B";
	assert.equal(obs.get(), "B A", "observation updated");

	obj.nested.prop =  "B";
	assert.equal(obs.get(), "B B", "nested updated");
});

QUnit.test(".on works", function(assert) {
	let obj = canReflect.new(DeepObservable, {
		inner: {
			prop: "A"
		}
	});

	obj.inner.on("prop", function(ev, newVal) {
		assert.equal(newVal, "B", "changed values");
	});

	obj.inner.prop = "B";
});
