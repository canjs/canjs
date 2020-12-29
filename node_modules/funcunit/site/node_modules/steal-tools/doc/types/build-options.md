@typedef {{}} steal-tools.BuildOptions BuildOptions
@parent steal-tools.types

Options used to configure the build process.

@option {Boolean} [minify=true] Sets whether the source code is minified prior to writing.

@option {Boolean} [bundleSteal=false] Sets whether StealJS will be included in the built file. Enabling this option will allow you to limit the initial request to just one script.

@option {Boolean} [debug=false] `true` turns on debug messages. Defaults to `false`.

@option {Boolean} [quiet=false] No logging.  Defaults to `false`.

@option {steal-tools.BundleAssetsOptions|Boolean} [bundleAssets=false] Set to true to have assets from your project bundled into your dist folder.

@option {Array.<moduleName>} bundle An array of module names that should be
progressively loaded.

@option {Array.<moduleName>} ignore An array of module names that should be ignored and not included in the bundled file. 
For more information take a look at the `ignore` usage http://stealjs.com/docs/steal-tools.build.html#ignore


@option {Number} [bundleDepth=3] The maximum number of bundles that need to be loaded
for any `bundle` module. Defaults to `3`.

@option {Number} [mainDepth=3] The maximum number of bundles that will be loaded for any `main`
module. Defaults to `3`.

@option {Boolean} [removeDevelopmentCode=true] Remove any development code from the bundle specified 
using `//!steal-remove-start`, and `//!steal-remove-end` comments.

@option {Object} [cleanCSSOptions] A hash of options to customize the minification of css files. 
All available options are listed in the [clean-css documentation](https://github.com/jakubpawlowicz/clean-css#how-to-use-clean-css-programmatically).

@option {Object} [uglifyOptions] A hash of options to customize the minification of JavaScript files. StealTools uses the 
top-level `minify` function of uglify-js, and the available options are listed [here](https://github.com/mishoo/UglifyJS2#the-simple-way).
The option `fromString` is used internally and will always be `true`; any other value will be ignored.

@option {Boolean} [sourceMaps=false] Generate source maps alongside your bundles.

@option {Boolean} [sourceMapsContent=false] Include the original source contents in the generated source maps. Use this option if your production environment doesn't have access to the source files. Will result in a larger source maps size but will cause fewer requests.

@option {steal-tools.BuildOptions.transpile} [transpile] A function that handles the transpiling of ES6 source to a format for production.

@option {Boolean} [watch=false] Actives watch mode which will continuously build as you develop your application.
