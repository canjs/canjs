@function steal-tools.optimize optimize
@parent steal-tools.JS 

Build a module and all of its dependencies and, optionally, other bundles to progressively load.

@signature `stealTools.optimize(config, options)`

@param {steal-tools.StealConfig} config 
Specifies configuration values to set on Steal's loader.

@param {steal-tools.BuildOptions} [options]
Specifies the behavior of the build.

@return {(Promise<steal-tools.BuildResult>)} Promise that resolves when the build is complete.

@body

## Use

The following uses steal-tool's `optimize` method to programatically build out the "my-app"
module as bundles.

    var path = require("path");
    var stealTools = require("steal-tools");

    var promise = stealTools.optimize({
      config: path.join(__dirname, "package.json!npm")
    }, {
      // the following are the default values, so you don't need
      // to write them.
      minify: true,
      debug: true
    });

This will build bundles like:

    /dist/bundles/
      my-app.js
      my-app.css

To load the bundles, a html page should have a script tag like:

```
<script src="./dist/my-app.js"></script>
```

## splitLoader

Setting the `splitLoader` option to `true` creates a bundle that only includes the code of the optimized loader shim.

    var path = require("path");
    var stealTools = require("steal-tools");

    var promise = stealTools.build({
      main: "my-app",
      config: path.join(__dirname, "package.json!npm")
    }, {
      splitLoader: true
    });

This will build bundles like:

    /dist/bundles/
	  loader.js
      my-app.js
      my-app.css

To load the bundles, a html page should have a script tag that loads the loader and one that loads the application code:

```
<script src="./dist/bundles/loader.js" async></script>
<script src="./dist/bundles/my-app.js" async></script>
```

The optimized loader can handle async loading, which means order is not relevant when adding the script tags.

## dest

The `dest` option specifies **a folder** where the distributables (which includes your bundles and possibly other assets) are written.

    var path = require("path");
    var stealTools = require("steal-tools");

    var promise = stealTools.optimize({
      config: path.join(__dirname, "package.json!npm")
    }, {
      dest: path.join(__dirname, "mobile", "assets"),
    });

This will build bundles like:

    /mobile/assets/bundles
      my-app.js
      my-app.css

To load the bundles, a html page should have a script tag like:

```
<script src="../mobile/assets/bundles/my-app.js"></script>
```
