var set = require("can-set-legacy");
var $ = require("jquery");
var Map = require("can-define/map/map");
var List = require("can-define/list/list");


// load connections
var constructor = require("../../constructor/constructor");
var canMap = require("./map");
//var canRef = require("../../can/ref/ref");
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

QUnit.module("can-connect/can/map/map with define",{
	beforeEach: function(assert) {

		var Todo = Map.extend("Todo",{
			id: "*",
			name: "*",
			type: "*",
			due: "*",
			createdId: "*",
			destroyed: "any"
		});
		var TodoList = List.extend("TodoList",{
			"*": Todo
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

require("./test-real-time-super-model")(function(){
	return {Todo: this.Todo, TodoList: this.TodoList};
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
			assert.deepEqual( todoConnection.listQuery(list), {foo: "bar"}, "first set");
		}),
		Todo.getList({zed: "ted"}).then(function(list){
			assert.deepEqual( todoConnection.listQuery(list), {zed: "ted"}, "second set");
		})
	]).then(function(){
		var list = new TodoList({"zak": "ack"});
		assert.deepEqual(  todoConnection.listQuery(list), {zak: "ack"}, "hydrated set");
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
	var Todo = Map.extend({
		_id: "*"
	});
	var TodoList = List.extend({
		"*": Todo
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


QUnit.test("instances bound before create are moved to instance store (#296)", function(assert) {
    var ready = assert.async();
    var todoAlgebra = new set.Algebra(
		set.props.boolean("complete"),
		set.props.id("id"),
		set.props.sort("sort")
	);

    var todoStore = fixture.store([
		{ name: "mow lawn", complete: false, id: 5 },
		{ name: "dishes", complete: true, id: 6 },
		{ name: "learn canjs", complete: false, id: 7 }
	], todoAlgebra);

    fixture("/theapi/todos", todoStore);

    var Todo = Map.extend({
		id: "string",
		name: "string",
		complete: {type: "boolean", value: false}
	});

    Todo.List = List.extend({
		"#": Todo
	});

    Todo.connection = connect([
		constructor,
		canMap,
		constructorStore,
		dataCallbacks,
		dataUrl],
		{
			url: "/theapi/todos",
			Map: Todo,
			List: Todo.List,
			name: "todo",
			queryLogic: todoAlgebra
		});


    var newTodo = new Todo({name: "test superMap"});
    newTodo.on("name", function(){});

    newTodo.save().then(function(savedTodo){

		Todo.get({id: savedTodo.id}).then(function(t){
			assert.equal(t._cid, newTodo._cid); // NOK
			ready();
		});
	});
});
