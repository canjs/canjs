@function steal-tools.transform transform
@parent steal-tools.JS

A function provided by [steal-tools.transformImport] that returns a transformed
module or modules.

@signature `transform(moduleName, options)`

@param {moduleName} [moduleName=config.main] The module name to build.

@param {steal-tools.transform.options} [options]

Options that configure how the files are compiled.  These options overwrite the
`pluginifierOptions` argument passed to [steal-tools.transformImport].

@return {Promise.<steal-tools.source.object>} A promise for an object containing a string `code` property and a `map` that is the source map if the `sourceMaps` option is set to `true`.

@body

## Use

After getting `transform` from [steal-tools.transformImport] you can call it, like:

    var promise = transform("module/name/to/build", {
      // specifies modules to ignore
      ignore: [
        // ignores this module, and all of its dependencies
        "module/name/to/ignore",
        // ignores modules with names matching this pattern
        /can\//
      ],

      // Remove code between !steal-remove-start and !steal-remove-end.
      // true by default.
      removeDevelopmentCode: true,

      // Transpile the code to either "amd", "steal", "cjs" or "global".
      // "global", the default, allows the file to work without any
      // module loader.
      format: "global",

      // Minify the file using uglify.
      // `false` by default.
      minify: true,

      // Only write the module specified by `moduleName`, instead of its
      // dependencies. `false` by default.
      ignoreAllDependencies: false

      // Map module names to their name on the global object. Useful for
      // building "global" modules that depend on other scripts already in
      // the page.
      exports: {"jquery": "jQuery"},

      // Transpile to normalized dependency names.
      // `true` by default.
      useNormalizedDependencies: true

      // Custom normalization behavior
      // By default, the normalized name is used.
      normalize: function(name, currentModule, address){
        return name;
      }

    });

Most of these options are optional.  For more
information, read [steal-tools.transform.options transformOptions].
