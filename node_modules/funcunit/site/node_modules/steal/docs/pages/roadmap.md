@page StealJS.roadmap Roadmap
@parent StealJS.guides

Here's what we've got planned:

## New Plugins API

Currently plugins can only be loaded either with a bang syntax like:

```
require("foo.css!css-plugin");
```

Or with ext config like:

```
{
  "system": {
    "ext": {
      "css": "css-plugin"
    }
  }
}
```

This is sufficient for plugins that are based around a filetype, but we would like to make more advanced plugins that do thinks like provide compatibility to the webpackage module.hot API, or run Babel over all JavaScript files (not just ES6 ones).

https://github.com/stealjs/steal/issues/671

## Conditional loading

This is currently available as [steal-conditional](https://github.com/stealjs/conditional), but will be part of core in 1.0.

## Development Packages

Build a package that will be loaded in development. For example, instead of
loading each CanJS module individually, you could easily build them
into a package that would be loaded in development as a single file.

## Enhanced caching

We would like to utilize Service Workers to provide enhanced caching for faster development page load times. We might even be able to offload transpiling to Web Workers to speed things up.
