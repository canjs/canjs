var QUnit = require("steal-qunit");
var comparisons = require("./comparisons");
var canReflect = require("can-reflect");
var ValuesNot = require("../types/values-not");

QUnit.module("can-query-logic/serializers/comparisons");

QUnit.test("hydrate and serialize with custom types that work with operators", function(assert) {
	var Type = function(value){
		this.value = value;
	};

	canReflect.assignSymbols(Type.prototype,{
		"can.serialize": function(){
			return this.value;
		}
	});

	var hydrated = comparisons.hydrate({$in: [1,2]}, function(value){
		return new Type(value);
	});

	assert.deepEqual(hydrated.values, [
		new Type(1),
		new Type(2)
	], "hydrated");

	var serialized = comparisons.serializer.serialize(hydrated);

	assert.deepEqual(serialized,{
		$in: [1,2]
	}, "serialized");
});

QUnit.test("unknown hydrator is called in all cases", function(assert) {
	var hydrated = [];
	var addToHydrated = function(value){
		hydrated.push(value);
	};

	comparisons.hydrate({$in: [1,2]}, addToHydrated);
	comparisons.hydrate("abc", addToHydrated);
	comparisons.hydrate(["x","y"], addToHydrated);

	assert.deepEqual(hydrated, [1,2, "abc","x","y"], "hydrated called with the right stuff");
});


QUnit.test("$not and $all can work recursively", function(assert){
	// WHat if {$not: 1} //-> is.NotIn([1]) | new is.ValuesNot(new is.In([1]))
	var hydrated = comparisons.hydrate( {$not: {$all: ['def']}}, function(value){
		return value;
	} );

	assert.ok(hydrated instanceof ValuesNot, "is an instance");
});
