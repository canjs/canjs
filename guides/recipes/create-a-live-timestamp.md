@page CreateALiveTimestamp Create a Live Timestamp
@parent Recipes 3

@body

This recipe demonstrates how to generate a 'live' timestamp
that displays in a human-readable format. This means handling
application state that changes over time, as well as making
information rendered in a template human-readable using a helper function.

First, we'll add a `createdAt` property to the data like:

```
 var data = new can.Map({
   message: "Hello World",
   createdAt: new Date()
 });
```

On the page, this should be displayed as a human readable
timestamp:

```
 <h1>Hello World <i>created just now</i></h1>
```

__and__ as time passes, the timestamp will update to:

```
<h1>Hello World <i>created a few seconds ago</i></h1>
```

__and__ then update to "some seconds ago" and so forth.

To accomplish this, create a `prettyDate` [mustache helper](../docs/can.mustache.helper.html) that converts
dates into a human readable format.  A helper function is called from within the template where its result
will be displayed.  The following calls `prettyDate` with an observable value of `createdAt`.

```
<h1>
  {{message}}
  <i>created {{prettyDate createdAt}}</i>
</h1>
```

To call a function from a template, [register](../docs/can.mustache.registerHelper.html) it with `can.view`.
The third argument passed to `can.view` is an object with helper functions, so the `dateHelper` function
can be registered as `prettyView`.

```
var dateHelper = function ( date ) {
	//helper function
};

var frag = can.view("app-template", data, {prettyDate: dateHelper});
```

In this helper, `date` is not a Date object, instead it is an observable [can.compute](../docs/can.compute.html) that
contains the `createdAt` value.  A `can.compute` is an observable that contains a single value.  To read the value,
call the compute like you would any other function:

```
date() //-> Date
```

We need to compare `date` with the current time. The current time
will be represented by a compute:

```
var now = can.compute( new Date() )
```

As the current time changes, we update `now` with the new time. To change the value of a `can.compute`,
call it with its new value as an argument:

```
// update that property every second
setTimeout(function(){
	now( new Date() );
	setTimeout(arguments.callee, 1000);
}, 1000)
```

The `prettyDate` helper will read and compare the `date` and `now` compute to
get the time elapsed in seconds:

```
var timeElapsed = ( now() - date() ) / 1000
```

Using the `timeElapsed`, `prettyDate` returns human readable timestamps:

```
if(timeElapsed < 1.2){
	return "just now"
} else if (timeElapsed < 10) {
	return "a couple seconds ago"
}
...
else {
	return Math.round(difference/60)+" minutes ago"
}
```

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/VQNSH/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>