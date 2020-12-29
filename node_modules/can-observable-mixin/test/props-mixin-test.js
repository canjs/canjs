"use strict";
const QUnit = require("steal-qunit");
const { mixinObject } = require("./helpers");
const canReflect = require("can-reflect");
const types = require("can-type");
const dev = require("can-test-helpers").dev;

QUnit.module("can-observable-mixin - mixins(Object)");

QUnit.test("Can define properties", function(assert) {
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

QUnit.test("Changes are observed", function(assert) {
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
	canReflect.onKeyValue(faves, "color", () => {
		assert.equal(faves.color, "red");
	});
	faves.color = "red";
});

QUnit.test("async(resolve) resolves async values", function(assert) {
	let done = assert.async();

	class Faves extends mixinObject() {
		static get props() {
			return {
				age: {
					async(resolve, last = 1) {
						this.birthday.then(() => {
							resolve(last + 1);
						});
					}
				}
			};
		}

		get birthday() {
			return Promise.resolve();
		}
	}

	let faves = new Faves();

	canReflect.onKeyValue(faves, "age", value => {
		assert.equal(value, 2, "Age set when `resolve` is called");
		done();
	});
});

QUnit.test("async() returning a promise resolves", function(assert) {
	let done = assert.async();

	class Faves extends mixinObject() {
		static get props() {
			return {
				age: {
					async(resolve, last = 1) {
						return Promise.resolve(this.birthday).then(() => last + 1);
					}
				}
			};
		}

		get birthday() {
			return Promise.resolve();
		}
	}

	let faves = new Faves();

	assert.equal(faves.age, undefined, "Age has correct initial value");

	canReflect.onKeyValue(faves, "age", value => {
		assert.equal(value, 2, "Age set when promise resolves");
		done();
	});
});

QUnit.test("listenTo to listen to property changes", function(assert) {
	class Faves extends mixinObject() {
		static get props() {
			return {
				color: {}
			};
		}
	}

	let faves = new Faves();
	faves.listenTo("color", function() {
		assert.equal(faves.color, "red", "got  the change");
	});

	faves.color = "red";
});

QUnit.test("value(prop) can be used to resolve a property based on others", function(assert) {
	class Person extends mixinObject() {
		static get props() {
			return {
				isBirthday: {
					default: false
				},
				age: {
					value({ listenTo, resolve }) {
						let current = 1;

						listenTo("isBirthday", isBirthday => {
							if(isBirthday) {
								resolve(current = current + 1);
							}
						});

						resolve(current);
					}
				}
			};
		}
	}

	let p = new Person();
	canReflect.onKeyValue(p, "age", function() {
		assert.equal(p.age, 2, "Now is two");
	});
	p.isBirthday = true;
});

QUnit.test("getSchema returns the schema", function(assert) {
	class Faves extends mixinObject() {
		static get props() {
			return {
				age: {}
			};
		}
	}

	let schema = canReflect.getSchema(Faves);
	assert.deepEqual(Object.keys(schema.keys), ["age"], "has the schema");
});

QUnit.test("getSchema still works when further deriving", function(assert) {
	class Base extends mixinObject() {}
	class Faves extends Base {
		static get props() {
			return {
				age: {}
			};
		}
	}

	let schema = canReflect.getSchema(Faves);
	assert.deepEqual(Object.keys(schema.keys), ["age"], "has the schema");
});

QUnit.test("Does not throw if no define is provided", function(assert) {
	class Faves extends mixinObject() {} // jshint ignore:line
	assert.ok(true, "Did not throw");
});

QUnit.test("JavaScript setters work", function(assert) {
	class Faves extends mixinObject() {
		static get props() {
			return {};
		}
		set color(v) { // jshint ignore:line
			return "blue";
		}
	}

	let faves = new Faves();
	faves.color = "red";
	assert.equal(faves.color, "blue", "Did not change");
});

// Note that this is not documented behavior so we can change it in the future if needed
// It's unlikely something someone would do on purpose anyways.
QUnit.test("Setters on the define override those on the prototype", function(assert) {
	class Faves extends mixinObject() {
		static get props() {
			return {
				color: {
					enumerable: false,
					set(v) { // jshint ignore:line
						return "green";
					}
				}
			};
		}
		set color(v) { // jshint ignore:line
			return "blue";
		}
	}

	let faves = new Faves();
	faves.color = "red";
	assert.equal(faves.color, "green", "Changed to green");

	let props = [];
	for(let prop in faves) {
		props.push(prop);
	}
	assert.deepEqual(props, [], "Not enumerable too");
});

QUnit.test("set() can return a different value", function(assert) {
	class Faves extends mixinObject() {
		static get props() {
			return {
				color: {
					set() {
						return "blue";
					}
				}
			};
		}
	}

	let faves = new Faves();
	faves.color = "red";
	assert.equal(faves.color, "blue", "Did not change");
});

QUnit.test("Passing props into the constructor", function(assert) {
	class Person extends mixinObject() {
		static get props() {
			return {
				age: {
					default: 1
				}
			};
		}
	}

	assert.equal(new Person().age, 1, "the default");
	assert.equal(new Person({ age: 2 }).age, 2, "can be passed as a prop");
});

QUnit.test("seal: false prevents the object from being sealed", function(assert) {
	class Thing extends mixinObject() {
		static get seal() {
			return false;
		}
	}

	let p = new Thing();
	p.set("expando", 11);

	canReflect.onKeyValue(p, "expando", () => {
		assert.equal(p.get("expando"), 15, "Not sealed");
	});
	p.set("expando", 15);
});

QUnit.test("enumerable: false prevents the property from being enumerable", function(assert) {
	class Thing extends mixinObject() {
		static get props() {
			return {
				shouldEnumerate: {
					default: "foo"
				},
				shouldNotEnumerate: {
					default: "bar",
					enumerable: false
				}
			};
		}
	}

	let thing = new Thing();
	let enumerated = [];
	for(let prop in thing) {
		enumerated.push(prop);
	}
	assert.deepEqual(enumerated, ["shouldEnumerate"], "Only enumerable properties");
});

QUnit.test("canReflect.hasKey works", function(assert) {
	class Thing extends mixinObject() {
		static get props() {
			return {
				prop: String,
				derivedProp: {
					get: function() {
						if (this.prop) {
							return this.prop + " World";
						}
					}
				}
			};
		}
	}

	let thing = new Thing({ prop: "Hello" });

	let testCases = [
		{ method: "hasKey", prop: "prop", expected: true },
		{ method: "hasKey", prop: "derivedProp", expected: true }
	];

	testCases.forEach(function(test) {
		assert.equal(canReflect[test.method](thing, test.prop), test.expected,
			"canReflect." + test.method + "(thing, '" + test.prop + "') should be " + test.expected
		);
	});
});

QUnit.test("setters get the lastSet value", function(assert) {
	let setLastSet;
	class Faves extends mixinObject() {
		static get props() {
			return {
				food: {
					set(newValue, lastSet) {
						setLastSet = lastSet;
						return newValue;
					}
				}
			};
		}
	}

	let faves = new Faves();
	faves.food = "pizza";
	faves.food = "pie";

	assert.equal(setLastSet, "pizza", "lastSet provided to the setter");
});

QUnit.test("propertyDefaults becomes the default properties", function(assert) {
	class Person extends mixinObject() {
		static get propertyDefaults() {
			return {
				type: types.convert(Number)
			};
		}
	}

	let p = new Person({ age: "32" });
	assert.deepEqual(p.age, 32, "Converted because of defaults");
});

QUnit.test("propertyDefaults runs on expando properties", function(assert) {
	class Player extends mixinObject() {
		static get propertyDefaults() {
			return {
				type: types.convert(Number)
			};
		}
	}

	let p = new Player();
	p.age = "32";
	assert.deepEqual(p.age, 32, "Converted because of defaults");
});

dev.devOnlyTest("Adding expando properties on sealed objects", function(assert) {
	class MyType extends mixinObject() {
		static get props() {
			return {
				myProp: String
			};
		}

		static get seal() { return true; }
	}

	const myType = new MyType();

	try {
		myType.otherProp = "value"; // error!
		assert.ok(false, "Should have thrown");
	} catch(e) {
		assert.ok(true, "Threw because it is sealed");
	}
});

QUnit.test("getters on the define object work", function(assert) {
	class MyType extends mixinObject() {
		static get props() {
			return {
				noun: "World",
				get greeting() {
					return `Hello ${this.noun}`;
				}
			};
		}
	}

	const myType = new MyType();
	assert.equal(myType.greeting, "Hello World");
});

QUnit.test("Error for required properties includes the function name", function(assert) {
		class MySpecialThing extends mixinObject() {
			static get props() {
				return {
					prop: { required: true }
				};
			}
		}

		try {
			new MySpecialThing({});
		} catch(err) {
			assert.ok(/MySpecialThing/.test(err.message), "Required message includes the funtion name");
		}

});

QUnit.test("Warn of async(resolve) is an async function", function(assert) {
	class MyThing extends mixinObject() {
		static get props() {
			return  {
				todos: {
					async async(resolve) { // jshint ignore:line

					}
				}
			};
		}
	}

	let count = dev.willWarn(/async function/);
	new MyThing();
	assert.equal(count(), 1, "1 warning");
});

dev.devOnlyTest("warnings are given when type or default is ignored", function(assert) {
	const testCases = [
		{
			name: "zero-arg getter, no setter when property is set",
			definition: {
				get() { return "whatever"; }
			},
			warning: /Set value for property .* ignored/,
			setProp: true,
			expectedWarnings: 1
		},
		{
			name: "type with zero-arg getter, no setter",
			definition: {
				type: String,
				get() { return "whatever"; }
			},
			warning: /type value for property .* ignored/,
			setProp: false,
			expectedWarnings: 1
		},
		{
			name: "only default type with zero-arg getter, no setter - should not warn",
			definition: {
				get() { return "whatever"; }
			},
			warning: /type value for property .* ignored/,
			setProp: false,
			expectedWarnings: 0
		},
		{
			name: "type with zero-arg getter, with setter - should not warn",
			definition: {
				type: String,
				get() { return "whatever"; },
				set (val) { return val; }
			},
			warning: /type value for property .* ignored/,
			setProp: false,
			expectedWarnings: 0
		},
		{
			name: "default with zero-arg getter, no setter",
			definition: {
				default: "some thing",
				get() { return "whatever"; }
			},
			warning: /default value for property .* ignored/,
			setProp: false,
			expectedWarnings: 1
		},
		{
			name: "default with zero-arg getter, with setter - should not warn",
			definition: {
				default: "some thing",
				get() { return "whatever"; },
				set (val) { return val; }
			},
			warning: /default value for property .* ignored/,
			setProp: false,
			expectedWarnings: 0
		}
	];

	testCases.forEach((testCase) => {
		let Obj = class extends mixinObject() {
			static get props() {
				return {
					prop: testCase.definition
				};
			}
		};
		let count = dev.willWarn(testCase.warning);

		let o = new Obj();

		if (testCase.setProp) {
			o.prop = "a value";
		}

		assert.equal(count(), testCase.expectedWarnings, `got correct number of warnings for "${testCase.name}"`);
	});
});

QUnit.test("Properties can be deleted", function(assert) {
	const MyObject = class extends mixinObject() {};

	let obj = new MyObject({
		foo: "foo",
		bar: "bar",
		qux: "qux"
	});

	canReflect.deleteKeyValue(obj, "foo");
	assert.equal(obj.foo, undefined, "no longer exists");
	obj.foo = "test";
	assert.equal(obj.foo, "test", "can add back");

	obj.deleteKey("bar");
	assert.equal(obj.bar, undefined, "no longer exists");
	assert.equal(Object.keys(obj).length, 2, "2 props now");
	obj.bar = "test";
	assert.equal(obj.bar, "test", "can add back");
});

QUnit.test("ownKeys only gets keys of props", function(assert) {
	class MyType extends mixinObject() {
		static get props() {
			return {
				fullName: {
					get() {
						return this.first + " " + this.last;
					}
				}
			};
		}
	}

	let type = new MyType({ first: "Matthew", last: "Phillips" });
	let keys = canReflect.getOwnKeys(type);
	assert.deepEqual(keys, ["first", "last", "fullName"]);
});
