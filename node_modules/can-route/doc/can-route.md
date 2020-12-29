@module {Object} can-route can-route
@group can-route.static 0 static
@group can-route.deprecated 1 deprecated
@download can/route
@test can-route/test.html
@parent can-routing
@collection can-core
@link ../docco/route/route.html docco
@package ../package.json

@description Manage browser history and client state by synchronizing the `window.location.hash` with an observable. See the [guides/routing Routing] for in depth examples.

@type {Object}

  Exports an object with `can-route`'s methods. The
  following describes the properties and methods on
  the can-route export:

  ```js
  {
      data,     // The bound key-value observable.
      urlData,  // The observable that represents the
                // hash. Defaults to RouteHash.
      register, // Register routes that translate between
                // the url and the bound observable.
      start,    // Begin updating the bound observable with
                // url data and vice versa.
      deparam,  // Given url fragment, return the data for it.
      rule,     // Given url fragment, return the routing rule
      param,    // Given data, return a url fragment.
      url,      // Given data, return a url for it.
      link,     // Given data, return an <a> tag for it.
      isCurrent,  // Given data, return true if the current url matches
                  // the data.
      currentRule // Return the matched rule name.
  }
  ```

@body


## Background information

To support the browser’s back button and bookmarking in a JavaScript
 application, most applications use
the `window.location.hash`.  By
changing the hash (via a link or JavaScript),
one is able to add to the browser’s history
without changing the page.

This provides the basics needed to
create history enabled single-page apps.  However,
`route` addresses several other needs as well, such as:

  - Pretty urls.
  - Keeping routes independent of application code.
  - Listening to specific parts of the history changing.
  - Setup / Teardown of widgets.

## How it works

can-route is a map that represents the
`window.location.hash` as an
object.  For example, if the hash looks like:

    #!type=videos&id=5

the data in can-route looks like:

    { type: 'videos', id: 5 }

can-route keeps the state of the hash in-sync with the [can-route.data] contained within it.

## data

Underlying `can-route` is an observable map: [can-route.data can-route.data]. Depending on what type of map your application uses, this could be a [can-observable-object], a [can-define/map/map], an [can-observe.Object], or maybe even a [can-simple-map].

`can-route` is an observable. Once initialized using [can-route.start `route.start()`], it is going to change, you can respond to those changes. The following example has the my-app component's `routeData` property return `route.data`. It responds to changes in routing in `componentToShow`.

```html
<my-app>
<mock-url>

<script type="module">
import {ObservableObject, StacheElement, route} from "can";
import "//unpkg.com/mock-url@^5";

class PageHome extends StacheElement {
	static view = `
		<h1>Home page</h1>
		<a href="{{ routeUrl(page='other') }}">
			Go to another page
		</a>
	`;
}

customElements.define("page-home", PageHome);

class PageOther extends StacheElement {
	static view = `
		<h1>Other page</h1>
		<a href="{{ routeUrl(page='home') }}">
			Go home
		</a>
	`;
}

customElements.define("page-other", PageOther);

class MyApp extends StacheElement {
	static view = `{{componentToShow}}`;

	static props = {
    routeData: {
      get default() {
        route.data = new ObservableObject();
        route.register("{page}", { page: "home" });
        route.start();
        return route.data;
      }
    },
    get componentToShow() {
      switch(this.routeData.page) {
        case "home":
          return new PageHome();
        case "other":
          return new PageOther();
      }
    }
  };
}

customElements.define("my-app", MyApp);
</script>
```
@codepen

`route.data` defaults to [can-observable-object], but `route.data` can be set to any observable. The following uses [can-define-map]:

```js
import {DefineMap, route} from "can/everything";

const RouteData = DefineMap.extend("RouteData", {
	page: "string"
});

route.data = new RouteData();
route.register( "{page}", { page: "home" } );
route.start();
console.log( route.data.page ) //-> "home"
```
@codepen

Understanding how maps work is essential to understanding `can-route`.

You can listen to changes in a map with `on(eventName, handler(ev, args...))` and change `can-route`’s properties by modifying `route.data`.

### Listening to changes in state

You can listen to changes in the url by listening on the underlying route data.  For example,
your route data and rule might have a page property:

```js
import {ObservableObject, route} from "can";

route.data = new ObservableObject();
route.register( "{page}", {page: "recipes"} );
route.start();

// You can listen when the url changes from `"#!recipes"` to `"#!settings"` with:

route.data.on( "page", ( ev, newVal, oldVal ) => {
  console.log(oldVal); //-> "recipes"
  console.log(newVal); //-> "settings"
} );

route.data.page = "settings";
```
@codepen

### Updating can-route

When using an [can-observable-object ObservableObject] to back can-route, create changes in the route data by modifying it directly:

```js
route.data.page = "images";
```

Or change multiple properties at once like:

```js
route.data.update( { page: "tasks", id: 5 } );
```

When you make changes to can-route, they will automatically
change the <code>hash</code>.

### Encoded `/`

If the change in your route data includes a `/`, the `/` will be encoded into `%2F`.
You will see this result in the URL and `location.hash`.

```html
<mock-url></mock-url>
<script type="module">
import "//unpkg.com/mock-url@^5.0.0";
import {ObservableObject, route} from "can";

route.data = new ObservableObject( {type: "image/bar"} ); // location.hash -> #!&type=image%2Fbar
route.start();
</script>
```
@codepen

## Creating a route

Use [`route.register(url, defaults)`](can-route.register) to create a
routing rule. A rule is a mapping from a url to
an object (that is the route’s data).
In order to map to specific properties in the url,
prepend a colon to the name of the property like:

```html
<mock-url></mock-url>
<script type="module">
import "//unpkg.com/mock-url@^5.0.0";
import {route} from "can";

route.register( "content/{type}" );
route.data.type = "example"; // location.hash -> #!content/example
route.start();
</script>
```
@codepen

If no routes are added, or no route is matched,
can-route’s data is updated with the [can-route.deparam deparam]ed
hash.

```html
<mock-url></mock-url>
<script type="module">
import "//unpkg.com/mock-url@^5.0.0";
import {route} from "can";

location.hash = "#!&type=videos";
route.start();

console.log(route.data); //-> {type : "videos"}
</script>
```
@codepen

Once routes are added and the hash changes,
can-route looks for matching routes and uses them
to update can-route’s data.

```html
<mock-url></mock-url>
<script type="module">
import "//unpkg.com/mock-url@^5.0.0";
import {route} from "can";

route.register( "content/{type}" );
location.hash = "#!content/images";
route.start();

console.log( route.data ) //-> {type : "images"}
route.data.type = "songs"; // location.hash -> "#!content/songs"
</script>
```
@codepen

Default values can be added to a route, this is the second argument passed into [can-route.register]:

```html
<mock-url></mock-url>
<script type="module">
import "//unpkg.com/mock-url@^5.0.0";
import {route} from "can";

route.register( "content/{type}", {type: "videos"} );
location.hash = "#!content/";

route.start();

console.log( route.data ); //-> {type: "videos"}
// location.hash -> "#!content/"
</script>
```
@codepen
@highlight 6

Defaults can also be set on the root page of your app. An empty string (`""`) is treated as the "root" page of the app. If there is no hash, or if using [can-route-pushstate] someone is at `/`:

```html
<mock-url></mock-url>
<script type="module">
import "//unpkg.com/mock-url@^5.0.0";
import {route} from "can";

route.register( "", {page: "index"} );
location.hash = "#!";

route.start()

console.log( route.data ); //-> {page : "index"}
// location.hash -> "#!"
</script>
```
@codepen

## Initializing can-route

After your application has created all of its routes, call [can-route.start]
to set can-route’s data to match the current hash:

```js
route.start();
```

## Changing the route

Typically, you don’t set `location.hash` directly.
Instead, you can change properties on can-route
like:

```js
route.data.type = "videos";
```

This will automatically look up the appropriate
route and update the hash.

Often, you want to create links. [can-stache-route-helpers] provides
the [can-stache-route-helpers.routeUrl] helper to make this
easy:

```html
<a href="{{ routeUrl(type='videos') }}">Videos</a>
```

If `route.data` is an [can-observable-object ObservableObject], then `route.data.assign( { } )` can be used to overwrite (but not delete) properties and `route.data.update( { } )` can be used to overwrite AND delete properties.

If `route.data` is a [can-define/map/map], then [can-define/map/map.prototype.assign route.data.assign( { } )] can be used to overwrite (but not delete) properties and [can-define/map/map.prototype.update route.data.update( { } )] can be used to overwrite AND delete properties.

## Finding the matched route

The matched rule available at [can-route.currentRule `route.currentRule`] and is used to set the `window.location.hash`. The process can-route uses to find the matched rule is:
  1. Find all routes with all of their map properties set
  2. If multiple routes are matched, find the route with the highest number of set properties
  3. If multiple routes are still matched, use the route that was registered first


### Find all routes with all of their map properties set

In order for a route to be matched, all of the map properties it uses must be set. For example, in the following route, `page` and `section` must be set in order for this route to be matched:

```js
import {route} from "can";

route.register( "{page}/{section}" );
route.start();

route.data.page = "contact";
route.data.section = "email";

setTimeout(() => {
  const result = route.currentRule();
  console.log( result ); //-> "{page}/{section}"
}, 100);
```
@codepen

If a route contains default values, these map properties must also be set to match the default value in order for the route to be matched:

```js
import {route} from "can";

route.register( "{page}", { section: "email" } );
route.start();

route.data.page = "contact";
route.data.section = "email";

setTimeout(() => {
  const result = route.currentRule();
  console.log( result ); //-> "{page}"
}, 100);
```
@codepen


### Find the route with the highest number of set properties

If multiple routes have all of their properties set, the route with the highest number of set properties will be used:

```js
import {route} from "can";

route.register( "{page}" );
route.register( "{page}/{section}" );
route.start();

route.data.page = "two";
route.data.section = "a";

setTimeout(() => {
  const result = route.currentRule();
  console.log( result ) //-> "{page}/{section}"
}, 100);
```
@codepen

### Find the route that was registered first

If multiple routes are still matched, the route that was registered first will be matched:

```js
import {route} from "can";

route.register( "", { page: "home" } );
route.register( "{section}" );
route.start();

route.data.page = "home";
route.data.section = "a";

setTimeout(() => {
  const result = route.currentRule();
  console.log(result); //-> ""
}, 100);
```
@codepen
