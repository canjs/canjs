@function steal.hooks.locate locate
@parent StealJS.hooks

A loader hook that is used to identify the location (such as the URL) where a module can be fetched.

@signature `locate(load)`
@param {load} load The *load* object associated with this module.

@return {Promise|String} the result

@body

The **locate** hook is the second hook in the module loading lifecycle. It is used to determine from where a module can be fetched.

```
loader.locate({
  name: "foo"
}).then(function(address){
  address === "http://example.com/foo.js"
});
```
