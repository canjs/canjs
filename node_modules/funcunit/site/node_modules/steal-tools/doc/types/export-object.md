@typedef {{}} steal-tools.export.object ExportObject
@parent steal-tools.types

An object that specifies the modules to load and their outputs. This is used by
[steal-tools.export] and [steal-tools.grunt.export].

@option {steal-tools.SystemConfig} system Specifies the [System.config] values used 
to load modules.  At a minimum, some set of [System.main main], [System.baseURL baseURL],
or [System.configPath configPath] must be specified.

```
system: {
  main: ['mymodule'],
  config: __dirname+"/config.js"
}
```

@option {{}} options Options that configure the following:

  @option {Boolean} [debug=false] `true` turns on debug messages. Defaults to `false`.
  
  @option {Boolean} [quiet=false] No logging.  Defaults to `false`.


@option {Object<String,steal-tools.export.output>} outputs Configures output files to be written.

@body

## Use

Each ExportObject task is configured by three values:

 - system - Describes the [System.config] values used to load modules; this is passed to [steal-tools.transformImport].
 - options - Configures special behavior of the loader such as logging.
 - outputs - Configures the modules that should be written out, how they 
             should be written out, and where they should be written. 

## system

A [steal-tools.SystemConfig] object that is used to load modules. Typically, you will want to specify at least the `config` and `main` options, like so:

    system: {
	  config: __dirname + "/config.js",
      main: ["math/add", "math/subtract"]
    }

## options

Options configures logging. Example:

```
options: { verbose: true }
```

or

```
options: { quiet: true }
```

## outputs

`outputs` specifies different ways the modules loaded by `system` are written out. It's
an object of [steal-tools.export.output] objects.  Each [steal-tools.export.output]
supports the following options:

{{#each [steal-tools.export.output].types.0.options}}
 - {{name}} <i>{{{makeTypesString types}}}</i>{{/each}}

And the options available to [steal-tools.transform.options].

{{#each [steal-tools.transform.options].types.0.options}}
 - {{name}} <i>{{{makeTypesString types}}}</i>{{/each}}

Only one of `modules`, `eachModule`, or `graphs` should be specified. 


Example:

```
outputs: {
  "global first and second together without jQuery": {
    modules: ["first","second"],
    ignore: ["jquery"],
    format: "global"
  },
  "first and second seperately without jQuery": {
    eachModule: ["first","second"],
    ignore: ["jquery"],
    format: "global"
  },
  "first and second and their dependencies individually converted to amd": {
    graphs: ["first","second"],
    format: "amd"
  }
}
```

### output names

An output name can mixin default output options of an __Export Helper__, like [steal-tools/lib/build/helpers/cjs],
by including a "+", followed by the name of the export helper.  For example:

```
outputs: {
  "+amd": {},
  "+cjs": {dist: __dirname+"cjs"},
  "+global-js": {},
  "+global-css": {}
}
```

The given output ExportObject's value will overwrite or modify the behavior of the __Export Helper__.  For example,
`{dist: __dirname+"/cjs"}` will change the output destination of "+cjs".





