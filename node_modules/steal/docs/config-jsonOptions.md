@property {Object} config.jsonOptions jsonOptions
@parent StealJS.config

Provides options that can be applied to JSON loading. The JSON extension has the following options:

@option {Function} [transform] A function that allows you to transform the JSON object that will be used as the module value.

```js
steal.config({
  jsonOptions: {
    transform: function(load, data) {
      // Delete secret data
	  delete data._secret;
	  return data;
	}
  }
});
```

  @param {Object} load The load object for this module. Use this if you need to know the module's name or other metadata to determine how to transform it.
  
  @param {Object} data The raw JSON data parsed by `JSON.parse`.

  @return {Object} The object that will be used as the module's value.

@body

## Use

**jsonOptions** is useful when your app (or one of your dependencies is importing a JSON file that isn't meant to be exposed in production. For example many packages do:

```
var pkg = require("./package.json");
```

Which will be imported by Steal. However the package.json contains metadata include paths on your filesystem that you likely don't want exposed by a web-server.

Typically code only needs their version for a few properties, such as the **version**. Using the *transform* function we can remove all others:

```
steal.config({
  jsonOptions: {
    transform: function(load, data) {
      // Delete every prop by `version`
	  // Only allow the version prop to be exposed
	  return {
	    version: data.version
	  };
	}
  }
});
```

When compiled every other property will be excluded from the build.
