@module {RouteHash} can-route-hash
@parent can-routing
@collection can-infrastructure
@package ./package.json

@description An observable that is cross bound to the window.location.hash.

@type {RouteHash}

The `can-route-hash` package exports a `RouteHash` constructor function.  Instances of
`RouteHash` are two-way bound to the `window.location.hash` once the instances have a listener.

```js
import { RouteHash, Reflect } from "can";

var routeHash = new RouteHash();

window.location.hash = "#!foo";

// You must listen on the routeHash before it
// begins listening for hashchanges
Reflect.onValue( routeHash, function(){});

// changing the hash updates the observable value
window.location.hash = "#!bar";
routeHash.value //-> "bar"

// changing the observable value updates the hash
routeHash.value = "zed";
window.location.hash = "#!zed";
```

As shown above, instances of `RouteHash` support `.value` to get and set values. Also,
instances of `RouteHash` implement the common  `ValueObservable` symbols:

- [can-reflect.getValue] - `canReflect.getValue( routeHash )`
- [can-reflect.setValue] - `canReflect.setValue( routeHash, "foo=bar" )`
- [can-reflect/observe.onValue] - `canReflect.onValue( routeHash, handler(newValue, oldValue) )`
- [can-reflect/observe.offValue] - `canReflect.offValue( routeHash, handler )`


@body


## Use

As `can-route-hash` is the default routing observable used by [can-route], it's typically not
used directly. Instead it's often replaced by [can-route-mock] for testing, or replaces
[can-route-pushstate] when hashchange based routing would be preferable.

If [can-route-pushstate] is being used, but it would be useful to switch to hashchange-based routing, you can
typically map the `can-route-pushstate` package to `can-route-hash`. This is often done with StealJS as follows:

```js
<script>
steal = {
    map: {"can-route-pushstate": "can-route-hash"}
}
</script>
<script src="./node_modules/steal/steal.js" main></script>
```
