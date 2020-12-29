var QUnit = require('steal-qunit');
var SimpleObservable = require('../can-simple-observable');
var canReflect = require('can-reflect');
var makeCompute = require("./make-compute");

QUnit.module('can-simple-observable/make-compute');

QUnit.test('basics', function(assert) {
    assert.expect(4);
    var compute = makeCompute(new SimpleObservable(5));
    assert.equal( compute(), 5, "read");
    compute(6);
    assert.equal( compute(), 6, "write");

    compute.on("change", function(ev, newVal, oldVal){
        assert.equal(newVal, 7, "bound newVal");
        assert.equal(oldVal, 6, "bound newVal");
    });
    compute(7);
});

QUnit.test("unbind('change')", function(assert) {
    var observable = new SimpleObservable(5);
    var compute = makeCompute(observable);
    compute.on('change', function(){});
    compute.on('change', function(){});
    assert.equal(observable.handlers.get([]).length, 2, "2 observables");
    compute.unbind("change");
    assert.equal(observable.handlers.get([]).length, 0, "2 observables");
});
