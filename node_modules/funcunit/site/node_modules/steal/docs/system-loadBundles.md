@property {Boolean} System.loadBundles
@parent StealJS.config

Specifies whether bundles should be loaded, used primarily for production.

@option {Boolean} True if bundles are to be loaded.

@body

## Use

Setting `loadBundles` to **true** is a short cut to prevent steal from loading the
[@config] and [@dev] modules and make steal load the [System.main] module
in a bundle.

For example:

```
System.config({
  main: "myapp",
  loadBundles: true
});
```

Sets:

```
System.bundles["bundles/myapp"] //-> ["myapp"]
System.meta["bundles/myapp"]    //-> {format: "amd"}
System.paths["bundles/*"]       //-> "dist/bundles/*.js"
System.paths["bundles/*.css"]   //-> "dist/bundles/*.css"
```

Setting `System.loadBundles` to `true` must happen prior to loading `steal.js`.  So it should
be [System.config configured] via the `steal.js` script tag like:

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
        data-env="production">
</script>
```
