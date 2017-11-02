@page can-infrastructure Infrastructure
@parent api 11
@description Utility libraries that power the core and ecosystem collection.

@body

## Use

The infrastructure collection of libraries are lower-level utility libraries that
are used by the [can-core] and [can-ecosystem] collections.  They can also
be used by applications directly.

Let’s explore what’s available.

## can-event

[can-event] is a mixin that adds event dispatching and listening functionality
on your objects. The following shows creating a `Person` constructor function
whose instances can produce events that can be listened to.

```js
var canEvent = require("can-event");
var assign = require("can-util/js/assign/assign");

// Create the Person type
function Person(){ ... };
Person.prototype.method = function(){ ... };

// Add event mixin:
assign(Person.prototype, canEvent);

// Create an instance
var me = new Person();

// Now listen and dispatch events!
me.addEventListener("name", function(){ ... });

me.dispatch("name");
```

[can-event/batch/batch] adds event batching abilities to the [can-event] event system.
[can-event/async/async] adds asynchronous batched event dispatching to the [can-event] event system.

## can-observation

[can-observation] provides a mechanism to notify when an observable has been read and a way to observe those reads called within a given function.  [can-observation] provides the foundation for [can-compute]’s abilities.

Use [can-observation.add Observation.add] to signal when an an observable value has been read.
The following makes the `Person` type’s `getName()` observable:

```js
var Observation = require("can-observation");
var canEvent = require("can-event");
var assign = require("can-util/js/assign/assign");

// Create the Person type
function Person(){};
Person.prototype.setName = function(newName){
	var oldName = this.name;
	this.name = newName;
	this.dispatch("name", [newName, oldName]);
};
Person.prototype.getName = function(){
	Observation.add(this, "name");
	return this.name;
};
```

The `Observation` constructor can be used, similar to a [can-compute] to observe
a function’s return value by tracking calls to `Observation.add`

```js
var person = new Person();
person.setName("Justin");


var greetingObservation = new Observation(function(){
	return person.getName() + " says hi!";
}, null, function(newValue){
	console.log(newValue);
});
greetingObservation.start();

greetingObservation.value //-> "Justin says hi!"

person.setName("Matt") //-> console.logs "Matt says hi!";
```

## can-util

[can-util] is a collection of many different modules that provide various JavaScript
and DOM related utilities.

### DOM Utilities

The DOM utilities consist of:

 - Node and Element helpers: [can-util/dom/child-nodes/child-nodes], [can-util/dom/class-name/class-name], [can-util/dom/data/data], [can-util/dom/frag/frag].
 - Event helpers: [can-util/dom/dispatch/dispatch], [can-util/dom/events/delegate/delegate], [can-util/dom/events/attributes/attributes], [can-util/dom/events/inserted/inserted], [can-util/dom/events/removed/removed].
 - Ajax helpers: [can-util/dom/ajax/ajax].
 - Environment identification helpers: [can-util/dom/document/document].

And the [can-util/dom/mutate/mutate] helper which should be used to manipulate DOM
nodes in elements that do not support [MutationObservers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).  


### JS Utilities

The JS utilities consist of:

- Functional helpers: [can-util/js/each/each], [can-util/js/assign/assign], [can-util/js/deep-assign/deep-assign], [can-util/js/make-array/make-array].
- Type detection helpers: [can-util/js/is-array-like/is-array-like],  [can-util/js/is-empty-object/is-empty-object], [can-util/js/is-function], [can-util/js/is-plain-object/is-plain-object], [can-util/js/is-promise/is-promise], [can-util/js/is-string/is-string], [can-util/js/types/types].
- Environment detection helpers: [can-util/js/is-browser-window/is-browser-window], [can-util/js/is-node/is-node], [can-util/js/is-web-worker/is-web-worker].
- Environment identification helpers: [can-util/js/global/global], [can-util/js/import/import], [can-util/js/base-url/base-url].
- Polyfills - [can-util/js/set-immediate/set-immediate].
- URL helpers: [can-param], [can-deparam], [can-util/js/join-uris/join-uris].
- Diffing helpers: [can-util/js/diff/diff], [can-util/js/diff-object/diff-object].
- String helpers: [can-util/js/string/string], [can-util/js/string-to-any/string-to-any].
- Object identification helpers: [can-util/js/cid/cid].


## can-view-callbacks

[can-view-callbacks] lets you register callbacks for specific elements or attributes found in
templates.

```js
var callbacks = require("can-view-callbacks");

callbacks.tag("blue-el", function(el){
    el.style.background = "blue";
});
```

## can-view-live

Sets up a live-binding between the DOM and a compute.

```js
var live = require("can-view-live");
var compute = require("can-compute");
var frag = require("can-util/dom/frag/frag");

var message = compute("World");

var content = frag("Hello","","!");

live.text(content.childNodes[1], message);

document.body.appendChild(content);

message("Earth");

document.body.innerHTML //-> Hello Earth!
```

## can-view-nodelist

[can-view-nodelist] is used to maintain the structure of HTML nodes produced by a
template. For example, a [can-stache] template like:

```
{{#if over21}}name:{{{highlight name}}}.{{/if}}
```

Might result in a nodeList structure that looks like:

```
if[
	TextNode("name:"),
	highlight[<b>Justin</b>]
]
```

This is to say that the `#if over21` nodeList will contain a text node for `"name:"`
and the `highlight name` nodeList.  The `highlight name` nodeList will contain the
html content resulting from that helper (`<b>Justin</b>`).

## can-view-parser

[can-view-parser] parses HTML and handlebars/mustache tokens.  

```js
var parser = require("can-view-parser");

var html = '<h1><span first="foo"></span><span second="bar"></span></h1>';

var attrs = [];

parser(html, {
    attrStart: function(attrName){
        attrs.push(attrName)
    }
});

attrs //-> ["first", "second"]
```

## can-view-scope

[can-view-scope] provides a lookup node within a contextual lookup. This is similar
to a call object in closure in JavaScript.  Consider how `message`, `first`, and `last` are looked up in the following JavaScript:

```js
var message = "Hello"
function outer(){
    var last = "Abril";

    function inner(){
        var first = "Alexis";
        console.log(message + " "+ first + " " + last);
    }
    inner();
}
outer();
```

[can-view-scope] can be used to create a similar lookup path:

```js
var globalScope = new Scope({message: "Hello"});
var outerScope = globalScope.add({last: "Abril"});
var innerScope = outerScope.add({first: "Alexis"});
innerScope.get("message") //-> Hello
innerScope.get("first")   //-> Alexis
innerScope.get("last")    //-> Abril
```

## can-view-target

[can-view-target] is used to create a document fragment that can be quickly cloned but
have callbacks called quickly on specific elements within the cloned fragment.

```js
var viewTarget = require("can-view-target");

var target = viewTarget([
    {
        tag: "h1",
        callbacks: [function(data){
            this.className = data.className
        }],
        children: [
            "Hello ",
            function(){
                this.nodeValue = data.message
            }
        ]
    },
]);

// target.clone -> <h1>|Hello||</h1>
// target.paths -> path: [0], callbacks: [], children: {paths: [1], callbacks:[function(){}]}

var frag = target.hydrate({className: "title", message: "World"});

frag //-> <h1 class='title'>Hello World</h1>
```

## can-cid

[can-cid] is used to get a unique identifier for an object, optionally prefixed by a type name. Once set, the unique identifier does not change, even if the type name changes on subsequent calls.

```js
var cid = require("can-cid");
var x = {};
var y = {};

console.log(cid(x, "demo")); // -> "demo1"
console.log(cid(x, "prod")); // -> "demo1"
console.log(cid(y));         // -> "2"
```

## can-types

[can-types] is used to provide default types or test if something is of a certain type.

```js
var types = require("can-types");
var oldIsMapLike = types.isMapLike;
types.isMapLike = function(obj){
  return obj instanceof DefineMap || oldIsMapLike.apply(this, arguments);
};
types.DefaultMap = DefineMap;
```

## can-namespace

[can-namespace] is a namespace where can-* packages can be registered.

```js
var namespace = require('can-namespace');

var unicorn = {
	// ...
};

if (namespace.unicorn) {
	throw new Error("You can't have two versions of can-unicorn, check your dependencies");
} else {
	module.exports = namespace.unicorn = unicorn;
}
```

## can-symbol

[can-symbol] contains Symbols used to detail how CanJS may operate on different objects.

```js
var MyIDSymbol = CanSymbol("my_ID");

var obj = {};
obj[MyIDSymbol] = 1;
```

## can-reflect

[can-reflect] allows reflection on unknown data types.

```js
var foo = new DefineMap({ bar: "baz" });

canReflect.getKeyValue(foo, "bar"); // -> "baz"
```
