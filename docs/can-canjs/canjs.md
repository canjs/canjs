@page canjs CanJS
@dest ../index
@outline 0
@package ../../package.json
@templateRender <% %>
@description CanJS is a client side JavaScript framework that makes it easy to to do the
common stuff, while managing to do the impossible.

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

## The easy stuff

CanJS starts with a familiar object-oriented approach to making
custom elements. Simply import and extend [can-component] with:

- A [can-component.prototype.tag] for the name of the custom element for which you want to define its behavior.
- A [can-component.prototype.view] that provides the HTML content
  of the custom element. The [can-stache] `view` supports live binding, event bindings, and two-way bindings.
- A [can-component.prototype.ViewModel] that defines the methods and stateful properties available to
  the `view`.

For example, lets say you want to create a counter button like this:

<p><my-counter></my-counter></p>

<script src="./dist/global/can.js"></script>
<script>
can.Component.extend({
    tag: "my-counter",
    view: `
        <button on:click='increment()'>+1</button>
        Count: <span>{{count}}</span>
    `,
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count++;
        }
    }
});
</script>


The following defines a `<my-counter>` element:

```js
import Component from "can-component";

Component.extend({
    tag: "my-counter",
    view: `
        <button on:click='increment()'>+1</button>
        Count: <span>{{count}}</span>
    `,
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count++;
        }
    }
});
```

To use `<my-counter>`, simply put one in your page, or in another component's `view`:

```HTML
<my-counter></mycounter>
```

See it in action here:



Or play with it in a JSBin.





## The impossible made possible

- real-time
- streaming definitions
- connecting with other libraries / integration
- memory safety
- upgrading over a long time
- dev tools, stack traces, tricks and tips


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
