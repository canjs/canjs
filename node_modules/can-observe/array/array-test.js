var QUnit = require("steal-qunit");
var ObserveArray = require("./array");
var canReflect = require("can-reflect");
var ObserveObject = require("../object/object");

QUnit.module("can-observe/array");

var classSupport = (function() {
	try {
		eval('"use strict"; class A{};');
		return true;
	} catch (e) {
		return false;
	}

})();

if(classSupport) {
    QUnit.test("observe.Array basics", function(assert) {
        class TodoList extends ObserveArray {
        }
        var todos = new TodoList(["a","b","c"]);

        assert.equal(todos.length, 3, "3 items");



		todos.on("length", function(ev, newVal){
			assert.equal(newVal, 4, "length is 4");
		});

		todos.push("4");

    });

    require("can-reflect-tests/observables/list-like/type/on-instance-patches")("observe.Array", function() {
    	return class MyArray extends ObserveArray {};
    });

    var MyArray, MyType;
    require("can-reflect-tests/observables/list-like/instance/serialize")("observe.Array observe.Object", function(values){
    	if(!MyArray) {
    		MyArray = class MyArray extends ObserveArray {};
    	}
    	return new MyArray(values);
    }, function(values){
    	if(!MyType) {
    		MyType = class MyType extends ObserveObject {};
    	}
    	return new MyType(values);
    });

}

QUnit.test("observe.Array.extend basics", function(assert) {
    var TodoList = ObserveArray.extend("TodoList",{},{});

    var todos = new TodoList(["a","b","c"]);

    assert.equal(todos.length, 3, "3 items");



    todos.on("length", function(ev, newVal){
        assert.equal(newVal, 4, "length is 4");
    });

    todos.push("4");

});

require("can-reflect-tests/observables/list-like/type/on-instance-patches")("observe.Array.extend", function() {
    return ObserveArray.extend("TodoList",{},{});
});

var MyExtendArray, MyExtendedType;
require("can-reflect-tests/observables/list-like/instance/serialize")("observe.Array.extend observe.Object.extend", function(values){
    if(!MyExtendArray) {
        MyExtendArray = ObserveArray.extend("MyExtendArray",{},{});
    }
    return new MyExtendArray(values);
}, function(values){
    if(!MyExtendedType) {
        MyExtendedType = ObserveObject.extend("MyExtendedType",{},{});
    }
    return new MyExtendedType(values);
});


QUnit.test("getters work", function(assert) {
	var actions = [];
	var People = ObserveArray.extend("People",{},{
		get over21() {
			actions.push("filter");
			return this.filter(function(person){
				return person.age > 21;
			});
		}
	});

	var people = new People([{id: 1, age: 22}, {id: 2, age: 21}, {id: 3, age: 23}]);

	people.on("over21", function over21Callback(ev, people){
		actions.push("over21Callback "+people.length);
	});

	assert.equal(people.over21.length, 2, "got the right number");


	people[0].age = 20;

	assert.deepEqual(actions,[
		"filter",
		"filter",
		"over21Callback 1"
	],"behavior is right");

});

QUnit.test("getters getKeyDependencies", function(assert) {
	var People = ObserveArray.extend("People", {}, {
		get over21() {
			return this.filter(function(person) {
				return person.age > 21;
			});
		}
	});

	var people = new People([
		{id: 1, age: 22},
		{id: 2, age: 21},
		{id: 3, age: 23}
	]);

	people.on("over21", function over21Callback() {});
	assert.equal(people.over21.length, 2, "got the right number");

	assert.ok(
		canReflect.getKeyDependencies(people, "over21").valueDependencies,
		"should return internal observation"
	);
});
