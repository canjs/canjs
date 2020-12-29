var QUnit = require("steal-qunit");

var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var superModel = require("./can-super-model");
var fixture = require("can-fixture");
var canReflect = require("can-reflect");
var QueryLogic = require("can-query-logic");

QUnit.module('can-super-model',{
    beforeEach: function() {
        localStorage.clear();
    }
});

QUnit.test("basics", function(assert){

    var Status = canReflect.assignSymbols({},{
        "can.new": function(val){

            return val.toLowerCase();
        },
        "can.getSchema": function(){
            return {
                type: "Or",
                values: ["new","assigned","complete"]
            };
        }
    });

    var Todo = DefineMap.extend("Todo",{
        _id: {identity: true, type: "number"},
        name: "string",
        complete: "boolean",
        dueDate: "date",
        points: "number",
        status: Status
    });
    var TodoList = DefineList.extend({
        "#": Todo
    });

    var connection = superModel({
        Map: Todo,
        List: TodoList,
        url: "/api/todos/{_id}"
    });

    var todoStore = fixture.store([],new QueryLogic(Todo));

    fixture("/api/todos/{_id}",todoStore);
    var done = assert.async();

    var createdTodo,
        allList,
        pushCreatedTodo,
        listHandler = function(){};

    Todo.getList({}).then(function(list){
        assert.equal(list.length,0, "no items");
        allList = list;
        allList.on("length", listHandler);

        createdTodo = new Todo({
            name: "lawn",
            status: "NEW",
            dueDate: new Date(2017,3,30).toString()
        });
        return createdTodo.save();
    })
    // Test PUSH CREATE
    .then(function(todo){
        assert.equal(createdTodo, todo, "same todo after create");
        assert.equal(todo.status, "new", "converted through status");
        assert.equal(allList.length, 1, "one item added");

        return todoStore.createInstance({
            name: "push instance",
            complete: true,
            dueDate: new Date(2018,3,30).toString(),
            points: 10,
            status: "new"
        }).then(function(instance){
            return connection.createInstance(instance);
        }).then(function(created){
            pushCreatedTodo = created;
            assert.ok(created._id, "has an id");
            assert.equal(allList.length, 2, "one item added");
        });
    })
    // test UPDATE
    .then(function(){
        // going to create one more todo to also test gt
        return new Todo({
            name: "third todo",
            status: "NEW",
            dueDate: new Date(2000,3,30).toString()
        }).save().then(function(){

            createdTodo.assign({
                points: 20
            });
            return createdTodo.save()
            .then(function(){

                return Todo.getList({
                    sort: "-points",
                    filter: {dueDate: {$gt: new Date(2001,3,30).toString()}}
                }).then(function(list){
                    assert.deepEqual(list.serialize(),[
                        {
                            _id: 1,
                            name: "lawn",
                            status: "new",
                            dueDate: new Date(2017,3,30),
                            points: 20
                        },
                        {
                            _id: 2,
                            name: "push instance",
                            complete: true,
                            dueDate: new Date(2018,3,30),
                            points: 10,
                            status: "new"
                        }
                    ], "get list works");
                });

            });
        });
    })
    .then(function(){
        done();
    },function(err){
        assert.ok(false,err);
        done();
    });


});


QUnit.test("allow other caches (#59)", function(assert) {

	var cacheConnection = {
		getData: function(){
			assert.ok(true, "called this cacheConnection");
			return Promise.resolve({id: 5});
		}
	};
	var Restaurant = DefineMap.extend({seal:false},{});
	Restaurant.List = DefineList.extend({"#": Restaurant});

	var connection = superModel({
		url: "/api/restaurants",
		name: "restaurant",
		cacheConnection: cacheConnection,
		Map: Restaurant
	});

	fixture({
		"GET /api/restaurants/{_id}": function(){
			return {id: 5};
		}
	});

	var done = assert.async();
	connection.getData({_id: 5}).then(function(){
		done();
	});
});

QUnit.test("passes queryLogic", function(assert) {
    var Todo = DefineMap.extend("Todo",{
        _id: {identity: true, type: "number"}
    });
    var TodoList = DefineList.extend({
        "#": Todo
    });

    var ql = new QueryLogic(Todo);

    var connection = superModel({
        Map: Todo,
        List: TodoList,
        url: "/api/todos/{_id}",
        queryLogic: ql
    });

    assert.equal(connection.queryLogic, ql, "same query logic");
});

QUnit.test("string signature", function(assert) {
    var connection = superModel("/api/todos/{_id}");

    assert.ok(new connection.Map() instanceof DefineMap, "Map defined");
    assert.ok(new connection.List() instanceof DefineList, "List defined");
});
