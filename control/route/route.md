@page can.Control.route 
@parent can.Control
@plugin can/control/route
@test can/control/view/qunit.html
@download http://donejs.com/can/dist/can.control.route.js

The can.Control.route plugin adds a [can.route] processor to can.Control. This allows
creating routes and binding to `can.route` in a single step. For example:

	var Router = can.Control({
		init : function(el, options) {
		},

		":type route" : function(data) {
			// the route says anything but todo
		},

		"todo/:id route" : function(data) {
			// the route says
		},

		"route" : function(data){
			setStatus("route", data);
		}
	});

	new Router(window);

The plugin doesn't affect the way you usually use [can.route]. The above control for example can
also set some default values in its _init_ method:

	can.route(':type', { type : 'index' });
	can.route('todo/:id', { id : 1 });

The following demo shows the control with these default settings in action.
You can edit the hash, follow some example links or directly change the can.route atttributes.
At the top it shows the control method being called and the data that are being passed to it:

@iframe can/control/route/demo.html 600
