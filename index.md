---
layout: default
---
# Welcome to CanJS!

CanJS is an MIT-licensed, client-side, JavaScript framework that makes building rich web applications easy.  It provides:

 - __[can.Construct](#can_construct)__  - inheritable constructor functions
 - __[can.Observe](#can_observe)__ - key-value binding
 - __[can.Model](#can_model)__ - observes connected to a RESTful JSON interface
 - __[can.view](#can_view)__ - template loading, caching, rendering
 - __[can.EJS](#can_ejs)__ - live binding templates
 - __[can.Control](#can_control)__ - declarative event bindings
 - __[can.route](#can_route)__ - back button and bookmarking support

It also includes a rich set of supported [extensions and plugins](#plugins). CanJS is better, faster, 
easier, smaller, library-er.  [Learn why](#why_canjs).

## Get Canned

CanJS's core supports jQuery, Zepto, Dojo, YUI and Mootools. Select your download
for the library you are using:

 - [can.jquery.js](https://github.com/downloads/jupiterjs/canjs/can.jquery.1.0b2.js) ([min](https://github.com/downloads/jupiterjs/canjs/can.jquery.1.0b2.min.js)) - 8.5k - [Annotated Source](http://donejs.com/can/docs/can.jquery.html)
 - [can.zepto.js](https://github.com/downloads/jupiterjs/canjs/can.zepto.1.0b2.js) ([min](https://github.com/downloads/jupiterjs/canjs/can.zepto.1.0b2.min.js)) - 10.2k - [Annotated Source](http://donejs.com/can/docs/can.zepto.html)
 - [can.dojo.js](https://github.com/downloads/jupiterjs/canjs/can.dojo.1.0b2.js) ([min](https://github.com/downloads/jupiterjs/canjs/can.dojo.1.0b2.min.js)) - 10.8k - [Annotated Source](http://donejs.com/can/docs/can.dojo.html)
 - [can.mootools.js](https://github.com/downloads/jupiterjs/canjs/can.mootools.1.0b2.js) ([min](https://github.com/downloads/jupiterjs/canjs/can.mootools.1.0b2.min.js)) - 10.7k - [Annotated Source](http://donejs.com/can/docs/can.mootools.html)
 - [can.yui.js](https://github.com/downloads/jupiterjs/canjs/can.yui.1.0b2.js) ([min](https://github.com/downloads/jupiterjs/canjs/can.yui.1.0b2.min.js)) - 10.2k - [Annotated Source](http://donejs.com/can/docs/can.yui.html)

This page walks through the basics of CanJS by building a 
small todo app with CanJS and jQuery. If you want to see a
fully functional version of this todo app in action, you can
[go to this jsfiddle and view the results and code.](http://jsfiddle.net/javascriptmvc/ADWhw/3/)

The [Use with other libraries](#use_with_other_libraries) 
section details the minor differences among use with other libraries.
The [Examples](#examples) section has other awesome examples of how you
can put CanJS to good use. There is also an [online test suite](http://ci.javascriptmvc.com/jobs/can/test/test.html).

## can.Construct `can.Construct( [classProperties,] [prototypeProperties] )`

Constructor functions made with [can.Construct](http://donejs.com/docs.html#!can.Construct) are used to create
objects with shared properties. It's used by both __can.Control__ and __can.Model__.

To create a constructor function of your own, call __can.Construct__ with the:

- __classProperties__ that are attached directly to the constructor, and
- instance __prototypeProperties__.

__can.Construct__ sets up the prototype chain so subclasses can be further 
extended and sub-classed as far as you like:


{% highlight javascript %}
var Todo = can.Construct({
  init: function(){},
  
  author: function() { ... },
  
  coordinates: function() { ... },
  
  allowedToEdit: function( account ) { 
    return true;
  }
});
  
var PrivateTodo = Todo({
  allowedToEdit: function( account ) {
    return account.owns( this );
  }
});
{% endhighlight %}

If only one set of properties is passed to __can.Construct__, it's assumed to 
be the prototype properties.

### init `new can.Construct( [args ...] )`

When a constructor is called with the `new` keyword, __can.Construct__ creates the instance and 
calls [can.Construct.prototype.init](http://donejs.com/docs.html#!can.Construct.prototype.init) with 
the arguments passed to `new Constructor(...)`.

{% highlight javascript %}
var Todo = can.Construct({
  init: function( text ) {
    this.text = text
  },
  read: function() {
    console.log( this.text );
  }
})
  
var todo = new Todo( 'Hello World' );
todo.read()
{% endhighlight %}

## can.Observe `new can.Observe( data )`

[can.Observe](http://donejs.com/docs.html#!can.Observe) provides the observable pattern for JavaScript Objects. It lets you:

 - Set and remove property values on objects.
 - Listen for property changes.
 - Work with nested properties.

To create an observable object, use `new can.Observe( [data] )` like:

{% highlight javascript %}
var paginate = new can.Observe( { offset: 0, limit: 100, count: 2000 } )
{% endhighlight %}

To create an observable array, use `new can.Observe.List( [array] )` like:

{% highlight javascript %}
var hobbies = new can.Observe.List( ['programming', 
                             'basketball', 
                             'party rocking'] )
{% endhighlight %}

__can.Observe__ is used by both [can.Model](#can_model) and [can.route](#can_route). However, observe 
is useful on its own to maintain client-side state (such as pagination data). 

### attr `observe.attr( [name,] [value] )`

[can.Observe.prototype.attr](http://donejs.com/docs.html#!can.Observe.prototype.attr) reads or 
sets properties on an observe:

{% highlight javascript %}
paginate.attr( 'offset' ) //-> 0
  
paginate.attr( 'offset', 100 );
  
paginate.attr() //-> { offset: 100, limit: 100, count: 2000 }
  
paginate.attr( { limit: 200, count: 1000 } );
{% endhighlight %}


### removeAttr `observe.removeAttr( name )`

[can.Observe.prototype.removeAttr](http://donejs.com/docs.html#!can.Observe.prototype.removeAttr) removes a property 
by name from an observe.  This is similar to using the `delete` keyword to remove a property.

{% highlight javascript %}
o = new can.Observe( { foo: 'bar' } );
o.removeAttr( 'foo' ); //-> 'bar'
{% endhighlight %}

### bind `observe.bind( eventType, handler(args...) )`

[can.Observe.prototype.bind](http://donejs.com/docs.html#!can.Observe.prototype.bind) listens to
changes on a __can.Observe__.  There are two types of events triggered as a 
result of an attribute change:

 - `change` events - a generic event so you can listen to any property change and how it was changed
 - `ATTR_NAME` events - bind to specific attribute changes

The following listens to all attribute changes and 'offset' changes on the paginate instance:

{% highlight javascript %}
paginate.bind( 'change', function( ev, attr, how, newVal, oldVal ) {
   // attr = 'offset'
   // how = 'set'
   // newVal = 200
   // oldVal = 100
}).bind( 'offset', function( ev, newVal, oldVal ) {
   // newVal = 200
   // oldVal = 100
})
paginate.attr( 'offset', 200 );
{% endhighlight %}

### unbind `observe.unbind( eventType, handler )`

[can.Observe.prototype.unbind](http://donejs.com/docs.html#!can.Observe.prototype.unbind) stops listening
to an event.  The same function that was used for the handler in `bind` must be passed to `unbind`.

{% highlight javascript %}
var countHandler = function( ev, newVal, oldVal ) {
  console.log( 'the count has changed' );
}
paginate.bind( 'count', countHandler );
paginate.attr( 'count', 3000 );
paginate.unbind( 'count', countHandler );
{% endhighlight %}  

### each `observe.each( handler(attrName, value) )`

[can.Observe.prototype.each](http://donejs.com/docs.html#!can.Observe.prototype.each) iterates through 
each attribute, calling handler with each attribute name and value.

{% highlight javascript %}
paginate.each(function( name, value ) {
   console.log( name, value );
})
// writes:
//  offset 200
//  limit 200
//  count 1000
{% endhighlight %}  

### can.Observe.List `new can.Observe.List( [array] )`

[can.Observe.List](http://donejs.com/docs.html#!can.Observe.List) inherits from __can.Observe__
but adds list specific methods such as:

 - [indexOf](http://donejs.com/docs.html#!can.Observe.List.prototype.indexOf) `list.indexOf( item )` - Returns 
   the position of the item in the list.
 - [pop](http://donejs.com/docs.html#!can.Observe.List.prototype.pop) `list.pop()` - removes the last item in the list.
 - [push](http://donejs.com/docs.html#!can.Observe.List.prototype.push) `list.push( items... )` - adds items to the end of the list.
 - [shift](http://donejs.com/docs.html#!can.Observe.List.prototype.shift) `list.shift()` - removes the first item in the list.
 - [splice](http://donejs.com/docs.html#!can.Observe.List.prototype.splice) `list.splice( index, howMany, [ items... ] )` - removes and inserts items at the specified index.
 - [unshift](http://donejs.com/docs.html#!can.Observe.List.prototype.unshift) `list.unshift( items... )` - adds items to the start of the list.

{% highlight javascript %}
var hobbies = new can.Observe.List( [ 'programming', 
                               'basketball', 
                               'party rocking' ] )
                               
// listen to changes in the list
hobbies.bind( 'add', function( ev, newVals, index ) {
  console.log( 'added', newVals, 'at', index );
}).bind( 'remove', function( ev, oldVals, index ) {
  console.log( 'removed', oldVals, 'at', index );
})

// modify the list
hobbies.pop()
hobbies.unshift( 'rocking parties' )
{% endhighlight %}  

## can.Model `can.Model( [classProperties,] [prototypeProperties] )`

[can.Model](http://donejs.com/docs.html#!can.Model) is a [can.Observe](#can_observe) that connects
to a RESTful interface.

Extend [can.Model](http://donejs.com/docs.html#!can.Model) with your domain specific 
methods and can.Model provides a set of methods 
for managing changes.

To create a __Model__ class, call __can.Model__ with:

- __classProperties__, including 
  [findAll](http://donejs.com/docs.html#!can.Model.static.findAll),
  [findOne](http://donejs.com/docs.html#!can.Model.static.findOne),
  [create](http://donejs.com/docs.html#!can.Model.static.create),
  [update](http://donejs.com/docs.html#!can.Model.static.update),
  [destroy](http://donejs.com/docs.html#!can.Model.static.destroy) properties, and
- any __prototypeProperties__ helper methods.


Make a Todo model in __todos.js__ like the following:

{% highlight javascript %}
var Todo = can.Model({
  findAll : 'GET /todos',
  findOne : 'GET /todos/{id}',
  create  : 'POST /todos',
  update  : 'PUT /todos/{id}',
  destroy : 'DELETE /todos/{id}'
}, {})
{% endhighlight %}

### init `new can.Model(attributes)`

Create a todo instance like:


{% highlight javascript %}
var todo = new Todo( { name: 'do the dishes' } );
{% endhighlight %}

### attr `model.attr( name, [value] )`

[can.Model.prototype.attr](http://donejs.com/docs.html#!can.Model.prototype.attr) reads or sets properties 
on model instances.  It works the same way as [can.Observe.prototype.attr](#can_observe-attr).


{% highlight javascript %}
todo.attr( 'name' ) //-> 'do the dishes'

todo.attr( 'name', 'wash the dishes' );

todo.attr() //-> { name: 'wash the dishes' }

todo.attr( { name: 'did the dishes' } );
{% endhighlight %}

### Talking to the server

Model uses static [findAll](http://donejs.com/docs.html#!can.Model.static.findAll),
[findOne](http://donejs.com/docs.html#!can.Model.static.findOne), [create](http://donejs.com/docs.html#!can.Model.static.create),
[update](http://donejs.com/docs.html#!can.Model.static.update), and [destroy](http://donejs.com/docs.html#!can.Model.static.destroy)
methods to create, read, update and delete (CRUD)
model data on the server.  

By filling these functions out, you are able to call __findAll__ and __findOne__ on the model 
to retrieve model instances and __save__ and __destroy__ on instances.

### findAll `findAll( params, success( models ), error() ) -> Deferred`

[can.Model.findAll](http://donejs.com/docs.html#!can.Model.static.findAll) retrieves multiple instances
from the server:

{% highlight javascript %}
Todo.findAll( {}, function( todos ) {
  console.log( todos[0].name );
}) //-> Deferred
{% endhighlight %}

This makes a request to `GET /todos` which should return JSON like:

{% highlight javascript %}
[{
  "id" : 1,
  "name" : "do the dishes"
},{
  "id" : 2,
  "name" : "mow the lawn"
},{
  "id" : 3,
  "name" : "iron my shirts"
}]
{% endhighlight %}

The __todos__ parameter is a [can.Model.List](#can_model-can_model_list) of 
todo instances. `Todo.findAll` returns a [deferred](#utilities-deferred) that resolves to 
the __todos__ list.

### findOne `findOne( params, success( model ), error() ) -> Deferred`

[findOne](http://donejs.com/docs.html#!can.Model.static.findOne) retrieves a single model instance:


{% highlight javascript %}
Todo.findOne( { id: 1 }, function( todo ) {
  console.log( todo.name );
})
{% endhighlight %}

This makes a request to `GET /todos/{id}` which should return JSON like:


{% highlight javascript %}
{
  "id" : 1,
  "name" : "do the dishes"
}
{% endhighlight %}

The __todo__ parameter is model instance. `Todo.findOne` returns a [deferred](#utilities-deferred) that resolves to 
the __todo__ instance.

### save `todo.save( success( todo ), error() ) -> Deferred`

[can.Model.prototype.save](http://donejs.com/docs.html#!can.Model.prototype.save) __creates__ 
or __updates__ instances depending if the 
instance has already been created or not.

To __create__ a todo on the server, create a
todo instance and call __save__ like the following:


{% highlight javascript %}
var todo = new Todo({name: "mow lawn"})
todo.save(function( todo ) {
  console.log( todo );
})
{% endhighlight %}

This makes a request to `PUT /todos` with `name=mow lawn` and should get a response with the __id__ like:

{% highlight javascript %}
{ "id" : 5 }
{% endhighlight %}

__save__ calls back with the original todo instance and returns a [deferred](#utilities-deferred) that resolves
with the todo after it has been created on the server.


To __update__ a todo on the server, change the attributes
and call __save__ again like the following:

{% highlight javascript %}
var todo = new Todo( { name: 'mow lawn' } );
todo.save(function( todo ) {
  console.log( 'created', todo );
  
  todo.attr( 'name', 'mow my lawn' )
  todo.save(function( todo ) {
    console.log( 'updated', todo );
  })
})
{% endhighlight %}

This makes a request to `POST /todos/5` with `name=mow my lawn` and only needs to get a successful response.

### destroy `todo.destroy( success( todo ), error() ) -> Deferred`

[can.Model.prototype.destroy](http://donejs.com/docs.html#!can.Model.prototype.destroy) deletes a 
record on the server.  You can do this like:

{% highlight javascript %}
var todo = new Todo( { name: 'mow lawn' } );
todo.save(function( todo ) {
  console.log( 'created', todo );
  
  todo.destroy(function( todo ) {
    console.log( 'destroyed', todo );
  })
})
{% endhighlight %}

This makes a request to `DELETE /todos/5` and only needs a successful response.  Like __save__, the 
callback's `todo` parameter is the destroyed instance and a [deferred](#utilities-deferred) is returned that
resolves with the `todo` after it has been destroyed by the server.


### bind `model.bind( event, handler( ev, model ) ) -> model`

[can.Model.prototype.bind](http://donejs.com/docs.html#!can.Model.prototype.bind)
listens to changes in a model instance's attributes in the same way as 
[Observe's bind](#can_observe-bind).  For example:

{% highlight javascript %}
todo.bind( 'name', function( ev, newVal, oldVal ) {
  console.log( 'name changed to', newVal );
})
{% endhighlight %}

In addition to Observe's events, Model also supports three new events:

- __created__ - an instance is created on the server
- __updated__ - an instance is updated on the server
- __destroyed__ - an instance is destroyed on the server

For example, listen for 
when an instance is __created__ on the server like:

{% highlight javascript %}
var todo = new Todo( { name: 'mow lawn' } );
todo.bind( 'created', function( ev, todo ) {
  console.log( 'created', todo );
})
todo.save()
{% endhighlight %}

[can.Model.bind](http://donejs.com/docs.html#!can.Model.static.bind) lets you listen for 
anytime __any__ instance is __created__, __updated__, or __destroyed__:

{% highlight javascript %}
Todo.bind( 'created', function( ev, todo ){
  console.log( 'created', todo );
})
{% endhighlight %}


### can.Model.List `new can.Model.List( items )`

[can.Model.List](http://donejs.com/docs.html#!can.Model.List) is a 
[can.Observe.List](#can_observe-can_observe_list) that automatically removes items when they are 
destroyed.  __Model.Lists__ are returned by [findAll](#can_model-findall).

{% highlight javascript %}
Todo.findAll( {}, function( todos ) {

  // listen for when a todo is removed
  todos.bind( 'remove', function( ev, removed, index ) {
    console.log( 'removed', removed.length, 'todos' );
  })
  
  // destroy the first todo
  todos[0].destroy()
})
{% endhighlight %}

## can.view `can.view( idOrUrl, data ) -> documentFragment`

[can.view](http://donejs.com/docs.html#!can.view) is used to load, render, and create HTMLElements from
JavaScript templates. Pass it ...

- the __id__ or __URL__ of a script tag to use as the content of the template
- __data__ to pass to the template
  
It returns the rendered result of the template as a documentFragment (a documentFragment is a lightweight
container that can hold DOM elements in it).  

{% highlight javascript %}
document.getElementById( 'todos' )
  .appendChild( can.view( 'todos.ejs', [ { name: 'mow lawn' } ] ) )
{% endhighlight %}

`can.view` supports multiple templating languages; however, [can.EJS](#can_ejs)
is packaged with CanJS and supports live-binding of [can.Observe](#can_observe).

### Loading Templates

`can.view` loads templates from a URL or a script tag. To load from
a __script__ tag, create a script tag with the template contents, an id, 
and a type attribute that specifies the template type (text/ejs).

For example, add the following __html__:

{% highlight erb %}
<script type="text/ejs" id="todosEJS">
  <% for( var i = 0; i < this.length; i++ ) { %>
    <li><%= this[ i ].name %></li>
  <% } %>
</script>
{% endhighlight %}

Render this template and insert it into the page:

{% highlight javascript %}
Todo.findAll( {}, function( todos ) {
   document.getElementById( 'todos' )
           .appendChild( can.view( 'todosEJS', todos ) );
} );
{% endhighlight %}

To load from a __URL__,  create
a _todos/todos.ejs_ file that contains:

{% highlight erb %}
<% for( var i = 0; i < this.length; i++ ) { %>
  <li><%= this[ i ].name %></li>
<% } %>
{% endhighlight %}

Render this with:

{% highlight javascript %}
Todo.findAll( {}, function( todos ) {
  document.getElementById( 'todos' )
           .appendChild( can.view( 'todos/todos.ejs', todos ) );
} );
{% endhighlight %}

### Deferreds

__can.view__ accepts [deferreds](#utilities-deferred).  If the `data` argument is a deferred or an object
that contains deferreds, __can.view__ returns a deferred that resolves to the documentFragment after
all deferreds have resolved and the template has loaded.

[can.Model.findAll](#can_model-findall) returns deferreds. This means that the following loads `todos/todos.ejs`, `Todo.findAll` and `User.findOne`
in parallel and resolves the returned deferred with the documentFragment when they are all done:

{% highlight javascript %}
can.view( 'todos/todos.ejs', {
  todos: Todo.findAll(),
  user: User.findOne( { id: 5 } )
} ).then(function( frag ){
  document.getElementById( 'todos' )
          .appendChild( frag );
})
{% endhighlight %}
    

### render `can.view.render( idOrUrl, data )`

To render a string instead of a documentFragment, use can.view.render like:

{% highlight javascript %}
<% for( var i = 0; i < todos.length; i++ ) { %>
  <li><%== can.view.render( '/todos/todo.ejs', {
             todo: todo[ i ]
            } ) %>
  </li>
<% } %>
{% endhighlight %}

## can.EJS `new can.EJS( options )`

[can.EJS](http://donejs.com/docs.html#!can.EJS) is CanJS's default template 
language and used with [can.view](#!can_view).  It provides live binding
when used with [can.Observes](#can_observe).  A __can.EJS__ template looks
like the HTML you want, but with __magic tags__ where you want
dynamic behavior.  The following lists todo elements:

{% highlight erb %}
<script type="text/ejs" id="todosEJS">
<% for( var i = 0; i < this.length; i++ ) { %>
  <li><%= this[ i ].name %></li>
<% } %>
</script>
{% endhighlight %}

Use __can.view__ to render this template:

{% highlight javascript %}
Todo.findAll( {}, function( todos ) {
  document.getElementById( 'todos' )
          .appendChild( can.view( 'todosEJS', todos ) )
}
{% endhighlight %}

Notice that `this` in the template is the list of todos.  The `data` argument passed __can.view__ 
becomes `this` in EJS.  EJS can also access any properties of `this` 
directly (without writing `this.PROPERTY` all the time).  For example, a template that lists the user's name
and todos:

{% highlight erb %}
<script type="text/ejs" id="todosEJS">
<h2><%= user.name %></h2>
<% for( var i = 0; i < todos.length; i++ ) { %>
  <li><%= todos[ i ].name %></li>
<% } %>
</script>
{% endhighlight %}

Can be inserted into the document with:

{% highlight javascript %}
can.view( 'todosEJS', {
  todos : Todo.findAll(),
  user: User.findOne( { id: 5 } )
}).then(function( frag ) {
  document.getElementById( 'todos' )
          .appendChild( frag );
})
{% endhighlight %}

### Magic Tags

EJS uses 5 types of magic tags:

__`<% CODE %>`__ - Runs JS Code.

This type of magic tag does not modify the template but is used for JS control statements 
like for-loops, if/else, switch, declaring variables, etc.  Pretty much any JS code is valid.  Examples:

{% highlight erb %}
<!-- check if there are no todos -->
<% if ( todos.attr( 'length' ) === 0 ) { %>
    <li>You have no todos</li>
<% } else { %>
    <% list( todos, function() { %>
        <li> .... </li>
    <% } ) %>
<% } %>

<!-- create and use a variable -->
<% var person = todo.attr( 'person' ) %>
<span><%= person.attr( 'name' ) %><span>
{% endhighlight %}

__`<%= CODE %>`__ - Runs a JS statement and writes the __escaped__ result into the result of the template.

The following results in the user seeing `my favorite element is &lt;b>B&lt;b>.` and not
<code>my favorite element is <B>B</B>.</code>.

     <div>my favorite element is <%= '<b>B</b>' %>.</div>
     
This protects you against [cross-site scripting](http://en.wikipedia.org/wiki/Cross-site_scripting) attacks.
         
__`<%== CODE %>`__  - Runs a JS statement and writes the __unescaped__ result into the result of the template.

The following results in <code>my favorite element is <B>B</B>.</code>. Using `<%==` is useful
for sub-templates.
     
    <div>my favorite element is <%== '<B>B</B>' %>.</div>

Use `<%== CODE %>` when rendering subtemplates:

{% highlight erb %}
<% for( var i = 0; i < todos.length; i++ ) { %>
  <li><%== can.view.render( 'todoEJS', todos[ i ] ) %></li>
<% } %>
{% endhighlight %}

### Live Binding

__can.EJS__ will automatically update itself when [can.Observes](#can_observe) change.  To enable
live-binding, use [attr](#!can_observe-attr) to read properties.  For example, the following
template will update todo's name when it change:

{% highlight erb %}
  <li><%= todo.attr( 'name' ) %></li>
{% endhighlight %}

Notice `attr( 'name' )`.  This sets up live-binding.  If you change the todo's name, the `<li>` will automatically
be updated:

{% highlight javascript %}
todo.attr( 'name', 'Clean the toilet' );
{% endhighlight %}

Live-binding works by wrapping the code inside the magic tags with a function to call when the attribute (or attributes)
are changed.  This is important to understand because a template like this will not work:

{% highlight erb %}
<% for( var i = 0; i < todos.length; i++ ) { %>
  <li><%= todos[ i ].attr( 'name' ) %></li>
<% } %>
{% endhighlight %}

This does not work because when the function wrapping `todos[ i ].attr( 'name' )` is called, `i` will be __3__, which 
is the index of the last todo, not the index of the desired todo.  Fix this by using a closure like:

{% highlight erb %}
<% $.each( todos, function( i, todo ) { %>
  <li><%= todo.attr( 'name' ) %></li>
<% } ) %>
{% endhighlight %}

### list `list( observeList, iterator( item, index ) )`

If you want to make the previous template update when todos are 
added or removed, you could bind to length like:

{% highlight erb %}
<% todos.bind( 'length', function() {} );
   $.each( todos, function( i, todo ) { %>
      <li><%= todo.attr( 'name' ) %></li>
<% }) %>
{% endhighlight %}

Or simply use EJS's `list` helper method like:

{% highlight erb %}
<% list( todos, function( todo ) { %>
  <li><%= todo.attr( 'name' ) %></li>
<% }) %>
{% endhighlight %}

Now when todos are added or removed from the todo list, the template's HTML is updated:

{% highlight javascript %}
// add an item
todos.push( new Todo( { name: 'file taxes' } ) );

// destroying an item removes it from Model.Lists
todos[ 0 ].destroy()
{% endhighlight %}

### Element Callbacks

If a function is returned by the `<%= %>` or `<%== %>` magic tags within an element's tag like:

{% highlight erb %}
<div <%= function( element ) { element.style.display = 'none' } %> >
  Hello
</div>
{% endhighlight %}

The function is called back with the `HTMLElement` as the first 
argument.  This is useful to initialize functionality on an 
element within the view.  This is so common that EJS supports 
[ES5 arrow functions](http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax)
that get passed the `NodeList` wrapped element.  Using jQuery, this lets you write 
the above callback as:

{% highlight erb %}
<div <%= (el) -> el.hide() %> >
  Hello
</div>
{% endhighlight %}

This technique is commonly used to add data, especially model instances, to an element like:

{% highlight erb %}
<% list( todos, function( todo ) { %>
  <li <%= (el) -> el.data( 'todo', todo ) %>>
    <%= todo.attr( 'name' ) %>
  </li>
<% } ) %>
{% endhighlight %}

jQuery's `el.data( NAME, data )` adds data to an element.  If your library does not support this,
can provides it as `can.data( NodeList, NAME, data )`.  Rewrite the above example as:

{% highlight erb %}
<% list(todos, function( todo ) { %>
  <li <%= (el) -> can.data( el, 'todo', todo ) %>>
    <%= todo.attr( 'name' ) %>
  </li>
<% } ) %>
{% endhighlight %}

## can.Control `can.Control(classProps, prototypeProps)`

[can.Control](http://donejs.com/docs.html#!can.Control) creates organized, memory-leak free, 
rapidly performing, stateful controls. Use it to create UI controls like 
tabs, grids, and context menus and organizes them 
into higher-order business rules with [can.route](http://donejs.com/docs.html#!can.route). It can serve as 
a traditional view and a 
traditional controller.
  
The following examples make a basic todos widget that 
lists todos and lets 
us destroy them. Create a control constructor function of your own by 
extending `can.Control`.  

{% highlight javascript %}
var Todos = can.Control({
  'init': function( element , options ) {
    var self = this;
    Todo.findAll( {}, function( todos ) {
      self.element.html( can.view( 'todosEJS', todos ) )
    })
  }
})
{% endhighlight %}

Create an instance of the Todos on the `#todos` element with:

{% highlight javascript %}
var todosControl = new Todos( '#todos', {} );
{% endhighlight %}

__todos.ejs__ looks like:

{% highlight erb %}
<% list( todos, function( todo ) { %>
  <li <%= (el) -> el.data( 'todo', todo ) %> >
    <%= todo.attr( 'name' ) %>
    <a href="javascript://" class="destroy">X</a>
  </li>
<% } ) %>
{% endhighlight %}

### init `can.Control.prototype.init(element, options)`

`init` is called when a
new can.Control instance is created.  It's called with:

- __element__ - The wrapped element passed to the 
                control. Control accepts a
                raw HTMLElement, a CSS selector, or a NodeList.  This is
                set as __this.element__ on the control instance.
- __options__ - The second argument passed to new Control, extended with
                the can.Control's static __defaults__. This is set as 
                __this.options__ on the control instance.

and any other arguments passed to `new can.Control()`.  For example:

{% highlight javascript %}
var Todos = can.Control({
  defaults: { view: 'todos.ejs' }
}, {
  'init': function( element , options ){
    var self = this;
    Todo.findAll( {},function( todos ) {
      self.element.html( can.view( self.options.view, todos ) )
    });
  }
})

// create a Todos with default options
new Todos( document.body.firstElementChild );

// overwrite the template option
new Todos( $('#todos'), { view: 'specialTodos.ejs' } )
{% endhighlight %}

### element `this.element`

[this.element](http://donejs.com/docs.html#!can.Controll.prototype.element) is the 
NodeList of a single element, the element the control is created on. 

{% highlight javascript %}
var todosControl = new Todos( document.body.firstElementChild );
todosControl.element[0] //-> document.body.firstElementChild
{% endhighlight %}

Each library wraps the element differently.  If you are using jQuery, the element is wrapped with `jQuery( element )`.

### options `this.options`

[this.options](http://donejs.com/docs.html#!can.Control.prototype.options) is the second argument passed to 
`new can.Control()` and is merged with the control's static __defaults__ property.

### Listening to events

Control automatically binds prototype methods that look
like event handlers.  Listening to __click__s on `<li>` elements looks like:

{% highlight javascript %}
var Todos = can.Control({
  'init' : function( element , options ) {
    var self = this;
    Todo.findAll( {}, function( todos ) {
      self.element.html( can.view('todosEJS', todos ) )
    });
  },
  'li click' : function( li, event ) {
    console.log( 'You clicked', li.text() )
    
    // let other controls know what happened
    li.trigger( 'selected' );
  }
})
{% endhighlight %}

When an `<li>` is clicked, `'li click'` is called with:

- The library-wrapped __element__ that was clicked.
- The __event__ data

Control uses event delegation, so you can add `<li>`s without needing to rebind
event handlers.

To destroy a todo when it's `<a href="javascript://" class="destroy">` link 
is clicked:

{% highlight javascript %}
var Todos = can.Control({
  'init' : function( element , options ) {
    var self = this;
    Todo.findAll( {},function( todos ) {
      self.element.html( can.view( 'todosEJS', todos ) )
    });
  },
  'li click': function( li ) {
    li.trigger( 'selected', li.model() );
  },
  'li .destroy click': function( el, ev ) {
    // get the li element that has todo data
    var li = el.closest( 'li' );
  
    // get the model
    var todo = li.data( 'todo' )
  
    // destroy it
    todo.destroy();
  }
})
{% endhighlight %}

When the todo is destroyed, EJS's live binding will remove its LI automatically.

### Templated Event Handlers Pt 1 `"{optionName}"`

Customize event handler behavior with `"{NAME}"` in
the event handler name.  The following allows customization 
of the event that destroys a todo:

{% highlight javascript %}
var Todos = can.Control( 'Todos', {
  'init': function( element , options ) { ... },
  'li click': function( li ) { ... },
  
  'li .destroy {destroyEvent}': function( el, ev ) { 
    // previous destroy code here
  }
})

// create Todos with this.options.destroyEvent
new Todos( '#todos', { destroyEvent: 'mouseenter' } )
{% endhighlight %}

Values inside `{NAME}` are looked up on the control's `this.options`
and then, if not found, on the `window`.  For example, we could customize it instead like:

{% highlight javascript %}
var Todos = can.Control( 'Todos', {
  'init': function( element , options ) { ... },
  'li click': function( li ) { ... },
  
  'li .destroy {Events.destroy}': function( el, ev ) { 
    // previous destroy code here
  }
})

// Events config
Events = { destroy: 'click' };

// Events.destroy is looked up on the window.
new Todos( '#todos' )
{% endhighlight %}

The selector can also be templated.

### Templated Event Handlers Pt 2 `"{objectName}"`

Control can also bind to objects other than `this.element` with
templated event handlers.  This is _critical_ for avoiding memory leaks that are common among MVC applications.  

If the value inside `{NAME}` is an object, the event will be bound to that object rather than the control.  For example, the following tooltip listens to 
clicks on the window:

{% highlight javascript %}
var Tooltip = can.Control({
  '{window} click': function( el, ev ) {
    // hide only if we clicked outside the tooltip
    if (!this.element.has( ev.target ) {
      this.element.remove();
    }
  }
})

// create a Tooltip
new Tooltip( $('<div>INFO</div>').appendTo(el) )
{% endhighlight %}
    
This is convenient when needing to 
listen to model changes.  If EJS was not taking care of
removing `<li>`s after their model was destroyed, we
could implement it in `Todos` like:

{% highlight javascript %}
var Todos = can.Control({
  'init': function( element , options ) {
    var self = this;
    Todo.findAll( {}, function( todos ) {
      self.todosList = todos;
      self.element.html( can.view( 'todosEJS', todos ) )
    })
  },
  'li click': function( li ) {
    li.trigger( 'selected', li.model() );
  },
  'li .destroy click': function( el, ev ) {
    // get the li element that has todo data
    var li = el.closest( 'li' );
  
    // get the model
    var todo = li.data( 'todo' )
  
    //destroy it
    todo.destroy();
  },
  '{Todo} destroyed': function( Todo, ev, todoDestroyed ) {
    // find where the element is in the list
    var index = this.todosList.indexOf( todoDestroyed )
    this.element.children( ':nth-child(' + ( index + 1 ) + ')' )
        .remove()
  }
})

new Todos( '#todos' );
{% endhighlight %}

### destroy `control.destroy()`

[can.Control.prototype.destroy](http://donejs.com/docs.html#!can.Control.prototype.destroy) unbinds a control's
event handlers and releases its element, but does not remove 
the element from the page. 

{% highlight javascript %}
var todo = new Todos( '#todos' )
todo.destroy();
{% endhighlight %}

When a control's element is removed from the page,
__destroy__ is called automatically.

{% highlight javascript %}
new Todos( '#todos' )
$( '#todos' ).remove();
{% endhighlight %}
    
All event handlers bound with Control are unbound when the control 
is destroyed (or its element is removed).

A brief aside on destroy and templated event binding: Taken 
together, templated event binding and Control's automatic
clean-up make it almost impossible 
to write leaking applications. An application that uses
only templated event handlers on controls within the body
could free up all 
data by calling `$( document.body ).empty()`.

### on `control.on()`

[can.Control.prototype.on](http://donejs.com/docs.html#!can.Control.prototype.on) rebinds a control's event handlers.  This is useful when you are 
listening to a specific model instance, and want to change to change to another.

The following `Editor` widget's __todo__ method updates the control's todo option and then calls `on()` to 
rebind `'{todo} updated'`.

{% highlight javascript %}
var Editor = can.Control({
  todo: function( todo ) {
    this.options.todo = todo;
    this.on();
    this.setName();
  },
  // a helper that sets the value of the input
  // to the todo's name
  setName: function() {
    this.element.val( this.options.todo.name );
  },
  // listen for changes in the todo
  // and update the input
  '{todo} updated': function() {
    this.setName();
  },
  // when the input changes
  // update the todo instance
  'change': function() {
    var todo = this.options.todo
    todo.attr( 'name', this.element.val() )
    todo.save();
  }
});

var todo1 = new Todo( { id: 6, name: 'trash' } ),
    todo2 = new Todo( { id: 6, name: 'dishes' } );

// create the editor
var editor = new Editor( '#editor' );

// show the first todo
editor.todo( todo1 )

// switch it to the second todo
editor.todo( todo2 );
{% endhighlight %}

## can.route `can.route( route, [defaults] )`

[can.route](http://donejs.com/docs.html#!can.route) is the core of CanJS's 
routing functionality. It is a special [can.Observe](#can_observe) that
updates `window.location.hash` when its properties change
and updates its properties when `window.location.hash` 
changes. __can.route__ uses routes to translate URLs into
property values.  If no routes are provided, it just serializes the route
into standard URL-encoded notation.  For example:

{% highlight javascript %}
// empty the hash
window.location.hash = ''

// the route is empty
can.route.attr() //-> {}
  
// set the hash
window.location.hash = '#!id=7'

// the route data reflects what's in the hash
can.route.attr() //-> { id: 7 }

// set the route data
can.route.attr( { type : 'todos' } )

// the hash changes to reflect the route data
window.location.hash //-> #!type=todos

// set a property on the hash
can.route.attr( 'id', 5 )

// the hash changes again to reflect the route data
window.location.hash //-> #!type=todos&id=5
{% endhighlight %}

Use `can.route( route, defaults )` to make pretty URLs:

{% highlight javascript %}
// create a route
can.route( ':type/:id' )

// set the hash to look like the route
window.location.hash = '#!todo/5'

// the route data changes accordingly
can.route.attr() //-> { type: 'todo', id: 5 }

// change the route data with properties
// used by the route
can.route.attr( { type: 'user', id: 7 } )

// the hash is changed to reflect the route
window.location.hash //-> '#!user/7'

// create a default route
can.route( '', { type: 'recipe' } )

// empty the hash
window.location.hash = '';

// the route data reflects the default value
can.route.attr() //-> { type: 'recipe' }
{% endhighlight %}

### bind `route.bind( eventName, handler( event ) )`

Use [bind](#can_observe-bind) to listen to changes in the route like:

{% highlight javascript %}
can.route.bind( 'id', function( ev, newVal ) {
  console.log( 'id changed' );
});
{% endhighlight %}

### route events

Listen to routes in controls with special "route" events like:

{% highlight javascript %}
var Routing = can.Control({
  'route': function() {
    // matches empty hash, #, or #!
  },
  'todos/:id route': function( data ) {
    // matches routes like #!todos/5
  }
})

// create routing control
new Routing( document.body );
{% endhighlight %}

The `route` methods get called back with the route __data__.  The 
empty `"route"` will be called with no data. But, `"todos/:id route"`
will be called with data like: `{id: 6}`.

We can update the route by changing can.route's data like:

{% highlight javascript %}
can.route.attr( 'id', '6' ) // window.location.hash = #!todos/6
{% endhighlight %}

### url `can.route.url( options, [merge] )`

[can.route.url](http://donejs.com/docs.html#!can.route.url) takes attributes
and creates a URL that can be used in a link.  

{% highlight javascript %}
var hash = can.route.url({id: 7}) // #!todos/7
window.location.hash = hash;
{% endhighlight %}

### link `can.route.link( name, options, props, merge )`

[can.route.link](http://donejs.com/docs.html#!can.route.link) is used to 
create a link.

{% highlight javascript %}
var link = can.route.link( 'Todo 5',
                    { id: 5 }, 
                    { className : 'button' } );

link //-> <a href="#!todos/7" class="button">Todo 5</a>
{% endhighlight %}


The following enhances the Routing control to listen for
`".todo selected"` events and change __can.route__.  When the
can.route changes, it retrieves the todo from the server
and updates the editor widget.

{% highlight javascript %}
var Routing = can.Control({
  init: function() {
    this.editor = new Editor( '#editor' )
    new Todos( '#todos' );
  },
  // the index page
  'route': function() {
     $('#editor').hide();
  },
  'todos/:id route': function( data ) {
    $("#editor").show();
    var self = this;
    Todo.findOne( data, function( todo ) {
      this.editor.update( { todo: todo } );
    })
  },
  '.todo selected': function( el, ev, todo ) {
    can.route.attr( 'id', todo.id );
  }
});

// create routing control
new Routing( document.body );
{% endhighlight %}

The __Routing__ control is a traditional controller. It coordinates the 
`Editor` and `Todos` controls with `can.route` hash data.  `Editor` and `Todos`
are traditional views, consuming models.

If you can understand this, you're on your way to mastery of the CanJS MVC architecture. 
Congrats! [See it in action](http://donejs.com/docs.html#!tutorials/rapidstart/todos.html).


## Utilities

CanJS provides several utility methods.  Usually, they are mapped to the underlying 
library. But, by using only these methods, you can create plugins that work with any library. Also, these methods
are required to run CanJS from another library.

### String Helpers

{% highlight javascript %}
// remove leading and trailing whitespace
can.trim( ' foo ' ) // -> 'foo' 

// escape HTML code
can.esc( '<foo>&<bar>' ) //-> '&lt;foo&lt;&amp;&lt;bar&lt;'

// looks up an object by name
can.getObject( 'foo.bar', [ { foo: { bar: 'zed' } } ] ) //-> 'zed'

// capitalize a string
can.capitalize( 'fooBar' ) //-> 'FooBar'

// micro templating
can.sub( '{greet} world', { greet: 'hello' } ) //-> 'hello world'

// deparams a form encoded URL into an object
can.deparam( 'foo=bar&hello=world' )
    //-> { foo: 'bar', hello: 'world' }
{% endhighlight %}

### Array Helpers

{% highlight javascript %}
// convert array-like data into arrays
can.makeArray( { 0: "zero", 1: 'one', length: 2 } ) // -> [ 'zero', 'one' ]
  
// return if an array is an array
can.isArray( [] ) //-> true
  
// converts one array to another array
can.map( [ { prop: 'val1' }, { prop: 'val2' } ], function( val, prop ) {
  return val
})  //-> [ 'val1', 'val2' ]
  
// iterates through an array
can.each( [ { prop: 'val1' }, { prop: 'val2' } ], function( value, index ) {
  // function called with
  //  value = { prop: 'val1' }, index = 0
  //  value = { prop: 'val2' }, index = 1
})
{% endhighlight %}

### Object Helpers

{% highlight javascript %}
// extends one object with the properties of another
var first = {},
    second = { a: 'b' },
    third = { c: 'd' };
can.extend( first, second, third ); //-> first
first  //-> { a: 'b', c: 'd' }
second //-> { a: 'b' }
third  //-> { c: 'd' }
  
// deep extends one object with another
can.extend( true, first, second, third ); 
  
// parameterize into a query string
can.param( { a: 'b', c: 'd' } ) //-> 'a=b&c=d'
  
// returns if an object is empty
can.isEmptyObject( {} )      //-> true
can.isEmptyObject( { a: 'b' } ) //-> false
{% endhighlight %}

### Function Helpers

{% highlight javascript %}
// returns a function that calls another function
// with 'this' set.
var func = can.proxy(function( one ) {
  return this.a + one
}, { a: 'b' } ); 
func( 'two' ) //-> 'btwo'

// returns if an object is a function
can.isFunction( {} )           //-> false
can.isFunction( function() {} ) //-> true
{% endhighlight %}

### Event Helpers

{% highlight javascript %}
// binds handler on obj's eventName event
can.bind( obj, eventName, handler )

// unbind handler on obj's eventName event
can.unbind( obj, eventName, handler ) 
  
// binds handler on all elements' eventName event that match selector
can.delegate( obj, selector, eventName, handler )
  
// unbinds handler on all elements' eventName event that match selector in obj
can.undelegate( obj, selector, eventName )
  
// executes all handlers attached to obj for eventName
can.trigger( obj, eventName, args )
{% endhighlight %}

### Deferred

can.Deferreds are explained in greater detail in the [DoneJS documentation.](http://donejs.com/docs.html#!can.Deferred)

{% highlight javascript %}
// creates a new Deferred object
var deferred = new can.Deferred()

// pipes a deferred into another deferred
deferred.pipe(function() {
	// done handler
}, function() {
	// fail handler
})

// resolves a deferred (deferreds piped into the deferred also become resolved)
deferred.resolve()
  
// rejects a deferred (deferreds piped into the deferred also become rejected)
deferred.reject()
  
// used to execute callback functions when all passed deferreds become resolved
can.when()
{% endhighlight %}


### Ajax

{% highlight javascript %}
// performs an asynchronous HTTP request
can.ajax({
  url : 'url',
  type: 'GET', // 'POST'
  async : false,
  dataType: 'json',
  success: function() {},
  error: function() {}
}) //-> deferred
{% endhighlight %}

### HTMLElement Helpers

{% highlight javascript %}
can.buildFragment( frags, nodes )

// a node list
can.$( 'div.bar' ) //-> []

// appends html to the HTMLElements in the NodeList
can.append( NodeList, html )
  
// removes the HTMLElements in the NodeList from the DOM  
can.remove( NodeList )
  
// stores arbitrary data to the HTMLElements in the NodeList  
can.data( NodeList, dataName, dataValue )
  
// adds CSS class(es) to the HTMLElements in the NodeList
can.addClass( NodeList, className )
{% endhighlight %}


__HTMLElement 'destroyed' event__

When an element is removed from the page using any library, CanJS triggers a 'destroyed' event on 
the element.  This is used to teardown event handlers in can.Control.

## Use with other libraries

CanJS can be used with jQuery, Dojo, Mootools, YUI, or Zepto.

### jQuery

CanJS supports jQuery 1.7+. Include a copy of jQuery along with CanJS to get started.

{% highlight html %}
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js">
</script>
<script src="can.jquery.js"></script>
<script>
  // start using CanJS
  can.Model('Todo', {
    ...
  });
</script>
{% endhighlight %}

CanJS supports binding to any jQuery objects (like jQuery UI widgets) that use standard 
jQuery events. The jQuery UI Datepicker doesn't have built-in support for standard 
jQuery events, so for those cases, a workaround should be applied:

{% highlight html %}
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js">
</script>
<script src="jquery.ui.core.js"></script>
<script src="jquery.ui.datepicker.js"></script>
<script src="can.jquery.js"></script>
<script>
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
</script>
{% endhighlight %}

### Dojo

CanJS supports Dojo 1.7+ using its new AMD loader in asynchronous or synchronous mode.
CanJS depends on the following Dojo modules: __dojo__, __dojo/query__, __dojo/NodeList-dom__ and __dojo/NodeList-traverse__. It also uses the __plugd/trigger__ plugin for internal object and node event triggering.

Include a copy of Dojo and add the `'can/dojo'` module as a dependency in your require statement to get started.

{% highlight html %}
<script type='text/javascript' src='path/to/js/dojo.js'></script>
<script>
require(['can/dojo'], function(can){ //will load path/to/js/can/dojo.js
  // start using CanJS
  Todo = can.Model({
    ...
  });
});
</script>
{% endhighlight %}

If you are including Dojo from a CDN or you want more control over your file structure, you will need to configure the packages path to `'can/dojo'`. This is done by declaring a variable named [dojoConfig](http://dojotoolkit.org/documentation/tutorials/1.7/dojo_config/) containing an array of package paths before including the Dojo library.

{% highlight html %}
<script>
//Using dojoConfig to load can/dojo from a local directory
var dojoConfig = {
  packages: [{
    name: "can/dojo",
    location: location.pathname.replace(/\/[^/]+$/, ""),
    main: "can.dojo.js"
  }]
}
</script>
<script type='text/javascript' src='http://ajax.googleapis.com/ajax/libs/dojo/
1.7.1/dojo/dojo.js'></script>
<script>
require(['can/dojo'], function(can){
  // start using CanJS
  Todo = can.Model({
    ...
  });
});
</script>
{% endhighlight %}

You can also configure package paths using the [require function](http://dojotoolkit.org/documentation/tutorials/1.7/modules/).

{% highlight html %}
<script type='text/javascript' src='http://ajax.googleapis.com/ajax/libs/dojo/
1.7.1/dojo/dojo.js'></script>
<script>
//Using require to load can/dojo from a local directory
require({
  packages: [{
    name: "can/dojo",
    location: location.pathname.replace(/\/[^/]+$/, ""),
    main: "can.dojo"
  }]
}, ['can/dojo',], function(can){
  // start using CanJS
  Todo = can.Model({
    ...
  });
});
</script>
{% endhighlight %}

CanJS can bind to any Dijit, Dojox or custom widget events using [templated event binding](#can_control-templated_event_handlers_pt_2). Below is an example of binding to the __onChange__ event of the dijit.CalendarLite widget:

{% highlight javascript %}
require(['can/dojo', 
  'dijit/CalendarLite'], 
function(can, CalendarLite){
  //Define a Control
  Todo = can.Control({
    //events are lowercase and don't use on (onChange -> change)
    "{calendar} change" : function(calendar, newDate) {
      //onChange handler: do something with the newDate selected
    }
  });
  
  //Initialize app with a calendar widget
  new Todo('#todoList', {
    calendar: new CalendarLite({}, "calendar")
  });
});
{% endhighlight %}

### Mootools

CanJS supports Mootools 1.4+. Include a copy of Mootools Core along with CanJS to get started.

Mootools Core has an issue where __focus__ and __blur__ events are not fired for delegate event listeners.
Include Mootools More's Event.Pseudos module for __focus__ and __blur__ support.

{% highlight html %}
<script src="https://ajax.googleapis.com/ajax/libs/mootools/1.4.3/
mootools.js"></script>
<!-- Mootools More Event.Pseudos module -->
<script src="mootools-more-event_pseudos-1.4.0.1.js"></script>
<script src="can.mootools.js"></script>
<script>
  // start using CanJS
  Todo = can.Model({
    ...
  });
</script>
{% endhighlight %}

### YUI

CanJS supports YUI 3.4+ with both dynamically or statically loaded modules.
CanJS depends on the following YUI modules: __node__, __io-base__, __querystring__, __event-focus__, and __array-extras__. The __selector-css2__ and __selector-css3__ YUI modules are optional, but necessary for IE7 and other browsers that don't support __querySelectorAll__.

To use with dynamically loaded modules, include the YUI loader along with CanJS.
Add `'can'` to your normal list of modules with `YUI().use('can', ...)` wherever CanJS will be used.

{% highlight html %}
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
{% endhighlight %}

To use with statically loaded modules, include a static copy of YUI (with the 
previously mentioned YUI dependencies) along with CanJS. CanJS will automatically 
be included wherever `YUI().use('*')` is used.

{% highlight html %}
<!-- YUI Configurator: http://yuilibrary.com/yui/configurator/ -->
<script src="http://yui.yahooapis.com/combo?3.4.1/build/yui-base/yui-base-min.
js&3.4.1/build/oop/oop-min.js&3.4.1/build/event-custom-base/event-custom-base-
min.js&3.4.1/build/features/features-min.js&3.4.1/build/dom-core/dom-core-min.
js&3.4.1/build/dom-base/dom-base-min.js&3.4.1/build/selector-native/selector-n
ative-min.js&3.4.1/build/selector/selector-min.js&3.4.1/build/node-core/node-c
ore-min.js&3.4.1/build/node-base/node-base-min.js&3.4.1/build/event-base/event
-base-min.js&3.4.1/build/event-delegate/event-delegate-min.js&3.4.1/build/node
-event-delegate/node-event-delegate-min.js&3.4.1/build/pluginhost-base/pluginh
ost-base-min.js&3.4.1/build/pluginhost-config/pluginhost-config-min.js&3.4.1/b
uild/node-pluginhost/node-pluginhost-min.js&3.4.1/build/dom-style/dom-style-mi
n.js&3.4.1/build/dom-screen/dom-screen-min.js&3.4.1/build/node-screen/node-scr
een-min.js&3.4.1/build/node-style/node-style-min.js&3.4.1/build/querystring-st
ringify-simple/querystring-stringify-simple-min.js&3.4.1/build/io-base/io-base
-min.js&3.4.1/build/array-extras/array-extras-min.js&3.4.1/build/querystring-p
arse/querystring-parse-min.js&3.4.1/build/querystring-stringify/querystring-st
ringify-min.js&3.4.1/build/event-custom-complex/event-custom-complex-min.js&3.
4.1/build/event-synthetic/event-synthetic-min.js&3.4.1/build/event-focus/event
-focus-min.js"></script>
<script src="can.yui.js"></script>
<script>
  YUI().use('*', function(Y) {
    // start using CanJS
    Todo = can.Model({
      ...
    });
  });
</script>
{% endhighlight %}

CanJS can also bind to YUI widget events. The following example shows how to 
bind to the __selectionChange__ event for a YUI Calendar widget:

{% highlight javascript %}
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
{% endhighlight %}

### Zepto

CanJS supports Zepto 0.8+. Include a copy of Zepto along with CanJS to get started.

Zepto 0.8 has an issue where __focus__ and __blur__ events are not fired for delegate event listeners.
There is a fix included for Zepto > 0.8, but you can apply 
[this patch](https://github.com/madrobby/zepto/commit/ab2a3ef0d18beaf768903f0943efd019a29803f0)
to __zepto.js__ when using Zepto 0.8.

{% highlight html %}
<!-- Zepto 0.8 with focus/blur patch applied -->
<script src="zepto.0.8-focusblur.js"></script>
<script src="can.zepto.js"></script>
<script>
  // start using CanJS
  Todo = can.Model({
    ...
  });
</script>
{% endhighlight %}

## Plugins

### can.Construct.proxy `construct.proxy( methodname, [ curriedArgs ] )`

[can.construct.proxy.js](https://github.com/downloads/jupiterjs/canjs/can.construct.proxy.1.0b2.js)

The [can.Construct.proxy](http://donejs.com/docs.html#!can.Construct.proxy)
plugin adds a _proxy_ method that takes a function name and returns a new function
that will always have `this` set to the original context. You can also curry arguments that will
be added to the beginning of the proxied functions argument list:

{% highlight javascript %}
var Person = can.Construct({
  init: function( name ) {
    this.name = name;
  },

  sayName: function( text, end ) {
    return text + this.name + end;
  }
});

var instance = new Person( 'John' );
var callback = instance.proxy( 'sayName' );
var curriedCallback = instance.proxy( 'sayName', 'Hi my name is' );

callback( 'Hi I am ', ' :)' ); // -> 'Hi I am John :)'
curriedCallback( '!' ); // -> 'Hi my name is John!'
{% endhighlight %}

### can.Construct.super

[can.construct.super.js](https://github.com/downloads/jupiterjs/canjs/can.construct.super.1.0b2.js)

The [can.Construct.super](http://donejs.com/docs.html#!can.Construct.super) plugin
provides access to overwritten methods using `this._super` when extending a can.Construct:

{% highlight javascript %}
var ImprovedPerson = Person({
  init: function( name, lastName ) {
    this._super( name );
    this.lastName = lastName;
  },

  sayName: function( text ) {
    return this._super( text, this.lastName );
  }
});

var improvedPerson = new ImprovedPerson( 'John', 'Doe' );
improvedPerson.sayName( 'To whom it may concern, I am ' );
// -> 'To whom it may concern, I am John Doe'
{% endhighlight %}

### can.Observe.delegate `observe.delegate( name, event, handler )`

[can.observe.delegate.js](https://github.com/downloads/jupiterjs/canjs/can.observe.delegate.1.0b2.js)

Use the [can.Observe.delegate](http://donejs.com/docs.html#!can.Observe.delegate) plugin
to listen to _change_, _set_, _add_ and _remove_ on any direct, child or wildcard attribute:

{% highlight javascript %}
// create an observable
var observe = new can.Observe({
  foo: {
    bar: 'Hello World',
    baz: 'Hi there'
  }
});

//listen to changes on a property
observe.delegate( 'foo.bar', 'change',
  function( ev, prop, how, newVal, oldVal ) {
    console.log( 'foo.bar has changed to ' + newVal );
});

observe.delegate( 'foo.*', 'change',
  function( ev, prop, how, newVal, oldVal ) {
    console.log( prop + ' has changed ' );
});

// change the property
observe.attr( 'foo.bar', 'Goodbye Cruel World' );
observe.attr( 'foo.baz', 'Bye you' );
{% endhighlight %}

### can.Observe.setter

[can.observe.setter.js](https://github.com/downloads/jupiterjs/canjs/can.observe.setter.1.0b2.js)

With the [can.Observe.setter](http://donejs.com/docs.html#!can.Observe.setter) plugin
you can use attribute setter methods to process the value being set:

{% highlight javascript %}
var Person = can.Observe({
  setName: function( name ) {
    return name.charAt( 0 ).toUpperCase() + name.slice( 1 );
  }
});

var instance = new Person( { name: 'john' } );
// -> instance.name now is 'John'

instance.attr( 'name', 'doe' );
// -> instance.name now is 'Doe'
{% endhighlight %}

### can.Observe.attributes

[can.observe.attributes.js](https://github.com/downloads/jupiterjs/canjs/can.observe.attributes.1.0b2.js)

The [can.Observe.attributes](http://donejs.com/docs.html#!can.Observe.attributes) plugin
allows you to specify attributes with type converters and serializers. Serializers
make it handy when preparing your data to send to the server for JavaScript objects like
dates or associations.

The following example creates a Birthday observe that defines a _birthday_ attribute of type
date. The [serialize](http://donejs.com/docs.html#!can.Observe.static.serialize) 
and [convert](http://donejs.com/docs.html#!can.Observe.static.convert) properties allows
you to implement your own conversion and serialization for each type.


{% highlight javascript %}
var Birthday = new can.Observe({
  attributes: {
    birthday: 'date'
  },
  
  serialize : {
   date : function( val, type ){
    return val.getYear() + 
     "-" + (val.getMonth() + 1) + 
     "-" + val.getDate(); 
    }
  },
  
  convert: {
    // converts string to date
    date : function( date ) {
      if ( typeof date == 'string' ) {
        //- Extracts dates formated 'YYYY-DD-MM'
        var matches = raw.match( /(\d+)-(\d+)-(\d+)/ ); 
        
        //- Parses to date object and returns
        date = new Date( matches[ 1 ], 
                         ( +matches[ 2 ] ) - 1, 
                         matches[ 3 ] ); 
      }
      
      return date;
    }
  }
}, {});


var brian = new Birthday();

// sets brian's birthday
brian.attr('birthday', '11-29-1983');

//- returns newly converted date object
var date = brian.attr('birthday');

//- returns { 'birthday': '11-29-1983' }
var seralizedObj = brian.serialize();

{% endhighlight %}
### can.Observe.validations `observe.validate( attribute, validator )`

[can.observe.validations.js](https://github.com/downloads/jupiterjs/canjs/can.observe.validations.1.0b2.js)

[can.Observe.validations](http://donejs.com/docs.html#!can.Observe.validations) adds validation to a can.Observe.
Call the _validate_ method in the _init_ constructor with the attribute name and the validation
function and then use _errors_ to retrieve the error messages:

{% highlight javascript %}
var Person = can.Model({
  findAll : 'GET /people',
  findOne : 'GET /people/{id}',
  create  : 'POST /people',
  update  : 'PUT /people/{id}',
  destroy : 'DELETE /people/{id}',
  
  init:function(){
    this.validate('name', function( name ) {
      if ( !name ) {
        return 'Name can not be empty!';
      }
    })
  }
}, { });

var john = new Person( { name : '' } );
john.errors();
// -> { name: [ 'Name can not be empty' ] }
{% endhighlight %}

### can.Observe.backup `observe.backup()`

[can.observe.backup.js](https://github.com/downloads/jupiterjs/canjs/can.observe.backup.1.0b2.js)

You can backup and restore can.Observe data using the [can.Observe.backup](http://donejs.com/docs.html#!can.Observe.backup)
plugin. To backup the observe in its current state call _backup_. To revert it back to that state use _restore_:

{% highlight javascript %}
var todo = new Todo( { name: 'do the dishes' } );
todo.backup();
todo.attr( 'name', 'Do not do the dishes' );
todo.isDirty(); // -> true
todo.restore();
todo.name // -> 'do the dishes'
{% endhighlight %}

### can.Control.plugin

[can.control.plugin.js](https://github.com/downloads/jupiterjs/canjs/can.control.plugin.1.0b2.js)

[can.Control.plugin](http://donejs.com/docs.html#!can.Control.plugin) registers a jQuery plugin function
with a given _pluginName_ that instantiates a can.Control.
For example with this can.Control:

{% highlight javascript %}
var Tabs = can.Control({
  pluginName: 'tabs'
},{
  init: function( element, options ) {},
  update: function( options ) {},
  activate: function( index ) {}
});
{% endhighlight %}

You can instantiate it by calling the plugin like this:

{% highlight javascript %}
$( '.tabs' ).tabs();
{% endhighlight %}

Once created any subsequent plugin call will trigger _update_ on your control with the options passed to the plugin.
You can also call methods on the control instance like so:

{% highlight javascript %}
// Call the activate method
$( '.tabs' ).tabs( 'activate', 0 );
{% endhighlight %}

Note that calling a method like this will return a jQuery object, not the actual return value.
You can retrieve the controller instance directly using the _.controls()_ or _.control()_ 
helpers included in this plugin.

{% highlight javascript %}
//- Returns an array of controllers on the match
var allControls = $( '.tabs' ).controls();
allControllers[ 0 ].activate( 0 );

//- Returns the first controller on the match
var control = $( '.tabs' ).control();
control.activate( 0 );
{% endhighlight %}


### can.Control.view `control.view( [ viewname ], [ data ] )`

[can.control.view.js](https://github.com/downloads/jupiterjs/canjs/can.control.view.1.0b2.js)

[can.Control.view](http://donejs.com/docs.html#!can.Control.view) renders a view from a URL in a
_views/controlname_ folder. If no viewname is supplied it uses the current action name.
If no data is provided the control instance is passed to the view. Note that you have to set
a name when creating the Control construct for _view_ to work.

{% highlight javascript %}
can.Control( 'Editor', {
  click: function( el ) {
    // renders with views/editor/click.ejs with the controller as data
    this.element.html( this.view() );
    // renders with views/editor/click.ejs with some data
    this.element.html( this.view( { name: 'The todo' } ) );
    // renders with views/editor/under.ejs
    this.element.html( this.view( 'under', [ 1, 2 ] ) );
    // renders with views/editor/under.micro
    this.element.html( this.view( 'under.micro', [ 1, 2 ] ) );
    // renders with views/shared/top.ejs
    this.element.html( this.view( 'shared/top', { phrase: 'hi' } ) );
  }
})
{% endhighlight %}

### View modifiers

jQuery uses the modifiers [after](http://api.jquery.com/after/), [append](http://api.jquery.com/append/), 
[before](http://api.jquery.com/before/), [html](http://api.jquery.com/html/), [prepend](http://api.jquery.com/prepend/), 
[replaceWith](http://api.jquery.com/replaceWith/) and [text](http://api.jquery.com/text/) to alter the content
of an element. This plugin allows you to render a can.View using these modifiers.
For example, you can render a template from the _todo/todos.ejs_ URL looking like this:

{% highlight erb %}
<% for( var i = 0; i < this.length; i++ ) { %>
  <li><%= this[ i ].name %></li>
<% } %>
{% endhighlight %}

By calling the _html_ modifier on an element like this:

{% highlight javascript %}
$( '#todos' ).html( 'todo/todos.ejs', [
  { name: 'First Todo' },
  { name: 'Second Todo' }
]);
{% endhighlight %}

### Third Party Extensions and Plugins

 - [TonfaJS](https://github.com/retro/Tonfa.js) - Glues CanJS and jQueryMobile together.

## Examples

Check out these sweet aps built in CanJS.

### Todo

![CanJS Todo App](images/examples/todo.png "CanJS Todo App")

A simple todo application written in the style of [TodoMVC](https://github.com/addyosmani/todomvc/). There is an 
implementation for each library supported by CanJS including an __extra__  Dojo, YUI, and jQuery one
using [templated event binding](#can_control-templated_event_handlers_pt_2) to bind to widget events. Todo is a good 
example of the power of [EJS's live binding](#can_ejs-live_binding).

__View the App__

- [jQuery](http://donejs.com/examples/todo/jquery/index.html)
- [jQuery with calendar widget](http://donejs.com/examples/todo/jquery-widget/index.html)
- [Dojo](http://donejs.com/examples/todo/dojo/index.html)
- [Dojo with calendar widget](http://donejs.com/examples/todo/dojo-widget/index.html)
- [Mootools](http://donejs.com/examples/todo/mootools/index.html)
- [YUI](http://donejs.com/examples/todo/yui/index.html)
- [YUI with calendar widget](http://donejs.com/examples/todo/yui-widget/index.html)
- [Zepto](http://donejs.com/examples/todo/zepto/index.html)

[View the source on github](https://github.com/jupiterjs/cantodo)

### CanPlay

![Can Play Demo](http://donejs.com/examples/player/screen.png)

A simple HTML5 video player application utilizing [Popcorn.js](http://popcornjs.org/). We set up two `can.Control` 
instances to control the `Popcorn` video as well as update the position of the player. This demo makes use of 
[Templated Event Handlers](#can_control-templated_event_handlers_pt_1) by passing the `Popcorn` wrapped video element 
to the controller instances. The controllers then bind to events using the `"{video}"` templated event handler to 
listen and interact with the `video` element.

[Player](http://donejs.com/examples/player/index.html)

### Srchr

Srchr searches several data sources for content and displays it to the user. It is built using the jQuery version of CanJS and is a great example of how to create dumb, isolated widgets that are loosely coupled to the rest of the application.

![CanJS Srchr jQuery App](images/examples/srchr.png "CanJS Srchr jQuery App")

[__View the App__](http://donejs.com/examples/srchr/index.html)

[View the source on github](https://github.com/jupiterjs/srchr)

## Get Help

There are several places you can go to ask questions or get help debugging problems.

### Twitter

Follow [@canjsus](https://twitter.com/#!/canjsus) for updates, announcements and quick answers to your questions.

### Forums

Visit the [Forums](http://forum.javascriptmvc.com/#Forum/canjs) for questions requiring more than 140 characters. CanJS has a thriving community that's always eager to help out.

### IRC

The CanJS IRC channel (`#canjs` on **irc.freenode.net**) is an awesome place to hang out with fellow CanJS developers and get your questions answered quickly.

__Help Us Help You __

Help the community help you by using the jsFiddle templates below. Just fork one of these templates and include the URL when you are asking for help.

- [jQuery](http://jsfiddle.net/donejs/qYdwR/)
- [Zepto](http://jsfiddle.net/donejs/7Yaxk/)
- [Dojo](http://jsfiddle.net/donejs/9x96n/)
- [YUI](http://jsfiddle.net/donejs/w6m73/)
- [Mootools](http://jsfiddle.net/donejs/mnNJX/)

### Get Help from Bitovi

Bitovi _(developers of CanJS)_ offers [training](http://bitovi.com/training/) and [consulting](http://bitovi.com/consulting/) for your team. They can also provide private one-on-one support staffed by their JavaScript/Ajax experts. [Contact Bitovi](contact@bitovi.com) if you're interested.

## Why CanJS

There are many libraries out there and it can be difficult 
to pick the one that's right for you.  In our humble opinion, the technology in CanJS is simply the best.  
It strikes a balance between:

 - Size
 - Ease of use
 - Safety
 - Speed
 - Flexibility

The following are the reasons to use CanJS.

### Size 

On top of jQuery, CanJS is 8.5k.  Here's some other frameworks for comparison:

 - Backbone 8.97kb (with Underscore.js)
 - Angular 24kb
 - Knockout 13kb
 - Ember 37kb
 - Batman 15kb

__Size is not everything__.  It really is what's inside that counts. And that's where we think CanJS really delivers a lot of bang for your buck.

### Ease of use

This site highlights the most important features of CanJS.  The library comes with thorough documentation
and examples on the [DoneJS documentation page](http://donejs.com/docs.html).  There are example apps for
each library and several example for jQuery. 

CanJS is also supported by Bitovi, formerly [Jupiter Consulting](http://jupiterjs.com).  We are extremely active on 
the [forums](https://forum.javascriptmvc.com/#Forum/canjs). And should the need arise, we provide support, training, and development.

### Safety

Memory safety is really important, especially in long-lived, dynamic pages. CanJS combats this menace in two important and unique ways:

__Controls that unbind event handlers auto-magically__

Using [templated event binding](#can_control-templated_event_handlers_pt_2), Controls can listen to events on objects other than their [element](#can_control-element).  For example, a tooltip listening to the window looks like:

{% highlight javascript %}
var Tooltip = can.Control({
  '{window} click': function( el, ev ) {
    // hide only if we clicked outside the tooltip
    if (!this.element.has( ev.target ) {
      this.element.remove();
    }
  }
})

// create a Tooltip
var tooltipElement = $( '<div>INFO</div>' ).appendTo( el )
var tooltipInstance = new Tooltip( tooltipElement );
{% endhighlight %}

`window` now has a reference to the control which keeps the `tooltipInstance` and everything the 
tooltip instance might reference in memory.  CanJS overwrites each library's element remove functionality
to [destroy](#can_control-destroy) controls.  Destroying a control unbinds all of its event handlers, removing any
memory leaks auto-magically.

__A model store that does not leak__

It's relatively common to load the same model instance multiple times on a single page.  For example, an
app might request todos due today and high-priority todos and render them like:

{% highlight javascript %}
can.view( 'todosList.ejs', {
  todaysTodos: Todo.findAll( { due: 'today' } ),
  criticalTodos: Todo.findAll( { type: 'critical' } )
}).then(function( frag ) {
  $( '#todos' ).html( frag );
})
{% endhighlight %}

`todosList.ejs` might look like:

{% highlight erb %}
<h2>Due Today</h2>
<% list( todaysTodos, function( todo ) { %>
  <li <%= (el) -> el.data( 'todo', todo ) %>>
    <%= todo.attr( 'name' ) %>
  </li>
<% } ) %>
<h2>Critical Todos</h2>
<% list( criticalTodos, function( todo ) { %>
  <li <%= (el) -> el.data( 'todo', todo ) %>>
    <%= todo.attr( 'name' ) %>
  </li>
<% } ) %>
{% endhighlight %}

If the result for of `Todo.findAll( { due: 'today' } )` and `Todo.findAll( { type: 'critical' } )` both share a todo instance like:

{% highlight javascript %}
{ "id" : 5, "name" : "do dishes", "due" : "today", "type" : "critical" }
{% endhighlight %}

[can.Model](#can_model) knows that this data represents the same todo and only creates one instance.  This means that a single model instance is in both lists.  By changing the todo's name or destroying it, both lists will be changed.

However, model only stores these model instances while something is binding to them.  Once nothing is bound to the model instance, they are removed from the store, freeing their memory for garbage collection.

### Speed

The importance of performance is almost impossible to exaggerate.  CanJS's guts are highly optimized. For example, it pre-processes [can.Control](#can_control) event handlers so binding is super fast.  But, it takes things to another level with the following two features:

__Model and view deferred support for parallel loading__

[Deferreds](#utilities-deferred) are simply awesome for handling asynchronous behavior.  [can.Model](#can_model) produces deferreds and [can.view](#can_view) consumes them.  With the [view modifiers](#plugins-view_modifiers) plugin, 
you can load a template and its data in parallel and render it into an element with:

{% highlight javascript %}
$( '#todos' ).html( 'todos.ejs', Todo.findAll() );
{% endhighlight %}

Hot.  You can do this without the [view modifiers plugin](#plugins-view_modifiers) like:

{% highlight javascript %}
can.view( 'todos.ejs', Todo.findAll() ).then(function( frag ) {
  $( '#todos' ).html( frag );
})
{% endhighlight %}

__Opt-in data binding__

Although [can.EJS's](#can_ejs) live-binding is super fast, setting up live data binding can be too slow in certain situations (like rendering a list of 1000 items).  EJS's live binding is opt-in.  It only turns on
if you are using the `attr` method.  If the following template binds to a `todo`'s `name` ...

{% highlight erb %}
<li> <%= todo.attr('name') %> </li>
{% endhighlight %}
  
... the following doesn't setup live-binding and renders much faster ...

{% highlight erb %}
<li> <%= todo.name %> </li>
{% endhighlight %}

### Flexibility

Your library should not break-down as your application and organization grow and 
technologies change. CanJS's flexibility will keep it valuable to you 
far into the future.

__Supports multiple libraries and frameworks__

Want to share code between a Zepto mobile app and a jQuery desktop 
app?  No problem.  CanJS code (especially models) can be shared 
across libraries, and so can skill sets!  Working on a Dojo project today and 
a YUI one tomorrow?  Don't throw away all of your skills.

__Designed for plugins__

CanJS is extracted from [JavaScriptMVC](http://javascriptmvc.com), but currently supports 
almost all of its MVC functionality through plugins.  Start small, with its basic functionality, and extend 
it with [plugins](#plugins) that handle things like:

 - setters
 - serialization / deserialization
 - jQuery plugin generation
 - validations
 - calling super methods

These plugins have forced the core to be quite extendable, making 3rd party plugin development easy.

__Engineered limber__

CanJS's tools are designed to work under almost every situation.  Your server sends back XML with strange urls?
That's ok, overwrite [can.Model.findAll](http://donejs.com/docs.html#!can.Model.static.findAll) or
[can.Model.models](http://donejs.com/docs.html#!can.Model.static.models).
Want some special teardown code for a control?
Overwrite [can.Control:destroy](http://donejs.com/docs.html#!can.Control.prototype.destroy).

But our favorite bit of flexibility is how [can.Observe](#can_observe) works with nested data.
It converts nested objects into observes automatically.  For example:

{% highlight javascript %}
var person = new can.Observe({
  name: { first: 'Justin', last: 'Meyer' },
  hobbies: [ 'programming', 'party rocking' ]
})

person.attr( 'name.first' ) //-> 'Justin'
person.attr( 'hobbies.0' ) //-> 'programming'
{% endhighlight %}

But most important, `change` events bubble, letting observes listen for when a nested property changes:

{% highlight javascript %}
person.bind( 'change', function( ev, attr, how, newVal, oldVal ) {
  attr   //-> 'name.last'
  how    //-> 'set'
  newVal //-> 'Meyer'
  oldVal //-> 'Myer'
});

person.attr( 'name.last', 'Meyer' );
{% endhighlight %}






## Developing CanJS

To develop CanJS, add features, etc, you first must install DoneJS.  DoneJS is the 
parent project of CanJS.  DoneJS is the 4.0 version of JavaSciptMVC.  It has DocumentJS and
Steal as submodules that are used to generate the documentation and build the CanJS downloads.

### Installing

 1. `fork` [CanJS on github](https://github.com/jupiterjs/canjs).
 2. Clone DoneJS with:

        git clone git@github.com:jupiterjs/donejs
        
 3. Open the donejs folder's .gitmodule file and change the URL of the `"can"` submodule:

        url = git://github.com/jupiterjs/canjs.git
        
    to your `fork`ed URL like
    
        url = git://github.com/justinbmeyer/canjs.git

 4. Install all submodules by running
   
        cd donejs
        git submodule update --init --recursive

    Depending on your version of git, you might need to cd into each submodule and run `git checkout`.

### Developing

After [installing](#developing_canjs-installing) CanJS and DoneJS, you'll find 
CanJS's files in a `can` folder.  Within `can`, you'll find a folder for each feature of CanJS: `construct`, `control`, `model`, etc.

Within each _feature_ folder, for example `construct`, you'll find a file for:

 - the implementation of the feature - `construct.js`
 - a demo of the feature - `construct.html`
 - an overview documentation page - `construct.md`
 - the feature's tests - `construct_test.js`
 - a page to run those tests - `qunit.html`

Any plugins for that feature will be folders within the feature's folder.  Ex: `proxy`, `super`.

The `can/test` folder contains:

 - test pages for CanJS against each library: `can_dojo.html`, `can_jquery.html`, etc. 
 - a test page that tests all libraries and plugins: `test.html`
 - a file that loads all _feature_ tests: `can_test.js`

The `can/util` folder contains the compatibility layer for each library.

To develop CanJS:

 1. Edit the _feature's_ file.
 2. Add tests to the _feature's_ test file.
 3. Open the feature's test page. Make sure it passes.
 4. Open `can/test/test.html` in every browser to test everything.
 5. Submit a pull request!

### Documentation

To edit CanJS.us, installing CanJS and DoneJS is not necessary.  Simply `fork` and edit the 
github pages's [index.md page](https://github.com/jupiterjs/canjs/blob/gh-pages/index.md) online.  Don't forget to 
submit a pull request.

To edit the documentation at [DoneJS.com](http://doneJS.com/docs.html):

 1. [install](#developing_canjs-installing) CanJS and DoneJS.
 2. Edit the markdown and js files in the [CanJS github repo](https://github.com/jupiterjs/canjs).  For example, to edit [can.Control's overview page](http://donejs.com/docs.html#!can.Control),
change [can/control/control.md](https://github.com/jupiterjs/canjs/blob/master/control/control.md).  To edit [can.Control's destroy method](http://donejs.com/docs.html#!can.Control.prototype.destroy), 
change [can/control/control.js](https://github.com/jupiterjs/canjs/blob/master/control/control.js#L939) 
where you find the `destroy` comment.
 3. Generate the docs with:

        js jmvc/scripts/doc.js
    
    View them at `jmvc/docs.html`
    
 4. Submit a pull request.

### Making a build

To make the CanJS builds, run:

    js can/util/make.js
    
It puts the downloads in `can/dist/edge`.

### List of heroes

The following lists everyone who's contributed something to CanJS.  If we've forgotten you, please add yourself.

First, thanks to everyone who's contributed to [JavaScriptMVC](https://github.com/jupiterjs/javascriptmvc/contributors) 
and [jQueryMX](https://github.com/jupiterjs/jquerymx/contributors), and the people at 
[Bitovi](http://bitovi.com/people/).  You deserve heaps of recognition as CanJS is direcly based 
off JavaScriptMVC.  This page is for contributors after CanJS's launch.

[yusufsafak](https://github.com/yusufsafak) - [observe bindings](https://github.com/jupiterjs/canjs/pull/30).  
[verto](https://github.com/verto) - [destroy fix](https://github.com/jupiterjs/canjs/pull/32).  
[WearyMonkey](https://github.com/WearyMonkey) - [recursive observes](https://github.com/jupiterjs/canjs/issues/27).  
[cohuman](https://github.com/cohuman) - [model list dependencies](https://github.com/jupiterjs/canjs/pull/23), [docco fix](https://github.com/jupiterjs/canjs/pull/26).  

### Change Log

__master__

 - can.util
    - add: [a util/function plugin](https://github.com/jupiterjs/canjs/commit/75e99f3b1545d4086ccdae259ccc87a3e8e7a018)

__1.0 Beta 2__

 - can.util
    - change: [reverse argument order of can.each](https://github.com/jupiterjs/canjs/commit/234fd3b9eca18abdbc3fdbea114be6a818bfe6e3)
    - change/fix: [buildFragment returns non cached frag](https://github.com/jupiterjs/canjs/issues/33)
    - fix: [zepto's isEmptyObject was broke](https://github.com/jupiterjs/canjs/commit/7fe391f59a1f54e3f197f31e20276646f82e7f2e)
 - can.observe
    - feature: [recursive observes don't blow up](https://github.com/jupiterjs/canjs/issues/27)
    - change: [reverse argument order of can.each](https://github.com/jupiterjs/canjs/commit/234fd3b9eca18abdbc3fdbea114be6a818bfe6e3)
    - fix: [attr change events have old value](https://github.com/jupiterjs/canjs/commit/4081a9baf4441c1002467342baae3cdd885994c6)
   
 - can.model
    - fix: [findOne and findAll work with super](https://github.com/jupiterjs/canjs/commit/c93ae5478eea7fdb88fa6fc03211d81c8d4ca3bd)
    - fix: [model using custom id for store](https://github.com/jupiterjs/canjs/commit/14d05c29e71ed8c462ba49b740d9eb8e342d3c85)
    - fix: [destroy not working with templated id](https://github.com/jupiterjs/canjs/issues/32)

 - can.route
    - fix: a host of bugs in libaries other than jQuery because can.route was not properly tested in other libraries.
    - fix: can.param fixed in [dojo](https://github.com/jupiterjs/canjs/commit/77dfa012b2f6baa7dfb0fe84f2d62aeb5b04fc90), 
   
__1.0 Beta 1__ (April 1st 2011)

Released!