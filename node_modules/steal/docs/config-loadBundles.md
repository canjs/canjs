@property {Boolean} config.loadBundles loadBundles
@parent StealJS.config

Specifies whether bundles should be loaded, used primarily for production.

@option {Boolean} True if bundles are to be loaded.

@body

## Use

Setting `loadBundles` to **true** is a short cut to prevent steal from loading the
[@config] and [@dev] modules and make steal load the [config.main] module
in a bundle.

For example:

```
steal.config({
  main: "myapp",
  loadBundles: true
});
```

Sets:

```
steal.config("bundles")["bundles/myapp"] //-> ["myapp"]
steal.config("meta")["bundles/myapp"]    //-> {format: "amd"}
steal.config("paths")["bundles/*"]       //-> "dist/bundles/*.js"
steal.config("paths")["bundles/*.css"]   //-> "dist/bundles/*.css"
```

Setting `loadBundles` to `true` must happen prior to loading `steal.js`.  So it should
be [config.config configured] via the `steal.js` script tag like:

```
<script src="../path/to/steal/steal.js"
		data-load-bundles
    data-main="myapp">
</script>
```

Or specified prior to steal loading like:

```
<script>
  steal = { loadBundles: true };
</script>
<script src="../path/to/steal/steal.js"
        data-env="production"
        data-main="myapp">
</script>
```
