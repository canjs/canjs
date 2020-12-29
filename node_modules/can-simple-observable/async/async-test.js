var QUnit = require('steal-qunit');
var AsyncObservable = require('./async');
var SimpleObservable = require('../can-simple-observable');
var canReflect = require('can-reflect');
var ObservationRecorder = require("can-observation-recorder");
var Observation = require("can-observation");

QUnit.module('can-simple-observable/async');

QUnit.test('basics', function(assert){
    var done = assert.async();
    var value = new SimpleObservable(1);


    var obs = new AsyncObservable(function(lastSet, resolve){
        if(!resolve) {
            return "default";
        }
        if(value.get() === 1) {
            setTimeout(function(){
                resolve("a");
            }, 1);
        } else {
            setTimeout(function(){
                resolve("b");
            }, 1);
        }
    });

    // Unbound and unobserved behavior
    assert.equal(canReflect.getValue(obs), 'default', 'getValue unbound');

    // Unbound , being observed behavior
    ObservationRecorder.start();
    assert.equal(canReflect.getValue(obs), undefined, "getValue being bound");
    var dependencies = ObservationRecorder.stop();
    assert.ok(!dependencies.valueDependencies.has(value), "did not record value");
    assert.ok(dependencies.valueDependencies.has(obs), "did record observable");
    assert.equal(dependencies.valueDependencies.size, 1, "only one value to listen to");

    var changes = 0;
    var handler = function(newValue) {
        changes++;
        if(changes === 1) {
            assert.equal(newValue, 'a', 'onValue a');
            value.set(2);
        } else {
            assert.equal(newValue, 'b', 'onValue b');
            done();
        }
    };
    canReflect.onValue(obs, handler);

});


QUnit.test("get and set Priority", function(assert) {
    var value = new SimpleObservable(1);

    var obs = new AsyncObservable(function(lastSet, resolve){
        if(!resolve) {
            return "default";
        }
        if(value.get() === 1) {
            setTimeout(function(){
                resolve("a");
            }, 1);
        } else {
            setTimeout(function(){
                resolve("b");
            }, 1);
        }
    });

    canReflect.setPriority(obs, 5);

    assert.equal(canReflect.getPriority(obs), 5, "set priority");
});

QUnit.test("prevent a getter returning undefined from overwriting last resolved value", function(assert) {
    var value = new SimpleObservable(1);

    var obs = new AsyncObservable(function(lastSet, resolve){
        if(value.get() === 1) {
            return null;
        } else {
            resolve(4);
        }

    });
    obs.on(function(){});
    assert.equal( obs.get(), null );
    value.set(2);

    assert.equal( obs.get(), 4 );

});

QUnit.test("prevent a getter returning undefined from overwriting last resolved value at the start", function(assert) {
    var value = new SimpleObservable(1);

    var obs = new AsyncObservable(function(lastSet, resolve){
        resolve(value.get()*2);
    });
    obs.on(function(){});
    assert.equal( obs.get(), 2 );
    value.set(2);

    assert.equal( obs.get(), 4 );

});

if(System.env.indexOf("production") < 0) {
    QUnit.test("log async observable changes", function(assert) {
    	var done = assert.async();
    	var value = new SimpleObservable(1);

    	var obs = new AsyncObservable(function(lastSet, resolve) {
    		if (value.get() === 1) {
    			setTimeout(function(){
    				resolve("b");
    			}, 1);
    		} else {
    			setTimeout(function(){
    				resolve("c");
    			}, 1);
    		}
    	}, null, "a");

    	// turn on logging
    	obs.log();

    	// override the internal _log to spy on arguments
    	var changes = [];
    	obs._log = function(previous, current) {
    		changes.push({ previous: previous, current: current });
    	};

    	// make sure the observable is bound
    	canReflect.onValue(obs, function() {});

    	// trigger observation changes
    	value.set("2");

    	assert.expect(1);
    	setTimeout(function() {
    		assert.deepEqual(changes, [
    			{ current: "b", previous: undefined },
    			{ current: "c", previous: "b" },
    		]);
    		done();
    	}, 10);
    });
}

QUnit.test("getValueDependencies", function(assert) {
	var value = new SimpleObservable(1);

	var obs = new AsyncObservable(function(lastSet, resolve){
		return value.get() === 1 ? lastSet : resolve(4);
	});

	// unbound
	assert.equal(
		typeof canReflect.getValueDependencies(obs),
		"undefined",
		"should be undefined when observable is unbound"
	);

	// bound
	canReflect.onValue(obs, function() {});
	assert.deepEqual(
		canReflect.getValueDependencies(obs).valueDependencies,
		new Set([obs.lastSetValue, value])
	);
});

QUnit.test("if a value is resolved and another is returned - returned value should be used (#13)", function(assert) {
	var changeCount = 0;
	var value = new SimpleObservable(1);

	var asyncObs = new AsyncObservable(function(lastSet, resolve){
		resolve("resolved value");
		return "returned value";
	});

	canReflect.onValue(asyncObs, function() {
		changeCount++;
	});

	assert.equal( asyncObs.get(), "returned value", "returned value");
	assert.equal(changeCount, 1, "only one change event occured");

});

QUnit.test("return, resolve, and then return again should work and should update dependent observations (#13)", function(assert) {
	var done = assert.async();
	var value = new SimpleObservable(null);

	var p1 = new Promise(function(resolve) {
		resolve("resolved value 1");
	});

	var p2 = new Promise(function(resolve) {
		setTimeout(function() {
			resolve("resolved value 2");
		}, 10);
	});

	var asyncObs = new AsyncObservable(function(lastSet, resolve){
		var thePromise = value.get();
		if (thePromise) {
			thePromise.then(function(data) {
				resolve(data);
			});
		}
		return "returned value";
	});

	var wrapper = new Observation(function() {
		return asyncObs.get();
	});
	canReflect.onValue(wrapper, function() {});

	assert.equal(asyncObs.get(), "returned value", "returned value");
	assert.equal(canReflect.getValue(wrapper), "returned value", "observation - returned value");

	value.set(p1);
	setTimeout(function() {
		assert.equal(asyncObs.get(), "resolved value 1", "resolved value 1");
		assert.equal(canReflect.getValue(wrapper), "resolved value 1", "observation - resolved value 1");

		value.set(p2);
		assert.equal(asyncObs.get(), "returned value", "returned value");
		assert.equal(canReflect.getValue(wrapper), "returned value", "observation - returned value");

		setTimeout(function() {
			assert.equal(asyncObs.get(), "resolved value 2", "resolved value 2");
			assert.equal(canReflect.getValue(wrapper), "resolved value 2", "observation - resolved value 2");

			done();
		}, 10);
	});
});

QUnit.test("resolving, then later returning should not cause duplicate events (#13)", function(assert) {
	var count = 0;
	var id = new SimpleObservable(null);

	var asyncObs = new AsyncObservable(function(lastSet, resolve) {
		if (lastSet) {
			return lastSet
		} else if (id.get()) {
			resolve("resolved value");
		}
	});

	canReflect.onValue(asyncObs, function(newVal) {
		count++;
	});

	id.set("trigger a change");
	assert.equal(asyncObs.get(), "resolved value", "resolved value");

	asyncObs.set("set value");
	assert.equal(asyncObs.get(), "set value", "set value");

	assert.equal(count, 2, "2 change events");
});

QUnit.test("proactive binding doesn't last past binding (can-stache#486)", function(assert) {
    var value = new SimpleObservable(2);

    var readCount = 0;


    var obs = new AsyncObservable(function(lastSet, resolve){

        readCount++;
        if(!resolve) {
            return "default";
        }
        if(value.get() === 1) {
            setTimeout(function(){
                resolve("a");
            }, 1);
        } else {
            setTimeout(function(){
                resolve("b");
            }, 1);
        }
    });

    var outer = new Observation(function(){
        return obs.get();
    });

    function handler(){}

    outer.on(handler);

    outer.off(handler);

    value.set(3);

    assert.equal(readCount, 1, "internal observation only updated once");

});
