@function steal-tools.build build
@parent steal-tools.JS 

Build a module and all of its dependencies and, optionally, other bundles to progressively load.

@signature `stealTools.build(config, options)`

@param {steal-tools.StealConfig} config 
Specifies configuration values to set on Steal's loader.
  
@param {steal-tools.BuildOptions} [options]
Specifies the behavior of the build.
  
@return {(Promise<steal-tools.BuildResult>|Stream<steal-tools.BuildResult>)} Either a Promise that resolves when the build is complete or a Stream that will send `data` events every time a rebuild is complete. By default a Promise is returned, unless the `watch` option is enabled.

@body

## Use

The following uses steal-tool's `build` method to programatically build out the "my-app"
module as bundles.    

    var stealTools = require("steal-tools");
    
    var promise = stealTools.build({
      config: __dirname+"/package.json!npm"
    },{
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
<script src="./dist/steal.production.js"></script>
```

## bundleSteal

Setting the `bundleSteal` option to `true` includes _steal.js_ and the [config.configMain] in each
main bundle.  This means one fewer http request.  

    var promise = stealTools.build({
      main: "my-app",
      config: __dirname+"/package.json!npm"
    },{
      bundleSteal: true
    });

This will build bundles like:

    /dist/bundles/
      my-app.js
      my-app.css

To load the bundles, a html page should have a script tag like:

```
<script src="./dist/bundles/my-app.js"></script>
```

## dest

The `dest` option specifies **a folder** where the distributables (which includes your bundles, a production version of Steal, and possibly other assets).


    var promise = stealTools.build({
      config: __dirname+"/package.json!npm"
    },{
	  dest: __dirname + "/mobile/assets",
      bundleSteal: true
    });

This will build bundles like:

    /mobile/assets/bundles
      my-app.js
      my-app.css

To load the bundles, a html page should have a script tag like:

```
<script src="../mobile/assets/steal.production.js"></script>
```

## <a name="ignore"></a>ignore

The `ignore` option specifies which modules exclude from being bundled.
A typical scenario for using `ignore` is if you want a dependent module loaded from a CDN.
The browser can load e.g. jQuery from the browsers cache. This saves traffic and also speed up your site.

If you exclude a module from the bundled file, you have to make sure, that in the [production environment configuration](http://stealjs.com/docs/config.envs.html)
the module is:

* ... [mapped to the pseudo-module @empty](http://stealjs.com/docs/config.map.html#ignoring-optional-dependencies) if you don't need it in production environment

    ```
    "envs": {
        "window-production": {
            "map": {
                "MODULENAME': "@empty"
            }
        }
    }
    ```

* ... [configured](http://stealjs.com/docs/steal.html#path-configure) to the [right location](http://stealjs.com/docs/config.paths.html) of the module e.g. a CDN

    ```
    "envs": {
        "production": {
            "paths": {
                "jquery': "//code.jquery.com/jquery-2.2.1.min.js"
            }
        }
    }
    ```


## Multi-page use

The following uses steal-tool's `build` method to programatically build out the "login" and "homepage"
modules as bundles.    

    var stealTools = require("steal-tools");
    
    var promise = stealTools.build({
      main: ["login","homepage"],
      config: __dirname+"/config.js"
    },{
      bundleSteal: true,
      // the following are the default values, so you don't need
      // to write them.
      minify: true,
      debug: false,
      quiet: false,
      maxBundleRequests: 3,
      maxMainRequests: 3
    });

Assuming that "login" and "homepage" need the same modules, the following bundles will be created:

    /dist/bundles/
      homepage.js
      homepage.css
      login.js
      login.css
      login_homepage.css
      login_homepage.js
      
To load the homepage JS, CSS and the shared JS and CSS, an html page should have a script tag like:

```
<script src="./node_modules/steal/steal.js" 
        main="homepage"
        env="production"><script>
```

## Source Maps

Source maps provide a way to debug your bundled application. Using steal-tool's `build` you can generate source maps like so:

    var stealTools = require("steal-tools");

    stealTools.build({
        config: "package.json!npm",
        main: "app"
    }, {
        sourceMaps: true
    });

This will build out your application to `dist/bundles/app.js` and a corresponding source map will be at `dist/bundles/app.js.map`. Now load your application:

```html
<script src="./dist/steal.production.js"></script>
```

And look in your debugger tools, the original sources should be shown and are debuggable.

These source maps are light-weight because they only include mappings back to the original sources; the original source files are still loaded by the browser. If you have a production environment where the original source files cannot be accessed, or you want to limit the number of requests made, you can set the `sourceMapsContent` option to `true` and the original sources will be packaged along in the `app.js.map` file.
