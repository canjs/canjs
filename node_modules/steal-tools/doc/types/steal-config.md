@typedef {{}} steal-tools.StealConfig StealConfig
@parent steal-tools.types

Configuration values needed for StealJS to load modules. Some set of the following
values are required:

@option {String|Array<moduleName>} [main] The module, or modules, that should be 
imported.  This sets [config.main]. 

 - __It is optional if__ a `config` is provided.

@option {String} [config] The path to a configuration file. This
will also specify `baseURL`, and sometimes `main`. This sets [config.configPath].

 - __It is optional if__ `main` is provided and no other configurations are needed.
 - __It is required if__ you are using NPM.

@option {Object<moduleName,metadata>} [meta] A object of <moduleNames> that contain [metadata](http://stealjs.com/docs/config.meta.html)

@option {String} [baseURL] If a configuration file is not used, 
the [config.baseURL baseURL] value must be set.
 
@option {Array<moduleName>} [bundle] An array of <moduleNames> that should be progressively loaded. See steal's [bundle](https://stealjs.com/docs/config.bundle.html) property for more information.
  
@option {Object<config.jsonOptions>} [jsonOptions] Provides options that can be applied to JSON loading.
  Using the `transform` method will run through all JSON files while building, also the `package.json`'s of loaded modules
  (if using NPM). 

@body

## Use

[steal-tools.build], [steal-tools.export], and [steal-tools.transformImport] all
take a `StealConfig`, which configures the modules to load.

```
stealTools.build(StealConfig, ...)
stealTools.pluginifier(StealConfig, ...)
stealTools["export"]({steal: StealConfig, outputs: {...}});
```

If your `config` file specifies `main`, all that is needed is the `config` location:

```
stealTools.build({config: __dirname+"/package.json!npm"}, ...)
stealTools.pluginifier({config: __dirname+"/package.json!npm"}, ...)
stealTools.export({
  steal: {config: __dirname+"/package.json!npm"}, 
  outputs: {...}
});
```

Otherwise, `main` and `config` are probably needed:


```
stealTools.build({
  config: __dirname+"/config.js",
  main: "myproject"
}, ...);

stealTools.pluginifier({
  config: __dirname+"/config.js",
  main: "myproject"
}, ...);

stealTools.export({
  steal: {
    config: __dirname+"/config.js",
    main: "myproject"
  }, 
  outputs: {...}
});
```

If there is no `config`, you should specify the baseURL, so StealJS knows where to find your modules.

