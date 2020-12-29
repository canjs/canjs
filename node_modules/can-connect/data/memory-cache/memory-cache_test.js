var QUnit = require("steal-qunit");
var memoryCache = require("./memory-cache");
var connect = require("../../can-connect");
var canSet = require("can-set-legacy");
var testHelpers = require("../../test-helpers");

var items = [{id: 1, foo:"bar"},{id: 2, foo:"bar"},{id: 3, foo:"bar"}];
var aItems = [{id: 10, name: "A"},{id: 11, name: "A"},{id: 12, name: "A"}];

QUnit.module("can-connect/data-memory-cache",{
	beforeEach: function(assert) {
		this.connection = connect([memoryCache],{
			queryLogic: new canSet.Algebra()
		});
		this.connection.clear();
	}
});

QUnit.test("updateListData", function(assert) {
	var items = [{id: 1, foo:"bar"},{id: 2, foo:"bar"},{id: 3, foo:"bar"}];

	var connection = this.connection;

	var done = assert.async();
	connection.getListData({foo: "bar"})
		.then(function(){
			assert.ok(false, "should have rejected, nothing there");
			done();
		}, function(){
			connection.updateListData({ data: items.slice(0) }, {foo: "bar"})
				.then(function(){

					connection.getListData({foo: "bar"}).then(function(listData){

						assert.deepEqual(listData.data, items);

						done();

					}, testHelpers.logErrorAndStart(assert, done));

				}, testHelpers.logErrorAndStart(assert, done));

		});

});



QUnit.test("updateData", function(assert) {

	var connection = this.connection;

	var done = assert.async();


	var a1 = connection.updateListData({ data: items.slice(0) }, {foo: "bar"});

	var a2 = connection.updateListData({ data: aItems.slice(0) }, {name: "A"});

	Promise.all([a1, a2]).then(updateItem, testHelpers.logErrorAndStart(assert, done) );
	function updateItem(){
		connection.updateData({id: 4, foo:"bar"}).then(checkItems, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.concat({id: 4, foo:"bar"}), "updateData added item 4");

			updateItem2();

		}, testHelpers.logErrorAndStart(assert, done));
	}
	function updateItem2(){
		connection.updateData({id: 4, name:"A"}).then(checkItems2, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems2() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items,"item 4 no longer in foo");

			checkItems3();

		}, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems3() {
		connection.getListData({name: "A"}).then(function(listData){

			assert.deepEqual(listData.data, [{id: 4, name:"A"}].concat(aItems), "id 4 should now have name A");

			done();

		}, testHelpers.logErrorAndStart(assert, done));
	}
});

QUnit.test("createData", function(assert) {

	var connection = this.connection;

	var done = assert.async();


	var a1 = connection.updateListData({ data: items.slice(0) }, {foo: "bar"});

	var a2 = connection.updateListData( { data: aItems.slice(0) }, {name: "A"});

	Promise.all([a1, a2]).then(createItem, testHelpers.logErrorAndStart(assert, done) );
	function createItem(){
		connection.createData({id: 4, foo:"bar"}).then(checkItems, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.concat({id: 4, foo:"bar"}), "updateData added item 4");

			createItem2();

		}, testHelpers.logErrorAndStart(assert, done));
	}
	function createItem2(){
		connection.updateData({id: 5, name:"A"}).then(checkItems2, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems2() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.concat({id: 4, foo:"bar"}),"item 4 sill in foo");

			checkItems3();

		}, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems3() {
		connection.getListData({name: "A"}).then(function(listData){

			assert.deepEqual(listData.data, [{id: 5, name:"A"}].concat(aItems));

			done();

		}, testHelpers.logErrorAndStart(assert, done));
	}
});

QUnit.test("destroyData", function(assert) {

	var connection = this.connection;

	var done = assert.async();


	var a1 = connection.updateListData({ data: items.slice(0) }, {foo: "bar"});

	var a2 = connection.updateListData({ data: aItems.slice(0) }, {name: "A"});

	Promise.all([a1, a2]).then(destroyItem, testHelpers.logErrorAndStart(assert, done) );
	function destroyItem(){
		connection.destroyData({id: 1, foo:"bar"}).then(checkItems, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.slice(1), "updateData removed 1st item");

			destroyItem2();

		}, testHelpers.logErrorAndStart(assert, done));
	}
	function destroyItem2(){
		connection.destroyData({id: 10, name: "A"}).then(checkItems2, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems2() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.slice(1),"item 4 sill in foo");

			checkItems3();

		}, testHelpers.logErrorAndStart(assert, done));
	}
	function checkItems3() {
		connection.getListData({name: "A"}).then(function(listData){

			assert.deepEqual(listData.data, aItems.slice(1) );

			done();

		}, testHelpers.logErrorAndStart(assert, done));
	}
});

QUnit.test("getData can pull from updateListData", function(assert) {
	var items = [{id: 1, foo:"bar"},{id: 2, foo:"bar"},{id: 3, foo:"bar"}];

	var connection = this.connection;

	var done = assert.async();
	connection.getData({id: 1})
		.then(function(){
			assert.ok(false, "should have rejected, nothing there");
			done();
		}, updateListData);

	function updateListData(){
		connection.updateListData({ data: items.slice(0) }, {foo: "bar"})
			.then(function(){
				connection.getData({id: 1}).then(function(instanceData){

					assert.deepEqual(instanceData, items[0]);

					updateData();

				}, testHelpers.logErrorAndStart(assert, done));

			}, testHelpers.logErrorAndStart(assert, done));
	}

	function updateData(){
		connection.updateData({id: 1, foo:"BAR"}).then(function(){

			connection.getData({id: 1}).then(function(instanceData){

				assert.deepEqual(instanceData, {id: 1, foo:"BAR"});

				setTimeout(destroyData, 1);

			}, testHelpers.logErrorAndStart(assert, done));

		}, testHelpers.logErrorAndStart(assert, done));
	}

	function destroyData(){
		connection.destroyData({id: 1, foo:"BAR"}).then(function(){

			connection.getData({id: 1}).then(testHelpers.logErrorAndStart(assert, done),function(){
				assert.ok(true, "nothing there!");
				done();
			});

		}, testHelpers.logErrorAndStart(assert, done));
	}

});

QUnit.test("respect sort order (#80)", function(assert) {
	var items = [{id: 1, name:"zed"},{id: 2, name:"bar"},{id: 3, name:"foo"}];

	var done = assert.async();

	var connection = connect([memoryCache],{
		queryLogic: new canSet.Algebra(canSet.props.sort("sortBy"))
	});

	connection.updateListData({ data: items.slice(0) }, {})
		.then(function(){

		return connection.getListData({sortBy: "name"});
	}).then(function(res){
		assert.deepEqual( res.data,
			[{id: 2, name:"bar"},{id: 3, name:"foo"},{id: 1, name:"zed"}] );
		done();
	});

});

QUnit.test("non numeric ids (#79)", function(assert) {
	var items = [{id: "a", name:"zed"},{id: "b", name:"bar"},{id: "c", name:"foo"}];

	var done = assert.async();

	var connection = connect([memoryCache],{
		queryLogic: new canSet.Algebra()
	});

	// add data tot he store, remove an item, make sure it's gone
	connection.updateListData({ data: items.slice(0) }, {})
		.then(function(){
		return connection.destroyData({id: "b", name:"bar"});
	}).then(function(){
		return connection.getListData({});
	}).then(function(res){
		assert.deepEqual( res.data,
			[{id: "a", name:"zed"},{id: "c", name:"foo"}] );
		done();
	});

});

QUnit.test("pagination loses the bigger set (#126)", function(assert) {
    var done = assert.async();
    var todosAlgebra = new canSet.Algebra(
		canSet.props.offsetLimit("offset","limit")
	);

    var connection = connect([memoryCache],{
		name: "todos",
		queryLogic: todosAlgebra
	});

    connection.updateListData(
		{ data: [{id: 0},{id: 1}] },
		{ offset: 0, limit: 2}).then(function(){

		return connection.updateListData(
			{ data: [{id: 2},{id: 3}] },
			{ offset: 2, limit: 2});
	}).then(function(){
		connection.getListData({ offset: 0, limit: 2}).then(function(listData){
			assert.deepEqual(listData, { data: [{id: 0},{id: 1}], count: 4 });
			done();
		}, function(){
			assert.ok(false, "no data");
			done();
		});
	}).catch(function(e){
		assert.ok(false, "something broke");
		done();
	});
});

QUnit.test("pagination loses the bigger set (#128)", function(assert) {
    var done = assert.async();
    var todosAlgebra = new canSet.Algebra(
		canSet.props.offsetLimit("offset","limit")
	);

    var connection = connect([memoryCache],{
		name: "todos",
		queryLogic: todosAlgebra
	});

    connection.updateListData(
		{ data: [{id: 0},{id: 1},{id: 2},{id: 3}] },
		{}).then(function(){

		return connection.getListData({ offset: 1, limit: 2});
	}).then(function(listData){
		assert.deepEqual(listData, { data: [{id: 1},{id: 2}], count: 4 });
		done();
	}).catch(function(e){
		assert.ok(false, "something broke");
		done();
	});
});
