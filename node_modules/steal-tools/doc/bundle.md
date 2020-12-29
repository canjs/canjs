@function steal-tools.bundle bundle
@parent steal-tools.JS 

Similar to [steal-tools.build] it creates a bundle of modules and its dependencies but a glob pattern
can be provided to filter out module during the build.

@signature `stealTools.bundle(config, options)`

@param {steal-tools.StealConfig} config 
Specifies configuration values to set on Steal's loader.

@param {steal-tools.BuildOptions} [options]
Specifies the behavior of the build.
 
@return {Promise<steal-tools.BuildResult>} A Promise that resolves when the build is complete.

@body

## Use

The following uses steal-tools `bundle` method to programatically build out the "my-app"
dependencies in the `node_modules` folder.

	
    var path = require("path");
    var stealTools = require("steal-tools");

    var promise = stealTools.bundle({
      config: path.join(__dirname, "package.json!npm")
    }, {
      filter: "node_modules/**/*"
    });
	

This will build bundles at the root of your project like:

    /
      ...
      dev-bundle.js
      dev-bundle.css

To load the bundles, a html page should have a script tag like:

```
<script src="./node_modules/steal.js" deps-bundle></script>
```

## filter

The `filter` option specifies a glob pattern what modules are included in the bundle.

It can be a string with a single pattern or an array if multiple patterns are needed; the [multimatch](https://github.com/sindresorhus/multimatch) library is used to support multiple patterns, check its docs to see how the matching works.

    
    var path = require("path");
    var stealTools = require("steal-tools");

    var promise = stealTools.bundle({
      config: path.join(__dirname, "package.json!npm")
    }, {
      filter: "node_modules/**/*"
    });


The `filter` value used in the example above will create a bundle of the modules loaded by the application which are located in the `node_modules` folder.

## dest

The `dest` option specifies **a folder** where the bundles are written out.

    
    var promise = stealTools.bundle({
      config: path.join(__dirname, "package.json!npm")
    }, {
      dest: path.join(__dirname, "my-bundle"),
      filter: "node_modules/**/*"
    });


This will build bundles like:

    /my-bundle
      dev-bundle.js
      dev-bundle.css

To load the bundles, a html page should have a script tag like:

```
<script src="./node_modules/steal/steal.js" 
		deps-bundle="my-bundle/dev-bundle"></script>
```

## Dependencies bundle and development bundles

The main use case for custom bundles is to speed up the loading time of your application during development; you can achieve this by bundling up your application dependencies (which hopefully change a lot less than the actual application code) and only load one file instead of each individually.

We call a **dependencies bundle** a bundle that only includes the application dependencies (all the modules in the `node_modules` folder if you are using `npm`), to generate it you would do something like:

    
    var promise = stealTools.bundle({
      config: path.join(__dirname, "package.json!npm")
    }, {
      filter: "node_modules/**/*"
    });
    

In order to load a **dependencies bundle** you would need to add the `deps-bundle` attribute to the StealJS script tag, like this:

```
<script src="./node_modules/steal.js" deps-bundle></script>
```

We call a **development bundle** a **dependencies bundle** that also includes the [StealJS configMain](StealJS.config.configMain) module; in order to generate it you'd do something like:

    
    var promise = stealTools.bundle({
      config: path.join(__dirname, "package.json!npm")
    }, {
      dest: path.join(__dirname, "my-dev-bundle"),
      filter: [ "node_modules/**/*", "package.json" ]
    });
    

Unlike a **dependencies bundle**, a **development bundle** has to be loaded before [StealJS configMain](StealJS.config.configMain) is loaded. In order to do that, StealJS provides a `dev-bundle` propert that you can set to the script tag so it loads the bundle correctly, like this:

```
<script src="./node_modules/steal/steal.js" 
		dev-bundle="my-dev-bundle/dev-bundle"></script>
```

You will get faster load times with **development bundles**, with the downside that you will need to generate the bundle each time your config module changes or your application might no load at all.
