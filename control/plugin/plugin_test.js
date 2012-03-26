steal('can/construct/super',
'funcunit/qunit')
.then('can/construct/super', 'can/control/plugin')
.then(function () {

	module("can/control/plugin")

	test("pluginName", function () {
		expect(8);

		var pluginControl = can.Control({
			pluginName : "my_plugin"
		}, {
			init : function(el, ops) {
				ok(true, 'Init called');
				equal(ops.testop, 'testing', 'Test argument set');
			},

			method : function (arg) {
				ok(true, "Method called");
				equal(arg, 'testarg', 'Test argument passed');
			},

			update : function (options) {
				ok(true, "Update called");
			}
		});

		var ta = can.$("<div/>").addClass('existing_class').appendTo($("#qunit-test-area"));
		ta.my_plugin({ testop : 'testing' }); // Init
		ok(ta.hasClass("my_plugin"), "Should have class my_plugin");
		ta.my_plugin(); // Update
		ta.my_plugin("method", "testarg"); // method()
		ta.controller().destroy(); // destroy
		ok(!ta.hasClass("my_plugin"), "Shouldn't have class my_plugin after being destroyed");
		ok(ta.hasClass("existing_class"), "Existing class should still be there");
	});

	test(".controller(), .controllers()", function() {
		expect(3);
		can.Control("TestPlugin", {
		});

		var ta = can.$("<div/>").appendTo($("#qunit-test-area"));
		ok(ta.test_plugin, 'Converting Control name to plugin name worked');
		ta.test_plugin();
		equal(ta.controllers().length, 1, '.controllers() returns one instance');
		ok(ta.controller() instanceof TestPlugin, 'Control is instance of test plugin')
	});

});