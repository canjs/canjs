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
custom elements. Simply import and extend [can-component] with:

- A [can-component.prototype.tag] for the name of the custom element for which you want to define.
- A [can-component.prototype.view] that provides the HTML content
  of the custom element. The [can-stache] `view` supports live binding, event bindings, and two-way bindings.
- A [can-component.prototype.ViewModel] that defines the methods and stateful properties available to
  the `view`.

Let's say you want to create a counter widget like the following: (_go ahead and click it_):

<p style="border: 1px solid #ccc; padding: 15px;"><my-counter></my-counter></p>

And, you want that widget to show up whenever you add `<my-counter></my-counter>` to the
page.  

All you need to do is import [can-component] and define the `<my-counter>` element like this:


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
            this.count++;
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

<div style="text-align: center; color: gray"><a href="http://justinbmeyer.jsbin.com/pubiqoc/1/edit?html,js,output">Play with this example in a JS Bin.</a></div>


## Build the impossible

For over 10 years, CanJS has been used to build production applications in almost every
use case - from massive online stores, to small mobile apps. CanJS goes beyond just state
management and templates. To help you build whatever comes your way, CanJS helps you:

- Become an expert quickly
- Solve difficult problems as they arrive, and
- Maintain your app over years.

### Become an expert quickly

Learning a new framework is hard. Different needs and experiences
don't fit a one-size fits all solution. Our long list of guides are
organized in a skill tree as follows, so can _level up_ faster by taking the
guide that meets your needs.

<a href="./doc/guides.html">
<img src="./docs/can-canjs/skill-tree.png" class='bit-docs-screenshot'/>
</a>

We add a new guide every 6 weeks. [Let us know](http://twitter.com/canjs) what you want to learn next!

### Solve difficult problems

CanJS has been used to build everything.  

CanJS has many features that mean you don't have to re-invent the

- Routing
- A model layer that supports real-time, and multiple caching strategies.
  ```js
  superMap({})
  ```
- Streaming property definitions.
- Dev tools, stack traces, tricks and tips

One special feature is that CanJS has 80 packages.  Allowing you to
integrate anything. `can-reflect`.  small parts, all documented. Integrate
anything yourself.  Reuse and combine smaller parts into things that match your needs.


- can-reflect

tight spot => different architectures, difficult features to build

CanJS has tools and utilities


  -
  - donejs
  -

  - streaming definitions, streaming services
  - connecting with other libraries / integration
  - memory safety
  -
  - React stuff

### Maintain your app over years, possibly decades
    - Built small, multiple projects
    - Experiments
    - Supported by Bitovi Consulting
    - a community that cares (professional support if you need it)
    - Upgrades
    - 6 week survey


CanJS goes beyond providing
just state management and view

to help you build whatever comes your way

We've done extensive
work to ensure you launch your application on time, and keep making releases quickly.

> Massive online stores, to small mobile apps.  Stuff that helps you get to launch quickly:




-








Thus it comes with a wide variety of extensions.

Built well.

Isolated.

Learn it, be productive with it.



If you’re new to the project, the best place to start is the [about] page, where you’ll
find CanJS’s [guides/mission Mission] and [guides/technical Technical Highlights]. Then, go to the [guides] page to find
the [guides/chat Chat], [guides/todomvc TodoMVC], and [guides/atm ATM] guides.

## Getting Started

Get started with CanJS by following one of the tutorials below.

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

## Missing Something?

Is there an itch that CanJS doesn’t scratch?  Let us know
on [Gitter chat](https://gitter.im/canjs/canjs) or the [forums](https://forums.donejs.com/c/canjs).
We like contributions of all sorts.  Read the [guides] _Contributing_ section for more details.

## Love Something?

Let us know by giving us a star on [GitHub](https://github.com/canjs/canjs) and following on [Twitter](https://twitter.com/canjs).  If there’s a particular package you like, make sure to star that too. Check out the [guides/contributing/evangelism Evangelism Guide] on
how to help spread the word!
