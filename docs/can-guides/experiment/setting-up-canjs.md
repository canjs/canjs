@page guides/setup Setting up CanJS
@parent guides/getting-started 0
@outline 2

@description Get started with CanJS by installing it with [npm](https://www.npmjs.com/), using a [JS&nbsp;Bin](https://jsbin.com/about), or just adding it to an HTML page with a `<script>` tag.

@body

You can download CanJS from npm or a CDN. We recommend using npm. If you don’t already have Node.js and npm, [learn how to install both on npm’s website](https://docs.npmjs.com/getting-started/installing-node).

Once downloaded or installed, you can load CanJS in a variety of ways:

 - StealJS
 - Browserify
 - `<script>` tags

This guide shows how to setup common combinations.  If you don’t see yours, please
ask on the [forums](http://forums.donejs.com/c/canjs) or [Gitter chat](https://gitter.im/canjs/canjs).

## JS Bin

Use this JS Bin to play around with CanJS:

<a class="jsbin-embed" href="//jsbin.com/safigic/7/embed?html,js,output">CanJS on jsbin.com</a><script src="//static.jsbin.com/js/embed.min.js?3.40.2"></script>

It uses `can.all.js` so you have the [can-core core], [can-ecosystem ecosystem], and [can-infrastructure infrastructure] modules available to you.

## StealJS and npm

Install [can-core CanJS’s core modules] and StealJS with npm:

```
npm install can-component can-compute can-connect can-define can-route can-route-pushstate can-set can-stache can-stache-bindings --save
npm install steal steal-stache --save
```

Next, create a `main.stache` template for your app:

```
<!-- main.stache -->
<h1>{{message}}</h1>
```

Next, create a `main` module for your application. Import [can-define/map/map] and your template to say “Hello World”:

```
// main.js
import DefineMap from "can-define/map/map";
import template from "./main.stache!";

var data = new DefineMap({message: "Hello World"});

document.body.appendChild(template(data));
```

Finally, create a page that loads `steal.js` and specifies `main` as the main module:

```
<html>
  <body>
    <script src="./node_modules/steal/steal.js" data-main="main"></script>
  </body>
</html>
```

StealJS supports “modlet” module names that end with `/`.  This means that the above could
also be written like:

```
// main.js
import DefineMap from "can-define/map/";
import template from "./main.stache!";

var data = new DefineMap({message: "Hello World"});

document.body.appendChild(template(data));
```
@highlight 2-2

Besides ES6 modules, StealJS supports AMD and CommonJS.  You could also write `main.js` like:

```
// main.js
var DefineMap = require("can-define/map/map");
var template = require("./main.stache!");

var data = new DefineMap({message: "Hello World"});

document.body.appendChild(template(data));
```
@highlight 2-3

__Note:__ if you see dozens of errors in your console, you may need to set `system.npmAlgorithm` to `flat` in your `package.json` (see the [Steal docs](https://stealjs.com/docs/StealJS.quick-start.html#section_Setup) for more info).

### Building for production

StealJS’s [Moving to Production](https://stealjs.com/docs/StealJS.moving-to-prod.html)
guide has instructions for how to create a production build.

## webpack and npm

Install [can-core CanJS’s core modules] and webpack (with `raw-loader`) with npm:

```
npm install can-component can-compute can-connect can-define can-route can-route-pushstate can-set can-stache can-stache-bindings --save
npm install webpack raw-loader --save-dev
```

Next, create a `main.stache` template for your app:

```
<!-- main.stache -->
<h1>{{message}}</h1>
```

Next, create a `main` module for your application. Import [can-define/map/map], [can-stache], and your template to say “Hello World”:

```
// main.js
var DefineMap = require("can-define/map/map");
var stache = require("can-stache");

var data = new DefineMap({message: "Hello World"});
var template = stache(require('raw-loader!./main.stache'));

document.body.appendChild(template(data));
```

Next, run webpack from the command line:

```
./node_modules/webpack/bin/webpack.js main.js bundle.js
```

Finally, create a page that loads `bundle.js`:

```
<html>
  <body>
    <script src="./bundle.js" type="text/javascript"></script>
  </body>
</html>
```

## Browserify and npm

CanJS works with Browserify. Install [can-core CanJS’s core modules] and Browserify (with `stringify`) with npm:

```
npm install can-component can-compute can-connect can-define can-route can-route-pushstate can-set can-stache can-stache-bindings --save
npm install browserify stringify --save-dev
```

Next, create a `main.stache` template for your app:

```
<!-- main.stache -->
<h1>{{message}}</h1>
```

Next, create a `main.js` file for your application. Import [can-define/map/map], [can-stache], and your template to say “Hello World”:

```
// main.js
var DefineMap = require("can-define/map/map");
var stache = require("can-stache");

var data = new DefineMap({message: "Hello World"});
var template = stache(require("./main.stache"));

document.body.appendChild(template(data));
```

Next, change your `package.json` to include the required `stringify` configuration:

```
{
  ...
  "devDependencies": {
    "browserify": "^13.1.1",
    "stringify": "^5.1.0"
  },
  "stringify": {
    "appliesTo": { "includeExtensions": [".stache"] }
  }
}
```
@highlight 7-9

Next, run Browserify from the command line:

```
./node_modules/browserify/bin/cmd.js -t stringify main.js > bundle.js
```

Finally, create a page that loads `bundle.js`:

```
<html>
  <body>
    <script src="./bundle.js" type="text/javascript"></script>
  </body>
</html>
```

## RequireJS

RequireJS is no longer supported. If you would like to [guides/contributing/code contribute] the code required for AMD, please look at [this issue](https://github.com/canjs/canjs/issues/2646).

## Script tags

### npm

You can install CanJS with npm:

```
npm install can --save
```

The `node_modules/can/dist/global/` directory will include two files:
- `can.all.js`: includes the [can-core core], [can-ecosystem ecosystem], and [can-infrastructure infrastructure] modules
- `can.js`: includes the [can-core core] and [can-infrastructure infrastructure] modules

With `can` installed, you can use it in an HTML page with a `<script>` tag:

    <html>
    <head>
        <title>CanJS</title>
    </head>
    <body>
        <script src="./node_modules/can/dist/global/can.all.js"></script>
        <script type='text/stache' id='app'>
        	<hello-world/>
        </script>

        <script type="text/javascript">
            can.Component.extend({
	            tag: 'hello-world',
	            view: can.stache("<h1>{{message}}</h1>"),
	            ViewModel: can.DefineMap.extend({
		            message: {
		                type: 'string',
		                value: 'Hello world'
	                }
	            })
            });
            document.body.appendChild(
	            can.stache.from("app")()
            );
        </script>
    </body>
    </html>
@highlight 6-6

### CDN

Another quick way to start locally is by loading CanJS from a CDN:

    <html>
    <head>
        <title>CanJS</title>
    </head>
    <body>
        <script src="https://unpkg.com/can@3/dist/global/can.all.js"></script>
        <script type='text/stache' id='app'>
        	<hello-world/>
        </script>

        <script type="text/javascript">
            can.Component.extend({
	            tag: 'hello-world',
	            view: can.stache("<h1>{{message}}</h1>"),
	            ViewModel: can.DefineMap.extend({
		            message: {
		                type: 'string',
		                value: 'Hello world'
	                }
	            })
            });
            document.body.appendChild(
	            can.stache.from("app")()
            );
        </script>
    </body>
    </html>
@highlight 6-6

## A note on Promises

CanJS uses native [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), which means you might see the following error in Internet Explorer 9 or later:

```
'Promise' is undefined
```

You must include a Promise polyfill if you’re targeting browsers that do not have [native support](https://caniuse.com/#feat=promises). If you’re using [StealJS](https://stealjs.com/), [a Promise polyfill](https://github.com/stefanpenner/es6-promise) is included for you.
