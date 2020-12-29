var QUnit = require("steal-qunit");
var DefineMap = require("can-define/map/");
var DefineList = require("can-define/list/");
var constructorStore = require("../../constructor/store/");
var constructor = require("../../constructor/");
var canMap = require("../../can/map/");
var canRef = require("../../can/ref/");
var connect = require("../../can-connect");
var canReflect = require("can-reflect");
var canTestHelpers = require("can-test-helpers/lib/dev");

// connects the "raw" data to a a constructor function
// creates ways to CRUD the instances
QUnit.module("can-connect/can/ref",{
	beforeEach: function(assert) {

	}
});

QUnit.test("basics", function(assert) {
    var done = assert.async();
    var Team = DefineMap.extend({
		id: 'string'
	});
    var Teams = DefineList.extend({
		"#": Team
	});
    Team.connection = connect([constructor, constructorStore, canMap, canRef, {
		getData: function() {
			return Promise.resolve({ id: 3, name: "Bears" });
		}
	}],
	{ Map: Team, List: Teams });

    var Game = DefineMap.extend({
		id: 'string',
		teamRef: {type: Team.Ref.type},
		score: "number"
	});
    Game.connection = connect([constructor, constructorStore, canMap, canRef, {
		getListData: function() {
			return Promise.resolve({data: [
	 			{id: 1, score: 50, teamRef: 2},
				{id: 2, score: 100, teamRef: 3},
				{id: 3, score: 200, teamRef: 2}
	 		]});
	 	},
		getData: function(params) {
			return Promise.resolve({
				id: 1,
				score: 50,
				teamRef: {id: 2, name: "Cubs"}
			});
		}
	}],
	{ Map: Game, List: DefineList.extend({ 	"#": Game }) });

    var handler = function(){};
    Game.get({id: 1, populate: "teamRef"}).then(function(game){
		game.on("teamRef", handler);
		game.teamRef.on("value", handler);
		var teamRef = game.teamRef;
		assert.ok( teamRef.value instanceof Team);
		assert.equal(teamRef.value.name, "Cubs");
		assert.equal(teamRef.id, 2);

		Game.getList({}).then(function(games){
			assert.ok( games[0].teamRef === teamRef, "same team ref");
			assert.ok( games[2].teamRef === teamRef, "same team ref on a different object");
			assert.ok( teamRef.value instanceof Team);
			assert.equal(teamRef.id, 2);
			assert.equal(teamRef.value.name, "Cubs");
			assert.equal(games[1].teamRef.id, 3);

			assert.equal(games[0].teamRef.isResolved(), true);

			games[1].teamRef.on("value", function(ev, newVal){
				assert.ok(newVal instanceof Team);
				assert.equal(newVal.name, "Bears");
				done();
			});

			assert.equal(games[1].teamRef.isResolved(), false);

		});
	}, function(error){
		assert.ok(false, "error");
		done();
	});
});

QUnit.test("using Ref as type", function(assert) {
    var done = assert.async();

    var Team = DefineMap.extend({
		id: 'string'
	});

    connect([constructor, constructorStore, canMap, canRef, {
		getData: function() {
			return Promise.resolve({ id: 3, name: "Bears" });
		}
	}],
	{
		Map: Team,
		List: DefineList.extend({ "#": Team })
	});

    var Game = DefineMap.extend({
		id: 'string',
		teamRef: Team.Ref,
		score: "number"
	});

    connect([constructor, constructorStore, canMap, canRef,
	{
		getListData: function() {
			return Promise.resolve({data: [
	 			{id: 1, score: 50, teamRef: 2},
				{id: 2, score: 100, teamRef: 3},
				{id: 3, score: 200, teamRef: 2}
	 		]});
	 	},
		getData: function(params) {
			return Promise.resolve({
				id: 1,
				score: 50,
				teamRef: {id: 2, name: "Cubs"}
			});
		}
	}],
	{
		Map: Game,
		List: DefineList.extend({ "#": Game })
  	});

    var handler = function(){};
    Game.get({id: 1, populate: "teamRef"}).then(function(game){
		game.on("teamRef", handler);
		game.teamRef.on("value", handler);
		var teamRef = game.teamRef;
		assert.ok( teamRef.value instanceof Team);
		assert.equal(teamRef.value.name, "Cubs");
		assert.equal(teamRef.id, 2);

		Game.getList({}).then(function(games){
			assert.ok( games[0].teamRef === teamRef, "same team ref");
			assert.ok( games[2].teamRef === teamRef, "same team ref on a different object");
			assert.ok( teamRef.value instanceof Team);
			assert.equal(teamRef.id, 2);
			assert.equal(teamRef.value.name, "Cubs");
			assert.equal(games[1].teamRef.id, 3);

			assert.equal(games[0].teamRef.isResolved(), true);

			games[1].teamRef.on("value", function(ev, newVal){
				assert.ok(newVal instanceof Team);
				assert.equal(newVal.name, "Bears");
				done();
			});

			assert.equal(games[1].teamRef.isResolved(), false);

		});
	}, function(error){
		assert.ok(false, "error");
		done();
	});
});

QUnit.test("Ref can be passed an instance of what it references (#236)", function(assert) {

	var Team = DefineMap.extend({
		id: 'string'
	});

	connect([constructor, constructorStore, canMap, canRef],
	{
		Map: Team,
		List: DefineList.extend({ "#": Team })
	});

	var Game = DefineMap.extend({
		id: 'string',
		teamRef: Team.Ref,
		score: "number"
	});

	connect([constructor, constructorStore, canMap, canRef],
	{
		Map: Game,
		List: DefineList.extend({ "#": Game })
  	});

	// try with team not in the store
	var team = new Team({id: 5});

	var game = new Game({
		id: 6,
		teamRef: team,
		score: 22
	});

	assert.ok( game.teamRef.value instanceof Team, "is an instance");
	assert.equal(game.teamRef.value, team, "same instance");
});


QUnit.test("populate Ref that was already created without a value", function(assert) {
    var done = assert.async();
    var Team = DefineMap.extend({
		id: "string"
	});
    var getDataCallCounter = 0;
    Team.connection = connect([constructor, constructorStore, canMap, canRef, {
		getData: function() {
			getDataCallCounter++;
			return Promise.resolve({ id: 3, name: "Bears" });
		}
	}],
	{
		Map: Team,
		List: DefineList.extend({ "#": Team })
	});

    var Game = DefineMap.extend({
		id: "string",
		teamRef: {type: Team.Ref.type},
		score: "number"
	});
    Game.connection = connect([constructor, constructorStore, canMap, canRef, {
		getData: function(params) {
			return Promise.resolve({
				id: 1,
				score: 50,
				teamRef: (params.populate ? {id: 3, name: "Cubs"} : 3)
			});
		}
	}],
	{
		Map: Game,
		List: DefineList.extend({ "#": Game })
	});

    var handler = function(){};

    Game.get({id: 1}).then(function(game){
		game.on("teamRef", handler);
		var teamRef = game.teamRef;

		assert.ok( typeof teamRef.value === "undefined", "Value should be undefined");
		assert.equal(teamRef.id, 3, "Id should be the correct one");
		assert.equal(getDataCallCounter, 0, "Team getData should NOT be called");

		Game.get({id: 1, populate: "teamRef"}).then(function(game){
			// Now bind to teamRef:
			game.teamRef.on("value", handler);

			assert.ok( teamRef.value instanceof Team, "Value should be a Team");
			assert.equal(teamRef.value.name, "Cubs", "Name should be Cubs");
			assert.equal(teamRef.id, 3, "Id should be the correct one");
			assert.equal(getDataCallCounter, 0, "Team getData should still NOT be called");
			done();
		});

	}, function(error){
		assert.ok(false, "error");

	});
});


QUnit.test("serialize-able", function(assert) {
	var done = assert.async();

	var Team = DefineMap.extend({
		id: 'string'
	});
	var Teams = DefineList.extend({
		"#": Team
	});
	Team.connection = connect([constructor, constructorStore, canMap, canRef, {
		getData: function() {
			return Promise.resolve({ id: 3, name: "Bears" });
		}
	}],
	{ Map: Team, List: Teams });

	var Game = DefineMap.extend({
		id: 'string',
		teamRefA: {type: Team.Ref.type},
		teamRefB: {type: Team.Ref.type},
	});



	constructorStore.requests.increment();
	var game = new Game({id: "123", teamRefA: "321", teamRefB: "321"});

	constructorStore.requests.one("end", function(){
		assert.deepEqual( canReflect.serialize(game), {id: "123", teamRefA: "321", teamRefB: "321"} );
		done();
	});

	constructorStore.requests.decrement();




});

canTestHelpers.devOnlyTest("ref instances are named appropriately (#424)", function(assert){
	var Team = DefineMap.extend("Team",{
		name: "string",
		id: {identity: true, type: 'string'}
	});
	var Teams = DefineList.extend({
		"#": Team
	});
	Team.connection = connect([constructor, constructorStore, canMap, canRef, {
		getData: function() {
			return Promise.resolve({ id: 3, name: "Bears" });
		}
	}],
	{ Map: Team, List: Teams });

	var Game = DefineMap.extend({
		id: 'string',
		teamRefA: {type: Team.Ref.type},
		teamRefB: {type: Team.Ref.type},
	});

	var game = new Game({id: "123", teamRefA: "123", teamRefB: {id: "321", name: "cubs"}});

	assert.equal( canReflect.getName(game.teamRefA), "TeamRef{123}");
});
