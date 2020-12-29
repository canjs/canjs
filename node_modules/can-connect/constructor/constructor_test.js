var QUnit = require("steal-qunit");
var fixture = require("can-fixture");
var persist = require("../data/url/url");
var connect = require("../can-connect");
var constructor = require("./constructor");
var assign = require("can-reflect").assignMap;
var QueryLogic = require("can-query-logic");
var testHelpers = require("../test-helpers");

// connects the "raw" data to a a constructor function
// creates ways to CRUD the instances
QUnit.module("can-connect/constructor",{
	beforeEach: function(assert) {
		fixture({
			"GET /constructor/people": function(){
				return [{id: 1}];
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
	}
});

QUnit.test("basics", function(assert) {

	var Person = function(values){
		assign(this, values);
	};
	var PersonList = function(people){
		var listed = people.slice(0);
		listed.isList = true;
		return listed;
	};

	var peopleConnection = constructor( persist( connect.base({
		instance: function(values){
			return new Person(values);
		},
		list: function(arr){
			return new PersonList(arr.data);
		},
		url: "/constructor/people",
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	}) ));

	var done = assert.async();
	var promises = [];

	promises.push(peopleConnection.getList().then(function(people){
		assert.ok(people.isList, "is a list");
		assert.equal(people.length, 1, "got a list");
		assert.ok(people[0] instanceof Person);
	}, testHelpers.logErrorAndStart(assert, done))); //-> instances


	promises.push(peopleConnection.get({id: 5}).then(function(person){
		assert.equal(person.id, 5, "got a list");
		assert.ok(person instanceof Person);
	}, testHelpers.logErrorAndStart(assert, done)));

	var p = new Person({name: "justin"});

	promises.push(peopleConnection.save(p).then(function(updatedP){
		assert.equal(p, updatedP, "same instances");
		assert.equal(p.id, 3);
	}));

	var p2 = new Person({name: "justin", id: 3});

	promises.push(peopleConnection.save(p2).then(function(updatedP){
		assert.equal(p2, updatedP, "same instances");
		assert.equal(p2.update, true);
	}, testHelpers.logErrorAndStart(assert, done)));

	var p3 = new Person({name: "justin", id: 3});

	promises.push(peopleConnection.destroy(p3).then(function(updatedP){
		assert.equal(p3, updatedP, "same instances");
		assert.equal(p3.destroy, true);
	}, testHelpers.logErrorAndStart(assert, done)));

	Promise.all(promises).then(done, done);
});
