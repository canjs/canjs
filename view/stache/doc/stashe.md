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

@param {String} template The text of a mustache template.

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

## Differences from can.mustache

`can.stache` is largely compatable with [can.mustache].  There are three main differences:

 - Passes values in the scope to [can.Component] with `{key}`.
 - [can.stache.sectionRenderer section renderers] return documentFragments.
 - [can.mustache.helpers.elementCallback Element callbacks] like `{{(el) -> CODE}}` are no longer supported.


### Passing values in the scope to can.Components

A [can.mustache] template passes values from the scope to a [can.Component]
by specifying the key of the value in the attribute directly.  For example:

    can.Component.extend({
      tag: "my-tag",
      template: "<h1>{{greeting}}</h1>"
    });
    var template = can.mustache("<my-tag greeting='message'></my-tag>");

    var frag = template({
      message: "Hi"
    });

    frag //-> <my-tag greeting='message'><h1>Hi</h1></my-tag>

With stache, you wrap the key with `{}`. For example:

    can.Component.extend({
      tag: "my-tag",
      template: "<h1>{{greeting}}</h1>"
    });
    var template = can.stache("<my-tag greeting='{message}'></my-tag>");

    var frag = template({
      message: "Hi"
    });

    frag //-> <my-tag greeting='{message}'><h1>Hi</h1></my-tag>

If the key was not wrapped, the template would render:

    frag //-> <my-tag greeting='message'><h1>message</h1></my-tag>

Because the attribute value would be passed as the value of `greeting`.

### Section renderers return documentFragments

A [can.mustache.sectionRenderer Mustache section renderer] called
like `options.fn()` or `options.inverse()` would always return a String. For example,
the following would wrap the `.fn` section in an `<h1>` tag:

    can.mustache.registerHelper("wrapH1", function(options.fn()){
       return "<h1>"+options.fn()+"</h1>";
    });

    var template = can.mustache("{{#wrapH1}}Hi There!{{/#wrapH1}}");
    template() //-> <h1>Hi There</h1>

`can.stache`'s [can.stache.sectionRenderer section renderers] return documentFragments when sections
are not contained within an html element. This means the result of the previous helper would be:

    <h1>[object DocumentFragment]</h1>

Instead, helper functions should manipulate the document fragment into the desired response.  With
jQuery, this can be done like:

    can.stache.registerHelper("wrapH1", function(options.fn()){
       return $("<h1>").append( options.fn() );
    });

    var template = can.stache("{{#wrapH1}}Hi There!{{/#wrapH1}}");
    template() //-> <h1>Hi There</h1>


### Element callbacks are no longer supported

`can.mustache` supported [can.mustache.helpers.elementCallback element callbacks] like `{{(el) -> CODE}}`. These
are not supported in `can.stache`.  Instead, create a helper that returns a function or register
a [can.view.attr custom attribute].

    can.stache.registerHelper("elementCallback", function(){
      return function(el){
        CODE
      }
    });

    can.view.tag("element-callback", function(el){
      CODE
    })

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
