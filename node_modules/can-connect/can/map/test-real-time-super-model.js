"use strict";
var QUnit = require("steal-qunit");

var canReflect = require("can-reflect");
var fixture = require("can-fixture");
// load connections
var testHelpers = require("../../test-helpers");
var assign = canReflect.assignMap;
var map = [].map;
var later = testHelpers.later;
var makeRealTimeSuperModel = require("./make-real-time-super-model");
var constructorStore = require("../../constructor/store/store");
constructorStore.requestCleanupDelay = 1;

var cleanUndefineds = function(obj) {
	if(Array.isArray(obj)) {
		return obj.map(cleanUndefineds);
	} else {
		var res = {};
		for(var prop in obj) {
			if(obj[prop] !== undefined) {
				res[prop] = obj[prop];
			}
		}
		return res;
	}
};

module.exports = function(makeTypes){

    QUnit.test("real-time super model", function(assert) {
		var types = makeTypes.call(this);


        var connection = makeRealTimeSuperModel(types.Todo, types.TodoList),
    		cacheConnection = connection.cacheConnection,
    		Todo = connection.Map;

    	var firstItems = [ {id: 0, type: "important"}, {id: 1, type: "important"} ];
    	var secondItems = [ {id: 2, due: "today"}, {id: 3, due: "today"} ];

      var done = assert.async();

    	var state = testHelpers.makeStateChecker(assert, done, [
    		"getListData-important",
    		"getListData-today",
    		"createData-today+important",
    		"updateData-important",
    		"updateData-today",
    		"destroyData-important-1",
    		"getListData-today-2"
    	]);

    	fixture({
    		"GET /services/todos": function(){
    			if(state.get() === "getListData-important") {
    				state.next();
    				return {data: firstItems.slice(0) };
    			} else if(state.get() === "getListData-today"){
    				state.next();
    				return {data: secondItems.slice(0) };
    			} else {
    				state.check(assert, "getListData-today-2");
    				return { data: secondItems.slice(1) };
    			}
    		},
    		"POST /services/todos": function(request){
    			if( state.get() === "createData-today+important" ) {
    				state.next();
    				// todo change to all props
    				return assign({id: 10}, request.data);
    			}
    		},
    		"PUT /services/todos/{id}": function(request){
    			if( state.get() === "updateData-important" || state.get() === "updateData-today" ) {
    				state.next();
    				// todo change to all props
    				return assign({},request.data);
    			} else {
    				assert.ok(false, "bad state!");
    				done();
    			}
    		},
    		"DELETE /services/todos/{id}": function(request){
    			if(state.get() === "destroyData-important-1") {
    				state.next();
    				// todo change to all props

					return assign({destroyed:  1},request.data);
    			}
    		}
    	});

    	function checkCache(name, set, expectData, next) {
    		cacheConnection.getListData(set).then(function(data){
    			assert.deepEqual(map.call(data.data, testHelpers.getId),
    					  map.call(expectData, testHelpers.getId), name);
    			setTimeout(next, 1);
    		});
    	}



    	var importantList,
    		todayList,
    		bindFunc = function(){
    			// console.log("length changing");
    		};

    	Promise.all([connection.getList({type: "important"}), connection.getList({due: "today"})])
    		.then(function(result){

    		importantList = result[0];
    		todayList = result[1];

    		canReflect.onKeyValue( importantList, "length", bindFunc);
    		canReflect.onKeyValue( todayList, "length",bindFunc);

    		setTimeout(createImportantToday,1);

    	}, testHelpers.logErrorAndStart(assert, done));

    	var created;
    	function createImportantToday() {
    		connection.save(new Todo({
    			type: "important",
    			due: "today",
    			createId: 1
    		})).then( function(task){
    			created = task;
    			canReflect.onKeyValue( task,"type",bindFunc);
    			setTimeout(checkLists, 1);
    		}, testHelpers.logErrorAndStart(assert, done));
    	}


    	function checkLists() {
    		assert.ok( importantList.indexOf(created) >= 0, "in important");
    		assert.ok( todayList.indexOf(created) >= 0, "in today");

    		checkCache("cache looks right", {type: "important"}, firstItems.concat(canReflect.serialize(created)),
    			serverSideDuplicateCreate );
    	}



    	function serverSideDuplicateCreate(){
    		connection.createInstance({id: 10, due: "today",createId: 1, type: "important"}).then(function(createdInstance){
    			assert.equal(createdInstance, created, "created instance returned from SSE is the same as what we created earlier");

    			assert.ok( importantList.indexOf(created) >= 0, "in important");
    			assert.ok( todayList.indexOf(created) >= 0, "in today");

    			assert.equal(importantList.length, 3, "items stays the same");

    			checkCache("cache looks right", {type: "important"}, firstItems.concat(canReflect.serialize(created)),serverSideCreate );
    		});

    	}

    	var serverCreatedInstance;
    	function serverSideCreate(){
    		connection.createInstance({id: 11, due: "today", createdId: 2, type: "important"}).then(function(createdInstance){
    			serverCreatedInstance = createdInstance;

    			assert.ok( importantList.indexOf(createdInstance) >= 0, "ss in important");
    			assert.ok( todayList.indexOf(createdInstance) >= 0, "ss in today");

    			checkCache( "cache looks right afer SS create", {type: "important"}, firstItems.concat(canReflect.serialize(created), canReflect.serialize(serverCreatedInstance)), update1 );
    		});
    	}
    	// remove due from created
    	function update1() {
    		created.due = undefined;
    		connection.save(created).then(later(checkLists2), testHelpers.logErrorAndStart(assert, done));
    	}
    	function checkLists2() {
    		assert.ok( importantList.indexOf(created) >= 0, "still in important");
    		assert.equal( todayList.indexOf(created) , -1, "removed from today");
    		update2();
    	}
    	// add due, remove type from created
    	function update2() {
    		created.type = undefined;
    		created.due = "today";
    		connection.save(created).then(later(checkLists3), testHelpers.logErrorAndStart(assert, done));
    	}
    	function checkLists3() {
    		assert.equal( importantList.indexOf(created),  -1, "removed from important");
    		assert.ok( todayList.indexOf(created) >= 1, "added to today");

    		checkCache("cache looks right after update2", {type: "important"}, firstItems.concat(canReflect.serialize(serverCreatedInstance)),serverSideUpdate );
    	}
    	// an update that adds both
    	function serverSideUpdate(){

    		connection.updateInstance({
    			type: "important",
    			due: "today",
    			createId: 1,
    			id: 10
    		}).then(function(instance){
    			assert.equal(created, instance);
    			assert.ok( importantList.indexOf(created) >= 0, "in important");
    			assert.ok( todayList.indexOf(created) >= 0, "in today");


    			checkCache( "cache looks right afer SS update", {type: "important"}, canReflect.serialize(importantList), destroyItem );
    		});

    	}

    	// do a destroy and then a server-side destroy
    	var firstImportant;
    	function destroyItem(){
    		firstImportant = importantList[0];

    		connection.destroy(firstImportant)
    			.then(later(checkLists4), testHelpers.logErrorAndStart(assert, done));
    	}

    	function checkLists4(){
    		assert.equal( importantList.indexOf(firstImportant), -1, "destroyed, should not be in important");
    		checkCache( "cache looks right afer destroy", {type: "important"}, canReflect.serialize(importantList), serverSideDestroy );
    	}

    	function serverSideDestroy(){
    		connection.destroyInstance({
    			type: "important",
    			due: "today",
    			createId: 1,
    			id: 10
    		}).then(function(instance){
    			assert.equal(instance, created, "got back deleted instance");
    			assert.equal( importantList.indexOf(created), -1, "even still in important");
    			assert.equal( todayList.indexOf(created) , -1, "removed from today");

    			checkCache( "cache looks right afer ss destroy", {type: "important"}, canReflect.serialize(importantList), function(){
    				checkCache( "cache looks right afer SS destroy", {due: "today"}, canReflect.serialize(todayList), getListDueTodayAgainstCache);
    			} );
    		});

    	}

    	//
    	function getListDueTodayAgainstCache(){
    		connection.getList({due: "today"}).then(function(updatedTodayList){
    			var added = canReflect.serialize(serverCreatedInstance);
    			assert.equal(todayList, updatedTodayList, "same todo list returned");

    			assert.deepEqual( cleanUndefineds(canReflect.serialize(updatedTodayList)), cleanUndefineds( secondItems.concat([added]) ), "got initial items from cache");
				// There are going to be 2 length changes as there are 2 splices
				canReflect.onKeyValue(todayList, "length", function onLengthChange(newLength){
					if(newLength === 1) {
						assert.deepEqual( cleanUndefineds( canReflect.serialize(updatedTodayList) ), secondItems.slice(1), "updated cache");
						done();
					}
    			});
    		});
    	}

    });

};
