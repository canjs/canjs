@constructor can.Mustache
@parent canjs
@group can.Mustache.pages Pages
@group can.Mustache.tags Tags
@group can.Mustache.types Types

@test can/view/mustache/test/test.html
@plugin can/view/mustache
@download http://canjs.us/release/latest/can.view.mustache.js

@description Logic-less [http://mustache.github.io/ mustache] templates with live binding 
when used with [can.Observes](#can_observe).

@signature `new can.Mustache(options)`

Creates an instance of a mustache template. This is typically not used directly in 
favor of [can.view] or [can.view.mustache].

@param {{}} options An options object with the following properties:

@option {String} text The text of the mustache template.
@option {String} [name] The name of the template used to identify it to
debugging tools.

@body

## Use

[Mustache](https://github.com/janl/mustache.js/) and [Handlebar](http://handlebarsjs.com/) 
templates are compatible with can.Mustache.

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

__JavaScript__

	var data = new can.Observe({
		user: 'Tina Fey',
		messages: 0
	});

	var template = can.view("#template", data)
	document.body.appendChild(template);

__HTML Result__

	<h1>Welcome Tina Fey!</h1>
	<p>You have 0 messages.</p>

To update the html using live-binding, change an observable value:

	data.attr('message', 5)

This updates the text to say:

	<p>You have 5 messages.</p>



can.Mustache provides a lot more functionality such as:

- [Context and Path Basics](#Basics)
- [Sections](#Sections)
- [Partials](#Partials)
- [Acquiring Templates](#Acquisition)
- [Helpers](#Helpers)
- [Live Binding](#Binding)

## Tags

@api can.Mustache.tags