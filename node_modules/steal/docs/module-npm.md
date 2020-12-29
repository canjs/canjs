@module {*} npm
@parent StealJS.modules

@signature `moduleName!npm`

@param {moduleName} moduleName The moduleName of the file you want
to process. This will normally be a package.json of your base application.

@body

## Use

The `npm` plugin makes it easy to work with npm packages. By pointing it
at a `package.json`, you will be able to import npm packages as modules.

By default, if [config.stealPath] points to steal.js within node_modules like:

    <script src="../node_modules/steal/steal.js" main></script>

[config.configMain] will point to `"package.json!npm"`. The `npm` plugin
reads `package.json` and sets a normalize and locate hook.

**Note**: if you are using npm 3 see the *npmAlgorithm* option below.


## npm Module names

Package dependency module names are converted to look like:

> packageName@version#modulePath!pluginName

For example, code that import's jQuery like:

    import $ from "jquery"

might actually import:

    jquery@2.1.3#dist/jquery.js

## Configuration

`package.json` configures the behavior of a package and even dependency
packages.  This section lists the configurable properties and behaviors that
steal uses.  

### package.main

Specifies the [config.main] property unless it is overwritten by `package.browser` or
`package.steal.main`.

```
{
  "main": "myapp"
}
```

### package.browser

Specifies browser-specific overwrites for module file resolution.  This
behaves like Browserify's [browser field](https://github.com/substack/node-browserify#browser-field).

```
{
  "browser": {
    "fs": "level-fs",
    "./lib/ops.js": "./browser/opts.js"
  }
}
```

### package.globalBrowser

Global browser specific overwrites for module file resolution.  These mapping take effect for all projects. Use sparingly.

```
{
  "globalBrowser": {
    "console": "console-browserify",
    "constants": "constants-browserify"
  }
}
```

### package.steal

By default, any property on the package.steal object is passed to [config.config]. However, the
following properties have special behavior:

### package.steal.main

The moduleName of the initial module that should be loaded when the package is imported. For example:

```
{
  "name": "my-module",
  "version": "1.2.3",
  "steal": {
    "main": "my-main"
  }
}
```

When `my-module` is imported, `my-module@1.2.3#my-main` will be the actual module name being
imported.  This path that `my-main` will be found depends on the `directories.lib` setting.


### package.steal.map

The map config works similar to the base [config.map] behavior.  However, both the keys and values
are converted to npm module names.  The keys and values must:

 - Start with `./` to map modules within the package like `"./src/util"`, or
 - Look like `packageName#./modulePath` to map direct dependencies of the package.

```js
{
  "steal": {
    "map": {
      "./util/util": "./util/jquery/jquery",
      "jquery" : "lodash"
    }
  }
}
```

### package.steal.meta

The meta config works similar to the base [config.meta] behavior.  However, the module names must:

 - Start with `./` to add metadata to modules within the package like `"./src/util"`, or
 - Look like `packageName#./modulePath` to add metadata to direct dependencies of the package.

Example:

```js
{
  "steal": {
    "meta": {
      "./src/utils": {"format": "amd"},
      "jquery": {"format": "global"},
      "lodash#./array/grep": {"format": "es6"}
    }
  }
}
```

### package.steal.npmIgnore

Use npmIgnore to prevent package information from being loaded for specified dependencies
in the `peerDependencies`, `devDependencies` or `dependencies`.  The following
ignores a package.json's `devDependencies` and `cssify`.  But all other
dependencies will be loaded:

```js
{
  "dependencies": {
    "can": "2.2.4",
    "cssify": "^0.6.0"
  },
  "devDependencies": {
    "steal-tools": "0.5.0"
  },
  "steal": {
    "npmIgnore": ["devDependencies","cssify"]
  }
}
```

The following packages are ignored by default:

 - "steal", "steal-tools"
 - "grunt", "grunt-cli"

### package.steal.npmDependencies

Like `npmIgnore` but affirmative. If used alone will only include the dependencies listed. If used in conjunction with `npmIgnore` acts as an override. For example the following config:

```js
{
  "dependencies": {
    "one": "1.0.0",
	"two": "1.0.0"
  },
  "steal": {
    "npmDependencies": [ "one" ]
  }
}
```

Will load `one` but ignore `two`.

When used in conjuction with `npmIgnore`:

```js
{
  "devDependencies": {
	"one": "1.0.0",
	"two": "1.0.0",
	"three": "1.0.0"
  },
  "steal": {
	"npmIgnore": [ "devDependencies" ],
	"npmDependencies": [ "one" ]
  }
}
```

Even though `npmIgnore` is set to ignore all `devDependencies` the use of `npmDependencies` acts as an override. The package `one` will be loaded, but not `two` or `three`.

### package.steal.npmAlgorithm

Used to determine which algorithm is used to look up packages.

The default algorithm is `flat`. **We assume that you are using npm 3 or higher.** See [here](https://github.com/npm/npm/releases/tag/v3.0.0) more about the flat file structure of npm 3.

If you are using npm 2 or [pnpm](https://pnpm.js.org/), your dependencies of `node_modules` will be nested. StealJS can handle the lookup by setting `npmAlgorithm` to `nested`.

```js
{
  "steal": {
    "npmAlgorithm": "nested"
  }
}
```

### package.steal.ignoreBrowser

Set to true to ignore browserfy's `browser` and `browserify` configurations.

```js
{
  "steal": {
    "ignoreBrowser": true
  }
}
```

### package.steal.directories

Set a folder to look for module's within your project.  Only the `lib`
directory can be specified.

In the following setup, `my-project/my-utils` will be looked for in
`my-project/src/my-utils.js`:

```js
{
  "name": "my-project"
  "steal": {
    "directories" : {
      "lib" : "src"
    }
  }
}
```

### package.steal.configDependencies

Defines dependencies of your npm package. This is useful for loading modules,
like extensions, that need to be initialized before the rest of your application
is imported, e.g:

```js
{
  "steal": {
    "configDependencies": [
      "./node_modules/steal-conditional/conditional"
    ]
  }
}
```

### package.steal.plugins

Specifies packages that are used as plugins. These packages will be prefetched so that they're configuration will be applied before your app loads. An example is [steal-css].

```js
{
  "steal": {
    "plugins": ["steal-css"]
  }
}
```
