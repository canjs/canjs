@page using-download Download
@parent Using 0


## The CanJS download

The buttons on the [CanJS homepage](http://canjs.com) lets you either get the full download or create customized download using the
[download builder](#section_Thedownloadbuilder). The full download is a zipped version of [this repository](https://github.com/bitovi/canjs.com)
and contains:

- `can.<library>.js` (e.g. `can.jquery.js`) - The core build for a supported library
- `can.<library>.dev.js` - A development build logging useful messages for a supported library
- `can.<library>.min.js` - The minified core build for a supported library
- `can.<type>.<plugin>` - Individual builds for each official CanJS plugin
- `amd/` - CanJS provided as AMD modules (see [using-require using with RequireJS] for usage)
- `amd-dev/` - CanJS AMD modules with development messages
- `steal/` - CanJS modules using the StealJS syntax (see [using-steal using with StealJS])

The [download page](http://canjs.com/download.html) also offers those downloads for older versions and pre-releases for the next version from the "Other Versions" dropdown.


## The download builder

The [download builder](http://canjs.com/download.html) creates a single - optionally minified - JavaScript
file (`can.custom.js`) for the library and CanJS modules (including plugins) you selected in the currently released version.
The advantage is that you will get a single file with only the dependencies needed. The banner at the top will
contain a "Download from:" link so that you will be able to re-download the same configuration for newer versions.


## Bower

[Bower](http://bower.io/) is a package manager to organize dependencies on front-end packages. Bower runs over Git, and is package-agnostic. The CanJS Bower package references the [same repository](https://github.com/bitovi/canjs.com)
(and files) as the Zip download. With [NodeJS](http://nodejs.org) available Bower can easily be installed via:

> npm install bower -g

To install the latest CanJS release run:

> bower install canjs

To save the dependency in you `bower.json` configuration:

> bower install canjs --save

To install a different version (e.g. 1.1.8):

> bower install canjs#1.1.8

To get a CanJS pre-release run:

> bower install canjs#minor


## The GitHub CDN

We also make every CanJS version available via our homepage as:

- [canjs.com/release/](http://canjs.com/release/latest/can.jquery.js) - For the latest version for each library and plugin:
    - [can.jquery.js](http://canjs.com/release/latest/can.jquery.js)
    - [can.zepto.js](http://canjs.com/release/latest/can.zepto.js)
    - [can.dojo.js](http://canjs.com/release/latest/can.dojo.js)
    - [can.mootools.js](http://canjs.com/release/latest/can.mootools.js)
    - [can.yui.js](http://canjs.com/release/latest/can.yui.js)
- [canjs.com/--version--/can.jquery.js](http://canjs.com/release/2.0.0/can.jquery.js) - For a specific version

A list of all available CDN releases and files can be found at [github.com/bitovi/canjs.com/tree/gh-pages/release](https://github.com/bitovi/canjs.com/tree/gh-pages/release).

__Note:__ We highly recommend to always reference a specific version and never `latest` directly in a production environment.
Latest can contain backwards incompatible releases __and will break your application__.


## JSFiddle

To make quick demos and examples for CanJS you can use one of the following [JSFiddles](http://jsfiddle.com):

  - [jQuery](http://jsfiddle.net/donejs/qYdwR/)
  - [Zepto](http://jsfiddle.net/donejs/7Yaxk/)
  - [Dojo](http://jsfiddle.net/donejs/9x96n/)
  - [YUI](http://jsfiddle.net/donejs/w6m73/)
  - [Mootools](http://jsfiddle.net/donejs/mnNJX/)


## IE 8 Support

While CanJS does support Internet Exporer 8 out of the box, if you decide
to use [can.Components](/docs/can.Component.html) then you will need to use the [HTML5 Shiv](https://github.com/aFarkas/html5shiv)
in order for your custom tags to work properly. Unfortunately, at the moment, the official HTML5 Shiv
does not work with namespaced tag names (e.g. &lt;can:example&gt;). Thankfully, CanJS comes with a version that
fixes this and we've already submitted a pull request so future users of HTML5 Shiv won't run into this issue.
