var QUnit = require("steal-qunit");
var fixture = require("can-fixture");
var persist = require("../../data/url/url");

var constructor = require("../../constructor/constructor");
var instanceStore = require("./store");
var connect = require("../../can-connect");
var testHelpers = require("../../test-helpers");
var assign = require("can-reflect").assignMap;
var QueryLogic = require("can-query-logic");

instanceStore.requestCleanupDelay = 1;

// connects the "raw" data to a a constructor function
// creates ways to CRUD the instances
QUnit.module("can-connect/constructor/store",{
	beforeEach: function(assert) {

	}
});


QUnit.test("instance reference is updated and then discarded after reference is deleted", function(assert) {
	fixture({
		"GET /constructor/people": function(){
			return [{id: 1, age: 32}];
		},
		"GET /constructor/people/{id}": function(request){
			return {id: +request.data.id };
		},
		"POST /constructor/people": function(){
			return {id: 3};
		},
		"PUT /constructor/people/{id}": function(request){
			assert.equal(request.data.id, 3, "update id!");
			return {update: true};
		},
		"DELETE /constructor/people/{id}": function(request){
			assert.equal(request.data.id, 3, "update id");
			return {destroy: true};
		}
	});
	fixture.delay = 1;

	var Person = function(values){
		assign(this, values);
	};
	var PersonList = function(people){
		var listed = people.slice(0);
		listed.isList = true;
		return listed;
	};
	var peopleConnection = connect( [persist, constructor, instanceStore], {
		url: {
			getListData: "/constructor/people",
			getData: "/constructor/people/{id}",
			createData: "/constructor/people",
			updateData: "/constructor/people/{id}",
			destroyData: "/constructor/people/{id}"
		},
		instance: function(values){
			return new Person(values);
		},
		list: function(arr){
			return new PersonList(arr.data);
		},
		updatedList: function(list, updatedList, set){
			list.splice(0, list.length, updatedList.data);
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	var person = new Person({id: 1, name: "Justin"});

	peopleConnection.addInstanceReference(person);

	var done = assert.async();
	peopleConnection.getList({}).then(function(people){
		assert.equal(people[0], person, "same instances");

		assert.equal(person.age, 32, "age property added");

		// allows the request to finish
		setTimeout(function(){
			peopleConnection.deleteInstanceReference(person);

			peopleConnection.getList({}).then(function(people){
				assert.ok(people[0] !== person, "not the same instances");
				assert.equal(people[0].age, 32, "age property from data");
				assert.ok(!people[0].name, "does not have name");
				done();
			}, testHelpers.logErrorAndStart(assert, done));
		},1);
	}, testHelpers.logErrorAndStart(assert, done));

});

QUnit.test("list store is kept and re-used and possibly discarded", function(assert) {
	var Person = function(values){
		assign(this, values);
	};
	var connection;
	var PersonList = function(people, sets){
		var listed = people.slice(0);
		listed.isList = true;
		listed[connection.listQueryProp] = sets;
		return listed;
	};

	connection = connect([function(){
		var calls = 0;
		return {
			getListData: function(){
				// nothing here first time
				calls++;
				if(calls === 1) {
					return testHelpers.asyncResolve({data: [{id: 0}, {id: 1}] });
				} else if(calls === 2){
					return testHelpers.asyncResolve({data: [{id: 1}, {id: 2}] });
				} else {
					return testHelpers.asyncResolve({data: [] });
				}
			},
			updatedList: function(list, updatedList, set){
				list.splice.apply(list, [0, list.length].concat( updatedList.data ) );
			}
		};
	},instanceStore,constructor],{
		instance: function(values){
			return new Person(values);
		},
		list: function(arr, sets){
			return new PersonList(arr.data, sets);
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	var resolvedList;
	connection.getList({}).then(function(list){
		resolvedList =  list;
		// put in store
		connection.addListReference(list);
		setTimeout(checkStore,1);
	}, testHelpers.logErrorAndStart(assert, done));

	var done = assert.async();

	function checkStore(){
		connection.getList({}).then(function(list){
			assert.equal(list, resolvedList);
			assert.equal(list.length, 2);
			assert.equal(list[0].id, 1);
			assert.equal(list[1].id, 2);
			connection.deleteListReference(list);
			setTimeout(checkEmpty,1);
		}, testHelpers.logErrorAndStart(assert, done));
	}

	function checkEmpty() {
		connection.getList({}).then(function(list){

			assert.ok(list !== resolvedList);
			done();
		}, testHelpers.logErrorAndStart(assert, done));

	}

});

QUnit.test("list's without a listQuery are not added to the store", function(assert) {
	var Person = function(values){
		assign(this, values);
	},
		connection;
	var PersonList = function(people, sets){
		var listed = people.slice(0);
		listed.isList = true;
		listed[connection.listQueryProp] = sets;
		return listed;
	};

	connection = connect([function(){
		var calls = 0;
		return {
			getListData: function(){
				// nothing here first time
				calls++;
				if(calls === 1) {
					return testHelpers.asyncResolve({data: [{id: 0}, {id: 1}] });
				} else if(calls === 2){
					return testHelpers.asyncResolve({data: [{id: 1}, {id: 2}] });
				} else {
					return testHelpers.asyncResolve({data: [] });
				}
			},
			updatedList: function(list, updatedList, set){
				list.splice.apply(list, [0, list.length].concat( updatedList.data ) );
			}
		};
	},instanceStore,constructor],{
		instance: function(values){
			return new Person(values);
		},
		list: function(arr, sets){
			return new PersonList(arr.data, sets);
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	connection.addListReference([]);
	connection.listStore.forEach(function(){
		assert.ok(false);
	});
	assert.expect(0);


});

QUnit.test("pending requests should be shared by all connections (#115)", function(assert) {
	var Address = function(values){
		assign(this, values);
	};
	var addressConnection = connect( [persist, constructor, instanceStore], {
		url: '/test/',
		instance: function(values){
			return new Address(values);
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	var Person = function(values){
		values.address = addressConnection.hydrateInstance(values.address);
		assign(this, values);
	};

	var peopleConnection = connect( [persist, constructor, instanceStore], {
		url: {
			getListData: function(){
				return Promise.resolve({
					data: [
						{
							id: 1,
							name: "Justin Meyer",
							address: {
								id: 5,
								street: "2060 stave"
							}
						},
						{
							id: 2,
							name: "Ramiya Meyer",
							address: {
								id: 5,
								street: "2060 stave"
							}
						}
					]
				});
			}
		},
		instance: function(values){
			return new Person(values);
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	var done = assert.async();
	peopleConnection.getList({}).then(function(people){
		assert.ok(people[0].address === people[1].address);
		done();
	});

});


QUnit.test("instances bound before create are moved to instance store (#296)", function(assert) {
    var ready = assert.async();

    var connection = connect([
		function(){
			return {
				getData: function(){
					return Promise.resolve({name: "test store", id: "abc"});
				},
				createData: function(){
					return Promise.resolve({name: "test store", id: "abc"});
				}
			};
		},
		constructor,
		instanceStore],
		{
			queryLogic: new QueryLogic({
				identity: ["id"]
			})
		});

    var todo = {name: "test store"};
    connection.addInstanceReference(todo);

    connection.save(todo).then(function(savedTodo){

		connection.get({id: savedTodo.id}).then(function(t){
			assert.ok(t === todo, "instances the same");
			ready();
		});
	});
});

QUnit.test("instanceStore adds instance references for list membership.", function(assert) {
	var done = assert.async();
	var connection = connect([
		function(){
			return {
				getListData: function(){
					return Promise.resolve([{name: "test store", id: "abc"}]);
				}
			};
		},
		constructor,
		instanceStore],
	{
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	connection.getList({}).then(function(list) {
		var instanceRef = connection.instanceStore.get("abc");
		assert.ok(instanceRef, "instance reference exists in store");
		assert.equal(connection.instanceStore.referenceCount("abc"), 2, "reference count reflects that instance is being loaded");
		connection.addListReference(list);
		assert.equal(connection.instanceStore.referenceCount("abc"), 3, "reference count reflects that instance is in reffed list");

		return new Promise(function(resolve) {
			setTimeout(function() {
				assert.equal(connection.instanceStore.referenceCount("abc"), 1, "finished requests reduce instance counts to 1");
				connection.deleteListReference(list);
				assert.ok(!connection.instanceStore.has("abc"), "instance removed from store after last list ref removed");
				resolve();
			}, 1);
		});
	}).then(done);
});

QUnit.test("instanceStore adds/removes instances based on list updates.", function(assert) {
	var done = assert.async();
	var connection = connect([
		function(){
			var calls = 0;
			return {
				getListData: function(){
					if(calls) {
						return Promise.resolve([{name: "test store", id: "def"}]);
					} else {
						calls++;
						return Promise.resolve([{name: "test store", id: "abc"}]);
					}
				}
			};
		},
		constructor,
		instanceStore],
	{
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	connection.getList({}).then(function(list) {
		connection.addListReference(list);
		return new Promise(function(resolve) {
			setTimeout(function() {
				assert.ok(connection.instanceStore.get("abc"), "first item is in instance store");
				resolve(connection.getList({}));
			}, 1);
		});
	}).then(function(list) {
		return new Promise(function(resolve) {
			setTimeout(function() {
				assert.ok(!connection.instanceStore.get("abc"), "first item is not in instance store");
				assert.ok(connection.instanceStore.get("def"), "second item is in instance store");
				resolve();
			}, 10);
		});
	}).then(done, done);
});

QUnit.test("list store keeps date types with query", function(assert){
	var done = assert.async();

	var Person = function(values){
		assign(this, values);
	};
	var connection;
	var PersonList = function(people, sets){
		var listed = people.slice(0);
		listed.isList = true;
		listed[connection.listQueryProp] = sets;
		return listed;
	};

	connection = connect([function(){
		return {
			getListData: function(){
				// nothing to get, it's just about the list set.
				return testHelpers.asyncResolve({data: [] });
			},
			updatedList: function(list, updatedList, set){
				list.splice.apply(list, [0, list.length].concat( updatedList.data ) );
			}
		};
	},instanceStore,constructor],{
		instance: function(values){
			return new Person(values);
		},
		list: function(arr, sets){
			return new PersonList(arr.data, sets);
		},
		queryLogic: new QueryLogic({
			identity: ["id"],
			filter: ["date"]
		})
	});

	var d = new Date();

	connection.getList({date: d}).then(function(list){
		// put in store
		connection.addListReference(list);
		//var query = list[connection.listQueryProp];
		var listKey = Object.keys(connection.listStore.set)[0];
		var listKeyObject = JSON.parse(listKey);
		assert.equal(listKeyObject.date, d.toISOString());
		done();
	}, testHelpers.logErrorAndStart(assert, done));

});
