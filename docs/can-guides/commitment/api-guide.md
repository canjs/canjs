@page guides/api API Guide
@parent guides/commitment 0

@description This page walks through how to use the API docs.  

@body


## Documentation Structure

CanJS's documentation is broken down by pages for:

 - library collections
 - packages and modules and their exports
 - functions, properties, and type definitions (typedefs) related to module exports

For example, [can-define/map/map.prototype.on can-define/map/map.prototype.on] is a
method that listens to changes on an observable map as follows:

```js
var DefineMap = require("can-define/map/map");

var map = new DefineMap({name: "Justin"});

map.on("name", function(ev, newVal, oldValue){ ... })
```

`.on` is a function the `prototype` of the `DefineMap` export of the `can-define/map/map`
module.  The `can-define/map/map` is part of CanJS's [can-core] collection.

So understanding CanJS's API pages are about understanding the relationships between:

- library collections
- packages and modules and their exports
- functions, properties, and type definitions (typedefs) related to module exports

... and what's documented on those pages.  

### Library Collection pages

The API docs are divided in 4 parts:

- [can-core]
- [can-ecosystem]
- [can-infrastructure]
- [can-legacy]

The [can-core] collection contains the documentation for the libraries that
are use most commonly and directly within a CanJS application.  This is where the Model-View-ViewModel
libraries of CanJS are documented.

The [can-ecosystem] collection contains less commonly used libraries or libraries that aren't quite core ready yet.  The most commonly used libraries here are [can-fixture], [can-stache-converters], and [can-jquery].

The [can-infrastructure] collection contains the utility libraries that power the core and ecoystem
collection.  Often, this functionality is used indirectly.  For example, the [can-event] mixin
is used to add `on`, `off`, and `dispatch` methods to [can-define] and [can-compute].  And, [can-util] contains a wide variety of low-level DOM and JavaScript utilities.

Sometimes [can-infrastructure] is used directly.  The most important examples are:

 - [can-event/batch/batch] is used to batch changes for faster performance.
 - [can-util/dom/attr/attr] provides special [can-util/dom/attr/attr.special.focused] and [can-util/dom/attr/attr.special.values] attributes that [can-stache-bindings] can be bound to.
 - [can-util/dom/events/events] provides special [can-util/dom/events/attributes/attributes],
   [can-util/dom/events/inserted/inserted], and [can-util/dom/events/removed/removed] events.
 - [can-view-callbacks] lets you register behavior for custom elements and attributes.

Finally, the [can-legacy] collection.  This is for libraries that are no longer under active
development.  Hopefully, you aren't there very often.

> A collection page acts as an overview and cheat sheet for the modules and functionality
contained within the collection.

## Package and Module Pages

> A package or module documents the functionality of the export and provides an overview of
> all functionality contained within the module or package.

## Functions, Properties, and Typedef pages

- Document what the module exports
- Signatures
- Use section

## How to find what you're looking for ...

- Get a good understand of the purpose behind each module.  
- Start with core modules
- Then checkout infrastructure modules

Likely you'll have a good way to start.  You can hover for descriptions.

If you don't find what you want on the lowest level, walk up to the parent module, it
might be in it's `#Use` section.  

If not, let us know!
