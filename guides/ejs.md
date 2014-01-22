@page EJS EJS
@parent Tutorial 4

@body
[EJS](../docs/can.EJS.html) is CanJS's default template language, which provides live
binding when used with Observes. EJS is very easy to use; you write the HTML you
want to be in the template, along with a few magic tags where you want dynamic
behavior.

Here's an example of a template that might render a list of Todos:

@codestart
&lt;script type="text/ejs" id="todoList">
<% for(var i = 0; i < todos.length; ++i) { %>
	&lt;li><%= todos[i].attr('description') &lt;/li>
<% } %>
&lt;/script>
@codeend

And you can use `can.view` to render the template:

@codestart
Todo.findAll({}, function(todos) {
	document.getElementById('list').appendChild(can.view('todoList', todos));
});
@codeend

As you can see from the template and the call to `can.view`, the `todos`
object becomes `this` inside the template. EJS can also access the properties
of the `this` object without having to prefix it with `this.`:

@codestart
&lt;script type="text/ejs" id="todosAndUser">
&lt;h2> <%= user.attr('name') %>&lt;/h2>
<% for(var i = 0; i < todos.length; ++i) { %>
	&lt;li><%= todos[i].attr('description') &lt;/li>
<% } %>
&lt;/script>
@codeend

Which can be inserted in the document with:

@codestart
can.view('todosAndUser', {
	todos: Todo.findAll(),
	user: User.findOne({id: 5})
}).then(function(frag) {
	document.getElementById('todos').appendChild(fragment);
});
@codeend

## Magic tags

There are five kinds of magic tags used in EJS:

`<% %>` will run any JavaScript code inside of it. This tag doesn't modify or
populate the template, but allows you to use for loops, if/else statements, 
switch statements, and variable declarations inside the EJS template. Because
almost any JavaScript code is valid in `<% %>`, EJS is incredibly powerful.

Due to constraints necessary for live binding to function, it is heavily
encouraged to only have one line of JS code per pair of EJS tags in order to
ensure that the correct scope is maintained.

@codestart
<% if(todos.attr('length') > 0) { %>
	&lt;div>You have no to-dos.&lt;/div>
<% } else { %>
	&lt;ul>
		<% todos.each(function(todo) { %>
		&lt;li><%= todo.attr('description') %>&lt;/li>
		<% }); %>
	&lt;/ul>
<% } %>
@codeend

`<%= %>` will evaluate a JavaScript statement and write the HTML-escaped result
into the populated template. For example, an EJS template like this:

@codestart
&lt;div>My favorite element is <%= '&lt;b>blink&lt;/b>' %>.&lt;/div>
@codeend

will result in HTML like this:

@codestart
&lt;div>My favorite element is &amp;lt;b&amp;gt;blink&amp;lt;/b&amp;gt;.&lt;/div>
@codeend

This is almost always the tag you want to use when writing values to your
template, because it protects you against [cross-site scripting attacks](http://en.wikipedia.org/wiki/Cross-site_scripting).

`<%== %>` will evaluate a JavaScript statement and write the raw result into the
populated template. This is like `<%= %>` but without escaping the result first.
For example, an EJS template like this:

@codestart
&lt;div>My favorite element is <%== '&lt;b>blink&lt;/b>' %>.&lt;/div>
@codeend

will result in HTML like this:

@codestart
&lt;div>My favorite element is &lt;b>blink&lt;/b>.&lt;/div>
@codeend

The most common use of `<%== %>` is to include templates in other templates:

@codestart
<% todos.each(function(todo) { %>
	&lt;li><%== can.view.render('todoEJS', todo); %>&lt;/li>
<% }); %>
@codeend

The other two magic tags are less commonly used and can be found in the
[documentation for EJS](../docs/can.EJS.html).

## Live binding

Live binding will automatically update your EJS templates in the DOM whenever
the data they are populated with changes. To do this, populate your templates
with Observes and use `attr` to read properties. In this template, using
`attr` sets up live binding on the `description` property of `todo`:

@codestart
&lt;li><%= todo.attr('description') %>&lt;/li>
@codeend

If you change the Todo's description, the template's output will automatically
update:

@codestart
todo.attr('description', 'Clean up the bathroom.');
@codeend

Live binding works by wrapping the code inside the magic tags with a function
to call when the attributes inside the magic tags change. This means that a
template like this will not work:

@codestart
<% for(var i = 0; i < todos.length; ++i) { %>
	&lt;li><%= todos[i].attr('name') %>&lt;/li>
<% } %>
@codeend

This will not work because when the function wrapping `todos[i].attr('name')` is
called, `i` will still be _3_ (as that is what `i` is set to after the loop is
run). You can fix this by using a closure and the `each` method of Observes:

@codestart
<% todos.each(function() { %>
	&lt;li><%= todo.attr('name') %>&lt;/li>
<% }); %>
@codeend

`each` will also watch the length of the list it is passed, so elements are
added or removed from it, it will update the output of the template.

## Element callbacks

If the code inside `<%= %>` or `<%== %>` evaluates to a function, the function
will be called back with the element it's inside as its first argument. This is
useful to initialize functionality on an element within the template, like
starting an element hidden:

@codestart
&lt;img src="surprise.gif" <%= function(element) { element.style.display = 'none'; } %>/>
@codeend

This is so common that EJS also supports [ECMAScript 5 arrow functions](http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax)
that get passed a library-wrapped NodeList containing the element. Because we
are using jQuery, the example above can be more simply written like this:

@codestart
&lt;img src="surprise.gif" <%= (el) -> el.hide() %>/>
@codeend

You can use this functionality to easily attach data to an element. A common
reason to do this is to attach a Model to the element that represents it:

@codestart
<% todos.each(function(todo) { %>
&lt;li <%= (el) -> can.data(el, 'todo', todo) %>>
	<%= todo.attr('description') %>
&lt;/li>
<% }) %>
@codeend