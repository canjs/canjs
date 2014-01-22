@page RecipesEverything Everything Together
@parent Recipes 4

@body
The following recipes show a bunch of functionality working together.

### Basic Todo

This recipe demonstrates the very basic todo app covered in the [Tutorial tutorial]. You
can select a todo and edit it's text.  You can also delete a todo.  The app is
also history enabled, letting you move forward and back through different todos.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/c3bfy/embedded/result,html,js,css"
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

#### How it works

<iframe width="640" height="480" src="http://www.youtube.com/embed/PfTbkzh07iE" 
frameborder="0" allowfullscreen="allowfullscreen">YouTube</iframe>


The app starts by creating a `Todo` model that connects to a dummy data 
store (just an array). The `findAll`, `findOne`, `update` and `destroy` methods
simply returning the required deferreds.

It then creates a `Todos` control that manages a list of `todos`.  When a new Todos control is created
on an element via `new Todos("#todos")` it uses the `Todo` model to findAll todo instances,
renders them with `todosEJS` and inserts them into the `Todos` control instance's element.

The template `todosEJS` iterates through each todo instance using `list`.  For each todo,
it creates an `<li>` element.  It adds the instance's data to the `<li>` element's `$.data` 
with: `<%= (el) -> el.data('todo',todo) %>`.  Within each `<li>` it creates a
checkbox, span to contain the name, and destroy link.  EJS's live-binding will be used to
update the checkbox's `checked` attribute, the span's class attribute, and the span's content.

`Todos` also binds on various events such as `"li click"`, `"li .complete click"`, and 
`"li .destroy click"`. Here's what they do:

`"li click"` triggers a synthetic __selected__ event on the li clicked 
with the model data. This is a great technique for making reusable event-based widgets.  This
__selected__ event is listened to by the `Routing` control.

`"li .complete click"` gets the todo instance clicked from `$.data` and updates 
it's __complete__ property.  EJSs live-binding will take care of updating the DOM for you.

`"li .destroy click"` gets the todo instance from `$.data` and destroys it.  When an instance
in a list is destroyed, it is automatically removed from the list.  EJS's `list` method
listens for these changes and automatically updates the DOM.

Next, an `Editor` control constructor is created.  Editor is designed to take a todo instance and
edit it's name property.  First a new `Editor` is created on an element like:

@codestart
var editor = new Editor("#editor")
@codeend

And an instance to edit is passed like:

@codestart
editor.todo( todo );
@codeend

When `editor.todo( todo )` is called, it updates the editor's todo option and calls `this.on()`. This rebinds 
the editor's event handlers like `"{todo} updated"` and `"{todo} destroyed"` to bind to the 
updated todo option.  Then it calls `this.setName()` which updates the 
editor element's value.  

`"{todo} updated"` listens when a todo has been updated on the server and updates the name.

`"{todo} destroyed"` hides the editor if it's todo has been destroyed.

`"change"` listens to the input element's value changing, updates the todo's __name__ attribute and saves 
it to to the server.

Finally a `Routing` control constructor is created that manages the interaction between an `Editor` and
`Todos` control.  `Routing` is a traditional controller, while `Editor` and `Todos` are traditional
views. When a new `Routing` is created, it creates an `Editor` and `Todos` control.  It also
listens to changes in routes with `"route"` and `"todos/:id route"`.  

`"route"` matches when the hash is empty and hides the editor.

`"todos/:id route"` matches when the route is like `#!todos/5`.  When this happens, it shows the 
editor, loads that Todo with the model, and passed it to the editor.

`Routing` also listens to an `"li selected"` event.  This is the event created by 
the `Todos` control.  When this event happens, `Routing` updates the hash with the select todo's id.

### Paginated Grid with Buttons

Paginate through a list of links. This recipe shows how to use `can.Observe` can `can.compute` to
organize client state and pass it to child controls.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/Rtz2J/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

[How it works](http://bitovi.com/blog/2013/02/weekly-widget-paginated-grid.html)