var set = require("can-set-legacy");
var $ = require("jquery");
var Map = require("can-map");
var List = require("can-list");
var Observation = require("can-observation");
var canSymbol = require("can-symbol");
var canReflect = require("can-reflect");

// load connections
var constructor = require("../../constructor/constructor");
var canMap = require("./map");
var constructorStore = require("../../constructor/store/store");
var dataCallbacks = require("../../data/callbacks/callbacks");
var callbacksCache = require("../../data/callbacks-cache/callbacks-cache");
var combineRequests = require("../../data/combine-requests/combine-requests");
var localCache = require("../../data/localstorage-cache/localstorage-cache");
var dataParse = require("../../data/parse/parse");
var dataUrl = require("../../data/url/url");
var fallThroughCache = require("../../fall-through-cache/fall-through-cache");
var realTime = require("../../real-time/real-time");

var connect = require("../../can-connect");

var QUnit = require("steal-qunit");

var fixture = require("can-fixture");
var testHelpers = require("../../test-helpers");
var map = [].map;


var later = testHelpers.later;

constructorStore.requestCleanupDelay = 1;
var queues = require("can-queues");

QUnit.module("can-connect/can/map/map with Map",{
	beforeEach: function(assert) {

		var Todo = Map.extend({

		});
		var TodoList = List.extend({
			Map: Todo
		});
		this.Todo = Todo;
		this.TodoList = TodoList;

		var queryLogic = new set.Algebra();

		var cacheConnection = connect([localCache],{
			name: "todos",
			queryLogic: queryLogic
		});
		cacheConnection.clear();
		this.cacheConnection = cacheConnection;

		this.Todo = Todo;

		this.todoConnection = connect([
			constructor,
			canMap,
			constructorStore,
			dataCallbacks,
			callbacksCache,
			combineRequests,
			dataParse,
			dataUrl,
			fallThroughCache,
			realTime],
			{
				url: "/services/todos",
				cacheConnection: cacheConnection,
				Map: Todo,
				List: TodoList,
				ajax: $.ajax,
				queryLogic: queryLogic
			});


	}
});


QUnit.test("real-time super model", function(assert) {

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
				return canReflect.assignMap({id: 10}, request.data);
			}
		},
		"PUT /services/todos/{id}": function(request){
			if( state.get() === "updateData-important" || state.get() === "updateData-today" ) {
				state.next();
				// todo change to all props
				return canReflect.assignMap({},request.data);
			} else {
				assert.ok(false, "bad state!");
				done();
			}
		},
		"DELETE /services/todos/{id}": function(request){
			if(state.get() === "destroyData-important-1") {
				state.next();
				// todo change to all props
				return canReflect.assignMap({destroyed:  1},request.data);
			} else {
				assert.ok(false, "bad state!");
				done();
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

	var connection = this.todoConnection,
		cacheConnection = this.cacheConnection,
		Todo = this.Todo;

	var importantList,
		todayList,
		bindFunc = function functionUsedToKeepObservablesBound(){
			//canLog.log("length changing");
		};
	Promise.all([connection.getList({type: "important"}), connection.getList({due: "today"})])
		.then(function(result){

		importantList = result[0];
		todayList = result[1];
		assert.ok(importantList.length, "got important");
		assert.ok(todayList.length, "got today");

		importantList.bind("length", bindFunc);
		todayList.bind("length",bindFunc);

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
			setTimeout(checkLists, 1);
		}, testHelpers.logErrorAndStart(assert, done));
	}


	function checkLists() {
		assert.ok( importantList.indexOf(created) >= 0, "in important");
		assert.ok( todayList.indexOf(created) >= 0, "in today");

		checkCache("cache looks right", {type: "important"}, firstItems.concat(created.serialize()),serverSideDuplicateCreate );
	}



	function serverSideDuplicateCreate(){
		connection.createInstance({id: 10, due: "today",createdId: 1, type: "important"}).then(function(createdInstance){
			assert.equal(createdInstance, created, "created instance returned from SSE is the same as what we created earlier");

			assert.ok( importantList.indexOf(created) >= 0, "in important");
			assert.ok( todayList.indexOf(created) >= 0, "in today");

			assert.equal(importantList.length, 3, "items stays the same");

			checkCache("cache looks right", {type: "important"}, firstItems.concat(created.serialize()),serverSideCreate );
		});

	}

	var serverCreatedInstance;
	function serverSideCreate(){
		connection.createInstance({id: 11, due: "today", createdId: 2, type: "important"}).then(function(createdInstance){
			serverCreatedInstance = createdInstance;

			assert.ok( importantList.indexOf(createdInstance) >= 0, "in important");
			assert.ok( todayList.indexOf(createdInstance) >= 0, "in today");

			checkCache( "cache looks right afer SS create", {type: "important"}, firstItems.concat(created.serialize(), serverCreatedInstance.serialize()), update1 );
		});
	}

	function update1() {
		created.removeAttr("due");
		connection.save(created).then(later(checkLists2), testHelpers.logErrorAndStart(assert, done));
	}
	function checkLists2() {
		assert.ok( importantList.indexOf(created) >= 0, "still in important");
		assert.equal( todayList.indexOf(created) , -1, "removed from today");
		update2();
	}

	function update2() {
		created.removeAttr("type");
		created.attr("due","today");
		connection.save(created).then(later(checkLists3), testHelpers.logErrorAndStart(assert, done));
	}
	function checkLists3() {
		assert.equal( importantList.indexOf(created),  -1, "removed from important");
		assert.ok( todayList.indexOf(created) >= 1, "added to today");

		checkCache("cache looks right after update2", {type: "important"}, firstItems.concat(serverCreatedInstance.serialize()),serverSideUpdate );
	}

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


			checkCache( "cache looks right afer SS update", {type: "important"}, importantList.serialize(), destroyItem );
		});

	}


	var firstImportant;
	function destroyItem(){
		firstImportant = importantList[0];

		connection.destroy(firstImportant)
			.then(later(checkLists4), testHelpers.logErrorAndStart(assert, done));
	}

	function checkLists4(){
		assert.equal( importantList.indexOf(firstImportant), -1, "in important");
		checkCache( "cache looks right afer destroy", {type: "important"}, importantList.serialize(), serverSideDestroy );
	}

	function serverSideDestroy(){
		connection.destroyInstance({
			type: "important",
			due: "today",
			createId: 1,
			id: 10
		}).then(function(instance){
			assert.equal(instance, created, "got back deleted instance");
			assert.equal( importantList.indexOf(created), -1, "still in important");
			assert.equal( todayList.indexOf(created) , -1, "removed from today");

			checkCache( "cache looks right afer ss destroy", {type: "important"}, importantList.serialize(), function(){
				checkCache( "cache looks right afer SS destroy", {due: "today"}, todayList.serialize(), getListDueTodayAgainstCache);
			} );
		});

	}

	function getListDueTodayAgainstCache(){

		connection.getList({due: "today"}).then(function(updatedTodayList){
			var added = serverCreatedInstance.serialize();
			assert.equal(todayList, updatedTodayList, "same todo list returned");

			assert.deepEqual( updatedTodayList.serialize(), secondItems.concat([added]), "got initial items from cache");

			var batchNum;
			todayList.bind("length", function lengthChanged(ev){
				if(batchNum && ev.batchNum !== batchNum) {
					assert.deepEqual( updatedTodayList.serialize(), secondItems.slice(1), "updated cache");
					done();
				} else {
					batchNum = ev.batchNum;
				}

			});
		});
	}

});

QUnit.test("isSaving and isDestroying", function(assert) {

	var done = assert.async();

	fixture({
		"POST /services/todos": function(request){
			return canReflect.assignMap({id: 10}, request.data);
		},
		"PUT /services/todos/{id}": function(request){
			return canReflect.assignMap({},request.data);
		},
		"DELETE /services/todos/{id}": function(request){
			return canReflect.assignMap({destroyed:  1},request.data);
		}
	});


	var todo = new this.Todo({foo: "bar"});
	var todoConnection = this.todoConnection;
	var state = "hydrated",
		isSavingCalls = 0,
		isDestroyingCalls = 0;

	var isSaving = new Observation(function(){
		return todo.isSaving();
	});
	var isDestroying = new Observation(function(){
		return todo.isDestroying();
	});

	canReflect.onValue(isSaving, function(newVal, oldVal){
		isSavingCalls++;
		if(isSavingCalls === 1) {
			assert.equal(state,"hydrated");
			assert.equal(newVal, true);
			assert.equal(todo.isNew(), true);
		} else if(isSavingCalls === 2) {
			assert.equal(state,"hydrated");
			assert.equal(newVal, false);
			assert.equal(todo.isNew(), false);
		} else if(isSavingCalls === 3) {
			assert.equal(state,"created");
			assert.equal(newVal, true);
			assert.equal(todo.isNew(), false);
		} else if(isSavingCalls === 4) {
			assert.equal(state,"created");
			assert.equal(newVal, false);
		} else {
			assert.ok(false, "extra saving call");
		}
	});

	canReflect.onValue(isDestroying, function(newVal, oldVal){
		isDestroyingCalls++;
		if(isSavingCalls === 1) {
			assert.equal(state,"updated");
			assert.equal(newVal, true);
		} else if(isSavingCalls === 2) {
			assert.equal(state,"updated");
			assert.equal(newVal, false);
		}
	});


	todoConnection.save(todo).then(function(){
		state = "created";
		assert.equal( todo.isSaving(), false, "isSaving is false" );

		todoConnection.save(todo).then(function(){
			state = "updated";
			assert.equal( todo.isSaving(), false, "isSaving is false" );

			todoConnection.destroy(todo).then(function(){
				assert.equal( todo.isDestroying(), false, "isDestroying is false" );
				done();
			});
			assert.equal( todo.isSaving(), false, "isSaving is false" );
			assert.equal( todo.isDestroying(), true, "isDestroying is true" );
		});

		assert.equal( todo.isSaving(), true, "isSaving is true" );
	});

	assert.equal( todo.isSaving(), true, "isSaving is true" );


});

QUnit.test("listQuery works", function(assert) {
	fixture({
		"GET /services/todos": function(){
			return {data: []};
		}
	});
	var Todo = this.Todo;
	var TodoList = this.TodoList;
	var todoConnection = this.todoConnection;
	var done = assert.async();

	Promise.all([
		todoConnection.getList({foo: "bar"}).then(function(list){
			assert.deepEqual( todoConnection.listQuery(list), {foo: "bar"}, "first");
		}),
		Todo.getList({zed: "ted"}).then(function(list){
			assert.deepEqual( todoConnection.listQuery(list), {zed: "ted"},"second");
		})
	]).then(function(){
		var list = new TodoList({"zak": "ack"});
		assert.deepEqual(  todoConnection.listQuery(list), {zak: "ack"}, "third");
		done();
	});

});

QUnit.test("findAll and findOne alias", function(assert) {

	fixture({
		"GET /services/todos": function(){
			return {data: [{id: 1, name: "findAll"}]};
		},
		"GET /services/todos/{id}": function(){
			return {id: 2, name: "findOne"};
		}
	});

	var Todo = this.Todo;

	var done = assert.async();
	Promise.all([
		Todo.findOne({id: 1}).then(function(todo){
			assert.equal(todo.name, "findOne");
		}),
		Todo.findAll({}).then(function(todos){
			assert.equal(todos.length, 1);
			assert.equal(todos[0].name, "findAll");
		})
	]).then(function(){
		done();
	});
});

QUnit.test("reads id from set queryLogic (#82)", function(assert) {
	var Todo = Map.extend({seal: false}, {});
	var TodoList = List.extend({
		Map: Todo
	});


	var todoConnection = connect([
		constructor,
		canMap,
		constructorStore,
		dataCallbacks,
		callbacksCache,
		combineRequests,
		dataParse,
		dataUrl,
		fallThroughCache,
		realTime],
		{
			url: "/services/todos",
			Map: Todo,
			List: TodoList,
			ajax: $.ajax,
			queryLogic: new set.Algebra(
			   set.props.id("_id")
			)
		});

	assert.equal(todoConnection.id(new Todo({_id: 5})), 5, "got the right id");
});

QUnit.test("additional properties are included in getList responses", function(assert) {
	fixture({
		"GET /services/todos": function(){
			return {
				count: 1,
				data: [{id: 1}]
			};
		}
	});

	var Todo = this.Todo;

	var done = assert.async();
	Todo.getList({}).then(function(todos){
		assert.equal(todos.count, 1);
		done();
	});
});

QUnit.test("should batch model events", function(assert) {
	var eventOrder = [];
	var Type = Map.extend({});
	var instance = new Type();

	instance.on("updated", function() {
		eventOrder.push(2);
	}, "notify");

	Type.on("updated", function() {
		eventOrder.push(3);
	}, "notify");

	queues.batch.start();
	queues.notifyQueue.enqueue(function() {
		eventOrder.push(1);
	});
	queues.deriveQueue.enqueue(function() {
		eventOrder.push(4);
	});
	canMap.callbackInstanceEvents("updated", instance);
	queues.batch.stop();

	assert.equal(eventOrder.join(""), "1234", "events are batched");
});

QUnit.test("list uses can.new", function(assert) {
	var Todo = function(props) {};
	var TodoList = function() {
		var array = Array.apply(this, arguments);
		return array;
	};
	TodoList[canSymbol.for("can.new")] = function(items) {
		var list = new TodoList();
		return TodoList.apply(list, items);
	};

	var todoConnection = connect([
		constructor,
		canMap],
		{
			url: "/services/todos",
			Map: Todo,
			List: TodoList
		});

	var list = todoConnection.list({
		data: [{id:1, label: "walk the dog"},
			{id:2, label: "make dinner"}]
	});

	assert.equal(list.length, 2, "Has all of the items");
});
