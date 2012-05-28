---
layout: default
title: CanJS - Recipes
---

# CanJS recipes

The following is a list of __CanJS__ recipes to help you learn CanJS.  To
add your own, simply [edit this file](https://github.com/jupiterjs/canjs/edit/gh-pages/recipes.md). To
help create a JSFiddle, we've created the following fiddles you can fork:

 - [jQuery and CanJS](http://jsfiddle.net/donejs/qYdwR/)
 - [Zepto and CanJS](http://jsfiddle.net/donejs/7Yaxk/)
 - [Dojo and CanJS](http://jsfiddle.net/donejs/9x96n/)
 - [YUI and CanJS](http://jsfiddle.net/donejs/w6m73/)
 - [Mootools and CanJS](http://jsfiddle.net/donejs/mnNJX/)

## Controls

The following recipes explore making UI widgets with `can.control`.

### Tabs

The following recipes builds a simple tabs widget.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/z2N5k/1/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

___How it works___

It creates a `Tabs` constructor function that shows and hides tabs
when it's `<li>`'s are clicked.

When `new Tabs()` is called, it adds `active` to the first `<li>`'s 
className. Then, using the `tab` helper function, it hides the content for 
all the other tab buttons.

The `tab` helper function takes a `<li>` element like:

{% highlight html %}
<li><a href="#model">Model</a></li>
{% endhighlight %}

Then gets it's `<a>` element, and then uses it's href (`#model`) to get the
content div for that button.

When a button is clicked, `Tabs` listens to it with:

{% highlight javascript %}
"li click" : function( el, ev ) { ... }
{% endhighlight %}

This function, using the `tab` helper deactivates the active tab button and hides its content, 
then it activates and shows the new tab button and tab content.

### Tooltip

The following recipe builds a simple tooltip.  It shows templated event binding and we will
explain how it keeps memory leaks from happening. Click on one of the items
to see a tooltip, click somewhere else to remove it.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/d3T9c/1/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

___How it works___

This creates a `Tooltip` control that when created shows a tooltip.  When a `Tooltip` control
is created, it positions the `Tooltip` element relative to the `relativeTo` option and 
sets its inner html to the `html` option.

The tooltip also listens to clicks on the window.  If the user clicked on something other than the
`relativeTo` element and the tooltip element, it will remove the tooltip from the document.

When an element is removed from the DOM with any controls on it, the control's event handlers
are automatically removed.  Templated event binding lets us listen to events outside 
the element.  `"{window} click"` is a templated event binding.

Events outside an element would normally not be removed, but they are with `can.Control`.

## Routing

The following recipes explore using `can.route`.


### History Tabs

This recipe shows how to make a history-based tabs widget and have routes
configured independently by can.route.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/Z9Cv5/2/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

___How it works___

The HTML is structured such that each tab button has an `<a>` element with an 
href property that matches the `id` attribute of the tab content 
panel it should show.  This means that even if JavaScript was disabled,
clicking a button would send the user to the tab panel (even though
HistoryTabs overwrites this behavior).

For example:

{% highlight html %}
<li><a href="#model">can.Model</a></li>
{% endhighlight %}

references:

{% highlight html %}
<div id="model" class="tab">
{% endhighlight %}

The JavaScript code begins by creating a `HistoryTabs` 
control.  When a new `HistoryTabs` instance is created, it gets
an __attr__ option like:

{% highlight javascript %}
new HistoryTabs( '#components',{attr: 'component'});
{% endhighlight %}

The __attr__ method is used to configure which part of `can.route`'s data the 
history tab will be listening to.  

When `init` is called, it hides each tab button's content div, looking up
the content div with the `tab` helper method.  It then reads the current 
active tab with:

{% highlight javascript %}
var active = can.route.attr(this.options.attr);
{% endhighlight %}

It passes that value to the `active` helper which will hide the old active
content (if `oldActive` is passed) and activate the new active button and
show it's content.

`HistoryTab` updates the active tab by listening when a tab button is clicked with
`"li click"`.  It prevents the default behavior (which is changing the hash) and
updates it's route data attribute with the select tab's id:

{% highlight javascript %}
can.route.attr(this.options.attr, this.tab(el)[0].id)
{% endhighlight %}

`HistoryTabs` listens to these route changes with `"{can.route} {attr}"` and activates
the new tab.

__Configuring Routes__

The code ends by configuring the routes and creating the `HistoryTabs`.  Here's what each
route rule means:

{% highlight javascript %}
can.route(":component",{
  component: "model",
  person: "mihael"
});
{% endhighlight %}

This matches the empty routes ("","#","#!"), and a single "word" route.  If the route
is one of the empty routes, the route data will look 
like: `{component: "modal", person: "mihael"}`.  If it is a single "word" route like
`"#!view"`, the data will look like:  `{component: "view", person: "mihael"}`.

{% highlight javascript %}
can.route(":component/:person",{
  component: "model",
  person: "mihael"
});
{% endhighlight %}

This matches two-word routes seperated by a slash ("/").  Each word can be empty. If both
words are empty "#!/", the data will look 
like: `{component: "model", person: "mihael"}`.  If the words are non-empty, that word
will replace the default value.

### Observe Backed Routes

This recipe shows how to have multiple widgets listening on 
overlapping parts of the route. The app lets the user select a type of issue, show issues for that type,
and select a issue and see details about that issue.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/YRXHV/15/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

___How it works___

This functionality is broken down 
into __Nav__, __Issues__, and __Details__ can.controls.  Here's how
each part works:

`Nav` creates links using `can.route.link` that update the hash like:

{% highlight javascript %}
<%== can.route.link("Critical",{filter: "critical"}) %>
{% endhighlight %}

When these are clicked on, they update the route's filter data.  

`Issues` listens to filter changes like:

{% highlight javascript %}
"{can.route} filter" : function(route, ev, filter){ ... }
{% endhighlight %}

It then retrieve's issue with `Issue.findAll` and renders 
them into the `#issues` element.

When an issue is clicked, `Issues` updates the route's issue data like:

{% highlight javascript %}
can.route.attr("issue", issue.id)
{% endhighlight %}

It listens to changes in `issue` data and highlights the corresponding
issue in the list like:

{% highlight javascript %}
"{can.route} issue" : function(route, ev, issue){ ... }
{% endhighlight %}

`Details` listens to issue chagnes like:

{% highlight javascript %}
"{can.route} issue" : function(route, ev, issue){ ... }
{% endhighlight %}

And updates the details panel.



## Live Binding

The following recipes show how to use `can.EJS`'s live binding.

### Updating timestamps

The following shows how to create an automatically updating `prettyDate`
helper for EJS that can be used like:

{% highlight javascript %}
<%= prettyDate( new Date() ) %>
{% endhighlight %}

Notice how the _created_ value changes every couple min or 
so. 

The `prettyDate` method works with or without live-binding.  It doesn't need to take
an observe, just a date.  Code with EJS becomes live naturally ... amazing.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/qYdwR/36/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

## Models

The following recipes show how to use `can.Model` (and often the `can.fixture` plugin).

### Showing the same data in 2 places

The following recipe shows how `can.Model`'s internal store and `can.view`'s live-binding
can easily solve the editing-data-that-is-represented-two-places problem.  It 
shows two task lists of overlaping data.  Notice how the __"do dishes"__ is listed 
twice. But if you click one "do dishes" checkbox, it updates the other.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/pCtxs/5/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>


___How it works___

The code first sets up a `can.fixture` to return different, but overlapping lists of 
tasks from the server.  The fixture returns data from the following calls:

 - `/tasks?due=today`
 - `/tasks?type=critical`

You'll notice "do dishes" in both lists.

The code then creates a `Task` model that maps findAll to `/tasks`.  It then uses
`can.view` to render the retrieved tasks with the `tasksEJS` template. 

Finally, it listens when an `input` element's value changes.  When it does,
it gets the task model instance from the `li` element's `$.data` and 
updates it's "complete" property.

___The Secret Sauce___

Model keeps an internal, non-leaking, store of instances your app loads.  When
`Task.findAll({type: "critical"})` and `Task.findAll({due: "today"})` get their
raw JSON data from the server, they convert it to instances.  But before they create
a new instance, they check if the same instance, matched by 
the [id](http://donejs.com/docs.html#!can.Model.static.id) property already exists.  If it
does, it uses that instance. 

This means that the `criticalTasks` list and `todaysTasks` list both point to the 
same instance. When `can.EJS` does it's live binding on `<%= task.attr("complete") ? "checked" : "" %>`
it's actually binding on the same "do dishes" intance once.  So updating "do dishes" updates
the DOM in two places!

### Duplicating a Restful API in Local Storage

The following recipe shows how `can.Model` can be used to create an ORM-like 
model layer for keeping a local copy of a restful API. This type of base model
is perfect for situations where you want a responsive UI, but may not want to 
wait for updates from the server before displaying data, or you need to make 
your data persist offline. Storing your responses in `localStorage` allows you 
to access it offline as well as get data to the view as quickly as possible.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/ralphholzmann/73Xuk/4/embedded/result%2Cjs/" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

___How it works___

When creating your base model for other models to extend from, you can prefix 
any static method with `make`, to allow the base model to define how the 
extending model's method will behave. In this example, our base model implements
a static method called `makeFindOne`. This method acts as a hook to define the 
extending model's `findOne` method. Using this, we can create a middleware-like
layer between the extending model and the base model that loads and saves model
data to `localStorage`, while still requesting out to the restful API to get 
modal updates.

___The Secret Sauce___

The secret sauce for this example is the static `makeFindOne` method along with
EJS's live binding. Because the live binding will automatically update when the 
bound model gets updated, we can write our code as usual and allow the base model
to deliver `localStorage` data instantly, while automatically upating with responses
from the server, with no extra effort.

## Everything Together

The following recipes show a bunch of functionality working together.

### Basic Todo

This recipe demonstrates the very basic todo app covered on [http://canjs.us]. You
can select a todo and edit it's text.  You can also delete a todo.  The app is
also history enabled, letting you move forward and back through different todos.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/ADWhw/39/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>


___How it works___

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

{% highlight javascript %}
var editor = new Editor("#editor")
{% endhighlight %}

And an instance to edit is passed like:

{% highlight javascript %}
editor.todo( todo );
{% endhighlight %}

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


