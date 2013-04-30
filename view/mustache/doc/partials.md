@page can.Mustache.Partials Partials
@parent can.Mustache 2

@body
Partials are templates embedded in other templates.  Partials begin with a greater than sign, like `{{>my_partial}}`.  Partials inherit the calling context.  

Partials render at runtime, so recursive partials are possible but make sure you avoid infinite loops.

For example, this template and partial:

__base.mustache__

@codestart
&lt;h2>Names&lt;/h2>
{{#names}}
	{{>user.mustache}}
{{/names}}
@codeend

__user.mustache__

@codestart
&lt;strong>{{name}}&lt;/strong>
@codeend

The resulting expanded template at render time would look like:

@codestart
&lt;h2>Names&lt;/h2>
{{#names}}
	&lt;strong>{{name}}&lt;/strong>
{{/names}}
@codeend

## Acquiring Partials

__Referencing Files__

Partials can reference a file path and file name in the template.

The following template uses a relative path (relative to the current page):

@codestart
&lt;script id="template" type="text/mustache">
	{{>views/test_template.mustache}}
&lt;/script>
@codeend

The following template uses an absolute path (rooted to steal's root directory):

@codestart
&lt;script id="template" type="text/mustache">
	{{>//myapp/accordion/views/test_template.mustache}}
&lt;/script>
@codeend

__Referencing by ID__

Partials can reference templates that exist in script tags on the page by 
referencing the `id` of the partial in the template.  For example:

@codestart
&lt;script id="mytemplate" type="text/mustache">
	{{>mypartial}}
&lt;/script>
@codeend

@codestart
&lt;script id="mypartial" type="text/mustache">
   	I am a partial.
&lt;/script>
@codeend

@codestart
var template = can.view("#mytemplate", {});
@codeend

__Manually Registering__

Partials can be manually registered by calling `can.view.registerView` 
and passing an identifier and content.  For example:

@codestart
can.view.registerView('myTemplate', "My body lies over {{.}}")
@codeend

in the template, you reference the template by the identifer you registered:

@codestart
{{>myTemplate}}
@codeend

resulting in the template rendering with the current context applied to the partial.

## Passing Partials in Options

Partials can resolve the context object that contain partial identifiers in them.
For example:

@codestart
var template = can.view("#template", { 
	items: []
	itemsTemplate: "test_template.mustache" 
});
@codeend

@codestart
can.$(document.body).append(template);
@codeend

then reference the partial in the template just like:

@codestart
&lt;ul>
{{#items}}
	&lt;li>{{>itemsTemplate}}&lt;/li>
{{/items}}
&lt;/ul>
@codeend
