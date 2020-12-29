# steal

[![Join our Slack](https://img.shields.io/badge/slack-join%20chat-611f69.svg)](https://www.bitovi.com/community/slack?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join our Discourse](https://img.shields.io/discourse/https/forums.bitovi.com/posts.svg)](https://forums.bitovi.com/?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/stealjs/steal/blob/master/license.md)
[![npm version](https://badge.fury.io/js/steal.svg)](https://www.npmjs.com/package/steal)
[![Travis build status](https://travis-ci.org/stealjs/steal.svg?branch=master)](https://travis-ci.org/stealjs/steal)
[![Greenkeeper badge](https://badges.greenkeeper.io/stealjs/steal.svg)](https://greenkeeper.io/)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/matthewphillips.svg)](https://saucelabs.com/u/matthewphillips)

In addition to a collection of plugins, __StealJS__ is comprised of two main components:

  - __`steal`__: an extensible, universal module loader.
  - __`steal-tools`__: utilities for building, transforming, and exporting module formats.

This is the `steal` repository. For the `tools`, see <https://github.com/stealjs/steal-tools>.

## Module Loading with `steal`

`steal` is unique because it can load JavaScript modules defined in ES6, AMD, and CommonJS formats (unlike most other module loaders, which only support one of these formats at a time).

In JavaScript, the word "modules" refers to small units of independent, reusable code. They are the foundation of many JavaScript design patterns, and can look like this in ES6:

```js
export function hello() {
  console.log('hello');
}
export function goodbye() {
  console.log('goodbye');
}
```

Or like this in AMD:

```js
define([], function() {
  return {
    hello: function() {
      console.log('hello');
    },
    goodbye: function() {
      console.log('goodbye');
    }
  };
});
```

Or like this CommonJS:

```js
function hello() {
  console.log('hello');
}
function goodbye() {
  console.log('goodbye');
}
module.exports = {
  hello: hello,
  goodbye: goodbye
}
```

All of these formats are supported by `steal`, so you can mix and match modules in your project:

```js
// ES6
import { hello, goodbye } from  "greetings";

// AMD
define(["greetings"],function(greetings){ ... });

// CommonJS
var hello = require('greetings').hello;
var goodbye = require('greetings').goodbye;
```

Additionally, plugins make it possible to load ANY module type you might come up with, such as Less or CSS. Anyone can write a plugin for `steal` to extend it's core module-loading functionality.

## Extending `steal` with Plugins

The StealJS organization maintains popular plugins that extend and enhance the module-loading capabilities of `steal` (and, subsequently, `steal-tools`) such as:

  - [CSS](https://github.com/stealjs/steal-css)
  - [Less](https://github.com/stealjs/steal-less)
  - [Conditional](https://github.com/stealjs/steal-conditional)
  - [Mocha](https://github.com/stealjs/steal-mocha)
  - [QUnit](https://github.com/stealjs/steal-qunit)

For example, the Less plugin allows Less files to be loaded similarly to JavaScript modules:

```js
// ES6
import "style.less";

// AMD
define(["style.less"],function(){ ... });

// CommonJS
require("style.less");

// steal
steal("style.less")
```

Looking to create a plugin for another format? See [Writing Plugins](https://stealjs.com/docs/StealJS.writing-plugins.html).

For more information on StealJS, visit [StealJS.com](http://stealjs.com).

# Contributing

For information on contributing and developing, see the [Contributing Guide on StealJS.com](http://stealjs.com/docs/guides.Contributing.html).

