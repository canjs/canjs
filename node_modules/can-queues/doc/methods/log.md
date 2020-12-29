@function can-queues.log log
@parent can-queues/methods

@description Turn off or on logging on all queues.

@signature `queues.log( [type] )`

`queues.log` calls [can-queues.Queue.prototype.log] on all queues in `can-queues`:
[can-queues.notifyQueue], [can-queues.deriveQueue], [can-queues.domUIQueue] and the
[can-queues.mutateQueue].

Calling `queues.log("flush")` is a useful tool for debugging.

```js
import queues from "can-queues";
queues.log( "flush" );
```

@param {String|Boolean} [type=true] Specifies what to log.
 - `.log()` - Logs when tasks are enqueued and run.
 - `.log(false)` - Turn off logging.
 - `.log("flush")` - Log only flushing.
 - `.log("enqueue")` - Log on enqueuing.

@body

## Use

Consider the following code that derives an `info` value from the `person` observable:

```js
const person = new observe.Object( { name: "Fran", age: 15 } );

const info = new Observation( function updateInfo() {
	return person.name + " is " + person.age;
} );

info.on( function onInfoChanged( newVal ) {
	console.log( "info changed" );
} );

queues.log();
person.age = 22;
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
