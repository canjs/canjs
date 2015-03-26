@page migrating Migrating to 2.0
@parent guides 7

@body

CanJS 2.0 introduces many new features like:

 - [2 way bindings](../docs/can.view.bindings.can-value.html)
 - custom elements with [can.Component](../docs/can.Component.html)
 - [mustache event bindings](../docs/can.Component.html)

and many new API changes.  But it still remains very backwards compatible with
CanJS 1.1.  This document covers the breaking changes in 2.0 and the deprecated 1.1 features
that are currently supported, but will be removed in 2.1.

## Breaking Changes

These changes require code modifications to use 2.0.

### can.route.ready()

It is now necessary to always call [can.route.ready](../docs/can.route.html) once
all routes have been set up. If you previously didn't
use `can.route.ready()`, just add it on document ready like:

```
$(function(){
  can.route.ready()
})
```

### can.Observe.List.Observe is now can.Observe.List.Map

Although it was an undocumented feature, you could
provide a static `Observe` property on lists to
specify what type of Observe instance should be created
when items are added to the list.  For example:

```
MyTasks = can.Observe.List({
  Observe: Task
},{})

var tasks = new MyTasks();
tasks.push({});
tasks.attr(0) instanceof Task //-> true
```

You should change the static Observe property to
`Map` like:

```
MyTasks = can.Observe.List({
  Map: Task
},{})
```

In fact, this code should look like:

```
MyTasks = can.List.extend({
  Map: Task
})
```

### can.EJS is no longer in core

can.EJS is no longer packaged in the core download by default. It has
been replaced by can.mustache. You
can use the custom download builder to replace can.mustache with
can.EJS.

### can.Observe names and locations

Plugins like ___can.observe.attrbibutes.js___ are now like
___can.map.attributes.js___.  If you are using steal or requirejs to
load these, you will have to change paths.  In our projects we
replaced `/observe/` with `/map/`.  

Note that `can/observe.js` (requirejs) and `can/observe/observe.js`
still exist.  Loading these files loads `can.Map`, `can.List` and
`can.compute` and aliases them to the old `can.Observe` and
`can.Observe.List`.

## Deprecated Changes

These are changes that you should strongly consider making to be able to upgrade
to 2.1 and beyond:

### can.Observe and can.Observe.List becomes can.Map and can.List

In order to comply with the ECMAScript 6 terminology `can.Observe` has
been renamed to `can.Map` and `can.Observe.List` is now
called `can.List`. Backwards compatible mappings
to `can.Observe` and `can.Observe.List` are in place
but are deprecated.

### Use .extend for extending Constructs

Extending `can.Construct`s without calling `.extend` is
deprecated.  For example, instead of:

```
Todo = can.Construct(static, proto)
MyWidget = can.Control(static, proto)
Task = can.Model(static, proto)
```

do:

```
Todo = can.Construct.extend(static, proto)
MyWidget = can.Control.extend(static, proto)
Task = can.Model.extend(static, proto)
```

### can.Observe.startBatch and can.Observe.stopBatch becomes can.batch.start and can.batch.stop

`can.Observe.startBatch`
and `can.Observe.stopBatch` are now available as [can.batch.start](../docs/can.batch.start.html)
and [can.batch.stop](../docs/can.batch.stop.html). Backwards compatible mappings are in place.
