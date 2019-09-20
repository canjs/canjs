@page guides/routing Routing
@parent guides/topics 3
@outline 2

@description Learn how to make your application respond to changes in the URL and
work with the browser’s back and forward buttons.

@body

<style>
table.panels .background td {
  background: #f4f4f4;
  padding: 5px 5px 5px 5px;
  border: solid 1px white;
  margin: 1px;
  vertical-align: top;
}
table.panels pre {
  margin-top: 0px;
}
.obs {
  color: #800020;
}
</style>

## Overview

> __NOTE__ This guide uses hash-based routing instead of pushstate because hash-based routing
is easier to setup. Pushstate routing requires server-support. Use [can-route-pushstate] for pushstate-based applications. The use of [can-route-pushstate] is almost identical to [can-route].

[can-route] is used to setup a bi-directional relationship with an <span class="obs">observable</span> and
the browser’s [location](https://developer.mozilla.org/en-US/docs/Web/API/Location) (the _URL_).

<img 
  alt=""
  class="bit-docs-screenshot"
  src="../../docs/can-guides/experiment/technology/observable-routing.png" />

When the <span class="obs">observable</span> changes, the _URL_ will be updated. When the _URL_ changes
the <span class="obs">observable</span> will be updated.

The following example uses [can-route] to cross-bind the _URL_ to an <span class="obs">observable</span>’s state. To
see the cross-binding in action, try:

1. Changing the _URL_’s _hash_ to `#!&page=products`. Notice the observable state updates.
2. Change the <span class="obs">observable</span>’s state to:
   ```js
   {
    "page": "products",
    "id": "foosball"
   }
   ```
   Notice the _URL_ updates.

3. Click the back button (`⇦`). Notice the observable state updates.

<p class="codepen" data-height="388" data-theme-id="0" data-default-tab="html,result" data-user="bitovi" data-slug-hash="wvwQzGZ" style="height: 388px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="CanJS 6 - routing two-way binding">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/wvwQzGZ/">
  CanJS 6 - routing two-way binding</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

The binding between the _URL_ and the observable is set by setting [can-route.data route.data] and
calling [can-route.start route.start()] as follows:

```html
<mock-url></mock-url>
<p>observable’s state:</p>
<bit-json-editor></bit-json-editor>
<script src="//unpkg.com/mock-url@^6.0.0" type="module"></script>
<script src="//unpkg.com/bit-json-editor@^6.0.0" type="module"></script>

<script type="module">
import { ObservableObject, route } from "//unpkg.com/can@6/core.mjs";

var observable = new ObservableObject();

route.data = observable;
route.start();

// Set up the json editor to edit the observable.
document.querySelector("bit-json-editor").data = observable;
</script>

<style>
bit-json-editor {
  height: 200px;
}
</style>
```
@highlight 12-13
@codepen

<br>


Often, the observable is an instance of a custom type. For example, you can connect the `myCounter` observable from
the [guides/technology-overview#Key_ValueObservables Technology Overview’s Key-Value Observables section] to `window.location` with:

```html
<mock-url></mock-url>

<script type="module">
  // Imports the <mock-url> element that provides
  // a fake back, forward, and URL controls.
  import "//unpkg.com/mock-url@^6.0.0";

  import { route, ObservableObject } from "can";

  class Counter extends ObservableObject {
    static props = {
      count: 0
    };
    increment() {
      this.count += 1;
    }
  }

  window.myCounter = new Counter();

  route.data = myCounter;
  route.start();
</script>
```
@highlight 21-22
@codepen

This will add `#!&count=0` to the [location](https://developer.mozilla.org/en-US/docs/Web/API/Location) hash.

```js
myCounter.increment()
window.location.hash  //-> "#!&count=1"

history.back()
myCounter.count       //-> 0
window.location.hash  //-> "#!&count=0"
```

Now, if you called `myCounter.increment()` in the console, the `window.location` will
change to `#!count=1`. If you hit the back-button, `myCounter.count` would be
back to `0`:

@demo demos/technology-overview/route-counter.html
@codepen

By default, `can-route` serializes the observable’s data with [can-param],
so that the following observable data produces the following URL hashes:

```js
{ foo: "bar" }          //-> "#!&foo=bar"
{ foo: [ "bar", "baz" ] } //-> "#!&foo[]=bar&foo[]=baz"
{ foo: { bar: "baz" } }   //-> "#!&foo[bar]=baz"
{ foo: "bar & baz" }    //-> "#!&foo=bar+%26+baz"
```

> __NOTE__ [can-route] uses hash-bangs (`#!`) to comply with a now-deprecated
> [Google SEO](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started)
> recommendation.

You can register routes that control the relationship between the
observable and the browser’s location. The following registers
a translation between URLs and route properties:

```js
route.register("{count}")
```

This results in the following translation between observable data and URL hashes:

```js
{ count: 0 }                  //-> "#!0"
{ count: 1 }                  //-> "#!1"
{ count: 1, type: "counter" } //-> "#!1&type=counter"
```

You can add data when the URL is matched. The following registers
data for when the URL is matched:

```js
route.register("products", { page: "products" });
route.register("products/{id}", { page: "products" })
```

This results in the following translation between observable data and URL hashes:

```js
{ page: "products" }          //-> "#!products"
{ page: "products", id: 4 }   //-> "#!products/4"
```

Registering the empty route (`""`) provides initial state for the
application. The following makes sure the count starts at 0 when the hash is empty:

```js
route.register("", { count: 0 });
```

@demo demos/technology-overview/route-counter-registered.html
@codepen

## Routing and the root component

Understanding how to use [can-route] within an application comprised of [can-stache-element]s
and their [can-stache] views and [can-observable-object observable] properties can be tricky.

We’ll use the following example to help make sense of it:

@demo demos/technology-overview/route-mini-app.html
@codepen

This example shows the `<page-login>` component until someone has logged in. Once they have
done that, it shows a particular component based upon the hash. If the hash is empty (`""` or `"#!"`),
the `<page-home>` component is shown. If the hash is like `tasks/{taskId}` it will show the `<task-editor>` component we created previously. (_NOTE: We will show how to persist changes
to tasks in a upcoming service layer section._)

Switching between different components is managed by a `<my-app>` component. The topology of
the application looks like:

<img
  src="../../docs/can-guides/experiment/technology/routing-app-overview.png"
  alt="The my-app component on top. The page-home, page-login, task-editor nodes are children of my-app. percent-slider component is a child of task-editor."
  class="bit-docs-screenshot"  
/>

In most applications, [can-route] is connected to a property on the top-level component. We are
going to go through the process of building `<my-app>` and connecting it to [can-route]. This is
usually done in five steps:

1. Define the top-level component's [can-stache-element/static.props].
2. Create an observable key-value object on the component to represent the state of [can-route].
3. Connect this observable to the routing [can-route.data].
4. Have the top-level component’s [can-stache-element/static.view] display the current sub-components based on its state.
5. Register routes that translate between the URL and the application state.

## Connect a component to can-route

To connect a component to can-route, we first need to create a basic component. The
following creates a `<my-app>` component that includes links that will change the
route’s page property:

```js
import { StacheElement, stacheRouteHelpers } from "can";

class MyApp extends StacheElement {
  static view = `
    The current page is .
    <a href="{{ routeUrl(page='home') }}">Home</a>
    <a href="{{ routeUrl(page='tasks') }}">Tasks</a>
  `;

  static props = {};
}

customElements.define("my-app", MyApp);
```

> __NOTE:__ Your html needs a `<my-app></my-app>` element to be able to see the
> component’s content. It should say "The current page is .".

To connect the component to the url, we:

- add a property to the component `props` object to hold the [can-route.data route.data] key-value observable.
- call [can-route.start route.start] to bind the observable key-value object to the URL.

We also display the `routeData.page` property.

```js
import { route, StacheElement, stacheRouteHelpers } from "can";

class MyApp extends StacheElement {
  static view = `
    The current page is {{ this.routeData.page }}.
    <a href="{{ routeUrl(page='home') }}">Home</a>
    <a href="{{ routeUrl(page='tasks') }}">Tasks</a>
  `;

  static props = {
    routeData: {
      get default() {
        route.start();
        return route.data;
      }
    }
  };
}

customElements.define("my-app", MyApp);
```
@highlight 1,5,11-16

At this point, changes in the URL will cause changes in the `routeData.page`
property. See this by clicking the links and the back/refresh buttons below:

@demo demos/technology-overview/route-mini-app-start.html
@codepen

## Display the right sub-components

Programmatically instatiated components can be used to create an instance of the
component that should be displayed for each route. We’ll use an [can-stache.tags.escaped] 
to display a `componentToShow` property that we will implement in the component [can-stache-element/static.props props]:

```js
import { route, StacheElement, stacheRouteHelpers } from "can";

class MyApp extends StacheElement {
  static view: `
    {{ this.componentToShow }}
  `;

  static props = {
    routeData: {
      get default() {
        route.start();
        return route.data;
      }
    }
  };
}

customElements.define("my-app", MyApp);
```
@highlight 5,only

The `componentToShow` getter will return an instance of the component that should be shown.

The first step toward making this possible is to import the constructors for each [can-stache-element]:

```js
import { route, StacheElement, stacheRouteHelpers } from "can";
import { PageHome, PageLogin, TaskEditor } from "can/demos/technology-overview/route-mini-app-components";

class MyApp extends StacheElement {
  static view: `
    {{ this.componentToShow }}
  `;

  static props = {
    routeData: {
      get default() {
        route.start();
        return route.data;
      }
    }
  };
}

customElements.define("my-app", MyApp);
```
@highlight 2,only

Once the component constructors are imported, they can be used to create an instance of the correct component in the `componentToShow` getter:

```js
import { route, StacheElement, stacheRouteHelpers } from "can";
import { PageHome, PageLogin, TaskEditor } from "can/demos/technology-overview/route-mini-app-components";

class MyApp extends StacheElement {
  static view = `
    {{ this.componentToShow }}
  `;

  static props = {
    routeData: {
      get default() {
        route.start();
        return route.data;
      }
    },

    get componentToShow() {
      if (!this.isLoggedIn) {
        return new PageLogin();
      }

      switch(this.page) {
        case "home":
          return new PageHome();
        case "tasks":
          return new TaskEditor();
        default:
          const page404 = document.createElement("h2");
          page404.innerHTML = "Page Missing";
          return page404;
      }
    }
  };
}

customElements.define("my-app", MyApp);
```
@highlight 17-32,only

## Pass data to sub-components

Now the correct components will be displayed; however, the application will not be fully functional yet because these components do not have the state values they need in order to function correctly. [can-value] can be used to set up one-way and two-way bindings between the root component and each sub-component.

The Login page needs a property `isLoggedIn` that represents whether the user is logged in. Since the login page handles logging in, it will need to be able to update this value, so we use [can-value.bind value.bind] to two-way bind this property.

To hook this up, we implement the `isLoggedIn` property on the `my-app` component and pass it to the
`Login` page through `can-stache-element` [can-stache-element/lifecycle-methods.bindings bindings]:

```js
import { route, StacheElement, stacheRouteHelpers, value } from "can";
import { PageHome, PageLogin, TaskEditor } from "can/demos/technology-overview/route-mini-app-components";
import "can/demos/technology-overview/mock-url";

class MyApp extends StacheElement {
  static view = `
    {{ this.componentToShow }}
  `;

  static props = {
    routeData: {
      get default() {
        route.start();
        return route.data;
      }
    },

    get componentToShow() {
      if (!this.isLoggedIn) {
        return new PageLogin().bindings({
          isLoggedIn: value.bind(this, "isLoggedIn")
        });
      }

      switch (this.routeData.page) {
        case "home":
          return new PageHome();
        case "tasks":
          return new TaskEditor();
        default:
          const page404 = document.createElement("h2");
          page404.innerHTML = "Page Missing";
          return page404;
      }
    },

    isLoggedIn: false
  };
}

customElements.define("my-app", MyApp);
```
@highlight 1,20-22,37,only

The `TaskEditor` page also needs to know the id of the task that is being edited. This property can be bound directly to the `routeData` object:

```js
import { route, StacheElement, stacheRouteHelpers, value } from "can";
import { PageHome, PageLogin, TaskEditor } from "can/demos/technology-overview/route-mini-app-components";
import "can/demos/technology-overview/mock-url";

class MyApp extends StacheElement {
  static view = `
    {{ this.componentToShow }}
  `;

  static props = {
    routeData: {
      get default() {
        route.start();
        return route.data;
      }
    },

    get componentToShow() {
      if (!this.isLoggedIn) {
        return new PageLogin().bindings({
          isLoggedIn: value.bind(this, "isLoggedIn")
        });
      }

      switch (this.routeData.page) {
        case "home":
          return new PageHome();
        case "tasks":
          return new TaskEditor().bindings({
            id: value.bind(this.routeData, "taskId")
          });
        default:
          const page404 = document.createElement("h2");
          page404.innerHTML = "Page Missing";
          return page404;
      }
    },

    isLoggedIn: false
  };
}

customElements.define("my-app", MyApp);
```
@highlight 29-31,only

Lastly, a `logout` function needs to be passed to the `PageHome` and `TaskEditor` components. Since this is a function and is not observable, it can be passed directly to these components without using [can-value].

> **Note:** make sure to use [Function.prototype.bind()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) so that the `this` will correctly be the element, even when called from a child component.

```js
import { route, StacheElement, stacheRouteHelpers, value } from "can";
import { PageHome, PageLogin, TaskEditor } from "can/demos/technology-overview/route-mini-app-components";
import "can/demos/technology-overview/mock-url";

class MyApp extends StacheElement {
  static view = `
    {{ this.componentToShow }}
  `;

  static props = {
    routeData: {
      get default() {
        route.start();
        return route.data;
      }
    },

    get componentToShow() {
      if (!this.isLoggedIn) {
        return new PageLogin().bindings({
          isLoggedIn: value.bind(this, "isLoggedIn")
        });
      }

      switch (this.routeData.page) {
        case "home":
          return new PageHome().bindings({
            logout: this.logout.bind(this)
          });
        case "tasks":
          return new TaskEditor().bindings({
            id: value.bind(this.routeData, "taskId"),
            logout: this.logout.bind(this)
          });
        default:
          const page404 = document.createElement("h2");
          page404.innerHTML = "Page Missing";
          return page404;
      }
    },

    isLoggedIn: false
  };

  logout() {
    this.isLoggedIn = false;
  }
}

customElements.define("my-app", MyApp);
```
@highlight 27-29,33,45-47,only

## Register routes

Currently, after the user logs in, the application will show `<h2>Page Missing</h2>` because if the URL hash is empty, `page` property will be undefined. To have `page`
be `"home"`, one would have to navigate to `"#!&page=home"` … yuck!

We want the `page` property to be `"home"` when the hash is empty. Furthermore,
we want URLs like `#!tasks` to set the `page` property. We can do that
by registering the following route:

```js
route.register("{page}", { page: "home" });
```

Finally, we want `#!tasks/5` to set `page` to `"tasks"` and `taskId`
to `"5"`. Registering the following route does that:

```js
route.register("tasks/{taskId}", { page: "tasks" });
```

Register these routes just before calling `route.start`:

```js
import { route, StacheElement, stacheRouteHelpers, value } from "can";
import { PageHome, PageLogin, TaskEditor } from "can/demos/technology-overview/route-mini-app-components";
import "can/demos/technology-overview/mock-url";

class MyApp extends StacheElement {
  static view = `
    {{ this.componentToShow }}
  `;

  static props = {
    routeData: {
      get default() {
        route.register("{page}", { page: "home" });
        route.register("tasks/{taskId}", { page: "tasks" });
        route.start();
        return route.data;
      }
    },

    get componentToShow() {
      if (!this.isLoggedIn) {
        return new PageLogin().bindings({
          isLoggedIn: value.bind(this, "isLoggedIn")
        });
      }

      switch (this.routeData.page) {
        case "home":
          return new PageHome();
        case "tasks":
          return new TaskEditor().bindings({
            id: value.bind(this.routeData, "taskId"),
            logout: this.logout.bind(this)
          });
        default:
          const page404 = document.createElement("h2");
          page404.innerHTML = "Page Missing";
          return page404;
      }
    },

    isLoggedIn: false
  };

  logout() {
    this.isLoggedIn = false;
  }
}

customElements.define("my-app", MyApp);
```
@highlight 13-14,only

Now the mini application is able to translate changes in the URL to
properties on the `routeData` property of the component. When the component’s 
property changes, the view updates the page.

@demo demos/technology-overview/route-mini-app.html
@codepen

## Progressively load the sub-components

Progressive loading is a technique that allows the application to only load the code for the each route when the route is displayed. This prevents loading code for pages the user may never visit.

When using progressive loading, the code for each route will be imported using a [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports) instead of the static `import { Page... } from "...components"` syntax.

> **Note:** dynamic imports may not be natively supported in every browser, but similar functionality is available in [StealJS](https://stealjs.com/docs/steal.import.html) and [webpack](https://webpack.js.org/api/module-methods/#import-).

Dynamic imports return a promise that will resolve once the code is loaded, so the `componentToShow` property will become a promise. The [can-reflect-promise] package makes it easy to use promises directly in [can-stache]. The view can be updated to display the `value` of the promise once it is resolved:

```js
import { route, StacheElement, stacheRouteHelpers, value } from "can";
import "can/demos/technology-overview/mock-url";

class MyApp extends StacheElement {
  static view = `
    {{# if(this.componentToShow.isResolved) }}
      {{ this.componentToShow.value }}
    {{/ if }}
  `;

  static props = {
    routeData: {
      get default() {
        route.register("{page}", { page: "home" });
        route.register("tasks/{taskId}", { page: "tasks" });
        route.start();
        return route.data;
      }
    },

    get componentToShow() {
      if (!this.isLoggedIn) {
        return new PageLogin().bindings({
          isLoggedIn: value.bind(this, "isLoggedIn")
        });
      }

      switch (this.routeData.page) {
        case "home":
          return new PageHome().bindings({
            logout: this.logout.bind(this)
          });
        case "tasks":
          return new TaskEditor().bindings({
            id: value.bind(this.routeData, "taskId"),
            logout: this.logout.bind(this)
          });
        default:
          const page404 = document.createElement("h2");
          page404.innerHTML = "Page Missing";
          return page404;
      }
    },

    isLoggedIn: false
  };

  logout() {
    this.isLoggedIn = false;
  }
}

customElements.define("my-app", MyApp);
```
@highlight 6-8,only

> Note, [can-reflect-promise] also adds `isPending` and `isRejected` properties to promises so that the view can handle these states as well.

Then update the `componentToShow` getter to import the correct module. The value passed to the promise’s [then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) method will be a module object with a property for each of the module’s exports. In this example, the component constructor is the default export, so an instance of the component can be created using `new module.default({ /* ... */ })`. Returning the instances from the `then` method will set `componentToShow.value` to the component instance:

```js
import { route, StacheElement, stacheRouteHelpers, value } from "can";
import "can/demos/technology-overview/mock-url";

class MyApp extends StacheElement {
  static view = `
    {{# if(this.componentToShow.isResolved) }}
      {{ this.componentToShow.value }}
    {{/ if }}
  `;

  static props = {
    routeData: {
      get default() {
        route.register("{page}", { page: "home" });
        route.register("tasks/{taskId}", { page: "tasks" });
        route.start();
        return route.data;
      }
    },

    get componentToShow() {
      if (!this.isLoggedIn) {
        return import("can/demos/technology-overview/page-login").then(
          module => {
            return new module.default().bindings({
              isLoggedIn: value.bind(this, "isLoggedIn")
            });
          }
        );
      }

      return import(
        `can/demos/technology-overview/page-${this.routeData.page}`
      ).then(module => {
        switch (this.routeData.page) {
          case "home":
            return new module.default().bindings({
              logout: this.logout.bind(this)
            });
          case "tasks":
            return new module.default().bindings({
              id: value.from(this.routeData, "taskId"),
              logout: this.logout.bind(this)
            });
          default:
            const page404 = document.createElement("h2");
            page404.innerHTML = "Page Missing";
            return page404;
        }
      });
    },

    isLoggedIn: false
  };

  logout() {
    this.isLoggedIn = false;
  }
}

customElements.define("my-app", MyApp);
```
@highlight 23-25,29,32-34,37,41,50,only

The application is now progressively loading the code for each route:
@demo demos/technology-overview/route-mini-app-progressive.html
@codepen

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
