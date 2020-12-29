var QUnit = require("steal-qunit");
var stache = require("can-stache");
var DefineList = require("can-define/list/list");
var canReflect = require("can-reflect");
var helpersCore = require('./core');
var stacheTestHelpers = require("../test/helpers")(document);


require("./-for-of");


QUnit.module("can-stache #for(of) helper");

QUnit.test("basics", function(assert) {

	var template = stache("<div>{{#for(value of list)}}<p>{{this.vmProp}}{{value}}</p>{{/for}}</div>");
	var list = new DefineList([34234,2,1,3]);
	var frag = template({
		list: list,
		vmProp: "1"
	});
	list.sort();
	// list.splice(0,4,1,2,3,34234);

	var order = [].map.call( stacheTestHelpers.cloneAndClean(frag).firstChild.getElementsByTagName("p"), function(p){
		return +p.innerHTML;
	});

	assert.deepEqual(order, [11,12,13,134234]);



	template = stache(
		"<div>"+
		"Hello, you have  {{this.users.length}}."+
		"{{# for(user of this.users) }}"+
		"  <div>"+
		"     {{user.name}}"+
		"     <ul>"+
		"       {{# for(todo of user.todos) }}"+
		"         <li>{{todo.name}}  {{ this.isOwner(user, todo) }}</li>"+
		"       {{/ for }}"+
		"     </ul>"+
		"  </div>"+
		"{{/ for }}"+
		"</div>"
	);

	var vm = {
		users: [
			{
				name: "Justin",
				todos: [{name: "for-in"}]
			}
		],
		isOwner: function(user, todo){
			return user.name === "Justin" && todo.name === "for-in" ? "yes" : "no";
		}
	};

	var result =  stacheTestHelpers.cloneAndClean( template(vm) ).firstChild.innerHTML.replace(/\s+/g," ");
	assert.equal(result, "Hello, you have 1. <div> Justin <ul> <li>for-in yes</li> </ul> </div>");
});

QUnit.test("create an observable let scope (#593)", function(assert) {
	var template = stache("<div>{{# for(thing of this.stuff)}}"+
		"{{let theValue=null}}"+
		"{{write theValue}}"+
		"<label>{{theValue}}</label>"+
    "{{/ for}}</div>");

	var obs = [];
	var frag = template({
		stuff: [{},{}],
		write: function(theValueObservable){
			obs.push(theValueObservable);
		}
	});

	canReflect.setValue( obs[0] , 1);
	canReflect.setValue( obs[1] , 2);

	var labels = stacheTestHelpers.cloneAndClean(frag).firstChild.getElementsByTagName("label");

	assert.equal(labels[0].innerHTML,"1", "first element");
	assert.equal(labels[1].innerHTML,"2", "first element");


});

QUnit.test("works with non observables", function(assert) {
	var template = stache("<div>{{#for(value of list)}}<p>{{this.vmProp}}{{value}}</p>{{/for}}</div>");
    var list = [34234,2,1,3];
    var frag = template({
		list: list,
		vmProp: "1"
	});

    var order = [].map.call( stacheTestHelpers.cloneAndClean(frag).firstChild.getElementsByTagName("p"), function(p){
        return +p.innerHTML;
    });

    assert.deepEqual(order, [134234,12,11,13]);
});


QUnit.test("works as string only", function(assert) {
	var template = stache("<div class='{{#for(value of list)}}[{{this.vmProp}}-{{value}}]{{/for}}'></div>");
    var list = [1,2,3];
    var frag = template({
		list: list,
		vmProp: "a"
	});
	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.className, "[a-1][a-2][a-3]");
});

QUnit.test("scope.index works", function(assert) {
	var template = stache("<div>{{#for(value of list)}}[{{scope.index}}]{{/for}}</div>");
    var list = ["a","b","c"];
    var frag = template({
		list: list,
		vmProp: "a"
	});
	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, "[0][1][2]");
});

QUnit.test("for(list) works", function(assert) {
	var template = stache("<div>{{#for(list)}}[{{scope.index}}]{{/for}}</div>");
	var list = ["a","b","c"];
	var frag = template({
		list: list,
		vmProp: "a"
	});
	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.innerHTML, "[0][1][2]");
});


QUnit.test("for(value of object) works in a string", function(assert) {
	var template = stache("<div class='{{#for(value of object)}}[{{scope.key}}-{{value}}]{{/for}}'></div>");
	var object = {
		first: "FIRST",
		second: "SECOND"
	};
	var frag = template({
		object: object
	});

	assert.equal( stacheTestHelpers.cloneAndClean(frag).firstChild.className, "[first-FIRST][second-SECOND]");
});

QUnit.test("else contains the correct this", function(assert) {
	var template = stache("{{#for(item of items)}}ITEM{{else}}{{this.message}}{{/for}}");
	var frag = template({
		items: [],
		message: "empty"
	});
	var cleaned = stacheTestHelpers.cloneAndClean(frag);

	assert.equal(
		cleaned.firstChild.nodeValue,
		"empty", "got the value from the VM");
});

QUnit.test("forOf works after calling helpersCore.__resetHelpers", function(assert) {
	helpersCore.__resetHelpers();

	var template = stache("<div>{{#for(value of list)}}<p>{{this.vmProp}}{{value}}</p>{{/for}}</div>");
	var list = new DefineList([34234,2,1,3]);
	var frag = template({
		list: list,
		vmProp: "1"
	});
	list.sort();

	var order = [].map.call( stacheTestHelpers.cloneAndClean(frag).firstChild.getElementsByTagName("p"), function(p){
			return +p.innerHTML;
	});

	assert.deepEqual(order, [11,12,13,134234]);
});

QUnit.test("for(value of object) works if value is keyed with a dot (issue#698)", function(assert){
	var template = stache("<div class='{{#for(value of object)}}[{{scope.key}}-{{value}}]{{/for}}'></div>");
	var object = {
		first: "FIRST",
		"second.key.has.dot": "SECOND"
	};
	var frag = template({
		object: object
	});

	assert.equal( frag.firstChild.className, "[first-FIRST][second.key.has.dot-SECOND]");
});

QUnit.test("for(integerValue) works", function (assert) {
	var template = stache("<div>{{#for(integerValue)}}[{{scope.index}}]{{/for}}</div>");
	var frag = template({
		integerValue: 3
	});
	assert.equal( stacheTestHelpers.cloneAndClean(frag.firstChild).innerHTML, "[0][1][2]" );
});

QUnit.test("for(ittr of intVal) works", function (assert) {
	var template = stache("<div class='{{#for(ittr of object.intVal)}}[{{scope.index}}-{{ittr}}]{{/for}}'></div>");
	var object = {
		intVal: 6
	};
	var frag = template({
		object: object
	});

	assert.equal( frag.firstChild.className, "[0-0][1-1][2-2][3-3][4-4][5-5]" );
});

QUnit.test("for(integerValue) uses else block for negatives", function (assert) {
	var template = stache("<div>{{#for(integerValue)}}[{{scope.index}}]{{else}}val is negative{{/for}}</div>");
	var frag = template({
		integerValue: -3
	});
	assert.equal( stacheTestHelpers.cloneAndClean(frag.firstChild).innerHTML, "val is negative" );
});
