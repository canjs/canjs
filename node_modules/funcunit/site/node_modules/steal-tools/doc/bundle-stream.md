@function steal-tools.streams.bundle bundle
@parent steal-tools.stream

The bundle stream takes a [stream](https://nodejs.org/api/stream.html) of [steal-tools.BuildResult] objects and applies a progressive loading algorithm to split the graph into separate bundles optimized for fast loading.

@signature `stealTools.streams.bundle()`

@return {Stream<steal-tools.BuildResult>} A stream of objects that contains the dependency graph, with each module having been minified.

@body

# Use

Given a graph stream, you should first [steal-tools.streams.transpile] and [steal-tools.streams.minify] before applying the bundle stream:

```
var s = require("steal-tools").streams;

var graphStream = s.graph({
	config: __dirname + "/package.json!npm"
}, {
	minify: false
});

var buildStream = graphStream
	.pipe(s.transpile())
	.pipe(s.minify())
	.pipe(s.bundle());

minifyStream.on("data", function(data){
	var bundles = s.bundles;
});
```
