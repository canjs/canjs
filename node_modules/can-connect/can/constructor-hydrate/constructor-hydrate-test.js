var QUnit = require('steal-qunit');

var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var connect = require('can-connect');
var constructorBehavior = require('../../constructor/constructor');
var constructorStore = require('../../constructor/store/store');
var mapBehavior = require('../map/map');
var hydrateBehavior = require('./constructor-hydrate');

QUnit.module("can-connect/can/constructor-hydrate");

QUnit.test("basics", function(assert) {
	var Hub = DefineMap.extend({});
	Hub.List = DefineList.extend({
		'#': { Type: Hub }
	});
	var HubConnection = connect([
		constructorBehavior,
		constructorStore,
		mapBehavior,
		hydrateBehavior,
	], { Map: Hub, List: Hub.List });
	var myPage = new (DefineMap.extend({
		hub: { Type: Hub },
		hub2: { Type: Hub },
	}))();

	myPage.hub = {id: 1, name: 'One'};
	HubConnection.addInstanceReference(myPage.hub);
	assert.equal(myPage.hub, HubConnection.instanceStore.get(1), 'Should be the same instance');

	myPage.hub2 = {id: 1, name: 'OnePlus'};
	assert.equal(myPage.hub2, HubConnection.instanceStore.get(1), 'Should also be the same instance');
	assert.equal(myPage.hub2, myPage.hub, 'Both properties refer to the same instance');
	assert.equal(myPage.hub.name, 'OnePlus', 'The name of the 1st property should be changed since its the same instance now');
});

QUnit.test("Two objects with no id", function(assert) {
	var Hub = DefineMap.extend({});
	Hub.List = DefineList.extend({
		'#': { Type: Hub }
	});
	var HubConnection = connect([
		constructorBehavior,
		constructorStore,
		mapBehavior,
		hydrateBehavior,
	], { Map: Hub, List: Hub.List });

	var hub1 = new Hub({name: 'One'});
	HubConnection.addInstanceReference(hub1);
	assert.ok(!HubConnection.instanceStore.has(undefined), 'The instanceStore should not have an "undefined" key item');
	new Hub({name: 'One'});
	assert.ok(true, 'Should allow to create two instances without an id (no Max Call Stack error)');
});
