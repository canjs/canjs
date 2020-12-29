const QUnit = require("steal-qunit");
const canReflect = require("can-reflect");
const { mixinObject } = require("./helpers");
const types = require("can-type");
const dev = require("can-test-helpers").dev;

const ObservableObject = mixinObject();

QUnit.module("can-observable-mixin - Types");

/*
Need to support

<my-foo> | <my-foo age:from="5"></my-foo> | <my-foo age="5"></my-foo>
check | convert
Maybe | noMaybe
required | not-required
default | no default ?

age: types.maybe(Number), //-> {[can.new](), schema: {type:"or", values: [Number, null]}}
age: types.convert(Number), //-> {[can.new](), inputSchema: set.Universal}
age: types.maybeConvert(Number),
*/

/*
let options = [
	[{ maybe: true }, { noMaybe: true }],
	[{ check: true }, { convert: true }],

];
*/

// CHECK, noMaybe, not-required
// CHECK, noMaybe, required
// CHECK, Maybe, not-required
// CONVERT, Maybe, not-required

function strictEqual(instance, props) {
	QUnit.assert.strictEqual(instance.prop, props.prop, "Prop added exactly");
}

function equal(instance, props) {
	QUnit.assert.equal(instance.prop, props.prop, "Prop added exactly");
}

function propEqualTo(expectedValue) {
	return function(instance) {
		QUnit.assert.equal(instance.prop, expectedValue, `Prop is value ${expectedValue}`);
	};
}

function isNaN(instance) {
	QUnit.assert.ok(Number.isNaN(instance.prop), "Is NaN value");
}

function ok(reason = "Expected to throw") {
	QUnit.assert.ok(true, reason);
}

function notOk(reason = "Should not have thrown") {
	QUnit.assert.ok(false, reason);
}

function throwBecauseRequired(props, err) {
	let isFromRequired = /required/.test(err.message);
	QUnit.assert.ok(isFromRequired, "Failed expectedly because missing required properties");
}

const throwsBecauseOfWrongType = ok.bind(null, "Throws when the wrong type is provided");
const shouldHaveThrownBecauseRequired = notOk.bind(null, "Should have thrown because required.");
const shouldNotThrowBecauseShouldConvert = notOk.bind(null, "This should not have thrown, should have converted");

let matrix = {
	maybeConvertNotRequired: {
		method: "maybeConvert",
		check: equal,
		throws: shouldNotThrowBecauseShouldConvert
	},
	maybeConvertRequired: {
		method: "maybeConvert",
		required: true,
		check: equal,
		throws: shouldNotThrowBecauseShouldConvert
	},
	convertNotRequired: {
		method: "convert",
		check: equal,
		throws: shouldNotThrowBecauseShouldConvert
	},
	convertRequired: {
		method: "convert",
		required: true,
		check: equal,
		throws: shouldNotThrowBecauseShouldConvert
	}
};

if (process.env.NODE_ENV !== "production") {
	canReflect.assignMap(matrix, {
		checkNoMaybeNotRequired: {
			method: "check",
			check: strictEqual,
			throws: throwsBecauseOfWrongType
		},
		checkNoMaybeRequired: {
			method: "check",
			required: true,
			check: strictEqual,
			throws: throwsBecauseOfWrongType
		},
		maybeNotRequired: {
			method: "maybe",
			check: strictEqual,
			throws: throwsBecauseOfWrongType
		},
		maybeRequired: {
			method: "maybe",
			required: true,
			check: strictEqual,
			throws: throwsBecauseOfWrongType
		}
	});
}

let checkIsNaN = {
	check: isNaN
};

let checkDateMatchesNumber = {
	check: function(instance, props) {
		let date = instance.prop;
		let num = props.prop;
		QUnit.assert.strictEqual(date.getTime(), num, "Converted number to date");
	}
};

let expectedToThrowBecauseRequired = {
	check: shouldHaveThrownBecauseRequired,
	throws: throwBecauseRequired
};

let dateAsNumber = new Date(1815, 11, 10).getTime();

let cases = [
	{ type: Number, value: 36 },
	{
		type: Number,
		value: "not a number",
		maybeConvertNotRequired: checkIsNaN,
		maybeConvertRequired: checkIsNaN,
		convertNotRequired: checkIsNaN,
		convertRequired: checkIsNaN
	},
	{ type: String, value: "some string" },
	{ type: Boolean, value: true },
	{ type: Date, value: new Date(1815, 11, 10) },
	{
		type: Date, value: dateAsNumber,
		maybeConvertNotRequired: checkDateMatchesNumber,
		maybeConvertRequired: checkDateMatchesNumber,
		convertNotRequired: checkDateMatchesNumber,
		convertRequired: checkDateMatchesNumber
	},

	// Check throw, convert equal
	{ type: Number, value: "36" },
	{
		type: Number, value: null,
		convertNotRequired: {
			check: propEqualTo(0)
		},
		convertRequired: {
			check: propEqualTo(0)
		}
	 },
	{
		type: Number,
		value: undefined,
		convertNotRequired: checkIsNaN,
		convertRequired: checkIsNaN
	},

	// Required but not provided a value
	{
		type: Number,
		checkNoMaybeRequired: expectedToThrowBecauseRequired,
		maybeRequired: expectedToThrowBecauseRequired,
		maybeConvertRequired: expectedToThrowBecauseRequired,
		convertRequired: expectedToThrowBecauseRequired
	}
];

cases.forEach(testCase => {
	let { type, value } = testCase;
	let hasValue = "value" in testCase;

	for(let [caseName, caseDefinition] of Object.entries(matrix)) {
		let typeName = canReflect.getName(type);
		let testName = `${typeName} - ${caseName} - value (${!hasValue ? "NO VALUE" : typeof value === "string" ? `"${value}"` : value})`;
		QUnit.test(testName, function() {
			class MyType extends ObservableObject {
				static get props() {
					return {
						prop: {
							type: types[caseDefinition.method](type),
							required: caseDefinition.required || false
						}
					};
				}
			}

			let props = {};

			// This is so we can omit value from test cases to check required.
			if(hasValue) {
				props.prop = value;
			}

			try {
				let inst = new MyType(props);

				// Allow the testCase to override the matrix check.
				if(testCase[caseName] && testCase[caseName].check) {
					testCase[caseName].check(inst, props);
				} else {
					caseDefinition.check(inst, props);
				}
			} catch(err) {
				if(testCase[caseName] && testCase[caseName].throws) {
					testCase[caseName].throws(props, err);
				} else {
					caseDefinition.throws(props, err);
				}
			}
		});

	}
});

QUnit.test("Can pass common/primitive types as the type option", function(assert) {
	class MyThing extends ObservableObject {
		static get props() {
			return {
				num: Number,
				str: String,
				bool: Boolean,
				date: Date
			};
		}
	}

	let now = new Date();
	let thing = new MyThing({
		num: 33,
		str: "Hello world",
		bool: false,
		date: now
	});

	assert.equal(thing.num, 33, "Number accepted");
	assert.equal(thing.str, "Hello world", "String accepted");
	assert.equal(thing.bool, false, "Boolean accepted");
	assert.equal(thing.date, now, "Passed a date");
});

QUnit.test("Can pass common/primitive types in a property definition", function(assert) {
	class MyThing extends ObservableObject {
		static get props() {
			return {
				num: Number,
				numProp: { type: Number },
				numPropWithDefault: { type: Number, default: 33 }
			};
		}
	}

	let thing = new MyThing({
		num: 33,
		numProp: 33
	});

	assert.strictEqual(thing.num, 33, "prop: Number works");
	assert.strictEqual(thing.numProp, 33, "{ type: Number } works");
	assert.strictEqual(thing.numPropWithDefault, 33, "{ type: Number, default: <number> } works");
});

dev.devOnlyTest("types throw when value is set to a different type", function(assert) {
	function Thing() {}
	Thing.prototype = Object.create(Thing);
	class ExtendedObservableObject extends ObservableObject {}

	class Defined extends ObservableObject {
		static get props() {
			return {
				// common primitive shorthand
				num: Number,
				str: String,
				bool: Boolean,
				date: Date,
				// common primitive in PropertyDefinition
				numDefinition: { type: Number },
				strDefinition: { type: String },
				boolDefinition: { type: Boolean },
				dateDefinition: { type: Date },
				// custom type shorthand
				thing: Thing,
				defineObject: ObservableObject,
				extendedObservableObject: ExtendedObservableObject,
				// custom type PropertyDefinition
				thingDefinition: { type: Thing },
				defineObjectDefinition: { type: ObservableObject },
				extendedObservableObjectDefinition: { type: ExtendedObservableObject }
			};
		}
	}

	let now = new Date();

	const testCases = {
		num: "33",
		str: 33,
		bool: "not a boolean",
		date: now.toString(),
		numDefinition: "33",
		strDefinition: 33,
		boolDefinition: "not a boolean",
		dateDefinition: now.toString(),
		thing: {},
		defineObject: {},
		extendedObservableObject: {},
		thingDefinition: {},
		defineObjectDefinition: {},
		extendedObservableObjectDefinition: {}
	};

	canReflect.eachKey(testCases, function(value, prop) {
		try {
			new Defined({
				[prop]: value
			});
			assert.ok(false, `${prop} = ${value} should throw but didn't`);
		} catch(err) {
			assert.ok(true, "should throw: " + err);
		}
	});
});

QUnit.test("Can pass Function as the type option", function(assert) {
	assert.expect(2);

	class MyThing extends ObservableObject {
		static get props() {
			return {
				func: Function
			};
		}
	}

	let thing = new MyThing({
		func: function() { return 33; }
	});

	assert.equal(thing.func(), 33, "function accepted");

	thing.func = function() { return 30; };
	assert.equal(thing.func(), 30, "function can be overwritten");
});

dev.devOnlyTest("Function as the type option type checks", function(assert) {
	assert.expect(1);

	class MyThing extends ObservableObject {
		static get props() {
			return {
				func: Function
			};
		}
	}

	let thing = new MyThing({
		func: function() { return 33; }
	});

	try {
		thing.func = 50;
	} catch(e) {
		assert.ok(true, "error thrown when set to non-function");
	}
});

QUnit.test("Can pass Function in a property definition", function(assert) {
	assert.expect(6);

	class MyThing extends ObservableObject {
		static get props() {
			return {
				func: Function,
				funcProp: { type: Function },
				funcPropWithDefault: { type: Function, default() { return 33; } }
			};
		}
	}

	let thing = new MyThing({
		func: function() { return 33; },
		funcProp: function() { return 33; }
	});

	assert.strictEqual(thing.func(), 33, "prop: Function works");
	assert.strictEqual(thing.funcProp(), 33, "{ type: Function } works");
	assert.strictEqual(thing.funcPropWithDefault(), 33, "{ type: Function, default: <Function> } works");

	thing.func = function() { return 30; };
	thing.funcProp = function() { return 30; };
	thing.funcPropWithDefault = function() { return 30; };

	assert.strictEqual(thing.func(), 30, "prop: Function can be overwritten");
	assert.strictEqual(thing.funcProp(), 30, "{ type: Function } can be overwritten");
	assert.strictEqual(thing.funcPropWithDefault(), 30, "{ type: Function, default: <Function> } can be overwritten");
});

dev.devOnlyTest("Function in a property definition type checks", function(assert) {
	assert.expect(3);

	class MyThing extends ObservableObject {
		static get props() {
			return {
				func: Function,
				funcProp: { type: Function },
				funcPropWithDefault: { type: Function, default() { return 33; } }
			};
		}
	}

	let thing = new MyThing({
		func: function() { return 33; },
		funcProp: function() { return 33; }
	});

	try {
		thing.func = 50;
	} catch(e) {
		assert.ok(true, "prop: Function error thrown when set to non-function");
	}

	try {
		thing.funcProp = 50;
	} catch(e) {
		assert.ok(true, "{ type: Function } error thrown when set to non-function");
	}

	try {
		thing.funcPropWithDefault = 50;
	} catch(e) {
		assert.ok(true, "{ type: Function, default: <Function> } error thrown when set to non-function");
	}
});
