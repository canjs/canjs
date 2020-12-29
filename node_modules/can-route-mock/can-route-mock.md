@module {RouteMock} can-route-mock
@parent can-routing
@collection can-ecosystem
@package ./package.json

@description Simulate routing without having to change the URL.

@type {RouteMock}

The `can-route-mock` package exports a `RouteMock` constructor function that
simulates the same behavior as the [can-route-hash RouteHash] constructor function.

```js
import { RouteMock } from "can";

var routeMock = new RouteMock();
routeMock.value //-> ""

routeMock.value = "#foo/bar";

routeMock.value //-> "foo/bar";
```

As shown above, instances of `RouteMock` support `.value` to get and set values. Also,
instances of `RouteMock` implement the common  `ValueObservable` symbols:

- [can-reflect.getValue] - `canReflect.getValue( routeMock )`
- [can-reflect.setValue] - `canReflect.setValue( routeMock, "foo=bar" )`
- [can-reflect/observe.onValue] - `canReflect.onValue( routeMock, handler(newValue, oldValue) )`
- [can-reflect/observe.offValue] - `canReflect.offValue( routeMock, handler )`



@body

## Use

The following sets up a `RouteMock` as [can-route.urlData].  Notice that as the
`routeMock` value changes, so does the `routeData`.

```js
import {route, RouteMock, DefineMap} from "can";

// route.data will update routeMock and be updated by changes in
// routeMock.
var routeMock = route.urlData = new RouteMock();
var routeData = route.data = new DefineMap({},false);

// begin binding
route.start();

// simulate setting the URL
routeMock.value = "foo=bar";

console.log( routeData.foo ) //-> "bar";
```
@codepen
