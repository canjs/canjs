@page canjs CanJS
@dest ../index
@outline 0
@package ../../package.json
@templateRender <% %>
@description

CanJS is a client-side JavaScript framework used to build rich web interfaces. It provides [state-management](./doc/guides/technology-overview.html#Key_ValueObservables ), [templates](./doc/guides/technology-overview.html#ObservablesandHTMLElements ), [custom elements](./doc/guides/technology-overview.html#Components), and a whole bunch more.  

CanJS makes it easy to to do the common stuff, while helping you build the impossible.

@body

<div class="hero-images">
    <img
        class="tortoise"
        srcset="docs/images/home/Home-Tortoise-color.png 1x, docs/images/home/Home-Tortoise-color-x2.png 2x"
        src="docs/images/home/Home-Tortoise-color.png"
        style=""/>
    <img
        class="hare"
        srcset="docs/images/home/Home-Hare-color.png 1x, docs/images/home/Home-Hare-color-x2.png 2x"
        src="docs/images/home/Home-Tortoise-color.png"/>
</div>
<div style="text-align: center; color: gray">Why is our logo a tortoise? Read the short fable <a href="http://read.gov/aesop/025.html">The Hare & the Tortoise</a> by <a href="https://en.wikipedia.org/wiki/Aesop%27s_Fables">Aesop</a> to find out.</div>



## Easy to do the common stuff

CanJS starts with a familiar object-oriented approach to making
custom elements. Let's say you want to create a page that counts clicks like the following: (_click the button_):

<p style="border: 1px solid #ccc; padding: 15px;"><my-counter></my-counter></p>

The code for that <u>entire</u> page looks like this:

```html
<!doctype html>
<html lang="en">

<my-counter></my-counter>

<script type="module">
import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
    tag: "my-counter",
    view: `
        Count: <span>{{this.count}}</span>
        <button on:click="this.increment()">+1</button>
    `,
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count++;
        }
    }
});
</script>
</html>
```

Yes, you do __not__ need a build system to get started with CanJS! Copy the code above into your favorite HTML page or
[play with it in a CodePen](https://codepen.io/justinbmeyer/pen/VdJVbe?editors=1010).

This page has 3 main parts.

_First_, it places the `<my-counter>` custom element (which will be defined later) in the page.

```html
<my-counter></my-counter>
```

_Next_, the page imports [can-component Component] from the CanJS module.  Read [guides/setup]
for alternative ways to load CanJS.

```html
<script type="module">
import { Component } from "//unpkg.com/can@5/core.mjs";
...
</script>
```

_Finally_, the page defines the `<my-counter>` element
by extending [can-component Component] with:

- A [can-component.prototype.tag] for the name of the custom element for which you want to define.
- A [can-component.prototype.view] that provides the HTML content
  of the custom element. The [can-stache] `view` supports live binding, event bindings, and two-way bindings.
- A [can-component.prototype.ViewModel] that defines the methods and stateful properties available to
  the `view`.

```js
Component.extend({
    tag: "my-counter",
    view: `
        Count: <span>{{this.count}}</span>
        <button on:click="this.increment()">+1</button>
    `,
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count++;
        }
    }
});
```

<style>
  my-counter button {margin-left: 15px;}
</style>
<script type="text/steal-module">
const Component = require("can-component");
Component.extend({
    tag: "my-counter",
    view: `
        Count: <span>{{this.count}}</span>
        <button on:click="this.increment()">+1</button>
    `,
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count = this.count + 1;
        }
    }
});
</script>



<style>
.code-slide pre {
    display: inline-block;
}
.code-slide .article pre code {
    display: inline-block;
}
.code-slide div.code-toolbar {
    display: inline-block;
}
.code-slide .line-numbers-rows {
    display: none;
}
.code-slide pre[class*=language-].line-numbers code {
    padding: 0 1em;
}
.titled-list h3 {
    margin-top: 0px;
}
</style>

<br/><br/>
Ready to go? Get started with one of the tutorials below:

<div class="getting-started-icons">
    <div class="titled-list">
        <h3>Learn more</h3>
        <ul>
            <li>
                <a href="doc/guides/technology-overview.html">
                    <div>
                        <img src="docs/images/home/tech-overview.svg">
                    </div>
                    Technology Overview
                </a>
            </li>
        </ul>
    </div>
    <div class="or-separator">
        or
    </div>
    <div class="titled-list">
        <h3>Start from scratch</h3>
        <ul>
            <li>
                <a href="doc/guides/setup.html">
                    <div>
                        <img src="docs/images/home/gear.svg">
                    </div>
                    Setting Up CanJS
                </a>
            </li>
        </ul>
    </div>
    <div class="or-separator">
        or
    </div>
    <div class="titled-list">
        <h3>Build a demo app</h3>
        <ul>
            <li>
                <a href="doc/guides/chat.html" title="Learn how to build a real-time chat app.">
                    <div>
                        <img src="docs/images/home/chat-bubble.svg">
                    </div>
                    Chat Guide
                </a>
            </li>
        </ul>
    </div>
    <div class="clear-both"></div>
</div>


## Build the impossible

For over 10 years, CanJS has been used to build production applications for almost every
use case — from massive online stores, to small mobile apps. To help you build whatever comes your way, CanJS helps you:

- [become an expert quickly](#expert),
- [solve difficult problems](#solve-problems), and
- [maintain your app over years](#maintain).

<h3 id='expert'>Become an expert quickly</h3>

Learning a new framework is hard. Your needs and experiences
don't fit a one-size-fits-all solution. Our long list of guides are
organized in a skill tree as follows, so you _level up_ faster by taking the
guide that meets your needs.

<a href="./doc/guides.html">
<img src="./docs/can-canjs/skill-tree.png" class='bit-docs-screenshot'/>
</a>

We add a new guide every 6 weeks. [Let us know](http://twitter.com/canjs) what you want to learn next!

<h3 id='solve-problems'>Solve difficult problems</h3>

CanJS has been used to build everything so it’s both flexible and has a
wide variety of extensions and plugins that solve all sorts of problems.

__Flexible Programming Styles__

Manage state in the way that fits your needs best. For example,
you can use __imperative__ object oriented programming and scale up
to [can-kefir Functional Reactive Programming with streams].


<div class="code-slide">

```js
// Imperative
DefineMap.extend({
  name: "string",
  nameChangeCount: {default: 0},
  updateName(name){
    this.name = name;
    this.nameChangeCount++;
  }
});




```

```js
// Imperative setter
DefineMap.extend({
  name: {
    set(name) {
      this.nameChangeCount++;
      return name;
    }
  },
  nameChangeCount: {default: 0}
});



```

```js
// Declarative light-weight streams
DefineMap.extend({
    name: "string",
    nameChangeCount: {
        value({listenTo, resolve}) {
            let count = resolve(0);
            listenTo("name", () => {
                resolve(++count);
            });
        }
    }
})
```

```js
// Declarative Kefir streaming properties
DefineMap.extend({
    name: "string",
    nameChangeCount: {
        stream(){
            return this.stream(".name").scan((prev) => {
                return prev+1;
            },0)
        }
    }
})
```

```js
// Solo Kefir streams
const name = Kefir.emitterProperty();

const nameChangeCount = name.scan(function(prev){
    return prev+1;
},0);






```

</div>

__Extensions and Plugins__

CanJS has many extensions and plugins that go beyond
state management and templates:

- [can-route Hashchange] and [can-route-pushstate pushstate] routing
- A [can-connect service & data modeling ] layer that has plugins for:
  - [can-connect/real-time/real-time real-time]
  - [can-connect/data/combine-requests/combine-requests minimizing requests]
  - [can-connect/cache-requests/cache-requests caching] and [fall-through-caching](can-connect/fall-through-cache/fall-through-cache)
  - [can-connect/can/ref/ref relationships]
  - [can-ndjson-stream Streaming NDJSON fetch responses]
- [can-fixture Service simulation]
- [can-define-validate-validatejs Validation]
- [React integration](https://github.com/bitovi/ylem#readme)
- [can-control Memory safe declarative event binding]

There are also extensions to state management:

- [can-observe Proxy-based observables]
- [can-debug debugging tools]

And to views:

- [can-stache-converters Converters that simplify two-way bindings]
- [can-stache-route-helpers Routing helpers for the view]

If you need even more 🔥, check out CanJS’s parent framework,
<a href="http://donejs.com"><img src="https://www.bitovi.com/hubfs/Imported_Blog_Media/donejs-logo-ie.png" style="width: 100px; position: relative; top: 7px;"/></a>,
which adds:

- iOS, Android, and desktop builds
- Server-side rendering (Isomorphic / UniversalJS)
- Progressive loading
- Continuous Integration (Testing)
- Continuous Deployment
- Code generators


__Flexible Pieces__

If you can't find what you need, you can build it! CanJS has all of
its inner workings exposed and documented. Integrating
other technology (like [React](https://github.com/bitovi/ylem#readme) and [can-kefir Kefir] streams)
and non-DOM APIs (like [guides/recipes/cta-bus-map Google Map] and [guides/recipes/canvas-clock Canvas])
straightforward.

Useful low-level APIs:

- [can-reflect] - This is the [Lodash](https://lodash.com/) of CanJS.  It lets you perform operations and
  read information on data.  But unlike Lodash, [can-reflect] is able to work with
  any data type.  For example, you can
  assign all key-values from a [can-define/map/map DefineMap] to a [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map Map]:
  ```js
  const meDefineMap = new DefineMap({name: "Justin"});
  const meMap = canReflect.assign( new Map(), meDefineMap );
  meMap.get("name") //-> "Justin"
  ```
- [can-diff] - Diff objects and arrays.
- [can-dom-events] - Listen to DOM events, including custom events, using event delegation.
- [can-dom-mutate] - MutationObserver polyfill.
- [can-ajax] - jQuery-like XHR helper.
- [can-globals] - Feature detection and storage of environmental globals.
- [can-key-tree] - Tree datatype.
- [can-string] - String helpers.
- [can-local-store] - localStorage database.
- [can-key] - get/set/delete nested properties.

Useful integration APIs:

- [can-symbol] - Decorate objects with symbols to make them work with [can-reflect].
- [can-dom-events] - Create custom events.
- [can-queues] - Schedule tasks to run in a particular order.
- [can-observation-recorder] - Track when observables are read.



<h3 id='maintain'>Maintain your app over years</h3>

CanJS is dedicated to supporting you and your
application long term. As technology progresses and
tastes change, your code evolves too so you aren’t left
maintaining 💩.

<img src="./docs/can-guides/images/introduction/mission-stability-upgrade-new.png">

We've kept folks releasing for __10__ years by:

- Avoiding breaking changes for as long as possible by maintaining CanJS in [independent repositories](./doc/guides/technical.html#IndependentRepositoriesandPackages).
- Experimenting with changes (like [can-observe]) before promoting them as the way to
  build new applications.
- Making the upgrade process as easy as possible with deprecation warnings, [migrate-4 migration guides],
  and [guides/upgrade/using-codemods codemods] (scipts that rewrite your code for you).
- Focusing on what matters to users with a [survey](https://donejs.com/survey.html) every
  six weeks.
- Being supported by [Bitovi](http://bitovi.com), whose bottom line _is_ open source,
  not a side-project.


## Missing Something?

Is there an itch that CanJS doesn’t scratch?  Let us know
on [Slack](https://www.bitovi.com/community/slack) ([#canjs channel](https://bitovi-community.slack.com/messages/CFC22NZ8A))
or the [forums](https://forums.bitovi.com/c/canjs).
We like contributions of all sorts.  Read the [guides/contribute] guide for more details.

## Love Something?

Let us know by giving us a star on [GitHub](https://github.com/canjs/canjs) and following on [Twitter](https://twitter.com/canjs).  If there’s a particular package you like, make sure to star that too. Check out the [guides/contributing/evangelism Evangelism Guide] on
how to help spread the word!
