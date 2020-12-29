@typedef {{}} steal-tools.grunt.export steal-export
@parent steal-tools.grunt 

A [http://gruntjs.com/ Grunt] multi task that loads modules, and writes them out in different formats.

@option {Object<String,steal-tools.export.object>} tasks An object with task names as keys,
and exportObjects as values.

```
grunt.initConfig({
  "steal-export": {
    taskName1: { ExportObject1 },
    taskName2: { ExportObject2 }
  }
});
```

Each [steal-tools.export.object] specifies:

 - A `system` object that specifies the modules to be loaded.
 - An `options` object that specifies any special loading behavior, like turning logging.
 - An `outputs` object that specifies how the modules should be written out.
 
```
grunt.initConfig({
  "steal-export": {
    taskName: {
      system : { .. },
      options: { .. },
      outputs: { .. }
    }
  }
});
```


@body

## Use

> Note: The `steal-export` Grunt task calls [steal-tools.export steal-tools.export] 
internally. This page documents the specifics of the Grunt task. Read
[steal-tools.export steal-tools.export's documentation] for how to use
the export in various workflows and detailed information
on the system and options arguments.

`steal-export` is a Grunt [multi-task](http://gruntjs.com/creating-tasks#multi-tasks) that is 
used to build library projects to a variety of formats. For example, to load a "main" module and
transpile it, and all of its dependencies (except jQuery), to AMD and CommonJS with debug output:

    grunt.initConfig({
      "steal-export": {
        transpile: {
          system: {
            main: "main",
            config: __dirname + "/config.js"
          },
          options: {
            debug: true
          },
          outputs: {
            amd: {
              graphs: ["main"],
              format: "amd",
              ignore: ["jquery"]
            },
            cjs: {
              graphs: ["main"],
              format: "amd",
              ignore: ["jquery"]
            }
          }
        }
      }
    });
    
Each [steal-tools.export.object] task is configured by three values:

 - system - describes the [System.config] values used to load modules; this is passed to [steal-tools.transformImport].
 - options - configures special behavior of the loader, such as logging.
 - outputs - configures the modules that should be written out, how they 
             should be written out, and where they should be written. 

The [steal-tools.export.object] documentation has more information.

## meta.steal.export-helpers

You can add your own export helpers on your Grunt config's 
`meta.steal.export-helpers` object, as follows:

```
grunt.initConfig({
  meta: {
    steal: {
      "export-helpers": {
        "minify": {minify: true}
      }
    }
  },
  "steal-export": {
    transpile: {
      system: { ... },
      outputs: {
        "amd +minify": {
          format: "amd"
        }
      }
    }
  }
})
```






