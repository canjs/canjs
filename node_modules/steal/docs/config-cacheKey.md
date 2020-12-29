@property {String} config.cacheKey cacheKey
@parent StealJS.config

When used in conjuction with [config.cacheVersion], specifies what query string to use for cache busting.

@option {String}

A string key to use as the query string key:

```
<script src="./dist/steal.production.js"
	cache-key="v" cache-version="1234"></script>
```

Will result requests like:

```
/dist/bundles/my-app/index.js?v=1234
```
