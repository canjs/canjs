@page guides/mission Mission
@parent guides/introduction 3
@description Learn about CanJS mission, why it matters, and how
we've worked (and will keep working) to accomplish it.


@body

CanJS's mission is to __minimize the cost of building and maintaining
JavaScript applications by balancing innovation and stability, helping developers transcend a changing technology landscape__.

You shouldn't have to rewrite your application to keep pace with technology.
So we constantly integrate new ideas and evolving best practices into CanJS libraries,
but in a responsible way that makes possible to
upgrade gracefully. We aim to provide a stable
and innovative platform so you can block out noise and stay focused your app, not the tools.

> (ANIMATION: Smooth ride, looking out the window, while hurricane of JavaScript logos and terminology passes by outside the window. Vehicle has an arrow pointing forward towards progress.)

Read on why our mission is important
and how we've faired in realizing it:

- [Stability and innovation matter](#Stabilityandinnovationmatter) - Why stability and innovation are the two most important factors in minimizing the cost of building and maintaining JavaScript Applications.
- [Stability is difficult in the JavaScript community](#StabilityisdifficultintheJavaScriptcommunity) - Why the JavaScript community sees a never-ending stream of frameworks and suffers _JavaScript Framework Fatigue_.
- [Our history of stability and innovation](#Ourhistoryofstabilityandinnovation) - How we've managed to
 keep innovating for almost 8 years while still providing a viable upgrade path and what we're doing now to be even more stable going forward.  

## Stability and innovation matter

### Why stability matters

Technology changes quickly, but applications last a long time.

From inception, a successful application (like Gmail) aims to last at least 5 years.

<img src="../../docs/can-guides/images/introduction/app-longevity.png" style="width:100%;max-width:650px"/>

With a 1-2 year average turnover in the JavaScript framework game of thrones and a 5 year application lifespan, it’s safe to say that choosing frameworks based on popularity is not a good idea.

For example, say you were building an application and using the most popular choice at the time…

__4 years ago__ - You might have chosen KnockoutJS, which is a project that is no longer considered a modern framework and hasn’t been updated in some time.

__3 years ago__ - You might have chosen BackboneJS, which is a project that is no longer considered a modern framework and hasn’t been updated in some time.

__2 years ago__ - You might have chosen Angular 1, which is a project that was rewritten completely in version 2, without any backwards compatibility. You would have to rewrite your application to use a modern framework.

__1 year ago__ - You might have chosen React, before any of the many React frameworks like Redux became popular. You likely would have built your own mini-framework around React, or used the very lightweight Flux pattern that Facebook promotes, all of which would require a rewrite to use what is now considered a modern framework.

__Today__ - You might consider using Angular 2, but then realize you’ve already fallen for this trap. There must be a better way.

This is insanity. No reasonable developer should be expected to work like this. CanJS’ entire mission is to help developers weather this storm.

CanJS, which was originally called JavaScriptMVC before that project was split up into several pieces, including CanJS, in 2012, has been around since 2007. Every year, we have aimed to improve our stack by incorporating the latest best practices and ideas in the JavaScript world, while not leaving behind our existing users.

Had you chosen CanJS during any of the past 4 years (actually any year since 2007), you’d have a smooth upgrade path each year until the present 3.0 version, which shares many major characterics with Angular 2 and React’s more popular frameworks, but without the stink of broken promises.

Productivity-wise, making any other choice over the past 4 years would end up looking either like this:

<img src="../../docs/can-guides/images/introduction/betting-bomb.png" style="width:100%;max-width:650px"/>

Or like this:

<img src="../../docs/can-guides/images/introduction/betting-bomb-2.png" style="width:100%;max-width:650px"/>

But choosing CanJS would have looked like this:

<img src="../../docs/can-guides/images/introduction/good-bet.png" style="width:100%;max-width:650px"/>

Or more specifically, here’s what our major release schedule has looked like:

<img src="../../docs/can-guides/images/introduction/best-bet.png" style="width:100%;max-width:650px"/>

Notice the consistent 6 to 9 month release cadence.






### Why Innovation Matters

However, simply providing stability is not enough. Windows XP was a stable platform, but it sacrificed innovation for stability, causing stagnation.

Over the past 9 years that CanJS has been around, there has been constant change in the JavaScript community. Best practices have evolved and the platform of the web itself has evolved. As these changes have occurred, CanJS has filtered out the very best ideas and practices, and implemented them in evolving APIs.

To name a few:
- Event delegation became a best practice for managing events around 2009. CanJS added support for event delegation in can.Controls in 2008, before jQuery even landed support.
- RESTful APIs eventually became the best practice for designing a backend interface. can.Model in 2010 provided ActiveRecord style abstractions around this pattern.
- Data bindings hit the mainstream in 2013 when Angular rose in popularity. CanJS landed support for this feature in 2011.
- Building UI widgets as HTML custom elements, similar to web components, has become a best practice. can.Component landed in 2013 to support this architecture.
- In 2015, CanJS landed support for using a Virtual DOM and simple server-side rendering, as this idea was becoming more popular.

This timeline shows more examples:

<iframe src="https://cdn.knightlab.com/libs/timeline/latest/embed/index.html?source=1lBdurIQbbJkTZ8_kCQaXZtFaD06ulMFAlkqyEmXH4k0&amp;font=Bevan-PotanoSans&amp;maptype=toner&amp;lang=en&amp;start_at_slide=3&amp;height=650&amp;start_zoom_adjust=-2" width="100%" height="650" style="max-width:800px" frameborder="0"></iframe>

CanJS can be discovered running some very large and popular sites:



## Stability is difficult in the JavaScript community

You may be familiar with the
[never-ending stream](https://medium.freecodecamp.com/javascript-fatigue-fatigue-66ffb619f6ce#.n5tt0jqhf) of [hot new JavaScript frameworks](http://www.allenpike.com/2015/javascript-framework-fatigue/)
that take our community by storm:

<img src="../../docs/can-guides/images/introduction/frameworks.jpg" style="width:100%;max-width:750px"/>

If [chasing the hot new thing](https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f#.lrntx9nby) isn’t for you, CanJS is the right framework for you.

CanJS’ goal is to be the antidote to this mentality, and we have the track record to prove it.

## Our history of stability and innovation

Given that the web is constantly changing, how do you balance the opposing forces of stability and innovation?

There are two ways CanJS achieves this:

1. Modularity with semantic versioning
2. Upgrade paths

### 1. Modularity with semantic versioning

As of the 3.0 release, CanJS has been broken up into several dozen completely independent modules, each with it’s own separate npm package and version number using [Semantic Versioning](http://semver.org/).

Semantic versioning is important because it provides promises about releases and their potential impact on applications. Minor version upgrades, while they may support new features, will always be backwards-compatible. Upgrading to anything besides a major version will not break existing code.

Modularity allows future features to be added via new NPM modules that share common dependencies with the old modules. In most frameworks, adding a new feature means upgrading to a new version, which requires either running two versions in one page (a lot of code weight that slows down page load) or wholesale upgrade of the application.

CanJS modularity means developers can incorporate new library features without requiring a rewrite of the rest of the application or extra code weight. More on this [here](technical.html#Modularity).

### 2. Upgrade paths

For major version upgrades, such as 3.0, we provide an easy path to upgrade. For example, if you are an existing CanJS user using version 2.x looking to upgrade to the current version (3.0), there are three options, which all exist on a spectrum, each providing a tradeoff between work now and work later.

[//]: # (MIGRATION GRAPHIC)

<table>
  <tr>
    <th colspan=3>3 migration paths</td>
  </tr>
  <tr>
    <td>Minimal</td>
    <td>Modernized</td>
    <td>Future-proof</td>
  </tr>
  <tr>
    <td>Minimal application changes</td>
    <td>More changes required</td>
    <td>Uses all the latest</td>
  </tr>
  <tr>
    <td> Uses legacy shims so you barely have to change anything</td>
    <td>Future upgrades will be easier</td>
    <td>More work now, but future upgrades very easy</td>
  </tr>
</table>
<br>

Users that want to upgrade painlessly will use the minimal path. This should be less than a few hours of work. Users that want to take fuller advantages of the new features and APIs will choose the modernized or future-proof options, which introduces slightly more risk.

Here is the [upgrade guide](https://canjs.com/guides/migrating.html) to for 1.x to CanJS 2.0.

The CanJS core team always tests release candidates against a suite of current production applications to ensure our users only get a stable, validated release.

When you’re developing on a moving target, you need a platform that moves for you, so your application can stand on steady ground.




###### Extra: Longevity is More Important Than You Think

If you’re not yet convinced why balancing innovation and stability makes CanJS an excellent choice for businesses, consider this: all the modern frameworks have more or less converged in 2016. You can build a very similar application, with routing, observables, models, and server side rendering (with some exceptions) with Angular 2, several of the React frameworks, Ember, or CanJS. Therefore, the MOST important factor, even beyond small technical differences, is the longevity and stability of the framework. You want to bet on a horse that you can ride into the future, not the horse that looks prettiest today.

There’s no advantage to choosing projects maintained by a big company, since big companies often kill platforms that many developers have invested in.

<img src="../../docs/can-guides/images/introduction/framework-death.png" style="width:100%;max-width:650px"/>

There’s no advantage to choosing a framework with a large community, since communities are fickle and change yearly.

There’s no advantage to choosing a framework based on ability to hire devs that list X on their resume, since any competent JavaScript developer can be equally effective in any modern framework with a couple days of learning.

This is why CanJS has a stellar reputation with enterprise companies. Stability and longevity are critical factors to your application’s success.
