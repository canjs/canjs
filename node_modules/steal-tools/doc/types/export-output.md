@typedef {Object} steal-tools.export.output ExportOutput
@inherits steal-tools.transform.options
@parent steal-tools.types

Specifies the behavior for an output in an [steal-tools.export.object] "outputs" property. These properties are in
addition to [steal-tools.transform.options].

@option {Array<moduleName|comparitor>} [modules] Builds all the modules in `modules` together 
with their dependencies. 


@option {Array<moduleName|comparitor>} [eachModule] Builds each module in the list with its dependendencies individually. Use this if you want to create separate builds for more than one module in your graph:

```js
stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm"
	}

});
```

@option {Array<moduleName|comparitor>} [graphs] Builds each item in the graph on its own. Each dependency is 
built individually.

@option {String|function():String} dest Specifies where the 
output should be written.  Dest can be provided as a string or a function that returns the
location.

  @param {String|Array<String>} moduleName The module name or module names being written
  out by this output.
  @param {Object|Array<Object>} moduleData Deprecated.
  @param {Load|Array<Load>} load The module load record, or module load records, being written by this output. 
  @param {Loader} loader The Steal loader used by Steal to load all of these modules.  All configuration
  should be available on it.
 
@option {Array<moduleName|steal-tools.export.ignorer>|Boolean} [ignore] Modules that should be ignored and not included in the output.

You can use it like:

```js
stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm"
	},
	options: {},
	outputs: {
		"+global-js": {
			ignore: [
				"jquery"
			]
		}
	}
})
```

Or alternatively you can provide an [steal-tools.export.ignorer] **function** that will be called with each [moduleName], giving you the opportunity to programmatically determine if a module should be ignored.

```js
stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm"
	},
	options: {},
	outputs: {
		"+global-js": {
			ignore: [function(name){
				if(name.indexOf("foobar") >= 0) {
					return true;
				} else {
					return false;
				}
			}]
		}
	}
})
```

For the [steal-tools/lib/build/helpers/global] helper providing `false` (instead of an Array) for this option will not ignore modules defined in `node_modules` as is done by default.

@body

## Use

Only one of `modules`, `eachModule`, or `graphs` can be specified.  

## modules

All modules specified by `modules` and their dependencies will be built together.  For example:

```
{
  modules: ["foo","bar"],
  format: "global"
}
```

This will build "foo" and "bar" together in the global format.  If "foo", or "bar" depend on "zed", "zed"
will also be included.

## eachModule

Each module specified by `eachModule` will be exported, including its dependencies individually.  For example:

**eachModule** is useful when you want to take a dependency graph and split it into separate builds that will be combined around certain modules within that graph.

For example:

```js
stealTools.export({
	steal: {
		config: __dirname + "/package.json!npm"
	},
	options: {},
	outputs: {
		"+standalone": {
			eachModule: [
				"app/a",
				"app/b"
			]
		}
	}
});
```

This will build out `dist/global/app/a.js` and `dist/global/app/b.js`, both as standalone builds.

## graphs

Each module specified by `graphs` and its dependencies will be exported individually.  For example:

```
{
  graphs: ["foo","bar"],
  format: "cjs"
}
```

This will export "foo" to a file, and each of its dependencies to their own file.  This will also export "bar"
to a file, and each of its dependencies to their own file.  If "foo" and "bar" both depend on "zed", "zed"
will be written to its own file one time.


## dest

Dest should specify a single file, typically with a string, if `modules` is provided, like:

```
{
  modules: ["foo","bar"],
  format: "global",
  dest: __dirname+"/foo-bar.js"
}
```

Otherwise, a folder or function should be provided, if using `eachModule or `graphs`:

```
{
  graphs: ["foo","bar"],
  format: "cjs",
  dest: function(moduleName){
    return __dirname+"/"+moduleName+".js";
  }
}
```
