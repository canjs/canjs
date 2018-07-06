@page guides/routing Routing
@parent guides/essentials 3
@outline 2

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
</style>

CanJS's pattern is that you define application logic in one or
more observables, then connect the observables to
various browser APIs.  For example, you can connect the `myCounter` observable from
the [Key-Value Observables](#Key_ValueObservables) section to `window.location` with:

```js
import route from "can-route";

route.data = myCounter;
route.start();
```

This will add `#!&count=0` to the [location](https://developer.mozilla.org/en-US/docs/Web/API/Location) hash.  

Now, if you called `increment()` on my counter, the `window.location` would
change to `#!count=1`. If you hit the back-button, `myCounter.count` would be
back to `0`:

```js
myCounter.increment()
window.location.hash  //-> "#!&count=1"

history.back()
myCounter.count       //-> 0
window.location.hash  //-> "#!&count=0"
```

@demo demos/technology-overview/route-counter.html

[can-route] is used to setup a bi-directional relationship with an observable and
the browser's location.

<img src="../../docs/can-guides/experiment/technology/observable-routing.png"
  alt=""
  class='bit-docs-screenshot'/>

By default, `can-route` serializes the observable's data with [can-param],
so that the following observable data produces the following url hashes:

```js
{foo: "bar"}          //-> "#!&foo=bar"
{foo: ["bar", "baz"]} //-> "#!&foo[]=bar&foo[]=baz"
{foo: {bar: "baz"}}   //-> "#!&foo[bar]=baz"
{foo: "bar & baz"}    //-> "#!&foo=bar+%26+baz"
```

> __NOTE 1:__ This guide uses hash-based routing instead of pushstate because hash-based routing
is easier to setup. Pushstate routing requires server-support. Use [can-route-pushstate] for pushstate-based applications. The use of [can-route-pushstate] is almost identical to [can-route].

> __NOTE 2:__ [can-route] uses hash-bangs (`#!`) to comply with a now-deprecated
> [Google SEO](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started)
> recommendation.

You can register routes that controls the relationship between the
observable and the browser's location. The following registers
a translation between URLs and route properties:

```js
route.register("{count}")
```

This results in the following translation between observable data and url hashes:

```js
{count: 0}                  //-> "#!0"
{count: 1}                  //-> "#!1"
{count: 1, type: "counter"} //-> "#!1&type=counter"
```

You can add data when the url is matched.  The following registers
data for when the URL is matched:

```js
route.register("products", {page: "products"});
route.register("products/{id}", {page: "products"})
```

This results in the following translation between observable data and url hashes:

```js
{page: "products"}          //-> "#!products"
{page: "products", id: 4}   //-> "#!products/4"
```

Registering the empty route (`""`) provides initial state for the
application. The following makes sure the count starts at 0 when the hash is empty:

```js
route.register("",{count: 0});
```

@demo demos/technology-overview/route-counter-registered.html


### Routing and the root component

Understanding how to use [can-route] within an application comprised of [can-component]s
and their [can-stache] views and observable view-models can be tricky.  

We'll use the following example to help make sense of it:

@demo demos/technology-overview/route-mini-app.html

This example shows the `<page-login>` component until someone has logged in.  Once they have
done that, it shows a particular component based upon the hash. If the hash is empty (`""` or `"#!"`),
the `<page-home>` component is shown.  If the hash is like `tasks/{taskId}` it will show the `<task-editor>` component we created previously. (_NOTE: We will show how to persist changes
to todos in a upcoming service layer section._)

The switching between different components is managed by a `<my-app>` component. The topology of
the application looks like:

<img src="../../docs/can-guides/experiment/technology/routing-app-overview.png"
  alt="The my-app component on top. The page-home, page-login, task-editor nodes are children of my-app. percent-slider component is a child of task-editor."
  class='bit-docs-screenshot'/>  

In most applications, [can-route] is connected to the top-level component's
[can-component.prototype.ViewModel]. We are going to go through the process of
building `<my-app>` and connecting it
to [can-route]. This is usually done in four steps:

1. Connect the top-level component's view-model to the routing [can-route.data].
2. Have the top-level component's [can-component.prototype.view] display the right sub-components based on the view-model state.
3. Define the top-level component's view-model (sometimes called _application view-model_).
4. Register routes that translate between the URL and the application view-model.

### Connect a component's view-model to can-route

To connect a component's view-model to can-route, we first need to create a basic
component. The following creates a `<my-app>` component that displays its `page` property and
includes links that will change the page property:

```js
import Component from "can-component";
import stache from "can-stache";
import DefineMap from "can-define/map/map";
import route from "can-route";
import "can-stache-route-helpers";

Component.extend({
    tag: "my-app",
    view: stache(`
        The current page is {{page}}.
        <a href="{{ routeURL(page='home') }}">Home</a>
        <a href="{{ routeURL(page='tasks') }}">Tasks</a>
    `),
    ViewModel: {
        page: "string"
    }
})
```

> __NOTE:__ Your html needs a `<my-app></my-app>` element to be able to see the
> component's content.  It should say "The current page is .".

To connect the component's VM to the url, we:

- set [can-route.data] to the custom element.
- call and [can-route.start] to begin sending url values to the component.

```js
route.data = document.querySelector("my-app");
route.start();
```

At this point, changes in the URL will cause changes in the `page`
property. See this by clicking the links and the back/refresh buttons below:

@demo demos/technology-overview/route-mini-app-start.html

### Display the right sub-components

When building components, we suggest designing the [can-component.prototype.view]
before the [can-component.prototype.ViewModel].  This helps you figure out what logic
the [can-component.prototype.ViewModel] needs to provide an easily understood
[can-component.prototype.view].

We'll use [can-stache.helpers.switch] to switch between different components
based on a `componentToShow` property on the view-model. The result looks like the following:

```js
Component.extend({
    tag: "my-app",
    view: stache(`
        {{#switch(componentToShow)}}
            {{#case("home")}}
                <page-home isLoggedIn:from="isLoggedIn" logout:from="logout"/>
            {{/case}}
            {{#case("tasks")}}
                <task-editor id:from="taskId" logout:from="logout"/>
            {{/case}}
            {{#case("login")}}
                <page-login isLoggedIn:bind="isLoggedIn" />
            {{/case}}
            {{#default}}
                <h2>Page Missing</h2>
            {{/default}}
        {{/switch}}
    `),
    ...
})
```

Notice that the view-model will need the following properties:

- __isLoggedIn__ - If the user is logged in.
- __logout__ - A function that when called logs the user out.
- __taskId__ - A taskId in the hash.

We will implement these properties and `componentToShow` in the
[can-component.prototype.ViewModel].

### Define the view-model

Now that we've designed the _view_ it's time to code the observable view-model
with the logic to make the view behave correctly. We implement the
`ViewModel` as follows:

```js
Component.extend({
    tag: "my-app",
    ...
    ViewModel: {
        // Properties that come from the url
        page: "string",
        taskId: "string",

        // A property if the user has logged in.
        // `serialize: false` keeps `isLoggedIn` from
        // affecting the `url` and vice-versa.
        isLoggedIn: {
            default: false,
            type: "boolean",
            serialize: false
        },

        // We show the login page if someone
        // isn't logged in, otherwise, we
        // show what the url points to.
        get componentToShow(){
            if(!this.isLoggedIn) {
                return "login";
            }
            return this.page;
        },

        // A function we pass to sub-components
        // so they can log out.
        logout() {
            this.isLoggedIn = false;
        }
    }
});
```

> NOTE: The [can-define.types.serialize] property behavior controls the
> [can-define/map/map.prototype.serialize serializable] properties of
> a [can-define/map/map DefineMap]. Only
> serializable properties of the map are used by [can-route] to
> update the url. `serialize: false` keeps `isLoggedIn` from
> affecting the `url` and vice-versa. Getters like `componentToShow`
> are automatically configured with `serialize: false`.


Finally, our component works, but the urls aren't easy to
remember (ex: `#!&page=home`). We will clean that up in the
next section.


### Register routes

Currently, after the user logs in, the application will show `<h2>Page Missing</h2>` because if the url hash is empty, `page` property will be undefined. To have `page`
be `"home"`, one would have to navigate to `"#!&page=home"` ... yuck!  

We want the `page` property to be `"home"` when the hash is empty.  Furthermore,
we want urls like `#!tasks` to set the `page` property.  We can do that
by registering the following route:

```js
route.register("{page}", {page: "home"});
```

Finally, we want `#!tasks/5` to set `page` to `"tasks"` and `taskId`
to `"5"`.  Registering the following route does that:

```js
route.register("tasks/{taskId}", {page: "tasks"});
```

Now the mini application is able to translate changes in the url to
properties on the component's view-model.  When the component's view-model
changes, the view updates the page.
