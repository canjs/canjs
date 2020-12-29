@property {function} System.setContextual
@parent StealJS.functions

Create a module that is aware of its parent module.

@signature `System.setContextual(moduleName, definer)`

@param {String} moduleName The name of the contextual module.

@param {Function|String} definer Either a function defining the module or a moduleName to import which defines the module.

@body

## Use

Modules may want to modify their behavior based on the module that is importing them. One example would be for normalization:

```js
System.setContextual("normalize", function(parentName){
  return {
    "default": function(name){
      return System.normalize(name, parentName);
    },
    __useDefault: true
  };
});
```
