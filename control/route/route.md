@page can.Control.route 
@parent can.Control
@plugin can/control/route
@test can/control/view/qunit.html
@download http://donejs.com/can/dist/can.control.route.js

The can.Control.route plugin adds a __route__ [can.Control.static.processors processor] to [can.Control].
This allows creating routes and binding to [can.route] in a single step by listening to the _route_ event
and a route. Without a route, the event will be triggered when the route is empty.
The data passed to the event handler will contain the [can.route.deparam deparamed route] without the
_route_ attribute.

For example:

	var Router = can.Control({
		init : function(el, options) {
		},

		":type route" : function(data) {
			// the route says anything but todo
		},

		"todo/:id route" : function(data) {
			// the route says todo/[id]
			// data.id is the id or default value
		},

		"route" : function(data){
			// route is empty
		}
	});

	new Router(window);

The plugin doesn't affect the way you usually use [can.route]. A control can, for example,
also set some default values in its _init_ method:

	init : function(element, options) {
		can.route(':type', { type : 'index' });
		can.route('todo/:id', { id : 1 });
	}

## Demo

The following demo shows the above control and default settings in action.
You can edit the hash, follow some example links or directly change the can.route atttributes.
At the top it shows the event handler, that is being called on the control, and the data passed to it:

@iframe can/control/route/demo.html 600
