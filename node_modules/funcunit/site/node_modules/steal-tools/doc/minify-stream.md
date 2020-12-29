@function steal-tools.streams.minify minify
@parent steal-tools.stream

Given a [stream](https://nodejs.org/api/stream.html) of [steal-tools.BuildResult] objects, minify the source of each module in each bundle. This is the default behavior of StealTool's multi-build.

@signature `stealTools.streams.minify()`

@return {Stream<steal-tools.BuildResult>} A stream of objects that contains the dependency graph, with each module having been minified.

@body

# Use

This stream minifies the modules in a dependency graph. Instead of minifying the entire bundle once concatenated, this will minify each module individually.

This API must be used in conjuction with [steal-tools.streams.graph].

```
var s = require("steal-tools").streams;

var graphStream = s.graph({
	config: __dirname + "/package.json!npm"
}, {
	minify: false
});

var minifyStream = graphStream.pipe(s.transpile())
	.pipe(s.minify());

minifyStream.on("data", function(data){
	var dependencyGraph = data.graph;
});
```
