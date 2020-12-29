var QUnit = require("steal-qunit");
var cacheRequests = require("../cache-requests/");
var memCache = require("../data/memory-cache/");
var connect = require("../can-connect");
var map = [].map;
var canSet = require("can-set-legacy");

var set = require("can-set-legacy");

var getId = function(d) {
	return d.id;
};

QUnit.module("can-connect/cache-requests/",{
	beforeEach: function(assert) {

	}
});


QUnit.test("Get everything and all future requests should hit cache", function(assert) {
	var count = 0;
	var done = assert.async();

	var res = cacheRequests( {
		getListData: function(params){

			assert.deepEqual(params,{},"called for everything");
			count++;
			assert.equal(count,1,"only called once");
			return Promise.resolve([
				{id: 1, type: "critical", due: "today"},
				{id: 2, type: "notcritical", due: "today"},
				{id: 3, type: "critical", due: "yesterday"},
				{id: 4},
				{id: 5, type: "critical"},
				{id: 6, due: "yesterday"}
			]);
		},
		cacheConnection: memCache(connect.base({queryLogic: new canSet.Algebra()})),
		queryLogic: new canSet.Algebra()
	} );

	res.getListData({}).then(function(list){
		assert.deepEqual(map.call(list, getId), [1,2,3,4,5,6]);

		return res.getListData({type: "critical"});
	}).then(function(list) {
		assert.deepEqual(map.call(list.data, getId), [1,3,5]);

		return res.getListData({due: "today"});
	}).then(function(list) {
		assert.deepEqual(map.call(list.data, getId), [1,2]);
		done();
	}).then(null, function(error) {
		assert.ok(false, error);
		return Promise.reject(error);
	});
});



QUnit.test("Incrementally load data", function(assert) {
	var done = assert.async();
	var count = 0;

	var queryLogic = new canSet.Algebra( set.props.rangeInclusive("start","end") );

	var behavior = cacheRequests( {
		getListData: function(params){
			assert.equal(params.start, count * 10 + 1, "start is right "+params.start);
			count++;
			assert.equal(params.end, count * 10, "end is right "+params.end);


			var items = [];
			for(var i= (+params.start); i <= (+params.end); i++) {
				items.push({
					id: i
				});
			}
			return Promise.resolve({data: items});
		},
		queryLogic: queryLogic,
		cacheConnection: memCache(connect.base({queryLogic: queryLogic}))
	} );


	behavior.getListData({
		start: 1,
		end: 10
	}).then(function(listData){
		var list = listData.data;
		assert.equal(list.length, 10, "got 10 items");
		assert.equal(list[0].id, 1,"first id is right");
		assert.equal(list[9].id, 10, "second id is right");

		behavior.getListData({
			start: 1,
			end: 20
		}).then(function(listData){
			var list = listData.data;
			assert.equal(list.length, 20, "got 20 items");
			assert.equal(list[0].id, 1, "0th object's id'");
			assert.equal(list[19].id, 20, "19th object's id");


			behavior.getListData({start: 9, end: 12}).then(function(listData){
				var list = listData.data;
				assert.equal(list.length, 4, "got 4 items");
				assert.equal(list[0].id, 9);
				assert.equal(list[3].id, 12);
				done();
			});



		});

	});

});

QUnit.test("Filters are preserved for different pagination", function(assert) {
	var done = assert.async();
	var isSecondRun = false;

	var queryLogic = new set.Algebra(
		set.props.id('id'),
		set.props.offsetLimit('$skip', '$limit'),
		set.props.sort('$sort')
	);

	var params = {
		$limit: 10,
		$skip: 0,
		type: "a",
		$sort: "price",
	};
	var params2 = {
		$limit: 25,
		$skip: 0,
		type: "a",
		$sort: "price",
	};

	var behavior = cacheRequests( {
		getListData: function(params){
			assert.equal(params.$skip, isSecondRun ? 10 : 0, "$skip is right "+params.$skip);
			assert.equal(params.$limit, isSecondRun ? 15 : 10, "$limit is right "+params.$limit);
			assert.equal(params.$sort, "price", "$sort is right "+params.$sort);
			assert.equal(params.type, "a", "type is right "+params.type);

			var items = [];
			for(var i = (+params.$skip); i < (+params.$skip + (+params.$limit)); i++) {
				items.push({
					id: i,
					price: i * 10,
					type: "a"
				});
			}
			isSecondRun = true;
			return Promise.resolve({data: items});
		},
		queryLogic: queryLogic,
		cacheConnection: memCache(connect.base({queryLogic: queryLogic}))
	} );


	behavior.getListData(params).then(function(listData){
		var list = listData.data;
		assert.equal(list.length, 10, "got 10 items");

		return behavior.getListData(params2);
	}).then(function(listData){
		var list = listData.data;
		assert.equal(list.length, 25, "got 25 items");
		done();
	});
});


var memoryStore = memCache;

var QueryLogic = require("can-query-logic");
QUnit.test("QueryLogic usage example", function(assert) {
	var calls = 0;

	var dataUrl = {
		getListData: function(query){
			if(calls++ === 0) {
				return Promise.resolve({
					data: [{id: 1, status: "critical"}]
				});
			} else {
				assert.deepEqual(query, {filter: {status: ["low","medium"]}}, "query made right");
				return Promise.resolve({
					data: [{id: 2, status: "low"}]
				});
			}
		}
	};

	var todoQueryLogic = new QueryLogic({
		keys: {
			status: QueryLogic.makeEnum(["low","medium","critical"])
		}
	});

	var cacheConnection = memoryStore({queryLogic: todoQueryLogic});
	var todoConnection = connect([dataUrl, cacheRequests], {
		cacheConnection: cacheConnection,
		url: "/todos",
		queryLogic: todoQueryLogic
	});
	var done = assert.async();

	todoConnection.getListData({filter: {status: "critical"}}).then(function(){
		return todoConnection.getListData({});
	}).then(function(){
		done();
	});

});
