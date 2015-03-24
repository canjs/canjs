@page Why Why CanJS?
@parent guides 1

@body
<h2 id="Flexible">Flexible</h2>

Your library should not break-down as your application and organization grow and technologies change. CanJS’s flexibility will keep it valuable to you far into the future.

### Supports multiple libraries and frameworks

Want to share code between a Zepto mobile app and a jQuery desktop app? No problem. CanJS code (especially models) can be shared across libraries, and so can skill sets! Working on a Dojo project today and a YUI one tomorrow? Don’t throw away all of your skills.

### Designed for plugins

CanJS is extracted from [JavaScriptMVC](http://javascriptmvc.com/), but currently supports almost all of its MVC functionality through plugins. Start small, with its basic functionality, and extend it with [plugins](http://canjs.com/#plugins) that handle things like:

* setters
* serialization / deserialization
* jQuery plugin generation
* validations
* calling super methods

These plugins have forced the core to be quite extendable, making 3rd party plugin development easy.

### Engineered limber

CanJS’s tools are designed to work under almost every situation. Your server sends back XML with strange urls? That’s ok, overwrite [can.Model.findAll](../docs/can.Model.static.findAll.html) or [can.Model.models](../docs/can.Model.static.models.html). Want some special teardown code for a control? Overwrite [can.Control:destroy](../docs/can.Control.prototype.destroy.html).

But our favorite bit of flexibility is how [can.Observe](../docs/can.Observe.html) works with nested data. It converts nested objects into observes automatically. For example:

@codestart
var person = new can.Observe({
  name: { first: 'Justin', last: 'Meyer' },
  hobbies: [ 'programming', 'party rocking' ]
})

person.attr( 'name.first' ) //-> 'Justin'
person.attr( 'hobbies.0' ) //-> 'programming'
@codeend

But most important, `change` events bubble, letting observes listen for when a nested property changes:

@codestart
person.bind( 'change', function( ev, attr, how, newVal, oldVal ) {
  attr   //-> 'name.last'
  how    //-> 'set'
  newVal //-> 'Meyer'
  oldVal //-> 'Myer'
});

person.attr( 'name.last', 'Meyer' );
@codeend

<h2 id="Powerful">Powerful</h2>

### Safety

Memory safety is really important, especially in long-lived, dynamic pages. CanJS combats this menace in two important and unique ways:

#### Controls that unbind event handlers auto-magically

Using templated event binding, Controls can listen to events on objects other than their element. For example, a tooltip listening to the window looks like:

@codestart
var Tooltip = can.Control.extend({
  '{window} click': function( el, ev ) {
    // hide only if we clicked outside the tooltip
    if (!this.element.has( ev.target ) {
      this.element.remove();
    }
  }
})

// create a Tooltip
var tooltipElement = $( '&lt;div>INFO&lt;/div>' ).appendTo( el )
var tooltipInstance = new Tooltip( tooltipElement );
@codeend

`window` now has a reference to the control which keeps the `tooltipInstance` and everything the tooltip instance might reference in memory. CanJS overwrites each library’s element remove functionality to [destroy](../docs/can.Control.prototype.destroy.html) controls. Destroying a control unbinds all of its event handlers, removing any memory leaks auto-magically.

#### A model store that does not leak

It’s relatively common to load the same model instance multiple times on a single page. For example, an app might request todos due today and high-priority todos and render them like:

@codestart
can.view( 'todosList.ejs', {
  todaysTodos: Todo.findAll( { due: 'today' } ),
  criticalTodos: Todo.findAll( { type: 'critical' } )
}).then(function( frag ) {
  $( '#todos' ).html( frag );
})
@codeend

`todosList.ejs` might look like:

@codestart
&lt;h2>Due Today&lt;/h2>
&lt;% list( todaysTodos, function( todo ) { %>
  &lt;li &lt;%= (el) -> el.data( 'todo', todo ) %>>
    &lt;%= todo.attr( 'name' ) %>
  &lt;/li>
&lt;% } ) %>
&lt;h2>Critical Todos</h2>
&lt;% list( criticalTodos, function( todo ) { %>
  &lt;li <%= (el) -> el.data( 'todo', todo ) %>>
    &lt;%= todo.attr( 'name' ) %>
  &lt;/li>
&lt;% } ) %>
@codeend

If the result for of `Todo.findAll( { due: 'today' } )` and `Todo.findAll( { type: 'critical' } )` both share a todo instance like:

@codestart
{ 
	"id" : 5, 
	"name" : "do dishes",
	"due" : "today",
	"type" : "critical"
}
@codeend

[Models can.Model] knows that this data represents the same todo and only creates one instance. This means that a single model instance is in both lists. By changing the todo’s name or destroying it, both lists will be changed.

However, model only stores these model instances while something is binding to them. Once nothing is bound to the model instance, they are removed from the store, freeing their memory for garbage collection.

### Ease of use

This site highlights the most important features of CanJS. The library comes with thorough documentation and examples on the [CanJS documentation page](/docs). There are example apps for each library and several example for jQuery.

CanJS is also supported by [Bitovi](http://bitovi.com/). We are extremely active on the [forums](https://forum.javascriptmvc.com/#Forum/canjs). And should the need arise, we provide support, training, and development.

<h2 id="Fast">Fast</h2>

### Size

On top of jQuery, CanJS is ~20KB. Here’s some other frameworks for comparison:

* Backbone 8.97KB (with Underscore.js)
* Angular 24KB
* Knockout 13KB
* Ember 37KB
* Batman 15KB

Size is not everything. It really is what’s inside that counts. And that’s where we think CanJS really delivers a lot of bang for your buck.


### Speed

The importance of performance is almost impossible to exaggerate. CanJS’s guts are highly optimized. See how:

#### Control initialization

[Controls can.Control] pre-processes event handlers so binding is super fast. Compare [initializing a can.Control, Backbone.View and Ember.View tabs](http://jsperf.com/tabs-timing-test/7) widget:
[![Control performance](http://bitovi.com/images/introducing-canjs/performance_control.png)](http://jsperf.com/tabs-timing-test/7)

#### Tabs initialization performance

This makes a big difference for page initialization if your site has lots of controls.

#### Live binding

CanJS’s live-binding is very fast. It only updates what’s necessary when it’s necessary. Compare its [template rendering performance with three other common MVC frameworks](http://jsperf.com/canjs-ejs-performance/5):
[![Live binding performance](http://bitovi.com/images/introducing-canjs/performance_livebind.png)](http://jsperf.com/canjs-ejs-performance/5)

In this test, CanJS has the fastest live-binding. Backbone and YUI are not doing live-binding, but CanJS is still the fastest.

In the [popular counting circle example](http://jsfiddle.net/JMWf4/47/), Knockout visually appears the fastest, followed by CanJS.

This means that CanJS and Knockout are slightly faster at different things, but are likely tied for the fastest live-binding libraries.

_Note: AngularJS throttles updates, which means it doesn’t fit well with these tests._

#### Model and view deferred support for parallel loading

[Deferreds Deferreds] are simply awesome for handling asynchronous behavior. [Models can.Model] produces deferreds and [can.view](../docs/can.view.html) consumes them. With the view modifiers plugin, you can load a template and its data in parallel and render it into an element with:

@codestart
$( '#todos' ).html( 'todos.ejs', Todo.findAll() );
@codeend

Hot. You can do this without the view modifiers plugin like:

@codestart
can.view( 'todos.ejs', Todo.findAll() ).then(function( frag ) {
  $( '#todos' ).html( frag );
})
@codeend

#### Opt-in data binding

Although [EJS can.ejs’s] live-binding is super fast, setting up live data binding can be too slow in certain situations (like rendering a list of 1000 items). EJS’s live binding is opt-in. It only turns on if you are using the `attr` method. If the following template binds to a `todo`'s `name` …

@codestart
&lt;li> &lt;%= todo.attr('name') %> &lt;/li>
@codeend

… the following doesn’t setup live-binding and renders much faster …

@codestart
&lt;li> &lt;%= todo.name %> &lt;/li>
@codeend


