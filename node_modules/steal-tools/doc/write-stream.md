@function steal-tools.streams.write write
@parent steal-tools.stream

Create a [stream](https://nodejs.org/api/stream.html) that takes a [steal-tools.BuildResult] objects and writes them to the filesystem.

@signature `stealTools.streams.write()`

@return {Stream<steal-tools.BuildResult>} A stream of objects that contains the dependency graph, bundles, and loader used to perform the trace.

@body

# Use

The write stream is used to write the result of a build to the filesystem.

```
var s = require("steal-tools").streams;

var steal = {
	config: __dirname + "/package.json!npm"
};

var stream = s.graph(steal)
	.pipe(s.transpile())
	.pipe(s.minify())
	.pipe(s.bundle())
	.pipe(s.concat())
	.pipe(s.write());

stream.on("data", function(){
	// Files were written to the filesystem
});
```

