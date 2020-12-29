@typedef {{}} steal-tools.transform.options TransformOptions
@parent steal-tools.types

Specify the behavior of a transform.

@option {Array.<RegExp|String|function(String,Load)>} [ignore] An Array of regular expressions, or strings that 
specify [moduleName]s that should not be included in the output. 

Module names that match the regular expressions are not included. The following
ignores everything in _can/util/_.

    transform("can/construct",{ignore: [/^can\/util\/]});


Module names and their dependencies that match the 
strings in the array are not included. The following will not include
"can/construct", and all of its dependencies:

    transform("can/component",{ignore: ["can/construct"]});

@option {Boolean} [removeDevelopmentCode=true] By default, removes code in between comments, like:

    //!steal-remove-start
    REMOVE.THIS;
    //!steal-remove-end

If removeDevelopmentCode is `false`, this code is not removed.

@option {String} [format='global'] What format the output will be transpiled to.  By default
the format is `"global"`.  `"global"` means the code will be transpiled to work
standalone.  Module dependencies that are not included should be mapped to their
name on the global object in exports.

The other possible format values are "steal","amd", and "cjs".

@option {Boolean} [noGlobalShim=false] By default, if _options.format_ is `"global"` then a global shim will be applied.
This is so that the script can be run standalone. Setting _noGlobalShim_ to `true` prevents adding the shim.
Excluding the shim means it will have to be run with an AMD loader like _requirejs_.

@option {Object<moduleName,String>} [exports] A mapping of module names to their name on the global object (such as the `window`).  For example, if an output depends on jQuery, but does not include it, you should include:

    transform("mywidget",{exports: {"jquery": "jQuery"}})

Conversely you can also use exports to set values that should be exported from your module. For example, if you have a module **foo** that exports a value like:

    module.exports = "foo bar";

You can specify where this module should be set on the window:

    transform("mywidget", {
      exports: {
        "foo": "foo.bar"
	  }
	});

Which, when the script runs will result in:

    window.foo.bar === "foo bar";


@option {Boolean} [useNormalizedDependencies=true] Use normalized dependency names instead of
relative module names.  For example "foo/bar" will be used instead of "./bar".

@option {function(String, Load, String, Load):String} [normalize(depName, depLoad, curName, curLoad)] An
optional function that will normalize all module names written out. Use this for custom normalization
behavior.

  @param {String} depName The dependency name to normalize.
  @param {Load} depLoad The load object for the dependency to normalize.
  @param {String} curName The moduleName of the module whose dependencies are being normalized.
  @param {Load} curLoad The load object of the module whose dependencies are being normalized.
  @return {String} The dependency name to write in. By default, `depName` is used.

@option {Boolean} [minify=false] By default, the output is not minified.
Set to `true` to minify the result.

@option {Boolean} [ignoreAllDependencies=false] By default, the dependencies of
the module specified are included, unless they are explicitly ignored.  Setting
_ignoreAllDependencies_ to `true` only results in returning that individual module
as the output.

@option {Boolean} [includeTraceurRuntime=true] By default, if an ES6 module
is found and the `transpiler` config is set to `traceur` (the default), the [@traceur] runtime is packaged with the output.  Setting this to `false`
prevents that behavior.

@option {Boolean} [sourceMaps=false] To generate source maps alongside your transformed source, set this option to true.

@option {Boolean} [sourceMapsContent=false] Include the original source contents in the generated source maps.
