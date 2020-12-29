var QUnit = require("steal-qunit");
var localStore = require("./can-local-store");
var canSet = require("can-set-legacy");

var logErrorAndStart = function(assert, done){
	return function(e) {
		assert.ok(false,"Error "+e);
		done();
	};
};

var items = [{id: 1, foo:"bar"},{id: 2, foo:"bar"},{id: 3, foo:"bar"}];
var aItems = [{id: 10, name: "A"},{id: 11, name: "A"},{id: 12, name: "A"}];

QUnit.module("can-local-store",{
	beforeEach: function() {
		this.connection = localStore({
			name: "todos",
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

					},logErrorAndStart(assert, done));

				}, logErrorAndStart(assert, done));

		});

});



QUnit.test("updateData", function(assert) {

	var connection = this.connection;

	var done = assert.async();


	var a1 = connection.updateListData({ data: items.slice(0) }, {foo: "bar"});

	var a2 = connection.updateListData({ data: aItems.slice(0) }, {name: "A"});

	Promise.all([a1, a2]).then(updateItem,logErrorAndStart(assert, done) );
	function updateItem(){
		connection.updateData({id: 4, foo:"bar"}).then(checkItems, logErrorAndStart(assert, done));
	}
	function checkItems() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.concat([{id: 4, foo:"bar"}]), "updateData added item 4");

			updateItem2();

		},logErrorAndStart(assert, done));
	}
	function updateItem2(){
		connection.updateData({id: 4, name:"A"}).then(checkItems2, logErrorAndStart(assert, done));
	}
	function checkItems2() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items,"item 4 no longer in foo");

			checkItems3();

		},logErrorAndStart(assert, done));
	}
	function checkItems3() {
		connection.getListData({name: "A"}).then(function(listData){

			assert.deepEqual(listData.data, [{id: 4, name:"A"}].concat(aItems), "id 4 should now have name A");

			done();

		},logErrorAndStart(assert, done));
	}
});

QUnit.test("createData", function(assert) {

	var connection = this.connection;

	var done = assert.async();


	var a1 = connection.updateListData({ data: items.slice(0) }, {foo: "bar"});

	var a2 = connection.updateListData( { data: aItems.slice(0) }, {name: "A"});

	Promise.all([a1, a2]).then(createItem,logErrorAndStart(assert, done) );
	function createItem(){
		connection.createData({id: 4, foo:"bar"}).then(checkItems, logErrorAndStart(assert, done));
	}
	function checkItems() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.concat({id: 4, foo:"bar"}), "updateData added item 4");

			createItem2();

		},logErrorAndStart(assert, done));
	}
	function createItem2(){
		connection.updateData({id: 5, name:"A"}).then(checkItems2, logErrorAndStart(assert, done));
	}
	function checkItems2() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.concat({id: 4, foo:"bar"}),"item 4 sill in foo");

			checkItems3();

		},logErrorAndStart(assert, done));
	}
	function checkItems3() {
		connection.getListData({name: "A"}).then(function(listData){

			assert.deepEqual(listData.data, [{id: 5, name:"A"}].concat(aItems));

			done();

		},logErrorAndStart(assert, done));
	}
});

QUnit.test("destroyData", function(assert) {

	var connection = this.connection;

	var done = assert.async();


	var a1 = connection.updateListData({ data: items.slice(0) }, {foo: "bar"});

	var a2 = connection.updateListData({ data: aItems.slice(0) }, {name: "A"});

	Promise.all([a1, a2]).then(destroyItem,logErrorAndStart(assert, done) );
	function destroyItem(){
		connection.destroyData({id: 1, foo:"bar"}).then(checkItems, logErrorAndStart(assert, done));
	}
	function checkItems() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.slice(1), "updateData removed 1st item");

			destroyItem2();

		},logErrorAndStart(assert, done));
	}
	function destroyItem2(){
		connection.destroyData({id: 10, name: "A"}).then(checkItems2, logErrorAndStart(assert, done));
	}
	function checkItems2() {
		connection.getListData({foo: "bar"}).then(function(listData){

			assert.deepEqual(listData.data, items.slice(1),"item 4 sill in foo");

			checkItems3();

		},logErrorAndStart(assert, done));
	}
	function checkItems3() {
		connection.getListData({name: "A"}).then(function(listData){

			assert.deepEqual(listData.data, aItems.slice(1) );

			done();

		},logErrorAndStart(assert, done));
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

				},logErrorAndStart(assert, done));

			}, logErrorAndStart(assert, done));
	}

	function updateData(){
		connection.updateData({id: 1, foo:"BAR"}).then(function(){

			connection.getData({id: 1}).then(function(instanceData){

				assert.deepEqual(instanceData, {id: 1, foo:"BAR"});

				setTimeout(destroyData, 1);

			},logErrorAndStart(assert, done));

		}, logErrorAndStart(assert, done));
	}

	function destroyData(){
		connection.destroyData({id: 1, foo:"BAR"}).then(function(){

			connection.getData({id: 1}).then(logErrorAndStart(assert, done),function(){
				assert.ok(true, "nothing there!");
				done();
			});

		}, logErrorAndStart(assert, done));
	}

});

QUnit.test("clearing localStorage clears set info", function(assert) {
	var connection = this.connection;

	var done = assert.async();

	connection.updateListData({ data: items.slice(0) }, {foo: "bar"}).then(function(){
		connection.getListData({foo: "bar"}).then(function(){

			localStorage.clear();

			connection.getSets().then(function(sets){
				assert.deepEqual(sets, []);
				done();

			});

		});
	});
});

QUnit.test("using queryLogic (#72)", function(assert) {
	var connection = this.connection;

	connection.queryLogic = new canSet.Algebra(new canSet.Translate("where","$where"));
	var done = assert.async();
	connection.updateListData(
		{ data: [{id: 1, placeId: 2, name: "J"}] },
		{$where: {placeId: 2}}
		).then(function(){
		connection.updateData({id: 1, placeId: 2, name: "B"}).then(function(){
			connection.getListData({$where: {placeId: 2}}).then(function(items){
				assert.equal(items.data.length, 1, "still have the item");
				done();
			});
		});
	});
});

QUnit.test("Support passing undefined as a set to mean passing {} (#54)", function(assert) {
	var connection = this.connection;

	var done = assert.async();

	connection.updateListData({ data: items.slice(0) }, undefined).then(function(){
		assert.deepEqual(JSON.parse(localStorage.getItem("todos/queries")),[
			{
				query: {},
				startIdentity: 1
			}
		], "contains universal set");
		done();
	});
});

QUnit.test("subset data (#96)", function(assert) {
	var connection = this.connection;
	var done = assert.async();

	connection.updateListData({ data: [{id: 1, completed: true}, {id: 2, completed: false}] }, {}).then(function(){
		connection.getListData({completed: true}).then(function(items){
			assert.equal(items.data.length, 1, "should get completed items from cache");
			done();
		}, function(){
			assert.ok(false, "should have gotten completed items from cache");
			done();
		});
	});
});


QUnit.test("pagination loses the bigger set (#126)", function(assert) {
    var done = assert.async();
    var todosAlgebra = new canSet.Algebra(
		canSet.props.offsetLimit("offset","limit")
	);

    var connection = localStore({
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
	}).catch(function(){
		assert.ok(false, "something broke");
		done();
	});
});

QUnit.test("clear actually clears when data has been loaded", function(assert) {
	var done = assert.async();
	var todosAlgebra = new canSet.Algebra(
		canSet.props.offsetLimit("offset","limit")
	);

	var connection = localStore({
		name: "todos",
		queryLogic: todosAlgebra,
		cacheLocalStorageReads: true
	});

	connection.updateListData(
		{ data: [{id: 0},{id: 1}] },
		{}).then(function(){

			return connection.getListData({});

		}).then(function(){
			return connection.clear();
		}).then(function(){
			return connection.getListData({});
		}).then(function(){
			assert.ok(false, "should have errored, no data");
		}, function(){
			assert.ok(true, "should have errored, no data");
			done();
		});
});

QUnit.test("localStorage.clear clears data", function(assert) {
	var done = assert.async();
	var todosAlgebra = new canSet.Algebra(
		canSet.props.offsetLimit("offset","limit")
	);

	var connection = localStore({
		name: "todos",
		queryLogic: todosAlgebra
	});

	connection.updateListData(
		{ data: [{id: 0},{id: 1}] },
		{}).then(function(){

			return connection.getListData({});

		}).then(function(){
			return localStorage.clear();
		}).then(function(){
			return connection.getListData({});
		}).then(function(){
			assert.ok(false, "should have errored, no data");
		}, function(){
			assert.ok(true, "should have errored, no data");
			done();
		});
});
