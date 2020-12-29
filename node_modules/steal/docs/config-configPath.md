@property {String} config.configPath configPath
@parent StealJS.config
@alias steal.config

A shortcut for specifying the [@config] module [config.paths path] and [config.baseURL baseURL]. 

@option {String}

Specifies the path to the [@config] configuration file that will be loaded before the
[config.main main] module. This will also set [config.baseURL baseURL] to
the `main` module directory.
   
@body

## Use

This is commonly set as part of the steal `<script>` tag like:

```
<script src="../path/to/steal/steal.js"
        config-path="../path/to/stealconfig.js"
        main="app">
</script>
```

or

```
<script src="../path/to/steal/steal.js"
        config="../path/to/stealconfig.js"
        main="app">
</script>
```

instead of having to specify it like:

```
<script src="../path/to/steal/steal.js"
        paths.@config="../path/to/stealconfig.js"
        main="app">
</script>
```



It also can be specified with any of the approaches in [config.config].
