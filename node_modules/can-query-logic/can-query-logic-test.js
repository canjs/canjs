require("./src/set-test");
require("./src/helpers-test");
require("./src/types/make-real-number-range-inclusive-test");
require("./src/types/comparisons-test");
require("./src/types/and-or-not-test");
require("./src/types/values-or-test");
require("./src/types/basic-query-test");
require("./src/types/basic-query-sorting-test");
require("./src/types/basic-query-filter-from-test");
require("./src/types/basic-query-merge-test");
require("./src/serializers/basic-query-test");
require("./src/serializers/comparisons-test");
require("./src/types/make-maybe-test");
require("./src/types/make-enum-test");
require("./src/types/values-and-test");
require("./compat/compat-test");
require("./test/special-comparison-logic-test");
require("./test/make-enum-logic-test");
require("./test/maybe-type-test");

var QUnit = require("steal-qunit");
var QueryLogic = require("can-query-logic");
var canReflect = require("can-reflect");


var algebra = new QueryLogic();


QUnit.module("can-query-logic");



QUnit.test("union", function(assert) {
	var unionResult = algebra.union({
		filter: {
			name: "Ramiya"
		}
	}, {
		filter: {
			name: "Bohdi"
		}
	});

	assert.deepEqual(unionResult, {
		filter: {
			name: {
				$in: ["Ramiya", "Bohdi"]
			},
		}
	});
});

QUnit.test("difference", function(assert) {
	var differenceResult = algebra.difference({
		filter: {
			name: {
				$in: ["Ramiya", "Bohdi"]
			}
		}
	}, {
		filter: {
			name: "Bohdi"
		}
	});

	assert.deepEqual(differenceResult, {
		filter: {
			name: "Ramiya",
		}
	});


});

QUnit.test("subset", function(assert) {
	var subsetResult = algebra.isSubset({
		filter: {
			name: "Bohdi"
		}
	}, {
		filter: {
			name: {
				$in: ["Ramiya", "Bohdi"]
			}
		}
	});

	assert.deepEqual(subsetResult, true);
});

QUnit.test("isMember", function(assert) {
	var hasResult = algebra.isMember({
		filter: {
			name: "Bohdi"
		}
	}, {
		name: "Bohdi"
	});

	assert.deepEqual(hasResult, true);
});

QUnit.test("filterMembers basics", function(assert) {
	var subset = algebra.filterMembers({
		filter: {
			name: {
				$in: ["Bohdi", "Ramiya"]
			}
		}
	}, {}, [{
			name: "Bohdi"
		},
		{
			name: "Ramiya"
		},
		{
			name: "Payal"
		},
		{
			name: "Justin"
		}
	]);

	assert.deepEqual(subset, [{
			name: "Bohdi"
		},
		{
			name: "Ramiya"
		}
	]);

	subset = algebra.filterMembers({
		filter: {
			name: {
				$in: ["Payal", "Ramiya", "Justin"]
			}
		},
		page: {
			start: "1",
			end: "2"
		}
	}, {}, [{
			name: "Bohdi"
		},
		{
			name: "Ramiya"
		},
		{
			name: "Payal"
		},
		{
			name: "Justin"
		}
	]);

	assert.deepEqual(subset, [{
			name: "Payal"
		},
		{
			name: "Justin"
		}
	]);
});


QUnit.test("unionMembers basics", function(assert) {
	var union = algebra.unionMembers({
		filter: {
			name: "Bohdi"
		}
	}, {
		filter: {
			name: "Ramiya"
		}
	}, [{
		name: "Bohdi",
		id: 1
	}, ], [{
		name: "Ramiya",
		id: 2
	}, ]);

	assert.deepEqual(union, [{
			name: "Bohdi",
			id: 1
		},
		{
			name: "Ramiya",
			id: 2
		}
	]);
});

QUnit.test("count basics", function(assert) {

	assert.equal(algebra.count({}), Infinity);
	assert.equal(algebra.count({
		page: {
			start: 1,
			end: 2
		}
	}), 2);


});

QUnit.test('index basics', function(assert) {

	var index = algebra.index({
			sort: "name"
		},
		[{
			id: 1,
			name: "g"
		}, {
			id: 2,
			name: "j"
		}, {
			id: 3,
			name: "m"
		}, {
			id: 4,
			name: "s"
		}], {
			name: "k"
		});
	assert.equal(index, 2);

	index = algebra.index({
			sort: "-name"
		},
		[{
			id: 1,
			name: "g"
		}, {
			id: 2,
			name: "j"
		}, {
			id: 3,
			name: "m"
		}, {
			id: 4,
			name: "s"
		}].reverse(), {
			name: "k"
		});
	assert.equal(index, 2);

	index = algebra.index({},
		[{
			id: 1,
			name: "g"
		}, {
			id: 2,
			name: "j"
		}, {
			id: 3,
			name: "m"
		}, {
			id: 4,
			name: "s"
		}], {
			id: 0,
			name: "k"
		});

	assert.equal(index, 0);


	index = algebra.index({},
		[{
			id: 1,
			name: "g"
		}, {
			id: 2,
			name: "j"
		}, {
			id: 3,
			name: "m"
		}, {
			id: 4,
			name: "s"
		}], {
			name: "k"
		});

	assert.equal(index, undefined, "no value if no id");

	var TODO_id = canReflect.assignSymbols({}, {
		"can.getSchema": function() {
			return {
				kind: "record",
				identity: ["_id"],
				keys: {
					id: Number,
					points: Number,
					complete: Boolean,
					name: String
				}
			};
		}
	});
	var algebra2 = new QueryLogic(TODO_id);

	index = algebra2.index({},
		[{
			id: 1,
			_id: 0
		}, {
			id: 2,
			_id: 1
		}, {
			id: 3,
			_id: 3
		}, {
			id: 4,
			_id: 4
		}], {
			id: 0,
			_id: 2
		});

	assert.equal(index, 2);

	//var algebra = new set.Algebra(set.props.id("id"));

});

QUnit.test("filterMembers with reverse sort", function(assert) {
	var sortedMembers = algebra.filterMembers({
			sort: "-name"
		},
		[{
			id: 1,
			name: "a"
		}, {
			id: 2,
			name: "z"
		}, {
			id: 3,
			name: "f"
		}, {
			id: 4,
			name: "s"
		}]);

	assert.deepEqual(sortedMembers,
		[{
			id: 2,
			name: "z"
		}, {
			id: 4,
			name: "s"
		}, {
			id: 3,
			name: "f"
		}, {
			id: 1,
			name: "a"
		}]);
});

QUnit.test("isPaginated, removePagination", function(assert) {
	assert.equal(algebra.isPaginated({}), false, "universe is not paginated");
	assert.equal(algebra.isPaginated({
		filter: {
			foo: "bar"
		}
	}), false, "filter is not paginated");
	assert.equal(algebra.isPaginated({
		sort: "bar"
	}), false, "sort is not paginated");

	assert.equal(algebra.isPaginated({
		page: {
			start: 1,
			end: 2
		}
	}), true, "page is paginated");


	assert.deepEqual(algebra.removePagination({}), {}, "removePagination universe");
	assert.deepEqual(algebra.removePagination({
		filter: {
			foo: "bar"
		}
	}), {
		filter: {
			foo: "bar"
		}
	}, "removePagination filter");
	assert.deepEqual(algebra.removePagination({
		sort: "bar"
	}), {
		sort: "bar"
	}, "removePagination sort");

	assert.deepEqual(algebra.removePagination({
		page: {
			start: 1,
			end: 2
		}
	}), {}, "removePagination page");

});

QUnit.test("Value returned by makeEnum is constructorLike", function(assert) {
	var Status = QueryLogic.makeEnum(["new", "preparing", "delivery", "delivered"]);
	var pass = canReflect.isConstructorLike(Status);

	assert.ok(pass, "Status is constructor like");
});

QUnit.test("can call low-level APIs from the outside", function(assert) {
	var gt1 = new QueryLogic.GreaterThan(1);
	var lte1 = new QueryLogic.LessThanEqual(1);

	assert.equal(QueryLogic.intersection(gt1, lte1), QueryLogic.EMPTY);


	var isGtJustinAndGt35 = new QueryLogic.KeysAnd({
		name: new QueryLogic.GreaterThan("Justin"),
		age: new QueryLogic.GreaterThan(35)
	});
	var isGt25 = new QueryLogic.KeysAnd({
		age: new QueryLogic.GreaterThan(25)
	});

	assert.deepEqual(QueryLogic.union(isGtJustinAndGt35, isGt25), isGt25, "fewer clauses");

});
