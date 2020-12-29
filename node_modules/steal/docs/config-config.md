@property {function} config.config config
@parent StealJS.config
@alias steal.config

Specifies configuration values for Steal. This should be used to
set properties like [config.configPath] and [config.env].

@param {Object} config An object of configuration values.

```
steal.config({
  map: {
    foo: 'bar'
  }
});
```

@body

## Use

`config` can be called in four ways.

### package.json

If using the [npm] plugin you can add config to your package.json's **config** property:

```
{
  "steal": {
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

Call `steal.config` after _steal.js_ has been loaded like:

    steal.config({
      paths: { ... },
      map: { ... }
    });

This is is most commonly done in the [@config] module.

### Script Attributes

Any property besides src, id, and type will be used to set on the loader:

    <script src="../path/to/steal/steal.js"
            config-path="../path/to/stealconfig.js"
            main="app">
    </script>

The above will be translated to a call like:

```
steal.config({
  configPath: "../path/to/stealconfig.js",
  main: "app"
});
```

### steal object

A `steal` object loaded before `steal.js` will be used as a steal.config argument.

    <script>
      steal = {
        configPath: "../path/to/stealconfig.js",
        main: "app"
      }
    </script>
    <script src="../path/to/steal/steal.js"></script>
