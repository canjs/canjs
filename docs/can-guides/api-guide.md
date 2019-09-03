@page guides/api Reading the API Docs
@parent guides/other 2

@description This page walks through how to use and understand CanJS’s API documentation.  

@body


## Documentation Structure

CanJS’s documentation is broken down by pages for:

 - library collections
 - packages and modules and their exports
 - functions, properties, and type definitions (typedefs) related to module exports

For example, [can-observable-array/array.prototype.filter can-observable-array/array.prototype.filter] is a
method that filters an array of [can-observable-array ObservableArray]:

```js
import ObservableArray from "can-observable-array";

let users = new ObservableArray([{ name: "Justin" }, { name: "Matt" }]);

const filteredUsers = users.filter(function(item) {
  return item.name === "Justin";
}); //-> { name: "Justin: }
```

`.filter` is a function the `prototype` of the [can-observable-array ObservableArray] export of the `can-observable-array`
module.  The `can-observable-array` is part of CanJS’s [can-core] collection.

So understanding CanJS’s API pages are about understanding the relationships between:

- library collections
- packages and modules and their exports
- functions, properties, and type definitions (typedefs) related to module exports

…and what’s documented on those pages.  

### Library Collection pages

The API docs are divided in 4 collection pages:

- [can-core]
- [can-ecosystem]
- [can-infrastructure]
- [can-legacy]

Each collection page acts as an overview and cheat sheet for the modules and functionality
contained within the collection.

The [can-core] collection contains the documentation for the libraries that
are use most commonly and directly within a CanJS application.  This is where the Model-View-ViewModel
libraries of CanJS are documented.

The [can-ecosystem] collection contains less commonly used libraries or libraries that aren’t quite core ready yet.  The most commonly used libraries here are [can-fixture] and [can-stache-converters].

The [can-infrastructure] collection contains the utility libraries that power the core and ecosystem
collection.  Often, this functionality is used indirectly.  For example, the [can-event] mixin
is used to add `on`, `off`, and `dispatch` methods to [can-define] and [can-compute].  And, [can-util] contains a wide variety of low-level DOM and JavaScript utilities.

Sometimes [can-infrastructure] is used directly.  The most important examples are:

 - [can-event/batch/batch] is used to batch changes for faster performance.
 - [can-util/dom/attr/attr] provides special [can-util/dom/attr/attr.special.focused] and [can-util/dom/attr/attr.special.values] attributes that [can-stache-bindings] can be bound to.
 - [can-util/dom/events/events] provides special [can-util/dom/events/attributes/attributes],
   [can-util/dom/events/inserted/inserted], and [can-util/dom/events/removed/removed] events.
 - [can-view-callbacks] lets you register behavior for custom elements and attributes.

Finally, the [can-legacy] collection.  This is for libraries that are no longer under active
development.  Hopefully, you aren’t there very often.

> Look to library collection pages for a high level cheat and explanation of every module within
> the collection.  

## Package and Module Pages

A package or module documents the "direct" functionality of the export and provides an overview of
all functionality contained within the module or package.

For example, [can-observable-array] documents the "direct" functionality of the export, namely
the [can-observable-array ObservableArray] function that is exported.  While  [can-observable-array#classextendsObservableArray classextendsObservableArray] is the most common starting place when using [can-observable-array ObservableArray], the [can-observable-array ObservableArray] export method can only be used like `new ObservableArray()` directly.  This is why `new ObservableArray()` is documented
on [can-observable-array].  

However, after the `new ObservableArray()` signature is detailed, [can-observable-array] has a __#Use__
section that provides an overview of all functionality contained within the `can-observable-array`
module.

> Look to Package and module pages for details of what is specifically exported and an overview
> of what the module does, why it’s useful, and how to use it.

## Functions, Properties, and Typedef pages

Within a module, there might be a variety of functions, properties and types a
module might provide.

These values are generally organized by groupings.  The most common groupings are:

 - _prototype_ - A property or function is on the prototype of a parent function.
 - _static_ - A property or method is a direct value on the parent function or object.
 - _events_ - Events dispatched on the parent object or instances of the parent function.
 - _types_ - Type definitions.

Let’s see a few examples and then give an overview of how their content is structured.

#### prototype

[can-observable-array.prototype.filter can-observable-array.prototype.filter] is in
the _prototype_ group on [can-observable-array] because `filter` is on
the `can-observable-array` export’s `prototype`:

```js
import ObservableArray from "can-observable-array";
ObservableArray.prototype.filter //-> function
```

Because of how JavaScript works, this means that you can call `.filter` directly on any instance
of [can-observable-array ObservableArray]:

```js
let hobbies = new ObservableArray(["learning", "programming"]);
hobbies.filter(hobby => hobby === "programming");
```

#### static

[can-observable-object/object.static.propertyDefaults] in
the _static_ group on [can-observable-object] because `propertyDefaults` is a [static property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Class_fields#Public_static_fields) on the `can-observable-object`:

```js
import ObservableObject from "can-observable-object";

class Person extends ObservableObject {
  static propertyDefaults = {}
}
```

#### types

Sometimes a method might expect data passed to it in a certain format, or returns
data in another format.  These formats are often described separate from the
method.

For example, the [can-fixture.store can-fixture.store] method returns an object
of the [can-fixture/StoreType Store type].

```js
import fixture from 'can-fixture';

let todoStore = fixture.store([{id: 1, name: "trash"}]);

todoStore.createData  //-> function
todoStore.destroyData //-> function
todoStore.get         //-> function
```

As you can see above, a `Store` can have lots of methods
itself: `createData`, `destroyData`, etc.  So this type that isn’t directly
accessible is documented under `can-fixture`’s _types_.  It’s also
specified as the return value of [can-fixture.store can-fixture.store].

### Functions, Properties, and Typedef content

Each function, property, and typedef page will have one or more signature’s describing
what is being documented.

Signatures are the __what__ and the __how__.  They should be precise on the
behavior of what is being documented.

Some function, property, and typedef pages have __#Use__ sections that give
more information and examples on what is being documented.

> Look to Functions, Properties, and Typedef pages to provide low-level details on
> a specific piece of CanJS’s API.


## How to find what you’re looking for…

1. Get a good understand of the purpose behind each module.  
2. Start with core modules.
3. Then check out infrastructure modules.

If you don’t find what you want on the lowest level, walk up to the parent module, it
might be in its __#Use__ section.  

If not, let us know!
