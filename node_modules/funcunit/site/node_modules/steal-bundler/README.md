[![Build Status](https://travis-ci.org/stealjs/steal-bundler.svg?branch=master)](https://travis-ci.org/stealjs/steal-bundler)
[![npm version](https://badge.fury.io/js/steal-bundler.svg)](http://badge.fury.io/js/steal-bundler)

# steal-bundler

For StealTools projects, steal-bundler provides an easy way to bundle static assets along with your CSS and JavaScript, so that your dist folder can be sent to a CDN.

steal-bundler infers static assets from your project and copies them for you automatically (can be turned off if undesired).

## Use

```js
var stealTools = require("steal-tools");
var bundleAssets = require("steal-bundler");

stealTools.build){
	config: __dirname + "/package.json!npm"
}).then(function(buildResult){

	bundleAssets(buildResult, {
		glob: "images/**/*"
	});

});
```

## API

### bundleAssets(bundleResult, [options]) -> Promise

Calling `require("steal-bundler")` will return a function that when called will bundle assets and pack them into a destination folder.

#### buildResult

The [BuildResult](http://stealjs.com/docs/steal-tools.BuildResult.html) obtained from calling `stealTools.build`.

#### options

An optional object for specifying additional options. They are:

- __infer__: By default steal-bundler will infer your static assets in your project by reading your CSS and JavaScript. Set this to `false` if you want to manually specify static assets.
- __glob__: A string or array of strings, of [minimatch globs](https://github.com/isaacs/minimatch) specifying files to be copied.

## License

MIT
