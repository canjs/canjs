@function steal-tools.transformImport transformImport
@parent steal-tools.JS 

Loads a module, and its dependencies, and provides a [steal-tools.transform] 
method, so they can be written out in another form.

@signature `stealTools.transformImport(config, transformOptions)`

Loads a module, and all of its dependencies, and returns a function that
can write out all, or parts, of the module and its dependency graph,
so that they don't depend on `steal.js`.

@param {steal-tools.SystemConfig} config

Specifies configuration values to set on 
a System loader. The [System.main main] option must be specified. Typically,
[System.configPath configPath] is also specified, as that is used to set 
[System.baseURL baseURL].  Any System [System.config configuration] can be specified; however,
most other __build__ configuration values are specified
by [System.buildConfig] in the config file.

@option {String} main The module whose dependencies should be built.
@option {String} [config] The path to a configuration file. This
will also specify `baseURL`.
@option {String} [baseURL] If a configuration file is not used, 
the [System.baseURL baseURL] value must be set.

@param {{}} transformOptions

Configures the behavior of loading the modules, and acts as default values
for the resulting [steal-tools.transform transform function's] options argument.

@option {Boolean} [verbose=false] Set to true to get a lot of warning messages.
@option {Boolean} [quiet=false] Set to true to log nothing.

@return {Promise.<steal-tools.transform>} A deferred, which resolves to a function that can write out all or part of the loaded dependency tree. 



@body

## Use

`stealTools.transformImport` lets you transform modules to a different 
format or form.  It's passed a [steal-tools.SystemConfig], which is used
to load modules. Once all modules have been loaded, it provides a
[steal-tools.transform] method that can write out modules:

 - in different formats (cjs, amd, global),
 - minified, or
 - with development code removed.
 
`transformImport` and `transform` are low-level functionality. For the majority of projects, [steal-tools.export]
will be a better fit for the most common transformation behavior.

Like [steal-tools.build], transformImport can be used from the command-line, from Grunt, or 
programmatically in Node.js. For this example, we're going to use 
transformImport programmatically, in order to showcase 
its more advanced functionality:

    var transformImport = require("steal-tools").transformImport;
    var fs = require("fs");

    transformImport({
      config: __dirname + "/config.js",
      main: "main"
    }).then(function(transform){
      // Get the main module and it's dependencies as a string
      var main = transform();

      // Get just a dependency and it's own dependencies as a string
      var myModule = transform("my_module");

      // Get the main module, ignoring a dependency we don't want.
      var mainAlone = transform("main", {
        ignore: ["my_module"]
      });

      // Now you can do whatever you want with the module.
      fs.writeFileSync("out_main.js", mainAlone, "utf8");
    });

As you can see, transformImport takes an object containing the 
System configuration and returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). 
The promise will return another function (named "transform" in this example) that can be used to generate 
a string containing a module and its dependencies. By default, the transform 
function will return the main module; but it can be used to generate any dependency in the graph.
