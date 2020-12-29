@function steal-tools.export export
@parent steal-tools.JS

Export a project's modules to other forms and formats declaratively.  

@signature `stealTools.export( exportTask, defaults, modules )`

@param {steal-tools.export.object} exportTask An [steal-tools.export.object] with the following properties:

  @option {steal-tools.StealConfig} Steal `config` data needed to load
  all the modules for export.

  @option {steal-tools.export.object} Options that configure logging.

  @option {Object<String,steal-tools.export.output>} outputs Configures output files to be written.

@param {Object<String,steal-tools.export.output>} [defaults] An object of names and default ExportOutput
values.

@param {Array<{}>} [modules] An array of module data that an [steal-tools.export.output]'s
`modules`, `eachModule`, `graphs`, or `ignore` can be filtered against.

@return {(Promise<steal-tools.BuildResult>)} A Promise that resolves when all outputs have been written out.

@body

## Use

`stealTools.export` is used to declaratively describe multiple [steal-tools.transform transformations]
that take place on an application's modules to make it distributable.  The
[steal-tools/lib/build/helpers/amd], [steal-tools/lib/build/helpers/cjs], and
[steal-tools/lib/build/helpers/global] _Export Helpers_ can be used to export censible versions
of your project in those formats.

The basic use of `stealTools` export is to provide a "steal" that is able to load your project's modules,
and several "outputs" that write out those modules in a new form:

```
var stealTools = require("steal-tools");
stealTools.export({
  steal: {
    main: "myproject",
    config: __dirname+"/config.js"
  },
  options: {
    verbose: true
  },
  outputs: {
    amd: {
      format: "amd",
      graphs: ["myproject"],
      dest: __dirname+"/dist/amd"
    },
    standalone: {
      format: "global",
      modules: ["myproject"],
      dest: __dirname+"/dist/standalone.js",
      minify: true
    }
  }
})
```

## exportTask

The first argument is an [steal-tools.export.object].  Details about its API and options can be found on its page.

## defaults

As there are times when the same options may need to be set over and over again, the `defaults` option can
contain default values each output can call:

```
var stealTools = require("steal-tools");
stealTools.export({
  steal: {
    main: "myproject",  config: __dirname+"/config.js"
  },
  outputs: {
    "+commonjs": {
      dest: __dirname+"/dist/cjs"
    },
    "+cjs+minify": {
      dest: __dirname+"/dist/min/cjs"
    }
  }
},{
  "commonjs" : {
    modules: ["myproject"],
    format: "cjs"
  },
  "minify": {
    minify: true,
    uglifyOptions: { ... }
  }
})
```

The [steal-tools/lib/build/helpers/cjs] and other export helpers can also be mixed in output names by default:

```
var stealTools = require("steal-tools");
stealTools.export({
  steal: {
    main: "myproject",  config: __dirname+"/config.js"
  },
  outputs: {
    "+cjs" : {}
  }
})
```

## modules

Deprecated.
