const QUnit = require("steal-qunit");
const { mixinObject } = require("./helpers");
const type = require("can-type");
const dev = require("can-test-helpers").dev;

const ObservableObject = mixinObject();

QUnit.test("Primitives can be provided as the default in the PropDefinition", function(assert) {
	assert.expect(6);

	class Person extends ObservableObject {
		static get props() {
			return {
				age: {
					default: 13
				},
				likesChocolate: {
					default: false
				},
				favoriteColor: {
					default: "green"
				}
			};
		}
	}

	let person = new Person();

	assert.equal(person.age, 13, "Number works");
	assert.equal(person.likesChocolate, false, "Boolean works");
	assert.equal(person.favoriteColor, "green", "Strings work");

	person.age = 30;
	person.likesChocolate = true;
	person.favoriteColor = "red";

	assert.equal(person.age, 30, "Number can be set to another number");
	assert.equal(person.likesChocolate, true, "Boolean can be set to another boolean");
	assert.equal(person.favoriteColor, "red", "Strings can be set to another string");
});

dev.devOnlyTest("Primitives can be provided as the default in the PropDefinition should type check", function(assert) {
	assert.expect(3);

	class Person extends ObservableObject {
		static get props() {
			return {
				age: {
					default: 13
				},
				likesChocolate: {
					default: false
				},
				favoriteColor: {
					default: "green"
				}
			};
		}
	}

	let person = new Person();

	try {
		person.age = "50";
	} catch(e) {
		assert.ok(true, "Number cannot be set to a non-number");
	}

	try {
		person.likesChocolate = "not a boolean";
	} catch(e) {
		assert.ok(true, "Boolean cannot be set to a non-boolean");
	}

	try {
		person.favoriteColor = undefined;
	} catch(e) {
		assert.ok(true, "String cannot be set to a non-string");
	}
});

QUnit.test("Primitives can be provided as the default as the property value", function(assert) {
	assert.expect(6);

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

	person.age = 30;
	person.likesChocolate = true;
	person.favoriteColor = "red";

	assert.equal(person.age, 30, "Number can be set to another number");
	assert.equal(person.likesChocolate, true, "Boolean can be set to another boolean");
	assert.equal(person.favoriteColor, "red", "Strings can be set to another string");
});

dev.devOnlyTest("Primitives can be provided as the default as the property value should type check", function(assert) {
	assert.expect(3);

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

	try {
		person.age = "50";
	} catch(e) {
		assert.ok(true, "Number cannot be set to a non-number");
	}

	try {
		person.likesChocolate = "not a boolean";
	} catch(e) {
		assert.ok(true, "Boolean cannot be set to a non-boolean");
	}

	try {
		person.favoriteColor = undefined;
	} catch(e) {
		assert.ok(true, "String cannot be set to a non-string");
	}
});

dev.devOnlyTest("Primitives provided as the default sets the type as strict", function(assert) {
	class Person extends ObservableObject {
		static get props() {
			return {
				age: 13
			};
		}
	}

	let person = new Person();

	assert.equal(person.age, 13, "Set the value");

	try {
		person.age = "fourteen";
		assert.ok(false, "Should have thrown");
	} catch(e) {
		assert.ok(true, "Threw because its type number");
	}
});

QUnit.test("Extended ObservableObjects can be used to set the type", function(assert) {
	class One extends ObservableObject {
	}

	class Two extends ObservableObject {
		static get props() {
			return {
				one: One
			};
		}
	}

	let one = new One();
	let two = new Two({ one });

	assert.equal(two.one, one, "Able to pass the instance");

	if(process.env.NODE_ENV !== "production") {
		try {
			new Two({ one: {} });
			assert.ok(false, "Should have thrown");
		} catch(e) {
			assert.ok(true, "Throws because it is a strict type");
		}
	}
});

QUnit.test("Allow a default object to be provided by using a getter", function(assert) {
	class Thing extends ObservableObject {
		static get props() {
			return {
				prop: {
					get default() {
						return { foo: "bar" };
					}
				}
			};
		}
	}

	let one = new Thing();
	let two = new Thing();

	assert.deepEqual(one.prop, { foo: "bar" }, "Sets the default");
	assert.notEqual(one.prop, two.prop, "Different instances");
});

QUnit.test("Functions can be provided as the default in the PropDefinition", function(assert) {
	assert.expect(2);

	class Person extends ObservableObject {
		static get props() {
			return {
				getAge: {
					default() {
						return 13;
					}
				}
			};
		}
	}

	let person = new Person();

	assert.equal(person.getAge(), 13, "property is a function");

	person.getAge = function() { return 30; };
	assert.equal(person.getAge(), 30, "function can be overwritten");
});

dev.devOnlyTest("Functions provided as the default in the PropDefinition should type check", function(assert) {
	assert.expect(1);

	class Person extends ObservableObject {
		static get props() {
			return {
				getAge: {
					default() {
						return 13;
					}
				}
			};
		}
	}

	let person = new Person();

	try {
		person.getAge = 50;
	} catch(e) {
		assert.ok(true, "setting property to a non-function throws an error");
	}
});

QUnit.test("Functions can be provided as the default as the property value", function(assert) {
	assert.expect(2);

	class Person extends ObservableObject {
		static get props() {
			return {
				getAge() {
					return 13;
				}
			};
		}
	}

	let person = new Person();

	assert.equal(person.getAge(), 13, "property is a function");

	person.getAge = function() { return 30; };
	assert.equal(person.getAge(), 30, "function can be overwritten");
});

dev.devOnlyTest("Functions provided as the default as the property value should type check", function(assert) {
	assert.expect(1);

	class Person extends ObservableObject {
		static get props() {
			return {
				getAge() {
					return 13;
				}
			};
		}
	}

	let person = new Person();

	try {
		person.getAge = 50;
	} catch(e) {
		assert.ok(true, "setting property to a non-function throws an error");
	}
});

QUnit.test("Primitives provided as the default are not strict if there is a propertyDefaults type", function(assert) {
	assert.expect(4);

	class Person extends ObservableObject {
		static get propertyDefaults() {
			return {
				type: type.Any
			};
		}

		static get props() {
			return {
				age: 13,
				ageProp: {
					default: 14
				}
			};
		}
	}

	let person = new Person();

	assert.equal(person.age, 13, "Default for prop");
	assert.equal(person.ageProp, 14, "Default for prop with definition");

	person.age = "thirteen";
	assert.equal(person.age, "thirteen", "Setting the value of prop to another type works");

	person.ageProp = "fourteen";
	assert.equal(person.ageProp, "fourteen", "Setting the value of prop with definition to another type works");
});

QUnit.test("Primitives provided as the default are not strict if they have a type", function(assert) {
	assert.expect(4);

	class Person extends ObservableObject {
		static get props() {
			return {
				age: {
					default: 13,
					type: type.Any
				},
				ageFunc: {
					default() { return 14; },
					type: type.Any
				}
			};
		}
	}

	let person = new Person();

	assert.equal(person.age, 13, "Default for primitive default");
	assert.equal(person.ageFunc(), 14, "Default for function default");

	person.age = "thirteen";
	assert.equal(person.age, "thirteen", "Setting the value of prop to another type works");

	person.ageFunc = "fourteen";
	assert.equal(person.ageFunc, "fourteen", "Setting the value of prop to another type works");
});
