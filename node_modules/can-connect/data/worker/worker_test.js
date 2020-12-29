var QUnit = require("steal-qunit");
var workerBehavior = require("./worker");
var connect = require("can-connect");
var testHelpers = require("../../test-helpers");

if(typeof Worker !== "undefined" && !System.isEnv('production')) {
	QUnit.module("can-connect/data-worker");

	QUnit.test("getListData", function(assert) {
		var connection = connect([workerBehavior],{
			name: "todos",
			worker: new Worker(System.stealURL + "?main=can-connect/data/worker/worker-main_test")
		});

		var done = assert.async();
		connection.getListData({foo: "bar"})
			.then(function(listData){
				assert.deepEqual(listData,{data: [{id: 1},{id: 2}]}, "got back data");
				done();
			}, testHelpers.logErrorAndStart(assert, done));
	});
}
