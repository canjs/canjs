@function steal.hooks.normalize normalize
@parent StealJS.hooks

A loader hook that converts a [moduleIdentifier] into a [moduleName] to serve as the canonical key for a module.

@signature `normalize(name, parentName, parentAddress)`

@param {String} name The [moduleIdentifier] provided in the `import`, `require()` or similar call depending on the module syntax used.

@return {Promise|String} The [moduleName] or a Promise that will resolve with the moduleName.

For example:

```
import foo from './foo';
```

In this example the string `'./foo'` is the **name** argument provided to normalize.

@param {String} [parentName] The [moduleName] of the parent module; the module that is doing the importing.

@param {String} [parentAddress] The address (as determined in [steal.hooks.locate]) of the parent module.

@return {Promise|String} The string [moduleName] as determined by applying the normalize algorithm, or a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that will resolve with the moduleName.

@body

The **normalize** hook is used to convert a [moduleIdentifier] from a given context and, using the normalization algorithm, to a canonical [moduleName].
