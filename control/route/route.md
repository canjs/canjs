@page can.Control.route 
@parent can.Control
@plugin can/control/route
@test can/control/view/qunit.html
@download http://donejs.com/can/dist/can.control.route.js

The can.Control.route plugin adds a [can.route] processor to can.Control. This allows
creating routes and binding to `can.route` in a single step. For example:

    var Router = can.Route({
		"route" : function(data){
			// the route is empty
		},
		"todos route" : function(data){
			// the route says todos
		},
		"todo/:id route" : function(data){
			// the route an id as data
		}
    });

The plugin doesn't affect the way you usually use [can.route]. The above control for example can
add a default value for the id in the `todos/:id` route like this:

    var Router = can.Route({
        init : function(el, ops) {
            can.route('todos/:id', { id : 1 });
        },

		"route" : function(data){
			// the route is empty
		},

		"todos route" : function(data){
			// the route says todos
		},

		"todo/:id route" : function(data){
			// the route an id as data
		}
    });

Here are some examples of which function will be called and the data passed:

`#!`: Will call the `route` control method with an empty data object

`#!todos`: Calls the `todos route` control method with an empty data object

`#!todos&order=asc&hidedone=true`: Calls the `todos route` control method with the data like
`{ order : 'asc', hidedone : 'true' }`

`#!todo/`: Calls `todo/:id route` with the default id set `{ id : 1 }`

`#!todo/10`: Calls `todo/:id route` with data `{ id : 10 }`

`#!todo/10&done=true`: Calls `todo/:id route` with `{ id : 10, done : 'true' }`
