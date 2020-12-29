@function steal-tools.streams.transpile transpile
@parent steal-tools.stream

Create a [stream](https://nodejs.org/api/stream.html) of [steal-tools.BuildResult] objects.

@signature `stealTools.streams.transpile()`

@return {Stream<steal-tools.BuildResult>} A stream of objects that contains the dependency graph, transpiled to AMD.

@body

# Use

This stream is used to transpile the dependency graph to AMD format for use in production environments. 

This API must be used in conjuction with [steal-tools.streams.graph].

```
var s = require("steal-tools").streams;

var graphStream = s.graph({
	config: __dirname + "/package.json!npm"
}, {
	minify: false
});

var transpileStream = graphStream.pipe(s.transpile());

transpileStream.on("data", function(data){
	var dependencyGraph = data.graph;
});
```
