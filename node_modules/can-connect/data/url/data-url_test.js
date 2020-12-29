var QUnit = require("steal-qunit");
var fixture = require("can-fixture");
var persist = require("./url");
var $ = require("jquery");
var set = require("can-set-legacy");
var QueryLogic = require("can-query-logic");

QUnit.module("can-connect/data/url",{
	beforeEach: function(assert) {
		fixture.delay = 1;
	}
});

QUnit.test("basics", function(assert){

	var connection = persist({
		url: {
			getListData: "POST /getList",
			getData: "DELETE /getInstance",
			createData: "GET /create",
			updateData: "GET /update/{id}",
			destroyData: "GET /delete/{id}"
		}
	});

	fixture({
		"POST /getList": function(){
			return [{id: 1}];
		},
		"DELETE /getInstance": function(){
			return {id: 2};
		},
		"GET /create": function(){
			return {id: 3};
		},
		"GET /update/{id}": function(request){
			assert.equal(request.data.id, 3, "update id");
			return {update: true};
		},
		"GET /delete/{id}": function(request){
			assert.equal(request.data.id, 3, "update id");
			return {destroy: true};
		}
	});

	var done = assert.async();
	connection.getListData({foo: "bar"}).then(function(items){
		assert.deepEqual(items, [{id: 1}], "getList");
	});


	connection.getData({foo: "bar"}).then(function(data){
		assert.deepEqual(data, {id: 2}, "getInstance");
	});

	connection.createData({foo: "bar"}).then(function(data){
		assert.deepEqual(data, {id: 3}, "create");
	});

	connection.destroyData({foo: "bar", id: 3}).then(function(data){
		assert.deepEqual(data, {destroy: true}, "update");
		done();
	});

});

QUnit.test('idProp is not part of the parameters', function(assert) {
	var connection = persist({
		queryLogic: new QueryLogic({
			identity: ["id"]
		}),
		url: "api/todos/"
	});

	fixture({
		"GET api/todos/2": function (req) {
			assert.ok(!req.data.id);
			assert.deepEqual(req.data, {other: 'prop'});
			return [{id: 1}];
		}
	});

	var done = assert.async();
	connection.getData({id: 2, other: 'prop'}).then(function() {
		done();
	});

});

QUnit.test("destroyData()", function(assert) {
	var connection = persist({
		url: "/api/todos",
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	fixture("DELETE /api/todos/3", function(req) {
		assert.notEqual(req.data.other, "prop", "don't include it");
		return {};
	});

	var done = assert.async();
	connection.destroyData({ id: 3, other: "prop" }).then(function(){
		done();
	});
});

QUnit.test("Ajax requests should default to 'application/json' (#134)", function(assert) {
	var connection = persist({
		url: "/api/restaurants",
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	fixture({
		"POST /api/restaurants": function(request) {
			if (typeof request.data === "object") {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
			return request.data;
		}
	});

	var done = assert.async();
	connection.createData({foo: "bar"}).then(function() {
		done();
	});
});

QUnit.test("contentType can be form-urlencoded (#134)", function(assert) {
	var connection = persist({
		url: {
			createData: "POST /api/restaurants",
			contentType: "application/x-www-form-urlencoded"
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	fixture({
		"POST /api/restaurants": function(request) {
			if (typeof request.data === "object") {
				assert.ok(true);
			} else {
				assert.ok(false);
			}
			return request.data;
		}
	});

	var done = assert.async();
	connection.createData({foo: "bar"}).then(function() {
		done();
	});
});

QUnit.test("contentType defaults to form-urlencoded for GET", function(assert) {
	var connection = persist({
		url: {
			getData: "GET /api/restaurants"
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	fixture({
		"GET /api/restaurants": function(request){
			assert.equal(request.headers["Content-Type"], "application/x-www-form-urlencoded");
			return request.data;
		}
	});

	var done = assert.async();
	connection.getData({foo:"bar"}).then(function() {
		done();
	});
});

QUnit.test("getting a real Promise back with functions", function(assert) {
	var connection = persist({
		url: {
			getListData: function() {
				return $.get("GET /getList");
			},
			getData: function() {
				return $.get("GET /getInstance/{id}");
			}
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	fixture({
		"GET /getList": function(){
			return [{id: 1}];
		},
		"GET /getInstance/{id}": function(){
			return {id: 2};
		}
	});

	assert.ok(connection.getListData({foo: "bar"}).catch, 'getListData Promise has a catch method');
	assert.ok(!connection.getListData({foo: "bar"}).fail, 'getListData Promise does not have a fail method');

	assert.ok(connection.getData({foo: "bar", id: 2}).catch, 'getData Promise has a catch method');
	assert.ok(!connection.getData({foo: "bar", id: 2}).fail, 'getData Promise does not have a fail method');

});

QUnit.test("getting a real Promise back with object using makeAjax", function(assert) {
	var connection = persist({
		url: {
			getListData: {
				type: "get",
				url: "/getList"
			},
			getData: {
				type: "get",
				url: "/getList"
			}
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});
	fixture({
		"GET /getList": function(){
			return [{id: 1}];
		},
		"GET /getInstance/{id}": function(){
			return {id: 2};
		}
	});

	assert.ok(connection.getListData({foo: "bar"}).catch, 'getListData Promise has a catch method');
	assert.ok(!connection.getListData({foo: "bar"}).fail, 'getListData Promise does not have a fail method');

	assert.ok(connection.getData({foo: "bar", id: 2}).catch, 'getData Promise has a catch method');
	assert.ok(!connection.getData({foo: "bar", id: 2}).fail, 'getData Promise does not have a fail method');

});

QUnit.test('URL parameters should be encoded', function (assert) {
	var done = assert.async();
	var connection = persist({
		url: {
			getData: {
				type: 'get',
				url: '/dogs/{id}'
			}
		},
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});
	fixture({
		"GET /dogs/%23asher": function () {
			return {id: '#asher'};
		}
	});

	connection.getData({id: '#asher'})
		.then(function (data) {
			assert.equal(data.id, '#asher');
			done();
		})
		.catch(function (error) {
			done(error);
		});
});

QUnit.test("getting a real Promise back with objects using makeAjax setting this.ajax", function(assert) {
	var connection = persist({
		url: {
			getListData: {
				type: "get",
				url: "/getList"
			},
			getData: {
				type: "get",
				url: "/getList"
			}
		},
		ajax: $.ajax,
		queryLogic: new QueryLogic({
			identity: ["id"]
		})
	});

	fixture({
		"GET /getList": function(){
			return [{id: 1}];
		},
		"GET /getInstance/{id}": function(){
			return {id: 2};
		}
	});

	assert.ok(connection.getListData({foo: "bar"}).catch, 'getListData Promise has a catch method');
	assert.ok(!connection.getListData({foo: "bar"}).fail, 'getListData Promise does not have a fail method');

	assert.ok(connection.getData({foo: "bar", id: 2}).catch, 'getData Promise has a catch method');
	assert.ok(!connection.getData({foo: "bar", id: 2}).fail, 'getData Promise does not have a fail method');

});

QUnit.test("fixture stores work with data (#298)", function(assert) {
    var ready = assert.async();

    var basicAlgebra = new set.Algebra();

    var todoStore = fixture.store([{
		id: "1",
		name: "todo 1"
	}], basicAlgebra);

    fixture("/v1/places/todos/{id}", todoStore);

    var connection = persist({
		url: "/v1/places/todos/{id}",
		queryLogic: basicAlgebra
	});

    connection.getData({id: 1}).then(function(todo){
		assert.equal(todo.name, "todo 1", "got one item");
	}).then(function(){

		var queryLogic = new set.Algebra(
			set.props.id("_todoId")
		);

		var todoStore = fixture.store([{
			_todoId: "1",
			name: "todo 1"
		}], queryLogic);

		fixture("/v2/places/todos", todoStore);

		var connection = persist({
			url: "/v2/places/todos",
			queryLogic: queryLogic
		});

		connection.getData({_todoId: "1"}).then(function(todo){
			assert.equal(todo.name, "todo 1");
			ready();
		}, function(error){
		});
	}, function(){
	});
});


QUnit.test("beforeSend works when set for all methods or per-method", function(assert){
	var done = assert.async();
	var connection = persist({
		url: {
			getListData: {
				url: "/getList",
				type: 'POST',
				beforeSend: function() {
					assert.ok(true, 'per-method beforeSend called');
				}
			},
			getData: "DELETE /getInstance",
			beforeSend: function() {
				assert.ok(true, 'default beforeSend called');
			}
		}
	});

	assert.expect(2);

	fixture({
		"POST /getList": function(){
			return [{id: 1}];
		},
		"DELETE /getInstance": function(){
			return {id: 2};
		},
	});

	var promises = [
		connection.getListData({foo: "bar"}),
		connection.getData({foo: "bar"})
	];

	Promise.all(promises).then(function(data){
		done();
	});
});
