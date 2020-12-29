@function steal-tools.BuildOptions.transpile Transpile
@parent steal-tools.types

Allows the ability to completely control the transpiling of ES2015 source down to another format for production bundling (usually to AMD).

@signature `transpile(source, compileOptions)`

@param {String} source The ES2015 source code to be transpiled.

@param {steal-tools.BuildOptions.compileOptions} compileOptions The options needed to be used to do the transpile, such as the format being transpiled to, and whether source maps are needed.

@return {steal-tools.source.object} An object containing `code` and (optionally) `map` properties.

@body

The **transpile** option gives you complete control over transpiling. After StealTools has created a graph of your project's dependencies it then goes through each and transpiles them into a common format, usually AMD for the multi-build.

If you're using a specific version of Traceur, Babel, or a different transpiler altogether, you might want to use this so that you can do your own transpiling.

Here's an example of usage:

```js
var Babel = require("babel-core");
var stealTools = require("steal-tools");

var mapFormat = {
	'commonjs': 'common',
	'amd': 'amd'
};

var transpile = function(source, compileOptions){
	var babelOptions = {
		modules: mapFormat[compileOptions.module],
		sourceMap: compileOptions.sourceMaps || false
	};

	return babel.transform(source, opts);
};


stealTools.build({
	config: __dirname + "/package.json!npm"
}, {
	transpile: transpile
});
```
