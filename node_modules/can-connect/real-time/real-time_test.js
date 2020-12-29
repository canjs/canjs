var connect = require("../can-connect");
var set = require("can-set-legacy");
var realTime = require("./real-time");
var constructor = require("../constructor/constructor");
var constructorStore = require("../constructor/store/store");
var dataCallbacks = require("../data/callbacks/callbacks");
var callbacksOnce = require("../constructor/callbacks-once/callbacks-once");
var testHelpers = require("../test-helpers");
var DefineList = require("can-define/list/list");
var QUnit = require("steal-qunit");
var assign = require("can-reflect").assignMap;
var canDev = require('can-log/dev/dev');
var QueryLogic = require("can-query-logic");
var canReflect = require("can-reflect");

QUnit.module("can-connect/real-time",{});

var later = function(fn){
	return function(){
		setTimeout(fn, 1);
	};
};

constructorStore.requestCleanupDelay = 1;

QUnit.test("basics", function(assert) {
	// get two lists
	// user creates / updates / destroys things
	// real-time creates / updates / destroys things
	var done = assert.async();

	var state = testHelpers.makeStateChecker(assert, done, [
		"getListData-important",
		"getListData-today",
		"createData-today+important",
		"createdInstance-1",
		"updateData-important",
		"updateData-today",
		"destroyData-important-1"
	]);

	var firstItems = [ {id: 0, type: "important"}, {id: 1, type: "important"} ];
	var secondItems = [ {id: 2, due: "today"}, {id: 3, due: "today"} ];

	var callbackBehavior = function(base){
		return {
			createdInstance: function(){
				state.check(assert, "createdInstance-1");
				return base.createdInstance.apply(this, arguments);
			},
			updatedInstance: function(){
				return base.updatedInstance.apply(this, arguments);
			},
			destroyedInstance: function(){
				return base.destroyedInstance.apply(this, arguments);
			},
			updatedList: function(list, updated){
				return base.updatedList.apply(this, arguments);
			}
		};
	};
	var dataBehavior = function(){
		return {
			getListData: function(){
				// nothing here first time
				if(state.get() === "getListData-important") {
					state.next();
					return testHelpers.asyncResolve({data: firstItems.slice(0) });
				} else {
					state.check(assert, "getListData-today");
					return testHelpers.asyncResolve({data: secondItems.slice(0) });
				}
			},
			createData: function(props){
				if( state.get() === "createData-today+important" ) {
					state.next();
					// todo change to all props
					return testHelpers.asyncResolve({id: 10});
				} else {
					assert.ok(false, "bad state!");
					done();
				}


			},
			updateData: function(props){

				if( state.get() === "updateData-important" || state.get() === "updateData-today" ) {
					state.next();
					// todo change to all props
					return testHelpers.asyncResolve(assign({},props));
				} else {
					assert.ok(false, "bad state!");
					done();
				}
			},
			destroyData: function(props){
				if(state.get() === "destroyData-important-1") {
					state.next();
					// todo change to all props
					return testHelpers.asyncResolve(assign({destroyed:  1},props));
				}
			}
		};
	};

	var connection = connect([
		dataBehavior,
		realTime,
		constructor,
		constructorStore,
		dataCallbacks,
		callbackBehavior,
		callbacksOnce
		],{
			queryLogic: new set.Algebra()
		});

	var importantList,
		todayList;
	Promise.all([connection.getList({type: "important"}), connection.getList({due: "today"})]).then(function(result){

		importantList = result[0];
		todayList = result[1];

		connection.addListReference(importantList);
		connection.addListReference(todayList);

		setTimeout(createImportantToday,1);

	}, testHelpers.logErrorAndStart(assert, done));

	function createImportantToday() {
		connection.save({
			type: "important",
			due: "today",
			createId: 1
		}).then( function(task){
			connection.addInstanceReference(task);
			setTimeout(checkLists, 1);
		}, testHelpers.logErrorAndStart(assert, done));
	}

	var created;
	function checkLists() {
		created = connection.instanceStore.get(10);
		assert.ok( importantList.indexOf(created) >= 0, "in important");
		assert.ok( todayList.indexOf( created) >= 0, "in today");
		setTimeout(serverSideDuplicateCreate, 1);

	}

	function serverSideDuplicateCreate(){
		connection.createInstance({id: 10, due: "today", type: "important"}).then(function(createdInstance){
			assert.equal(createdInstance, created);

			assert.ok( importantList.indexOf(created) >= 0, "in important");
			assert.ok( todayList.indexOf(created) >= 0, "in today");

			assert.equal(importantList.length, 3, "items stays the same");
			setTimeout(update1, 1);
		});
	}

	function update1() {
		delete created.due;
		connection.save(created).then(later(checkLists2), testHelpers.logErrorAndStart(assert, done));
	}
	function checkLists2() {
		assert.ok( importantList.indexOf(created) >= 0, "still in important");
		assert.equal( todayList.indexOf(created) , -1, "removed from today");
		update2();
	}

	function update2() {
		delete created.type;
		created.due = "today";
		connection.save(created).then(later(checkLists3), testHelpers.logErrorAndStart(assert, done));
	}
	function checkLists3() {
		assert.equal( importantList.indexOf(created),  -1, "removed from important");
		assert.ok( todayList.indexOf(created) >= 1, "added to today");
		serverSideUpdate();
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
			destroyItem();
		});

	}
	var firstImportant;
	function destroyItem(){
		firstImportant = importantList[0];
		connection.addInstanceReference( firstImportant );

		connection.destroy(firstImportant)
			.then(later(checkLists4), testHelpers.logErrorAndStart(assert, done));
	}

	function checkLists4(){
		assert.equal( importantList.indexOf(firstImportant), -1, "in important");
		serverSideDestroy();
	}

	function serverSideDestroy(){
		connection.destroyInstance({
			type: "important",
			due: "today",
			createId: 1,
			id: 10
		}).then(function(instance){
			assert.equal( importantList.indexOf(created), -1, "still in important");
			assert.equal( todayList.indexOf(created) , -1, "removed from today");
			done();
		});

	}

});

QUnit.test("sorting by id works", function(assert) {
	var queryLogic = new set.Algebra(set.props.id("id"), set.props.sort("sortBy"));

	var items = [{id: 1, name:"g"}, {id: 3, name:"j"}, {id: 4, name:"m"}, {id: 5, name:"s"}];
	var dataBehavior = function(){
		return {
			getListData: function(){
				// nothing here first time
				return testHelpers.asyncResolve({data: items.slice(0) });
			}
		};
	};

	var connection = connect([dataBehavior,realTime,constructor,constructorStore],{
			queryLogic: queryLogic
	});

	var done = assert.async();
	var listItems;
	connection.getList({}).then(function(list){
		listItems = list;
		connection.addListReference(list);
		setTimeout(createInstance,1);

	});

	function createInstance(){
		connection.createInstance({id: 2, name: "a"}).then(function(){
			setTimeout(checkList,1);
		});
	}
	function checkList(){
		var itemsCopy = items.slice(0);
		itemsCopy.splice(1, 0, {id: 2, name: "a"});
		assert.deepEqual(listItems, itemsCopy);
		done();
	}
});


QUnit.test("sorting by sort clause works with updates", function(assert) {
	var queryLogic = new set.Algebra(set.props.id("id"), set.props.sort("sortBy"));

	var items = [{id: 1, name:"d"}, {id: 3, name:"j"}, {id: 4, name:"m"}, {id: 5, name:"s"}];
	var dataBehavior = function(){
		return {
			getListData: function(){
				// nothing here first time
				return testHelpers.asyncResolve({data: items.slice(0) });
			}
		};
	};

	var connection = connect([dataBehavior,realTime,constructor,constructorStore],{
			queryLogic: queryLogic
	});

	var done = assert.async();
	var listItems;
	connection.getList({sortBy: "name"}).then(function(list){
		listItems = list;
		connection.addListReference(list);
		list.forEach(function(instance){
			connection.addInstanceReference(instance);
		});
		setTimeout(updateInstance,1);

	});

	function updateInstance(){
		connection.updateInstance({id: 3, name: "p"}).then(function(){
			setTimeout(checkList,1);
		});
	}
	function checkList(){
		assert.deepEqual(listItems, [{id: 1, name:"d"}, {id: 4, name:"m"}, {id: 3, name:"p"}, {id: 5, name:"s"}]);
		done();
	}
});

QUnit.test("destroyInstance calls destroyedInstance", function (assert) {
	var destructionForeman = function(){
		return {
			destroyedInstance: function (instance, props) {
				assert.ok(instance, "destroyedInstance was called.");
				return testHelpers.asyncResolve({});
			}
		};
	};
	var connection = connect([
		realTime,
		constructor,
		constructorStore,
		destructionForeman
	],{
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});
	connection.destroyInstance({id: 1});
});

//!steal-remove-start
if (canDev) {
	QUnit.test("dev mode warning when listQuery queryLogic doesn't match an item", function(assert) {
		var queryLogic = new set.Algebra(set.props.id("id"));
		var items = [{id: 1, name:"d"}, {id: 3, name:"j", foo: {bar: 5678}}];
		var dataBehavior = function(){
			return {
				getListData: function(){
					return testHelpers.asyncResolve({ data: items.slice(0) });
				},
				createData: function(props){},
				updateData: function(props){},
				destroyData: function(props){}
			};
		};

		var connection = connect([dataBehavior,realTime,constructor,constructorStore,
			dataCallbacks, callbacksOnce],{
				queryLogic: queryLogic
		});

		var oldlog = canDev.warn;
		canDev.warn = function () {
			clearTimeout(failSafeTimer);
			assert.ok(true, 'warns about item not being in list');
			canDev.warn = oldlog;
			done();
		};

		var done = assert.async();
		var failSafeTimer = setTimeout(function () {
			assert.notOk(true, 'canDev.warn was never called!');
		}, 500);
		connection.getList({ "fooBar": true, foo: { bar: 1234 }});
	});

	QUnit.test("listQuery queryLogic warning includes any `undefined` values", function(assert) {
		var queryLogic = new set.Algebra(set.props.id("id"));
		var items = [{id: 1, name:"d", foo: undefined }, {id: 3, name:"j", foo: {bar: 5678}}];
		var dataBehavior = function(){
			return {
				getListData: function(){
					return testHelpers.asyncResolve({ data: items.slice(0) });
				},
				createData: function(props){},
				updateData: function(props){},
				destroyData: function(props){}
			};
		};

		var connection = connect([ dataBehavior, realTime,constructor,constructorStore,
			dataCallbacks, callbacksOnce],{
				queryLogic: queryLogic
		});

		var oldlog = canDev.warn;
		canDev.warn = function (message) {
			clearTimeout(failSafeTimer);
			assert.ok(true, 'warns about item not being in list');
			assert.ok(/"nope": undefined/.test(message), 'undefined value in set');
			assert.ok(/"foo": undefined/.test(message), 'undefined value in item');
			canDev.warn = oldlog;
			done();
		};

		var done = assert.async();
		var failSafeTimer = setTimeout(function () {
			assert.notOk(true, 'canDev.warn was never called!');
		}, 500);
		connection.getList({ "fooBar": true, foo: { bar: 1234 }, nope: undefined });
	});
}
//!steal-remove-end

/**
 * This test covers a situation where there is a mix of AJAX (data)
 * and sockets (real-time). A save() happens, an AJAX POST is made
 * to the server, the socket 'created' event is emitted before
 * the AJAX request is done, and finally the AJAX response resolves.
 */
QUnit.test("handling if createInstance happens before createdData", function (assert) {
	assert.expect(4);
	var done = assert.async();
	var createdPromiseResolve;

	var dataBehavior = function(){
		return {
			createData: function (props, cid) {
				return new Promise(function(resolve){
					createdPromiseResolve = resolve;
				});
			},
			getListData: function(props){},
			updateData: function(props){},
			destroyData: function(props){}
		};
	};
	var connection = connect([
		dataBehavior,
		constructor,
		constructorStore,
		realTime,
		dataCallbacks,
		callbacksOnce
	],{
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	var data = {name: "Ryan"};

	var savePromise = connection.save(data).then(function(dataAgain){
		connection.addInstanceReference(data);
		assert.equal(data, dataAgain, "same instance in memory .save()");
		assert.equal(data.id, 1, ".save() has the id");
	});

	setTimeout(function(){
		connection.createInstance({name: "Ryan", id: 1}).then(function(instance){
			assert.equal(data, instance, ".createInstance() same instance in memory");
			assert.equal(data.id, 1, ".createInstance() has the id");
		}).then(function(){
			return savePromise;
		}).then(function(){
			done();
		});

		createdPromiseResolve({name: "Ryan", id: 1});
	}, 10);
});

/**
 * This tests to make sure that the `Promise.all` call inside
 * of createInstance always gets an array of resolved promises.
 * The createData method will swallow any failures before adding
 * the promise onto the promise stack used by createInstance.
 */
QUnit.test("createInstance doesn't fail if createData fails", function (assert) {
	assert.expect(3);
	var done = assert.async();
	var createdPromiseReject;

	var dataBehavior = function(){
		return {
			createData: function (props, cid) {
				return new Promise(function(resolve, reject){
					createdPromiseReject = reject;
				});
			},
			getListData: function(props){},
			updateData: function(props){},
			destroyData: function(props){}
		};
	};
	var connection = connect([
		dataBehavior,
		constructor,
		constructorStore,
		realTime,
		dataCallbacks,
		callbacksOnce
	],{
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	var data = {name: "Ryan"};

	var savePromise = connection.save(data).then(function(dataAgain){
		assert.notOk(true, "save() should not have succeeded");
	}).catch(function(){
		assert.ok(true, "save() caused an error.");
		return '';
	});

	setTimeout(function(){
		connection.createInstance({name: "Ryan", id: 1}).then(function(instance){
			assert.notEqual(data, instance, ".createInstance() should create a new instance b/c save() failed");
			assert.ok(!data.id, 'data should not have an id');
		}).then(function(){
			return savePromise;
		}).then(function(){
			done();
		});

		createdPromiseReject('Simulated AJAX error');
	}, 10);
});

QUnit.test("instances should be removed from 'length-bound' lists when destroyed (#365)", function (assert) {
	var done = assert.async();
	assert.expect(2);

	var todos = [{
		name: "test the store",
		id: "abc"
	}, {
		name: "rock the house",
		id: "def"}
	];
	var connection = connect([
		function(){
			return {
				list: function(items) {
					var list = new DefineList(items.data);
					// simulate the can-connet/can/map/map behaviour
					// adding the list to the listStore
					connection.addListReference(list, {});
					return list;
				},
				getListData: function(){
					return Promise.resolve(todos);
				},
				destroyData: function() {
					// simulate an empty object response from server
					return Promise.resolve({});
				},
				updateData: function(){},
				createData: function(){}
			};
		},
		dataCallbacks,
		realTime,
		constructor,
		constructorStore
	], {
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	connection.getList({}).then(function(todos){
		todos.on('length', function(){
			// make sure length change is triggered
			assert.ok(true, "length changes");
		});
		connection.destroy(todos[0])
		.then(function(destroyedTodo){
			assert.ok(todos.indexOf(destroyedTodo) === -1, "instance was removed from lists");
			done();
		}, done);
	}, function(err){
		setTimeout(function(){
			throw err;
		},1);
		done();
	});
});

QUnit.test("real-time doesn't handle updates when the id doesn't change (#436)", function (assert) {
	var done = assert.async();
	assert.expect(1);

	var todos = [{
		name: "test the store",
		id: "def"
	}, {
		name: "rock the house",
		id: "ghi"
	}];
	var connection = connect([
		function(){
			return {
				list: function(items) {
					var list = new DefineList(items.data);
					// simulate the can-connet/can/map/map behaviour
					// adding the list to the listStore
					connection.addListReference(list, {});
					return list;
				},
				getListData: function(){
					return Promise.resolve(todos);
				},
				destroyData: function() {
					// simulate an empty object response from server
					return Promise.resolve({});
				},
				updateData: function(data){
					return Promise.resolve(canReflect.serialize(data));
				}
			};
		},
		dataCallbacks,
		realTime,
		constructor,
		constructorStore
	], {
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	connection.getList({}).then(function(list){
		list.on("length", function(){
			assert.ok(false, "Length should not change");
		});
		connection.save( list[0] );
		return list;
	}).then(function(list) {
		list.off("length");
		list.on("length", function(){
			assert.ok(true, "Length should change when adding item in position 0");
		});
		return connection.save({
			name: "go to sleep",
			id: "abc"
		});
	}).then(function(){
		done();
	}, function(err){
		setTimeout(function(){
			throw err;
		},1);
		done();
	});

});
