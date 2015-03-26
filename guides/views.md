@page Templates Templates
@parent Tutorial 3

@body

[can.view](../docs/can.view.html) loads and renders templates with the data
you provide, and returns a documentFragment with the populated template.
can.view supports many templating languages, but [EJS EJS] and [Mustache
Mustache] allow you to live bind to Observes within templates. Live binding
will dynamically update your template in the DOM automatically whenever the
properties within Observes change.

## Loading templates

You can load templates from a URL or directly from an existing script tag. To
load from a script tag, pass `can.view` the tag's ID as the first parameter. To
load from a URL, pass the URL as the first parameter. Use the second parameter to
pass the data to populate the template with.

In order to register a template with can.view, create a script tag on the page
with an ID, a `type` attribute that matches the templating language, and the
content of the template inside:
@codestart
&lt;script type="text/ejs" id="todoList">
<% can.each(this, function(val, key) { %>
	&lt;li><%= val.attr('description') %>&lt;/li>
<% }); %>
&lt;/script>
@codeend

Then load the template using the script tag's ID and pass the template data:
@codestart
Todo.findAll({}, function(todos) {
	$('#nav').html(can.view('todoList', todos))
});
@codeend

Or you can load a template without registering it first (or including it on the
page) by giving the URL to `can.view`:
@codestart
Todo.findAll({}, function(todos) {
	$('#nav').html(can.view('todos/todos.ejs', todos))
});
@codeend

## Passing Deferreds

If the second parameter you pass to `can.view` contains Deferreds, can.view will
instead return a Deferred that resolves to the documentFragment containing the
populated template after all the deferreds have resolved.

This aspect is most useful because [Model] methods like `findAll` return a
Deferred. This allows you to load a template, retrieve one or more Models, and
then render the resulting documentFragment after everything has been loaded:

@codestart
can.view('todos.ejs', {
	todos: Todo.findAll().
	user: User.findOne({id: 5})
}).then(function(fragment) {
	document.getElementById('todos').appendChild(fragment);
});
@codeend

## Rendering to string

To render to a string instead of a documentFragment, use `can.view.render`. This
is mainly used to nest templates inside of other templates:

@codestart
<% can.each(todos, function(todo, key) { %>
	&lt;li><%== can.view.render('todos.ejs', todo); %>&lt;/li>
<% }) %>
@codeend
