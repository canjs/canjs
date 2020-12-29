@function can-queues.logStack logStack
@parent can-queues/methods

@description Log the tasks that were run that resulted in the current line of code
being executed.

@signature `queues.logStack()`

`logStack()` is a very useful debugging tool for discovering why a particular piece of code
was executed by CanJS. It logs to the developer console the tasks that resulted in the current line of
code being executed.

It is often used in conjunction with a debugger, as a replacement for the browser's developer tool's stack.

```js
{
	someMethodThatIDontKnowWhyItsRunning: function() {
		queues.logStack();
		debugger;
	}
}
```

`logStack()` does nothing in production.

@body

## Use

A task queue means a browser's developer console stack will not
always provide an easily understandable representation of the flow of code that resulted in
a statement of code being executed.  `logStack()` and [can-queues.log] are helpful functions
that represent the actions CanJS is taken in a more sense-able representation.

To use `.logStack()` it's typically a good idea to reference it from the window so it can be called at
any time.  The easiest way to do this is to expose [can-namespace] as follows:

```js
window.can = require( "can-namespace" );
```

Now, `logStack` should be available at any time with:

```js
can.queues.logStack();
```

Consider the following code that derives an `info` value from the `person` observable:

```js
const person = new observe.Object( { name: "Fran", age: 15 } );

const info = new Observation( function updateInfo() {
	return person.name + " is " + person.age;
} );

info.on( function onInfoChanged( newVal ) {
	can.queues.logStack();
	debugger;
} );

person.age = 22;
```

The `can.queues.logStack()` above would log something similar to the following:

<pre>
ObserveObject{} set age to 22
NOTIFY ran task: Observation&lt;updateInfo&gt;.onDependencyChange &#x25B6; { ... }
DERIVE ran task: Observation&lt;updateInfo&gt;.update &#x25B6; { ... }
MUTATE ran task: onInfoChanged &#x25B6; { ... }
</pre>

`.logStack()` logs each task in the task queue and the reason the initial task was queued.  The name of
each task and the queue it ran in is logged.  You'll also notice that the task object itself
is logged (shown as <code>&#x25B6; { ... }</code> above).  That object contains references to the following:

```js
{
	fn,      // The function that was run
	context, // The context (`this`) the function was called on
	args,    // The arguments the function was passed
	meta    // Additional information about the task
}
```


The following video shows using `logStack`:

<iframe width="560" height="315" src="https://www.youtube.com/embed/L0hR5ic_FvE" frameborder="0" gesture="media" allow="encrypted-media" allowfullscreen></iframe>
