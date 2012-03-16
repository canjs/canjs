@class can.Control
@parent index
@plugin can/control
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=jquery/control/control.js
@test can/control/qunit.html
@inherits can.Construct
@description jQuery widget factory.

jQuery.Control helps create organized, memory-leak free, rapidly performing,
stateful controls.  Use it to create UI controls like tabs, grids, and contextmenus 
and used to organize them into higher-order business rules with
 can.route. It can serve as a traditional view and a traditional controller.

The following examples make a basic todos widget that lists 
todos and lets us destroy them. Create a control constructor 
function of your own by extending can.Control.

    var Todos = can.Control({
      "init" : function( element , options ) {
        var self = this;
        Todo.findAll({}, function( todos ){
          self.element.html('todos.ejs', todos )
        })
      }
    })

Create an instance of the Todos control the #todos element with:

    var todosControl = new Todos('#todos', {});

todos.ejs looks like:

    <% list(todos, function(todo){ %>
      <li <%= (el) -> el.data("todo", todo) %> >
        <%= todo.attr('name') %>
        <a href='javascript:// class='destroy'>
      </li>
   <% }) %>

This means it is used to
create things like tabs, grids, and contextmenus as well as 
organizing them into higher-order business rules.

Controls make your code deterministic, reusable, organized and can tear themselves 
down auto-magically. Read about [http://jupiterjs.com/news/writing-the-perfect-jquery-plugin 
the theory behind control] and 
a [http://jupiterjs.com/news/organize-jquery-widgets-with-jquery-control walkthrough of its features]
on Jupiter's blog. [mvc.control Get Started with jQueryMX] also has a great walkthrough.

Control inherits from [can.Construct can.Construct] and makes heavy use of 
[http://api.jquery.com/delegate/ event delegation]. Make sure 
you understand these concepts before using it.

## Basic Example

Instead of


    $(function(){
      $('#tabs').click(someCallbackFunction1)
      $('#tabs .tab').click(someCallbackFunction2)
      $('#tabs .delete click').click(someCallbackFunction3)
    });

do this

    can.Control('Tabs',{
      click: function() {...},
      '.tab click' : function() {...},
      '.delete click' : function() {...}
    })
    $('#tabs').tabs();


## Tabs Example

@demo jquery/control/control.html

## Using Control

Control helps you build and organize jQuery plugins.  It can be used
to build simple widgets, like a slider, or organize multiple
widgets into something greater.

To understand how to use Control, you need to understand 
the typical lifecycle of a jQuery widget and how that maps to
control's functionality:

### A control class is created.
      
    can.Control("MyWidget",
    {
      defaults :  {
        message : "Remove Me"
      }
    },
    {
      init : function(rawEl, rawOptions){ 
        this.element.append(
           "<div>"+this.options.message+"</div>"
          );
      },
      "div click" : function(div, ev){ 
        div.remove();
      }  
    }) 
    
This creates a <code>$.fn.my_widget</code> jQuery helper function
that can be used to create a new control instance on an element. Find
more information [jquery.control.plugin  here] about the plugin gets created 
and the rules around its name.
      
### An instance of control is created on an element

    $('.thing').my_widget(options) // calls new MyWidget(el, options)

This calls <code>new MyWidget(el, options)</code> on 
each <code>'.thing'</code> element.  
    
When a new [can.Construct Class] instance is created, it calls the class's
prototype setup and init methods. Control's [jQuery.Control.prototype.setup setup]
method:
    
 - Sets [jQuery.Control.prototype.element this.element] and adds the control's name to element's className.
 - Merges passed in options with defaults object and sets it as [jQuery.Control.prototype.options this.options]
 - Saves a reference to the control in <code>$.data</code>.
 - [jquery.control.listening Binds all event handler methods].
  

### The control responds to events

Typically, Control event handlers are automatically bound.  However, there are
multiple ways to [jquery.control.listening listen to events] with a control.

Once an event does happen, the callback function is always called with 'this' 
referencing the control instance.  This makes it easy to use helper functions and
save state on the control.


### The widget is destroyed

If the element is removed from the page, the 
control's [jQuery.Control.prototype.destroy] method is called.
This is a great place to put any additional teardown functionality.

You can also teardown a control programatically like:

    $('.thing').my_widget('destroy');

## Todos Example

Lets look at a very basic example - 
a list of todos and a button you want to click to create a new todo.
Your HTML might look like:

@codestart html
&lt;div id='todos'>
 &lt;ol>
   &lt;li class="todo">Laundry&lt;/li>
   &lt;li class="todo">Dishes&lt;/li>
   &lt;li class="todo">Walk Dog&lt;/li>
 &lt;/ol>
 &lt;a class="create">Create&lt;/a>
&lt;/div>
@codeend

To add a mousover effect and create todos, your control might look like:

    can.Control('Todos',{
      ".todo mouseover" : function( el, ev ) {
        el.css("backgroundColor","red")
      },
      ".todo mouseout" : function( el, ev ) {
        el.css("backgroundColor","")
      },
      ".create click" : function() {
        this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
      }
    })

Now that you've created the control class, you've must attach the event handlers on the '#todos' div by
creating [jQuery.Control.prototype.setup|a new control instance].  There are 2 ways of doing this.

@codestart
//1. Create a new control directly:
new Todos($('#todos'));
//2. Use jQuery function
$('#todos').todos();
@codeend

## Control Initialization

It can be extremely useful to add an init method with 
setup functionality for your widget.

In the following example, I create a control that when created, will put a message as the content of the element:

    $.Control("SpecialControl",
    {
      init: function( el, message ) {
        this.element.html(message)
      }
    })
    $(".special").special("Hello World")

## Removing Controls

Control removal is built into jQuery.  So to remove a control, you just have to remove its element:

@codestart
$(".special_control").remove()
$("#containsControls").html("")
@codeend

It's important to note that if you use raw DOM methods (<code>innerHTML, removeChild</code>), the controls won't be destroyed.

If you just want to remove control functionality, call destroy on the control instance:

@codestart
$(".special_control").control().destroy()
@codeend

## Accessing Controls

Often you need to get a reference to a control, there are a few ways of doing that.  For the 
following example, we assume there are 2 elements with <code>className="special"</code>.

@codestart
//creates 2 foo controls
$(".special").foo()

//creates 2 bar controls
$(".special").bar()

//gets all controls on all elements:
$(".special").controls() //-> [foo, bar, foo, bar]

//gets only foo controls
$(".special").controls(FooControl) //-> [foo, foo]

//gets all bar controls
$(".special").controls(BarControl) //-> [bar, bar]

//gets first control
$(".special").control() //-> foo

//gets foo control via data
$(".special").data("controls")["FooControl"] //-> foo
@codeend

## Calling methods on Controls

Once you have a reference to an element, you can call methods on it.  However, Control has
a few shortcuts:

@codestart
//creates foo control
$(".special").foo({name: "value"})

//calls FooControl.prototype.update
$(".special").foo({name: "value2"})

//calls FooControl.prototype.bar
$(".special").foo("bar","something I want to pass")
@codeend

These methods let you call one control from another control.

# can.Control

  - Organize Event Handlers
  - Keep your control from leaking


## Creating a Control constructor

## Creating a Control instance

## setup


## init

## update - rebinds

## destroy - removes event handlers

## examples

  - creating a tabs widget
  - creating 
  
## listening to events ...


## Listening to events

Controller automatically binds prototype methods that look like event 
handlers. Listen to __clicks__ on `<li>` elements like:

    var Todos = can.Control({
      "init" : function( element , options ){
        var self = this;
        Todo.findAll({}, function( todos ){
          self.element.html(self.options.template, todos )
        })
      },
      "li click" : function(li, event){
        console.log("You clicked", li.text() )
        
        // let other controls know what happened
        li.trigger('selected');
      }
    })
    
When an `<li>` is clicked, `"li click"` is called with:

  - The element that was clicked, wrapped with the library's NodeList.
  - The event data.
  
Control uses event delegation, so you can add `<li>`s without needing to rebind event handlers.

To destroy a todo when it’s `<a href='javascript:// class='destroy'>` link is clicked:

    var Todos = can.Control({
      "init" : function( element , options ){
        var self = this;
        Todo.findAll({}, function( todos ){
          self.element.html(self.options.template, todos )
        })
      },
      "li click" : function(li){
        li.trigger('selected', li.model() );
      },
      "li .destroy click" : function(el, ev){
        // get the li element that has todo data
        var li = el.closest('li');
      
        // get the model
        var todo = li.data('todo')
      
        //destroy it
        todo.destroy();
      }
    })

When the todo is destroyed, EJS’s live binding will remove it’s `<li>` automatically.

## Templated Event Handlers Pt 1 "{optionName}"

Customize event handler behavior with `"{NAME}"` in the event 
handler name. The following allows customization of the event that destroys a todo:

    var Todos = can.Control("Todos",{
      "init" : function( element , options ){ ... },
      "li click" : function(li){ ... },
      
      "li .destroy {destroyEvent}" : function(el, ev){ 
        // previous destroy code here
      }
    })

// create Todos with this.options.destroyEvent
new Todos("#todos",{destroyEvent: "mouseenter"})
Values inside {NAME} are looked up on the control’s this.options and then the window. For example, we could customize it instead like:

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

The selector can also be templated.

## Templated Event Handlers Pt 2 "{objectName}"

Controller can also bind to objects other than this.element with templated event handlers. This is critical for avoiding memory leaks that are so common among MVC applications.

If the value inside {NAME} is an object, that object will be bound to. For example, the following tooltip listens to clicks on the window:

    var Tooltip = can.Control({
      "{window} click" : function(el, ev){
        // hide only if we clicked outside the tooltip
        if(! this.element.has(ev.target ) {
          this.element.remove();
        }
      }
    })

    // create a Tooltip
    new Tooltip( $('<div>INFO</div>').appendTo(el) )

This is convenient when needing to listen to model changes. If EJS was not taking care of removing <li>s after their model is destroyed, we could implement it in Todos like:

    var Todos = can.Control({
      "init" : function( element , options ){
        var self = this;
        Todo.findAll({}, function( todos ){
          self.todosList = todos;
          self.element.html(self.options.template, todos )
        })
      },
      "li click" : function(li){
        li.trigger('selected', li.model() );
      },
      "li .destroy click" : function(el, ev){
        // get the li element that has todo data
        var li = el.closest('li');
      
        // get the model
        var todo = li.data('todo')
      
        //destroy it
        todo.destroy();
      },
      "{Todo} destroyed" : funtion(Todo, ev, todoDestroyed) {
        // find where the element
        var index = this.todosList.indexOf(todoDestroyed)
        this.element.children(":nth-child("+(index+1)+")")
            .remove()
      }
    })

    new Todos("#todos");

