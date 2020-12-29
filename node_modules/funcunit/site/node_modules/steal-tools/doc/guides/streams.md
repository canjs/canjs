@page steal-tools.guides.streams Streaming API
@parent StealJS.guides 3

In 0.14.0 StealTools added a new streaming API based on [Node streams](https://nodejs.org/api/stream.html). This gives you a greater ability to interject your own functionality in the middle of the build process, or to exclude parts you don't want (like if you didn't want to write the results to the filesystem.

The streaming APIs are more powerful, but more complex, if you just want to build your app you should use [steal-tools.build] instead. If you are new to streams consult the [stream handbook](https://github.com/substack/stream-handbook) to learn what makes them useful.

# Streams

The following are the streams that can be created. Each stream is explained individually and at the end of the docs we'll talking about putting them all together. Many of the examples use the [through2](https://www.npmjs.com/package/through2) module, which provide an easy way to work with Node streams.

## graph

The basis for StealTool's build process is a **dependency graph**. A dependency graph is an object that contains all of your app's dependencies. The key is the name of the module and the value is a [steal-tools.node] object.

The graph stream is the first stream created and is required for use with all of the other streams.

```
var s = require("steal-tools").streams;
var through = require("through2");

var graphStream = s.graph({
	config: __dirname + "/package.json!npm"
});

graphStream.pipe(through(function(data){
	// data contains a 'graph' property.
}));
```

## transpile

Given a graph stream, **transpile** will transpile each module in the graph to AMD so that it can be bundled for production.

```
var s = require("steal-tools").streams;
var through = require("through2");

var system = {
	config: __dirname + "/package.json!npm"
};

var transpileStream = s.graph(system)
	.pipe(s.transpile());

transpileStream.pipe(through(function(data){
	// data contains everything from the graphStream
	// With the modules in data.dependencyGraph having
	// been transpiled to AMD.
}));
```

## minify

A [steal-tools.streams.minify] stream will minify the source of each module in your graph individually. You'll want to do this after transpiling.

## bundle

The [steal-tools.streams.bundle] stream will analyze your dependency graph and split it into optimized bundles.

```
var s = require("steal-tools").streams;
var through = require("through2");

var system = {
	config: __dirname + "/package.json!npm"
};

var bundleStream = s.graph(system)
	.pipe(s.transpile())
	.pipe(s.minify())
	.pipe(s.bundle());

bundleStream.pipe(through(function(data){
	// data contains everything from the graphStream
	// and also contains a .bundles property
}));
```

## concat

Once you've created the stream that contains all of your application's bundles, you can pipe it into a concat stream. The concat stream will **concatenate** the source from all of the graph's dependencies into a single source code.

The [steal-tools.BuildResult] object is what is returned from this stream, and each of the **bundles** within will now contain a `source` property.

## write

After concatentating the bundles you call **write** to write the source to the filesystem. If you where only interested in examining the bundles in-memory you could skip this step.

Otherwise, pipe in the result from **concat** here.

# Putting it all together

Given these APIs you can construct your own build by piping the streams into each other. Here's what a typical build looks like:

```
var s = require("steal-tools").streams;

var system = {
	config: __dirname + "/package.json!npm"
};

var stream = s.graph(system)
	.pipe(s.transpile())
	.pipe(s.minify())
	.pipe(s.bundle())
	.pipe(s.concat())
	.pipe(s.write());
```

Now let's say we wanted to rerun [babel](https://babeljs.io/) to transpile non-es6 modules. We could do this by injecting a stream after *graph* has completed. This allows us to use our own transpile stream in place of the one StealTools provides:

```
var s = require("steal-tools").streams;

var babel = require("babel-core");
var transform =	function(source){
	return babel.transform(source, {
		presets: [
			require("babel-preset-es2015-no-commonjs"),
			require("babel-preset-react"),
			require("babel-preset-stage-0")
		]
	});
};

var transpile = function(){
	return through.obj(function(data){
		data.bundles.forEach(function(bundle){
			bundle.nodes.forEach(function(node){
				node.activeSource = transform(node.getSource());
			});
		});
	});
};

var system = {
	config: __dirname + "/package.json!npm"
};

var stream = s.graph(system)
	.pipe(transpile())
	.pipe(s.minify())
	.pipe(s.bundle())
	.pipe(s.concat())
	.pipe(s.write());
```

