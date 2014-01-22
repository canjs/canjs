@page Routing Routing
@parent Tutorial 9

[can.route](../docs/can.route.html) is the core of CanJS's routing functionality. It is a special
Observe that updates `window.location.hash` when its properties change and
updates its properties when `window.location.hash` changes. You can give
`can.route` a template to translate URLs into property values, but if no route
is provided, it just serializes the route into standard URL-encoded notation.

Here is how you might use `can.route` without a template:

@codestart
// Before we start, empty the hash.
window.location.hash = '';

// This means that can.route is empty.
can.route.attr(); // {}

// Set the hash...
window.location.hash = '#!id=7';
// ...and can.route reflects that.
can.route.attr(); // {id: 7}

// Set the route...
can.route.attr({type: 'todos'}, true);
// ...and the hash reflects that.
window.location.hash; // #!type=todos

// Set a new property on the route...
can.route.attr('id', 6);
// ...and the has changes again to reflect multiple properties.
window.location.hash; // #!type=todos&id=6
@codeend

If you give `can.route` a template, you can make pretty URLs:

@codestart
// Give can.route a template.
can.route(':type/:id');

// If you set a hash that looks like the route...
window.location.hash = '#!todos/5';
// ... the route data changes accordingly.
can.route.attr(); // {type: 'todos', id: 5}

// If the route data is changed...
can.route.attr({type: 'users', id: 29});
// ...the hash is changed using the template.
window.location.hash; // '#!users/7'

// You can also supply defaults for routes.
can.route('', {type: 'recipe'});

// Then if you change the hash...
window.location.hash = '';
// ...the route data reflects the defaults.
can.route.attr(); // {type: 'recipe'}
@codeend

## Listening to events

Because `can.route` is an Observe, you can bind to it just like normal Observes:

@codestart
can.route.bind('id', function(ev, newVal, oldVal) {
	console.log('The hash\'s id changed.');
});
@codeend

You can listen to routing events in Controls with the _route_ event:

@codestart
var Routing = can.Control({
	'route': function() {
		// Matches every routing change, but gets passed no data.
	},
	'todos/:id route': function(data) {
		// Matches routes like #!todos/5,
		// and will get passed {id: 5} as data.
	},
	':type/:id route': function(data) {
		// Matches routes like #!recipes/5,
		// and will get passed {id: 5, type: 'recipes'} as data.
	}
})
@codeend

## Making URLs and links

`can.route.url` takes a set of properties and makes a URL according to
`can.route`'s current route.

@codestart
can.route(':type/:id', {type: 'todos'});
can.route.url({id: 7}); // #!todos/7
@codeend

`can.route.link` does the same thing as `can.route.url`, but it returns an
anchor element (in string form) ready to be inserted into HTML. You can also
specify extra propertires to be set on the element.

@codestart
var a = can.route.link(
	'Todo 5',
	{id: 7},
	{className: 'button'}
);

a; // &lt;a href="#!todos/7" class="button">Todo 5&lt;/a>
@codeend
