steal("can/util/batch", "can/test", "can/map", "steal-qunit", "./read_test", function () {
	QUnit.module('can/util/batch');
	
	test('Callback registered during batch dispatch is called upon completion', function () {
		var isCallbackCalled = false;
		var dataModel = new can.Map({
			value: 42
		});

		dataModel.on("value", function() {
			can.batch.after(function() {
				isCallbackCalled = true;
			});
		});

		can.batch.start();
		dataModel.attr("value", 2);
		// Callback is not called yet because the batch is not yet stopped.
		equal(isCallbackCalled, false, "isCallbackCalled");
		can.batch.stop();
		// Callback is called now that the batch is stopped.
		equal(isCallbackCalled, true, "isCallbackCalled");
	});
});