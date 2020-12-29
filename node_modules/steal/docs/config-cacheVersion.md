@property {String} config.cacheVersion cacheVersion
@parent StealJS.config

Specifies a version string to be used for the purposes of cache busting bundles.

@option {String}

Any string version to be used for cache busting.

```html
<script src="./dist/steal.production.js" cache-version="12345"></script>
```

@body

## Use

Use the **cacheVersion** configuration value to cache bust your JavaScript and CSS bundles. Cache busting is only available in *production* mode.

The best way to specify the cacheVersion is in the production steal script tag like so:

```html
<script src="./dist/steal.production.js" cache-version="12345"></script>
```

This will result in requests such as:

```
/dist/bundles/my-app/index.js?version=12345
```

The above example uses the `version` query string to specify a version number. This is usually enough to bust the browser cache. If you'd like to use a different query string identifier, use the [config.cacheKey] configuration as well.

Using server templates you can easily dynamically set the version value based your application's versioning strategy like a package.json version number, or a Git hash. The cache busting extension will work regardless of what string is used.
