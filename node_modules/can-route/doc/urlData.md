@property {ValueObservable} can-route.urlData urlData
@parent can-route.static

Specifies an observable value that represents the URL. Useful for changing
what URL [can-route route] is cross-bound to.

@type {ValueObservable} `urlData` is an observable value that represents the part of the URL cross bound to the [can-route.data] state object.  It can be set to other observable urls like [can-route-pushstate] or [can-route-mock]. It defaults to [can-route-hash].

  The following shows setting `urlData` to another observable.

  ```js
  import {route, RouteMock} from "can/everything";

  // route.data will update routeMock and be updated by changes in
  // routeMock.
  const routeMock = route.urlData = new RouteMock();
  const routeData = route.data;

  // begin binding
  route.start()

  // simulate setting the URL
  routeMock.value = "foo=bar";

  console.log( routeData.foo ); //-> "bar";
  ```
  @codepen

@body

## Creating your own `ValueObservable`

> WARNING: The following is non-normative and may change in a
> future release.  Please let us know if you are trying to create your own
> observable and we will work with you to stabilize the API.

Besides implementing the standard `ValueObservable` symbols:

- [can-reflect.getValue]
- [can-reflect.setValue]
- [can-reflect/observe.onValue]
- [can-reflect/observe.offValue]

The `ValueObservable` should include the following properties:

- `paramsMatcher` - A regular expression used to test if the URL is formatted correctly for [can-route.deparam].
- `querySeparator` - A string that separates when arbitrary key-value pairs begin in the url (Example: `"?"`).
- `root` - A string value used to identify the part of the url where routing begins.  For example, [can-route-hash] defaults to `"#!"`
