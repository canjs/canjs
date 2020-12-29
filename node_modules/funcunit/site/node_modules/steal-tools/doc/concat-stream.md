@function steal-tools.streams.concat concat
@parent steal-tools.stream

Create a [stream](https://nodejs.org/api/stream.html) of [steal-tools.BuildResult] objects.

@signature `stealTools.streams.concat()`

@return {Stream<steal-tools.BuildResult>} A stream of objects that contains the dependency graph, bundles, and loader used to perform the trace.

@body

# Use

The concat stream is used to **concatenate** the source code from a bundle and (optionally) create source maps.

This API must be used in conjuction with [steal-tools.streams.transpileAndBundle].

```
var s = require("steal-tools").streams;

var graphStream = s.graph({
	config: __dirname + "/package.json!npm"
}, {
	minify: false
});

var buildStream = graphStream
	.pipe(s.transpile())
 	.pipe(s.bundle());

var concatStream = buildStream.pipe(s.concat());

concatStream.on("data", function(data){
	var bundle = data.bundles[0];
	assert(bundle.source, "The source was concatenated");
});
```
