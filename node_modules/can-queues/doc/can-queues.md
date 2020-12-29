@module {Object} can-queues
@parent can-js-utilities
@collection can-infrastructure
@group can-queues/types 0 queue types
@group can-queues/queues 1 queues
@group can-queues/methods 2 methods
@package ../package.json

@description A light weight queue system for scheduling tasks.

@type {Object} The `can-queues` package exports an object with queue constructors, shared instances, and helpers
methods.  The following describes the properties of the `can-queues` object:

```js
{
	Queue,           // The Queue type constructor

	PriorityQueue,   // The PriorityQueue type constructor

	CompletionQueue, // The CompletionQueue type constructor

	notifyQueue,     // A Queue used to tell objects that
	// derive a value that they should be updated.

	deriveQueue,     // A PriorityQueue used update values.

	domUIQueue,      // A CompletionQueue used for updating the DOM or other
	// UI after state has settled, but before user tasks

	mutateQueue,     // A Queue used to register tasks that might
	// update other values.

	batch: {
		start,     // A function used to prevent the automatic flushing
		// of the NOTIFY_QUEUE.

		stop       // A function used to begin flushing the NOTIFY_QUEUE.
	},

	enqueueByQueue, // A helper function used to queue a bunch of tasks.

	stack,         // A function that returns an array of all the queue
	// tasks up to this point of a flush for debugging.
	// Returns an empty array in production.

	logStack,      // A function that logs the result of `this.stack()`.
	// Doesn't do anything in production.

	log            // Logs tasks as they are enqueued and/or run.
}
```

@body

## Use Cases

`can-queues` is used by CanJS to order task execution. A `task` is simply
the calling of a function, usually a callback function within an event binding.

There are two main reasons tasks are ordered:

- __performance__ - It can be beneficial to order some tasks to happen at the same time. For example, those
  that change the DOM. CanJS performs all DOM mutations together in the DOMUI queue. This helps avoid expensive browser layout reflows. Read [On Layout & Web Performance](http://kellegous.com/j/2013/01/26/layout-performance/) for background on why browser layout reflows hurts performance.  
- __determinism__ - Ordering tasks can provide assurances about the state of an application at a particular
point in time.

Let's explore the __determinism__ use case a bit more with a
small example to shows what a lack of __determinism__ would look like.  In the following example,
`person` observable is created, with two observations that derive values from its
values:

```js
const person = observe( { name: "Fran", age: 15 } );

const info = new Observation( () => {
	return person.name + " is " + person.age;
} );

const canVote = new Observation( () => {
	return person.age >= 18;
} );
```

Now let's say we listened to when `info` and `canVote` changed and used the other value
to print a message:

```js
info.on( function( newInfo ) {
	console.log( "info: " + newInfo + ", canVote:" + canVote.get() );
} );

canVote.on( function( newCanVote ) {
	console.log( "canVote: " + newCanVote + ", info: " + info.get() );
} );
```

If `person.age` is set to `19`, `info` and `canVote`
are each updated and their event handlers dispatched. If the updates to `info` and `canVote` immediately
dispatched their events, you would see something like:

```js
person.age = 19;

// console.log("info: Fran is 19, canVote: false")
// console.log("info: Fran is 19, canVote: true")
```

Notice that `canVote` is `false`.  This is because `canVote` has not been updated
yet.  CanJS avoids this problem by scheduling callbacks in queues. All _"user"_ events
like the ones above (registered with `.on()`) happen last in the [can-queues.mutateQueue].  `info` and `canVote`
update their values in the [can-queues.deriveQueue]. `info` and `canVote` are notified of
the `age` change in the [can-queues.notifyQueue] queue.

In CanJS, all user event handlers are able to read
other values and have those values reflect all prior state changes (mutations).




## Use

Use `can-queues` enqueue and run tasks in one of the following queues:

1. [can-queues.notifyQueue] - Tasks that notify observables "deriving" observables that a source value has changed.
2. [can-queues.deriveQueue] - Tasks that update the value of a "deriving" observable.
3. [can-queues.domUIQueue] - Tasks that update the DOM.
4. [can-queues.mutateQueue] - Tasks that might cause other mutations that add tasks to one of the previous queues.

For example, the following enqueues and runs a `console.log("Hello World")` in the `mutateQueue`:

```js
import queues from "can-queues";

queues.batch.start();
queues.mutateQueue.enqueue( console.log, console, [ "say hi" ] );
queues.batch.stop();
```

A `task` in `can-queues` is just:

- a `function` (`console.log`),
- its `this` (`console`),
- and its arguments `["say hi"]`

[can-queues.batch.start] begins collecting tasks and [can-queues.batch.stop] flushes any
enqueued tasks.  [can-queues.batch.start] and [can-queues.batch.stop] can be nested and only fire
when the number of `queues.batch.start()` calls equals the number of `queues.batch.stop()` calls.

```js
queues.batch.start();
queues.batch.start();
queues.batch.start();
queues.mutateQueue.enqueue( console.log, console, [ "say hi" ] );
queues.batch.stop();
queues.batch.stop();
queues.batch.stop(); //-> logs "say hi"
```

The [can-queues.enqueueByQueue] helper can enqueue multiple tasks and starts and stops a batch.  For example,
the following will log "running a task" in every queue.

```js
queues.enqueueByQueue( {
	notify: [ console.log ],
	derive: [ console.log ],
	domUI: [ console.log ],
	mutate: [ console.log ]
}, console, [ "running a task" ] );
```

When enqueuing tasks, to assist with debugging, __PLEASE__:

- Give your functions useful names:
  ```js
  //!steal-remove-start
  Object.defineProperty( this.update, "name", {
  	value: canReflect.getName( this ) + ".update"
  } );

  //!steal-remove-end
  ```
- Use the `reasonLog` (described in [can-queues.enqueueByQueue]'s documentation):
  ```js
  queues.notifyQueue.enqueue(
	this.update,
	this,
	[],
	null

	//!steal-remove-start
	/* jshint laxcomma: true */
	, [ canReflect.getName( context ), "changed" ]
	/* jshint laxcomma: false */
	//!steal-remove-end
  );
  ```

CanJS is much easier to debug if queued tasks can be easily traced to their source in meaningful ways.


## Understanding task order

This section describes the order in which tasks run. Tasks run in a particular order within
a queue, determined by the type of queue:

- Basic [can-queues.Queue] - Run in first-in-first out.
- [can-queues.CompletionQueue] - Run in first-in-first out, but each task must complete completely before the next task is run.
- [can-queues.PriorityQueue] - Like a `CompletionQueue`, but run tasks in order of their priority.

The queues themselves run in a particular order. `can-queues` runs the task queues in the following order:

1. [can-queues.notifyQueue] - Tasks that notify observables "deriving" observables that a source value has changed.
2. [can-queues.deriveQueue] - Tasks that update the value of a "deriving" observable.
3. [can-queues.domUIQueue] - Tasks that update the DOM.
4. [can-queues.mutateQueue] - Tasks that might cause other mutations that add tasks to one of the previous queues.

This means that once the `notifyQueue` has completed, the `deriveQueue`'s tasks will start and so
on.  Lets see a brief example where we:

- Create a person,
- Derive an `info` value from it,
- Update the DOM with the value of `info`,
- Listen to changes in `age` and log the new value.

```js
const person = new observe.Object( { name: "Fran", age: 15 } );

const info = new Observation( function updateInfo() {
	return person.name + " is " + person.age;
} );

const frag = stache( "<h2>{{info}}</h2>" )( { info: info } );
document.body.appendChild( frag );

person.on( "age", function logAgeChanged( newVal ) {
	console.log( "Age changed to ", newVal );
} );

person.age = 22;
```

When `person.age` changes, this will:

1. Enqueue a __notify__ task (`onAgeChange`) that notifies `info` that one of its source values is
   changing.  
2. Enqueue a __mutate__ task (`logAgeChanged`).
3. Run `info`'s `onAgeChange` task. This then enqueue and run a __derive__ task (`updateInfo`) that will derive the new `info` value.
4. `info` will then enqueue any event handlers listening for changes to its value.  `stache` (via [can-view-live]) is listening to changes in the __domUI__ queue.  [can-view-live]'s `setInnerHTML` is enqueued.
5. `setInnerHTML` is run, updating the page.
6. The __domUI__ queue is empty, so the __mutate__ task's are run. `logAgeChanged` is run.

![notify then derive then domUI then mutate](../node_modules/can-queues/doc/queues.png)


> NOTE: Tasks in earlier queues will "preempt" tasks in later queues.  For example, if a __deriveQueue__ task enqueues
a __notifyQueue__ task, the notifyQueue tasks will be flushed before continuing on to additional __deriveQueue__
tasks.



## Debugging

`can-queues` lets you trace the task execution with two different methods:

- [can-queues.log] - log when tasks are enqueued, flushed, or both.
- [can-queues.logStack] - log the tasks that resulted in the current method being run.

Consider the following code that derives an `info` value from the `person` observable:

```js
const person = new observe.Object( { name: "Fran", age: 15 } );

const info = new Observation( function updateInfo() {
	return person.name + " is " + person.age;
} );

info.on( function onInfoChanged( newVal ) {
	console.log( "info changed" );
} );

person.age = 22;
```

If you wanted to know what caused `onInfoChanged` to run, you could call
`.logStack()`.  It would log something similar to the following:

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

`.log()` is used to log every task as it is enqueued and flushed.  If `queues.log()` was called
prior to `person.age` being set, the following would be logged:


<pre>
NOTIFY enqueuing: Observation&lt;updateInfo&gt;.onDependencyChange &#x25B6; { ... }
NOTIFY running  : Observation&lt;updateInfo&gt;.onDependencyChange &#x25B6; { ... }
DERIVE enqueuing: Observation&lt;updateInfo&gt;.update &#x25B6; { ... }
DERIVE running  : Observation&lt;updateInfo&gt;.update &#x25B6; { ... }
MUTATE enqueuing: onInfoChanged &#x25B6; { ... }
MUTATE running  : onInfoChanged &#x25B6; { ... }
</pre>


Typically, knowing when tasks are enqueued is not helpful
for debugging so it's generally more useful to only log when tasks are flushed with:

```js
queues.log( "flush" );
```


## How it works

`can-queues` works by first creating the [queue-state.js](https://canjs.github.io/can-queues/docs/queue-state.html)
module that simply tracks the `lastTask` that has been executed. Queues update and use this state to provide [can-queues.logStack].

Then, the different queues are created:

- [queue.js](https://canjs.github.io/can-queues/docs/queue.html)
- [completion-queue.js](https://canjs.github.io/can-queues/docs/completion-queue.html)
- [priority-queue.js](https://canjs.github.io/can-queues/docs/priority-queue.html)

[can-queues](https://canjs.github.io/can-queues/docs/can-queues.html) uses those queues to create the [can-queues.notifyQueue], [can-queues.deriveQueue], [can-queues.domUIQueue] and [can-queues.mutateQueue], wires them up so when one is done, the next is flushed. It also creates the `batch` and other methods.
