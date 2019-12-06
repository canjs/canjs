@page can-infrastructure Infrastructure
@parent api 11
@description Utility libraries that power the core and ecosystem collection.

@body

## Use

The infrastructure collection of libraries are lower-level utility libraries that
are used by the [can-core] and [can-ecosystem] collections.  They can also
be used by applications directly.

Let’s explore what’s available.

## can-event-queue

[can-event-queue/map/map] is a mixin that adds event dispatching and listening functionality
on your objects. The following shows creating a `Person` constructor function
whose instances can produce events that can be listened to.

```js
import { mapEventBindings } from "can";

// Create the Person type
function Person(){ /* ... */ };
Person.prototype.method = function(){ /* ... */ };

// Add event mixin:
mapEventBindings(Person.prototype);

// Create an instance
const me = new Person();

// Now listen and dispatch events!
me.addEventListener("name", function(ev,data){ console.log(data) }); // -> {foo: "Bar"}

me.dispatch("name", [{foo: "Bar"}]);
```
@codepen

## can-queues

A light weight queue system for scheduling tasks, it runs tasks in one of the following queues:

1. [can-queues.notifyQueue] - Tasks that notify "deriving" observables that a source value has changed.
2. [can-queues.deriveQueue] - Tasks that update the value of a "deriving" observable.
3. [can-queues.domUIQueue] - Tasks that update the DOM.
4. [can-queues.mutateQueue] - Tasks that might cause other mutations that add tasks to one of the previous queues.

```js
import { queues } from "can";

queues.batch.start();
queues.mutateQueue.enqueue( console.log, console, [ "say hi" ] );
queues.batch.stop();
```
@codepen

## can-observation

[can-observation] provides a mechanism to notify when an observable has been read and a way to observe those reads called within a given function.  [can-observation] provides the foundation for [can-compute]’s abilities.

Use [can-observation-recorder.add ObservationRecorder.add] to signal when an an observable value has been read.
The following makes the `Person` type’s `getName()` observable:

```js
import { Observation, ObservationRecorder, mapEventBindings } from "can";

// Create the Person type
function Person(){};

// Add event mixin:
mapEventBindings(Person.prototype);

Person.prototype.setName = function(newName){
	let oldName = this.name;
	this.name = newName;
	this.dispatch("name", [newName, oldName]);
};
Person.prototype.getName = function(){
	ObservationRecorder.add(this, "name");
	return this.name;
};
```

The `Observation` constructor can be used, similar to a [can-compute] to observe
a function’s return value by tracking calls to `Observation.add`

```js
import { Observation,ObservationRecorder, mapEventBindings } from "can";

// Create the Person type
function Person(){};

// Add event mixin:
mapEventBindings(Person.prototype);

Person.prototype.setName = function(newName){
	let oldName = this.name;
	this.name = newName;
	this.dispatch("name", [newName, oldName]);
};
Person.prototype.getName = function(){
	ObservationRecorder.add(this, "name");
	return this.name;
};

const person = new Person();
person.setName("Justin");


const greetingObservation = new Observation(function(){
	return person.getName() + " says hi!";
});

ObservationRecorder.start();

greetingObservation.on(function(newValue) {
  console.log(newValue);
});

console.log(greetingObservation.value); //-> "Justin says hi!"

person.setName("Matt") //-> console.logs "Matt says hi!";
```
@codepen

## Utilities

### DOM Utilities

The DOM utilities consist of:

 - Node and Element helpers: [can-child-nodes],  [can-dom-data], [can-fragment].
 - Event helpers: [can-event-dom-enter], [can-event-dom-radiochange].
 - Ajax helpers: [can-ajax].
 - Environment identification helpers: [can-globals/document/document].

And the [can-dom-mutate] helper which should be used to manipulate DOM
nodes in elements that do not support [MutationObservers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).  


### JS Utilities

The JS utilities consist of:

- Functional helpers: [can-assign], [can-define-lazy-value], [can-make-map].
- Type detection helpers: [can-reflect.isConstructorLike], [can-reflect.isFunctionLike], [can-reflect.isIteratorLike],[can-reflect.isListLike], [can-reflect.isMapLike], ,[can-reflect.isObservableLike], [can-reflect.isPlainObject],  [can-reflect.isPromise], [can-reflect.isPrimitive], [can-types].
- Environment detection helpers: [can-globals/is-browser-window/is-browser-window], [can-globals/is-node/is-node], [ccan-globals/is-browser-window/is-web-worker].
- Environment identification helpers: [can-global], [can-globals].
- URL helpers: [can-param], [can-deparam], [can-join-uris].
- Diffing helper: [can-diff].
- String helpers: [can-string], [can-string-to-any].
- Object identification helpers: [can-cid].


## can-view-callbacks

[can-view-callbacks] lets you register callbacks for specific elements or attributes found in
templates.

```js
import { stache, viewCallbacks } from "can";

viewCallbacks.tag("blue-el", function(el, tagData) {
    el.style.background = "blue";
    var frag = tagData.subtemplate( {
        message: "Hello"
    }, tagData.options );
  
   el.appendChild(frag);
});

var view = stache("<blue-el>{{ message }}</blue-el>");

var frag = view();

document.body.appendChild(frag);
```
@codepen

## can-view-live

Sets up a live-binding between the DOM and a compute.

```js
import { compute, fragment, viewLive } from "can";

let message = compute("World");

let content = frag("Hello","","!");

live.text(content.childNodes[1], message);

document.body.appendChild(content);

message("Earth");

console.log(document.body.innerHTML); //-> Hello Earth
```
@codepen


## can-view-parser

[can-view-parser] parses HTML and handlebars/mustache tokens.  

```js
import { viewParser } from "can";

let html = '<h1><span first="foo"></span><span second="bar"></span></h1>';

let attrs = [];

viewParser(html, {
    attrStart: function(attrName){
        attrs.push(attrName)
    },
    attrEnd: function() {},
    start: function() {},
    end: function() {},
    attrValue: function() {},
    done: function() {}
});

console.log(attrs); //-> ["first", "second"]
```
@codepen

## can-view-scope

[can-view-scope] provides a lookup node within a contextual lookup. This is similar
to a call object in closure in JavaScript.  Consider how `message`, `first`, and `last` are looked up in the following JavaScript:

```js
let message = "Hello"
function outer(){
    let last = "Abril";

    function inner(){
        let first = "Alexis";
        console.log(message + " "+ first + " " + last);
    }
    inner();
}
outer();
```

[can-view-scope] can be used to create a similar lookup path:

```js
import { Scope } from "can";

let globalScope = new Scope({message: "Hello"});
let outerScope = globalScope.add({last: "Abril"});
let innerScope = outerScope.add({first: "Alexis"});
console.log(innerScope.get("../../message")); //-> Hello
console.log(innerScope.get("first"));   //-> Alexis
console.log(innerScope.get("../last"));    //-> Abril
```
@codepen

## can-view-target

[can-view-target] is used to create a document fragment that can be quickly cloned but
have callbacks called quickly on specific elements within the cloned fragment.

```js
import { traget } from "can";

let aTarget = target([
    {
        tag: "h1",
        callbacks: [function(data){
            this.className = data.className
        }],
        children: [
            "Hello ",
            function(data){
                this.nodeValue = data.message
            }
        ]
    },
]);

// target.clone -> <h1>|Hello||</h1>
// target.paths -> path: [0], callbacks: [], children: {paths: [1], callbacks:[function(){}]}

let fragment = aTarget.hydrate({className: "title", message: "World"});

console.log(fragment); // -> <h1 class='title'>Hello World</h1>
```
@codepen

## can-cid

[can-cid] is used to get a unique identifier for an object, optionally prefixed by a type name. Once set, the unique identifier does not change, even if the type name changes on subsequent calls.

```js
import cid from "can";
const x = {};
const y = {};

console.log(cid(x, "demo")); // -> "demo1"
console.log(cid(x, "prod")); // -> "demo1"
console.log(cid(y));         // -> "2"
```
@codepen

## can-types

[can-types] is used to provide default types or test if something is of a certain type.

```js
import types from 'can-types';
let oldIsMapLike = types.isMapLike;
types.isMapLike = function(obj){
  return obj instanceof DefineMap || oldIsMapLike.apply(this, arguments);
};
types.DefaultMap = DefineMap;
```

## can-namespace

[can-namespace] is a namespace where can-* packages can be registered.

```js
import namespace from 'can-namespace';

const unicorn = {
	// ...
};

if (namespace.unicorn) {
	throw new Error("You can't have two versions of can-unicorn, check your dependencies");
}

export default namespace.unicorn = unicorn;

```

## can-reflect

[can-reflect] allows reflection on unknown data types.

```js
import { ObservableObject, Reflect as canReflect } from "can";

const foo = new ObservableObject({ bar: "baz" });

console.log(canReflect.getKeyValue(foo, "bar")); // -> "baz"
```
@codepen
