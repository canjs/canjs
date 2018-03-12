@page canjs CanJS
@dest ../index
@outline 0
@package ../../package.json
@templateRender <% %>
@description CanJS is a client side JavaScript framework that makes it easy to to do the
common stuff, while helping you build the impossible.

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
custom elements. Let's say you want to create a counter widget like the following: (_go ahead and click the button_):

<p style="border: 1px solid #ccc; padding: 15px;"><my-counter></my-counter></p>

You want that widget to show up whenever you add `<my-counter></my-counter>` to the
page.  

All you need to do is import [can-component] and define the `<my-counter>` element
by extending [can-component] with:

- A [can-component.prototype.tag] for the name of the custom element for which you want to define.
- A [can-component.prototype.view] that provides the HTML content
  of the custom element. The [can-stache] `view` supports live binding, event bindings, and two-way bindings.
- A [can-component.prototype.ViewModel] that defines the methods and stateful properties available to
  the `view`.


<style>
  my-counter button {margin-left: 15px;}
</style>
<script type="text/steal-module">
var Component = require("can-component");
Component.extend({
    tag: "my-counter",
    view: `
        Count: <span>{{count}}</span>
        <button on:click='increment()'>+1</button>
    `,
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count = this.count + 1;
        }
    }
});
</script>

```js
import Component from "can-component";

Component.extend({
    tag: "my-counter",
    view: `
        Count: <span>{{count}}</span>
        <button on:click='increment()'>+1</button>
    `,
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count++;
        }
    }
});
```

<div style="text-align: center;"><a href="http://justinbmeyer.jsbin.com/pubiqoc/1/edit?html,js,output">Play with this example in a JS Bin</a></div>

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
Get started with CanJS by following one of the tutorials below:

<div class="getting-started-icons">
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
            <li>
                <a href="doc/guides/todomvc.html" title="Learn how to build the classic TodoMVC app.">
                    <div>
                        <img src="docs/images/home/check-mark.svg">
                    </div>
                    TodoMVC Guide
                </a>
            </li>
            <li>
                <a href="doc/guides/atm.html" title="Learn how to build an Automated Teller Machine app.">
                    <div>
                        <img src="docs/images/home/credit-card.svg">
                    </div>
                    ATM Guide
                </a>
            </li>
        </ul>
    </div>
    <div class="clear-both"></div>
</div>


## Build the impossible

For over 10 years, CanJS has been used to build production applications in almost every
use case - from massive online stores, to small mobile apps. CanJS goes beyond just state
management and templates. To help you build whatever comes your way, CanJS helps you:

- [become an expert quickly](#expert),
- [solve difficult problems](#solve-problems), and
- [maintain your app over years](#maintain).

<h3 id='expert'>Become an expert quickly</h3>

Learning a new framework is hard. Different needs and experiences
don't fit a one-size fits all solution. Our long list of guides are
organized in a skill tree as follows, so you _level up_ faster by taking the
guide that meets your needs.

<a href="./doc/guides.html">
<img src="./docs/can-canjs/skill-tree.png" class='bit-docs-screenshot'/>
</a>

We add a new guide every 6 weeks. [Let us know](http://twitter.com/canjs) what you want to learn next!

<h3 id='solve-problems'>Solve difficult problems</h3>

CanJS has been used to build everything so it's both flexible and has a
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
            var count = resolve(0);
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

var nameChangeCount = name.scan(function(prev){
    return prev+1;
},0);






```

</div>

__Extensions and Plugins__

CanJS has a many extensions and plugins that go beyond
state management and templates:

- [can-route Hashchange] and [can-route-pushstate pushstate] routing
- A [can-connect service & data modeling ] layer that has plugins for:
  - [can-connect/real-time/real-time real-time]
  - [can-connect/data/combine-requests/combine-requests minimizing requests]
  - [can-connect/cache-requests/cache-requests caching] and [fall-through-caching](can-connect/fall-through-cache/fall-through-cache)
  - [can-connect/can/ref/ref relationships]
  - [can-ndjson-stream Streaming NSJSON fetch responses]
- [can-fixture Service simulation]
- [can-define-validate-validatejs Validation]
- [react-view-model React integration]
- [can-control Memory safe declarative event binding]

There's also extensions to state management:

- [can-observe Proxy-based observables]
- [can-debug debugging tools]

And to views:

- [can-stache-converters Converters that simplify two-way bindings]
- [can-stache-route-helpers Routing helpers for the view]

If you need even more 🔥, checkout CanJS's parent framework, <a href="http://donejs.com"><img src="https://www.bitovi.com/hubfs/Imported_Blog_Media/donejs-logo-ie.png" style="width: 100px; position: relative; top: 7px;"/></a>, which adds:

- iOS, Andriod, and Desktop Builds
- Server side rendering (Isomorphic / UniversalJS)
- Progressive loading
- Continuous Integration (Testing)
- Continuous Deployment
- Code generators


__Flexible Pieces__

If you can't find what you need, you can build it! CanJS has all of
its inner workings exposed and documented.  This makes integrating
other technology (like [react-view-model React] and [can-kefir Kefir]) streams
non DOM APIs (like [guides/recipes/cta-bus-map Google Map] and [guides/recipes/canvas-clock Canvas])
straightforward. CanJS also comes with a wide variety of low-level JavaScript and DOM APIs:

Useful low-level APIs:

- [can-reflect] - This is the [Lodash](https://lodash.com/) of CanJS.  It lets you perform operations and
  read information on data.  But unlike Lodash, [can-reflect] is able to work with
  any data type.  For example, you can
  assign all key-values from a [can-define/map/map DefineMap] to a [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map Map]:
  ```js
  var meDefineMap = new DefineMap({name: "Justin"});
  var meMap = canReflect.assign( new Map(), meDefineMap );
  meMap.get("name") //-> "Justin"
  ```
- [can-util/js/diff-array/diff-array] & [can-util/js/diff-object/diff-object] - Diff objects and arrays.
- [can-dom-events] - Listen to DOM events, including custom events, using event delegation.
- [can-dom-mutate] - MutationObserver polyfill.
- [can-ajax] - jQuery-like XHR helper.
- [can-globals] - Feature detection and storage of environmental globals.
- [can-key-tree] - Tree datatype.
- [can-util/js/string/string can-string] - String helpers.

Useful integration APIs:

- [can-symbol] - Decorate objects with symbols to make them work with [can-reflect].
- [can-dom-events] - Create custom events.
- [can-queues] - Schedule tasks to run in a particular order.
- [can-observation-recorder] - Track when observables are read.




<h3 id='maintain'>Maintain your app over years</h3>

CanJS is dedicated to supporting you and your
application long term. As technology progresses and
tastes change, your code evolves too so you aren't left
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
- Being supported by [Bitovi](http://bitovi.com), whose bottom line depends on open source,
  not search or social media.




## Missing Something?

Is there an itch that CanJS doesn’t scratch?  Let us know
on [Gitter chat](https://gitter.im/canjs/canjs) or the [forums](https://forums.donejs.com/c/canjs).
We like contributions of all sorts.  Read the [guides] _Contributing_ section for more details.

## Love Something?

Let us know by giving us a star on [GitHub](https://github.com/canjs/canjs) and following on [Twitter](https://twitter.com/canjs).  If there’s a particular package you like, make sure to star that too. Check out the [guides/contributing/evangelism Evangelism Guide] on
how to help spread the word!
