var QUnit = require('steal-qunit');
var fixture = require("can-fixture");
var QueryLogic = require("can-query-logic");
var canReflect = require("can-reflect");


QUnit.module("can-fixture.store");


QUnit.test("createInstance, destroyInstance, updateInstance", function(assert){
    var store = fixture.store([
        {id: 0, name: "foo"}
    ], new QueryLogic({identity: ["id"]}));

    var done = assert.async();
    store.createInstance({name: "bar"}).then(function(instance){
        var data = store.getList({});
        assert.deepEqual(data, {
            count: 2,
            data: [
                {id: 0, name: "foo"},
                {id: 1, name: "bar"}
            ]
        });

        return store.updateInstance({id: 1, name: "updated"});
    })
    .then(function(instance){
        var data = store.getList({});
        assert.deepEqual(data, {
            count: 2,
            data: [
                {id: 0, name: "foo"},
                {id: 1, name: "updated"}
            ]
        });
        return store.destroyInstance(instance);
    })
    .then(function(){
        var data = store.getList({});
        assert.deepEqual(data, {
            count: 1,
            data: [
                {id: 0, name: "foo"}
            ]
        });
        done();
    });
});

QUnit.test("anything with a schema will be converted to a queryLogic automatically", function(assert) {
    var store = fixture.store(
        [ {_id: 0, name: "foo"} ],
        {identity: ["id"]}
    );

    var res = store.get({_id: 0});
    assert.ok(res, "an object works");

    var type = canReflect.assignSymbols({},{
        "can.getSchema": function(){
            return {identity: ["id"]};
        }
    });

    store = fixture.store(
        [ {_id: 0, name: "foo"} ],
        type
    );

    res = store.get({_id: 0});
    assert.ok(res, "an object works");
    //.then(function(){ assert.ok(true, "got data"); });


});


QUnit.test("createData, destroyData, updateData", function(assert){
    var store = fixture.store([
        {id: 0, name: "foo"}
    ], new QueryLogic({identity: ["id"]}));

    var done = assert.async();
    store.createData({
        data: {name: "bar"}
    }, function(instance){
        assert.deepEqual(instance, {id: 1, name: "bar"} );
        done();
    });
    /*
    .then(function(instance){
        var data = store.getList({});
        assert.deepEqual(data, {
            count: 2,
            data: [
                {id: 0, name: "foo"},
                {id: 1, name: "updated"}
            ]
        });
        return store.destroyInstance(instance);
    })
    .then(function(){
        var data = store.getList({});
        assert.deepEqual(data, {
            count: 1,
            data: [
                {id: 0, name: "foo"}
            ]
        });
        done();
    });*/
});

QUnit.test("createData with a string id", function(assert){
    var store = fixture.store([
        {id: "helloorld", name: "foo"}
    ], new QueryLogic({identity: ["id"]}));

    var done = assert.async();
    store.createData({
        data: {name: "bar"}
    }, function(instance){
        assert.deepEqual(instance, {id: "1", name: "bar"} );
        done();
    });
});
