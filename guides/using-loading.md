@page using-loading Loading
@parent Using 1

There are several ways to load CanJS in your application. Most likely you will use one of the pre-built versions like `can.jquery.js` but it is also possible to load each module individually using AMD or Steal.

## In a `<script>` tag

The most common way of using CanJS is the core builds from the download (or download builder) included in a `<script>` tag. The following section contains quick instructions how to load CanJS for each library it supports.

### jQuery

CanJS supports jQuery in the latest 1.X and 2.0 version. Include jQuery before your CanJS jQuery build to get started:

    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js">
    </script>
    <script src="can.jquery.js"></script>
    <script>
      $(function() {
        // start using CanJS
        var Todo = can.Model.extend({
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
        var Todo = can.Model.extend({
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
      var Todo = can.Model.extend({
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
      var Todo = can.Model({
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
        Todo = can.Model({
          ...
        });
      });
      // CanJS with support for IE7 and other browsers without querySelectorAll
      YUI({ loadOptional: true }).use('can', function(Y) {
        // start using CanJS
        Todo = can.Model({
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


## AMD

The [CanJS Download](../download.html) contains an `amd/` folder which allows you to load any CanJS component and plugin using an AMD module loader like [RequireJS](http://requirejs.org/). Unlike many other JavaScript libraries CanJS is fully modular and loading a dependency will only include the modules actually used (for example, `can/control` will only load `can/construct` and `can/util`). The `amd-dev/` folder contains the same files but with debugging message enabled which can be very helpful during development.

### Configuration

The default library used with AMD modules is jQuery. CanJS will reference the `jquery` module so that name needs to point to your jQuery source and the `can` module name needs to be mapped to the `amd/` folder of the CanJS download.

### RequireJS

In RequireJS a simple configuration looks like this:

    <script type="text/javascript" src="require.js"></script>
    <script type="text/javascript">
      require.config({
        paths : {
          "jquery" : "http://code.jquery.com/jquery-2.0.3",
          "can": "path/to/can/amd"
        }
      });

      require(['can/control', 'can/view/mustache'], function(Control, can) {
        // Use Mustache and Control
        var MyControl = Control.extend({
          init: function() {
            this.element.html(can.view('path/to/view.mustache', this.options));
          }
        });
      });
    </script>

The `can` module is a shortcut that loads CanJS's core plugins and returns the `can` namespace:

    require(['can'], function(can) {
      // Use can.Control, can.view, can.Model etc.
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

### Using other libraries

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


## StealJS

StealJS is the dependency manager that comes with [JavaScriptMVC](http://javascriptmvc.com) and that is natively used by CanJS.
Since JavaScriptMVC comes with CanJS and Steal, the easiest way to use them together is by [downloading JavaScriptMVC](http://javascriptmvc.com/dist/javascriptmvc-3.3.zip). You can also use the `steal/` folder from the CanJS download or Bower package.

With the JavaScriptMVC download, in the main folder, you can simply run the application generator:

> ./js jmvc/generate/app app

In `app/app.js` you should see something like:

    steal(
        './app.less',
        './models/fixtures/fixtures.js',
    function(){

    })

This file will be loaded when opening `app/index.html` and you are ready to use CanJS with StealJS and make [using-production production builds].
For more information follow up in the [JavaScriptMVC documentation](http://javascriptmvc.com/docs).
