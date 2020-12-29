@module {constructor} can-observation
@parent can-observables
@collection can-infrastructure
@group can-observation.prototype prototype
@package ../package.json

Create observable values that derive their value from other observable
values.


@signature `new Observation( fn [, context][, options] )`

Creates an observable value from the return value of the given function called with `this` as the `context`.

The following creates a `fullName` observation that derives its values from
the `person` observable.

```js
import Observation from "can-observation";
import observe from "can-observe";

const person = observe( { first: "Ramiya", last: "Meyer" } );

const fullName = new Observation( function() {
	return person.first + " " + person.last;
} );

fullName.value; //-> "Ramiya Meyer";

fullName.on( function( newName ) {
	newName; //-> "Bodhi Meyer"
} );

person.first = "Bodhi";
```

@param {function} fn The function whose value is being observed.
@param {Object} [context] What `this` should be when `fn` is called.
@param {Object} [options] An object that can configure the behavior of the
  observation with the following properties:

  - __priority__ `{Number}` - The priority this observation will be updated
    within [can-queues].
  - __isObservable__ `{Boolean}` - If reading this observable should call
    [can-observation-recorder.add].  


@body

## Use Cases

`can-observation` is used to derive values from other values without
having to explicitly bind.   This is used many places within CanJS:

- [can-define] `getters` that cache their value.
- [can-stache]'s live binding.

## Use

To use `can-observation`, import it and create an observation that
reads from other observables and returns a value.


The following creates a `fullName` observation that derives its values from
the `person` observable.

```js
import Observation from "can-observation";
import observe from "can-observe";

const person = observe( { first: "Ramiya", last: "Meyer" } );

var fullName = new Observation(function fullName(){
	return person.first + " " + person.last;
});

fullName.value; //-> "Ramiya Meyer";

fullName.on( function( newName ) {
	newName; //-> "Bodhi Meyer"
} );

person.first = "Bodhi";
```

Use [can-observation.prototype.off] to unbind.  

## Debugging


#### Naming Functions

Observations [can-observation.prototype.can.getName name themselves] using the name of the
function passed to them. If you are using a `can-observation` directly, you should make sure the
function has a meaningful name.  

This can be done by using [function declarations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) like:

```js
var fullName = new Observation(function fullName(){
    return person.first + " " + person.last;
});
```

Instead of:

```js
var fullName = new Observation(function(){
    return person.first + " " + person.last;
});
```

You can also name functions as follows:

```js
//!steal-remove-start
var fn = function(){ ... };
Object.defineProperty(fn, "name", {
    value: "some meaningful name",
});
//!steal-remove-end
```

#### can-queues

If you use [can-queues] to debug, it's likely you'll see something like:

<pre>
NOTIFY running  : Observation&lt;fullName&gt;.onDependencyChange &#x25B6; { ... }
DERIVE running  : Observation&lt;fullName&gt;.update &#x25B6; { ... }
</pre>

These tasks are when an observation noticed a dependency has changed and when it began to update
its value. If you expand the task object (<code>&#x25B6; { ... }</code>), you should be able to see
exactly which dependency caused the observation to update.


## How it works

`can-observation` uses [can-event-queue/value/value] to implement its `.on`, `.off` methods and
call its internal `.onBound` and `.onUnbound` methods.

When bound for the first time, an observation calls its function between [can-observation-recorder]'s
[can-observation-recorder.start] and [can-observation-recorder.stop] to see what dependencies have been
bound.  It then uses [recorder-dependency-helpers.js](http://canjs.github.io/can-observation/docs/recorder-dependency-helpers.html) to bind those dependencies to it's `dependencyChange` method.

When a dependency change happens, an observation adds its `.update` method to the __derive__ [can-queues].
When the `.update` happens, it repeats the process in the above paragraph, binding and unbind to whatever dependencies are
found with   [can-observation-recorder.start] and [can-observation-recorder.stop].

[How it works: can-observation and can-observation-recorder](https://www.youtube.com/watch?v=UIhB-zXR5Yg)
covers how `can-observation` works.

<iframe width="560" height="315" src="https://www.youtube.com/embed/UIhB-zXR5Yg" frameborder="0" allowfullscreen></iframe>
