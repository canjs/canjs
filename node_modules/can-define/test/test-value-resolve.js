"use strict";
var QUnit = require("steal-qunit");
require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var canReflect = require("can-reflect");
var queues = require("can-queues");
var ObservationRecorder = require("can-observation-recorder");

// Tests events directly on the Constructor function for define.Constructor, DefineMap and DefineList
QUnit.module("can-define value with resolve");

QUnit.test("counter", function(assert) {
    var Person = DefineMap.extend("Person", {
        name: "string",
        nameChangeCount: {
            value: function(prop){
                var count = 0;
                prop.resolve(count);
                prop.listenTo("name", function(){
                    prop.resolve(++count);
                });
            }
        }
    });

    var me = new Person();
    assert.equal(me.nameChangeCount,0, "unbound value");

    me.name = "first";

    assert.equal(me.nameChangeCount,0, "unbound value");

    me.on("nameChangeCount", function(ev, newVal, oldVal){
        assert.equal(newVal,1, "updated count");
        assert.equal(oldVal,0, "updated count from old value");
    });

    me.name = "second";

    assert.equal(me.nameChangeCount,1, "bound value");
});

QUnit.test("fullName getter the hard way", function(assert) {
	assert.expect(3);
    var Person = DefineMap.extend("Person", {
        first: "string",
        last: "string",
        fullName: {
            value: function(prop){
                var first = this.first,
                    last = this.last;
                prop.resolve(first + " " + last);
                prop.listenTo("first", function(ev, newFirst){
                    first = newFirst;
                    prop.resolve(first + " " + last);
                });
                prop.listenTo("last", function(ev, newLast){
                    last = newLast;
                    prop.resolve(first + " " + last);
                });
            }
        }
    });
    var me = new Person({first:"Justin", last: "Meyer"});

    assert.equal(me.fullName, "Justin Meyer", "unbound value");

    var handler = function(ev, newVal, oldVal){
        assert.equal(newVal, "Ramiya Meyer", "event newVal");
        assert.equal(oldVal, "Justin Meyer", "event oldVal");
    };

    me.on("fullName", handler);

    me.first = "Ramiya";

    me.off("fullName", handler);

    me.last = "Shah";
});

QUnit.test("list length", function(assert) {
    var VM = DefineMap.extend("VM", {
        tasks: [],
        tasksLength: {
            value: function(prop){
                var tasks;
                function checkAndResolve(){
                    if(tasks) {
                        prop.resolve(tasks.length);
                    } else {
                        prop.resolve(0);
                    }
                }
                function updateTask(ev, newTask, oldTask) {
                    if(oldTask) {
                        prop.stopListening(oldTask);
                    }
                    tasks = newTask;
                    if(newTask) {
                        prop.listenTo(newTask,"length", function(ev, newVal){
                            prop.resolve(newVal);
                        });
                    }

                    checkAndResolve();
                }

                prop.listenTo("tasks", updateTask);

                updateTask(null, this.tasks, null);
            }
        }
    });

    var vm = new VM({tasks: null});

    assert.equal(vm.tasksLength, 0, "empty tasks, unbound");

    vm.tasks = ["chore 1", "chore 2"];

    assert.equal(vm.tasksLength, 2, "tasks, unbound");
    var lengths = [];
    vm.on("tasksLength", function(ev, newLength){
        lengths.push(newLength);
    });

    assert.equal(vm.tasksLength, 2, "2 tasks, bound");

    vm.tasks.push("chore 3");

    var originalTasks = vm.tasks;

    assert.equal(vm.tasksLength, 3, "3 tasks, bound, after push to source");

    vm.tasks = ["one chore"];

    assert.equal(vm.tasksLength, 1, "1 tasks, bound, after replace array");

    assert.notOk( canReflect.isBound(originalTasks), "not bound on original");


    assert.deepEqual(lengths, [3, 1], "length changes are right");
});

QUnit.test("batches produce one result", function(assert) {
	assert.expect(2);
    var Person = DefineMap.extend("Person", {
        first: "string",
        last: "string",
        fullName: {
            value: function(prop){
                var first = this.first,
                    last = this.last;
                prop.resolve(first + " " + last);
                prop.listenTo("first", function(ev, newFirst){
                    first = newFirst;
                    prop.resolve(first + " " + last);
                });
                prop.listenTo("last", function(ev, newLast){
                    last = newLast;
                    prop.resolve(first + " " + last);
                });
            }
        }
    });

    var me = new Person({first:"Justin", last: "Meyer"});

    var handler = function(ev, newVal, oldVal){
        assert.equal(newVal, "Ramiya Shah", "event newVal");
        assert.equal(oldVal, "Justin Meyer", "event oldVal");
    };

    me.on("fullName", handler);

    queues.batch.start();
    me.first = "Ramiya";
    me.last = "Shah";
    queues.batch.stop();
});

QUnit.test("location vm", function(assert) {
    var Locator = DefineMap.extend("Locator",{
    	state: "string",
        setCity: function(city){
            this.dispatch("citySet",city);
        },
    	city: {
            value: function(prop) {
                prop.listenTo("citySet", function(ev, city){
                    prop.resolve(city);
                });
                prop.listenTo("state", function(){
                    prop.resolve(null);
                });
            }
        }
    });

    var locator = new Locator({
    	state: "IL"
    });
    locator.on("city", function(){});

    locator.setCity("Chicago");

    locator.state = "CA";
    assert.equal(locator.city, null, "changing the state sets the city");

});

QUnit.test("location vm with setter", function(assert) {
    var Locator = DefineMap.extend("Locator",{
    	state: "string",
    	city: {
            value: function(prop) {
                prop.listenTo(prop.lastSet, prop.resolve);
                prop.listenTo("state", function(){
                    prop.resolve(null);
                });
                prop.resolve( prop.lastSet.get() );
            }
        }
    });

    var locator = new Locator({
    	state: "IL",
        city: "Chicago"
    });
    assert.equal(locator.city, "Chicago", "init to Chicago");

    locator.on("city", function(){});

    locator.state = "CA";
    assert.equal(locator.city, null, "changing the state sets the city");

    locator.city = "San Jose";

    assert.equal(locator.city, "San Jose", "changing the state sets the city");

});

QUnit.test("events should not be fired when resolve is not called", function(assert) {
	var Numbers = DefineMap.extend("Numbers",{
		oddNumber: {
			value: function(prop) {
				prop.resolve(5);

				prop.listenTo(prop.lastSet, function(newVal){
					if (newVal % 2) {
						prop.resolve(newVal);
					}
				});
			}
		}
	});

	var nums = new Numbers({});

	assert.equal(nums.oddNumber, 5, "initial value is 5");

	nums.on("oddNumber", function(ev, newVal){
		assert.equal(newVal % 2, 1, "event dispatched for " + newVal);
	});

	nums.oddNumber = 7;
	nums.oddNumber = 8;
});

QUnit.test("reading properties does not leak out", function(assert) {
    var Type = DefineMap.extend({
        prop: {
            value: function(prop){
                prop.resolve(this.value);
            }
        },
        value: {default: "hi"}
    });

    var t = new Type();

    ObservationRecorder.start();

    t.on("prop", function(){});

    var records = ObservationRecorder.stop();

    assert.equal(records.keyDependencies.size, 0, "there are no key dependencies");
});

/*
QUnit.test("fullName getter/setter the hard way", 3, function(){
    var Person = DefineMap.extend("Person", {
        first: {
            value: function(resolve, listenTo){
                listenTo("firstSet", function(ev, newVal){
                    resolve(newVal);
                });
                listenTo("fullNameSet", function(ev, newVal){
                    var parts = newVal.split(" ");
                    resolve(parts[0]);
                });
            }
        },
        last: {
            value: function(resolve, listenTo){
                listenTo("firstSet", function(ev, newVal){
                    resolve(newVal);
                });
                listenTo("fullNameSet", function(ev, newVal){
                    var parts = newVal.split(" ");
                    resolve(parts[0]);
                });
            }
        },
        fullName: {
            value: function(resolve, listenTo){
                var first = this.first,
                    last = this.last;
                resolve(first + " " + last);
                listenTo("first", function(ev, newFirst){
                    first = newFirst;
                    resolve(first + " " + last);
                });
                listenTo("last", function(ev, newLast){
                    last = newLast;
                    resolve(first + " " + last);
                });
            }
        }
    });
    var me = new Person({first:"Justin", last: "Meyer"});

    assert.equal(me.fullName, "Justin Meyer", "unbound value");

    var handler = function(ev, newVal, oldVal){
        assert.equal(newVal, "Ramiya Meyer", "event newVal");
        assert.equal(oldVal, "Justin Meyer", "event oldVal");
    };

    me.on("fullName", handler);

    me.first = "Ramiya";

    me.off("fullName", handler);

    me.last = "Shah";
});
*/
