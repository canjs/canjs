const ObservableObject = require("../src/can-observable-object");
const QUnit = require("steal-qunit");
const canReflect = require("can-reflect");

QUnit.module('can-observable-object');

QUnit.test("Basics", function(assert){
	class Faves extends ObservableObject {
		static get props() {
			return {
				color: "red"
			};
		}
	}

	let faves = new Faves();
	assert.equal(faves.color, "red", "yup");
});

QUnit.test("Passing undefined props into ObservableObject", function(assert) {
	let inst = new ObservableObject({ a: 'b' });
	assert.equal(inst.a, "b", "passed them on");

	canReflect.onKeyValue(inst, "a", function() {
		assert.equal(inst.a, "c");
	});

	inst.a = "c";
});

QUnit.test("Passing undefined props into extended ObservableObject", function(assert) {
	class ExtendedObservableObject extends ObservableObject {}

	let inst = new ExtendedObservableObject({ a: 'b' });
	assert.equal(inst.a, "b", "passed them on");

	canReflect.onKeyValue(inst, "a", function() {
		assert.equal(inst.a, "c");
	});

	inst.a = "c";
});


QUnit.test("Primitives can be provided as the default as the property value", function(assert) {
	class Person extends ObservableObject {
		static get props() {
			return {
				age: 13,
				likesChocolate: false,
				favoriteColor: "green"
			};
		}
	}

	let person = new Person();

	assert.equal(person.age, 13, "Number works");
	assert.equal(person.likesChocolate, false, "Boolean works");
	assert.equal(person.favoriteColor, "green", "Strings work");
});