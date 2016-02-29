var Control = require('can/control/control');
require('can/control/view/view');
require('steal-qunit');

/* global Myproject */
module('can/control/view');
test('complex paths nested inside a controller directory', function () {
	Control.extend('Myproject.Controllers.Foo.Bar');
	//var path = jQuery.Controller._calculatePosition(Myproject.Controllers.Foo.Bar, "init.stache", "init")
	//equal(path, "//myproject/views/foo/bar/init.stache", "view path is correct")
	Control.extend('Myproject.Controllers.FooBar');
	var path = can.Control._calculatePosition(Myproject.Controllers.FooBar, 'init.stache', 'init');
	equal(path, '//myproject/views/foo_bar/init.stache', 'view path is correct');
});
