@function can.stache
@parent canjs
@release 2.1
@group can.stache.pages 0 Pages
@group can.stache.static 1 Methods
@group can.stache.types 2 Types
@group can.stache.tags 3 Basic Tags
@group can.stache.htags 4 Helper Tags
@group can.stache.plugins 5 Plugins


@link ../docco/view/stache/mustache_core.html docco
@test can/view/stache/test/test.html
@plugin can/view/stache
@download http://canjs.us/release/latest/can.stache.js


@description Live binding Mustache and Handlebars-comptable templates.

@signature `can.stache(template)`

Processes the template and returns a [can.view.renderer] function that renders the template
with data and local helpers.

@param {String} template The text of a stache template.

@return {can.view.renderer} A renderer function that returns a live document fragment
that can be inserted in the page.

@body

## Use

Stache templates are a [mustache](https://mustache.github.io/mustache.5.html) and [handlebars](http://handlebarsjs.com/) compatable
syntax.  They are used to:

- Convert data into HTML.
- Update the HTML when observable data changes.
- Provide custom elements and bindings.

The following
creates a stache template, renders it with data, and inserts
the result into the page:

```
// renderer is a "renderer function"
var renderer = can.stache("<h1>Hello {{subject}}</h1>");

// "renderer functions" render a template and return a
// document fragment.
var fragment = renderer({subject: "World"})

// A document fragment is a collection of elements that can be
// used with jQuery or with normal DOM methods.
fragment //-> <h1>Hello World</h1>
document.body.appendChild(fragment)
```

Render a template with observable data like [can.Map]s or [can.List]s and the HTML will update
when the observable data changes.

```
var renderer = can.stache("<h1>Hello {{subject}}</h1>");
var map = new can.Map({subject: "World"});
var fragment = renderer(map)
document.body.appendChild(fragment)

map.attr("subject","Earth");

document.body.innerHTML //-> <h1>Hello Earth</h1>
```

There's a whole lot of behavior that `can.stache` provides.  The following walks through
the most important stuff:

- [can.stache.magicTagTypes] - The different tag types like `{{key}}` and `{{#key}}...{{/key}}`
- [can.stache.scopeAndContext] - How key values are looked up.
- [can.stache.expressions] - Supported expression types like `{{helper arg}}` and `{{method(arg)}}`
- [can.stache.Acquisition] - How to load templates into your application.
- [can.stache.Helpers] - The built in helpers and how to create your own.
- [can.stache.Binding] - How live binding works.

## Working with Promises

Promises passed into a template have the following attributes that are observable:

- isPending
- isResolved
- isRejected
- value - the resolved value of the promise, only available if `isResolved` is true
- reason - the rejected value, only available if `isRejected` is true
- state - "pending", "resolved", or "rejected"

Stache Template

```
<script id="template" type="text/stache">
	{{#if items.isPending}}
		<img src="loading.png"/>
	{{/if}}

	{{#if items.isResolved}}
		{{#each items.value}}
			<h2>{{name}}</h2>
		{{/each}}
	{{/if}}

	{{#if items.isRejected}}
		<img src="error.png"/>
	{{/if}}
</script>
```

JavaScript

```
var promise = $.get('/items');
var template = can.view('template', { items: promise });
```

## Tags

@api can.stache.tags
