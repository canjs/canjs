@class can.Mustache
@parent canjs

can.Mustache provides logic-less templates with live binding.

Mustache and Handlebar templates are compatible with can.Mustache, 
so you can import existing templates and automagically start live-binding.

## Getting Started

Mustache templates looks similar to normal HTML except
they contain tokens for inserting and performing actions.

Take for example the following, it renders a header welcoming
a user and displaying the number of messages.

#### Mustache Template

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

#### JavaScript

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

	<p>You have 5 new message.</p>

## Escaping Values

Mustache will escape values enclosed in a `{{  }}` expression.  If you would
like Mustache to return the value un-escape, use the `{{{  }}}` expression.

For example, the follow double expression.
	
	{
		friend: "<strong>Justin</strong>"
	}

	{{ friend }}

would return:

	&lt;strong&gt;Justin&lt;/strong&gt;

whereas if the template was:

	{{{ friend }}}

it would return:

	<strong>Justin</strong>

## Paths and Context

When using Mustache, the context can often shift as you enter sections.  
Once inside a section, it will reset the current context to the value for 
which its iterating.

For example:

	{
		friends: [ 'Austin' ]
	}

	{{ #friends }}
		{{ this }}
	{{/friends}}

The `this` would represent the 'Austin' attribute on the 
object in the array.

Additionally, you can use the `.` as a shorthand. So given
the same friends object from above I could do:

	{{ #friends }}
		{{ . }}
	{{/friends}}

Mustache also implements a system for which if it 
doesn't find a match to a value your referencing in
current context it can hop up into the parent section.

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
		{{ #brothers }}
			{{#sisters}}
				{{ name }}
			{{/sisters}}
		{{/brothers}}
	{{/family}}

Since `sisters` isn't in the context of the brothers array,
it hops up to the parent object's context.  It will continue to
hop up the stack of contexts until it finds a match.


## Sections

Sections are the army-knife of Mustache templates.  They will evaluate the token
given the current context and render the block.  

Once inside a section, it will reset the current context to the value for which its iterating.

This is useful for itterating over array or just evaluating objects true/false.

### Falsys or Empty Arrays

If the value returns a `false`, `undefined`, `null`, `""` or `[]` we consider
that a 'fasly' value.

If the value is a falsy, the section will NOT render the block
between the pound and slash.

	{ 
		friends: false
	}

	{{#friends}}
		Never shown!
	{{/friends}}


### Arrays

If the value is a non-empty array, sections will itterate over a 
array of items rendering the items in the block between the pound and slash.

For example, if I have a list of friends and I itterate
over each of the items with a section.

	{ 
		friends: [ 
			{ name: "Austin" }, 
			{ name: "Justin" } 
		] 
	}

	<ul>
		{{#friends}}
			<li>{name}</li>
		{{/friends}}
	</ul>

which would render:

	<ul>
		<li>Austin</li>
		<li>Justin</li>
	</ul>

Reminder: It will reset the current context to the value for which its iterating.
See the context section for more information.

### Non-Falsys

When the value is non-false object but not a list, it will be used 
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

Inverted sections do the inverse value of the key.  An inverted section 
syntax is similar to regular sections except it begins with a caret rather than a pound.

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

#### base.mustache

	<h2>Names</h2>
	{{#names}}
		{{>user}}
	{{/names}}

#### user.mustache

	<strong>{{name}}</strong>

Can be thought of as a single, expanded template at render time 
which would look like:

	<h2>Names</h2>
	{{#names}}
		<strong>{{name}}</strong>
	{{/names}}

## Helpers

Helpers allow you to register functions that can be called 
from any context in a template. 

We have a number of built-in helpers that are listed below
but you can register your own helper too.

### if

In addition to section falsy evaluation, you can use an 
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

When using a `if` or custom helper, you can specify the inverse
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
		<p>You have {{ this }} new friend!</p>
	{{/with}}

would render:

	<h1>Hi Austin</h1>
	<p>You have 1 new friend!</p>

### plugin

When rendering HTML with views, you often want to call some JavaScript
such as intializing a jQuery plugin on the new HTML.

Mustache makes this easy to define this code in the mark-up.

	<div class="tabs" {{ (el) -> el.jquery_tabs() }}></div>

After rendering the HTML, `jquery_tabs` will be called on the tabs div.

### data

You can hookup data to a element easily by calling the `data` helper,
just called `data` followed by the attribute name you want it to attach it as.

	{
		name: 'Austin'
	}

	<ul>
		<li id="foo" {{data 'name'}}>{{name}}</li>
	</ul>

Now I can access my object by doing:

	var nameObject = can.$('#foo').data('name');

It automatically attaches the data to the
element using `can.data` with implied context of `this`.

### Registering Helpers

You can register your own helper with the `registerHelper` method.

Localization is a good example of a custom helper you might implement
in your application. The below example takes a given text string and 
returns the localized value for the key using 
(jQuery Globalize)[https://github.com/jquery/globalize].

	Mustache.registerHelper('l10n', function(str){
		return (Globalize != undefined ? Globalize.localize(str) : str);
	});

Now in my template, I invoke the helper by pound followed by the helper
name and any arguments I'd like to pass.

	<span>{{ #l10n 'mystring' }}</span>

will render:

	<span>my string localized</span>

## Live binding

So what is live binding?  Live binding is templates
that update themselves as the data used in the tokens
change.

It's very common as the page is interacted with the underlying 
data represented in the page changes.  Typically, you have callbacks 
in your AJAX methods or events and you find the control and update it
manually.

Looking back at the first example of the documentation, we have a 
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

Now say we have a socket.io request that updates
the `messages` attribute to have `5` messages.  We 
call the `.attr` method on the `can.Observe` to update
the attribute to the new value.

	data.attr('message', 5)

After `can.Observe` recieves this update, it will
update the paragraph tag to reflect the new value.

	<p>You have 5 new message.</p>


