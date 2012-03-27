@page can.Control.route 
@parent can.Control
@plugin can/control/route
@test can/control/view/qunit.html
@download http://jmvcsite.heroku.com/pluginify?plugins[]=can/control/view/view.js

The `can/control/route` plugin adds a {can.route] processor to can.Control.  This allows
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

The following shows some example hashes, the function that is called, and the data:

`#!`: Will call the `route` control method with an empty data object

`#!todos`: Calls the `todos route` control method with an empty data object

`#!todos&order=asc&hidedone=true`: Calls the `todos route` control method with the data looking like
`{ order : 'asc', hidedone : 'true' }`

`#!todo/10`: Calls `todo/:id route` with data `{ id : 10 }`

`#!todo/10&done=true`: Calls `todo/:id route` with data `{ id : 10, done : 'true' }`
