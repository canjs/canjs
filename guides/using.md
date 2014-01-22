@page Using Using CanJS
@parent guides 2

CanJS can be used with [jQuery](#section_jQuery), [Dojo](#section_Dojo), [Mootools](#section_Mootools), [YUI](#section_YUI) and [Zepto](#section_Zepto). You can either include it as an inline script or load it as an [AMD](#section_AMD) module with any of these libraries.

<h2 id="AMD">AMD</h2>

The [CanJS Download](../download.html) contains an `amd` folder which allows
you to load any CanJS component and plugin using an AMD module loader like [RequireJS](http://requirejs.org/).
jQuery will be the default library so make sure the `jquery` module id points to the jQuery source.
Here is an example for jQuery and RequireJS:

@codestart
&lt;script type="text/javascript" src="require.js">&lt;/script>
&lt;script type="text/javascript">
  require.config({
    paths : {
      "jquery" : "http://code.jquery.com/jquery-1.8.2"
    }
  });

  require(['can/view/ejs', 'can/control'], function(can) {
    // Use EJS and Control
  });
&lt;/script>
@codeend

The `can` module is a shortcut that loads CanJS's core plugins (Construct, Control, route, Model, view, and EJS)
and returns the `can` namespace.

@codestart
require(['can'], function(can) {
  // Use can.Control, can.view, can.Model etc.
});
@codeend

If you would like to use another library, map the `can/util/library` module to `can/util/dojo`, `can/util/zepto`,
`can/util/yui` or `can/util/mootools`.

With RequireJS and Zepto, it loks like this:

@codestart
require.config({
  map : {
    '*' : {
		  "can/util/library" : "can/util/zepto"
  	}
  },
  paths: {
    "zepto" : "http://cdnjs.cloudflare.com/ajax/libs/zepto/1.0rc1/zepto.min"
  }
});
@codeend

<h2 id="jQuery">jQuery</h2>

CanJS supports jQuery 1.8+. Include a copy of jQuery along with CanJS to get started.

@codestart
&lt;script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.js">
&lt;/script>
&lt;script src="can.jquery.js">&lt;/script>
&lt;script>
  // start using CanJS
  can.Model('Todo', {
    ...
  });
&lt;/script>
@codeend

CanJS supports binding to any jQuery objects (like jQuery UI widgets) that use standard
jQuery events. The jQuery UI Datepicker doesn't have built-in support for standard
jQuery events, so for those cases, a workaround should be applied:

@codestart
&lt;script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.js">
&lt;/script>
&lt;script src="jquery.ui.core.js">&lt;/script>
&lt;script src="jquery.ui.datepicker.js">&lt;/script>
&lt;script src="can.jquery.js">&lt;/script>
&lt;script>
  // create models
  Todo = can.Model({ ... });
  Todo.List = can.Model.List({ ... });

  // create control
  Todos = can.Control({
    // listen to the calendar widget's datepickerselect event
    '{calendar} datepickerselect': function(calendar, ev){
      // do something with the selected date
      var selectedDate = this.options.calendar.datepicker('getDate');
      ...
    }
  });

  // Initialize the app
  Todo.findAll({}, function(todos) {
    new Todos('#todoapp', {
      todos: todos,
      calendar: $('#calendar').hide().datepicker({
        // Adding a workaround for date selection since the
        // jQuery UI datepicker widget doesn't fire the
        // "datepickerselect" event
        onSelect: function(dateText, datepicker) {
          $(this).trigger({
            type: 'datepickerselect',
            text: dateText,
            target: datepicker
          });
        }
      })
    });
  });
&lt;/script>
@codeend

<h2 id="Dojo">Dojo</h2>

CanJS supports Dojo 1.8+ using its new AMD loader in asynchronous or synchronous mode. Everything described in the [using CanJS and AMD](#section_AMD) section applies to Dojo as well. An example configuration that uses the AMD files from the CanJS CDN can look like this:

@codestart
require({
    aliases:[
        ['can/util/library', 'can/util/dojo']
    ],
    baseUrl : 'http://canjs.com/release/latest/amd/can.js',
});

require(['can/control'], function(Control) {
  // Use Control
});
@codeend

<h2 id="Mootools">Mootools</h2>

CanJS supports Mootools 1.4+. Include a copy of Mootools Core along with CanJS to get started.

Mootools Core has an issue where __focus__ and __blur__ events are not fired for delegate event listeners.
Include Mootools More's Event.Pseudos module for __focus__ and __blur__ support.

@codestart
&lt;script src="https://ajax.googleapis.com/ajax/libs/mootools/1.4.5/
mootools.js">&lt;/script>
&lt;!-- Mootools More Event.Pseudos module -->
&lt;script src="mootools-more-event_pseudos-1.4.0.1.js">&lt;/script>
&lt;script src="can.mootools.js">&lt;/script>
&lt;script>
  // start using CanJS
  Todo = can.Model({
    ...
  });
&lt;/script>
@codeend

<h2 id="YUI">YUI</h2>

CanJS supports YUI 3.4+ with both dynamically or statically loaded modules.
CanJS depends on the following YUI modules: __node__, __io-base__, __querystring__, __event-focus__, and __array-extras__. The __selector-css2__ and __selector-css3__ YUI modules are optional, but necessary for IE7 and other browsers that don't support __querySelectorAll__.

To use with dynamically loaded modules, include the YUI loader along with CanJS.
Add `'can'` to your normal list of modules with `YUI().use('can', ...)` wherever CanJS will be used.

@codestart
&lt;script src="http://yui.yahooapis.com/3.4.1/build/yui/yui-min.js">&lt;/script>
&lt;script src="can.yui.js">&lt;/script>
&lt;script>
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
&lt;/script>
@codeend

To use with statically loaded modules, include a static copy of YUI (with the
previously mentioned YUI dependencies) along with CanJS. CanJS will automatically
be included wherever `YUI().use('*')` is used.

@codestart`
&lt;!-- YUI Configurator: http://yuilibrary.com/yui/configurator/ -->
&lt;script src="http://yui.yahooapis.com/combo?3.7.3/build/yui-base/yui-base-min.
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
-focus-min.js">&lt;/script>
&lt;script src="can.yui.js">&lt;/script>
&lt;script>
    // start using CanJS
    Todo = can.Model({
      ...
    });
&lt;/script>
@codeend

CanJS can also bind to YUI widget events. The following example shows how to
bind to the __selectionChange__ event for a YUI Calendar widget:

@codestart
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
@codeend

<h2 id="Zepto">Zepto</h2>

CanJS supports Zepto 0.8+. Include a copy of Zepto along with CanJS to get started.

Zepto 0.8 has an issue where __focus__ and __blur__ events are not fired for delegate event listeners.
There is a fix included for Zepto > 0.8, but you can apply
[this patch](https://github.com/madrobby/zepto/commit/ab2a3ef0d18beaf768903f0943efd019a29803f0)
to __zepto.js__ when using Zepto 0.8.

@codestart
&lt;!-- Zepto 0.8 with focus/blur patch applied -->
&lt;script src="zepto.0.8-focusblur.js">&lt;/script>
&lt;script src="can.zepto.js">&lt;/script>
&lt;script>
  // start using CanJS
  Todo = can.Model({
    ...
  });
&lt;/script>
@codeend