(function() {

	module("can/control/modifier");

	asyncTest("pluginName", 8, function() {

		var controllerClass = can.Control({
		}, {

			" click:debounce(30)" : function() {
				ok( this instanceof can.Control, "Debounced function has the correct context." );
				foo = true;
				run++;
			}
		
		}),
		run = 0,
		controller1 = new controllerClass( $("#foo") ),
		controller2 = new controllerClass( $("#bar") ),
		foo;

		// Do a bunch of clicks!
		$("#foo").trigger("click");
		$("#bar").trigger("click");
		$("#foo").trigger("click");
		$("#bar").trigger("click");
		$("#foo").trigger("click");
		$("#bar").trigger("click");

		// Make sure foo is still undefined (should be > 30ms before its defined)
		ok( ! foo, "`foo` is undefined." );

		// Check if
		setTimeout(function() {
			ok( foo, "`foo` is true." );
			ok( run === 2, "`run` is 2" );

			// Do a bunch more clicks!
			$("#foo").trigger("click");
			$("#bar").trigger("click");
			$("#foo").trigger("click");
			$("#bar").trigger("click");
			$("#foo").trigger("click");
			$("#bar").trigger("click");
			
			setTimeout(function() {
				ok( run === 4, "`run` is 4" );
				start();
			}, 40);
		}, 40);

	});

}());
