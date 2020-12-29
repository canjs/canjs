var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var set = require('can-set-legacy');
var fixture = require('can-fixture');
var canLog = require("can-log");

var connect = require('can-connect');
var canMap = require('can-connect/can/map/map');
var dataUrl = require('can-connect/data/url/url');
var constructor = require('can-connect/constructor/constructor');
var constructorStore = require('can-connect/constructor/store/store');

constructorStore.requestCleanupDelay = 1;


var smartMerge = require('can-diff/merge-deep/merge-deep');

var canSymbol = require("can-symbol");
var get = require("can-key/get/get");

var QUnit = require('steal-qunit');
QUnit.noop = function(){};

//  Orig data:
//	var origData = {
//		id: 1,
//		month: 'Feb',
//		osProjects: [ { id: 1, title: 'canjs' }, {id: 2, title: 'jQuery++'} ],
//		author: {id: 5, name: 'ilya'}
//	};
//
//  Updated data:
//	var updatedData = {
//		id: 1,
//		month: 'February',
//		osProjects: [ { id: 1, title: 'CanJS' }, {id: 3, title: 'StealJS'}, {id: 2, title: 'jQuery++'} ],
//		author: {id: 6, name: 'ilya'}
//	};
//
// List of changes that should be applied on update:
//	contributionMonth.name = 'February'; // 1
//	contributionMonth.osProjects[0].name = 'CanJS'; // 2
//	contributionMonth.osProjects.splice(1,0, new OSProject({id: 3, name: 'StealJS'}) ) // 3
//	contributionMonth.author = hydrateInstance( {id: 6, name: 'ilya'} ) // 4

var OSProject, Author, ContributionMonth, onPatches,
	addPatches = function(obj, patches){
		patches.forEach(function(patch){
			onPatches.push({object: obj, patch: patch});
		});
	};

// Setup:
Author = DefineMap.extend("Author",{
	id: {type: 'number', identity: true},
	name: {type: 'string'}
});

OSProject = DefineMap.extend({
	id: {type: 'number', identity: true},
	title: {type: 'string'}
});
OSProject.List = DefineList.extend({ '#' : OSProject });
OSProject.queryLogic = new set.Algebra( set.props.id('id') );

ContributionMonth = DefineMap.extend("ContributionMonth",{
	author: Author,
	osProjects: OSProject.List
});

function prop(prop){
	return function(o){
		return get(o, prop);
	};
}

QUnit.module('helpers map-deep-merge', {
	beforeEach: function(assert) {

		onPatches = [];

		ContributionMonth[canSymbol.for("can.onInstancePatches")](addPatches);
		Author[canSymbol.for("can.onInstancePatches")](addPatches);
		OSProject[canSymbol.for("can.onInstancePatches")](addPatches);
		OSProject.List[canSymbol.for("can.onInstancePatches")](addPatches);
	},
	afterEach: function(assert) {
		ContributionMonth[canSymbol.for("can.offInstancePatches")](addPatches);
		Author[canSymbol.for("can.offInstancePatches")](addPatches);
		OSProject[canSymbol.for("can.offInstancePatches")](addPatches);
		OSProject.List[canSymbol.for("can.offInstancePatches")](addPatches);
	}
});

QUnit.test('smartMerge simple object', function(assert) {
	var item = new ContributionMonth({
		id: 1,
		month: 'feb'
	});
	var data = {
		id: 1,
		month: 'February'
	};
	smartMerge(item, data);

	assert.deepEqual(item.serialize(), data, 'updated data should be correct');
	assert.deepEqual(onPatches, [{object: item, patch: {key: "month", type: "set", value: "February"}}], 'should only be one patch');
});

QUnit.test('smartMerge nested objects', function(assert) {
	var item = new ContributionMonth({
		id: 1,
		author: {id: 6, name: 'ily'}
	});
	var data1 = {
		id: 1,
		author: {id: 6, name: 'Ilya'}
	};
	var data2 = {
		id: 1,
		author: {id: 7, name: 'Peter'}
	};

	onPatches = [];
	smartMerge(item, data1);
	assert.deepEqual(item.serialize(), data1, 'nested object MERGE');
	assert.deepEqual(onPatches.map( prop('patch.key') ), ['name'], 'should patch only "name" event');

	onPatches = [];
	smartMerge(item, data2);
	assert.deepEqual(item.serialize(), data2, 'nested object REPLACE');
	assert.deepEqual(onPatches.map( prop('patch.key') ), ['author'], 'should dispatch 1 event: author: ' + JSON.stringify(onPatches));

});

QUnit.test('smartMerge list of maps', function(assert) {
	var item = new ContributionMonth({
		osProjects: [ { id: 1, title: 'can' }, {id: 2, title: 'jQuery++'} ]
	});
	var data = {
		osProjects: [ { id: 1, title: 'CanJS' }, {id: 2, title: 'jQuery++'} ]
	};

	onPatches = [];
	smartMerge(item, data);
	assert.deepEqual(item.serialize(), data, 'updated data should be correct for the UPDATE');
	assert.deepEqual(onPatches.map( prop('patch.key') ), ['title'], 'should dispatch only "title" event');

	item = new ContributionMonth({
		osProjects: [ { id: 1, title: 'can' }, {id: 2, title: 'jQuery++'} ]
	});
	data = {
		osProjects: [ { id: 1, title: 'can' }, {id: 3, title: 'StealJS'}, {id: 2, title: 'jQuery++'} ]
	};
	onPatches = [];
	smartMerge(item, data);
	canLog.log('events after smartMerge: ', onPatches);
	assert.deepEqual(item.serialize(), data, 'updated data should be correct for the INSERT');
	assert.equal(onPatches.length, 1, 'one patch for the insertion '+JSON.stringify(onPatches));
	assert.deepEqual(onPatches[0].patch, {type: "splice", deleteCount: 0, index: 1, insert: [item.osProjects[1]]}, 'should dispatch correct events: add, length (for insertion)');
});

QUnit.test('smartMerge can-connect behavior', function(assert) {
	var done = assert.async();

	// Fixtures for connection
	fixture('PUT /contribution-month/{id}', function(){
		canLog.log('fixture here');
		return updatedData;
	});

	// Behaviour that uses the smartMerge
	var canMapMergeBehaviour = {
		updatedInstance: function(instance, props){
			smartMerge( instance, props );
			canMap.callbackInstanceEvents('updated', instance);
		}
	};

	// Orig data:
	var origData = {
		id: 1,
		name: 'Feb',
		osProjects: [ { id: 1, name: 'canjs' }, {id: 2, name: 'jQuery++'} ],
		author: {id: 5, name: 'ilya'}
	};

	// Updated data:
	var updatedData = {
		id: 1,
		name: 'February',
		osProjects: [ { id: 1, name: 'CanJS' }, {id: 3, name: 'StealJS'}, {id: 2, name: 'jQuery++'} ],
		author: {id: 6, name: 'ilya'}
	};

	connect([dataUrl, constructor, constructorStore, canMap, canMapMergeBehaviour], {
		Map: ContributionMonth,
		List: DefineList.extend({"#": ContributionMonth}),
		url: 'localhost:8080/contribution-month'
	});

	var item = new ContributionMonth(origData);

	onPatches = [];

	item.save().then(function(updated){
		assert.deepEqual(updated.serialize(), updatedData, 'updated data should be correct');
		var patchInfo = onPatches.map(function(patchData){
			if(patchData.patch.type === "set") {
				return "set "+patchData.patch.key;
			} else if(patchData.patch.type === "splice") {
				return "splice "+patchData.patch.insert.length+" at "+patchData.patch.index;
			}
		});
		var eventTypes = patchInfo.sort();
		assert.equal(eventTypes.length, 6, 'Should dispatch 6 events');
		assert.deepEqual(
			patchInfo.sort(),
			['set name','set author', 'set name','set _saving','set _saving','splice 1 at 1'].sort(),
			'should dispatch the correct events: ' + JSON.stringify(eventTypes));
		done();
	}).catch(function(e){
		canLog.log('Error: ', e);
		assert.ok(false, 'should not throw an exception');
		done();
	});
});

QUnit.test('smartMerge a list of items which type has a connection', function(assert){
	var Car = DefineMap.extend({
		vin: {identity: true, type: 'number'},
		brand: 'string'
	});

	Car.List = DefineList.extend( {'#': Car} );
	Car.connection = connect([constructor, constructorStore, canMap],{
		Map: Car
	});

	var list = new Car.List([
		{id: 100, name: 'Feb'},
		{id: 200, name: 'March'},
	]);
	var data = [
		{id: 100, name: 'February'},
		{id: 200, name: 'March'},
	];
	smartMerge(list, data);
	assert.deepEqual(list.serialize(), data, 'List with a connection should be merged');
});

QUnit.test("mergeInstance when properties are removed and added", function(assert) {
	var map = new DefineMap({a:"A"});
	smartMerge(map, {b: "B"});

	assert.deepEqual(map.get(), {b: "B"});
});

QUnit.test("Merging non-defined, but object, types", function(assert) {
	var first = new Date();
	var last = new Date();
	var map = new DefineMap({a: first});
	smartMerge(map, {a: last});

	assert.equal(map.a, last);
});

QUnit.test("custom id prop for instance store", function(assert){

	var Car = DefineMap.extend({
		vin: {type: "string", identity: true},
		color: {type: "string"}
	});
	Car.List = DefineList.extend({ "#" : Car });

	var items = new Car.List([
		{ vin: "1", color: "black" },
		{ vin: "2", color: "blue" },
	]);
	var toStore = function(map, item){ map[item.vin] = item; return map;};

	var instanceStore = [].reduce.call(items, toStore, {});
	var data = [
		{ vin: "2", color: "blue" },
		{ vin: "1", color: "red" },
	];

	assert.ok(items[0].vin === "1", "The 1st item is with id 1");
	assert.deepEqual(instanceStore["1"].serialize(), { vin: "1", color: "black" }, "The item with id=1 is what we want it to be");

	smartMerge(items, data);

	assert.deepEqual(instanceStore["1"].serialize(), { vin: "1", color: "red" }, "The item with id=1 was updated correctly");
	assert.ok(items[0].vin === "2", "items were swapped in the list which is what we expected");
});
