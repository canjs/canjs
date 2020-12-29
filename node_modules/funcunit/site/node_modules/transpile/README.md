Transpiles JavaScript modules from one format to another.

It supports from:
 
 - es6, 
 - cjs, 
 - amd, 
 - steal
 
to 

 - amd, 
 - steal, 
 - cjs.

Currently, it can not transpile to ES6 module syntax.

## Install

    > npm install transpile --save-dev

## Use

`transpile.to` transpiles from one format to another format. `transpile.able`
lets you know if a transpile is possible.

### Formats

Formats are specified by strings like:

 - "es6" - ES6 Module syntax like `import Point from "math";`
 - "cjs" - CommonJS syntax like `var _ = require('underscore');`
 - "amd" - [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/wiki/AMD) 
         syntax like `define(['jquery'],function($){});`
 - "steal" - steal syntax like `steal('jquery', function($){})`


### `transpile.to(load, format, options) -> transpiledResult`

Transpiles from the `load`'s format to the specified format. If
the `load` does not specify a format, `"es6"` modules are assumed. Returns
an object containing the transpiled source and sourceMap (if sourceMap option provided).

Example:

```js
var transpile = require('transpile');
var res = transpile.to({
  name: "my/module",
  source: "var foo = require('foo')",
  metadata: {format: "cjs"}
}, "amd")

res.code //-> "define("my/module", function(require, exports, module) { ... "
```
    
A load is an object in the shape of 
an [ES6 Load Record](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-load-records-and-loadrequest-objects) like:

```js
{
  name: "moduleName",
  source: "source code",
  metadata: {format: "formatName"}
}
```

#### NOTE

Previously `transpile.to` returned a string containing the transpiled source. To accomodate Source Maps support the API has changed and now returns an object that looks like:

```js
{
  code: "define(...", // The transpiled source,
  map: {}, // A source map, if sourceMaps option is provided.
  ast: {} // A Mozilla Parser API compatible AST, created by Esprima
}
```

#### options

 - __normalizeMap__ `Object<moduleName,moduleName>` - A mapping module names that will
   be used to replace dependency names in the transpiled result.
 - __normalize__ `function(name, currentName, address) -> String` - A function
   that can be used to change moduleNames that are written in the transpiled result.
 - __namedDefines__ `Boolean=false` - Set to true to insert named defines. 
 - __transpiler__ `String=traceur` - Set which ES6 transpiler to use. Valid options are `traceur` or `6to5` with `traceur` being the default.
 - __transpile__ `function(source, compileOptions, options) -> Object` - If you want to handle tranpiling yourself and not use the built-in options, this is a function that will be given the source and is expected to return an object containing a `code` string.
 - __sourceMaps__ `Boolean=false` - Set to true to return a `map` and `ast` object along with the result.
 - __sourceMapsContent__ `Boolean=false` - If `sourceMaps` is set to true, this option will include the original source contents with the source maps.

### `transpile.able(fromFormat, toFormat) -> transpiledPath`

Returns the path used to transpile 
from `fromFormat` to `toFormat`. If transpiling is not possible, `null` will be
returned.

Example:

```js
var res = transpile.able("steal","cjs");
res //-> ["steal","amd"];
```

This means that a module will be converted from "steal" to "amd" and then
to "cjs".


## Test

    > npm test
