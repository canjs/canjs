var BasicQuery = require("./basic-query");
var QUnit = require("steal-qunit");
var KeysAnd = require("./keys-and");
var ValuesAnd = require("./values-and");

QUnit.module("can-query-logic/types/basic-query filterMembersAndGetCount");

QUnit.test("Able to filter on a universal set", function(assert) {
	var parent = new BasicQuery({
		filter: new KeysAnd({})
	});
	var bData = [{},{}];

	var FooType = function(value) { this.value = value; };
	FooType.prototype.isMember = function() {
		return true;
	};

	var root = new BasicQuery({
	    filter: new ValuesAnd([
	    	new FooType()
	    ])
	});

	var res = root.filterMembersAndGetCount(bData, parent);
	assert.equal(res.count, 2, "got all members");
});

QUnit.test("Page is a universal set", function(assert) {
	var parent = new BasicQuery({
		filter: new KeysAnd({})
	});
	var bData = [{},{}];

	var FooType = function(value) { this.value = value; };
	FooType.prototype.isMember = function() {
		return true;
	};

	var root = new BasicQuery({
		filter: new ValuesAnd([
			new FooType()
		]),
		page: new BasicQuery.RecordRange(1,2)
	});

	var res = root.filterMembersAndGetCount(bData, parent);
	assert.equal(res.count, 2, "got all members");
});
