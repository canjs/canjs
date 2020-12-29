JavaScript Module Formats
=========================

[![Build Status](https://travis-ci.org/yahoo/js-module-formats.png?branch=master)](https://travis-ci.org/yahoo/js-module-formats)
[![Dependency Status](https://gemnasium.com/yahoo/js-module-formats.png)](https://gemnasium.com/yahoo/js-module-formats)
[![npm Version](https://badge.fury.io/js/js-module-formats.png)](https://npmjs.org/package/js-module-formats)

Micro library to detect different types of JavaScript modules formats given some JavaScript source code.


Goals, Overview & Features
--------------------------

With the new ES Module syntax arrival, projects will commence the transition to write modules in ES format, and in some cases, rewrite/adjust modules to be ES module. As a result, complex applications might ended up having multiple module formats in their application, while the proper transpile process will be necessary. This micro library will help you to detect what type of module does a JavaScript file defines, and take the appropriate steps based on that information.


Installation
------------

Install using npm:

```shell
$ npm install js-module-formats
```


Usage
-----

By calling `detect()` with JavaScript source code, it returns one of the following values:

* `yui` Modules
* `amd` Modules
* `cjs` CommonJS modules (including nodejs modules)
* `es` Modules
* `undefined` if the detection fails

To detect the module format of a file called `file.js`:

```javascript
var fs            = require('fs'),
    moduleFormats = require('js-module-formats').detect;

var source = fs.readFileSync(__dirname + '/file.js', 'utf8');

console.log(moduleFormats.detect(source));
```

**Note:** ES modules without `import` or `export` statements will not be detected.


License
-------

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/js-module-formats/blob/master/LICENSE
