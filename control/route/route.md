@page can.Control.route 
@parent can.Control

The `can/control/route` plugin adds a route processor to can.Control.  This allows
creating routes and binding to `can.route` in a single step.  For example:

    Router = can.Route({
      // the route is empty
      "route" : function(data){
      
      },
      // the route says todos
      "todos route" : function(data){
      
      },
      // the route an id as data
      "todo/:id route" : function(data){
      
      }
    })

The following shows some example hashes, the function that is called,
and the data:

 -  make sure you show querystring data coming through

Talk about how route is backed up by an observe, by listening to it's changes,
but only responds once with changes in batchNum.

Talk about using can.route for more advanced behavior (default values),
setup / teardown, and the delegate plugin for even more awesomeness.

this is included by default in CanJS.