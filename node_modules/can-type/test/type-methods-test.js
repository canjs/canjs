var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");
var type = require("../can-type");
var QUnit = require("steal-qunit");
var dev = require("can-test-helpers").dev;
var QueryLogic = require("can-query-logic");

var newSymbol = canSymbol.for("can.new");
var isMemberSymbol = canSymbol.for("can.isMember");
var getSchemaSymbol = canSymbol.for("can.getSchema");

QUnit.module('can-type - Type methods');

function equal(assert, result, expected) {
	assert.equal(result, expected, "Result matches expected");
}

function strictEqual(assert, result, expected) {
	assert.strictEqual(result, expected, "Result matches expected strictly");
}

function isNaN(assert, result) {
	// result !== result is used because Number.isNaN doesn’t exist in IE11
	// result !== result works because NaN is the only value not equal to itself in JS
	assert.ok(result !== result, "Is NaN value");
}

function ok(assert, reason) {
	assert.ok(true, reason ||  "Expected to throw");
}

function notOk(assert, reason) {
	assert.ok(false, reason || "Expected to throw");
}

function throwsBecauseOfWrongType(assert) {
	ok(assert, "Throws when the wrong type is provided");
}

function shouldHaveThrownBecauseOfWrongType(assert) {
	notOk(assert, "Should have thrown because the wrong type was provided");
}

var checkIsNaN = {
	check: isNaN
};

var checkDateMatchesNumber = {
	check: function(assert, date, num) {
		assert.strictEqual(date.getTime(), num, "Converted number to date");
	}
};

var checkValue = function(comparison) {
	return {
		check: function(assert, result) {
			assert.strictEqual(result, comparison, "value has been correctly converted");
		}
	};
};

var checkBoolean = function (comparison) {
	return {
		check: function (assert, result) {
			assert.strictEqual(result, comparison, "Boolean has been correctly converted");
		}
	};
};

var checkNumber = function(comparison) {
	return {
		check: function(assert, result) {
			assert.strictEqual(result, comparison, "Number has been correctly converted");
		}
	};
};

var matrix = {
	convert: {
		check: equal
	},
	maybeConvert: {
		check: equal
	}
};

// type checking should not throw in production
if(process.env.NODE_ENV !== 'production') {
	canReflect.assignMap(matrix, {
		check: {
			check: strictEqual,
			throws: throwsBecauseOfWrongType
		},
		maybe: {
			check: strictEqual,
			throws: throwsBecauseOfWrongType
		}
	});
}

var dateAsNumber = new Date(1815, 11, 10).getTime();

var Integer = {};
Integer[newSymbol] = function(val) {
	return parseInt(val);
};
Integer[isMemberSymbol] = function(value) {
	// “polyfill” for Number.isInteger because it’s not supported in IE11
	return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
};
canReflect.setName(Integer, "CustomInteger");

var testCases = [
	{ Type: Boolean, value: true },
	{ Type: Boolean, value: false },
	{
		Type: Boolean, value: 'true',
		maybeConvert: checkBoolean(true),
		convert: checkBoolean(true),
	},
	{
		Type: Boolean, value: 'false',
		maybeConvert: checkBoolean(false),
		convert: checkBoolean(false),
		maybe: checkBoolean(false),
		check: checkBoolean(false)
	},
	{ Type: Number, value: 23 },
	{ Type: String, value: "foo" },
	{
		Type: Date, value: dateAsNumber,
		convert: checkDateMatchesNumber,
		maybeConvert: checkDateMatchesNumber
	},

	// Can convert types
	{ Type: Number, value: "33" },

	// Can't convert
	{
		Type: Number, value: "foo",
		convert: checkIsNaN,
		maybeConvert: checkIsNaN
	},
	{
		Type: Integer, value: 44
	},
	{
		Type: Integer, value: 44.4,
		convert: checkNumber(44),
		maybeConvert: checkNumber(44)
	},
	{
		Type: type.check(Number),
		value: "44",
		convert: checkNumber(44),
		maybeConvert: checkNumber(44),
		check: {
			check: shouldHaveThrownBecauseOfWrongType,
			throws: throwsBecauseOfWrongType
		}
	},
	{
		Type: type.maybe(Number),
		value: "44",
		convert: checkNumber(44),
		check: throwsBecauseOfWrongType,
		maybe: throwsBecauseOfWrongType
	},
	{
		Type: type.maybe(Number),
		value: null,
		convert: checkValue(null),
		check: checkValue(null)
	},
	{
		Type: type.convert(Number),
		value: "33",
		check: throwsBecauseOfWrongType,
		maybe: throwsBecauseOfWrongType,
		convert: checkNumber(33),
		maybeConvert: checkNumber(33)
	},
	{
		Type: type.convert(Number),
		value: null,
		check: throwsBecauseOfWrongType,
		maybe: throwsBecauseOfWrongType,
		convert: checkNumber(0),
		maybeConvert: checkValue(null)
	},
	{
		Type: type.check(Integer), value: 44.4,
		convert: checkNumber(44),
		maybeConvert: checkNumber(44),
		check: throwsBecauseOfWrongType,
		maybe: throwsBecauseOfWrongType
	},
	{
		Type: type.Integer, value: 33.3,
		check: throwsBecauseOfWrongType,
		convert: checkNumber(33),
		maybeConvert: checkNumber(33),
		maybe: throwsBecauseOfWrongType
	}
];

testCases.forEach(function(testCase) {
	var Type = testCase.Type;
	var value = testCase.value;

	canReflect.each(matrix, function(definition, methodName) {
		var typeName = canReflect.getName(Type);
		var valueName = typeof value === "string" ? ("\"" + value + "\"") : value;
		var testName = typeName + " - " + methodName + " - " + valueName;

		QUnit.test(testName, function(assert) {
			var TypeDefinition = type[methodName](Type);

			try {
				var result = canReflect.convert(value, TypeDefinition);

				if(testCase[methodName] && testCase[methodName].check) {
					testCase[methodName].check(assert, result, value);
				} else {
					definition.check(assert, result, value);
				}
			} catch(err) {
				if(definition.throws) {
					definition.throws(assert);
				} else {
					throw err;
				}
			}
		});
	});
});


QUnit.test("type.Any works as an identity", function(assert) {
	var result = canReflect.convert(45, type.Any);
	assert.equal(result, 45, "Acts as a identity");
});

QUnit.test("type.late(fn) takes a function to define the type later", function(assert) {
	var theType = type.late(function() {
		return type.convert(Number);
	});
	var result = canReflect.convert("45", theType);
	assert.equal(result, 45, "Defined late but then converted");
});

dev.devOnlyTest("type.late(fn) where the underlying type value is a builtin becomes a strict type", function(assert) {
	var typeType = type.late(function() {
		return Number;
	});
	var result = canReflect.convert(45, typeType);
	assert.equal(result, 45, "works with numbers");

	try {
		canReflect.convert("45", typeType);
		assert.ok(false, "Should not have thrown");
	} catch(err) {
		assert.ok(err, "Got an error because it is strict");
	}
});

QUnit.test("type.isTypeObject determines if an object is a TypeObject", function(assert) {
	assert.equal(type.isTypeObject({}), false, "Plain objects are not");

	var myTypeObject = {};
	myTypeObject[canSymbol.for("can.new")] = function(){};
	myTypeObject[canSymbol.for("can.isMember")] = function(){};
	assert.equal(type.isTypeObject(myTypeObject), true, "With the symbols it is");

	var myTypeFunction = function(){};
	myTypeFunction[canSymbol.for("can.new")] = function(){};
	myTypeFunction[canSymbol.for("can.isMember")] = function(){};
	assert.equal(type.isTypeObject(myTypeFunction), true, "functions with the symbols are too");

	assert.equal(type.isTypeObject(null), false, "primitives are not");
	assert.equal(type.isTypeObject(undefined), false, "undefined is not");
	assert.equal(type.isTypeObject(23), false, "number primitives too");
	assert.equal(type.isTypeObject(String), false, "builtin constructors are not");
});

QUnit.test("type.normalize takes a Type and returns a TypeObject", function(assert) {
	[String, type.check(String), Date].forEach(function(Type) {
		var typeObject = type.normalize(Type);
		var name = canReflect.getName(Type);
		assert.equal(type.isTypeObject(typeObject), true, "Creates a typeobject for " + name);
	});

	[12, null, "foobar"].forEach(function(primitive) {
		try {
			type.normalize(primitive);
		} catch(err) {
			assert.ok(err, "Unable to normalize primitives");
		}
	});
});

QUnit.test("Should not be able to call new on a TypeObject", function(assert) {
	var typeObject = type.convert(Number);
	try {
		new typeObject();
		assert.ok(false, "Should not be able to call new");
	} catch(err) {
		assert.ok(err, "Got an error calling new");
	}
});

QUnit.test("Type equality", function(assert) {
	assert.strictEqual(type.convert(type.check(String)), type.convert(type.check(String)));
	assert.strictEqual(type.maybe(String), type.maybe(String));
});

dev.devOnlyTest("TypeObjects do not need to throw themselves", function(assert) {
	assert.expect(2);

	function isABC(str) {
		return "ABC".indexOf(str.toString()) !== -1;
	}

	var OnlyABC = {};
	OnlyABC[newSymbol] = function() {
		return "A";
	};
	OnlyABC[isMemberSymbol] = isABC;

	var StrictABC = type.check(OnlyABC);
	try {
		canReflect.convert("D", StrictABC);
	} catch(e) {
		assert.ok(true, "Throw because isMember failed");
	}

	var NotStrictABC = type.convert(StrictABC);
	var val = canReflect.convert("D", NotStrictABC);
	assert.equal(val, "A", "converted");
});

QUnit.test("Maybe types should always return a schema with an or", function(assert) {
	var schema = canReflect.getSchema(type.maybe(String));
	assert.deepEqual(schema.values, [String, null, undefined]);

	schema = canReflect.getSchema(type.convert(type.maybe(String)));
	assert.deepEqual(schema.values, [String, null, undefined]);

	schema = canReflect.getSchema(type.maybe(Boolean));
	assert.deepEqual(schema.values, [true, false, null, undefined]);

	schema = canReflect.getSchema(type.check(Boolean));
	assert.deepEqual(schema.values, [true, false]);

	schema = canReflect.getSchema(type.convert(type.maybe(Boolean)));
	assert.deepEqual(schema.values, [true, false, null, undefined]);

	schema = canReflect.getSchema(type.maybeConvert(Boolean));
	assert.deepEqual(schema.values, [true, false, null, undefined]);

	schema = canReflect.getSchema(type.maybe(type.convert(Boolean)));
	assert.deepEqual(schema.values, [true, false, null, undefined]);
});

QUnit.test("type.all converts objects", function(assert) {
	var Person = function(values) {
		canReflect.assignMap(this, values);
	};
	Person[newSymbol] = function(values) { return new Person(values); };
	Person[getSchemaSymbol] = function() {
		return {
			type: "map",
			identity: [],
			keys: {
				first: type.check(String),
				last: type.check(String),
				age: type.check(Number)
			}
		};
	};

	var ConvertingPerson = type.all(type.convert, Person);

	var person = canReflect.new(ConvertingPerson, { first: "Wilbur", last: "Phillips", age: "8" });
	assert.equal(typeof person.age, "number", "it is a number");
	assert.equal(person.first, "Wilbur");
	assert.equal(person.last, "Phillips");
	assert.equal(person.age, 8);
});

QUnit.test("type.convertAll is a convenience for type.all(type.convert, Type)", function(assert) {
	var Person = function() {};
	Person[newSymbol] = function(values) {
		return canReflect.assignMap(new Person(), values);
	};
	Person[isMemberSymbol] = function(value) { return value instanceof Person; };
	Person[getSchemaSymbol] = function() {
		return {
			type: "map",
			identity: [],
			keys: {
				first: type.check(String),
				last: type.check(String),
				age: type.check(Number)
			}
		};
	};

	var ConvertingPerson = type.convertAll(Person);

	var person = canReflect.new(ConvertingPerson, { first: "Wilbur", last: "Phillips", age: "8" });
	assert.equal(typeof person.age, "number", "it is a number");
	assert.equal(person.first, "Wilbur");
	assert.equal(person.last, "Phillips");
	assert.equal(person.age, 8);
});

QUnit.test("Subtypes convert correctly", function(assert) {
	var Animal = function(){};
	var Frog = function() {
		Animal.call(this, arguments);
	};
	Object.setPrototypeOf(Frog.prototype, Animal.prototype);
	Object.setPrototypeOf(Frog, Animal);

	type.convert(Animal);
	var ConvertingFrog = type.convert(Frog);

	var frog = canReflect.convert({}, ConvertingFrog);
	assert.ok(frog instanceof Frog, "a frog is a frog");
});

QUnit.test("Integer works with can-query-logic", function(assert) {
	var schema = {
		type: "map",
		identity: [],
		keys: {
			int: type.Integer
		}
	};

	var ql = new QueryLogic(schema);
	var ism = ql.isMember(
		{ filter: { int: {$gte: 5} } },
		{int: 5}
	);

	assert.equal(ism, true, "numbers are integers");
});

QUnit.test("Integer able to convert non-numbers", function(assert) {
	var res = canReflect.convert({}, type.Integer);
	assert.equal(res, 0, "converts to 0");

	res = canReflect.convert(33.3, type.Integer);
	assert.equal(res, 33, "converts numbers right still");

	res = canReflect.convert("33", type.Integer);
	assert.equal(res, 33, "converts strings");

	res = canReflect.convert(NaN, type.Integer);
	assert.equal(res, 0, "defaults to 0");
});
