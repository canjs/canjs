const { mixinObject } = require("./helpers");
const addDefinedProps = require("../src/define");
const { hooks } = addDefinedProps;
const canReflect = require("can-reflect");
const ObservationRecorder = require("can-observation-recorder");
const type = require("can-type");

const ObservableObject = mixinObject();

QUnit.module("can-observable-mixin - Proxy Objects");

QUnit.test("Can bind on properties not defined", function(assert) {
	class Favorites extends ObservableObject {}

	let faves = new Favorites();

	canReflect.onKeyValue(faves, "food", function() {
		assert.ok(true);
	});

	faves.food = "pizza";
});

QUnit.test("Can listen to changes when listening to undefined props", function(assert) {
	let map = new ObservableObject();

	ObservationRecorder.start();
	map.first; // jshint ignore:line
	let records = ObservationRecorder.stop();
	let entries = Array.from(records.keyDependencies.get(map));

	assert.deepEqual(entries, ["first"], "Has the right entries");
});

QUnit.test("Adding a property on the prototype works", function(assert) {
	class Favorites extends ObservableObject {}

	hooks.finalizeClass(Favorites);
	Favorites.prototype.aFunction = function() {};

	let myFaves = new Favorites({ food: "pizza" });
	let yourFaves = new Favorites({ food: "tacos" });

	assert.equal(myFaves.food, "pizza", "myFaves.food is pizza");
	assert.equal(yourFaves.food, "tacos", "yourFaves.food is tacos");
});

QUnit.test("Symbols are not observable", function(assert) {
	let map = new ObservableObject();
	let sym = Symbol.for("can.something");

	ObservationRecorder.start();
	map[sym]; // jshint ignore:line
	let records = ObservationRecorder.stop();
	let entries = Array.from(records.keyDependencies.get(map) || []);

	assert.deepEqual(entries, [], "no observations are created");

	ObservationRecorder.start();
	map[sym] = "Hi";
	records = ObservationRecorder.stop();
	entries = Array.from(records.keyDependencies.get(map) || []);

	assert.deepEqual(entries, [], "no observations are created");
});

QUnit.test("Does not observe __proto__", function(assert) {
	class Parent extends ObservableObject {
		fn() {}
	}
	class Child extends Parent {
		fn() {
			super.fn();
		}
	}

	let instance = new Child();

	ObservationRecorder.start();
	instance.fn();
	let records = ObservationRecorder.stop();
	let deps = Array.from(records.keyDependencies);
	assert.equal(deps.length, 0, "Nothing recorded just by calling super.fn()");
});

QUnit.test("Self-referential typing", function(assert) {
	class Faves extends ObservableObject {
		static get define() {
			return {
				faves: type.late(() => type.convert(Faves))
			};
		}
	}

	let faves = new Faves({
		faves: {}
	});

	assert.ok(faves instanceof Faves);
	assert.ok(faves.faves instanceof Faves);
});

QUnit.test("oldValue and value are on event object", function(assert) {
	assert.expect(2);

	class Faves extends ObservableObject {
		static get props() {
			return {
				prop: String
			};
		}
	}

	let faves = new Faves({ prop: "value" });

	faves.listenTo("prop", (ev) => {
		assert.equal(ev.value, "value2", "has the new value");
		assert.equal(ev.oldValue, "value", "has the old value");
	});

	faves.prop = "value2";
});

QUnit.test("deleteKey includes the oldValue", function(assert) {
	assert.expect(1);

	class Faves extends ObservableObject {
		static get props() {
			return {
				prop: type.Any
			};
		}
	}

	let faves = new Faves({ prop: "value" });
	faves.listenTo("prop", ev => {
		assert.equal(ev.oldValue, "value", "includes the old value");
	});
	faves.deleteKey("prop");
});

QUnit.test("Changes in getters includes the old and new values", function(assert) {
	class Faves extends ObservableObject {
		static get props() {
			return {
				one: String,
				two: {
					get() {
						return this.one;
					}
				}
			};
		}
	}

	let faves = new Faves({ one: "one" });
	faves.listenTo("one", ev => {
		assert.equal(ev.value, "two", "has the new value");
		assert.equal(ev.oldValue, "one", "Has the old value");
	});
	faves.one = "two";
});
