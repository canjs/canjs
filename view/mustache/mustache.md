@class can.Mustache
@parent canjs

can.Mustache provides logic-less templates with live binding.

Mustache and Handlebar templates are compatible with can.Mustache, 
so you can import existing templates and automagically start live-binding.

## Getting Started

Mustache templates looks similar to normal HTML except
they contain tokens for inserting and performing actions.

Take for example the following, it renders a welcome header for
a user and displays the number of messages.

__Mustache Template__

	<script id="template" type="text/mustache">
		<h1>Welcome {{ user }}!</h1>
		<p>
			{{#if messages}}
				You have {{messages}} new messages.
			{{else}}
				You no messages.
			{{/messages}}
		</p>
	</script>

The Mustache sytax is the `{{  }}` tokens above.

__JavaScript__

	var data = new can.Observe({
		user: 'Tina Fey',
		messages: 0
	});

	var template = can.view("#template", data)

	can.$(document.body).append(template);

After you insert it, it will render:

	<h1>Welcome Tina Fey!</h1>
	<p>You no messages.</p>

Now if you want to use the power of live-binding
to update your template, you can do:

	data.attr('message', 5)

which will re-render the paragraph tag to say:

	<p>You have 5 new messages.</p>

## Escaping Values

Mustache will escape values enclosed in a `{{  }}` expression.  If you would
like Mustache to return the value without escaping, use the `{{{  }}}` expression.

For example, the follow double expression.
	
	{
		friend: "<strong>Justin</strong>"
	}

	{{friend}}

would return:

	&lt;strong&gt;Justin&lt;/strong&gt;

whereas if the template was:

	{{{ friend }}}

it would return:

	<strong>Justin</strong>

## Paths and Context

When using Mustache, the context will shift as you enter sections.  
Once inside a section, it will reset the current context to the value for 
which its iterating.

For example:

	{
		friends: [ 'Austin' ]
	}

	{{#friends}}
		{{.}}
	{{/friends}}

The `.` would represent the 'Austin' attribute on the 
object in the array.

Additionally, you can use the `this` as a shorthand. So given
the same friends object from above I could do:

	{{#friends}}
		{{this}}
	{{/friends}}

Mustache also implements a system for which if it 
doesn't find a match to an object that you are referencing in
the current context it can hop up into the parent context.

For example:
	
	{
		family: [
			{
				name: 'Austin',
				sisters: [
					{
						name: 'Katherine'
					}
				],
				brothers: [
					{
						name: 'Justin'
					}
				]
			}
		]
	}

	{{#family}
		{{#brothers}}
			{{#sisters}}
				{{name}}
			{{/sisters}}
		{{/brothers}}
	{{/family}}

Since `sisters` isn't in the context of the brothers array,
it hops up to the parent object's context.  It will continue to
hop up the stack of contexts until it finds a match.

## Template Acquisition

There are number of ways you can acquire templates such as: raw text,
URL, or script tags in the markup.

__Raw Text__

You can process plain text by passing an object with a `text`
attribute containing your template and it will return a document fragment back.

	var template = "My body lies over the {{.}}";
	var fragment = new can.Mustache({ text: template }).render('water');
	can.append(can.$(document.body), can.view.frag(fragment));

__Script Tags__

You can place your templates in your HTML document.
Set the `type` to `text/mustache` and the `id` as a unique
key Mustache will use to look it up.

	<script id="mytemplate" type="text/mustache">
		My body lies over the {{.}}
	</script>

	var template = can.view("#mytemplate", 'water');
	can.$(document.body).append(template);

__URL__

You can define templates in their own files and have Mustache fetch the 
files on demand.  This is the preferred way since it will keep your application
nicely organized seperating views from logic code. 

	var template = can.view('//lib/views/mytemplate.mustache',  dataToPass)
	can.$(document.body).append(template);

Since this makes XHR requests, in a big application with lots of views
this could be a performance concern.  You should create a build step to 
concatenate and include all of the views in one file for high performance production
instances.  If you are using Steal, it will do this automatically at build 
for you.

__Registering Partials__

You can call `can.Mustache.registerPartial` to register
a partial template you can call from inside another Mustache template.

	can.view.registerView('myTemplate', "My body lies over {{.}}")

Then later in my view I can do:

	{{>myTemplate}}

and it will apply the current context to my new template.  For more
information goto the Partials section.

## Sections

Sections are the army-knife of Mustache templates.  They will evaluate the token
given the current context and render the block.  

Once inside a section, it will reset the current context to the value for which it's iterating.

This is useful for iterating over an array or just evaluating an object's boolean equivalent.

### Falseys or Empty Arrays

If the value returns a `false`, `undefined`, `null`, `""` or `[]` we consider
that a *falsey* value.

If the value is falsey, the section will **NOT** render the block
between the pound and slash.

	{ 
		friends: false
	}

	{{#friends}}
		Never shown!
	{{/friends}}


### Arrays

If the value is a non-empty array, sections will iterate over the 
array of items, rendering the items in the block between the pound and slash.

For example, if I have a list of friends, I can iterate
over each of those items within a section.

	{ 
		friends: [ 
			{ name: "Austin" }, 
			{ name: "Justin" } 
		] 
	}

	<ul>
		{{#friends}}
			<li>{{name}}</li>
		{{/friends}}
	</ul>

which would render:

	<ul>
		<li>Austin</li>
		<li>Justin</li>
	</ul>

Reminder: It will reset the current context to the value for which its iterating.
See the context section for more information.

### Truthys

When the value is non-falsey object but not a list, it is considered truthy and will be used 
as the context for a single rendering of the block.

	{
		friends: { name: "Jon" }
	}

	{{#friends}}
		Hi {{name}}
	{{/friends}}

would render:

	Hi Jon!

### Inverted

Inverted sections match falsey values. An inverted section 
syntax is similar to regular sections except it begins with a caret rather than a pound. If the value referenced is falsey, the section will render.

	{
		friends: []
	}

	<ul>
		{{#friends}}
			</li>{{name}}</li>
		{{/friends}}
		{{^friends}}
			<li>No friends.</li>
		{{/friends}}
	</ul>

would render:

	<ul>
		<li>No friends.</li>
	</ul>

## Comments

Comments, which do not appear in template output, begin a bang (!).

	<h1>My friend is {{! Brian }}</h1>

Will render:

	<h1>My friend is </h1>


## Partials

Partials are templates embedded in other templates which execute at runtime.  
Partials begin with a greater than sign, like `{{> my_partial}}`.  

Partials are rendered at runtime, so recursive partials are possible. 
Just avoid infinite loops.  They also inherit the calling context.

For example, this template and partial:

__base.mustache__

	<h2>Names</h2>
	{{#names}}
		{{>user}}
	{{/names}}

__user.mustache__

	<strong>{{name}}</strong>

Can be thought of as a single, expanded template at render time 
which would look like:

	<h2>Names</h2>
	{{#names}}
		<strong>{{name}}</strong>
	{{/names}}

See the template acquisition section for more information on
fetching partials.

## Helpers

Helpers allow you to register functions that can be called 
from any context in a template. 

We have a number of built-in helpers that are listed below
but you can register your own helper too.

### if

In addition to section falsey evaluation, you can use an 
explicit `if` condition to render a block.

	{
		friends: true
	}

	{{#if friends}}
		I have friends!
	{{/if}}

would render:

	I have friends!

### else

When using an `if` or custom helper, you can specify the inverse
of the evaluation by using the `else` helper.

	{
		friends: []
	}

	<ul>
		{{#friends}}
			</li>{{name}}</li>
		{{else}}
			<li>No friends.</li>
		{{/friends}}
	</ul>

would render:

	<ul>
		<li>No friends.</li>
	</ul>

This is helpful because basic Mustache would
require you to close the section and start a 
new section with the inverse operator.

### unless

The `unless` helper evaluates the inverse of the value of the key and renders 
the block between the helper and the slash.

	{
		friends: []
	}

	{{#unless friends}}
		You don't have any friends!
	{{/unless}}

would render:

	You don't have any friends!

### each

You can use the `each` helper to itterate over a array of items and
render the block between the helper and the slash.

Like sections, it will reset the current context to the value for which its iterating.
See the context section for more information.

	{ 
		friends: [ 
			{ name: "Austin" }, 
			{ name: "Justin" } 
		] 
	}

	<ul>
		{{#each friends}}
			<li>{name}</li>
		{{/each}}
	</ul>

which would render:

	<ul>
		<li>Austin</li>
		<li>Justin</li>
	</ul>

### with

Mustache typically applies the context passed in the section at compiled time.  However,
if you want to override this context you can use the `with` helper.

For example, using the `with` helper I shift the context to the friends object.

	{
		name: "Austin"
		friends: 1
	}


	<h1>Hi {{ name }}</h1>
	{{ #with friends }}
		<p>You have {{.}} new friend!</p>
	{{/with}}

would render:

	<h1>Hi Austin</h1>
	<p>You have 1 new friend!</p>

### plugin

When rendering HTML with views, you often want to call some JavaScript
such as intializing a jQuery plugin on the new HTML.

Mustache makes this easy to define this code in the mark-up.  Using the
arrow syntax we define the element we are going to pass followed by the arrow
and the function we want to execute on the element.

	<div class="tabs" {{ (el) -> el.jquery_tabs() }}></div>

After rendering the HTML, `jquery_tabs` will be called on the tabs div.

### data

You can attach data to a element easily by calling the `data` helper.
Call `data` followed by the attribute name you want to attach it as.

	{
		name: 'Austin'
	}

	<ul>
		<li id="foo" {{data 'name'}}>{{name}}</li>
	</ul>

Now I can access my object by doing:

	var nameObject = can.$('#foo').data('name');

It automatically attaches the data to the
element using [can.data] with implied context of `this`.

### Registering Helpers

You can register your own helper with the `registerHelper` method.

Localization is a good example of a custom helper you might implement
in your application. The below example takes a given key and 
returns the localized value using 
[jQuery Globalize](https://github.com/jquery/globalize).

	Mustache.registerHelper('l10n', function(str, options){
		return (Globalize != undefined ? Globalize.localize(str) : str);
	});

Now in my template, I invoke the helper by calling the helper
name followed by any arguments I'd like to pass.

	<span>{{l10n 'mystring'}}</span>

will render:

	<span>my string localized</span>

__Multiple Arguments__

You can pass multiple arguments just by putting a space between
that and the previous argument like so:

	{{helper 'cat' 'hat'}}

	Mustache.registerHelper('helper', function(arg1, arg2, options){
		// arg1 -> 'cat'
		// arg2 -> 'hat'
	});

__Evaluating Helpers__

If you want to use a helper with a section, when you register
the helper you need to call `options.fn(argsToEval)` in your
return statement. 

For example, when a route matches the string passed to our
routing helper it will show/hide the text.

	Mustache.registerHelper('routing', function(str, options){
		return options.fn(can.route.attr('filter') === str)
	});

	{{#routing 'advanced'}}
		You have applied the advanced filter.
	{{/routing}}

## Live binding

So what is live binding?  Live binding is templates
that update themselves as the data used in the tokens
change.

It's very common as the page is interacted with the underlying 
data represented in the page changes.  Typically, you have callbacks 
in your AJAX methods or events and you find the control and update it
manually.

In the first example of the documentation, we have a 
simple user welcome screen.  In this example, we create a `can.Observe`
object and pass it into the template.

	<h1>Welcome {{ user }}!</h1>
	<p>
		{{#if messages}}
			You have {{messages}} new messages.
		{{else}}
			You no messages.
		{{/messages}}
	</p>

	var data = new can.Observe({
		user: 'Tina Fey',
		messages: 0
	});

	var template = can.view("#template", data);

The template evaluates the `messages` variable as if
it were a regular object we created.  Since we have 
no message it will render:

	<h1>Welcome Tina Fey!</h1>
	<p>You no messages.</p>

Now say we have a request that updates
the `messages` attribute to have `5` messages.  We 
call the `.attr` method on the `can.Observe` to update
the attribute to the new value.

	data.attr('message', 5)

After `can.Observe` recieves this update, it will
update the paragraph tag to reflect the new value.

	<p>You have 5 new message.</p>

For more information visit the [can.Observe].
