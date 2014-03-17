@function can.stache
@parent canjs
@release 2.1
@group can.stache.pages 0 Pages
@group can.stache.types 1 Types
@group can.stache.tags 2 Basic Tags
@group can.stache.htags 3 Helper Tags
@group can.stache.static 4 Methods
@link ../docco/stache.html docco
@test can/view/stache/test/test.html
@plugin can/view/stache
@download http://canjs.us/release/latest/can.stache.js


@description Logic-less Handlebar and Mustache templates with live binding.

@signature `can.stache(template)`

Processes the template and returns a [can.view.renderer] function that renders the template
with data and local helpers.

@param {String} template The text of a mustache template.

@return {can.view.renderer} A renderer function that returns a live document fragment
that can be inserted in the page.

@body

## Use

[Mustache](https://github.com/janl/mustache.js/) and [Handlebar](http://handlebarsjs.com/) 
templates are compatible with can.stache.

Stache templates looks similar to normal HTML except
they contain keys for inserting data into the template
and [can.stache.Sections sections] to enumerate and/or filter the enclosed template blocks.

For example, the following renders a welcome header for
a user and displays the number of messages.

__Stache Template__

	<script id="template" type="text/stache">
		<h1>Welcome {{user}}!</h1>
		<p>You have {{messages}} messages.</p>
	</script>

__JavaScript__

	var data = new can.Map({
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

This updates this paragraph in the HTML Result to:

	<p>You have 5 messages.</p>



can.stache provides significantly more functionality such as:

- [can.stache.Basics Context and Path Basics]
- [can.stache.Sections Sections]
- [can.stache.helpers.partial Partials]
- [can.stache.Acquisition Acquiring Templates]
- [can.stache.Helpers Helpers]
- [can.stache.Binding Live Binding]


## Deferrences from can.Mustache

`can.stache` is largely compatable with [can.Mustache].  There are two main differences:

 - [can.stache.sectionRenderer section renderers] return documentFragments.
 - [can.Mustache.helpers.elementCallback Element callbacks] like `{{(el) -> CODE}}` are no longer supported.
 
### Section renderers return documentFragments

A [can.Mustache.sectionRenderer Mustache section renderer] called 
like `options.fn()` or `options.inverse()` would always return a String. For example,
the following would wrap the `.fn` section in an `<h1>` tag:

    can.Mustache.registerHelper("wrapH1", function(options.fn()){
       return "<h1>"+options.fn()+"</h1>";
    });
    
    var template = can.view.mustache("{{#wrapH1}}Hi There!{{/#wrapH1}}");
    template() //-> <h1>Hi There</h1>

`can.stache`s [can.stache.sectionRenderer section renderers] return documentFragments when sections
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

`can.Mustache` supported [can.Mustache.helpers.elementCallback element callbacks] like `{{(el) -> CODE}}`. These
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

## Tags

@api can.stache.tags