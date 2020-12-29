var DefineMap = require('can-define/map/map');
var Observation = require('can-observation');
var canReflect = require('can-reflect');
var defineBackup = require('can-define-backup');

var MyMap = defineBackup(DefineMap.extend({}));

require('steal-qunit');

var Recipe;

QUnit.module('can/define/backup', {
	beforeEach: function() {
		Recipe = MyMap.extend('Recipe', {
			name: 'string'
		});
	}
});

QUnit.test('backing up', function(assert) {
	var recipe = new Recipe({
		name: 'cheese'
	});
	assert.ok(!recipe.isDirty(), 'not backedup, but clean');
	recipe.backup();
	assert.ok(!recipe.isDirty(), 'backedup, but clean');
	recipe.name = 'blah';
	assert.ok(recipe.isDirty(), 'dirty');
	recipe.restore();
	assert.ok(!recipe.isDirty(), 'restored, clean');
	assert.equal(recipe.name, 'cheese', 'name back');
});

QUnit.test('backup / restore with associations', function(assert) {
	var Instruction = MyMap.extend('Instruction', {
		description: 'string'
	});
	var Cookbook = MyMap.extend('Cookbook', {
		title: 'string'
	});
	var Recipe = MyMap.extend('Recipe', {
		instructions: {
			Type: Instruction.List
		},
		cookbook: {
			Type: Cookbook
		}
	});
	var recipe = new Recipe({
		name: 'cheese burger',
		instructions: [{
			description: 'heat meat'
		}, {
			description: 'add cheese'
		}],
		cookbook: {
			title: 'Justin\'s Grillin Times'
		}
	});
	//test basic is dirty
	assert.ok(!recipe.isDirty(), 'not backedup, but clean');
	recipe.backup();
	assert.ok(!recipe.isDirty(), 'backedup, but clean');
	//recipe.attr('name', 'blah');
	recipe.name = 'blah';
	assert.ok(recipe.isDirty(), 'dirty');
	recipe.restore();
	assert.ok(!recipe.isDirty(), 'restored, clean');
	assert.equal(recipe.name, 'cheese burger', 'name back');
	// test belongs too

	//ok(recipe.cookbook.isDirty(), 'cookbook not backedup, but clean');
	recipe.cookbook.backup();
	recipe.cookbook.title = 'Brian\'s Burgers';
	// ok(!recipe.isDirty(), 'recipe itself is clean');
	assert.ok(recipe.isDirty(true), 'recipe is dirty if checking associations');
	recipe.cookbook.restore();
	// ok(!recipe.isDirty(true), 'recipe is now clean with checking associations');
	assert.equal(recipe.cookbook.title, 'Justin\'s Grillin Times', 'cookbook title back');
	//try belongs to recursive restore
	recipe.cookbook.title = 'Brian\'s Burgers';
	recipe.restore();
	assert.ok(recipe.isDirty(true), 'recipe is dirty if checking associations, after a restore');
	recipe.restore(true);
	// ok(!recipe.isDirty(true), 'cleaned all of recipe and its associations');
});

QUnit.test('backup restore nested observables', function(assert) {
	var observe = new MyMap({
		nested: {
			test: 'property'
		}
	});
	assert.equal(observe.nested.test, 'property', 'Nested object got converted');
	observe.backup();

	observe.nested.test = 'changed property';

	assert.equal(observe.nested.test, 'changed property', 'Nested property changed');

	assert.ok(observe.isDirty(true), 'Observe is dirty');
	observe.restore(true);
	assert.equal(observe.nested.test, 'property', 'Nested object got restored');
});

QUnit.test('backup removes properties that were added (#607)', function(assert) {
	var map = new MyMap({
		foo: 'string'
	});
	map.backup();
	map.foo = 'bar';
	assert.ok(map.isDirty(), 'the map with an additional property is dirty');
	map.restore();
	assert.ok(map.foo, undefined, 'there is no foo property');
});

QUnit.test('isDirty wrapped in an observation should trigger changes #1417', function(assert) {
	assert.expect(2);
	var recipe = new Recipe({
		name: 'bread'
	});

	recipe.backup();

	var obs = new Observation(function(){
		return recipe.isDirty();
	});

	assert.ok(!obs.get(), 'isDirty is false');

	canReflect.onValue(obs, function(){
		assert.ok(obs.get(), 'isDirty is true and a change has occurred');
	});

	recipe.name = 'cheese';
});
