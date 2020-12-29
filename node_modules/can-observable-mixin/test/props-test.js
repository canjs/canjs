const QUnit = require("steal-qunit");
const { mixinObject } = require("./helpers");
const { hooks } = require("../src/define");
const canReflect = require("can-reflect");

QUnit.module("can-observable-mixin - props()");

QUnit.test("Can define stuff", function(assert) {
  class Faves extends mixinObject() {
    static get props() {
      return {
			color: {
				default: "blue"
			}
      };
    }
  }

  let faves = new Faves();
  assert.equal(faves.color, "blue", "Got the value");
});

QUnit.test("Does not throw if no define is provided", function(assert) {
	class Faves extends mixinObject() {}
	new Faves();
	assert.ok(true, "Did not throw");
});

QUnit.test("Stuff is defined in constructor for non-element classes", function(assert) {
  class Faves extends mixinObject(Object) {
    static get props() {
      return {
			color: {
				default: "blue"
			}
      };
    }

	constructor() {
		super();
		assert.equal(this.color, "blue", "color exists after constructor");
	}
  }

  new Faves();
});

QUnit.test("Default strings work when they are like can-define types", function(assert) {
	class Person extends mixinObject() {
		static get props() {
			return {
				someProp: "number"
			};
		}
	}

	let p = new Person();
	assert.equal(p.someProp, "number", "Is the string 'number'");
});

QUnit.test("initialize can be called multiple times if Symbol is reset", function(assert) {
	const metaSymbol = Symbol.for("can.meta");
	class Obj extends mixinObject() {
		static get props() {
			return { age: Number };
		}
	}

	const obj = new Obj({ age: 30 });
	assert.equal(obj.age, 30, "initialized once by constructor");

	obj[metaSymbol].initialized = false;
	hooks.initialize(obj, { age: 35 });
	assert.equal(obj.age, 35, "initialized again");
});

QUnit.test("defineInstanceKey does not add to the base prototype", function(assert) {
	const Base = mixinObject();
	class Obj extends Base {}
	canReflect.defineInstanceKey(Obj, "_saving", {
		configurable: true,
		default: false,
		enumerable: false,
		writable: true
	});
	new Obj();

	let desc = Object.getOwnPropertyDescriptor(Base.prototype, "_saving");
	assert.ok(!desc, "There is no descriptor on the Base class");
});
