@class can.route
@inherits can.Observe
@plugin can/route
@parent index

`can.route(route, defults)` helps manage browser history (and
client state) by
synchronizing the window.location.hash with
an [can.Observe].

## Background Information

To support the browser's back button and bookmarking
in an Ajax application, most applications use
the <code>window.location.hash</code>.  By
changing the hash (via a link or JavaScript), 
one is able to add to the browser's history 
without changing the page.

This provides the basics needed to
create history enabled Ajax websites.  However,
`can.route` addresses several other needs such as:

  - Pretty urls (actually hashes)
  - Keeping routes independent of application code
  - Listening to specific parts of the history changing
  - Setup / Teardown of widgets.

## How it works

<code>can.route</code> is a [can.Control can.Observe] that represents the
<code>window.location.hash</code> as an 
object.  For example, if the hash looks like:

    #!type=videos&id=5
    
the data in <code>can.route</code> looks like:

    { type: 'videos', id: 5 }


`can.route` keeps the state of the hash in-sync with the `data` contained within in
`can.route`.

## can.Observe

`can.route` is a [can.Control can.Observe]. Understanding
`can.Observe` is essential for using `can.route` correctly.

You can listen to changes in an Observe with `bind(eventName, handler(ev, args...))` and
change can.route's properties with 
[can.Observe:attr attr].

### Listening to changes in an Observable

Listen to changes in history 
by [can.Observe:bind bind]ing to
changes in <code>can.route</code> like:

    can.route.bind('change', function(ev, attr, how, newVal, oldVal) {
    
    })

 - `attr` - the name of the changed attribute
 - `how` - the type of Observe change event (add, set or remove)
 - `newVal`/`oldVal` - the new and old values of the attribute

You can also listen to specific changes 
with [can.Control.prototype.delegate delegate]:

    can.route.delegate('id','change', function(){ ... })

Observe lets you listen to the following events:

 - change - any change to the object
 - add - a property is added
 - set - a property value is added or changed
 - remove - a property is removed

Listening for <code>add</code> is useful for widget setup
behavior, <code>remove</code> is useful for teardown.

### Updating an observable

Create changes in the route data with [can.Control.prototype.attr attr] like:

    can.route.attr('type','images');

Or change multiple properties at once like:

    can.route.attr({type: 'pages', id: 5}, true)

When you make changes to can.route, they will automatically
change the <code>hash</code>.

## Creating a Route

Use <code>can.route(url, defaults)</code> to create a 
route. A route is a mapping from a url to 
an object (that is the can.route's state).

If no routes are added, or no route is matched, 
can.route's data is updated with the [can.deparam deparamed]
hash.

    location.hash = "#!type=videos";
    // can.route -> {type : "videos"}
    
Once routes are added and the hash changes,
can.route looks for matching routes and uses them
to update can.route's data.

    can.route( "content/:type" );
    location.hash = "#!content/images";
    // can.route -> {type : "images"}
    
Default values can also be added:

    can.route("content/:type",{type: "videos" });
    location.hash = "#!content/"
    // can.route -> {type : "videos"}
    
## Delay setting can.route

By default, <code>can.route</code> sets its initial data
on document ready.  Sometimes, you want to wait to set 
this data.  To wait, call:

    can.route.ready(false);

and when ready, call:

    can.route.ready(true);

## Changing the route.

Typically, you never want to set <code>location.hash</code>
directly.  Instead, you can change properties on <code>can.route</code>
like:

    can.route.attr('type', 'videos')
    
This will automatically look up the appropriate 
route and update the hash.

Often, you want to create links.  <code>can.route</code> provides
the [can.route.link] and [can.route.url] helpers to make this 
easy:

    can.route.link("Videos", {type: 'videos'})

## Demo

The following demo shows the relationship between `window.location.hash`,
routes given to `can.data`,
`can.route`'s data, and events on `can.data`.  Most properties 
are editable so experiment!

@iframe can/route/demo.html 980

@param {String} url the fragment identifier to match.  The fragment identifier
should start with either a character (a-Z) or colon (:).  Examples

    can.route(":foo")
    can.route("foo/:bar")

## Using routes with `can.Control`

TALK ABOUT the route event.  Talk about listening to routes like:

"{can.route} type" : function(){

}

talk about the Observe delegate plugin that allows things like

"{can.route} type=recipe set"


@param {Object} [defaults] an object of default values
@return {can.route}
