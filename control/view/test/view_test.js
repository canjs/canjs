(function () {
	/* global Myproject */
	module('can/control/view');
	test('complex paths nested inside a controller directory', function () {
		can.Control.extend('Myproject.Controllers.Foo.Bar');
		//var path = jQuery.Controller._calculatePosition(Myproject.Controllers.Foo.Bar, "init.ejs", "init")
		//equal(path, "//myproject/views/foo/bar/init.ejs", "view path is correct")
		can.Control.extend('Myproject.Controllers.FooBar');
		var path = can.Control._calculatePosition(Myproject.Controllers.FooBar, 'init.ejs', 'init');
		equal(path, '//myproject/views/foo_bar/init.ejs', 'view path is correct');
	});
}());
