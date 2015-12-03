@page Using Setting up CanJS
@parent guides 2
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

<a class="jsbin-embed" href="http://jsbin.com/venaje/embed?html,js,output">JS Bin on jsbin.com</a><script src="http://static.jsbin.com/js/embed.min.js?3.35.5"></script>

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

### Building to production



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
        // Use Mustache and Control
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


### Dojo

The configuration for Dojo is similar but `can/util/library` needs to be mapped to `can/util/dojo`:

    <script src="//ajax.googleapis.com/ajax/libs/dojo/1.8.3/dojo/dojo.js">
    </script>
    <script src="can.dojo.js"></script>
    <script>
      require({
        aliases : [
          ['can/util/library', 'can/util/dojo']
        ],
        paths : {
          can: 'path/to/can/amd'
        }
      });

      require(['can/control'], function(Control) {
        // Use Control
      });
    </script>

### Other libraries

If you would like to use another library, map the `can/util/library` module to `can/util/zepto`,
`can/util/yui` or `can/util/mootools`.

With RequireJS and Zepto, it loks like this:

    require.config({
      paths : {
        "can": "path/to/can/amd",
        "zepto" : "http://cdnjs.cloudflare.com/ajax/libs/zepto/1.0rc1/zepto.min"
      },
      map : {
        '*' : {
          "can/util/library" : "can/util/zepto"
        }
      }
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


### Zepto

CanJS supports Zepto 0.9+. Include a copy of Zepto along with CanJS to get started.

    <!-- Zepto 0.8 with focus/blur patch applied -->
    <script src="http://zeptojs.com/zepto.js"></script>
    <script src="can.zepto.js"></script>
    <script>
      $(function() {
        // start using CanJS
        var Todo = can.Map.extend({
          ...
        });
      });
    </script>


### Dojo

You can also use the [Dojo base download](http://dojotoolkit.org/download/) and simply include it alongside CanJS:

    <script src="//ajax.googleapis.com/ajax/libs/dojo/1.8.3/dojo/dojo.js">
    </script>
    <script src="can.dojo.js"></script>
    <script>
      // start using CanJS
      var Todo = can.Map.extend({
        ...
      });
    </script>

### Mootools

CanJS supports Mootools 1.4+. Include a copy of [Mootools Core](http://mootools.net/download) along with CanJS to get started.

Mootools Core has an issue where __focus__ and __blur__ events are not fired for delegate event listeners.
Include Mootools More's Event.Pseudos module for __focus__ and __blur__ support.

    <script src="https://ajax.googleapis.com/ajax/libs/mootools/1.4.5/
    mootools.js"></script>
    <!-- Mootools More Event.Pseudos module -->
    <script src="mootools-more-event_pseudos-1.4.0.1.js"></script>
    <script src="can.mootools.js"></script>
    <script>
      // start using CanJS
      var Todo = can.Map.extend({
        ...
      });
    </script>


### YUI

CanJS supports YUI 3.4+ with both dynamically or statically loaded modules.
CanJS depends on the following YUI modules: __node__, __io-base__, __querystring__, __event-focus__, and __array-extras__. The __selector-css2__ and __selector-css3__ YUI modules are optional, but necessary for IE7 and other browsers that don't support __querySelectorAll__.

To use with dynamically loaded modules, include the YUI loader along with CanJS.
Add `'can'` to your normal list of modules with `YUI().use('can', ...)` wherever CanJS will be used.

    <script src="http://yui.yahooapis.com/3.4.1/build/yui/yui-min.js"></script>
    <script src="can.yui.js"></script>
    <script>
      // CanJS with support for modern browsers
      YUI().use('can', function(Y) {
        // start using CanJS
        Todo = can.Map.extend({
          ...
        });
      });
      // CanJS with support for IE7 and other browsers without querySelectorAll
      YUI({ loadOptional: true }).use('can', function(Y) {
        // start using CanJS
        Todo = can.Map.extend({
          ...
        });
      });
    </script>

To use with statically loaded modules, include a static copy of YUI (with the
previously mentioned YUI dependencies) along with CanJS. CanJS will automatically
be included wherever `YUI().use('*')` is used.

    <!-- YUI Configurator: http://yuilibrary.com/yui/configurator/ -->
    <script src="http://yui.yahooapis.com/combo?3.7.3/build/yui-base/yui-base-min.
    js&3.7.3/build/oop/oop-min.js&3.7.3/build/event-custom-base/event-custom-base-
    min.js&3.7.3/build/features/features-min.js&3.7.3/build/dom-core/dom-core-min.
    js&3.7.3/build/dom-base/dom-base-min.js&3.7.3/build/selector-native/selector-n
    ative-min.js&3.7.3/build/selector/selector-min.js&3.7.3/build/node-core/node-c
    ore-min.js&3.7.3/build/node-base/node-base-min.js&3.7.3/build/event-base/event
    -base-min.js&3.7.3/build/event-delegate/event-delegate-min.js&3.7.3/build/node
    -event-delegate/node-event-delegate-min.js&3.7.3/build/pluginhost-base/pluginh
    ost-base-min.js&3.7.3/build/pluginhost-config/pluginhost-config-min.js&3.7.3/b
    uild/node-pluginhost/node-pluginhost-min.js&3.7.3/build/dom-style/dom-style-mi
    n.js&3.7.3/build/dom-screen/dom-screen-min.js&3.7.3/build/node-screen/node-scr
    een-min.js&3.7.3/build/node-style/node-style-min.js&3.7.3/build/querystring-st
    ringify-simple/querystring-stringify-simple-min.js&3.7.3/build/io-base/io-base
    -min.js&3.7.3/build/array-extras/array-extras-min.js&3.7.3/build/querystring-p
    arse/querystring-parse-min.js&3.7.3/build/querystring-stringify/querystring-st
    ringify-min.js&3.7.3/build/event-custom-complex/event-custom-complex-min.js&3.
    4.1/build/event-synthetic/event-synthetic-min.js&3.7.3/build/event-focus/event
    -focus-min.js"></script>
    <script src="can.yui.js"></script>
    <script>
        // start using CanJS
        Todo = can.Model({
          ...
        });
    </script>

CanJS can also bind to YUI widget events. The following example shows how to
bind to the __selectionChange__ event for a YUI Calendar widget:

    YUI().use('can', 'calendar', function(Y) {
      // create models
      Todo = can.Model({ ... });
      Todo.List = can.Model.List({ ... });
      // create control
      Todos = can.Control({
        // listen to the calendar widget's selectionChange event
        '{calendar} selectionChange': function(calendar, ev){
          // do something with the selected date
          var selectedDate = ev.newSelection[0];
          ...
        }
      });
      // initialize the app
      Todo.findAll({}, function(todos) {
        new Todos('#todoapp', {
          todos: todos,
          calendar: new Y.Calendar({
            contentBox: "#calendar"
          }).render()
        });
      });
    });

### Building templates to production

CanJS can pre-compile [EJS](/docs/can.ejs.html), [Mustache](/docs/can.mustache.html),
and [Stache](/docs/can.stache.html) views into JavaScript functions contained within a single file in order to avoid 
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
