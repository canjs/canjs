@function steal-tools.streams.graph graph
@parent steal-tools.stream

Create a [stream](https://nodejs.org/api/stream.html) that will result in a dependency graph.

@signature `stealTools.streams.graph(config, options)`

```
var s = require("steal-tools").streams;

var stream = s.graph({
	config: __dirname + "/package.json!npm"
}, {
	minify: false
});

stream.on("data", function(data){
	var dependencyGraph = data.graph;
});
```

@param {steal-tools.StealConfig} config

@param {steal-tools.BuildOptions} [options]

@return {Stream<Object>} A stream of objects that contains the dependency graph.
