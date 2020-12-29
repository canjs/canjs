@property {function} System.config
@parent StealJS.config
@alias steal.config

Specifies configuration values on System. This should be used to
set properties like [System.configPath] and [System.env].

@param {Object} config An object of configuration values.

```
System.config({
  map: {
    foo: 'bar'
  }
});
```

@body

## Use

`System.config` can be called in four ways.

### package.json

If using the [npm] plugin you can add config to your package.json's **config** property:

```
{
  "system": {
    "meta": {
      "jquery-plugin": {
        "deps": [
          "jquery"
        ]
      }
    }
  }
}
```

### Programatically

Call `System.config` after _steal.js_ has been loaded like:

    System.config({
      paths: { ... },
      map: { ... }
    });

This is is most commonly done in the [@config] module.

### Script Attributes

Any property besides src, id, and type will be used to set on System:

    <script src="../path/to/steal/steal.js"
            config-path="../path/to/stealconfig.js"
            main="app">
    </script>

The above will be translated to a call like:

```
System.config({
  configPath: "../path/to/stealconfig.js",
  main: "app"
});
```

### steal object

A `steal` object loaded before `steal.js` will be used as a System.config argument.

    <script>
      var steal = {
        configPath: "../path/to/stealconfig.js",
        main: "app"
      }
    </script>
    <script src="../path/to/steal/steal.js"></script>
