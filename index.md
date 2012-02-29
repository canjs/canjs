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
small todo app with CanJS and jQuery.  The [Use with other libraries] section details 
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

  - [indexOf](http://donejs.com/docs.html#!can.Observe.List.prototype.indexOf) `list.indexOf( item )` - returns 
    the position of the item in the array
  - [pop]
  - [push]
  - [shift]
  - [splice]
  - [unshift]


## can.Model `can.Model([classProperties,] [prototypeProperties])`

Models are central to any application.  They 
contain data and logic surrounding it.  You 
extend [can.Model](http://javascriptmvc.com/docs.html#!can.Model) with your domain specific 
methods and can.Model provides a set of methods 
for managing changes.

To create a __Model__ class, call __can.Model__ with the:

- __classProperties__, including 
  [findAll](http://javascriptmvc.com/docs.html#!can.Model.findAll),
  [findOne](http://javascriptmvc.com/docs.html#!can.Model.findAll),
  [create](http://javascriptmvc.com/docs.html#!can.Model.create),
  [update](http://javascriptmvc.com/docs.html#!can.Model.update),
  [destroy](http://javascriptmvc.com/docs.html#!can.Model.destroy) properties, and
- prototype instance properties.

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

__Note:__ Try the following commands in your browser:

### new can.Model(attributes)

Create a todo instance like:

{% highlight javascript %}	
	var todo = new Todo({name: "do the dishes"});
{% endhighlight %}
    
### attr `model.attr( name, [value] )`

[can.Model.prototype.attr](http://javascriptmvc.com/docs.html#!can.Model.prototype.attr) reads or sets properties on model instances.

{% highlight javascript %}	
	todo.attr('name') //-> "do the dishes"
	
	todo.attr('name', "wash the dishes" );
	
	todo.attr() //-> {name: "wash the dishes"}
	
	todo.attr({name: "did the dishes"});
{% endhighlight %}

### Talking to the server

Model uses static [findAll](http://javascriptmvc.com/docs.html#!can.Model.findAll),
[findOne](http://javascriptmvc.com/docs.html#!can.findAll), [create](http://javascriptmvc.com/docs.html#!can.create),
[update](http://javascriptmvc.com/docs.html#!can.update), and [destroy](http://javascriptmvc.com/docs.html#!can.destroy)
methods to create, read, update and delete 
model instances on the server.  

Now you can call methods on Todo that
make changes on the server.  For example, 
in your console, try:

{% highlight javascript %}	
	Todo.findAll({});
{% endhighlight %}

In the console, you'll see it make a request 
to `GET /todos`.

### findAll `findAll( params, success( todos ), error() )`

  [findAll](http://javascriptmvc.com/docs.html#!can.Model.findAll) retrieves multiple todos:

{% highlight javascript %}	
	Todo.findAll({}, function( todos ) {
	  console.log( todos );
	})
{% endhighlight %}

### findOne `findOne( params, success( todo ), error() )`

[findOne](http://javascriptmvc.com/docs.html#!can.Model.findOne) retrieves a single todo:

{% highlight javascript %}	
	Todo.findOne({}, function( todo ) {
	  console.log( todo );
	})
{% endhighlight %}

### save `todo.save( success( todo ), error() )`

[Save](http://javascriptmvc.com/docs.html#!$.Model::save) can __create__ 
or __update__ instances depending if the 
instance has already been created or not.

To __create__ a todo on the server, create a
todo instance and call __save__ like the following:

{% highlight javascript %}	
	var todo = new Todo({name: "mow lawn"})
	todo.save(function(todo){
	  console.log( todo );
	})
{% endhighlight %}

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

### destroy `todo.destroy( success( todo ), error() )`

[Destroy](http://javascriptmvc.com/docs.html#!can.Model.prototype.destroy) deletes a 
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


### bind `todo.bind( event, handler(ev, todo ) )`

Listening to changes in the Model is what MVC 
is about.  Model lets you [bind](http://javascriptmvc.com/docs.html#!can.Model::bind) to changes 
on an individual instance 
or [all instances](http://javascriptmvc.com/docs.html#!can.Model.bind). For example, you can listen to 
when an instance is __created__ on the server like:

{% highlight javascript %}	
	var todo = new Todo({name: "mow lawn"});
	todo.bind('created', function(ev, todo){
	  console.log("created", todo );
	})
	todo.save()
{% endhighlight %}
    
You can listen to anytime an __instance__ is created on the server by 
binding on the model:

{% highlight javascript %}	
	Todo.bind('created', function(ev, todo){
	  console.log("created", todo );
	})
{% endhighlight %}

Model produces the following events on 
the model class and instances whenever a model Ajax request completes:

- __created__ - an instance is created on the server
- __updated__ - an instance is updated on the server
- __destroyed__ - an instance is destroyed on the server

## can.View `can.View( idOrUrl, data )`

[can.View](http://javascriptmvc.com/docs.html#!can.View) is used to easily create HTML with
JS templates. Pass it ...

- the __id__ of a script tag to use as the content of the template
- __data__ to pass to the template
  
... and it returns the rendered result of the template.  For
example, add the following to __todos.html__:

{% highlight html %}	
	<script type='text/ejs' id='todosEJS'>
	  <% for(var i = 0; i < this.length; i++ ){ %>
	    <li><%= this[i].name %></li>
	  <% } %>
	</script>
{% endhighlight %}

Render a list of todos with:

{% highlight javascript %}	
	Todo.findAll( {}, function( todos ){
	   console.log( $.View( 'todosEJS', todos ) );
	});
{% endhighlight %}

can.View also takes a __url__ for a template location.  __Create__ 
a _todos/todos.ejs_ file that contains the following:

{% highlight aspx %}	
	<% for(var i = 0; i < this.length; i++ ){ %>
	  <li><%= this[i].name %></li>
	<% } %>
{% endhighlight %}

Render this with:

{% highlight javascript %}	
	Todo.findAll( {}, function( todos ){
	  console.log( $.View( 'todos.ejs', todos ) );
	});
{% endhighlight %}

__can.View__ works with any template language, such
as JAML, jQuery-tmpl, Mustache and superpowers them with:

- Loading from scripts and external files 
- using templates with jQuery __modifiers__ like html
- Template caching
- Deferred support
- Bundling processed templates in production builds


### Modifiers `el.<i>modifier</i>( idOrUrl, data )`

__can.View__ overwrites the jQuery's html modifiers
after, append, before, html, prepend, replaceWith, and text,
allowing you to write:

{% highlight javascript %}	
	Todo.findAll( {}, function( todos ){
	  $('#todos').html( 'todos.ejs', todos );
	});
{% endhighlight %}

To make this work, make sure `todos.html` has a `#todos` element like:

{% highlight html %}	
	<ul id='todos'></ul>
{% endhighlight %}

### Deferreds

__can.Model__'s ajax methods return a deffered. __can.View__
accepts deferreds, making this hotness possible:

{% highlight javascript %}	
	$('#todos').html('todos.ejs', Todo.findAll() )
{% endhighlight %}
    
This syntax will render todos.ejs with the todo instances in the AJAX request 
made by Todo.findAll, whenever its completed.


## can.Control `can.Control(classProps, prototypeProps)`

[can.Control](http://javascriptmvc.com/docs.html#!can.Control) creates organized, memory-leak free, 
rapidly performing, stateful widgets. It is used to create UI controls like 
tabs, grids, and contextmenus and used to organize them 
into higher-order business rules with [can.route](http://javascriptmvc.com/docs.html#!can.route). Its serves as 
both a traditional view and a 
traditional controller.
  
Let's make a basic todos widget that 
lists todos and lets 
us destroy them. Add the following to __todos.js__:

{% highlight javascript %}	
	var Todos = can.Control({
	  "init" : function( element , options ){
	    this.element.html('todos.ejs', Todo.findAll() )
	  }
	})
{% endhighlight %}

We can create this widget on the `#todos` element with:

{% highlight javascript %}	
	new Todos('#todos', {});
{% endhighlight %}

### init `can.Control.prototype.init(element, options)`

[Init](http://javascriptmvc.com/docs.html#!can.Control:init) is called when a
new can.Control instance is created.  It's called with:

- __element__ - The jQuery wrapped element passed to the 
                controller. Controller accepts a jQuery element, a
                raw HTMLElement, or a css selector.  This is
                set as __this.element__ on the controller instance.
- __options__ - The second argument passed to new Controller, extended with
                the can.Control's static __defaults__. This is set as 
                __this.options__ on the controller instance.

and any other arguments passed to `new can.Control()`.  For example:

{% highlight javascript %}	
	var Todos = $.Controller({
	  defaults : {template: 'todos.ejs'}
	},{
	  "init" : function( element , options ){
	    element.html(options.template, Todo.findAll() )
	  }
	})
	
	new Todos( document.body.firstElementChild );
	new Todos( $('#todos'), {template: 'specialTodos.ejs'})
{% endhighlight %}

### element `this.element`

[this.element](http://javascriptmvc.com/docs.html#!can.Controll.prototype.element) is the 
element the controller is created on. 

### options `this.options`

[this.options](http://javascriptmvc.com/docs.html#!can.Control.prototype.options) is the second argument passed to 
`new can.Control()` merged with the controller's static __defaults__ property.

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

- The jQuery-wrapped __element__ that was clicked
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

Values inside `{NAME}` are looked up on the controller's `this.options`
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

### destroy `controller.destroy()`

[can.Control.prototype.destroy](http://javascriptmvc.com/docs.html#!can.Control.prototype.destroy) unbinds a controller's
event handlers and releases its element, but does not remove 
the element from the page. 

{% highlight javascript %}	
	var todo = new Todos("#todos")
	todo.destroy();
{% endhighlight %}

When a controller's element is removed from the page
__destroy__ is called automatically.

{% highlight javascript %}	
	new Todos("#todos")
	$("#todos").remove();
{% endhighlight %}
    
All event handlers bound with Controller are unbound when the controller 
is destroyed (or its element is removed).

_Brief aside on destroy and templated event binding. Taken 
together, templated event binding, and controller's automatic
clean-up make it almost impossible 
to write leaking applications. An application that uses
only templated event handlers on controllers within the body
could free up all 
data by calling `$(document.body).empty()`._

### update `controller.update(options)`

[can.Control.prototype.update](http://javascriptmvc.com/docs.html#!can.Control.prototype.update) updates a controller's 
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

[can.route](http://javascriptmvc.com/docs.html#!can.route) is the core of JavaScriptMVC's 
routing functionality. It is a [can.Observe](http://javascriptmvc.com/docs.html#!can.Observe) that
updates `window.location.hash` when it's properties change
and updates its properties when `window.location.hash` 
changes. It allows very sophisticated routing behavior ... too
sophisticated for this guide. But, it also handles 
the basics with ease.  

Listen to routes in controller's with special "route" events like:

{% highlight javascript %}	
	var Routing = $.Controller({
	  "route" : function(){
	    // matches empty hash, #, or #!
	  },
	  "todos/:id route" : function(data){
	    // matches routes like #!todos/5
	  }
	})
	
	// create routing controller
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

The following enhances the Routing controller to listen for
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
	
	// create routing controller
	new Routing(document.body);
{% endhighlight %}

The __Routing__ controller is a traditional controller. It coordinates
between the `$.route`, `Editor` and `Todos`.  `Editor` and `Todos`
are traditional views, consuming models.

If you can understand this, you understand 
everything. Congrats! [See it in action](http://javascriptmvc.com/docs.html#!tutorials/rapidstart/todos.html).

## Use with other libraries

CanJS can be used with libraries other than jQuery.

### Implementing another library


__STRING__

{% highlight javascript %}	
	
	// remove leading and trailing whitespace
	can.trim( " foo " ) // -> "foo" 
{% endhighlight %}

__ARRAY__
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

__Object__
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

__FUNCTION__
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

__EVENT__

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

__DEFERRED__

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


__AJAX__

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

__HTMLElement__

{% highlight javascript %}	
	
	can.buildFragment(frags, nodes)
	
	// a node list
	can.$("div.bar") //-> []
	
	can.append(NodeList, html)
	
	can.remove(NodeList)
	
	can.filter(NodeList, function(){})
	
	can.data(NodeList, dataName, dataValue)
	
	can.addClass(NodeList, className )
{% endhighlight %}


__HTMLElement 'destroyed' event__

When an element is removed from the page, a 'destroyed' event should be triggered on the 
event.  This is used to teardown event handlers in can.Control.

## Examples

Examples of canJS.