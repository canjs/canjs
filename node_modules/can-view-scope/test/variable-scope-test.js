var Scope = require('can-view-scope');
var QUnit = require('steal-qunit');
var SimpleMap = require('can-simple-map');
var canReflect = require("can-reflect");

QUnit.module('can-view-scope variable scope');

QUnit.test("reading", function(assert) {
	var root = {
		rootProp: "ROOT",
		conflictProp: "ROOT"
	};
	var scope = new Scope(root).add({
		variableProp: "VARIABLE",
		conflictProp: "VARIABLE"
	},{variable: true});

	assert.equal( scope.get("variableProp"), "VARIABLE", "can read a variable");
	assert.equal( scope.get("this.rootProp"), "ROOT", "can pass variables for the root");

	assert.equal( scope.get("this.conflictProp"), "ROOT", "this.conflictProp");
	assert.equal( scope.get("./conflictProp"), "ROOT", "./conflictProp");
	assert.equal( scope.get("conflictProp"), "VARIABLE", "conflictProp");

	assert.equal( scope.get("this"), root, "this is right");

	var root2 = {
		root2Prop: "ROOT2",
		conflictProp: "ROOT2"
	};
	var scope2 = new Scope(root).add(root2).add({
		variableProp: "VARIABLE",
		conflictProp: "VARIABLE"
	},{variable: true});

	assert.equal( scope2.get("variableProp"), "VARIABLE", "can read a variable");
	assert.equal( scope2.get("this.root2Prop"), "ROOT2", "can pass variables for the root 2");

	assert.equal( scope2.get("this.conflictProp"), "ROOT2", "this.conflictProp");
	assert.equal( scope2.get("./conflictProp"), "ROOT2", "./conflictProp");
	assert.equal( scope2.get("conflictProp"), "VARIABLE", "conflictProp");

	assert.equal( scope2.get("../conflictProp"), "ROOT", "../conflictProp");

	var root3 = {
		root3Prop: "ROOT3",
		conflictProp: "ROOT3"
	};
	var scope3 = new Scope(root).add(root2).add(root3).add({
		variableProp: "VARIABLE",
		conflictProp: "VARIABLE"
	},{variable: true});

	assert.equal( scope3.get("../../conflictProp"), "ROOT", "../../conflictProp");
});

QUnit.test("writing", function(assert) {
	var root = new SimpleMap({name: "ROOT"});
	var scope;

	scope = new Scope(root).addLetContext();

	scope.set("rootProp","VALUE");
	assert.equal(root.get("rootProp"), "VALUE", "wrote to property with .set");

	var rootProp = scope.computeData('rootProp2');
	canReflect.setValue(rootProp, "VALUE2");
	assert.equal(root.get("rootProp2"), "VALUE2", "wrote property by setting ScopeKeyData");

	var rootProp3 = scope.computeData('rootProp3');
	canReflect.onValue(rootProp3, function(){});
	canReflect.setValue(rootProp3, "VALUE3");
	assert.equal(root.get("rootProp3"), "VALUE3", "wrote to property by setting bound ScopeKeyData");


	scope = new Scope(root).addLetContext({tempProp: undefined});

	scope.set("tempProp", "foo");

	assert.equal(root.get("tempProp"), undefined, "write to undefined not set on root");
	assert.equal(scope.get("tempProp"), "foo", "able to read from root");
});
