@property {String} System.env
@parent StealJS.config

Specifies which environment the application is loading within. 

@option {String} Any string value is possible.

@body

## Use

Previously setting `env` was used to control when bundles were loaded, by setting `env` to **production**. This functionality has been superceded by [System.loadBundles].

`env` can be any string value and separated by a dash `-`. This is useful to, for example, set the environment as being both **production** and **server** if doing server-side rendering.

```html
<script src="node_modules/steal/steal.js" env="window-production"></script>
```

```js
System.isEnv("production"); // true
System.isPlatform("window"); // true
```

Rarely do you need to set `env` any more, more likely you want to use [System.loadBundles]. env is set by plugins in most cases.
