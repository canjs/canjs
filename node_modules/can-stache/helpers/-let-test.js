var QUnit = require("steal-qunit");
var stache = require("can-stache");
var DefineMap = require("can-define/map/map");
var SimpleMap = require("can-simple-map");
var Scope = require("can-view-scope");
var helpersCore = require('can-stache/helpers/core');

var stacheTestHelpers = require("../test/helpers")(document);

require("./-let");

QUnit.module("can-stache let helper");

QUnit.test("basics without commas", function(assert) {

	var template = stache(
		"{{let userName=this.name constTwo=2}}"+
		"<div>{{userName}}</div>"
	);
	var vm = new DefineMap({name: "Justin"});

	var frag = template(vm);

	assert.equal( stacheTestHelpers.cloneAndClean(frag).lastChild.innerHTML, "Justin", "got initial value");

	vm.name = "Ramiya";

	assert.equal( stacheTestHelpers.cloneAndClean(frag).lastChild.innerHTML, "Ramiya", "value updated");
});

QUnit.test("basics with commas", function(assert) {

	var template = stache(
		"{{let userName=this.name, constTwo=2}}"+
		"<div>{{userName}}-{{constTwo}}</div>"
	);
	var vm = new DefineMap({name: "Justin"});

	var frag = template(vm);

	assert.equal( stacheTestHelpers.cloneAndClean(frag).lastChild.innerHTML, "Justin-2", "got initial value");

	vm.name = "Ramiya";

	assert.equal( stacheTestHelpers.cloneAndClean(frag).lastChild.innerHTML, "Ramiya-2", "value updated");
});

QUnit.test("make undefined variables settable", function(assert) {
	var template = stache(
		"{{ let userName=undefined }}"+
		"<div>{{userName}} {{changeUserName(scope)}}</div>"
	);
	var scope;
	var frag = template({
		changeUserName: function(passedScope){
			scope = passedScope;
			return "";
		}
	});


	scope.set("userName","Justin");
	assert.deepEqual( stacheTestHelpers.cloneAndClean(frag).lastChild.firstChild.nodeValue, "Justin");

});

QUnit.test("custom scopes still get a let context", function(assert) {
	var template = stache("{{let foo='bar'}}");
	template(new Scope({}));
	assert.ok(true, "passes");
});

QUnit.test("let blocks allow reassigning variables #645", function(assert) {
	var template = stache(
		"{{#let foo='bar'}}" +
		"<p>{{foo}}</p>" +
		"{{/let}}" +
		"{{#let foo='baz'}}" +
		"<p>{{foo}}</p>" +
		"{{/let}}" +
		"<p>foo-{{foo}}</p>"
	);
	var frag = template(new Scope({}));
	var paragraphs = frag.querySelectorAll('p');
	assert.equal( paragraphs[0].innerHTML, "bar", "first value still works");
	assert.equal( paragraphs[1].innerHTML, "baz", "reassigning foo works");
	assert.equal( paragraphs[2].innerHTML, "foo-", "foo is not available outside of let block");
});

QUnit.test("let works after calling helpersCore.__resetHelpers", function(assert) {
	helpersCore.__resetHelpers();

	var template = stache(
		"{{let userName=this.name constTwo=2}}"+
		"<div>{{userName}}</div>"
	);
	var vm = new DefineMap({name: "Justin"});

	var frag = template(vm);

	assert.equal( stacheTestHelpers.cloneAndClean(frag).lastChild.innerHTML, "Justin", "got initial value");

	vm.name = "Ramiya";

	assert.equal( stacheTestHelpers.cloneAndClean(frag).lastChild.innerHTML, "Ramiya", "value updated");
});

QUnit.test("let multiple updates (#650)", function(assert) {

	// This is actually testing that creating the prop[ref] observable will not leak an observation record.
	var template = stache(
		"{{let a = prop[ref]}}"+
		"{{a}}"
	);

	var data = new SimpleMap({
		ref: 0,
		prop: new SimpleMap({
			0: 1,
			1: 2,
			2: 3,
			4: 4
		})
	});

	template(data);

	data.set("ref", data.get("ref")+1 );
	data.set("ref", data.get("ref")+1 );
	assert.ok(true, "got here");
});


QUnit.test("let does not observe itself", function(assert) {
	//queues.stopAfterTaskCount(200);
	//queues.log("flush");
	//queues.breakOnTaskName("Observation<ScopeKeyData{{state}}.read>.onDependencyChange")

	var view = stache("<div>"+
		"{{# or(edit,delete) }}"+

			"{{# if(edit)}}"+
				"{{ let state = editing}}"+
			"{{else}}"+
				"{{ let state = deleting}}"+
			"{{/ if}}"+

			"<p>You are {{state}}</p>"+

		"{{else}}"+

			"<p>Not editing or deleting</p>"+

		"{{/ or}}"+
		"</div>"
	);


	var vm = new SimpleMap({
		edit: false,
		"delete": false,
		editing: "editing",
		deleting: "deleting",
	});

	var frag = view(vm);

	vm.set("edit", true);

	vm.set("edit", false);

	vm.set("delete", true);

	assert.ok(true, "got here without breaking");
	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.querySelector("p").innerHTML, "You are deleting");
});
