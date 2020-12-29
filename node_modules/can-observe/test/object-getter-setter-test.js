var QUnit = require("steal-qunit");
var observe = require("can-observe");
var canReflect = require("can-reflect");
var ObservationRecorder = require("can-observation-recorder");


QUnit.module("can-observe Objects getter and setter behavior");


// This is here until the skipped tests after it can be completed
QUnit.test("don't observe getters", function(assert) {
	var o = observe({
		get b() {
			return this.c;
		},
		c: "d"
	});
	ObservationRecorder.start();
	var res = o.b;
	var record = ObservationRecorder.stop();
	assert.equal(res,"d", "got the right value");

	assert.equal( record.keyDependencies.size, 1, "one object");
	assert.equal(record.keyDependencies.get(o).size,1, "one key");
	assert.ok(record.keyDependencies.get(o).has("c"), "c is the key");
});

QUnit.skip("getters can be bound within observes", function(assert) {
	assert.expect(5);
	var count = 0;
	var o = observe({
		get b() {
			assert.ok(count <= 4, "hit the getter " + (++count) + " of 4");
			return this.c;
		},
		c: "d"
	});

	var fn;
	canReflect.onKeyValue(o, "b", fn = function() {
		assert.ok(true, "Hit the updater");
	}); // Also reads b's getter, #1

	var d = o.b; // #2
	o.c = "e"; // #3

	// After offKeyValue these shouldn't trigger more updader calls.
	canReflect.offKeyValue(o, "b", fn);
	d = o.b; // #4
	// This won't trigger b's getter or the updater now.
	o.c = "f";
});

QUnit.skip("getters can be bound across observes", function(assert) {
	assert.expect(5);
	var count = 0;
	var b = observe({
		c: "d"
	});
	var o = observe({
		get b() {
			assert.ok(count <= 4, "hit the getter " + (++count) + " of 4");
			return b.c;
		}
	});

	var fn;
	canReflect.onKeyValue(o, "b", fn = function() {
		assert.ok(true, "Hit the updater");
	}); // Also reads b's getter, #1

	var d = o.b; // #2
	b.c = "e"; // #3

	// After offKeyValue these shouldn't trigger more updader calls.
	canReflect.offKeyValue(o, "b", fn);
	d = o.b; // #4
	// This won't trigger b's getter or the updater now.
	b.c = "f";
});

QUnit.skip("getter/setters within observes", function(assert) {
	assert.expect(7);
	var getCount = 0,
		setCount = 0;
	var o = observe({
		get b() {
			assert.ok(getCount <= 4, "hit the getter " + (++getCount) + " of 4");
			return this.c;
		},
		set b(val) {
			assert.ok(setCount <= 2, "Setter was called " + (++setCount) + " of 2"); //x2
			this.c = val;
		},
		c: "d"
	});

	var fn;
	canReflect.onKeyValue(o, "b", fn = function() {
		assert.ok(true, "Hit the updater");
	}); // Also reads b's getter, #1

	var d = o.b; // #2
	o.b = "e"; // #3, set #1

	// After offKeyValue these shouldn't trigger more updader calls.
	canReflect.offKeyValue(o, "b", fn);
	d = o.b; // #4
	// This won't trigger b's getter or the updater now.
	o.b = "f"; // set #2
});

QUnit.skip("getters on prototype are treated as observable value", function(assert){
    var fullNameInstanceCalls = [];
    var proto = observe({
        get fullName(){
            fullNameInstanceCalls.push(this);
            return this.first + " "+ this.last;
        }
    });
    var instance = observe(canReflect.assign( Object.create(proto), {first: "Justin", last: "Meyer"}));

    // this should generate the observation
    //canReflect.onKeyValue(instance,"fullName", function(){
    //
    //});

    ObservationRecorder.start();
    var fullName = instance.fullName;
    var record = ObservationRecorder.stop();

    assert.equal(fullName, "Justin Meyer", "got the right value");

    assert.equal( record.keyDependencies.size, 1, "one object");
    assert.equal(record.keyDependencies.get(instance).size,1, "bind on instance");
    assert.ok(record.keyDependencies.get(instance).has("fullName"), "fullName is the key");

    fullName = instance.fullName;
    assert.deepEqual(fullNameInstanceCalls,[instance], "called to bind with the right this only once");
});
