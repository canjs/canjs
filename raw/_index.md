---
layout: default
---

# Rapid Start

This walks through the basics of JavaScriptMVC by building a 
smal todo app.  Check out the [getstarted Getting Started Guide] 
for a more in-depth overview.

## Get JavaScriptMVC

[http://javascriptmvc.com/builder.html Download it] or 
[developwithgit pull it from Git].  JavaScriptMVC (JMVC) is a collection of 4 sub-projects. 
Once you have JavaScriptMVC, you should have a folder with:

    documentjs - documentation engine
    funcunit   - testing app
    jquery     - jquery and jQueryMX plugins
    steal      - dependency management
    js         - JS command line for Linux/Mac
    js.bat     - JS command line for Windows

<b>Notice</b>: This folder, the one that has the sub-projects, is 
called the [rootfolder ROOT FOLDER]</b>.

## Get JavaScriptMVC running.

JMVC uses [steal steal/steal.js] for dependency 
management. Steal loads scripts.  To use JavaScriptMVC's 
features like [$.Controller] and [$.View],
'steal' them like:

{% highlight javascript %}
steal('jquery/controller','jquery/view/ejs',function(){
   //code that uses controller and view goes here
})
{% endhighlight %}

To use steal, you need to add the steal script to 
your page. In the [rootfolder root folder] create a __todos__ folder
and empty __todos.html__ and __todos.js__ that look like:

    ROOT\
        documentjs\
        jquery\
        funcunit\
        steal\
        todos\
          todos.js
          todos.html

To load _steal.js_ and _todos.js_, make __todos.html__ look like:

{% highlight html %}
<!DOCTYPE html>
<html>
<head></head>
<body>
  <ul id='todos'></ul>
  <input id='editor'/>
  <script type='text/javascript'
          src='../steal/steal.js?todos/todos.js'>
  </script>
</body>
</html>
{% endhighlight %}
    

Open the page in your browser.  Use a debugger like firebug to see _steal.js_ and
_todos.js_ loading.

## steal `steal([paths])`

[steal] is used to load scripts, styles, even CoffeeScript, LESS
and templates into your application.  

Path are assumed to be relative to the [rootfolder root folder]. This
means that the following always loads `jquery/class/class.js`
no matter which file is calling steal:

steal('jquery/class/class.js');
    
You can load relative to the current file by adding `./` to the
start of your path like:

    steal('./helpers.js')
    
Steal also supports css, allowing you to steal `todos/todos.css` 
like:

    steal('./todos.css')

Because loading paths like `jquery/class/class.js` is so 
common, if you do not provide an extension like `.js`, steal 
will append the last folder name and `.js`. This makes
the following load `jquery/class/class.js`:

    steal('jquery/class')

Steal is an asynchronous loader, so you can't do:

    steal('jquery/class')
    $.Class
    
Instead, do:

    steal('jquery/class', function(){
      $.Class
    })

For this application, we will load jQueryMX's most
common plugins.  Add the following to __todos.js__:

    steal('jquery/class',
          'jquery/model',
          'jquery/dom/fixture',
          'jquery/view/ejs',
          'jquery/controller',
          'jquery/controller/route',
          function($){
          
    })

The following goes through each plugin while we build the todos app.

## $.Class `$.Class([name,] [classProps,] [prototypeProps])`

Constructors made with [$.Class] are used to create
objects with shared properties. It's used by both
__$.Controller__ and __$.Model__.

To create a __Class__ of your own, call __$.Class__ with the:

  - __name__ of the class which can be used for introspection,
  - __classProperties__ that are attached directly to the constructor, and
  - instance __prototypeProperties__.

__$.Class__ sets up the prototype chain so subclasses can be further 
extended and sub-classed as far as you like:

    steal('jquery/class', function(){
    
      $.Class("Todo",{
        init : function(){},
    
        author : function(){ ... },
    
        coordinates : function(){ ... },
    
        allowedToEdit: function(account) { 
         return true;
        }
      });
    
      Todo('PrivateTodo',{
        allowedToEdit: function(account) {
          return account.owns(this);
        }
      })
    
    });


_Brief aside on `super`.  $.Class provides a 
`_super` method to call the function of the same name higher 
on the prototype chain like:_


    var SecureNote = Todo({
      allowedToEdit: function(account) {
        return this._super(account) && 
           this.isSecure();
      }
    })


### constructor / init `new Class(arg1, arg2)`

When a class constructor is invoked, __$.Class__ creates the instance and 
calls [$.Class.prototype.init] with 
the arguments passed to `new Class(...)`.

    $.Class('Todo',{
      init : function(text) {
        this.text = text
      },
      read : function(){
        console.log(this.text);
      }
    })

    var todo = new Todo("Hello World");
    todo.read()


_Brief aside on __init__.  $.Class actually calls 
[$.Class.prototype.setup $.Class.prototype.setup] before 
init.  `setup` can be used to change (or normalize) the arguments passed to __init__._

## Model `$.Model(name, classProperties, prototypeProperties)`

Models are central to any application.  They 
contain data and logic surrounding it.  You 
extend [$.Model $.Model] with your domain specific 
methods and $.Model provides a set of methods 
for managing changes.

To create a __Model__ class, call __$.Model__ with the:

  - __name__ of the class,
  - __classProperties__, including 
    [$.Model.findAll findAll],
    [$.Model.findAll findOne],
    [$.Model.create create],
    [$.Model.update update],
    [$.Model.destroy destroy] properties, and
  - prototype instance properties.

Make a Todo model in __todos.js__ like the following:

    steal('jquery/class',
          'jquery/controller',
          'jquery/model',
          'jquery/view/ejs',
          'jquery/dom/fixture',
          function($){
          
      $.Model('Todo',{
        findAll : "GET /todos",
        findOne : "GET /todos/{id}",
        create  : "POST /todos",
        update  : "PUT /todos/{id}",
        destroy : "DELETE /todos/{id}"
      },
      {})
    });
    
__Note:__ Try the following commands in your browser:

### new $.Model(attributes)

Create a todo instance like:

    var todo = new Todo({name: "do the dishes"});
    
### attr `model.attr( name, [value] )`

[$.Model.prototype.attr] reads or sets properties on model instances.

    todo.attr('name') //-> "do the dishes"
    
    todo.attr('name', "wash the dishes" );
    
    todo.attr() //-> {name: "wash the dishes"}
    
    todo.attr({name: "did the dishes"});
    
### Talking to the server

Model uses static [$.Model.findAll findAll],
[$.Model.findAll findOne], [$.Model.create create],
[$.Model.update update], and [$.Model.destroy destroy]
methods to create, read, update and delete 
model instances on the server.  



Now you can call methods on Todo that
make changes on the server.  For example, 
in your console, try:

    Todo.findAll({});

In the console, you'll see it make a request 
to `GET /todos`.

Assuming your server does not have a `/todos` service,
this won't work.  That's ok, we can simulate them with
[$.fixture].

### $.fixture `$.fixture(url, fixture(original, settings, headers) )`

Fixtures simulate requests to a specific 
url.  The `fixture` function is called with:

  - __original__ - original settings passed to $.ajax
  - __settings__ - settings normalized by $.ajax
  - __headers__ - request headers
  
And, it's expected to return an array of the arguments
passed to jQuery's ajaxTransport `completeCallback` system:

    return [ status, statusText, responses, responseHeaders ];

This might look like:

    return [ 200, "success", {json: []}, {} ];
    
If the array only has one item, it's assumed to be the json
data.  

To simulate the todo services, add the following within the
steal callback:

	// our list of todos
	var TODOS = [
        {id: 1, name: "wake up"},
        {id: 2, name: "take out trash"},
        {id: 3, name: "do dishes"}
    ];
    // findAll
    $.fixture("GET /todos", function(){
      return [TODOS]
    });
    
    // findOne
    $.fixture("GET /todos/{id}", function(orig){
      return TODOS[(+orig.data.id)-1];
    })
    
    // create
    var id= 4;
    $.fixture("POST /todos", function(){
      return {id: (id++)}
    })
    
    // update
    $.fixture("PUT /todos/{id}", function(){
      return {};
    })
    
    // destroy
    $.fixture("DELETE /todos/{id}", function(){
      return {};
    })

Now you can use Model's ajax methods to CRUD todos.

### findAll `findAll( params, success( todos ), error() )`

[$.Model.findAll findAll] retrieves multiple todos:

    Todo.findAll({}, function( todos ) {
      console.log( todos );
    })

### findOne `findOne( params, success( todo ), error() )`

[$.Model.findOne findOne] retrieves a single todo:

    Todo.findOne({}, function( todo ) {
      console.log( todo );
    })

### save `todo.save( success( todo ), error() )`

[$.Model::save Save] can __create__ 
or __update__ instances depending if the 
instance has already been created or not.

To __create__ a todo on the server, create a
todo instance and call __save__ like the following:

    var todo = new Todo({name: "mow lawn"})
    todo.save(function(todo){
      console.log( todo );
    })

To __update__ a todo on the server, change the attributes
and call __save__ again like the following:

    var todo = new Todo({name: "mow lawn"});
    todo.save( function(todo){
      console.log("created", todo );
      
      todo.attr("name", "mow my lawn")
      todo.save( function( todo ) {
        console.log("updated", todo );
      })
    })

### destroy `todo.destroy( success( todo ), error() )`

[$.Model.prototype.destroy Destroy] deletes a 
record on the server.  You can do this like:

    var todo = new Todo({name: "mow lawn"});
    todo.save( function(todo){
      console.log("created", todo );
      
      todo.destroy( function( todo ) {
        console.log("destroyed", todo );
      })
    })

### bind `todo.bind( event, handler(ev, todo ) )`

Listening to changes in the Model is what MVC 
is about.  Model lets you [$.Model::bind bind] to changes 
on an individual instance 
or [$.Model.bind all instances]. For example, you can listen to 
when an instance is __created__ on the server like:

    var todo = new Todo({name: "mow lawn"});
    todo.bind('created', function(ev, todo){
      console.log("created", todo );
    })
    todo.save()
    
You can listen to anytime an __instance__ is created on the server by 
binding on the model:

    Todo.bind('created', function(ev, todo){
      console.log("created", todo );
    })

Model produces the following events on 
the model class and instances whenever a model Ajax request completes:

  - __created__ - an instance is created on the server
  - __updated__ - an instance is updated on the server
  - __destroyed__ - an instance is destroyed on the server

### $.fn.model `$(el).model([modelInstance])`

It can be helpful to label an element with a model instance
so it can be retrieved later. [jQuery.fn.model] is used
to get and set a model instance on an element.

To set an instance:

    var li = $('<li>').model( new Todo({id: 5}) )
                      .appendTo("#todos");
    
This will add __'todo todo_5'__ to the `<li>`'s className. We can
get back the model instance with:

    li.model().id //-> 5
    
### elements `todo.elements( [context] )`

[$.Model::elements Elements] retrieves the elements that 
have a model instance. A __context__ element (or query string) can be 
provided to limit the search to within a particular element:

    todo.elements('#todos');

## View `$.View( idOrUrl, data )`

[$.View $.View] is used to easily create HTML with
JS templates. Pass it ...

  - the __id__ of a script tag to use as the content of the template
  - __data__ to pass to the template
  
... and it returns the rendered result of the template.  For
example, add the following to __todos.html__:

    <script type='text/ejs' id='todosEJS'>
      <% for(var i = 0; i < this.length; i++ ){ %>
        <li><%= this[i].name %></li>
      <% } %>
    </script>

Render a list of todos with:

     Todo.findAll( {}, function( todos ){
         console.log( $.View( 'todosEJS', todos ) );
     });

$.View also takes a __url__ for a template location.  __Create__ 
a _todos/todos.ejs_ file that contains the following:

    <% for(var i = 0; i < this.length; i++ ){ %>
      <li><%= this[i].name %></li>
    <% } %>

Render this with:

    Todo.findAll( {}, function( todos ){
      console.log( $.View( 'todos.ejs', todos ) );
    });

__$.View__ works with any template language, such
as JAML, jQuery-tmpl, Mustache and superpowers them with:

  - Loading from scripts and external files 
  - using templates with jQuery __modifiers__ like html
  - Template caching
  - Deferred support
  - Bundling processed templates in production builds

### Modifiers - <code>el.<i>modifier</i>( idOrUrl, data )</code>

__$.View__ overwrites the jQuery's html modifiers
after, append, before, html, prepend, replaceWith, and text,
allowing you to write:

    Todo.findAll( {}, function( todos ){
      $('#todos').html( 'todos.ejs', todos );
    });

To make this work, make sure `todos.html` has a `#todos` element like:

    <ul id='todos'></ul>

### Deferreds 

__$.Model__'s ajax methods return a deffered. __$.View__
accepts deferreds, making this hotness possible:

    $('#todos').html('todos.ejs', Todo.findAll() )
    
This syntax will render todos.ejs with the todo instances in the AJAX request 
made by Todo.findAll, whenever its completed.
    
### Hookup `<li <%= (el)-> CODE %> >`

[$.View.hookup] lets you provide 
[http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax ES5-style arrow function] 
callbacks on elements in your template.  These callback functions
get called after the template has been 
inserted into the DOM. You can call jQuery methods on the element like:

    <li <%= ($el) -> $el.fadeIn() %> style='display:none'>
      <%= this[i].name %>
    </li>

In your code, add a __returning__  magic tag (`<%= %>`) that 
matches the _arrow function syntax_.  The argument passed to the function will
be the jQuery-wrapped element.  

This lets you hookup model data to elements in EJS.  Change __todos.ejs__ to:

    <% $.each(this, function(i, todo){ %>
      <li <%= ($el) -> $el.model(todo) %>>
        <%= todo.name %>
        <a href="javascript://" class='destroy'>X</a>
      </li>
    <% }) %>




## Controller `$.Controller(name, classProps, prototypeProps)`

[$.Controller] creates organized, memory-leak free, 
rapidly performing, stateful jQuery widgets. It is used to create UI controls like 
tabs, grids, and contextmenus and used to organize them 
into higher-order business rules with [$.route]. Its serves as 
both a traditional view and a 
traditional controller.
  
Let's make a basic todos widget that 
lists todos and lets 
us destroy them. Add the following to __todos.js__:

    $.Controller("Todos",{
      "init" : function( element , options ){
        this.element.html('todos.ejs', Todo.findAll() )
      }
    })

We can create this widget on the `#todos` element with:

    new Todos('#todos', {});

### init `$.Controller.prototype.init(element, options)`

[$.Controller::init Init] is called when a
new Controller instance is created.  It's called with:

  - __element__ - The jQuery wrapped element passed to the 
                  controller.  Controller accepts a jQuery element, a
                  raw HTMLElement, or a css selector.  This is
                  set as __this.element__ on the controller instance.
  - __options__ - The second argument passed to new Controller, extended with
                  the Controller's static __defaults__. This is set as 
                  __this.options__ on the controller instance.

and any other arguments passed to `new Controller()`.  For example:

    $.Controller("Todos",
    {
      defaults : {template: 'todos.ejs'}
    },
    {
      "init" : function( element , options ){
        element.html(options.template, Todo.findAll() )
      }
    })
    
    new Todos( document.body.firstElementChild );
    new Todos( $('#todos'), {template: 'specialTodos.ejs'})

### element `this.element`

[$.Controller.prototype.element this.element] is the jQuery-wrapped
element the controller is created on. 

### options `this.options`

[$.Controller.prototype.options this.options] is the second argument passed to 
`new Controller()` merged with the controller's static __defaults__ property.

### Listening to events

Controller automatically binds prototype methods that look
like event handlers.  Listen to __click__s on `<li>` elements like:

    $.Controller("Todos",{
      "init" : function( element , options ){
        this.element.html('todos.ejs', Todo.findAll() )
      },
      "li click" : function(li, event){
        console.log("You clicked", li.text() )
        
        // let other controls know what happened
        li.trigger('selected');
      }
    })

When an `<li>` is clicked, `"li click"` is called with:

  - The jQuery-wrapped __element__ that was clicked
  - The __event__ data

Controller uses event delegation, so you can add `<li>`s without needing to rebind
event handlers.

To destroy a todo when it's `<a href='javascript:// class='destroy'>` link 
is clicked:

    $.Controller("Todos",{
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

### Templated Event Handlers Pt 1 `"{optionName}"`

Customize event handler behavior with `"{NAME}"` in
the event handler name.  The following allows customization 
of the event that destroys a todo:

    $.Controller("Todos",{
      "init" : function( element , options ){ ... },
      "li click" : function(li){ ... },
      
      "li .destroy {destroyEvent}" : function(el, ev){ 
        // previous destroy code here
      }
    })
    
    // create Todos with this.options.destroyEvent
    new Todos("#todos",{destroyEvent: "mouseenter"})

Values inside `{NAME}` are looked up on the controller's `this.options`
and then the `window`.  For example, we could customize it instead like:

    $.Controller("Todos",{
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

The selector can also be templated.

### Templated Event Handlers Pt 2 `"{objectName}"`

Controller can also bind to objects other than `this.element` with
templated event handlers.  This is __especially critical__
for avoiding memory leaks that are so common among MVC applications.  

If the value inside `{NAME}` is an object, that object will be 
bound to.  For example, the following tooltip listens to 
clicks on the window:

    $.Controller("Tooltip",{
      "{window} click" : function(el, ev){
        // hide only if we clicked outside the tooltip
        if(! this.element.has(ev.target ) {
          this.element.remove();
        }
      }
    })
    
    // create a Tooltip
    new Tooltip( $('<div>INFO</div>').appendTo(el) )
    
This is convenient when needing to 
listen to model updates.  Instead of adding a callback
to `todo.destroy(cb)`, we should be listening to 
__destroyed__ events.  We'll handle __updated__ too:

    $.Controller("Todos",{
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

This is better because it removes the todo's element from the page even if another widget
destroyed the todo. Also, this works very well with real-time
architectures.

### destroy `controller.destroy()`

[$.Controller.prototype.destroy] unbinds a controller's
event handlers and releases its element, but does not remove 
the element from the page. 

    var todo = new Todos("#todos")
    todo.destroy();

When a controller's element is removed from the page
__destroy__ is called automatically.

    new Todos("#todos")
    $("#todos").remove();
    
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

[$.Controller.prototype.update] updates a controller's 
`this.options` and rebinds all event handlers.  This is useful
when you want to listen to a specific model:

    $.Controller('Editor',{
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
    
    var todo1= new Todo({id: 6, name: "trash"}),
        todo2 = new Todo({id: 6, name: "dishes"});
    
    // create the editor;
    var editor = new Editor("#editor");
    
    // show the first todo
    editor.update({todo: todo1})
    
    // switch it to the second todo
    editor.update({todo: todo2});

Notice that because we are overwriting `update`, we must call __\_super__.

## Routing

[$.route] is the core of JavaScriptMVC's 
routing functionality. It is a [jQuery.Observe] that
updates `window.location.hash` when it's properties change
and updates its properties when `window.location.hash` 
changes. It allows very sophisticated routing behavior ... too
sophisticated for this guide. But, it also handles 
the basics with ease.  

Listen to routes in controller's with special "route" events like:

    $.Controller("Routing",{
      "route" : function(){
        // matches empty hash, #, or #!
      },
      "todos/:id route" : function(data){
        // matches routes like #!todos/5
      }
    })

    // create routing controller
    new Routing(document.body);

The `route` methods get called back with the route __data__.  The 
empty `"route"` will be called with no data. But, `"todos/:id route"`
will be called with data like: `{id: 6}`.

We can update the route by changing $.route's data like:

    $.route.attr('id','6') // location.hash = #!todos/6
    
Or we can set the hash ourselves like

    var hash = $.route.url({id: 7}) // #!todos/7
    location.hash = hash;

The following enhances the Routing controller to listen for
`".todo selected"` events and change the `$.route`.  When the
$.route changes, it retrieves the todo from the server
and updates the editor widget.

    $.Controller("Routing",{
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

The __Routing__ controller is a traditional controller. It coordinates
between the `$.route`, `Editor` and `Todos`.  `Editor` and `Todos`
are traditional views, consuming models.

If you can understand this, you understand 
everything. Congrats!  [//tutorials/rapidstart/todos.html See it in action].

## FuncUnit

JavaScriptMVC uses [FuncUnit] for testing.  FuncUnit provides an API for writing functional 
tests that simulate clicks and keypresses a user would make.

To create a FuncUnit test:

* Create a test file that steals funcunit and
* Create a funcunit.html page that steals your test file

In the __todos__ directory, make funcunit.html and add the following HTML:

    <html>
      <head>
        <link rel="stylesheet" type="text/css" 
          href="../funcunit/qunit/qunit.css" />
        <script type='text/javascript' 
          src='../steal/steal.js?todos/funcunit.js'></script>
      </head>
      <body>
        <h1 id="qunit-header">Todos Test Suite</h1>
    	<h2 id="qunit-banner"></h2>
    	<div id="qunit-testrunner-toolbar"></div>
    	<h2 id="qunit-userAgent"></h2>
		<div id="test-content"></div>
        <ol id="qunit-tests"></ol>
		<div id="qunit-test-area"></div>
      </body>
    </html>
    
Now make __funcunit.js__ and add the following:

    steal('funcunit', function(){
      
      module('todos')
      
      test('todos test', function(){
        ok(true, "the test loads");
      })
    
    })

Open __funcunit.html__ in your browser.  One test passes.

### Writing a test

We tell the test to open the todos page using [FuncUnit.open S.open]:

    S.open("//todos/todos.html");
    
Once the page is open, we select the first todo and click it:

    S(".todo:first").click();
    
S is a copy of jQuery's $ that adds FuncUnit's API. The editor input will 
now appear.  Tell FuncUnit to wait for this using a [funcunit.waits wait] command:

    S("#editor").val("wake up", "First Todo added correctly");
    
The second parameter is an assertion message.

Replace the test code within the steal callback with the following:

    module('todos', {
      setup: function(){
        S.open("//todos/todos.html");
      }
    })
    
    test('open first todo', function(){
      S(".todo:first").click();
      S("#editor").val("wake up", "First Todo added correctly");
    })
    
Reload __funcunit.html__.  You'll see the page open and run the test in a separate window.

FuncUnit has the ability to provide code coverage stats.  <a href='http://javascriptmvc.com/tutorials/rapidstart/funcunit.html?steal[instrument]=jquery%2Cfuncunit%2Csteal%2Cdocumentjs%2C*%2Ftest%2C*_test.js%2Cmxui%2C*funcunit.js'>Click</a> 
the checkbox next to coverage to 
see a coverage report.  81% isn't bad!  Click Todos.js to see a line by line breakdown.

### Automation

To run these tests automated, run the following from the console:

    ./js funcunit/run selenium todos/funcunit.html

FuncUnit supports [funcunit.integrations integration] with CI tools 
like [funcunit.jenkins Jenkins], build tools like [funcunit.maven maven], 
and running via the [funcunit.phantomjs PhantomJS] headless browser.