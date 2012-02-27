test("pluginName", function() {
	// Testing for controller pluginName fixes as reported in
	// http://forum.javascriptmvc.com/#topic/32525000000253001
	// http://forum.javascriptmvc.com/#topic/32525000000488001
	expect(6);

	can.Control("PluginName", {
	pluginName : "my_plugin"
	}, {
	method : function(arg) {
	ok(true, "Method called");
	},

	update : function(options) {
	this._super(options);
	ok(true, "Update called");
	},

	destroy : function() {
	ok(true, "Destroyed");
	this._super();
	}
	});

	var ta = $("<div/>").addClass('existing_class').appendTo( $("#qunit-test-area") );
	ta.my_plugin(); // Init
	ok(ta.hasClass("my_plugin"), "Should have class my_plugin");
	ta.my_plugin(); // Update
	ta.my_plugin("method"); // method()
	ta.controller().destroy(); // destroy
	ok(!ta.hasClass("my_plugin"), "Shouldn't have class my_plugin after being destroyed");
	ok(ta.hasClass("existing_class"), "Existing class should still be there");
})
