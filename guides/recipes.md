@page Recipes Recipes
@parent guides 4

@body

## Get Started

There are a variety of ways to get CanJS.  Read the [using CanJS guide](http://canjs.com/guides/Using.html)
for comprehensive list.  For the following recipes, we will load CanJS
with a `<script>` tag pointed to CanJS's CDN.

Create a file called `myapp.html` and put the following in it to get started:

	<script src="//code.jquery.com/jquery-1.10.1.min.js"></script>
	<script src="//canjs.com/release/2.0.4/can.jquery.js"></script>
	<script type="text/mustache" id="app-template">
	//Template will go here
	</script>
	<script>
	//Application code will go here
	</script>

	<!-- CanJS needs a place to put your application -->
	<div id="my-app"></div>

To follow along with the other recipes, you can also use
[this JSFiddle](http://jsfiddle.net/donejs/GE3yf/) as a template.

You can also [Download CanJS](http://canjs.com/download.html)
or follow [other tutorials](http://canjs.com/guides/Tutorial.html) to get
started, but for the rest of the examples below, we'll be using this
setup.

## Say "Hello World"

In CanJS, content is displayed using *templates*.  Instead of manually
changing elements in the DOM, you create a template and CanJS
automatically updates the page from the data in your application code.

### Template

In the template section of `myapp.html`, put the following:


    <script type="text/mustache" id="app-template">
    <h1>{{message}}</h1>
    </script>

This template displays the value of `message`.

### Pass message to the Template

Templates are rendered with [can.view](../docs/can.view.html), which takes two arguments: the first is the `id` of the template,
and the second is the data passed to the template (in this case,
an object with a `message` property).

Render the template with a `message` and insert it into the page with:


    <script>
    // Give message a value
    var data = {message: "Hello World!"};

    // Pass the id of the template and the data, containing our message to can.view
    var frag = can.view("app-template", data);

	//Load the DocumentFragment in the page
    $("#my-app").html( frag )
    </script>

> `frag` is a [DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment). A DocumentFragment
> is a lightweight container of HTMLElements that can be inserted in the page quickly. They can be used
> anywhere a normal HTMLElement is used.

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/GE3yf/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

## Update Text in the Page

CanJS will update the page automatically when [observable](http://sourcemaking.com/design_patterns/observer)
data changes. To make observable data, pass raw data to [can.Map](../docs/can.Map.html),
[can.List](../docs/can.List.html) or [can.compute](../docs/can.compute.html) like:

	var data = new can.Map({message: "Hello World!"});

To change the message, use the [attr()](../docs/can.Map.prototype.attr.html) method of `can.Map`.

	data.attr("message", "Goodbye World!")

When the button is clicked in the example below, the message is
changed with `data.attr()`.

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/quTtE/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

### Show a List in a Template

To make an Array observable, pass it to [can.List](../docs/can.List.html).

	var people = new can.List([
		{firstname: "John", lastname: "Doe"},
		{firstname: "Emily", lastname: "Dickinson"}
	])

	var frag = can.view("app-template", {people: people})
	$("#my-app").html(frag);


To show a list of data within a mustache template, use the `#each` operator.

    <ul>
    {{#each people}}
	  <li>
	    {{lastname}}, {{firstname}}
	  <li>
    {{/each}}
    </ul>

Inside the `#each` block, the attributes are scoped to individual
objects in the list of `people`.

To make changes to the list, use an Array method such as
[push](/docs/can.List.prototype.push.html)
or [pop](/docs/can.List.prototype.pop.html).

	// adds a new person
	people.push({firstname: "Paul", lastname: "Newman"})
	// removes the last person
	people.pop()

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/Pgbpa/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

### Show and Hide Elements

Instead of showing and hiding elements by changing the DOM
directly like:

    $("h1").show()
    $("h1").hide()

Make the template show or hide those elements when a value
changes.  


    {{#if visible}}
      <h1>{{message}}</h1>
    {{/if}}

When the button is clicked, change the observable value.

    data.attr("visible", !data.attr("visible"))

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/eFss4/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

#### Application State

Typically, it's not a good idea to mix view state and application data.
In the previous example, the `message` is application data, while the
`visible` property represents view state. In CanJS, state and data
should be separated using different observables.

	var data = new can.Map({message: "Hello World!"}),
		state = new can.Map({visible: true});

	var frag = can.view("app-template", {
	  data: data,
	  state: state
	})

As an application gets more complex, separating state from data
makes things more maintainable.

### Create a Live Timestamp

This recipe demonstrates how to generate a 'live' timestamp
that displays in a human-readable format. This means handling
application state that changes over time, as well as making
information rendered in a template human-readable using a helper function.

First, we'll add a `createdAt` property to the data like:

     var data = new can.Map({
       message: "Hello World",
       createdAt: new Date()
     })

On the page, this should be displayed as a human readable
timestamp:

     <h1>Hello World <i>created just now</i></h1>

__and__ as time passes, the timestamp will update to:

    <h1>Hello World <i>created a few seconds ago</i></h1>

__and__ then update to "some seconds ago" and so forth.

To accomplish this, create a `prettyDate` [mustache helper](../docs/can.mustache.helper.html) that converts
dates into a human readable format.  A helper function is called from within the template where its result
will be displayed.  The following calls `prettyDate` with an observable value of `createdAt`.

    <h1>
      {{message}}
      <i>created {{prettyDate createdAt}}</i>
    </h1>

To call a function from a template, [register](../docs/can.mustache.registerHelper.html) it with `can.view`.
The third argument passed to `can.view` is an object with helper functions, so the `dateHelper` function
can be registered as `prettyView`.

		var dateHelper = function ( date ) {
			//helper function
		}

    var frag = can.view("app-template", data, {prettyDate: dateHelper});

In this helper, `date` is not a Date object, instead it is an observable [can.compute](../docs/can.compute.html) that
contains the `createdAt` value.  A `can.compute` is an observable that contains a single value.  To read the value,
call the compute like you would any other function:

    date() //-> Date

We need to compare `date` with the current time. The current time
will be represented by a compute:

    var now = can.compute( new Date() )

As the current time changes, we update `now` with the new time. To change the value of a `can.compute`,
call it with its new value as an argument:

    // update that property every second
    setTimeout(function(){
        now( new Date() );
        setTimeout(arguments.callee, 1000);
    },1000)

The `prettyDate` helper will read and compare the `date` and `now` compute to
get the time elapsed in seconds:

    var timeElapsed = ( now() - date() ) / 1000


Using the `timeElapsed`, `prettyDate` returns human readable timestamps:

	  if(timeElapsed < 1.2){
	    return "just now"
	  } else if (timeElapsed < 10) {
	    return "a couple seconds ago"
	  }
      ...
	  else {
	    return Math.round(difference/60)+" minutes ago"
	  }


<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/VQNSH/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

## Handle User Interaction

When a user does something, such as clicking, an `event` occurs. Event handlers specify
how [JavaScript should respond to an event](http://bitovi.com/blog/2010/10/a-crash-course-in-how-dom-events-work.html).

This recipe will introduce handling a click event using a [`can.Control`](http://canjs.com/docs/can.Control).
Using a list of people like previous recipes, clicking any individual person's name
will remove that person from the list.

Previous examples have used jQuery's event handlers:

	$("#push").click(function(){
	  //handle the event
	})

CanJS provides a few different ways to respond to events. As well as
making application code simpler, using CanJS to handle events can help to
automatically prevent [memory leaks](http://bitovi.com/blog/2012/04/zombie-apocolypse.html).

To handle events, extend `can.Control`.

	var PeopleList = can.Control.extend({
		//behavior
	});

You create a `can.Control` by [calling it as a constructor function](http://canjs.com/docs/can.Control.html#sig_newcan_Control_element_options_).
The first argument is the element the control will be created on.
The second argument is an object of options.

	new PeopleList('#my-app', {people: people});

A `can.Control` handles events with functions declared with two arguments: an
element or list of elements (using a jQuery-style selector) and a specific event.
Below, this is 'li click', meaning when any `li` elements that are `clicked` the
function will be called to handle the click event. 

	var PeopleList = can.Control.extend({
	  init: function( element, options ){
	       this.people = new can.List(options.people);
	       this.element.html( can.view('app-template', {
	       		 //defines people in the template as the observable can.List
	           people: this.people
	      }));
	  },
		'li click': function( li, event ){
			//Handle the click event
		}
	}

When the constructor function is called and the `can.Control`
is instantiated:

1. The `init` method is called
2. An observable `can.List` is created from `people`
3. The list is rendered using `can.view` so when the list changes, so will the view

	var people = [
    {firstname: "John", lastname: "Doe"},
    {firstname: "Emily", lastname: "Dickinson"},
    {firstname: "William", lastname: "Adams"},
    {firstname: "Stevie", lastname: "Nicks"},
    {firstname: "Bob", lastname: "Barker"}
	];

When the event handler for a `click` runs, it needs a way
to access the object associated with the `li` that was clicked.
With the [`data`](http://canjs.com/docs/can.mustache.helpers.data.html) helper,
the element will retain a reference
to the object it is associated with (in this case, a `person`).

	<ul>
	{{#each people}}
	    <li {{data 'person'}}>
			{{lastname}}, {{firstname}}
	    </li>
	{{/each}}
	</ul>  

Finally, the event handler must be defined. In a `can.Control`,
an event handler function [can be defined with a string containing
a selector and an event](http://canjs.com/docs/can.Control.html#section_Listeningtoevents).
In this case, these are `li` and `click`, recpectively,
since we want to handle click events on each list item.

	var PeopleList = can.Control.extend({
	  init: function(){
	  	...
	  },
	  'li click': function( li, event ) {
	         var people = this.options.people;
	         var person = li.data('person');
	         var index = people.indexOf(person);
	         people.splice(index, 1);
	  }
	});

When a user clicks a list item:

 1. The function bound to `li click` is called
 2. The object associated with that list item is accessed using the `data` helper
 3. That 'person's data is removed from the observable list of `people`
 4. The template updates automatically

As a reminder, though event handlers respond to actions on the page,
they should *change application state or data* (e.g. make a change to a `can.Map`)
rather than modifying the DOM directly (e.g. toggling a class).
This will update the page automatically, keeping code manageable.

This is *one* way to handle events. Others will be covered
in the following recipes while building widgets.

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/F9kzt/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

## Build Widgets/UI Elements

Previous recipes have demonstrated how to change page content and introduced
event handling. The following recipes will introduce `can.Component`,
which allows for straightforward widget construction by packaging
template, state, and event handling code in one place.

While similar *behavior* can be accomplished with `can.Control`,
building a Component enables building reusable widgets using custom
HTML tags.

### Create a Component

The previous recipe that displays a list of people can instead
be represented as a component.

	<people></people>

By specifying `people` as the tag, a component is created wherever `<people></people>`
appears in a template.

	can.Component.extend({
	    tag: 'people',

The `scope` object on a `Component` contains the component's state, data,
and behavior. Here, it specifies how to `remove` a person from the list:

	    scope: {
	        people: people,
	        remove: function( person ) {
	            var people = this.attr("people");
	            var index = people.indexOf(person);
	            people.splice(index, 1);
	        }
	    }
	});

The template for the component itself is passed via the `template`
property. This can either be an external file or a string.
Each `li` uses `can-click`, [which declares an event binding.](http://canjs.com/docs/can.view.bindings.can-EVENT.html)
Here, `remove` inside the component's
scope will be called with the relevant `people` object
as an argument.

	scope: {
	    template: '<ul>' +
	                '{{#each people}}' +
	                '<li can-click="remove">' +
	                    '{{lastname}}, {{firstname}}' +
	                '</li>' +
	                '{{/each}}' +
	                '</ul>',
	...

This behaves similarly to the `can.Control` from above.
However, the `<people>` tag can be used without having
any knowledge about the inner workings of the widget.
Using declarative HTML tags, a component can be used
without writing any javascript. The template, state,
and behavior are all combined into one Component.

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/WBM9z/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

### Build a Tabs Widget

A tabs widget could be instantiated with the following HTML:

	<tabs>
		<panel title="Fruit">Oranges, Apples, Pears</panel>
		<panel title="Vegetable">Carrot, Lettuce, Rutabega</panel>
		<panel title="Grains">Bread, Pasta, Rice</panel>
	</tabs>

A designer that understands HTML can put together a template for a `tabs`
widget without understanding anything other than the syntax.
This is one of the most useful features of components. 

### Tabs Widget Behavior

Before implementing the component itself, we'll
define an observable *view model*--the `scope` object
of the UI element. This makes the code modular and easier
to manage (and also allows for unit testing).

In order to accurately represent a tabs widget,
a `TabsViewModel` needs:
<ul>
<li>An observable list of panels</li>
<li>A state variable with the active panel</li>
<li>Helper methods to add, remove, and activate panels</li>
</ul>

Since TabsViewModel is a `can.Map`, the `panels` property is
automatically converted to a `can.List`.
The `active` property references the `panel` object
that should currently be displayed.

	var TabsViewModel = can.Map.extend({
		panels: [],
		active: null,
		addPanel: function( panel ){
			var panels = this.attr("panels");
			panels.push(panel);
			panel.attr("visible", false);
			//activate panel if it is the first one
			if ( panels.attr("length") === 1 ){
				this.activate( panel );
			}
		},
		removePanel: function( panel ){
			var panels = this.attr("panels");
			var index = panels.indexOf(panel);
			panels.splice(index, 1);
			//activate a new panel if panel being removed was the active panel
			if( this.attr("active") === panel ){
				panels.attr("length") ? this.activate(panels[0]) : this.attr("active", null)
			}
		},
		activate: function( panel ){
			var active = this.attr("active")
			if( active !== panel ){
				active && active.attr("visible", false);
				this.attr("active", panel.attr("visible", true));
			}
		}
	})

#### Tabs Widget Component

Now that the view model is defined, making a component is simply
a matter of defining the way the tabs widget is displayed.

The template for a `tabs` component needs a list of panel titles
that will `activate` that panel when clicked. By calling `activate`
with a panel as the argument, the properties of the `panel` can
be manipulated. By changing the `visible` property of a panel,
a template can be used to display or hide the panel accordingly.

For this component, our template should look something like this:

	<tabs>
		<panel title="Fruits">Apples, Oranges</panel>
		<panel title="Vegetables">Carrots, Celery</panel>
	</tabs>

A designer can create a `tabs` component with `panel` components inside it.
The `template` object on the tabs component's scope needs to be able to render
the content that is inside of the `<tabs>` tag. To do this, we simply use the
`<content>` tag, which will render everything within the component's tags:

	can.Component.extend({
		tag: "tabs",
		scope: TabsViewModel,
		template: "<ul>\
					{{#each panels}}\
						<li can-click='activate'>{{title}}</li>\
					{{/each}}\
					</ul>\
					<content />"
	});

The `tabs` component contains panels, which are also defined
as components. The tabs template contains the logic for whether
the panel is visible (`visible` is controlled by the tabs
component's `activate` method).

Each panel's `scope` contains a title, which should be
taken from the `title` attribute in the `<panel>` tag.
If you want to set the string value of a Component's
attribute as a `scope` variable, use  `@'`.

	can.Component.extend({
	tag: "panel",
	template: "{{#if visible}}<content />{{/if}}",
	scope: {
		title: "@"
	},
	...

In addition to the `scope` property, a component has an
[`events` property](http://canjs.com/docs/can.Component.prototype.events.html).
This `events` property uses a `can.Control` instantiated inside
the component to handle events.

Since we defined behavior for adding panels on the parent
`tabs` component, we should use this method whenever a `panel`
is inserted into the page (and an `inserted` event is triggered).
To add the panel to the `tabs` component's scope, we call the
`addPanel` method by accessing the parent scope with `this.element.parent().scope()`:

	...
		events: {
			inserted: function() {
				this.element.parent().scope().addPanel( this.scope )
			},
			removed: function() {
				this.element.parent().scope().addPanel( this.scope )
			}
		}
	});

With this component, any time a `<tabs>` element with
`<panel>` elements is put in a page, a tabs widget will
automatically be created. This allows application behavior
and design to be compartmentalized from each other.

<iframe width="100%" height="300" src="http://jsfiddle.net/x6TJK/2/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

## Build an Application with Data from a Server

In CanJS, `can.Model` adds functionality to `can.Map` to
work with data on a server.  It enables you to:

 - Get and modify data from a server
 - Listen to changes made to the data on the server
 - Unify service data with other objects in your application

`can.Model` allows you to access data from a server
easily:

	var Todo = can.Model.extend({
	  findAll: 'GET /todos',
	  findOne: 'GET /todos/{id}',
	  create:  'POST /todos',
	  update:  'PUT /todos/{id}',
	  destroy: 'DELETE /todos/{id}'
	},{});

Using *any* server with a [*REST* interface](http://blog.mashape.com/post/60820526317/list-of-40-tutorials-on-how-to-create-an-api),
 `can.Model` enables create, read, update, and destroy functionality.

### Create a Chat Application

To put together a chat application, we'll use two methods
from `can.Model` to fetch the messages and create new ones:

	var Message = can.Model({
	    findAll : 'GET ' + myServerUrl + '/messages',
	    create : 'POST ' + myServerUrl + '/messages'
	},{});

In a chat component's scope, we will use the `Message` model to
save new messages and observe changes to the Model.
[`new Message.List({})`](http://canjs.com/docs/can.Model.List.html#sig_newcan_Model_List__models__) is a shortcut to perform
the [`findAll`](http://canjs.com/docs/can.Model.findAll.html) operation on a `can.Model` and
return a `can.List`.

	...
		scope: {
				messages: new Message.List({}),
				newMessage: ""
	...

The tabs Component used `can-click` to listen for click events.
Since this chat application uses a `<form>` for sending messages, we'll use
`can-submit` to specify an event handler.

There's one more helper used in the template: [`can-value`](http://canjs.com/docs/can.view.bindings.can-value.html).
This automatically two-way binds the value of an input field to an observable
property on the `scope` of the component (in this case, `newMessage`).

	can.Component.extend({
	  tag: 'chat',
	  template: '<ul id="messages">' +
	              '{{#each messages}}' +
	              '<li>{{body}}</li>' +
	              '{{/each}}' +
	            '</ul>' +
	            '<form id="create-message" action="" can-submit="submitMessage">' +
	                '<input type="text" id="body" placeholder="type message here..."' +
	                'can-value="newMessage" />' +
	            '</form>',
	...


When `submitMessage` is called, a new `Message` is created
with `new Message()`. Since `can-value` was declared on the `input` element, `newMessage` will
always be the current text in the `input` field.
The body of the message is fetched from
the Component's `newMessage` attribute when a user submits the form.


To save the new message to the server, call `save()`.

    submitMessage: function(scope, el, ev){
        ev.preventDefault();
        new Message({body: this.attr("newMessage")}).save();
        this.attr("newMessage", "");
    }

Finally, when a new `Message` is created, the `messages` list
must be updated.

    events: {
        '{Message} created': function(construct, ev, message){
            this.scope.attr('messages').push(message);
        }
    }

There are two ways that messages are added: from the current user,
or from another user. In the next section, we demonstrate how to use
[socket.io](http://socket.io/) to update the `Message` model with messages
from other users in real time. Binding to the `created` event for **all**
messages allows us to create a single entry point that pushes new messages
to the `scope`, [regardless of where those messages are from.](http://canjs.com/docs/can.Model.html#section_Listentochangesindata)

When the chat Component is loaded, messages are loaded from the server
using `can.Model` and `new Message.List({})`.  When a new message is
submitted:

1. `submitMessage` is called via the event handler bound by the `can-submit` attribute
2. a new `Message` is created and saved to the server
3. `'{Message} created'` detects this change and adds the new message to `messages`
4. The template is automatically updated since `messages` is an observable `can.List`

### Add real-time functionality

This example uses [socket.io](http://socket.io/)
to enable real-time functionality. This guide won't go
into detail on how to use `socket.io`, but for real-time
chat the application needs two more things.

When a message is created on another chat client, `socket.io`
will notify this client by triggering the `message-created` event,
wich will render the new message in the page by adding it to the
`Message` model.

	var socket = io.connect(myServerUrl)
	socket.on('message-created', function(message){
		new Message(message).created();
	})

To keep the `created` event from firing
twice, we modify the `create` function in the model.
If there was simply a `return` statement, `Model` would
create and fire a `create` event, which `socket` is already
doing. By returning a `Deferred`, we prevent firing of
one of these events.

	var Message = can.Model({
    findAll : 'GET ' + myServerUrl + '/messages',
    create : function(attrs) {
        $.post(myServerUrl + '/messages', attrs);
        //keep '{Message} created' from firing twice
        return $.Deferred();
    }
	},{});

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/afC94/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>

## Add my own recipe

To add your own recipe, simply [edit this file](https://github.com/bitovi/canjs/edit/gh-pages/recipes.md). To
help create a JSFiddle, we've created the following fiddles you can fork:

 - [jQuery and CanJS](http://jsfiddle.net/donejs/qYdwR/)
 - [Zepto and CanJS](http://jsfiddle.net/donejs/7Yaxk/)
 - [Dojo and CanJS](http://jsfiddle.net/donejs/9x96n/)
 - [YUI and CanJS](http://jsfiddle.net/donejs/w6m73/)
 - [Mootools and CanJS](http://jsfiddle.net/donejs/mnNJX/)

## Request a Recipe

To request a new recipe or vote on an upcoming one, [submit an issue](https://github.com/bitovi/canjs.com/issues)
to the `canjs.com` respository on GitHub.