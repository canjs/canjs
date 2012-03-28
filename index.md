---
layout: default
---
# Welcome to CanJS!

CanJS is an MIT-licensed, client-side, JavaScript framework that makes building rich web applications easy.  It provides:

 - __can.Construct__  - inheritable constructor functions
 - __can.Observe__ - key-value binding
 - __can.Model__ - observes connected to a RESTful JSON interface
 - __can.view__ - template loading, caching, rendering
 - __can.EJS__ - live binding templates
 - __can.Control__ - declarative event bindings
 - __can.route__ - back button and bookmarking support

It also includes a rich set of supported [extensions and plugins](#plugins).

## Get Canned

CanJS's core supports jQuery, Zepto, Dojo, YUI and Mootools.  Select your download 
for the library you are using:

 - [can.jquery.js](http://staging.donejs.com/can/dist/can.jquery-edge.js) (8k) \[[dev](http://donejs.com/can/dist/can.jquery-dev-edge.js)\]
 - [can.zepto.js](http://staging.donejs.com/can/dist/can.zepto-edge.js) (9k)
 - [can.dojo.js](http://staging.donejs.com/can/dist/can.dojo-edge.js) (9k)
 - [can.mootools.js](http://staging.donejs.com/can/dist/can.mootools-edge.js) (9k)
 - [can.yui.js](http://staging.donejs.com/can/dist/can.yui-edge.js) (9k)

This page walks through the basics of CanJS by building a 
small todo app with CanJS and jQuery.  The [Use with other libraries](#use_with_other_libraries) section details 
the minor differences among use with other libraries.

## can.Construct `can.Construct([classProperties,] [prototypeProperties])`

Constructor function made with [can.Construct](http://donejs.com/docs.html#!can.Construct) are used to create
objects with shared properties. It's used by both __can.Control__ and __can.Model__.

To create a constructor function of your own, call __can.Construct__ with the:

- __classProperties__ that are attached directly to the constructor, and
- instance __prototypeProperties__.

__can.Construct__ sets up the prototype chain so subclasses can be further 
extended and sub-classed as far as you like:


{% highlight javascript %}
var Todo = can.Construct({
  init : function(){},
  
  author : function(){ ... },
  
  coordinates : function(){ ... },
  
  allowedToEdit: function(account) { 
    return true;
  }
});
  
var PrivateTodo = Todo({
  allowedToEdit: function(account) {
    return account.owns(this);
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
  init : function(text) {
    this.text = text
  },
  read : function(){
    console.log(this.text);
  }
})
  
var todo = new Todo("Hello World");
todo.read()
{% endhighlight %}

## can.Observe `new can.Observe( data )`

[can.Observe](http://donejs.com/docs.html#!can.Observe) provides the observable pattern for JavaScript Objects. It lets you:

 - Set and remove property values on objects.
 - Listen for property changes.
 - Work with nested properties.

To create an observable object, use `new can.Observe( [data] )` like:

{% highlight javascript %}
var paginate = new can.Observe({offset: 0, limit : 100, count: 2000})
{% endhighlight %}

To create an observable array, use `new can.Observe.List( [array] )` like:

{% highlight javascript %}
var hobbies = new can.Observe.List(['programming', 
                             'basketball', 
                             'party rocking'])
{% endhighlight %}

__can.Observe__ is used by both __can.Model__ and __can.route__. However, observe 
is useful on its own to maintain client-side state (such as pagination data). 

### attr `observe.attr( [name,] [value] )`

[can.Observe.prototype.attr](http://donejs.com/docs.html#!can.Observe.prototype.attr) reads or 
sets properties on an observe:

{% highlight javascript %}
paginate.attr('offset') //-> 0
  
paginate.attr('offset', 100 );
  
paginate.attr() //-> {offset: 100, limit : 100, count: 2000}
  
paginate.attr({limit: 200, count: 1000});
{% endhighlight %}


### removeAttr `observe.removeAttr( name )`

[can.Observe.prototype.removeAttr](http://donejs.com/docs.html#!can.Observe.prototype.removeAttr) removes a property 
by name from an observe.  This is similar to using the `delete` keyword to remove a property.

{% highlight javascript %}
o =  new can.Observe({foo: 'bar'});
o.removeAttr('foo'); //-> 'bar'
{% endhighlight %}

### bind `observe.bind( eventType, handler(args...) )`

[can.Observe.prototype.bind](http://donejs.com/docs.html#!can.Observe.prototype.bind) listens to
changes on a __can.Observe__.  There are two types of events triggered as a 
result of an attribute change:

 - `change` events - a generic event so you can listen to any property change and how it was changed
 - `ATTR_NAME` events - bind to specific attribute changes

The following listens to all attribute changes and 'offset' changes on the paginate instance:

{% highlight javascript %}
paginate.bind('change', function(ev, attr, how, newVal, oldVal){
   // attr = 'offset'
   // how = 'set'
   // newVal = 200
   // oldVal = 100
}).bind('offset', function(ev, newVal, oldVal){
   // newVal = 200
   // oldVal = 100
})
paginate.attr('offset', 200);
{% endhighlight %}

### unbind `observe.unbind( eventType, handler )`

[can.Observe.prototype.unbind](http://donejs.com/docs.html#!can.Observe.prototype.unbind) stops listening
to an event.  The same function that was used for the handler in `bind` must be passed to `unbind`.

{% highlight javascript %}
var countHandler = function(ev, newVal, oldVal){
  console.log("the count has changed");
}
paginate.bind('count',countHandler);
paginate.attr('count', 3000);
paginate.unbind('count', countHandler);
{% endhighlight %}  

### each `observe.each( handler(attrName, value) )`

[can.Observe.prototype.each](http://donejs.com/docs.html#!can.Observe.prototype.each) iterates through 
each attribute, calling handler with each attribute name and value.

{% highlight javascript %}
paginate.each(function(name, value){
   console.log( name, value);
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
 - [push](http://donejs.com/docs.html#!can.Observe.List.prototype.push) `list.push(items...)` - adds items to the end of the list.
 - [shift](http://donejs.com/docs.html#!can.Observe.List.prototype.shift) `list.shift()` - removes the first item in the list.
 - [splice](http://donejs.com/docs.html#!can.Observe.List.prototype.splice) `list.splice(index, howMany, [items...])` - removes and inserts items at the specified index.
 - [unshift](http://donejs.com/docs.html#!can.Observe.List.prototype.unshift) `list.unshift(items...)` - adds items to the start of the list.

{% highlight javascript %}
var hobbies = new can.Observe.List(['programming', 
                               'basketball', 
                               'party rocking'])
                               
// listen to changes in the list
hobbies.bind("add", function(ev, newVals, index){
  console.log("added",newVals,"at",index);
}).bind("remove", function(ev, oldVals, index){
  console.log("removed",oldVals,"at",index);
})

// modify the list
hobbies.pop()
hobbies.unshift("rocking parties")
{% endhighlight %}  

## can.Model `can.Model([classProperties,] [prototypeProperties])`

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
  findAll : "GET /todos",
  findOne : "GET /todos/{id}",
  create  : "POST /todos",
  update  : "PUT /todos/{id}",
  destroy : "DELETE /todos/{id}"
},
{})
{% endhighlight %}

### init `new can.Model(attributes)`

Create a todo instance like:


{% highlight javascript %}
var todo = new Todo({name: "do the dishes"});
{% endhighlight %}

### attr `model.attr( name, [value] )`

[can.Model.prototype.attr](http://donejs.com/docs.html#!can.Model.prototype.attr) reads or sets properties 
on model instances.  It works the same way as [can.Observe.prototype.attr](#can_observe-attr).


{% highlight javascript %}
todo.attr("name") //-> "do the dishes"

todo.attr("name", "wash the dishes" );

todo.attr() //-> {name: "wash the dishes"}

todo.attr({name: "did the dishes"});
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
Todo.findAll({}, function( todos ) {
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
Todo.findOne({id: 1}, function( todo ) {
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
todo.save(function(todo){
  console.log( todo );
})
{% endhighlight %}

This makes a request to `POST /todos` with `name=mow lawn` and should get a response with the __id__ like:

{% highlight javascript %}
{ "id" : 5 }
{% endhighlight %}

__save__ calls back with the original todo instance and returns a deferred that resolves
with the todo after it has been created on the server.


To __update__ a todo on the server, change the attributes
and call __save__ again like the following:

{% highlight javascript %}
var todo = new Todo({name: "mow lawn"});
todo.save( function(todo){
  console.log("created", todo );
  
  todo.attr("name", "mow my lawn")
  todo.save( function( todo ) {
    console.log("updated", todo );
  })
})
{% endhighlight %}

This makes a request to `POST /todos/5` with `name=mow my lawn` and only needs to get a successful response.

### destroy `todo.destroy( success( todo ), error() ) -> Deferred`

[can.Model.prototype.destroy](http://donejs.com/docs.html#!can.Model.prototype.destroy) deletes a 
record on the server.  You can do this like:

{% highlight javascript %}
var todo = new Todo({name: "mow lawn"});
todo.save( function(todo){
  console.log("created", todo );
  
  todo.destroy( function( todo ) {
    console.log("destroyed", todo );
  })
})
{% endhighlight %}

This makes a request to `DELETE /todos/5` and only needs a successful response.  Like __save__, the 
callback's `todo` parameter is the destroyed instance and a deferred is returned that
resolves with the `todo` after it has been destroyed by the server.


### bind `model.bind( event, handler( ev, model ) ) -> model`

[can.Model.prototype.bind](http://donejs.com/docs.html#!can.Model.prototype.bind)
listens to changes in a model instance's attributes in the same way as 
[Observe's bind](#can_observe-bind).  For example:

{% highlight javascript %}
todo.bind("name", function(ev, newVal, oldVal){
  console.log("name changed to", newVal);
})
{% endhighlight %}

In addition to Observe's events, Model also supports three new events:

- __created__ - an instance is created on the server
- __updated__ - an instance is updated on the server
- __destroyed__ - an instance is destroyed on the server

For example, listen for 
when an instance is __created__ on the server like:

{% highlight javascript %}
var todo = new Todo({name: "mow lawn"});
todo.bind('created', function(ev, todo){
  console.log("created", todo );
})
todo.save()
{% endhighlight %}

[can.Model.bind](http://donejs.com/docs.html#!can.Model.static.bind) lets you listen for 
anytime __any__ instance is __created__, __updated__, or __destroyed__:

{% highlight javascript %}
Todo.bind('created', function(ev, todo){
  console.log("created", todo );
})
{% endhighlight %}


### can.Model.List `new can.Model.List( items )`

[can.Model.List](http://donejs.com/docs.html#!can.Model.List) is a 
[can.Observe.List](#can_observe-can_observe_list) that automatically removes items when they are 
destroyed.  __Model.Lists__ are return by [findAll](#can_model-findall).

{% highlight javascript %}
Todo.findAll({}, function(todos){

  // listen for when a todo is removed
  todos.bind("remove", function(ev, removed, index){
    console.log("removed", removed.length, "todos");
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
  
It returns the rendered result of the template as a documentFragment.  

{% highlight javascript %}
document.getElementById("todos")
  .appendChild( can.view("todos.ejs", [{name: "mow lawn"}] ) )
{% endhighlight %}

`can.view` supports multiple templating languages; however, [can.EJS](#can_ejs)
is packaged with CanJS and supports live-binding of [can.Observe](#can_observe).

### Loading Templates

`can.view` loads templates from a URL or a script tag. To load from
a __script__ tag, create a script tag with the template contents, an id, 
and a type attribute that specifies the template type (text/ejs).

For example, add the following __html__:

{% highlight erb %}
<script type='text/ejs' id='todosEJS'>
  <% for(var i = 0; i < this.length; i++ ){ %>
    <li><%= this[i].name %></li>
  <% } %>
</script>
{% endhighlight %}

Render this template and insert it into the page:

{% highlight javascript %}
Todo.findAll( {}, function( todos ){
   document.getElementById("todos")
           .appendChild( can.view( "todosEJS", todos ) );
});
{% endhighlight %}

To load from a __URL__,  create
a _todos/todos.ejs_ file that contains:

{% highlight erb %}
<% for(var i = 0; i < this.length; i++ ){ %>
  <li><%= this[i].name %></li>
<% } %>
{% endhighlight %}

Render this with:

{% highlight javascript %}
Todo.findAll( {}, function( todos ){
  document.getElementById("todos")
           .appendChild( can.view( "todos/todos.ejs", todos ) );
});
{% endhighlight %}

### Deferreds

__can.view__ accepts [deferreds](#utilities-deferred).  If the `data` argument is a deferred or an object
that contains deferreds, __can.view__ returns a deferred that resolves to the documentFragment after
all deferreds have resolved and the template has loaded.

[can.Model.findAll](#can_model-findall) returns deferreds. This means that the following loads `todos/todos.ejs`, `Todo.findAll` and `User.findOne`
in parallel and resolves the returned deferred with the documentFragment when they are all done:

{% highlight javascript %}
can.view('todos/todos.ejs', {
  todos : Todo.findAll(),
  user: User.findOne({ id: 5 })
}).then(function( frag ){
  document.getElementById('todos')
          .appendChild(frag);
})
{% endhighlight %}
    

### render `can.view.render( idOrUrl, data )`

To render a string instead of a documentFragment, use can.view.render like:

{% highlight javascript %}
<% for( var i = 0; i < todos.length; i++) %>
  <li><%== can.view.render("/todos/todo.ejs",{
             todo: todo[i]
            }) %>
  </li>
<% }) %>
{% endhighlight %}

## can.EJS `new can.EJS( options )`

[can.EJS](http://donejs.com/docs.html#!can.EJS) is CanJS's default template 
language and used with [can.view](#!can_view).  It provides live binding
when used with [can.Observes](#can_observe).  A __can.EJS__ template looks
like the HTML you want, but with __magic tags__ where you want
dynamic behavior.  The following lists todo elements:

{% highlight erb %}
<script type='text/ejs' id='todosEJS'>
<% for( var i = 0; i < this.length; i++) %>
  <li><%= this[i].name %></li>
<% }) %>
</script>
{% endhighlight %}

Use __can.view__ to render this template:

{% highlight javascript %}
Todo.findAll({}, function( todos ) {
  document.getElementById("todos")
          .appendChild( can.view("todosEJS", todos ) )
}
{% endhighlight %}

Notice that `this` in the template is the list of todos.  The `data` argument passed __can.view__ 
becomes `this` in EJS.  EJS can also access any properties of `this` 
directly (without writing `this.PROPERTY` all the time).  For example, a template that lists the user's name
and todos:

{% highlight erb %}
<script type='text/ejs' id='todosEJS'>
<h2><%= user.name %></h2>
<% for( var i = 0; i < todos.length; i++) { %>
  <li><%= todos[i].name %></li>
<% } %>
</script>
{% endhighlight %}

Can be inserted into the document with:

{% highlight javascript %}
can.view("todosEJS", {
  todos : Todo.findAll(),
  user: User.findOne({ id: 5 })
}).then(function( frag ){
  document.getElementById("todos")
          .appendChild(frag);
})
{% endhighlight %}

### Magic Tags

EJS uses 5 types of magic tags:

__`<% CODE %>`__ - Runs JS Code.

This type of magic tag does not modify the template but is used for JS control statements 
like for-loops, if/else, switch, declaring variables, etc.  Pretty much any JS code is valid.  Examples:

{% highlight erb %}
<!-- check if there are no todos -->
<% if( todos.attr('length') === 0 ) { %>
    <li>You have no todos</li>
<% } else { %>
    <% list(todos, function(){ %>
        <li> .... </li>
    <% }) %>
<% } %>

<!-- create and use a variable -->
<% var person = todo.attr('person') %>
<span><%= person.attr('name') %><span>
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
<% for( var i = 0; i < todos.length; i++) { %>
  <li><%== can.view.render('todoEJS', todos[i]) %></li>
<% } %>
{% endhighlight %}

### Live Binding

__can.EJS__ will automatically update itself when [can.Observes](#can_observe) change.  To enable
live-binding, use [attr](#!can_observe-attr) to read properties.  For example, the following
template will update todo's name when it change:

{% highlight erb %}
  <li><%= todo.attr("name") %></li>
{% endhighlight %}

Notice `attr("name")`.  This sets up live-binding.  If you change the todo's name, the `<li>` will automatically
be updated:

{% highlight javascript %}
todo.attr("name", "Clean the toilet");
{% endhighlight %}

Live-binding works by wrapping the code inside the magic tags with a function to call when the attribute (or attributes)
are changed.  This is important to understand because a template like this will not work:

{% highlight erb %}
<% for( var i = 0; i < todos.length; i++) { %>
  <li><%= todos[i].attr("name") %></li>
<% } %>
{% endhighlight %}

This does not work because when the function wrapping `todos[i].attr("name")` is called, `i` will be __3__ not the index
of the desired todo.  Fix this by using a closure like:

{% highlight erb %}
<% $.each(todos, function(i, todo){ %>
  <li><%= todo.attr("name") %></li>
<% }) %>
{% endhighlight %}

### list `list( observeList, iterator( item, index ) )`

If you want to make the previous template update when todos are 
added or removed, you could bind to length like:

{% highlight erb %}
<% todos.bind("length", function(){});
   $.each(todos, function(i, todo){ %>
      <li><%= todo.attr("name") %></li>
<% }) %>
{% endhighlight %}

Or simply use EJS's `list` helper method like:

{% highlight erb %}
<% list(todos, function(todo){ %>
  <li><%= todo.attr("name") %></li>
<% }) %>
{% endhighlight %}

Now when todos are added or removed from the todo list, the template's HTML is updated:

{% highlight javascript %}
// add an item
todos.push( new Todo({name : "file taxes"}) );

// destroying an item removes it from Model.Lists
todos[0].destroy()
{% endhighlight %}

### Element Callbacks

If a function is returned by the `<%= %>` or `<%== %>` magic tags within an element's tag like:

{% highlight erb %}
<div <%= function(element){ element.style.display = "none" } %> >
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
<div <%= (el)-> el.hide() %> >
  Hello
</div>
{% endhighlight %}

This technique is commonly used to add data, especially model instances, to an element like:

{% highlight erb %}
<% list(todos, function(todo){ %>
  <li <%= (el) -> el.data("todo",todo) %>>
    <%= todo.attr('name') %>
  </li>
<% }) %>
{% endhighlight %}

jQuery's `el.data( NAME, data )` adds data to an element.  If your library does not support this,
can provides it as `can.data( NodeList, NAME, data )`.  Rewrite the above example as:

{% highlight erb %}
<% list(todos, function(todo){ %>
  <li <%= (el) -> can.data(el, "todo", todo) %>>
    <%= todo.attr('name') %>
  </li>
<% }) %>
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
  "init" : function( element , options ) {
    var self = this;
    Todo.findAll({}, function( todos ){
      self.element.html( can.view("todosEJS", todos) )
    })
  }
})
{% endhighlight %}

Create an instance of the Todos on the `#todos` element with:

{% highlight javascript %}
var todosControl = new Todos("#todos", {});
{% endhighlight %}

__todos.ejs__ looks like:

{% highlight erb %}
<% list(todos, function(todo){ %>
  <li <%= (el) -> el.data("todo", todo) %> >
    <%= todo.attr("name") %>
    <a href='javascript://' class='destroy'>X</a>
  </li>
<% }) %>
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
  defaults : {view: "todos.ejs"}
},{
  "init" : function( element , options ){
    var self = this;
    Todo.findAll({},function(todos){
      self.element.html( can.view( self.options.view, todos ) )
    });
  }
})

// create a Todos with default options
new Todos( document.body.firstElementChild );

// overwrite the template option
new Todos( $("#todos"), {view: "specialTodos.ejs"})
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
  'init' : function( element , options ){
    var self = this;
    Todo.findAll({},function(todos){
      self.element.html( can.view('todosEJS', todos ) )
    });
  },
  'li click' : function(li, event){
    console.log('You clicked', li.text() )
    
    // let other controls know what happened
    li.trigger('selected');
  }
})
{% endhighlight %}

When an `<li>` is clicked, `'li click'` is called with:

- The library-wrapped __element__ that was clicked.
- The __event__ data

Control uses event delegation, so you can add `<li>`s without needing to rebind
event handlers.

To destroy a todo when it's `<a href='javascript:// class='destroy'>` link 
is clicked:

{% highlight javascript %}
var Todos = can.Control({
  'init' : function( element , options ){
    var self = this;
    Todo.findAll({},function(todos){
      self.element.html( can.view('todosEJS', todos ) )
    });
  },
  'li click' : function(li){
    li.trigger('selected', li.model() );
  },
  'li .destroy click' : function(el, ev){
    // get the li element that has todo data
    var li = el.closest('li');
  
    // get the model
    var todo = li.data('todo')
  
    // destroy it
    todo.destroy();
  }
})
{% endhighlight %}

When the todo is destroyed, EJS's live binding will remove it's LI automatically.

### Templated Event Handlers Pt 1 `"{optionName}"`

Customize event handler behavior with `"{NAME}"` in
the event handler name.  The following allows customization 
of the event that destroys a todo:

{% highlight javascript %}
var Todos = can.Control('Todos',{
  'init' : function( element , options ){ ... },
  'li click' : function(li){ ... },
  
  'li .destroy {destroyEvent}' : function(el, ev){ 
    // previous destroy code here
  }
})

// create Todos with this.options.destroyEvent
new Todos('#todos',{destroyEvent: 'mouseenter'})
{% endhighlight %}

Values inside `{NAME}` are looked up on the control's `this.options`
and then the `window`.  For example, we could customize it instead like:

{% highlight javascript %}
var Todos = can.Control('Todos',{
  'init' : function( element , options ){ ... },
  'li click' : function(li){ ... },
  
  'li .destroy {Events.destroy}' : function(el, ev){ 
    // previous destroy code here
  }
})

// Events config
Events = {destroy: 'click'};

// Events.destroy is looked up on the window.
new Todos('#todos')
{% endhighlight %}

The selector can also be templated.

### Templated Event Handlers Pt 2 `"{objectName}"`

Control can also bind to objects other than `this.element` with
templated event handlers.  This is _critical
for avoiding memory leaks that are common among MVC applications.  

If the value inside `{NAME}` is an object, that object will be 
bound to.  For example, the following tooltip listens to 
clicks on the window:

{% highlight javascript %}
var Tooltip = can.Control({
  '{window} click' : function(el, ev){
    // hide only if we clicked outside the tooltip
    if(! this.element.has(ev.target ) {
      this.element.remove();
    }
  }
})

// create a Tooltip
new Tooltip( $('<div>INFO</div>').appendTo(el) )
{% endhighlight %}
    
This is convenient when needing to 
listen to model changes.  If EJS was not taking care of
removing `<li>`s after their model is destroyed, we
could implement it in `Todos` like:

{% highlight javascript %}
var Todos = can.Control({
  'init' : function( element , options ){
    var self = this;
    Todo.findAll({},function(todos){
      self.todosList = todos;
      self.element.html( can.view('todosEJS', todos ) )
    })
  },
  'li click' : function(li){
    li.trigger('selected', li.model() );
  },
  'li .destroy clickæ : function(el, ev){
    // get the li element that has todo data
    var li = el.closest('li');
  
    // get the model
    var todo = li.data('todo')
  
    //destroy it
    todo.destroy();
  },
  '{Todo} destroyed' : function(Todo, ev, todoDestroyed) {
    // find where the element is in the list
    var index = this.todosList.indexOf(todoDestroyed)
    this.element.children(':nth-child('+(index+1)+')')
        .remove()
  }
})

new Todos('#todos');
{% endhighlight %}

### destroy `control.destroy()`

[can.Control.prototype.destroy](http://donejs.com/docs.html#!can.Control.prototype.destroy) unbinds a control's
event handlers and releases its element, but does not remove 
the element from the page. 

{% highlight javascript %}
var todo = new Todos('#todos')
todo.destroy();
{% endhighlight %}

When a control's element is removed from the page,
__destroy__ is called automatically.

{% highlight javascript %}
new Todos('#todos')
$('#todos').remove();
{% endhighlight %}
    
All event handlers bound with Control are unbound when the control 
is destroyed (or its element is removed).

A brief aside on destroy and templated event binding: Taken 
together, templated event binding and Control's automatic
clean-up make it almost impossible 
to write leaking applications. An application that uses
only templated event handlers on controls within the body
could free up all 
data by calling `$(document.body).empty()`.

### on `control.on()`

[can.Control.prototype.on](http://donejs.com/docs.html#!can.Control.prototype.on) rebinds a control's event handlers.  This is useful when you want
to listen to a specific model and change it.

The following `Editor` widget's __todo__ method updates the todo option and then calls `on()` to 
rebind `'{todo} updated'`.

{% highlight javascript %}
var Editor = can.Control({
  todo : function(todo){
    this.options.todo = todo;
    this.on();
    this.setName();
  },
  // a helper that sets the value of the input
  // to the todo's name
  setName : function(){
    this.element.val(this.options.todo.name);
  },
  // listen for changes in the todo
  // and update the input
  '{todo} updated' : function(){
    this.setName();
  },
  // when the input changes
  // update the todo instance
  'change' : function(){
    var todo = this.options.todo
    todo.attr('name',this.element.val() )
    todo.save();
  }
});

var todo1 = new Todo({id: 6, name: 'trash'}),
    todo2 = new Todo({id: 6, name: 'dishes'});

// create the editor
var editor = new Editor('#editor');

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
can.route.attr({ type : 'todos' })

// the hash changes to reflect the route data
window.location.hash //-> #!type=todos

// set a property on the hash
can.route.attr('id', 5)

// the hash changes again to reflect the route data
window.location.hash //-> #!type=todos&id=5
{% endhighlight %}

Use `can.route( route, defaults )` to make pretty URLs:

{% highlight javascript %}
// create a route
can.route(':type/:id')

// set the hash to look like the route
window.location.hash = '#!todo/5'

// the route data changes accordingly
can.route.attr() //-> { type: 'todo', id: 5 }

// change the route data with properties
// used by the route
can.route.attr({type: 'user', id: 7})

// the hash is changed to reflect the route
window.location.hash //-> '#!user/7'

// create a default route
can.route('', { type : 'recipe' })

// empty the hash
window.location.hash = '';

// the route data reflects the default value
can.route.attr() //-> { type : 'recipe' })
{% endhighlight %}

### bind `route.bind( eventName, handler( event ) )`

Use [bind](#can_observe-bind) to listen to changes in the route like:

{% highlight javascript %}
can.route.bind('id', function( ev, newVal ) {
  console.log('id changed');
});
{% endhighlight %}

### route events

Listen to routes in controls with special "route" events like:

{% highlight javascript %}
var Routing = can.Control({
  'route' : function(){
    // matches empty hash, #, or #!
  },
  'todos/:id route' : function(data){
    // matches routes like #!todos/5
  }
})

// create routing control
new Routing(document.body);
{% endhighlight %}

The `route` methods get called back with the route __data__.  The 
empty `"route"` will be called with no data. But, `"todos/:id route"`
will be called with data like: `{id: 6}`.

We can update the route by changing can.route's data like:

{% highlight javascript %}
can.route.attr('id','6') // window.location.hash = #!todos/6
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
var link = can.route.link('Todo 5',
                    { id: 5 }, 
                    { className : 'button' });

link //-> <a href="#!todos/7" class="button">Todo 5</a>
{% endhighlight %}


The following enhances the Routing control to listen for
`".todo selected"` events and change __can.route__.  When the
can.route changes, it retrieves the todo from the server
and updates the editor widget.

{% highlight javascript %}
var Routing = can.Control({
  init : function(){
    this.editor = new Editor('#editor')
    new Todos('#todos');
  },
  // the index page
  'route' : function(){
     $('#editor').hide();
  },
  'todos/:id route' : function(data){
    $("#editor").show();
    var self = this;
    Todo.findOne(data, function(todo){
      this.editor.update({todo: todo});
    })
  },
  '.todo selected' : function(el, ev, todo){
    can.route.attr('id',todo.id);
  }
});

// create routing control
new Routing(document.body);
{% endhighlight %}

The __Routing__ control is a traditional controller. It coordinates
among the `can.route`, `Editor` and `Todos`.  `Editor` and `Todos`
are traditional views, consuming models.

If you can understand this, you understand 
everything. Congrats! [See it in action](http://donejs.com/docs.html#!tutorials/rapidstart/todos.html).


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
can.getObject('foo.bar', [{foo: {bar : 'zed'}}]) //-> 'zed'

// capitalize a string
can.capitalize('fooBar') //-> 'FooBar'

// micro templating
can.sub('{greet} world', {greet: 'hello'}) //-> 'hello world'

// deparams a form encoded URL into an object
can.deparam('foo=bar&hello=world')
    //-> {foo: 'bar', hello: 'world'}
{% endhighlight %}

### Array Helpers

{% highlight javascript %}
// convert array-like data into arrays
can.makeArray({0: "zero", 1: 'one', length: 2}) // -> ['zero', 'one']
  
// return if an array is an array
can.isArray([]) //-> true
  
// converts one array to another array
can.map([{prop: 'val1'}, {prop: 'val2'}], function(val, prop){
  return val
})  //-> ['val1', 'val2']
  
// iterates through an array
can.each([{prop: 'val1'}, {prop: 'val2'}], function( index, value ) {
  // function called with
  //  index=0 value={prop: 'val1'}
  //  index=1 value={prop: 'val2'}
})
{% endhighlight %}

### Object Helpers

{% highlight javascript %}
// extends one object with the properties of another
var first = {},
    second = {a: 'b'},
    third = {c: 'd'};
can.extend(first, second, third); //-> first
first  //-> {a: 'b', c : 'd'}
second //-> {a: 'b'}
third  //-> {c: 'd'}
  
// deep extends one object with another
can.extend( true, first, second, third ); 
  
// parameterize into a query string
can.param({a: 'b', c: 'd'}) //-> 'a=b&c=d'
  
// returns if an object is empty
can.isEmptyObject({})      //-> true
can.isEmptyObject({a: 'b'}) //-> false
{% endhighlight %}

### Function Helpers

{% highlight javascript %}
// returns a function that calls another function
// with 'this' set.
var func = can.proxy(function(one){
  return this.a + one
}, {a: 'b'}); 
func('two') //-> 'btwo'

// returns if an object is a function
can.isFunction({})           //-> false
can.isFunction(function(){}) //-> true
{% endhighlight %}

### Event Helpers

{% highlight javascript %}
// binds handler on obj's eventName event
can.bind(obj, eventName, handler)

// unbind handler on obj's eventName event
can.unbind(obj, eventName, handler) 
  
// binds handler on all elements' eventName event that match selector
can.delegate(obj, selector, eventName, handler)
  
// unbinds handler on all elements' eventName event that match selector in obj
can.undelegate(obj, selector, eventName)
  
// executes all handlers attached to obj for eventName
can.trigger(obj, eventName, args)
{% endhighlight %}

### Deferred

{% highlight javascript %}
// creates a new Deferred object
var deferred = new can.Deferred()

// pipes a deferred into another deferred
deferred.pipe(function(){

}, function(){})

// resolves a deferred, deferreds piped into the deferred also become resolved
deferred.resolve()
  
// rejects a deferred, deferreds piped into the deferred also become rejected
deferred.reject()
  
// used to execute callback functions when all passed deferreds become resolved
can.When()
{% endhighlight %}


### Ajax

// performs an asynchronous HTTP request
{% highlight javascript %}
can.ajax({
  url : "url",
  type: "GET", // "POST"
  async : false,
  dataType: "json",
  success: function(){},
  error: function(){}
}) //-> deferred
{% endhighlight %}

### HTMLElement Helpers

{% highlight javascript %}
can.buildFragment(frags, nodes)

// a node list
can.$("div.bar") //-> []

// appends html to the HTMLElements in the NodeList
can.append(NodeList, html)
  
// removes the HTMLElements in the NodeList from the DOM  
can.remove(NodeList)
  
// stores arbitrary data to the HTMLElements in the NodeList  
can.data(NodeList, dataName, dataValue)
  
// adds CSS class(es) to the HTMLElements in the NodeList
can.addClass(NodeList, className)
{% endhighlight %}


__HTMLElement 'destroyed' event__

When an element is removed from the page, a 'destroyed' event should be triggered on the 
event.  This is used to teardown event handlers in can.Control.

## Use with other libraries

CanJS can be used with libraries other than jQuery.

### Implementing another library

## Plugins

### construct proxy

### construct super

### control plugin

### control view

### observe attributes

### observe delegate

### observe setter

### model backup

### model validations

### model elements

### view modifiers

## Examples

Examples of CanJS.

## Why CanJS

There are many libraries out there and it can be difficult 
to pick the one that's right for you.  In our (not so, but should be) humble opinion, the technology in CanJS is simply the best.  It strikes a 
balance between:

 - Size
 - Ease of use
 - Safety
 - Speed
 - Flexibility

The following are our very biased reasons to use CanJS.

### Size 

On top of jQuery, CanJS is 8.2k.  Here's some other frameworks for comparison:

 - Backbone 8.3kb (with Underscore.js)
 - Angular 24kb
 - Knockout 13kb
 - Ember 37kb
 - Batman 15kb

__Size is not everything__.  It really is what's inside that counts. And that's where we think CanJS really delivers a lot of bang for your buck.

### Ease of use

This site highlights the most important features of CanJS.  The library comes with thorough documentation
and examples on [its DoneJS documentation page](http://donejs.com/docs.html).  There are example apps for
each library, and several example apps for jQuery. 

CanJS is also supported by Bitovi, formerly [Jupiter Consulting](http://jupiterjs.com).  We are extremely active on the [forums](https://forum.javascriptmvc.com/#Forum/canjs). And should the need arise, we provide support, training, and development.

### Safety

Memory safety is really important, especially in long-lived, dynamic pages. CanJS combats this menace in two important and unique ways:

__Controls that unbind event handlers auto-magically__

Using [templated event binding](#can_control-templated_event_handlers_pt_2), Controls can listen to events on objects other than their [element](#can_control-element).  For example, a tooltip listening to the window looks like:

{% highlight javascript %}
var Tooltip = can.Control({
  '{window} click' : function(el, ev){
    // hide only if we clicked outside the tooltip
    if(! this.element.has(ev.target ) {
      this.element.remove();
    }
  }
})

// create a Tooltip
var tooltipElement = $('<div>INFO</div>').appendTo(el)
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
can.view('todosList.ejs',{
  todaysTodos : Todo.findAll({due: 'today'}),
  criticalTodos : Todo.findAll({type: 'critical'})
}).then(function(frag){
  $('#todos').html(frag);
})
{% endhighlight %}

`todosList.ejs` might look like:

{% highlight erb %}
<h2>Due Today</h2>
<% list(todaysTodos, function(todo){ %>
  <li <%= (el) -> el.data('todo',todo) %>>
    <%= todo.attr('name') %>
  </li>
<% }) %>
<h2>Critical Todos</h2>
<% list(criticalTodos, function(todo){ %>
  <li <%= (el) -> el.data('todo',todo) %>>
    <%= todo.attr('name') %>
  </li>
<% }) %>
{% endhighlight %}

If `Todo.findAll({due: 'today'})` and `Todo.findAll({type: 'critical'})` both have the same todo instance's data like:

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
$('#todos').html('todos.ejs', Todo.findAll() );
{% endhighlight %}

Hot.  You can do this without the [view modifiers plugin](#plugins-view_modifiers) like:

{% highlight javascript %}
can.view('todos.ejs', Todo.findAll() ).then(function( frag ){
  $('#todos').html( frag );
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

CanJS's tools are designed to work under almost every situation.  Your server sends back XML with strange URLs?  That's ok, overwrite [can.Model.findAll](http://donejs.com/docs.html#!can.Model.static.findAll) or [can.Model.models](http://donejs.com/docs.html#!can.Model.static.models).  Want some special teardown code for a control?  Overwrite [can.Control.destroy](http://donejs.com/docs.html#!can.Control.prototype.destroy).

But our favorite bit of flexibility is how [can.Observe](#can_observe) works with nested data.  It converts nested objects into observes 
automatically.  For example:

{% highlight javascript %}
var person = new can.Observe({
  name : {first: 'Justin', last: 'Myer'},
  hobbies : ['programming', 'party rocking']
})

person.attr('name.first') //-> 'Justin'
person.attr('hobbies.0') //-> 'programming'
{% endhighlight %}

But most important, `change` events bubble.  Letting observe listen when a nested property changes:

{% highlight javascript %}
person.bind('change', function( ev, attr, how, newVal, oldVal ){
  attr   //-> 'name.last'
  how    //-> 'set'
  newVal //-> 'Meyer'
  oldVal //-> 'Myer'
});

person.attr('name.last', 'Meyer');
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
    
It puts the downloads in `can/dist`.