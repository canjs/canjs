@property {(Array.<moduleName>|Glob)} config.bundle bundle
@parent StealJS.config

Specifies which modules will be progressively loaded. This is 
used by the build.


@option {Array.<moduleName>}

An array of module names.
Either a direct module name or glob patterns that match module names.

**An array of module names**
```
steal.config({
    "bundle": [
        "pages/home",
        "pages/detail",
        "components/my-component/my-component"
    ]
});
```

**An array of glob patterns**
```
steal.config({
    "bundle": [
        "pages/**/*",
        "components/**/*"
    ]
});
```


@option {Glob}

A string representing a glob pattern that match module names. see options and features on [npm globby](https://github.com/sindresorhus/globby)

For example:

```
steal.config({
    "bundle": "components/**/*"
});
```

@body

## Use

It is possible to load an app in chunks, rather than one single production file. If there is modules segmented by "pages", for example:

- A home screen in "js/pages/home"
- Search results in "js/pages/search"
- Details in "js/pages/details"

It will be more efficient to load "search" and "details" progressively, making the "home" page load lighter. `bundle` allows you to create multiple production files by defining the starting point:

```
steal.config({
    bundle: [
        "src/pages/home",
        "src/pages/search",
        "src/pages/details"
    ]
});
```

Within the main application, the condition may exist such as:

```
import $ from 'jquery';

if(/*route === home*/) {
	steal.import('src/pages/home');
}
```

### Usage with the NPM plugin
The [NPM plugin](https://stealjs.com/docs/npm.html) fits very nicely to the bundle configuration. You can use the `appName` or the [tilde](https://stealjs.com/docs/tilde.html) lookup scheme in your `bundle` array. You can add your bundles either in the `package.json` or in your build script under [config](https://stealjs.com/docs/steal-tools.StealConfig.html).

Take the example above:

**bundle options in your package.json:**
```
...
"steal": {
  "directories": {
    "lib": "src"
 },
 "bundle": [
    "MY_APP_NAME/pages/*",
    "MY_APP_NAME/components/**/*"
 ]
}
....

```

**bundle option in build script**
```
stealTools.build({
    config: __dirname + "/MY_APP_NAME/package.json!npm",
    bundle: [
        "MY_APP_NAME/pages/*",
        "~/components/**/*"
    ]
})
```

#### Modlet workflow
If you follow the [modelt workflow](https://www.bitovi.com/blog/modlet-workflows), you have to know, that a glob also finds other files like markdown or test files. steal-tools can't handle these files. so you have to modify the glob.
 ```
 stealTools.build({
     config: __dirname + "/MY_APP_NAME/package.json!npm",
     bundle: [
         "~/components/**/*.js",
         "!~/components/**/*_test.js"
     ]
 })
 ```
 Use the negated patterns to exclude files that you don't want to add to the bundle. Also exclude files that steal can't handle or are useless to bundle with in your production build.