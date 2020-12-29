@property {String} config.bundlesPath bundlesPath
@parent StealJS.config

A configuration property for setting the path of where the [config.env production] 
bundles folder is located.

@option {String} 

A folder name that specifies the path to the production bundles.  By default,
`bundlesPath` is `"dist/bundles"`. This path is relative to the page's [config.baseURL]. So, for example, if your script tag looks like:

@body

## Use

In [config.env production], the [config.main] module will be assumed to be within a 
_"bundles/[MAIN\_MODULE\_NAME]"_ module. For example, if the main module is `myapp`,
a `bundles/myapp` module is automatically configured to contain it:

```
<script src="node_modules/steal/steal.production.js"
		bundles-path="./out/bundles"
        main="myapp">
</script>
```

`bundlesPath` tells the client where all bundles can be found by configuring
[config.paths]. For example, if bundlesPath is set to `packages`:

```
<script src="steal/steal.js"
        config="./config.js"
        main="myapp"
        env="production"
        bundles-path="packages">
</script>
<script>
	steal.config({
		bundles: {
			"bundles/myapp": ["myapp"]
		},
		paths: {
			"bundles/*": "packages/*.js",
			"bundles/*.css": "packages/*.css"
		}
	});
</script>
```

Often, `bundlesPath` should be the same value as what's passed in [steal-tools.build]. If `bundlesPath` is not set, it will set the default bundles paths:

```
<script src="node_modules/steal/steal.js"
        main="myapp"
        env="production"
        bundles-path="packages">
</script>
<script>
	steal.config({
		bundles: {
			"bundles/myapp": ["myapp"]
		},
		paths: {
			"bundles/*": "dist/bundles/*.js",
			"bundles/*.css": "dist/bundles/*.css"
		}
	});
</script>
```

If a path rule for `paths["bundles/*"]` or `paths["bundles/*.css"]`
exist, `bundlesPath` will not overwrite them.
