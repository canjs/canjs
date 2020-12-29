@module {RoutePushstate} can-route-pushstate
@parent can-routing
@collection can-core
@package ./package.json
@group can-route-pushstate.prototype prototype

@description An observable that can be used as [can-route]'s [can-route.urlData].

@type {RoutePushstate}

__can-route-pushstate__ exports a `RoutePushstate` constructor function that configure [can-route] to use
[pushstate](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history)
to change the window's [pathname](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.pathname) instead
of the [hash](https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.hash)

@type {Object} The pushstate object comprises several properties that configure the behavior of [can-route] to work with `history.pushstate`.

@body

## Use

__can-route-pushstate__ exports an observable that can be used with [can-route]. To start using can-route-pushstate set the [can-route.urlData] property:

```js
import { route, RoutePushstate } from "can";

route.urlData = new RoutePushstate();
```

### Creating and changing routes

To create routes use [can-route.register] like:

```js
route.urlData = new RoutePushstate();

route.register( "{page}", { page: "homepage" } );
route.register( "contacts/{username}" );
route.register( "books/{genre}/{author}" );

route.start(); // Initializes can-route
```

Do not forget to [can-route.start initialize] can-route after creating all routes, do it by calling `route.start()`.

### Listening changes on matched route

As can-route contains a map that represents `window.location.pathname`, you can bind on it.

To bind to specific attributes on [can-route] you can listen to your viewModel's property changes (`viewModel.on()` if using [can-define/map/map]).

### Using different pathname root

can-route-pushstate has one additional property, [can-route-pushstate.prototype.root], which specifies the part of that pathname that should not change. For example, if we only want to have pathnames within `http://example.com/contacts/`, we can specify a root like:

```js
route.urlData = new RoutePushstate();
route.urlData.root = "/contacts/";
route.register( "{page}" );
route.url( { page: "list" } ); //-> "/contacts/list"
route.url( { foo: "bar" } );   //-> "/contacts/?foo=bar"
```

Now, all routes will start with `"/contacts/"`. The default `route.urlData.root` value is `"/"`.

### Updating the current route

can-route-pushstate also allows changes to the current route state without creating a new history entry. This behavior can be controlled using the `replaceStateOn`, `replaceStateOff`, and `replaceStateOnce` methods.

Enable the behavior by calling `replaceStateOn` with specified route property keys like:

```js
const push = new RoutePushstate();
route.urlData = push;
push.replaceStateOn( "page", "action" );
route.set( "page", "dashboard" ); // Route changes, no new history record
```

To return back to normal, call `replaceStateOff` with the specified route property keys like:

```js
push.replaceStateOff( "action" );
route.set( "action", "remove" ); // Route changes, new history record is created
```

The behavior can be configured to occur only once for a specific property using `replaceStateOnce` like:

```js
push.replaceStateOnce( "page" );
route.set( "page", "dashboard" ); // No new history record
route.set( "page", "search" ); // New history record is created
```


## Planning route structure

Complications can arise if your route structure mimics the folder structure inside your app's public directory.  For example, if you have a folder structure like the one in this url for your admin app...

`/admin/users/list.js`

... using a route of /admin/users on the same page that uses the list.js file will require the use of a trailing slash on all routes and links.  The browser already learned that '/admin/users' is folder.  Because folders were originally denoted by a trailing slash in a url, the browser will correct the url to be '/admin/users/'.  While it is possible to add the trailing slash in routes and listen for them, any link to the page that omits the trailing slash will not trigger the route handler.
