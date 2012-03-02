---
layout: default
---
# Welcome to CanJS!

CanJS is an MIT-licensed, client-side, JavaScript framework that makes building rich web applications easy.  It provides:

 - __can.Construct__  - inheritable constructor functions
 - __can.Control__ - declaritive event bindings
 - __can.Model__ - connect data to a RESTful JSON interface
 - __can.Observe__ - key-value binding
 - __can.route__ - backbutton and bookmarking support
 - __can.view__ - dynamic live binding client side templates
 

## Get Canned

CanJS supports jQuery, Zepto, Dojo, YUI and Mootools.  Select your download 
for the library you are using:

 - can.jquery.js (8k)
 - can.zepto.js (9k)
 - can.dojo.js (9k)
 - can.mootools.js (9k)
 - can.yui.js (9k)

This page walks through the basics of CanJS by building a 
small todo app with CanJS and jQuery.  The [Use with other libraries](#use_with_other_libraries) section details 
the minor differencs between use with other libraries.

## can.Construct `can.Construct([classProps,] [prototypeProps])`

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
calls [can.Construct.prototype.init](donejs.com/docs.html#!can.Construct.prototype.init) with 
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
 - Listen for property changes changes.
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

The following listens to a all attribute changes and 'offset' changes on the paginate instance:

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
//  count 1000}
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
  [findAll](http://donejs.com/docs.html#!can.Model.findAll),
  [findOne](http://donejs.com/docs.html#!can.Model.findAll),
  [create](http://donejs.com/docs.html#!can.Model.create),
  [update](http://donejs.com/docs.html#!can.Model.update),
  [destroy](http://donejs.com/docs.html#!can.Model.destroy) properties, and
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
todo.attr('name') //-> "do the dishes"

todo.attr('name', "wash the dishes" );

todo.attr() //-> {name: "wash the dishes"}

todo.attr({name: "did the dishes"});
{% endhighlight %}

### Talking to the server

Model uses static [findAll](http://donejs.com/docs.html#!can.Model.findAll),
[findOne](http://donejs.com/docs.html#!can.findAll), [create](http://donejs.com/docs.html#!can.create),
[update](http://donejs.com/docs.html#!can.update), and [destroy](http://donejs.com/docs.html#!can.destroy)
methods to create, read, update and delete (CRUD)
model data on the server.  

By filling these functions out, you are able to call __findAll__ and __findOne__ on the model 
to retrieve model instances and __save__ and __destroy__ on instances.

### findAll `findAll( params, success( models ), error() ) -> Deferred`

[can.Model.findAll](http://donejs.com/docs.html#!can.Model.findAll) retrieves multiple instances
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

[findOne](http://donejs.com/docs.html#!can.Model.findOne) retrieves a single model instance:


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


### bind `model.bind( event, handler(ev, model ) ) -> model`

[can.Model.prototype.bind](http://donejs.com/docs.html#!can.Model.prototype.bind)
listens to changes in a model instance's attributes in the same way as 
[Observe's bind(#an_observe-bind).  For example:

{% highlight javascript %}
todo.bind("name", function(ev, newVal, oldVal ){
  console.log("name changed to", newVal);
})
{% endhighlight %}

In addition to Observe's events, Model also supports three new events:

- __created__ - an instance is created on the server
- __updated__ - an instance is updated on the server
- __destroyed__ - an instance is destroyed on the server

For example, listen to 
when an instance is __created__ on the server like:

{% highlight javascript %}
var todo = new Todo({name: "mow lawn"});
todo.bind('created', function(ev, todo){
  console.log("created", todo );
})
todo.save()
{% endhighlight %}

[can.Model.bind](http://donejs.com/docs.html#!can.Model.static.bind) lets you listen to 
anytime __any__ instance is __created__, __updated__, or __destroyed__:

{% highlight javascript %}
Todo.bind('created', function(ev, todo){
  console.log("created", todo );
})
{% endhighlight %}


### can.Model.List `new can.Model.List( items )`

[can.Model.List](http://donejs.com/docs.html#!can.Model.List) is a 
[can.Observe.List](#can_observe-can_observe_list) that automatically removes items when they are 
destroyed.  __Model.Lists__ are return by [findAll](#can_model-findAll).

{% highlight javascript %}
Todo.findAll({}, function(todos){

  // listen when a todo is removed
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

- the __id__ or __url__ of a script tag to use as the content of the template
- __data__ to pass to the template
  
It returns the rendered result of the template as a documentFragment.  

{% highlight javascript %}
document.getElementById('todos')
  .appendChild( can.view('todos.ejs', [{name: "mow lawn"}] ) )
{% endhighlight %}

`can.view` supports multiple templating languages; however, [can.EJS](#can_ejs)
is packaged with CanJS and supports live-binding of [can.Observe](#can_observe).

### Loading Templates

`can.view` loads templates from a url or a script tag. To load from
a __script__ tag, create a script tag with the template contents, an id, 
and a type attribute that specifies the template type (text/ejs).

For example, add the following __html__:

{% highlight html %}
<script type='text/ejs' id='todosEJS'>
  <% for(var i = 0; i < this.length; i++ ){ %>
    <li><%= this[i].name %></li>
  <% } %>
</script>
{% endhighlight %}

Render this template and insert it into the page:

{% highlight javascript %}
Todo.findAll( {}, function( todos ){
   document.getElementById('todos')
           .appendChild( can.view( 'todosEJS', todos ) );
});
{% endhighlight %}

To load from a __url__,  create
a _todos/todos.ejs_ file that contains:

{% highlight html %}
<% for(var i = 0; i < this.length; i++ ){ %>
  <li><%= this[i].name %></li>
<% } %>
{% endhighlight %}

Render this with:

{% highlight javascript %}
Todo.findAll( {}, function( todos ){
  document.getElementById('todos')
           .appendChild( can.view( 'todos/todos.ejs', todos ) );
});
{% endhighlight %}

### Deferreds

__can.view__ accepts [deferreds](#utilities-deferred).  If the `data` argument is a deferred or an object
that contains deferreds, __can.view__ returns a deferred that resolves to the documentFragment after
all deferreds have resolved and the template has loaded.

[can.Model.findAll](#can_model-findAll) returns deferreds. This means that the following loads `todos/todos.ejs`, `Todo.findAll` and `User.findOne`
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

To render a string instead of a documentFragment, use [can.view.render]() like:

{% highlight javascript %}
<% for( var i = 0; i < todos.length; i++) %>
  <li><%== can.view.render("/todos/todo.ejs",{
             todo: todo[i]
            }) %>
  </li>
<% }) %>
{% endhighlight %}

__can.view.render--

## can.EJS `new can.EJS( options )`

[can.EJS](http://donejs.com/docs.html#!can.EJS) is CanJS's default template 
language and used with [can.view](#!can_view).  It provides live binding
when use dwith [can.Observes](#can_observe).  A __can.EJS__ template looks
like the HTML you want, but with __magic tags__ where you want
dynamic behavior.  The following lists todo elements:

{% highlight html %}
<script type='text/ejs' id='todosEJS'>
<% for( var i = 0; i < this.length; i++) %>
  <li><%= this[i].name %></li>
<% }) %>
</script>
{% endhighlight %}

Use __can.view__ to render this template:

{% highlight javascript %}
Todo.findAll({}, function( todos ) {
  document.getElementById('todos')
          .appendChild( can.view('todosEJS', todos ) )
}
{% endhighlight %}

Notice that `this` in the template is the list of todos.  The `data` argument passed __can.view__ 
becomes `this` in EJS.  EJS can also access any properties of `this` 
directly (without writing `this.PROPERTY` all the time).  For example, a template that lists the user's name
and todos:

{% highlight html %}
<script type='text/ejs' id='todosEJS'>
<h2><%= user.name %></h2>
<% for( var i = 0; i < todos.length; i++) { %>
  <li><%= todos[i].name %></li>
<% } %>
</script>
{% endhighlight %}

Can be inserted into the document with:

{% highlight javascript %}
can.view('todosEJS', {
  todos : Todo.findAll(),
  user: User.findOne({ id: 5 })
}).then(function( frag ){
  document.getElementById('todos')
          .appendChild(frag);
})
{% endhighlight %}

### Magic Tags

EJS uses 5 types of magic tags:

__`<% CODE %>`__ - Runs JS Code.

This type of magic tag does not modify the template but is used for JS control statements 
like for-loops, if/else, switch, declaring variables, etc.  Pretty much any JS code is valid.  Examples:

{% highlight html %}
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

{% highlight html %}
<% for( var i = 0; i < todos.length; i++) { %>
  <li><%== can.view.render('todoEJS', todos[i]) %></li>
<% } %>
{% endhighlight %}

### Live Binding

__can.EJS__ will automatically update itself when [can.Observes](#can_observe) change.  To enable
live-binding, use [attr](#!can_observe-attr) to read properties.  For example, the following
template will update todo's name when it change:

{% highlight html %}
  <li><%= todo.attr('name') %></li>
{% endhighlight %}

Notice `attr('name')`.  This sets up live-binding.  If you change the todo's name, the `<li>` will automatically
be updated:

{% highlight javascript %}
todo.attr("Clean the toilet");
{% endhighlight %}

Live-binding works by wrapping the code inside the magic tags with a function to call when the attribute (or attributes)
are changed.  This is important to understand because a template like this will not work:

{% highlight html %}
<% for( var i = 0; i < todos.length; i++) { %>
  <li><%= todos[i].attr('name') %></li>
<% } %>
{% endhighlight %}

This does not work because when the function wrapping `todos[i].attr('name')` is called, `i` will be __3__ not the index
of the desired todo.  Fix this by using a closure like:

{% highlight html %}
<% $.each(todos, function(i, todo){ %>
  <li><%= todo.attr('name') %></li>
<% }) %>
{% endhighlight %}

### list `list( observeList, iterator( item, index ) )`

If you want to make the previous template update when todos are 
added or removed, could bind to length like:

{% highlight html %}
<% todos.bind("length", function(){});
   $.each(todos, function(i, todo){ %>
      <li><%= todo.attr('name') %></li>
<% }) %>
{% endhighlight %}

Or simply use EJS's `list` helper method like:

{% highlight html %}
<% list(todos, function(todo){ %>
  <li><%= todo.attr('name') %></li>
<% }) %>
{% endhighlight %}

Now when todos are added or removed from the todo list, the template's HTML is updated:

{% highlight javascript %}
// add an item
todos.push( new Todo({name : "file taxes"}) );

// destroying an item removes it from Model.Lists
todos[0].destroy()
{% endhighlight %}

## can.Control `can.Control(classProps, prototypeProps)`

[can.Control](http://donejs.com/docs.html#!can.Control) creates organized, memory-leak free, 
rapidly performing, stateful controls. Use it to create UI controls like 
tabs, grids, and contextmenus and used to organize them 
into higher-order business rules with [can.route](http://donejs.com/docs.html#!can.route). It can serve as 
a traditional view and a 
traditional controller.
  
The following examples make a basic todos widget that 
lists todos and lets 
us destroy them. Create a control constructor function of your own by 
extending `can.Control`.  

{% highlight javascript %}
var Todos = can.Control({
  "init" : function( element , options ){
    this.element.html('todos.ejs', Todo.findAll() )
  }
})
{% endhighlight %}

Create an instance of the Todos control the `#todos` element with:

{% highlight javascript %}
var todosControl = new Todos('#todos', {});
{% endhighlight %}

### init `can.Control.prototype.init(element, options)`

[Init](http://donejs.com/docs.html#!can.Control:init) is called when a
new can.Control instance is created.  It's called with:

- __element__ - The wrapped element passed to the 
                control. Control accepts a
                raw HTMLElement, a css selector, or a NodeList.  This is
                set as __this.element__ on the control instance.
- __options__ - The second argument passed to new Control, extended with
                the can.Control's static __defaults__. This is set as 
                __this.options__ on the control instance.

and any other arguments passed to `new can.Control()`.  For example:

{% highlight javascript %}
var Todos = can.Control({
  defaults : {template: 'todos.ejs'}
},{
  "init" : function( element , options ){
    element.html(options.template, Todo.findAll() )
  }
})

// create a Todos with default options
new Todos( document.body.firstElementChild );

// overwrite the template option
new Todos( $('#todos'), {template: 'specialTodos.ejs'})
{% endhighlight %}

### element `this.element`

[this.element](http://donejs.com/docs.html#!can.Controll.prototype.element) is the 
a nodelist of a single element, the element the control is created on. 

{% highlight javascript %}
var todosControl = new Todos( document.body.firstElementChild );
todosControl.element[0] //-> document.body.firstElementChild
{% endhighlight %}

Each library wraps the element differently.  If you are using jQuery, the element is wrapped with `jQuery( element )`.

### options `this.options`

[this.options](http://donejs.com/docs.html#!can.Control.prototype.options) is the second argument passed to 
`new can.Control()` merged with the control's static __defaults__ property.

### Listening to events

Controller automatically binds prototype methods that look
like event handlers.  Listen to __click__s on `<li>` elements like:

{% highlight javascript %}
var Todos = can.Control({
"init" : function( element , options ){
  this.element.html('todos.ejs', Todo.findAll() )
},
"li click" : function(li, event){
  console.log("You clicked", li.text() )
  
  // let other controls know what happened
  li.trigger('selected');
}
})
{% endhighlight %}

When an `<li>` is clicked, `"li click"` is called with:

- The library-wrapped __element__ that was clicked.
- The __event__ data

Controller uses event delegation, so you can add `<li>`s without needing to rebind
event handlers.

To destroy a todo when it's `<a href='javascript:// class='destroy'>` link 
is clicked:

{% highlight javascript %}
var Todos = can.Control({
"init" : function( element , options ){
  this.element.html('todos.ejs', Todo.findAll() )
},
"li click" : function(li){
  li.trigger('selected', li.model() );
},
"li .destroy click" : function(el, ev){
  // get the li element that has the model
  var li = el.closest('.todo');
  
  // get the model
  var todo = li.model()
  
  //destroy it
  todo.destroy(function(){
    // remove the element
    li.remove();
  });
}
})
{% endhighlight %}

### Templated Event Handlers Pt 1 `"{optionName}"`

Customize event handler behavior with `"{NAME}"` in
the event handler name.  The following allows customization 
of the event that destroys a todo:

{% highlight javascript %}
var Todos = can.Control("Todos",{
  "init" : function( element , options ){ ... },
  "li click" : function(li){ ... },
  
  "li .destroy {destroyEvent}" : function(el, ev){ 
    // previous destroy code here
  }
})

// create Todos with this.options.destroyEvent
new Todos("#todos",{destroyEvent: "mouseenter"})
{% endhighlight %}

Values inside `{NAME}` are looked up on the control's `this.options`
and then the `window`.  For example, we could customize it instead like:

{% highlight javascript %}
var Todos = can.Control("Todos",{
  "init" : function( element , options ){ ... },
  "li click" : function(li){ ... },
  
  "li .destroy {Events.destroy}" : function(el, ev){ 
    // previous destroy code here
  }
})

// Events config
Events = {destroy: "click"};

// Events.destroy is looked up on the window.
new Todos("#todos")
{% endhighlight %}

The selector can also be templated.

### Templated Event Handlers Pt 2 `"{objectName}"`

Controller can also bind to objects other than `this.element` with
templated event handlers.  This is __especially critical__
for avoiding memory leaks that are so common among MVC applications.  

If the value inside `{NAME}` is an object, that object will be 
bound to.  For example, the following tooltip listens to 
clicks on the window:

{% highlight javascript %}
var Tooltip({
  "{window} click" : function(el, ev){
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
listen to model updates.  Instead of adding a callback
to `todo.destroy(cb)`, we should be listening to 
__destroyed__ events.  We'll handle __updated__ too:

{% highlight javascript %}
var Todos = can.Control({
  "init" : function( element , options ){
    this.element.html('todos.ejs', Todo.findAll() )
  },
  "li click" : function(li){
    li.trigger('selected', li.model() );
  },
  "li .destroy click" : function(el, ev){
    el.closest('.todo')
      .model()
      .destroy();
    ev.stopPropagation();
  },
  "{Todo} destroyed" : function(Todo, ev, destroyedTodo){
    destroyedTodo.elements(this.element)
                 .remove();
  },
  "{Todo} updated" : function(Todo, ev, updatedTodo){
    updatedTodo.elements(this.element)
               .replaceWith('todos.ejs',[updatedTodo]);
  }
})

new Todos("#todos");
{% endhighlight %}

This is better because it removes the todo's element from the page even if another widget
destroyed the todo. Also, this works very well with real-time
architectures.

### destroy `control.destroy()`

[can.Control.prototype.destroy](http://donejs.com/docs.html#!can.Control.prototype.destroy) unbinds a control's
event handlers and releases its element, but does not remove 
the element from the page. 

{% highlight javascript %}
var todo = new Todos("#todos")
todo.destroy();
{% endhighlight %}

When a control's element is removed from the page
__destroy__ is called automatically.

{% highlight javascript %}
new Todos("#todos")
$("#todos").remove();
{% endhighlight %}
    
All event handlers bound with Controller are unbound when the control 
is destroyed (or its element is removed).

_Brief aside on destroy and templated event binding. Taken 
together, templated event binding, and control's automatic
clean-up make it almost impossible 
to write leaking applications. An application that uses
only templated event handlers on controls within the body
could free up all 
data by calling `$(document.body).empty()`._

### update `control.update(options)`

[can.Control.prototype.update](http://donejs.com/docs.html#!can.Control.prototype.update) updates a control's 
`this.options` and rebinds all event handlers.This is useful
when you want to listen to a specific model:

{% highlight javascript %}
var Editor = $.Controller({
  update : function(options){
    this._super(options)
    this.setName();
  },
  // a helper that sets the value of the input
  // to the todo's name
  setName : function(){
    this.element.val(this.options.todo.name);
  },
  // listen for changes in the todo
  // and update the input
  "{todo} updated" : function(){
    this.setName();
  },
  // when the input changes
  // update the todo instance
  "change" : function(){
    var todo = this.options.todo
    todo.attr('name',this.element.val() )
    todo.save();
  }
});

var todo1 = new Todo({id: 6, name: "trash"}),
    todo2 = new Todo({id: 6, name: "dishes"});

// create the editor;
var editor = new Editor("#editor");

// show the first todo
editor.update({todo: todo1})

// switch it to the second todo
editor.update({todo: todo2});
{% endhighlight %}

Notice that because we are overwriting `update`, we must call __\_super__.

## can.route

[can.route](http://donejs.com/docs.html#!can.route) is the core of donejs's 
routing functionality. It is a [can.Observe](http://donejs.com/docs.html#!can.Observe) that
updates `window.location.hash` when it's properties change
and updates its properties when `window.location.hash` 
changes. It allows very sophisticated routing behavior ... too
sophisticated for this guide. But, it also handles 
the basics with ease.  

Listen to routes in controls with special "route" events like:

{% highlight javascript %}
var Routing = $.Controller({
  "route" : function(){
    // matches empty hash, #, or #!
  },
  "todos/:id route" : function(data){
    // matches routes like #!todos/5
  }
})

// create routing control
new Routing(document.body);
{% endhighlight %}

The `route` methods get called back with the route __data__.  The 
empty `"route"` will be called with no data. But, `"todos/:id route"`
will be called with data like: `{id: 6}`.

We can update the route by changing $.route's data like:

{% highlight javascript %}
$.route.attr('id','6') // location.hash = #!todos/6
{% endhighlight %}

Or we can set the hash ourselves like

{% highlight javascript %}
var hash = $.route.url({id: 7}) // #!todos/7
location.hash = hash;
{% endhighlight %}

The following enhances the Routing control to listen for
`".todo selected"` events and change the `$.route`.  When the
$.route changes, it retrieves the todo from the server
and updates the editor widget.

{% highlight javascript %}
var Routing = can.Control({
  init : function(){
    this.editor = new Editor("#editor")
    new Todos("#todos");
  },
  // the index page
  "route" : function(){
     $("#editor").hide();
  },
  "todos/:id route" : function(data){
    $("#editor").show();
    Todo.findOne(data, $.proxy(function(todo){
      this.editor.update({todo: todo});
    }, this))
  },
  ".todo selected" : function(el, ev, todo){
    $.route.attr('id',todo.id);
  }
});

// create routing control
new Routing(document.body);
{% endhighlight %}

The __Routing__ control is a traditional controller. It coordinates
between the `$.route`, `Editor` and `Todos`.  `Editor` and `Todos`
are traditional views, consuming models.

If you can understand this, you understand 
everything. Congrats! [See it in action](http://donejs.com/docs.html#!tutorials/rapidstart/todos.html).


## Utilities

CanJS provides a number of utility methods.  Most of the time, they are mapped to the underlying 
library. But, by using only these methods, you can create plugins that work with any library. Also, these methods
are required to run CanJS from another library.

### String Helpers

{% highlight javascript %}
// remove leading and trailing whitespace
can.trim( " foo " ) // -> "foo" 
{% endhighlight %}

### Array Helpers

{% highlight javascript %}
// convert array-like data into arrays
can.makeArray({0 : "zero", 1: "one", length: 2}) // -> ["zero","one"]
	
// return if an array is an array
can.isArray([]) //-> true
	
// converts one array to another array
can.map([{prop: "val1"}, {prop: "val2"}], function(val, prop){
  return val
})  //-> ["val1","val2"]
	
// iterates through an array
can.each([{prop: "val1"}, {prop: "val2"}], function( index, value ) {
  // function called with
  //  index=0 value={prop: "val1"}
  //  index=1 value={prop: "val2"}
})
{% endhighlight %}

### Object Helpers

{% highlight javascript %}
// extends one object with the properties of another
var first = {},
    second = {a: "b"},
    thrid = {c: "d"};
can.extend(first, second, third); //-> first
first  //-> {a: "b",c : "d"}
second //-> {a: "b"}
thrid  //-> {c: "d"}
	
// deep extends one object with another
can.extend( true, first, second, third ); 
	
// parameterize into a querystring
can.param({a: "b", c: "d"}) //-> "a=b&c=d"
	
// returns if an object is empty
can.isEmptyObject({})      //-> true
can.isEmptyObject({a:"b"}) //-> false
{% endhighlight %}

### Function Helpers

{% highlight javascript %}
// returns a function that calls another function
// with "this" set.
var func = can.proxy(function(one){
  return this.a + one
}, {a: "b"}); 
func("two") //-> "btwo" 

// returns if an object is a function
can.isFunction({})           //-> false
can.isFunction(function(){}) //-> true
{% endhighlight %}

### Event Helpers

{% highlight javascript %}
// binds handler on obj's eventName event
can.bind(obj, eventName, handler )

// unbind handler on obj's eventName event
can.unbind(obj, eventName, handler) 
	
// 
can.delegate(obj, selector, eventName, handler)
	
//
can.delegate(obj, selector, eventName, handler)
	
//
can.trigger(obj, event, args )
can.trigger(obj, eventName, args)
{% endhighlight %}

### Deferred

{% highlight javascript %}
// Creates a new Deferred object
var deferred = new can.Deferred()

// pipes a deferred into another deferred
deferred.pipe(function(){

}, function(){})

// 
deferred.resolve()
	
//
deferred.reject()
	
// 
can.When()
{% endhighlight %}


### Ajax

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

can.append(NodeList, html)
	
can.remove(NodeList)
	
can.data(NodeList, dataName, dataValue)
	
can.addClass(NodeList, className )
{% endhighlight %}


__HTMLElement 'destroyed' event__

When an element is removed from the page, a 'destroyed' event should be triggered on the 
event.  This is used to teardown event handlers in can.Control.

## Use with other libraries

CanJS can be used with libraries other than jQuery.

### Implementing another library


## Examples

Examples of canJS.