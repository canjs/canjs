var QUnit = require("steal-qunit");
var serviceWorkerCache = require("./service-worker");
var connect = require("../can-connect");
var testHelpers = require("../test-helpers");

if(typeof Worker !== "undefined" && !System.isEnv('production')) {
	QUnit.module("can-connect/service-worker",{
		beforeEach: function(assert) {
			this.connection = connect([serviceWorkerCache],{
				name: "todos",
				workerURL: System.stealURL + "?main=can-connect/service-worker/service-worker-main_test"
			});
		}
	});

	QUnit.test("updateListData", function(assert) {
		var connection = this.connection;

		var done = assert.async();
		connection.getListData({foo: "bar"})
			.then(function(listData){
				assert.deepEqual(listData, {data: [{id: 1}, {id: 2}]}, "got back data");
				done();
			}, testHelpers.logErrorAndStart(assert, done));

	});
}
