var QueryLogic = require("../can-query-logic");
var QUnit = require("steal-qunit");
var canReflect = require("can-reflect");

QUnit.module("can-query-logic with maybe type");

QUnit.test("basics", function(assert) {
	// Goal here is so the type doesn't have to know about `can-query-logic`,
	// but when passed to can-query-logic, it knows what to do.
	//

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

	var todoQueryLogic = new QueryLogic({
		keys: {
			age: MaybeNumber
		}
	});
	/*
	var res = todoQueryLogic.difference(
		{},
		{filter: {age: {$gt: 5}}});

	assert.deepEqual(res.filter,
		{$or: [
			{age: {$lte: 5} },
			{age: {$in: [undefined, null]}}
		]},
		"difference works");

	var query = todoQueryLogic.hydrate({filter: {age: 21}});

	var serialized = todoQueryLogic.serialize(query);
	assert.deepEqual( serialized, {filter: {age: 21}}, "can serialize back to what was provided" );

	res = todoQueryLogic.difference({},{
		filter: {
			age: {
				$gt: 3,
				$lt: 7
			}
		}
	});

	assert.deepEqual(res.filter,
		{$or: [
			{age: {$gte: 7} },
			{age: {$lte: 3} },
			{age: {$in: [undefined, null]}}
		]});*/


	var unionized = todoQueryLogic.union(
		{filter: {age: 7}},
		{filter: {age: "07"}}
	);

	assert.deepEqual(unionized, {filter: {age: 7}}, "string numbers are converted to numbers");

});


QUnit.test("MaybeDate", function(assert) {
	// Goal here is so the type doesn't have to know about `can-query-logic`,
	// but when passed to can-query-logic, it knows what to do.
	function toDate(str) {
		var type = typeof str;
		if (type === 'string') {
			str = Date.parse(str);
			return isNaN(str) ? null : new Date(str);
		} else if (type === 'number') {
			return new Date(str);
		} else {
			return str;
		}
	}

	function DateStringSet(dateStr){
		this.setValue = dateStr;
		var date = toDate(dateStr);
		this.value = date == null ? date : date.getTime();
	}

	DateStringSet.prototype.valueOf = function(){
		return this.value;
	};
	canReflect.assignSymbols(DateStringSet.prototype,{
		"can.serialize": function(){
			return this.setValue;
		}
	});

	var MaybeDate = canReflect.assignSymbols({},{
		"can.new": toDate,
		"can.getSchema": function(){
			return {
				type: "Or",
				values: [Date, undefined, null]
			};
		},
		"can.ComparisonSetType": DateStringSet
	});

	var todoQueryLogic = new QueryLogic({
		keys: {
			due: MaybeDate
		}
	});
	/*
	var date1982_10_20 = new Date(1982,9,20).toString();

	var res = todoQueryLogic.difference(
		{},
		{filter: {due: {$gt: date1982_10_20}}});

	assert.deepEqual(res.filter,
		{$or: [
			{due: {$lte: date1982_10_20} },
			{due: {$in: [undefined, null]}}
		]},
		"difference works");

	var gt1982 = {filter: {due: {$gt: date1982_10_20}}};

	assert.ok( todoQueryLogic.isMember(gt1982,{
		id: 0,
		due: new Date(2000,0,1)
	}), "works with a date object");

	assert.ok( todoQueryLogic.isMember(gt1982,{
		id: 0,
		due: new Date(2000,0,1).toString()
	}), "works with a string date");

	assert.ok( todoQueryLogic.isMember(gt1982,{
		id: 0,
		due: new Date(2000,0,1).getTime()
	}), "works with a integer date");

	assert.notOk( todoQueryLogic.isMember(gt1982,{
		id: 0,
		due: new Date(1970,0,1).getTime()
	}), "doesn't fail if falsey");

	assert.notOk( todoQueryLogic.isMember(gt1982,{
		id: 0,
		due: null
	}), "doesn't fail if falsey");

	assert.ok( todoQueryLogic.isMember({filter: {due: {$in: [null,undefined]}}},{
		id: 0,
		due: null
	}), "works if using in");*/

	var store = [
		{
			id: 1,
			due: null
		},
		{
			id: 2,
			due: new Date(2001,0,1).toString()
		},
		{
			id: 3,
			due: new Date(2000,0,1).toString()
		},
		{
			id: 4,
			due: null
		}
	];

	var results = todoQueryLogic.filterMembers({
		sort: "due"
	}, store);

	assert.deepEqual(results, [
		{
			id: 1,
			due: null
		},
		{
			id: 4,
			due: null
		},
		{
			id: 3,
			due: new Date(2000,0,1).toString()
		},
		{
			id: 2,
			due: new Date(2001,0,1).toString()
		}
	]);
});
