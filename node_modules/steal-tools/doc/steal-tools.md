@page steal-tools steal-tools
@parent StealJS.api
@group steal-tools.JS JavaScript
@group steal-tools.cmd Command Line
@group steal-tools.stream Streams
@group steal-tools.types Types
@group steal-tools.helpers Export Helpers

`steal-tools` is a collection of JS, Grunt, and command-line utilities
that make building, packaging, and sharing ES6, CommonJS, AMD, and [Steal](https://github.com/bitovi/steal)
applications easy.

## Use

There are three core pieces of functionality that steal-tools provides:

 - [steal-tools.build] - An application packager that intelligently bundles progressively-loaded
   apps to improve application load times and caching.
 - [steal-tools.transformImport] and [steal-tools.transform] - A low-level utility that can convert modules from one form to another.
 - [steal-tools.export] - A higher-level utility that can export projects into many formats.


Currently, steal-tools depends 
on [steal]. Before doing a build, make
sure `steal.js` loads your app successfully in the browser.
