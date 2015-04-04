@page Templates Templates
@parent Tutorial 3

@body

[can.view](../docs/can.view.html) loads and renders templates with the data
you provide, and returns a documentFragment with the populated template.
[Stache](../docs/can.stache.html) and [Mustache](../docs/can.mustache.html) allow you to live bind to Observes within templates. Live binding
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
```
<script type="text/mustache" id="todoList">
{{#each .}}
	<li>{{description}}</li>
{{/each}}
</script>
```

Then load the template using the script tag's ID and pass the template data:
```
Todo.findAll({}, function(todos) {
	$('#nav').html(can.view('todoList', todos))
});
```

Or you can load a template without registering it first (or including it on the
page) by giving the URL to `can.view`:

```
Todo.findAll({}, function(todos) {
	$('#nav').html(can.view('todos/todos.mustache', todos))
});
```

## Passing Deferreds

If the second parameter you pass to `can.view` contains Deferreds, can.view will
instead return a Deferred that resolves to the documentFragment containing the
populated template after all the deferreds have resolved.

This aspect is most useful because [Model] methods like `findAll` return a
Deferred. This allows you to load a template, retrieve one or more Models, and
then render the resulting documentFragment after everything has been loaded:

```
can.view('todos.ejs', {
	todos: Todo.findAll().
	user: User.findOne({id: 5})
}).then(function(fragment) {
	document.getElementById('todos').appendChild(fragment);
});
```

