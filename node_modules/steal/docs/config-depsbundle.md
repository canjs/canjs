@property {(Boolean|String)} config.depsbundle depsBundle
@parent StealJS.config

A configuration property that specifies that a dependencies bundle should be preloaded. Before using this API you first need to [steal-tools.cmd.bundle create a development bundle].

@option {Boolean}

Specifies that you would like to use deps bundles, in the default location of [config.baseURL] + `dev-bundle.js`.

```html
<script src="./node_modules/steal/steal.js"
  deps-bundle main></script>
```

@option {String}

Specifies a [moduleName], relative to the [config.baseURL], for the deps-bundle. Use this option if you have changed the __dest__ option in [steal-tools.bundle].

```html
<script src="./node_modules/steal/steal.js"
  deps-bundle="folder/dev-bundle" main></script>
```
