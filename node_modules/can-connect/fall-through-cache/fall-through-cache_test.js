var QUnit = require("steal-qunit");
var connect = require("../can-connect");
var map = [].map;
var testHelpers = require("../test-helpers");

var constructor = require("../constructor/constructor");
var fallThroughCache = require("../fall-through-cache/fall-through-cache");
var constructorStore = require("../constructor/store/store");
var QueryLogic = require("can-query-logic");

var getId = function(d){
	return d.id;
};

constructorStore.requestCleanupDelay = 1;

QUnit.module("can-connect/fall-through-cache");

QUnit.test("basics", function(assert) {
	var done = assert.async();
	var firstItems = [ {id: 0, foo: "bar"}, {id: 1, foo: "bar"} ];
	var secondItems = [ {id: 1, foo: "BAZ"}, {id: 2, foo: "bar"} ];

	var state = testHelpers.makeStateChecker(assert, done, ["cache-getListData-empty",
		"base-getListData",
		"cache-updateListData",
		"connection-foundAll",


		"connection-getList-2",
		"cache-getListData-items",
		"connection-foundAll-2",
		"base-getListData-2",
		"cache-updateListData-2",
		"updatedList"] );


	var cacheConnection = connect([function(){
		return {
			getListData: function(){
				// nothing here first time
				if(state.get() === "cache-getListData-empty") {
					state.next();
					return testHelpers.asyncReject();
				} else {
					state.check(assert, "cache-getListData-items");
					return testHelpers.asyncResolve({data: firstItems.slice(0) });
				}
			},
			updateListData: function(data, set) {
				if(state.get() === "cache-updateListData") {
					state.next();
					assert.deepEqual(set,{},"got the right set");
					assert.deepEqual(data.data,firstItems, "updateListData items are right");
					return testHelpers.asyncResolve();
				} else {
					assert.deepEqual(data.data,secondItems, "updateListData 2 items are right");
					state.check(assert, "cache-updateListData-2");
					return testHelpers.asyncResolve();
				}
			}
		};
	}],{
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	var base = function(base, options){
		return {
			getListData: function(){
				if(state.get() === "base-getListData") {
					state.next();
					return testHelpers.asyncResolve({data: firstItems.slice(0) });
				} else {
					state.check(assert, "base-getListData-2");
					return testHelpers.asyncResolve({data: secondItems.slice(0) });
				}
			},
			getData: function(){}
		};
	};
	var updater = function(){
		return {
			updatedList: function(list, updated){
				state.check(assert, "updatedList");
				assert.deepEqual( map.call(updated.data, getId), map.call(secondItems, getId) );
				done();
			}
		};
	};

	var connection = connect([base, constructor,fallThroughCache,constructorStore,updater],{
		cacheConnection: cacheConnection,
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	// first time, it takes the whole time
	connection.getList({}).then(function( list ){
		state.check(assert, "connection-foundAll");
		assert.deepEqual( map.call(list, getId), map.call(firstItems, getId) );
		setTimeout(secondCall, 1);
	}, testHelpers.logErrorAndStart(assert, done));

	function secondCall() {
		state.check(assert, "connection-getList-2");
		connection.getList({}).then(function(list){
			state.check(assert, "connection-foundAll-2");
			assert.deepEqual( map.call(list, getId), map.call(firstItems, getId) );
		}, testHelpers.logErrorAndStart(assert, done));
	}



	// second time, it should return the original list from localStorage

	// but then update the list as the request goes out

});


QUnit.test("getInstance and getData", function(assert) {
	var done = assert.async();
	var firstData =  {id: 0, foo: "bar"};
	var secondData = {id: 0, foo: "BAR"};

	var state = testHelpers.makeStateChecker(assert, done, ["cache-getData-empty",
		"base-getData",
		"cache-updateData",
		"connection-foundOne",
		"connection-getInstance-2",
		"cache-getData-item",

		"connection-foundOne-2",
		"base-getData-2",
		"cache-updateData-2",
		"updatedInstance"] );


	var cacheConnection = connect([function(){
		return {
			getData: function(){
				// nothing here first time
				if(state.get() === "cache-getData-empty") {
					state.next();
					return testHelpers.asyncReject();
				} else {
					state.check(assert, "cache-getData-item");
					return testHelpers.asyncResolve(firstData);
				}
			},
			updateData: function(data) {
				if(state.get() === "cache-updateData") {
					state.next();
					assert.deepEqual(data,firstData, "updateData items are right");
					return testHelpers.asyncResolve();
				} else {
					//debugger;
					assert.deepEqual(data,secondData, "updateData 2 items are right");
					state.check(assert, "cache-updateData-2");
					return testHelpers.asyncResolve();
				}
			}
		};
	}],{
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	var base = function(base, options){
		return {
			getData: function(){
				if(state.get() === "base-getData") {
					state.next();
					return testHelpers.asyncResolve({id: 0, foo: "bar"});
				} else {
					//debugger;
					state.check(assert, "base-getData-2");
					return testHelpers.asyncResolve({id: 0, foo: "BAR"});
				}
			},
			getListData: function(){}
		};
	};
	var updater = function(){
		return {
			updatedInstance: function(instance, data){
				state.check(assert, "updatedInstance");
				assert.deepEqual( data,secondData );
				done();
			}
		};
	};

	var connection = connect([base, constructor,fallThroughCache,constructorStore, updater],{
		cacheConnection: cacheConnection,
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	// first time, it takes the whole time
	connection.get({id: 0}).then(function( instance ){
		state.check(assert, "connection-foundOne");
		assert.deepEqual( instance, {id: 0, foo: "bar"} );
		setTimeout(secondCall, 1);
	}, testHelpers.logErrorAndStart(assert, done));

	function secondCall() {
		state.check(assert, "connection-getInstance-2");
		connection.get({id: 0}).then(function(instance){
			state.check(assert, "connection-foundOne-2");
			assert.deepEqual( instance, {id: 0, foo: "bar"}  );
		}, testHelpers.logErrorAndStart(assert, done));
	}

});

QUnit.test("metadata transfered through fall through cache (#125)", function(assert) {
    var ready = assert.async();
    var getDataBehaviorDataPromise;
    var cacheConnection = {
		getListData: function(){
			return testHelpers.asyncResolve({data: [{id: 1}]});
		},
		updateListData: function(){}
	};

    var getDataBehavior = function(base, options){
		return {
			getListData: function(){
				getDataBehaviorDataPromise = testHelpers.asyncResolve({data: [{id: 1}], count: 5});
				return getDataBehaviorDataPromise;
			},
			getData: function(){}
		};
	};

    var connection = connect([getDataBehavior,constructor,fallThroughCache,constructorStore],{
		cacheConnection: cacheConnection,
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

    connection.getList({}).then(function(list){
		setTimeout(function(){
			getDataBehaviorDataPromise.then(function() {
				assert.equal(list.count, 5, "expando added");
				ready();
			});
		}, 50);
	});
});
