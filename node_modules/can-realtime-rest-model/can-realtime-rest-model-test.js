var QUnit = require("steal-qunit");
var fixture = require("can-fixture");
var ObservableArray = require("can-observable-array");
var ObservableObject = require("can-observable-object");
var realtimeRestModel = require("./can-realtime-rest-model");
//var stealClone = require("steal-clone");
var QueryLogic = require("can-query-logic");
var canReflect = require("can-reflect");
var type = require("can-type");

QUnit.module("can-realtime-rest-model");


QUnit.test("basics", function(assert){
    var Status = canReflect.assignSymbols({},{
        "can.isMember": function() {
            return false;
        },
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

    class Todo extends ObservableObject {
        static get props() {
            return {
                _id: {identity: true, type: type.convert(Number)},
                name: String,
                complete: type.maybeConvert(Boolean),
                dueDate: type.convert(Date),
                points: type.convert(Number),
                status: Status
            };
        }
    }

    class TodoList extends ObservableArray {
        static get props() {
            return {};
        }

        static get items() {
            return type.convert(Todo);
        }
    }

    var connection = realtimeRestModel({
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

QUnit.test("string signature", function(assert) {
    var connection = realtimeRestModel("/api/todos/{_id}");

    assert.ok(new connection.ArrayType() instanceof ObservableArray, "ArrayType defined");
    assert.ok(new connection.ObjectType() instanceof ObservableObject, "ObjectType defined");
});
