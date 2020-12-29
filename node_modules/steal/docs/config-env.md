@property {String} config.env env
@parent StealJS.config

Specifies which environment the application is loading within.

@option {String} Any string value is possible.

@body

## Use

Previously setting `env` was used to control when bundles were loaded, by setting `env` to **production**. This functionality has been superceded by [config.loadBundles].

`env` can be any string value and separated by a dash `-`. This is useful to, for example, set the environment as being both **production** and **server** if doing server-side rendering.

```html
<script src="./node_modules/steal/steal.js" env="window-production" main="myapp"></script>
```

```js
steal.loader.isEnv("production"); // true
steal.loader.isPlatform("window"); // true
```

Rarely do you need to set `env` any more, more likely you want to use [config.loadBundles]. env is set by plugins in most cases.

## Common values

A few of the common env values include:

* __window-development__: This is value when using Steal in dev mode in the browser.
* __window-production__: This is the value set for production builds, built using [steal-tools].
* __server-development__ / __server-production__: These are values set by [done-ssr](https://github.com/donejs/done-ssr) when loading a Steal application for server-side rendering purposes.
* __electron-production__: Set when using the [steal-electron](https://github.com/stealjs/steal-electron) plugin.
* __cordova-production__: Set when using the [steal-cordova](https://github.com/stealjs/steal-cordova) plugin.