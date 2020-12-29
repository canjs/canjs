@module {function} can-debug
@parent can-observables
@collection can-ecosystem
@alias can.debug
@package ../package.json

@description Useful debugging utilities.

@signature `debug()`

`can-debug` exports a function that enables debugging and provides
methods that show how different parts of an application
affect each other, specifically CanJS's observables and DOM nodes.

Calling this function will enable
[CanJS Devtools](https://chrome.google.com/webstore/detail/canjs-devtools/hhdfadlgplkpapjfehnjhcebebgmibcb)
and will also set `window.debug` to an object containing debugging
utilities. The object is also returned.

@return {Object} Returns an object with the following methods:

```
{
	logWhatIChange   // Log what the observable affects
	logWhatChangesMe // Log what affects the observable
}
```

@body

## Use

`can-debug` provides functions to log how observables affect each other. These
functions can be used to understand the flow of data throughout an application.

The following example shows how to use the [can-debug.logWhatChangesMe] function
to log what affects the value of the `fullName` property on the `me` Person instance.

```js
const Person = DefineMap.extend( "Person", {
	first: "string",
	last: "string",
	fullName: {
		get: function() {
			return this.first + " " + this.last;
		}
	}
} );

const me = new Person( { first: "John", last: "Doe" } );
canDebug.logWhatChangesMe( me, "fullName" );
```

Which prints out the following message to the browser's console:

<img class="bit-docs-screenshot" alt="logWhatchangesMe full output" src="../node_modules/can-debug/doc/what-changes-me-full.png">

At first, the message might be very confusing, specially so in larger examples
where multiple observables are involved. Let's break it up in smaller sections to
get a better understanding of what each means:

<img class="bit-docs-screenshot" alt="logWhatchangesMe output" src="../node_modules/can-debug/doc/what-changes-me-top.png">

The following values are printed out for each observable in the dependency graph:

- The **observable's human-readable name** in the blue border box,
- The **observable's value and object reference** in the red border box,
- And finally the **observable's dependencies** in the green border box.

Each observable will be contained in a console group, this group is labeled
using a human-readable name that describes what the the observable does (blue
border box), in most cases this name is made out of the constructor name decorated
with some metadata and it's returned by [can-reflect.getName].

The box with the green border lists the dependencies of the observable in the
blue border box, these dependencies are grouped based on their relation to the
parent observable, in its current version `can-debug` outputs the following
groups:

- **DERIVED FROM**: observables used internally by the parent to derive its value.
- **MUTATED BY**: observables that set the value of the parent observable
  these are mostly found inside CanJS internals, where observables interact with
	each other, like [can-stache-bindings].
- **TWO WAY**: observables that are both derived and mutation dependencies.

The observables in each group are printed out recursively using the same format we
just described, We can can confirm this by expanding `Person{}.fullName`'s dependencies
group:

<img class="bit-docs-screenshot" alt="dependencies" src="../node_modules/can-debug/doc/what-changes-me-deps.png">

The whole output can be read as:

`Person{}.fullName` derives its value from `Observation<Person{}'s fullName getter>`,
which in turn derive its value from `Person{}.first` and `Person{}.last` values.

> Note: Please keep in mind that some of the observables printed out in the console
> do not necessarily match the ones found in user's application code, as mentioned
> before, observables used internally are listed as dependencies, such is the case
> of `Observation<Person{}'s fullName getter>` in the example.

The following demos a live version of the previous example, click the `logWhatChangesMe`
button and open the browser's console tab to inspect the generated message:

@demo demos/can-debug/log-what-changes-map.html

Understanding the relationships between types is helpful to debug certain kind
of issues, but most of the time you want to understand what affects another kind
of observables: DOM nodes.

The following example builds upon the previous code, and adds two `<input>` elements
that are cross bound to the `first` and `last` properties of the `Person` map, then
`fullName` is printed out in the page using a `<h1>` element.

Then [can-debug.logWhatChangesMe] is called to log what observables affect the
`<h1>` element:

```js
const Person = DefineMap.extend( "Person", {
	first: "string",
	last: "string",
	fullName: {
		get() {
			return `${this.first} ${this.last}`;
		}
	}
} );

const template = stache( `
  <h1 id="full">{{fullName}}</h1>
  <input id="first" value:bind="first">
  <input id="last" value:bind="last">
` );

const scope = new Person( { first: "Jane", last: "Doe" } );
document.body.appendChild( template( scope ) );

canDebug.logWhatChangeMe( document.querySelect( "#full" ) );
```

This prints out the following message:

<img class="bit-docs-screenshot" alt="logWhatChangesMe" src="../node_modules/can-debug/doc/what-changes-me-input.png">

That's a long message! but once you have identified the output pattern, making sense
of it is a lot easier. The observables highlighted in blue border boxes are the most
important to get a high level overview of the dependency graph, while the observables
in between help you make sense of how data flows from the top `<h1>` element down to
each `<input>` element and back up to the `<h1>` heading element.

The following demos a live version of the previous example, click the `logWhatChangesMe`
button and open the browser's console tab to inspect the generated message:

@demo demos/can-debug/log-what-changes-heading.html

## How to write can-debug friendly code

CanJS's internal observables are decorated with metadata and symbols used by
`can-debug` to build the dependency graph.

For most CanJS applications, the default instrumentation should be enough to get
reliable logs from `can-debug`; but custom observable types require some extra
work to make them easier to debug.

The whole process can be sumarized in the following steps:

- Give the observable a human-readable name, check out [can-reflect.getName] docs.
- Register how the observable interacts with other observables, check out
[can-reflect-dependencies] docs.
