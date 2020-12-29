@property {Object} config.meta meta
@parent StealJS.config

Specify properties on the [load.metadata metadata] object.  

@option {Object.<moduleName,load.metadata>} An object of module names that
point to metadata values.

@body

## Use

Meta configuration is used to provide additional information about a module. It is most often used as a type of *shim* configuration for globals. [load.metadata This page] specifies the types of metadata that can be added.

For a global most likely you will want configuration that looks like:

```
"steal": {
	"meta": {
		"jquerty": {
			"format": "global",
			"exports": "jQuerty"
		}
	}
}
```

This specifies that the module **jquerty** uses the global format and exports the value of `window.jQuerty`.
