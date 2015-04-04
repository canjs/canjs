@page Controls Controls
@parent Tutorial 6

@body 

Controls are organized, memory-leak free, performant, stateful UI
controls. can.Control lets you create controls like tabs, grids, context
menus, and forms, and helps you organize them into higher-order business
units, tying them all together with [can.route](../docs/can.route.html).
Controls fill the traditional MVC controller role, managing data through
Models made with can.Model and directing it to be displayed through views made
with can.view.

Because Controls are a subclass of Constructs, you can create control constructors and
instances just like with can.Construct. Here's what the constructor for a Control
that manages a Todo list might look like:

```
var Todos = can.Control({
	init: function(el, options) {
		var self = this;
		Todo.findAll({}, function(todos) {
			self.element.html(can.view('todoList', todos));
		});
	}
});
```

To instantiate a control, pass it a selector, element, or library-wrapped
NodeList that corresponds to the DOM element you want the Control to use as
the containing element (which will be set to `this.element` for that Control).
Also pass the control an object with any options for that particular instance.
These options will be extended off of the Control's constructor's static
defaults and set as `this.options` for that Control.

Here we'll initiate a Todos controller to hang off of the element with ID _todos_
and with no options supplied:

```
var todosList = new Todos('#todos', {});
```

If you specify a method called `init` when creating your Control's constructor,
that method will be called when a new instance of that Control is created. The
`init` method gets passed a library-wrapped NodeList containing `this.element`
as the first parameter and `this.options` as the second parameter. Any other
parameters you passed to the constructor during instantiation will also be passed
to `init`.

To demonstrate this, here is another version of the Todo list Control constructor
that can have its view overridden, and the instantiation of that Control:

```
var Todos = can.Control({
	defaults: {
		view: 'todos.ejs'
	}
},{
	init: function(el, options) {
		var self = this;
		Todo.findAll({}, function(todos) {
			self.element.html(can.view(this.options.view, todos));
		});
	}
});

// this Control will use todos.ejs
new Todos(document.body.firstChild);

// this Control will use todos2.ejs
new Todos('#todoList', {view: 'todos2.ejs'});
```

## Listening to events

Controls will automatically bind instance methods that look like event handlers.
On this Control, _click_ events on elements inside `this.element` will
trigger the console log to be written to:

```
var Todos = can.Control({
	init: function(el, options) {
		var self = this;
		Todo.findAll({}, function(todos) {
			self.element.html(can.view('todoList', todos));
		});
	},
	'li click': function(el, ev) {
		console.log('You clicked ' + el.text());
	}
});
```

The event handlers are passed a library-wrapped NodeList containing the element
that was clicked, and the event. can.Control uses event delegation, so you don't
need to rebind handlers when you add or remove elements.

One of the things that we want to do with our to-do list is delete Todos. This
is made easy with event handling in can.Control. Let's say that our view
template looks like this:

```
&lt;script type="text/ejs" id="todoList">
<% this.each(function(todo) { %>
&lt;li <%= (el) -> el.data('todo', todo) %>>
	<%= todo.attr('description'); %>
	&lt;a class="destroy">X&lt;/a>
&lt;/li>
<% }) %>
&lt;/script>
```

We should put an event listener on our Todos Control to remove a Todo when its
destruction link is clicked:

```
var Todos = can.Control({
	init: function(el, options) {
		var self = this;
		Todo.findAll({}, function(todos) {
			self.element.html(can.view('todoList', todos));
		});
	},
	'li click': function(el, ev) {
		console.log('You clicked ' + el.text());
	},
	'li .destroy click': function(el, ev) {
		var li = el.closest('li'),
			todo = li.data('todo');

		todo.destroy();
	}
});
```

Destroying the Todo will take it out of the list of Todos being rendered
(because the list of Todos passed into the template is a Model List), which will
cause the template to re-render itself. This means that live binding will
remove the appropriate &lt;li> automatically.

## Templating event handlers

If a variable is placed in braces in the event handler key, can.Control will
look up that key in the Control's `options`, and then on `window`. You can use
this to customize the events that cause handlers to fire:

```
var Todos = can.Control({
	defaults: {
		destroyEvent: 'click'
	}
},{
	init: function(el, options) {
		var self = this;
		Todo.findAll({}, function(todos) {
			self.element.html(can.view(this.options.view, todos));
		});
	},
	'li .destroy {destroyEvent}': function(el, ev) {
		var li = el.closest('li'),
			todo = li.data('todo');

		todo.destroy();
	}
});

new Todos('#todos', {destroyEvent; 'mouseenter'});
```

You can also use this to bind events to objects other that `this.element`
within Controls. This is critical for avoiding memory leaks that are
commonplace with other MVC applications and frameworks because it ensures that
these handlers get unbound when the control is destroyed:

```
var Tooltip = can.Control({
	'{window} click': function(el, ev) {
		// hide only if we clicked outside the tooltip
		if(! this.element.has(ev.target).length) {
			this.element.remove();
		}
	}
});
```

This is useful for listening to changes on models. Say that our live-binding did
not take care of removing &lt;li>s after the corresponding Model was destroyed.
In that case, we could implement that functionality by listening to when Todos
are destroyed:

```
var Todos = can.Control({
	defaults: {
		destroyEvent: 'click'
	}
},{
	init: function(el, options) {
		var self = this;
		self.todosList = todos;
		Todo.findAll({}, function(todos) {
			self.element.html(can.view(this.options.view, todos));
		});
	},
	'li .destroy {destroyEvent}': function(el, ev) {
		var li = el.closest('li'),
			todo = li.data('todo');

		todo.destroy();
	},
	'{Todo} destroyed': function(Todo, ev, destroyed) {
		// find where the element is in the list
		var index = this.todosList.indexOf(destroyed);
		this.element.children(':nth-child(' + (index + 1) + ')').remove();
		this.todosList.splice(index, 1);
	}
});
```

## Rebinding events

You can unbind and rebind all a Control's event handlers by calling `on` on it.
This is useful when a Control starts listening to a specific Model, and you want
to change which model it is listening to.

In the example below, an Editor Control keeps a reference to the specific Todo
it is editing. Its `todo` method calls `on` when the Todo being edited switches,
because it needs to rebind `{todo} updated`.

```
var Editor = can.Control({
	setDesc: function() {
		this.element.val(this.options.todo.description);
	},
	// change what Todo this Control points at
	todo: function(todo) {
		this.options.todo = todo;
		this.on();
		this.setDesc();
	},
	// listen for changes in the Todo
	'{todo} updated': function() {
		this.setDesc();
	},
	// when the input changes, update the Todo
	' change': function(el, ev) {
		this.options.todo.attr('description', el.val());
		this.options.todo.save();
	}
});

var todo1 = new Todo({id: 7, description: 'Take out the trash.'}),
	todo2 = new Todo({id: 8, description: 'Wash the dishes.'}),
	editor = new Editor('#editor');

// start editing the first Todo
editor.todo(todo1);

// switch to editing the second Todo
editor.todo(todo2);
```

## Destroying Controls

Calling `destroy` on a Control unbinds the Control's event handlers and removes
its association with its element, but it does not remove the element from the
page.

```
var list = new Todos('#todos');
$('#todos').length; // 1
list.destroy();
$('#todos').length; // 1
```

However, when a Control's element is removed from the page, `destroy` is called
on the Control.

Taken together, templated event binding and Control's automatic cleanup make it
nearly impossible to write applications with memory leaks. An application that
uses only templated event handlers on the controls within the body could free
up all the data it uses by calling `$(document.body).empty()`.
