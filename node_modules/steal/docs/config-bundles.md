@property {Object<moduleName, Array.<moduleName>>} config.bundles bundles
@parent StealJS.config

Bundles configuration allows a single bundle file to be loaded in place of separate module files.

@option {Object<moduleName, Array.<moduleName>>} An object where keys
are bundle [moduleName moduleNames] and values are Arrays of [moduleName moduleNames] that
the bundle contains.


@body

## Use

Specify `bundles` if you are using a prebuilt bundle. For example, if `"jqueryui.autocomplete"` 
and `"jqueryui.datepicker"` are in `"jqueryui.custom"`, you can specify that like:

```json
steal.config({
	bundles: {
		"jqueryui.custom": [
			"jqueryui.autocomplete",
			"jqueryui.datepicker"
		]
	}
});
```

If `bundle` is passed to [steal-tools], it will write out where to load bundles in the production bundles. 

## Production Default Values

In [config.env production] a bundles is written out to 
contain the [config.main] module.  For example:

```
steal.config({
  main: "myapp",
  env: "production"
  bundles: {
	"bundles/myapp": "myapp"
  }
});
```

This way, when the `"myapp"` module is imported, Steal will load ["bundles/myapp"].  Use [config.bundlesPath] to configure where bundles are found.
