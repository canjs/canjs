@page guides/setup Setting up CanJS
@parent guides/experiment 5
@outline 2

@description CanJS is packaged in multiple ways so that it can fit into any development workflow. Learn how to setup CanJS in different environments.

@body

CanJS can be downloaded or installed in many ways:

 - npm
 - the zip download (on the homepage)
 - the download builder (on the homepage)
 - loaded from our cdn
 - bower

Once downloaded or installed, CanJS can be loaded in a variety of ways:

 - StealJS,
 - RequireJS
 - Browserify
 - `<script>` tags

The following lists how to setup common combinations.  If you don't see yours, please
ask on the [forums](http://forums.donejs.com/c/canjs) or [gitter chat](https://gitter.im/canjs/canjs).

## JSBins

Not yet committed to CanJS? Or just want to play around? Use one of these JSBins:

<a class="jsbin-embed" href="http://jsbin.com/venaje/embed?html,js,output">JS Bin on jsbin.com</a><script src="//static.jsbin.com/js/embed.min.js?3.35.5"></script>

  - [jQuery](http://justinbmeyer.jsbin.com/venaje/edit?html,js,output)
  - [Zepto](http://justinbmeyer.jsbin.com/veqola/edit?html,js,output)

## CDN

Another quick way to start locally is by loading scripts from our CDN:

    <html>
    <head>
        <title>CanJS Test</title>
    </head>
    <body>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.js"></script>
        <script src="http://canjs.com/release/latest/can.jquery.js"></script>
        <script src="http://canjs.com/release/latest/can.map.define.js"></script>
        <script src="http://canjs.com/release/latest/can.stache.js"></script>
        <script type='text/stache' id='app'>
        	<hello-world/>
        </script>

        <script type="text/javascript">
            can.Component.extend({
            	tag: 'hello-world',
            	template: can.stache("<h1>{{message}}</h1>"),
            	viewModel: {
            		message: "Hi there!"
            	}
            });
            $("body").append(can.view("app",{}));
        </script>
    </body>
    </html>

This loads CanJS's core and its two most common plugins [define](../docs/can.Map.prototype.define.html)
and [stache](../docs/can.stache.html).  Checkout the [release folder](https://github.com/bitovi/canjs.com/tree/gh-pages/release/latest)
for the list of other plugins you can add.

If you want to use Zepto instead of jQuery, load Zepto instead of jQuery and `can.zepto.js` instead of `can.jquery.js` like:

    <script src="http://zeptojs.com/zepto.js"></script>
    <script src="http://canjs.com/release/latest/can.zepto.js"></script>

A list of all available CDN releases and files can be found [here](https://github.com/canjs/canjs.com/tree/gh-pages/release).

__Note:__ We highly recommend to always reference a specific version and never `latest` directly in a production environment.
Latest can contain backwards incompatible releases __and will break your application__.

## StealJS and NPM

If you are installing CanJS from npm and using StealJS, you should
checkout [DoneJS](http://donejs.com).  It has comprehensive guides on using
StealJS and CanJS together.

To use StealJS and CanJS outside DoneJS, install the [can](https://www.npmjs.com/package/can), [steal](https://www.npmjs.com/package/steal) and `jquery` packages:

```
> npm install can --save
> npm install steal --save
> npm install jquery --save
```

Next, create a `main.stache` template for your app:

```
<!-- main.stache -->
<h1>{{message}}</h1>
```

Next, create a `main` module for your application. Import CanJS's core,
jQuery, and your template to say "Hello World":

```
// main.js
import can from "can";
import $ from "jquery";
import template from "./main.stache!";

var data = new can.Map({message: "Hello World"});

$("body").append(template(data));
```

Finally, create a page that loads `steal.js` and specifies `"main"` as the main module:

```
<html>
  <body>
    <script src="./node_modules/steal/steal.js" data-main="main"></script>
  </body>
</html>
```

It's better if you import just what you need.  Instead of loading all of CanJS's core,
we can load just `"can/map/map"` like:

```
// main.js
import Map from "can/map/map";
import $ from "jquery";
import template from "./main.stache!";

var data = new Map({message: "Hello World"});

$("body").append(template(data));
```

StealJS supports "modlet" module names that end with "/".  This means that the above could
also be written like:

```
// main.js
import Map from "can/map/";
import $ from "jquery";
import template from "./main.stache!";

var data = new Map({message: "Hello World"});

$("body").append(template(data));
```

Besides ES6 modules, StealJS supports AMD, and CommonJS.  You could also write `main.js` like:

```
// main.js
var Map = require("can/map/");
var $ = require("jquery");
var template = require("./main.stache!");

var data = new Map({message: "Hello World"});

$("body").append(template(data));
```

### Building to production

If you are using StealJS and CanJS outside of DoneJS, [this guide](http://blog.bitovi.com/using-canjs-2-2-with-stealjs/)
walks through getting a production build.

## Browserify and NPM

The [can npm package](https://www.npmjs.com/package/can) works with browserify. After installing `can`:

```
> npm install can --save
```

Require the core `can` modules like:

```
var can = require("can");
```

You can also `require` specific modules:

```
var Component = require("can/component/component");
Component.extend({ ... });
```

Note that nearly all module names repeat the folder name (ex: `can/view/stache/stache`).

### Requiring templates

You can require any CanJS templates using the [can-compilify](https://www.npmjs.com/package/can-compilify) Browserify
transform. Complete instructions for installing and using the transform are available on [npm](https://www.npmjs.com/package/can-compilify).

Install can-compilify:

```
> npm install can --save
```

Require a template in your code:

```
// app.js
var Map = require("can/map/");
var $ = require("jquery");
var template = require("./main.stache");

var data = new Map({message: "Hello World"});

$("body").append(template(data));
```

And include the can-compilify transform from the command line:

```
> browserify -t can-compilify app.js > app.bundle.js
```

You could also add can-compilify to your package.json.

### Building templates to production

Using the can-compilify tranform, your production bundle(s) will include a compiled version of your
templates so no extra setup is required.

## RequireJS from NPM, the Download or Bower

The Zip Download (on the [homepage](http://canjs.com)) contains the following
AMD formatted scripts that can be loaded with RequireJS.

- `amd/` - CanJS provided as AMD modules
- `amd-dev/` - CanJS AMD modules with development messages

These files are also available in the [can NPM package](npmjs.com/package/can)'s `dist` folder.  Install
the `can` package like:

```
> npm install can --save
```

You'll find these files in `node_modules/can/dist`.

These files are also available in the `canjs` bower package.  Install `canjs` like:

> bower install canjs --save

You'll find these files in `bower_components/can/dist`.

The following section contains quick how to load CanJS with RequireJS for different libraries.

### jQuery

In RequireJS a simple configuration looks like this:

    <script type="text/javascript" src="require.js"></script>
    <script type="text/javascript">
      require.config({
        paths : {
          "jquery" : "http://code.jquery.com/jquery-2.0.3",
          "can": "path/to/can/amd"
        }
      });

      require(['can/control', 'can/view/stache'], function(Control, stache) {
        // Use Stache and Control
        var MyControl = Control.extend({
          init: function() {
            this.element.html(can.view('path/to/view.stache', this.options));
          }
        });
      });
    </script>

The `can` module is a shortcut that loads CanJS's core plugins and returns the `can` namespace:

    require(['can'], function(can) {
      // Use can.Component, can.view etc.
    });

### Building templates to production

Bundling templates with the rest of your JavaScript can dramatically reduce the number of requests.  

Use the [can-compile](https://github.com/canjs/can-compile#loading-with-requirejs) project
to build templates into an AMD module that can be used by `r.js` to build the app.


## Script tags from NPM, the Download, or Bower

The Zip Download (on the [homepage](http://canjs.com)) contains the following
"global" scripts that can be loaded with just a `<script>` tag.

- `can.<library>.js` (e.g. `can.jquery.js`) - The core build for a supported library
- `can.<library>.dev.js` - A development build logging useful messages for a supported library
- `can.<library>.min.js` - The minified core build for a supported library
- `can.<type>.<plugin>` - Individual builds for each official CanJS plugin


These are also available in the [can NPM package](npmjs.com/package/can)'s `dist` folder.  Install
the `can` package like:

```
> npm install can --save
```

You'll find these files in `node_modules/can/dist`.

These files are also available in the `canjs` bower package.  Install `canjs` like:

> bower install canjs --save

You'll find these files in `bower_components/can/dist`.

The following section contains quick how to load CanJS with a `<script>` tag using
these files for each library it supports.

### jQuery

CanJS supports jQuery in the latest 1.X and 2.X version. Include jQuery before your CanJS jQuery build to get started:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js">
    </script>
    <script src="can.jquery.js"></script>
    <script>
      $(function() {
        // start using CanJS
        var Todo = can.Map.extend({
          ...
        });
      });
    </script>

### Building templates to production

CanJS can pre-compile [Stache](/docs/can.stache.html) views into JavaScript functions contained within a single file in order to avoid
additional requests for view files in production. When using
CanJS standalone use the [can-compile](https://github.com/daffl/can-compile) Node module. Install with

```
> npm install can-compile -g
```

And in your project root folder run:

```
> can-compile --out views.production.js
```

This will create `views.production.js` in the current folder containing all pre-compiled views. When loaded into your page CanJS will use the per-compiled views instead of making an Ajax request to retrieve them.


## Script tags with the download builder

The download builder on the homepage lets you customize what modules are included in a global
script.  After downloading that script, the use of that script is just like [loading CanJS with script tag using the zip download](#section_ScripttagsfromNPM_theDownload_orBower).
