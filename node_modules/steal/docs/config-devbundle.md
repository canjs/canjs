@property {(Boolean|String)} config.devbundle devBundle
@parent StealJS.config

A configuration property that specifies that a development bundle should be preloaded. Before using this API you first need to [steal-tools.cmd.bundle create a development bundle].

@option {Boolean}

Specifies that you would like to use dev bundles, in the default location of [config.baseURL] + `dev-bundle.js`.

```html
<script src="./node_modules/steal/steal.js"
  dev-bundle main></script>
```

@option {String}

Specifies a [moduleName], relative to the [config.baseURL], for the dev-bundle. Use this option if you have changed the __dest__ option in [steal-tools.bundle].

```html
<script src="./node_modules/steal/steal.js"
  dev-bundle="folder/dev-bundle" main></script>
```
