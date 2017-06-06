@page guides/mission Mission
@parent about 0
@description Learn about CanJS’s mission, why it matters, and how
we’ve worked (and will keep working) to accomplish it.


@body

CanJS’s mission is to __minimize the cost of building and maintaining
JavaScript applications by balancing innovation and stability, helping developers transcend a changing technology landscape__.

You shouldn’t have to rewrite your application to keep pace with technology.
We constantly integrate new ideas and evolving best practices into CanJS libraries,
but in a responsible way that makes it possible to
upgrade gracefully. We aim to provide a stable
and innovative platform, so you can block out noise and stay focused your app, not the tools.

<img
    srcset="../../docs/images/home/Home-Tortoise-color.png 1x, ../../docs/images/home/Home-Tortoise-color-x2.png 2x"
    src="../../docs/images/home/Home-Tortoise-color.png"
    style="float:right; padding-right: 40px;"/>
<img
    srcset="../../docs/images/home/Home-Hare-color.png 1x, ../../docs/images/home/Home-Hare-color-x2.png 2x"
    src="../../docs/images/home/Home-Tortoise-color.png" style="padding-left: 40px;"/>

[//]: # (ANIMATION: Smooth ride, looking out the window, while hurricane of JavaScript logos and terminology passes by outside the window. Vehicle has an arrow pointing forward towards progress.)

Keep reading to learn why our mission is important
and how we’ve fared in realizing it:

- [Stability and innovation matter](#Stabilityandinnovationmatter) — Why stability and innovation are the two most important factors in minimizing the cost of building and maintaining JavaScript applications.
- [Stability is difficult in the JavaScript community](#StabilityisdifficultintheJavaScriptcommunity) — Why the JavaScript community sees a never-ending stream of frameworks and suffers from _JavaScript Framework Fatigue_.
- [Our history of stability and innovation](#Ourhistoryofstabilityandinnovation) — How we’ve managed to
 keep innovating for 10 years (while still providing a viable upgrade path) and what we’re doing now to make CanJS even more stable moving forward.

## Stability and innovation matter

Stability and innovation are often conflicting goals, but they are both critical
factors to application success.  Application development lifecycles
can last years, so it’s important that code written today will be relevant
tomorrow. Yet technology changes quickly, especially in JavaScript.
New technology brings better techniques and is critical for developer happiness
and retention.

When starting a new application, it’s easy to forget that the majority of development happens after
the application is released. Many frameworks, after a short period of popularity, either:

 - End up getting replaced by a _hot new_ framework.
 - Release a major version that not even _remotely_ backwards-compatible with the previous version.

Productivity-wise, over the life of your application, that ends up looking like this:

<img src="../../docs/can-guides/images/introduction/betting-bomb-2.png" style="width:100%;max-width:650px"/>

Or like this:

<img src="../../docs/can-guides/images/introduction/betting-bomb.png" style="width:100%;max-width:650px"/>


What is needed is a balance of innovation and stability, where developer productivity
increases over time, but doesn’t take large steps backward.  That looks something like this:

<img src="../../docs/can-guides/images/introduction/good-bet.png" style="width:100%;max-width:650px"/>

This is our mission.

## Stability is difficult in the JavaScript community

You may be familiar with the
[never-ending stream](https://medium.freecodecamp.com/javascript-fatigue-fatigue-66ffb619f6ce#.n5tt0jqhf) of [hot new JavaScript frameworks](https://www.allenpike.com/2015/javascript-framework-fatigue/)
that take our community by storm every one or two years.

> SproutCore -> Knockout -> Backbone -> Angular -> React -> ?

This isn’t surprising.  Consider how many different programming languages you can use
on the server-side: Java, Ruby, Python, C#, Haskell, etc.  There is only one JavaScript. Innovation
is going to move at a blistering pace.  We should embrace it.

But, the blistering pace of innovation also means that most frameworks will emerge with one
revolutionary feature and then fade as the
next revolutionary framework emerges.  Instead of the old framework adopting new ideas, the community and its attention move onto the next _hot_ framework.

This makes it difficult to avoid stagnation in any community-driven tool over a long period of time.

## Our history of stability and innovation

CanJS has been helping developers transcend the [constantly changing technology landscape](https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f#.lrntx9nby)
for over 10 years.  Read on to learn about:

 - Our history of stability.
 - Our history of innovation.
 - How 3.0 improves stability and innovation.

### Our history of stability

CanJS has been around since 2007. CanJS was originally called [JavaScriptMVC](http://javascriptmvc.com).  In 2012, JavaScriptMVC was split up into several pieces, including CanJS. Every year, we have improved CanJS by incorporating new best practices and ideas from the larger JavaScript community, while not leaving behind our existing users. The result has been a viable upgrade path for over 10 years!

<img src="../../docs/can-guides/images/introduction/best-bet.png" style="width:100%;max-width:650px"/>

Major releases are not fully backwards-compatible, but it was possible to transition with
limited effort.

Let’s see how one piece of CanJS, [can-control], evolved over this time.

__In 2007__, using JavaScriptMVC 1.0, to listen to when any element
that matches the selector `.todos li.complete` is clicked, you might have written something like the following:

```js
new MVC.Controller('todos',{
    "li.complete click": function(el, ev){
        // DO STUFF
    }
});
```

JavaScriptMVC was one of the first libraries to support event delegation,
but these old controls weren’t extensible and couldn’t work in an isolated
context.

__In 2009__, [jQuery](https://jquery.com) began to dominate JavaScript development.
We helped add event delegation to jQuery and integrated it into JavaScriptMVC 2.0.
The previous code became:

```js
$.Controller.extend("TodosController",{
    "li.complete click": function(el, ev){
        // DO STUFF
    }
});

$(".todos").todos_controller();
```
@highlight 1,7

__In 2012__, using CanJS 1.0, this became:

```js
TodosController = can.Control.extend({
    "li.complete click": function(el, ev){
        // DO STUFF
    }
});

new TodosController(".todos");
```
@highlight 1,7

__In 2013__, we released CanJS 2.0, and transitioned to
[can-component]s instead of [can-control]s.  But even now, almost 10 years later,
to make that `MVC.Controller` work in CanJS 3.0,
you could update it to the following:

```js
var Control = require("can-control");

var TodosController = Control.extend({
    "li.complete click": function(el, ev){
        // DO STUFF
    }
});

new TodosController(document.querySelector(".todos"));
```
@highlight 1,3,9

This is one of many examples of CanJS’s code undergoing significant
improvements and changes, while still keeping it possible to upgrade your application.

For teams upgrading to `3.0`, we created multiple [migrate-3 migration paths]
so upgrading can be done incrementally.  


### Our history of innovation

Over the past 9 years of CanJS, the web has evolved, and the best practices in JavaScript application development have changed. As these changes have occurred, CanJS has filtered out the very best ideas and practices, and implemented them in evolving APIs.

To name a few:
- Event delegation became a best practice for managing events around 2009. CanJS added support for event delegation in 2008, before jQuery landed support.  Later, when jQuery became ubiquitous, we
 integrated jQuery into CanJS.
- RESTful APIs eventually became the best practice for designing a backend interface. [can-model](//v2.canjs.com/docs/can.Model.html) in 2010 provided ActiveRecord style abstractions around this pattern.
- Data bindings hit the mainstream in 2013 when Angular rose in popularity. CanJS landed support for this feature in 2011 with [can-ejs].
- Building UI widgets as HTML custom elements, similar to web components, has become a best practice. [can-component] landed in 2013 to support this architecture.
- In 2015, CanJS landed support for using a Virtual DOM and simple server-side rendering with [can-vdom].
- In early 2016, CanJS added real-time support and advanced caching technology with [can-connect].
- In late 2016, CanJS added a more powerful [can-define observable type] and enabled it to use
  [can-define-stream functional reactive programming techniques].

This timeline shows more examples:

<iframe src="https://cdn.knightlab.com/libs/timeline/latest/embed/index.html?source=1lBdurIQbbJkTZ8_kCQaXZtFaD06ulMFAlkqyEmXH4k0&amp;font=Bevan-PotanoSans&amp;maptype=toner&amp;lang=en&amp;start_at_slide=3&amp;height=650&amp;start_zoom_adjust=-2" width="100%" height="650" style="max-width:800px" frameborder="0"></iframe>


### How 3.0 improves stability and innovation

CanJS 3.0 has been reorganized into several different dozen independent repositories,
each with its own npm package and version number using [Semantic Versioning](http://semver.org/).
Organizing CanJS into individual repositories will improve
CanJS’s stability and innovation going forward.

#### Stability

Independent repositories improve stability because they make it easier to upgrade
more frequently. For example,
compare upgrading a 2.3 app to upgrading a 3.0 app.

Despite making relatively few breaking changes, and
providing a [migrate-3 migration guide], upgrading from CanJS 2.3 to 3.0 looks like
a big step:

<img src="../../docs/can-guides/images/introduction/mission-stability-3-upgrade.png" style="width:100%;max-width:450px"/>

But if you break that step down, CanJS 2.3 is mostly CanJS 3.0 with a bunch of bug
fixes, a heap of new features, and a few breaking changes.  Most of the difficulties
upgrading are the breaking changes, which account for the majority of the upgrade step size:

<img src="../../docs/can-guides/images/introduction/mission-stability-upgrade-breakdown.png" style="width:100%;max-width:450px"/>

Currently, to get all of those bug fixes and new features, you have to
take on those breaking changes all at once.  Depending on your company culture,
and scale of your application, this might not be easy.

Going forward in CanJS 3.0, packages are released independently of
each other.  You can upgrade to bug fixes and new features
immediately and delay breaking changes (example: `can-route 4.0.0`) until later. You can upgrade breaking changes in steps too.  For example,
you might upgrade to `can-route 4.0.0` one month and `can-component 4.0.0`
the following month.  CanJS 3.0’s upgrade path might look like:

<img src="../../docs/can-guides/images/introduction/mission-stability-upgrade-new.png" style="width:100%;max-width:450px"/>

Independent repositories also mean that [can-legacy legacy] libraries (like [can-ejs]) can continue
living through community-driven fixes and releases.  Legacy libraries don’t die simply because
they’re no longer included in the core CanJS build.

#### Innovation

Independent repositories enable CanJS to innovate faster for several reasons:

- Supporting [can-legacy legacy] libraries, like [can-ejs], will not slow down the
  development of other libraries.
- Experiments like [can-stream-kefir], where a lot of innovation happens, can be
  released and have breaking changes without having to “get in” breaking changes
  in the core and infrastructure libraries.
- CanJS doesn’t feel as monolithic, appealing to developers using
  just one part.  More users means more contributors.

The shift to independent repositories was CanJS 3.0’s biggest undertaking and
arguably biggest feature. This fact underscores how important our goal
of balancing innovation and stability is to us. For more nuts-and-bolts features of CanJS,
please read [guides/technical CanJS’s Technical Highlights].
