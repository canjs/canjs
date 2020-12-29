/*

# lib/build/multi.js

The bundled build works by loading the _main_ module and all of its
dependencies and then all of the `System.bundle` modules 
and their dependencies. It makes a dependency graph that looks like:

```js
{
  moduleName: Node({
    load: Load({
      name: moduleName,
      source: SOURCE
    }),
    dependencies: [moduleName],
    bundles: [bundleName],
  })
}
```

Here's an example:

```js
{
  "jquery": {
    load: {
      name: "jquery",
      source: "jQuery = function(){ ... }"
    },
    dependencies: [],
    bundles: ["profile","settings","login", ...]
  },
  "can/util": {
    load: {
      name: "can/util",
      source: "define(['jquery'], function($){ ... })" 
    },
    dependencies: ["jquery"],
    bundles: ["profile","login"]
  }
}
```

A `Load` is a ES6 load record.

A `Node` is an object that contains the load and other 
useful information. The build tools only write to `Node` to keep `Load` from being changed.

It manipulates this graph and eventually creates "bundle" graphs.  Bundle graphs look like:

     {
       size: 231231,
       nodes: [node1, node2, ...],
       bundles: [bundleName1, bundleName2]	
     }
     
The nodes in those bundles are written to the filesystem.

*/

var winston = require('winston');
var makeGraph = require("../graph/make_graph"),
	order = require("../graph/order"),
	transpile = require("../graph/transpile"),
	minifyGraph = require("../graph/minify");

module.exports = function(config, options){

	// Get the merged dependency graphs for each System.bundle.
	return makeGraph(config).then(function(data){

		var dependencyGraph = data.graph,
			main = data.loader.main;



		// Adds an `order` property to each `Node` so we know which modules.  
		// The lower the number the lower on the dependency tree it is.
		// For example, jQuery might have `order: 0`.
		order(dependencyGraph, main);

		// Transpile each module to amd. Eventually, production builds
		// should be able to work without steal.js.
		transpile(dependencyGraph, "amd", options, data);
		
		// Minify every file in the graph
		minifyGraph(dependencyGraph);

		// Pull out the main module and its dependencies. They will be
		// in their own bundle.
		
		
		return data;
		
	}).catch(function(e){
		winston.error(e.message, e);
	});
};
