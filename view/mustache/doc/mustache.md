@constructor can.Mustache
@parent canjs
@group can.Mustache.pages Pages
@test view/mustache/test.html
@plugin can/view/mustache

can.Mustache provides logic-less templates with live binding 
when used with [can.Observes](#can_observe). It currently ships as a plugin,
and you can view the [annotated source](http://canjs.us/release/latest/docs/can.view.mustache.html).

[Mustache](https://github.com/janl/mustache.js/) and [Handlebar](http://handlebarsjs.com/) 
templates are compatible with can.Mustache, so you can import existing templates.

## Getting Started

Mustache templates looks similar to normal HTML except
they contain contain keys for inserting data into the template
and [sections](#Sections) to enumerate and/or filter the enclosed template blocks.

For example, the following renders a welcome header for
a user and displays the number of messages.

__Mustache Template__

	<script id="template" type="text/mustache">
		<h1>Welcome {{user}}!</h1>
		<p>You have {{messages}} messages.</p>
	</script>

The Mustache sytax is the `{{  }}` magic tags above.

__JavaScript__

	var data = new can.Observe({
		user: 'Tina Fey',
		messages: 0
	});

	var template = can.view("#template", data)
	can.$(document.body).append(template);

__HTML__

	<h1>Welcome Tina Fey!</h1>
	<p>You have 0 messages.</p>

To update your template using live-binding:

	data.attr('message', 5)

which will re-render the paragraph tag to say:

	<p>You have 5 messages.</p>

can.Mustache provides a lot more functionality such as:

- [Context and Path Basics](#Basics)
- [Sections](#Sections)
- [Partials](#Partials)
- [Acquiring Templates](#Acquisition)
- [Helpers](#Helpers)
- [Live Binding](#Binding)

## Demos

 - [TodoMVC](http://addyosmani.github.com/todomvc/architecture-examples/canjs/) is a project which offers the same Todo application implemented using MV* concepts in most of the popular JavaScript MV* frameworks of today. [Source Code](https://github.com/addyosmani/todomvc/tree/gh-pages/architecture-examples/canjs)
