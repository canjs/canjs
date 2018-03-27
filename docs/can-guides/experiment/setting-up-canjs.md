@page guides/setup Setting up CanJS
@parent guides/getting-started 1
@outline 2

@description Get started with CanJS by installing it with [https://www.npmjs.com/ npm], using a [https://jsbin.com/about JS Bin], or just adding it to an HTML page with a `<script>` tag.

@body

You can download CanJS from npm or a CDN. We recommend using npm. If you don’t already have Node.js and npm, [learn how to install both on npm’s website](https://docs.npmjs.com/getting-started/installing-node).

Once downloaded or installed, you can load CanJS in a variety of ways:

 - StealJS
 - Browserify
 - `<script>` tags

This guide shows how to setup common combinations.  If you don’t see yours, please
ask on the [forums](https://forums.donejs.com/c/canjs) or [Gitter chat](https://gitter.im/canjs/canjs).

## JS Bin

Use this JS Bin to play around with CanJS:

<a class="jsbin-embed" href="https://jsbin.com/lewaqih/3/embed?html,js,output">CanJS on jsbin.com</a>
<script src="https://static.jsbin.com/js/embed.min.js?4.0.4"></script>

It uses `can.all.js` so you have the [can-core core], [can-ecosystem ecosystem], and [can-infrastructure infrastructure] modules available to you.

## StealJS and npm

> Get started with CanJS and [StealJS](https://stealjs.com) by [cloning this example repo on GitHub](https://github.com/canjs/stealjs-example).

Install [can-core CanJS’s core modules] and StealJS with npm:

```
npm install can-component can-connect can-define can-route can-route-pushstate can-set can-stache can-stache-bindings --save
npm install steal steal-stache --save
```

Next, add the following [configuration](https://stealjs.com/docs/StealJS.configuration.html) to your `package.json`:

```
{
    ...
    "steal": {
    ...
        "plugins": [
            "steal-stache"
        ]
    }
}
```

Next, create a `main.stache` template for your app:

```html
<!-- main.stache -->
<h1>{{message}}</h1>
```

Next, create a `main` module for your application. Import [can-define/map/map] and your template to say “Hello World”:

```js
// main.js
import DefineMap from "can-define/map/map";
import template from "./main.stache!";

const data = new DefineMap({message: "Hello World"});

document.body.appendChild(template(data));
```

Finally, create a page that loads `steal.js` and specifies `main` as the main module:

```html
<html>
  <body>
    <script src="./node_modules/steal/steal.js" data-main="main"></script>
  </body>
</html>
```

StealJS supports “modlet” module names that end with `/`.  This means that the above could
also be written like:

```js
// main.js
import DefineMap from "can-define/map/";
import template from "./main.stache!";

const data = new DefineMap({message: "Hello World"});

document.body.appendChild(template(data));
```
@highlight 2-2

Besides ES6 modules, StealJS supports AMD and CommonJS.  You could also write `main.js` like:

```js
// main.js
import DefineMap from "can-define/map/map";
import template from "./main.stache!";

const data = new DefineMap({message: "Hello World"});

document.body.appendChild(template(data));
```
@highlight 2-3

__Note:__ if you see dozens of errors in your console, you may need to set `system.npmAlgorithm` to `flat` in your `package.json` (see the [Steal docs](https://stealjs.com/docs/StealJS.quick-start.html#section_Setup) for more info).

### Building for production

StealJS’s [Moving to Production](https://stealjs.com/docs/StealJS.moving-to-prod.html)
guide has instructions for how to create a production build.

## webpack and npm

> Get started with CanJS and [webpack](https://webpack.js.org) by [cloning this example repo on GitHub](https://github.com/canjs/webpack-example).

Install [can-core CanJS’s core modules] and webpack (with `raw-loader`) with npm:

```
npm install can-component can-connect can-define can-route can-route-pushstate can-set can-stache can-stache-bindings --save
npm install webpack raw-loader --save-dev
```

Next, create a `main.stache` template for your app:

```html
<!-- main.stache -->
<h1>{{message}}</h1>
```

Next, create a `main` module for your application. Import [can-define/map/map], [can-stache], and your template to say “Hello World”:

```js
// main.js
import DefineMap from 'can-define/map/map';
import stache from 'can-stache';
import rawTemplate from 'raw-loader!./main.stache';

const data = new DefineMap({message: "Hello World"});
const template = stache(rawTemplate);

document.body.appendChild(template(data));
```

Next, run webpack from the command line:

```
./node_modules/webpack/bin/webpack.js -d main.js -o dist/bundle.js
```

Finally, create a page that loads `dist/bundle.js`:

```html
<html>
  <body>
    <script src="./dist/bundle.js" type="text/javascript"></script>
  </body>
</html>
```

Optionally you can use the `can` package, allowing [tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking). See the [guides/advanced-setup experimental guide] for how to do that.

## Browserify and npm

> Get started with CanJS and [Browserify](http://browserify.org) by [cloning this example repo on GitHub](https://github.com/canjs/browserify-example).

CanJS works with Browserify. Install [can-core CanJS’s core modules] and Browserify (with `babelify` and `stringify`) with npm:

```
npm install can-component can-connect can-define can-route can-route-pushstate can-set can-stache can-stache-bindings --save
npm install browserify stringify babelify babel-core babel-preset-env --save-dev
```

Next, create a `main.stache` template for your app:

```html
<!-- main.stache -->
<h1>{{message}}</h1>
```

Next, create a `main.js` file for your application. Import [can-define/map/map], [can-stache], and your template to say “Hello World”:

```js
// main.js
import DefineMap from "can-define/map/map";
import stache from "can-stache";
import rawTemplate from "./main.stache";

const data = new DefineMap({message: "Hello World"});
const template = stache(rawTemplate);

document.body.appendChild(template(data));
```

By default, Browserify works with CommonJS modules (with `require()` statements). To use it with ES6 modules (with `import` statements shown above), configure the `babelify` plugin in your `package.json`. We’ll also include the `stringify` configuration for loading [can-stache] templates:

```
{
  ...
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-preset-env": "^1.6.1",
    "babelify": "^8.0.0",
    "browserify": "^13.1.1",
    "stringify": "^5.1.0"
  },
  "stringify": {
    "appliesTo": { "includeExtensions": [".stache"] }
  },
  "browserify": {
    "transform": [
      [
        "babelify",
        {
          "presets": [
            "env"
          ]
        }
      ]
    ]
  }
}
```
@highlight 9-23

Next, run Browserify from the command line:

```
./node_modules/browserify/bin/cmd.js -t stringify -t babelify main.js > dist/bundle.js
```

Finally, create a page that loads `dist/bundle.js`:

```
<html>
  <body>
    <script src="./dist/bundle.js" type="text/javascript"></script>
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

```html
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
		                default: 'Hello world'
	                }
	            })
            });
            document.body.appendChild(
	            can.stache.from("app")()
            );
        </script>
    </body>
</html>
```
@highlight 6-6

### CDN

Another quick way to start locally is by loading CanJS from a CDN:

```html
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
		                default: 'Hello world'
	                }
	            })
            });
            document.body.appendChild(
	            can.stache.from("app")()
            );
        </script>
    </body>
</html>
```
@highlight 6-6

## A note on Promises

CanJS uses native [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), which means you might see the following error in older browsers:

```
'Promise' is undefined
```

You must include a Promise polyfill if you’re targeting browsers that do not have [native support](https://caniuse.com/#feat=promises). If you’re using [StealJS](https://stealjs.com/), [a Promise polyfill](https://github.com/stefanpenner/es6-promise) is included for you.
