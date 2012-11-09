@class can.Mustache
@parent canjs
@test can/view/mustache/test/qunit.html

can.Mustache provides logic-less templates with live binding when used with [can.Observes](#can_observe).

can.Mustache is designed to help seperate logic out of your view code without
sacrifices.

Mustache and Handlebar templates are compatible with can.Mustache, 
so you can import existing templates and automagically start live-binding.

## Demos

 - [TodoMVC](http://addyosmani.github.com/todomvc/labs/architecture-examples/canjs/) is a project which offers the same Todo application implemented using MV* concepts in most of the popular JavaScript MV* frameworks of today.

## Getting Started

Mustache templates looks similar to normal HTML except
they contain contain keys for inserting data into the template
and sections to enumerate and/or filter the enclosed template blocks.

For example, the following renders a welcome header for
a user and displays the number of messages.

__Mustache Template__

	<script id="template" type="text/mustache">
		<h1>Welcome {{user}}!</h1>
		<p>
			{{#if messages}}
				You have {{messages}} new messages.
			{{else}}
				You no messages.
			{{/if}}
		</p>
	</script>

The Mustache sytax is the `{{  }}` magic tags above.

__JavaScript__

	var data = new can.Observe({
		user: 'Tina Fey',
		messages: 0
	});

	var template = can.view("#template", data)

	can.$(document.body).append(template);

it will render:

	<h1>Welcome Tina Fey!</h1>
	<p>You no messages.</p>

Now if you want to use live-binding to update your template, you can do:

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

	{{{friend}}}

it would return:

	<strong>Justin</strong>

## Paths and Context

When Mustache is resolving a object in a section, it sets the current
context to the value for which its iterating. For example:

	{
		friends: [ 'Austin' ]
	}

	{{#friends}}
		{{.}}
	{{/friends}}

The `.` would represent the 'Austin' value in the array.

Internally, Mustache keeps a stack of contexts as the template dives
deeper into nested sections and helpers.  If a key is not found within 
the current context, Mustache will look for the key in the parent context
and so on until it resolves the object or reaches the parent most object.  
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
it jumps up to the family object and resolves sisters there.

## Template Acquisition

There are number of ways you can acquire templates such as: raw text,
URL, or script tags in the markup.

__Raw Text__

You can process plain text by passing an object with a `text`
attribute containing your template and it will return a document fragment back.

	var template = "My body lies over the {{.}}";
	var fragment = new can.Mustache({ text: template })
					.render('water');
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

	var template = can.view('//lib/views/mytemplate.mustache', 
					dataToPass)
	can.$(document.body).append(template);

Since this makes XHR requests, in a big application with lots of views
this could be a performance concern.  You should create a build step to 
concatenate and include all of the views in one file for high performance production
instances.  If you are using Steal, it will do this automatically at build 
for you.

__Registering Partials__

You can call `can.view.registerView` to register
a partial template you can call from inside another Mustache template.

	can.view.registerView('myTemplate', "My body lies over {{.}}")

Then later in my view I can do:

	{{>myTemplate}}

and it will apply the current context to my new template.  For more
information goto the Partials section.

## Sections

Sections contain text blocks and evaluate whether to render it or not.  If
the object evaluates to an array it will iterate over it and render the block
for each item in the array.  here are four different types of sections.

### Falseys or Empty Arrays

If the value returns a `false`, `undefined`, `null`, `""` or `[]` we consider
that a *falsey* value.

If the value is falsey, the section will **NOT** render the block.

	{ 
		friends: false
	}

	{{#friends}}
		Never shown!
	{{/friends}}


### Arrays

If the value is a non-empty array, sections will iterate over the 
array of items, rendering the items in the block.

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

	<h1>My friend is {{!Brian}}</h1>

Will render:

	<h1>My friend is </h1>


## Partials

Partials are templates embedded in other templates which execute at runtime.  
Partials begin with a greater than sign, like `{{>my_partial}}`.  

Partials are rendered at runtime, so recursive partials are possible but make sure you avoid infinite loops. They also inherit the calling context.

For example, this template and partial:

__base.mustache__

	<h2>Names</h2>
	{{#names}}
		{{>user}}
	{{/names}}

__user.mustache__

	<strong>{{name}}</strong>

The resulting expanded template at render time would look like:

	<h2>Names</h2>
	{{#names}}
		<strong>{{name}}</strong>
	{{/names}}

See the template acquisition section for more information on
fetching partials.

## Helpers

Helpers allow you to register functions that can be called 
from any context in a template. 

Mustache includes a number of built-in helpers that are listed below
but you can register your own helper too.

### if

In addition to truthy/falsey evaluation with sections, you can use an 
explicit `if` condition to render a block.

	{
		friends: true
	}

	{{#if friends}}
		I have friends!
	{{/if}}

would render:

	I have friends!
	
`if` acts similarly to a truthy `{{#section}}`.

### else

When using `if` or a custom helper, you can specify the inverse
of the evaluation by using the `else` helper.

	{
		friend: false
	}

	<ul>
		{{#if friends}}
			</li>{{name}}</li>
		{{else}}
			<li>No friends.</li>
		{{/if}}
	</ul>

would render:

	<ul>
		<li>No friends.</li>
	</ul>

`else` acts similarly to a falsey `{{^inverse}}`, but only applies when used within another helper.

In this case, using the `if`/`else` helpers simplify your template by not requiring extra sections to be specified.

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
	
`unless` acts similarly to a falsey `{{^inverse}}`.

### each

You can use the `each` helper to iterate over an array of items and
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
			<li>{{name}}</li>
		{{/each}}
	</ul>

which would render:

	<ul>
		<li>Austin</li>
		<li>Justin</li>
	</ul>

### with

Mustache typically applies the context passed in the section at runtime.  However,
you can override this context by using the `with` helper.

For example, using the `with` helper I shift the context to the friends object.

	{
		name: "Austin"
		friends: 1
	}


	<h1>Hi {{name}}</h1>
	{{#with friends}}
		<p>You have {{.}} new friend!</p>
	{{/with}}

would render:

	<h1>Hi Austin</h1>
	<p>You have 1 new friend!</p>

### Element Callbacks

When rendering HTML with views, you often want to call some JavaScript
such as intializing a jQuery plugin on the new HTML.

Mustache makes it easy to define this code in the markup.  Using the
[ES5 Arrow Syntax](http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax) 
we define the element we are going to pass followed by the arrow
and the function we want to execute on the element.

	<div class="tabs" {{(el) -> el.jquery_tabs()}}></div>

After rendering the HTML, `jquery_tabs` will be called on the tabs div.

### Data Associations

You can attach data to an element easily by calling the `data` helper.
Call `data` followed by the attribute name you want to attach it as.

	{
		name: 'Austin'
	}

	<ul>
		<li id="foo" {{data 'person'}}>{{name}}</li>
	</ul>

Now I can access my object by doing:

	var nameObject = can.$('#foo').data('person');

It automatically attaches the data to the
element using [can.data] and the implied context of `this`.

### Registering Helpers

You can register your own helper with the `Mustache.registerHelper` method.

Localization is a good example of a custom helper you might implement
in your application. The below example takes a given key and 
returns the localized value using 
[jQuery Globalize](https://github.com/jquery/globalize).

	Mustache.registerHelper('l10n', function(str, options){
		return Globalize != undefined 
			? Globalize.localize(str) 
			: str;
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

If you want to use a helper with a section, you need to call 
`options.fn(context)` in your return statement. This will return a 
string with the resulting evaluated section.

Similarly, you can call `options.inverse(context)` to evaluate the 
template between an `{{else}}` magic tag and the closing magic tag.

For example, when a route matches the string passed to our
routing helper it will show/hide the text.

	Mustache.registerHelper('routing', function(str, options){
		if (can.route.attr('filter') === str)
			return options.fn(this);
		}
	});

	{{#routing 'advanced'}}
		You have applied the advanced filter.
	{{/routing}}
	
__Advanced Helpers__

Helpers can be passed normal objects, native objects like numbers and strings, as well as a hash object. The hash object will be an object literal containing all ending arguments using the `key=value` syntax. The hash object will be provided to the helper as `options.hash`. Additionally, when using sections with the helper, you can set a custom context by passing the object instead of `this`.

	Mustache.registerHelper('exercise', function(group, action, 
											num, options){
		if (group && group.length > 0 && action && num > 0) {
			return options.fn({
				group: group,
				action: action,
				where: options.hash.where,
				when: options.hash.when,
				num: num
			});
		}
		else {
			return options.inverse(this);
		}
	});

	{{#exercise pets 'walked' 3 where='around the block' when=time}}
		Along with the {{#group}}{{.}}, {{/group}}
		we {{action}} {{where}} {{num}} times {{when}}.
	{{else}}
		We were lazy today.
	{{/exercise}}
	
	{
		pets: ['cat', 'dog', 'parrot'],
		time: 'this morning'
	}
	
This would output:

	Along with the cat, dog, parrot, we walked around the block 
	3 times this morning.
	
Whereas, an empty data object would output:

	We were lazy today.

## Live binding

Live binding is templates that update themselves as the data 
used in the magic tags change.

It's very common as the page is interacted with that the underlying 
data represented in the page changes.  Typically, you have callbacks 
in your AJAX methods or events and then update the content of your 
controls manually.

In the first example of the documentation, we have a 
simple user welcome screen.  In this example, we create a `can.Observe`
object and pass it into the template.

	<h1>Welcome {{user}}!</h1>
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
