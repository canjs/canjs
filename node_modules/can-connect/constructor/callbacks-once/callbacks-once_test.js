var connect = require("../../can-connect");
var QUnit = require("steal-qunit");
var realTime = require("../../real-time/real-time");
var constructor = require("../constructor");
var constructorStore = require("../store/store");
var canMap = require("../../can/map/map");
var callbacksOnce = require("./callbacks-once");
var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');

QUnit.module("can-connect/callbacks-once");

QUnit.test('createInstance triggers a "created" event', function(assert){
	var done = assert.async();

	var Session = DefineMap.extend({
		id: 'any',
		email: 'string'
	});
	Session.List = DefineList.extend({
		"#": Session
	});

	var connection = connect([
		constructor,
		canMap,
		constructorStore,
		realTime,
		callbacksOnce
	], {
		Map: Session
	});

	Session.on('created', function (event) {
		assert.ok(event, 'createInstance triggered the "created" event');
		done();
	});

	connection.createInstance({
		id: 5,
		email: 'marshall@bitovi.com'
	});
});

QUnit.test("different methods should not refer to the same last item", function(assert) {
	function Session(data){
		this.id = data.id;
		this.email = data.email;
	}
	var createdCalled = 0;
	var destroyedCalled = 0;

	Session.connection = connect([
		constructor,
		{
			// simulate can/map/map's `id`:
			id: function(instance){
				return instance.id;
			},
			// overwrite can/constructor/constructor:
			createdInstance: function(instance, data){
				this.addInstanceReference(instance);
				createdCalled++;
			},
			// overwrite can/constructor/constructor:
			destroyedInstance: function(instance, data){
				destroyedCalled++;
			}
		},
		constructorStore,
		callbacksOnce
	], {
		Map: Session
	});

	var data = {
		id: 100,
		email: 'ilya@bitovi.com'
	};

	var instance = new Session(data);

	Session.connection.createdInstance(instance, data);
	Session.connection.createdInstance(instance, data);
	Session.connection.destroyedInstance(instance, data);
	Session.connection.destroyedInstance(instance, data);

	assert.equal(createdCalled, 1, "created event should be called once");
	assert.equal(destroyedCalled, 1, "destroyed event should be called once");
});
