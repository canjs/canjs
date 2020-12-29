@property {Object.<String,moduleName>} config.ext ext
@parent StealJS.config

Configures plugin loading by module extension.

@option {Object.<String,moduleName>}

Specifies a plugin to add when an extension is matched in a module name.

@body

## Use

The following:

```
steal.config({
	ext: {
		txt: 'text-plugin'
	}
})
```

allows:

    steal.import("foo.txt")

Without having to write:

    steal.import("foo.txt!text-plugin");
