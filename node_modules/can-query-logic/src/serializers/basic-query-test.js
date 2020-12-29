var QUnit = require("steal-qunit");
var makeBasicQueryConvert = require("./basic-query");
var canReflect = require("can-reflect");
var logicTypes = require("../types/and-or-not");
var is = require("../types/comparisons");
var makeMaybe = require("../types/make-maybe");
var testHelpers = require("can-test-helpers");
var ValuesAnd = require("../types/values-and");

QUnit.module("can-query-logic/serializers/basic-query");

var EmptySchema = {
    kind: "record",
    identity: ["id"],
    keys: {}
};




QUnit.test("basics", function(assert) {
    var query = {
        filter: {foo: "bar"}
    };

    var converter = makeBasicQueryConvert(EmptySchema);

    var basicQuery = converter.hydrate(query);

    var returnedQuery = converter.serializer.serialize(basicQuery);

    assert.deepEqual(returnedQuery, query, "got back what we give");
});

QUnit.test("nested properties", function(assert) {
    var query = {
        filter: {
            name: {
                first: "justin"
            }
        }
    };

    var converter = makeBasicQueryConvert(EmptySchema);

    var basicQuery = converter.hydrate(query);


    assert.deepEqual(basicQuery.filter, new logicTypes.KeysAnd({
        name: new logicTypes.KeysAnd({first: new is.In(["justin"])})
    }), "adds nested ands");
});


QUnit.test("$or with the same types unify into maybe", function(assert) {

    var MaybeSet = makeMaybe([null]);

    var converter = makeBasicQueryConvert({
        identity: ["id"],
        keys: {
            age: canReflect.assignSymbols({},{"can.SetType": MaybeSet}),
            foo: String
        }
    });

    var query = {
        filter: {
            $or: [
                { foo: "bar", age: {$gt: 3}},
                { foo: "bar", age: null}
            ]
        }
    };

    var basicQuery = converter.hydrate(query);

    assert.deepEqual(basicQuery.filter, new logicTypes.KeysAnd({
        foo: new is.In(["bar"]),
        age: new MaybeSet({
            range: new is.GreaterThan(3),
            enum: new is.In([null])
        })
    }));

    var res = converter.serializer.serialize(basicQuery);
    assert.deepEqual(res, {
        filter: {
            $or: [
                { foo: "bar", age: {$gt: 3}},
                { foo: "bar", age: null}
            ]
        }
    }, "serialized");
});

QUnit.test("auto-convert or schema into maybe type", function(assert) {
    var MaybeNumber = canReflect.assignSymbols({},{
        "can.new": function(val){
            if (val == null) {
    			return val;
    		}
    		return +(val);
        },
        "can.getSchema": function(){
            return {
                type: "Or",
                values: [Number, undefined, null]
            };
        }
    });

    var converter = makeBasicQueryConvert({
        identity: ["id"],
        keys: {
            age: MaybeNumber,
            foo: String
        }
    });

    var query = {
        filter: {
            $or: [
                { foo: "bar", age: {$gt: "3"}},
                { foo: "bar", age: null}
            ]
        }
    };

    var basicQuery = converter.hydrate(query);

    /*assert.deepEqual(basicQuery.filter, new logicTypes.KeysAnd({
        foo: new is.In(["bar"]),
        age: new MaybeSet({
            range: new is.GreaterThan(3),
            enum: new is.In([null])
        })
    }));*/

    var res = converter.serializer.serialize(basicQuery);

    assert.deepEqual(res, {
        filter: {
            $or: [
                { foo: "bar", age: {$gt: 3}},
                { foo: "bar", age: null}
            ]
        }
    }, "serialized");
});


testHelpers.dev.devOnlyTest("warn if query properties are not defined (#8)", function (assert) {
	assert.expect(3);

	var message = "can-query-logic: Ignoring keys: start, end.";
	var finishErrorCheck = testHelpers.dev.willWarn(message, function(actualMessage, success) {
		assert.equal(actualMessage, message, "Warning is expected message");
		assert.ok(success);
	});


    var query = {
        filter: {
            name: {
                first: "justin"
            }
        },
        start: 0,
        end: 1
    };

    var converter = makeBasicQueryConvert(EmptySchema);

    converter.hydrate(query);
    assert.equal(finishErrorCheck(), 1);
});

QUnit.test("gt and lt", function(assert) {
    var query = {
        filter: {
            age: {
                $gt: 0,
                $lt: 100
            }
        }
    };

    var converter = makeBasicQueryConvert(EmptySchema);

    var basicQuery = converter.hydrate(query);

    assert.deepEqual(basicQuery.filter, new logicTypes.KeysAnd({
        age: new is.And([
            new is.GreaterThan(0),
            new is.LessThan(100)
        ])
    }));

    var res = converter.serializer.serialize(basicQuery);

    assert.deepEqual(res, {
        filter: {
            age: {
                $gt: 0,
                $lt: 100
            }
        }
    });

});

QUnit.test("basicquery with no sort", function(assert) {
	var query = {};

	var converter = makeBasicQueryConvert({
		identity: ["id"],
		type: "map",
		keys: {
			id: function(val) { return val; }
		}
	});
	var basicQuery = converter.hydrate(query);

	var objs = [{id: 0}, {id: 2}];
	var item = {id: 1};

	var res = basicQuery.index(item, objs);
	assert.equal(res, 1, "inserted at 1");
});

/*
QUnit.skip("nested properties within ors", function(){
    var query = {
        filter: {
            name: [{ first: "justin" }, { last: "meyer" }]
        }
    };

    var converter = makeBasicQueryConvert(EmptySchema);

    var basicQuery = converter.hydrate(query);

    assert.deepEqual(basicQuery.filter, new logicTypes.KeysAnd({
        name: new logicTypes.KeysAnd({first: new is.In(["justin"])})
    }), "adds nested ands");
});
*/

QUnit.test("Complex queries with nested $not, $all", function(assert) {
	var query = {
		filter: {
			$and: [
				{tags: {$all: ['sbux']}},
				{tags: {$not: {$all: ['dfw']}}}
			]
		}
	};

	var converter = makeBasicQueryConvert(EmptySchema);
	var basicQuery = converter.hydrate(query);

	assert.ok(basicQuery.filter instanceof ValuesAnd);

	var res = converter.serializer.serialize(basicQuery);
	assert.deepEqual(res, query);
});

QUnit.test("Inverting $not comparisons", function(assert) {
	[
		{
			query: {filter: {age:{$not: {$lt: 5}}} },
			expectedInstance: is.GreaterThanEqual,
			expectedValue: 5
		},
		{
			query: {filter: {age:{$not: {$lte: 5}}} },
			expectedInstance: is.GreaterThan,
			expectedValue: 5
		},
		{
			query: {filter: {age:{$not: {$gt: 5}}}},
			expectedInstance: is.LessThanEqual,
			expectedValue: 5
		},
		{
			query: {filter: {age:{$not: {$gte: 5}}}},
			expectedInstance: is.LessThan,
			expectedValue: 5
		},
		{
			query: {filter: {age:{$not: {$in: [2, 3]}}}},
			expectedInstance: is.NotIn,
			expectedValue: [2, 3],
			valueProp: "values"
		},
		{
			query: {filter: {age:{$not: {$nin: [2, 3]}}}},
			expectedInstance: is.In,
			expectedValue: [2, 3],
			valueProp: "values"
		}
	].forEach(function(options) {
		var query = options.query;
		var ExpectedInstance = options.expectedInstance;
		var expectedValue = options.expectedValue;
		var prop = options.valueProp || "value";

		var converter = makeBasicQueryConvert(EmptySchema);
		var basicQuery = converter.hydrate(query);

		assert.ok(basicQuery.filter.values.age instanceof ExpectedInstance, "changed to right instance type");
		assert.deepEqual(basicQuery.filter.values.age[prop],
			expectedValue, "has the correct value");

	});
});
