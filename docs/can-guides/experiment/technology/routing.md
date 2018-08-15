@page guides/routing Routing
@parent guides/essentials 3
@outline 2

@description Learn how to make your application respond to changes in the URL and
work with the browser's back and forward buttons.

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
.obs {color: #800020; font-weight: bold}
</style>

## Overview

> __NOTE__ This guide uses hash-based routing instead of pushstate because hash-based routing
is easier to setup. Pushstate routing requires server-support. Use [can-route-pushstate] for pushstate-based applications. The use of [can-route-pushstate] is almost identical to [can-route].


[can-route] is used to setup a bi-directional relationship with an <span class='obs'>observable</span> and
the browser's [location](https://developer.mozilla.org/en-US/docs/Web/API/Location) (the _URL_).

<img src="../../docs/can-guides/experiment/technology/observable-routing.png"
  alt=""
  class='bit-docs-screenshot'/>

When the <span class='obs'>observable</span> changes, the _URL_ will be updated. When the _URL_ changes
the <span class='obs'>observable</span> will be updated.

The following example uses [can-route] to cross-bind the _URL_ to an <span class='obs'>observable</span>'s state. To
see the cross-binding in action, try:

1. Changing the _URL_'s _hash_ to `#!&page=products`. Notice the observable state updates.
2. Change the <span class='obs'>observable</span>'s state to:
   ```js
   {
    "page": "products",
    "id": "foosball"
   }
   ```
   Notice the _URL_ updates.

3. Click the back button (`⇦`). Notice the observable state updates.

<p data-height="366" data-theme-id="dark" data-slug-hash="QByxyg" data-default-tab="result" data-user="justinbmeyer" data-embed-version="2" data-pen-title="CanJS5 - routing two-way binding" class="codepen">See the Pen <a href="https://codepen.io/justinbmeyer/pen/QByxyg/">CanJS5 - routing two-way binding</a> by Justin Meyer (<a href="https://codepen.io/justinbmeyer">@justinbmeyer</a>) on <a href="https://codepen.io">CodePen</a>.</p>

The binding between the _URL_ and the observable is set by setting [can-route.data route.data] and
calling [can-route.start route.start()] as follows:

```html
<mock-url></mock-url>
<p>observable's state:</p>
<bit-json-editor></bit-json-editor>
<script src="//unpkg.com/mock-url@^5.0.0" type="module"></script>
<script src="//unpkg.com/bit-json-editor@^5.0.0" type="module"></script>

<script type="module">
import {DefineMap, route, viewModel} from "//unpkg.com/can@5/core.mjs";

var observable = new DefineMap();

route.data = observable;
route.start();

// Make the json editor edit the observable.
viewModel(
    document.querySelector("bit-json-editor")
).data = observable;
</script>

<style>
bit-json-editor {
	height: 200px;
}
</style>
```
@highlight 12-13
@codepen

<br/>


Often, the observable is an instance of a custom type. For example, you can connect the `myCounter` observable from
the [guides/technology-overview#Key_ValueObservables Technology Overview's Key-Value Observables section] to `window.location` with:

```html
<mock-url></mock-url>

<script type="module">
// Imports the <mock-url> element that provides
// a fake back, forward, and url controls.
import "//unpkg.com/mock-url@^5.0.0";

import {DefineMap, route} from "can";

const Counter = DefineMap.extend({
    count: {default: 0},
    increment() {
        this.count++;
    }
});

window.myCounter = new Counter();

route.data = myCounter;
route.start();
</script>
```
@highlight 19-20
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



By default, `can-route` serializes the observable's data with [can-param],
so that the following observable data produces the following url hashes:

```js
{foo: "bar"}          //-> "#!&foo=bar"
{foo: ["bar", "baz"]} //-> "#!&foo[]=bar&foo[]=baz"
{foo: {bar: "baz"}}   //-> "#!&foo[bar]=baz"
{foo: "bar & baz"}    //-> "#!&foo=bar+%26+baz"
```



> __NOTE__ [can-route] uses hash-bangs (`#!`) to comply with a now-deprecated
> [Google SEO](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started)
> recommendation.

You can register routes that control the relationship between the
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


## Routing and the root component

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

## Connect a component's view-model to can-route

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

## Display the right sub-components

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

## Define the view-model

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


## Register routes

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


<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
