@function syntax.global global
@parent StealJS.syntaxes

If a script simply exports its values on the global or window object,
it uses the "global" syntax.

@body

## Use

A global module might look like:

    // app/sample-global.js
    hello = "world";

Use [config.meta] to configure this module as the global format like:

```js
steal.config({
	meta: {
		"app/sample-global": {
			format: "global"
		}
	}
});
```

Using [config.meta] you can also set a module's dependencies and what it exports.  These configurations
can also be set inline like:

    // app/sample-global.js
    "format global";
    "exports hello";
    hello = "world";
