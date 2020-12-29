var QUnit = require("steal-qunit");
var fixture = require("can-fixture");
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var defineRestModel = require("./can-define-rest-model");
var canReflect = require("can-reflect");

QUnit.module("can-define-realtime-rest-model");


QUnit.test("CRUD basics", function(assert){
    assert.expect(10);
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

    defineRestModel({
        Map: Todo,
        List: TodoList,
        url: "/api/todos/{_id}"
    });


    fixture("GET /api/todos", (function(){
        var count = 0;
        return function(req) {

            if(count++ === 0) {
                assert.deepEqual(req.data, {foo:"bar", filter: "zed"});
                return {
                    data: [{_id: 1,name: "zed"}]
                };
            } else {

            }
        };
    })());

    fixture("POST /api/todos", function(){
        return {
            _id: 1,
            name: "lawn care",
            status: "new",
            dueDate: new Date(2017,3,30).toString()
        };
    });

    fixture("GET /api/todos/{_id}", function(){
        return {
            _id: 2,
            name: "lawn care",
            status: "new",
            dueDate: new Date(2017,3,30).toString()
        };
    });

    fixture("PUT /api/todos/{_id}", function(req){
        assert.equal(req.data._id, "2");
        return {
            _id: 2,
            name: "do lawn care",
            status: "assigned",
            dueDate: new Date(2017,3,30).toString()
        };
    });

    fixture("DELETE /api/todos/{_id}", function(req){
        assert.equal(req.data._id, "2", "deleted");
        return {};
    });

    var done = assert.async();





    var createdTodo,
        listHandler = function(){};

    Todo.getList({foo:"bar", filter: "zed"}).then(function(list){
        assert.deepEqual(list.serialize(),[{_id: 1,name: "zed"}], "got items");

        list.on("length", listHandler);

        createdTodo = new Todo({
            name: "lawn",
            status: "NEW",
            dueDate: new Date(2017,3,30).toString()
        });
        return createdTodo.save();
    })
    // Test create
    .then(function(todo){
        assert.equal(createdTodo, todo, "same todo after create");
        assert.equal(todo.status, "new", "converted through status");
        assert.equal(todo.name, "lawn care", "converted through response");

        return todo._id;
    })
    // Test get
    .then(function(){
        return Todo.get({_id: 2}).then(function(todo){
            assert.deepEqual(todo.serialize(), {
                _id: 2,
                name: "lawn care",
                status: "new",
                dueDate: new Date(2017,3,30)
            }, "due date is right");
            return todo;
        });
    })
    // update
    .then(function(todo){
        assert.notOk(todo.isNew(), "is saved");
        todo.status = "ASSIGNED";
        return todo.save().then(function(saved){
            assert.deepEqual(saved.serialize(), {
                _id: 2,
                name: "do lawn care",
                status: "assigned",
                dueDate: new Date(2017,3,30)
            }, "updated");
            return saved;
        });
    })
    // destroy
    .then(function(todo){
        return todo.destroy();
    })
    .then(function(){
        done();
    },function(err){
        assert.ok(false,err);
        done();
    });

});

QUnit.test("string signature", function(assert) {
    var connection = defineRestModel("/api/todos/{_id}");

    assert.ok(new connection.Map() instanceof DefineMap, "Map defined");
    assert.ok(new connection.List() instanceof DefineList, "List defined");
});
