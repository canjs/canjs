var QUnit = require("steal-qunit");
var connect = require("./can-connect");
var set = require("can-set-legacy");


QUnit.module("can-connect/core test",{
	beforeEach: function(assert) {

	}
});


QUnit.test("Determine .id() from queryLogic (#82)", function(assert) {
	var queryLogic = new set.Algebra(
		set.comparators.id("_id")
	);
	var connection = connect([],{
		queryLogic: queryLogic
	});
	assert.equal( connection.id({_id: "foo"}), "foo", "got id from queryLogic");
	assert.equal( connection.id({_id: 1}), 1, "got id from queryLogic");
});

QUnit.test("Everything available at can-connect/all", function(assert) {
	var all = require("./all");
	var expectedBehaviors = [
		'cacheRequests',
		'constructor',
		'constructorCallbacksOnce',
		'constructorStore',
		'dataCallbacks',
		'dataCallbacksCache',
		'dataCombineRequests',
		'dataLocalStorageCache',
		'dataMemoryCache',
		'dataParse',
		'dataUrl',
		'fallThroughCache',
		'realTime',
		'superMap',
		'baseMap',
	];
	expectedBehaviors.forEach(function(behaviorName){
		assert.ok(all[behaviorName], 'behavior in place: ' + behaviorName);
	});
});

QUnit.test("queryLogic falls", function(assert) {
    var algebra = {};

    var connection = connect([{
        methodThatChecksAlgebra: function(){
            assert.equal(this.queryLogic, algebra);
        }
    }],
    {
        algebra: algebra
    });

    connection.methodThatChecksAlgebra();

	connection = connect([{
        methodThatChecksAlgebra: function(){
            assert.equal(this.queryLogic, algebra);
        }
    }],
    {
        queryLogic: algebra
    });

	connection.methodThatChecksAlgebra();

    /*
    var connection = connect([
        ,
        base],
    );*/
});
