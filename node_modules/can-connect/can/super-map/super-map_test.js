var QUnit = require("steal-qunit");
var fixture = require("can-fixture");
var Map = require("can-map");
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var superMap = require("./super-map");
var set = require("can-set-legacy");
var GLOBAL = require("can-globals/global/global");
var stealClone = require("steal-clone");
var QueryLogic = require("can-query-logic");

QUnit.module("can-connect/can/super-map",{
	beforeEach: function(assert) {
		localStorage.clear();
	}
});

QUnit.test("uses idProp", function(assert) {

	var Restaurant = Map.extend({});

	var connection = superMap({
		url: "/api/restaurants",
		idProp: '_id',
		Map: Restaurant,
		queryLogic: new QueryLogic({
			identity: ["id"]
		}),
		List: Restaurant.List,
		name: "restaurant"
	});

	fixture({
		"GET /api/restaurants/{_id}": function(request){
			return {id: 5};
		}
	});

	var done = assert.async();
	connection.getData({_id: 5}).then(function(data){
		assert.deepEqual(data, {id: 5}, "findOne");
		done();
	});


});

QUnit.test("ArrayType and ObjectType are mapped to List and Map", function(assert) {
	var ArrayType = function() {};
	var ObjectType = function() {};
	var connection = superMap({
		ArrayType: ArrayType,
		idProp: "_id",
		name: "restaurant",
		ObjectType: ObjectType,
		url: "/api/restaurants"
	});
	assert.strictEqual(connection.List, ArrayType, "List is ArrayType");
	assert.strictEqual(connection.Map, ObjectType, "Map is ObjectType");
});

QUnit.test("throws an error if neither Map nor ObjectType are provided", function(assert) {
	assert.throws(
		function() {
			superMap({
				idProp: "_id",
				List: function() {},
				name: "restaurant",
				url: "/api/restaurants"
			});
		},
		/must be configured with a Map or ObjectType type/g,
		"throws"
	);
});

QUnit.test("throws an error when List is accessed if neither List nor ArrayType are provided", function(assert) {
	assert.throws(
		function() {
			var connection = superMap({
				idProp: "_id",
				Map: function() {},
				name: "restaurant",
				url: "/api/restaurants"
			});
			var connectionList = connection.List;
			assert.equal(typeof connectionList, "undefined");
		},
		/should be configured with an ArrayType or List type/g,
		"throws"
	);
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

	var connection = superMap({
		url: "/api/restaurants",
		name: "restaurant",
		cacheConnection: cacheConnection,
		Map: Restaurant
	});

	fixture({
		"GET /api/restaurants/{_id}": function(request){
			return {id: 5};
		}
	});

	var done = assert.async();
	connection.getData({_id: 5}).then(function(data){
		done();
	});
});

QUnit.test("uses idProp from queryLogic (#255)", function(assert) {

	var Restaurant = Map.extend({});

	var connection = superMap({
		url: "/api/restaurants",
		Map: Restaurant,
		List: Restaurant.List,
		name: "restaurant",
		queryLogic: new set.Algebra(
		   set.props.id("_id")
		)
	});

	fixture({
		"GET /api/restaurants/{_id}": function(request){
			return {id: 5};
		}
	});

	var done = assert.async();
	connection.getData({_id: 5}).then(function(data){
		assert.deepEqual(data, {id: 5}, "findOne");
		done();
	});


});

QUnit.test("uses jQuery if loaded", function(assert) {
	assert.expect(2);
	var done = assert.async();
	var old$ = GLOBAL().$;
	var fake$ = {
		ajax: function() {}
	};
	GLOBAL().$ = fake$;
	stealClone({}).import("can-connect/can/super-map/super-map").then(function(superMap) {
		var connection = superMap({
			Map: function() {},
			List: function() {},
			url: ''
		});
		assert.equal(connection.ajax, fake$.ajax, "ajax is set from existing $");
	}).then(function() {
		GLOBAL().$ = undefined;
		return stealClone({}).import("can-connect/can/super-map/super-map");
	}).then(function(superMap) {
		var connection = superMap({
			Map: function() {},
			List: function() {},
			url: ''
		});
		assert.equal(connection.ajax, undefined, "ajax is not set when no $");
		GLOBAL().$ = old$;
		done();
	});
});
