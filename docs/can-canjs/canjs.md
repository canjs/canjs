@page canjs CanJS
@dest ../index
@outline 0
@package ../../package.json
@templateRender <% %>
@description CanJS is an evolving and improving set of client side
JavaScript architectural libraries that balances
innovation and stability.  

CanJS targets experienced developers building complex applications
with long futures ahead of them. Read more about CanJS's [guides/mission]
and its [guides/technical].

<img src="docs/can-canjs/tortoise.png"/>

@body

## [can-core Core Collection]

_The best, most hardened and generally useful libraries in CanJS._

<div class="module-list">

- **[can-compute]** <small><%canjs.package.dependencies.can-compute%></small> Observable values and observable composite values
  - `npm install can-compute --save`
  - <a class="github-button" href="https://github.com/canjs/can-compute" data-count-href="/canjs/can-compute/stargazers" data-count-api="/repos/canjs/can-compute#stargazers_count">Star</a>
- **[can-define]** <small><%canjs.package.dependencies.can-define%></small> Observable objects
  - `npm install can-define --save`
  - <a class="github-button" href="https://github.com/canjs/can-define" data-count-href="/canjs/can-define/stargazers" data-count-api="/repos/canjs/can-define#stargazers_count">Star</a>
- **[can-set]** <small><%canjs.package.dependencies.can-set%></small> Service modeling
  - `npm install can-set --save`
  - <a class="github-button" href="https://github.com/canjs/can-set" data-count-href="/canjs/can-set/stargazers" data-count-api="/repos/canjs/can-set#stargazers_count">Star</a>
- **[can-connect]** <small><%canjs.package.dependencies.can-connect%></small> Data connection
  - `npm install can-connect --save`
  - <a class="github-button" href="https://github.com/canjs/can-connect" data-count-href="/canjs/can-connect/stargazers" data-count-api="/repos/canjs/can-connect#stargazers_count">Star</a>
- **[can-stache]** <small><%canjs.package.dependencies.can-stache%></small> Live binding templates
  - `npm install can-stache --save`
  - <a class="github-button" href="https://github.com/canjs/can-stache" data-count-href="/canjs/can-stache/stargazers" data-count-api="/repos/canjs/can-stache#stargazers_count">Star</a>
- **[can-component]** <small><%canjs.package.dependencies.can-component%></small> Custom elements
  - `npm install can-component --save`
  - <a class="github-button" href="https://github.com/canjs/can-component" data-count-href="/canjs/can-component/stargazers" data-count-api="/repos/canjs/can-component#stargazers_count">Star</a>
- **[can-stache-bindings]** <small><%canjs.package.dependencies.can-stache-bindings%></small> View bindings
  - `npm install can-stache-bindings --save`
  - <a class="github-button" href="https://github.com/canjs/can-stache-bindings" data-count-href="/canjs/can-stache-bindings/stargazers" data-count-api="/repos/canjs/can-stache-bindings#stargazers_count">Star</a>
- **[can-route]** <small><%canjs.package.dependencies.can-route%></small> Routing
  - `npm install can-route --save`
  - <a class="github-button" href="https://github.com/canjs/can-route" data-count-href="/canjs/can-route/stargazers" data-count-api="/repos/canjs/can-route#stargazers_count">Star</a>
- **[can-route-pushstate]** <small><%canjs.package.dependencies.can-route-pushstate%></small> Pushstate routing
  - `npm install can-route-pushstate --save`
  - <a class="github-button" href="https://github.com/canjs/can-route-pushstate" data-count-href="/canjs/can-route-pushstate/stargazers" data-count-api="/repos/canjs/can-route-pushstate#stargazers_count">Star</a>


</div>

## [can-ecosystem Ecosystem Collection]

_Useful libraries that add important features or extend the core collection._

<div class="module-list">

- **[can-fixture]** <small><%canjs.package.dependencies.can-fixture%></small> Simulate AJAX requests
  - `npm install can-fixture --save`
  - <a class="github-button" href="https://github.com/canjs/can-fixture" data-count-href="/canjs/can-fixture/stargazers" data-count-api="/repos/canjs/can-fixture#stargazers_count">Star</a>
- **[can-zone]** <small><%canjs.package.dependencies.can-zone%></small> Track asynchronous activity
  - `npm install can-zone --save`
  - <a class="github-button" href="https://github.com/canjs/can-zone" data-count-href="/canjs/can-zone/stargazers" data-count-api="/repos/canjs/can-zone#stargazers_count">Star</a>
- **[can-stache-converters]** <small><%canjs.package.dependencies.can-stache-converters%></small> Form two way bindings helpers
  - `npm install can-stache-converters --save`
  - <a class="github-button" href="https://github.com/canjs/can-stache-converters" data-count-href="/canjs/can-stache-converters/stargazers" data-count-api="/repos/canjs/can-stache-converters#stargazers_count">Star</a>
- **[steal-stache]** <small><%canjs.package.dependencies.steal-stache%></small> Import can-stache templates as dependencies with [http://stealjs.com StealJS]
  - `npm install steal-stache --save`
  - <a class="github-button" href="https://github.com/canjs/steal-stache" data-count-href="/canjs/steal-stache/stargazers" data-count-api="/repos/canjs/steal-stache#stargazers_count">Star</a>
- **[can-jquery]** <small><%canjs.package.dependencies.can-jquery%></small> jQuery integrations
  - `npm install can-jquery --save`
  - <a class="github-button" href="https://github.com/canjs/can-jquery" data-count-href="/canjs/can-jquery/stargazers" data-count-api="/repos/canjs/can-jquery#stargazers_count">Star</a>
- **[can-construct-super]** <small><%canjs.package.dependencies.can-construct-super%></small> Call can-construt base methods easily.
  - `npm install can-construct-super --save`
  - <a class="github-button" href="https://github.com/canjs/can-construct-super" data-count-href="/canjs/can-construct-super/stargazers" data-count-api="/repos/canjs/can-construct-super#stargazers_count">Star</a>

</div>

- A virtual DOM that is able to run CanJS's templates - [can-simple-dom] and [can-vdom]

## Infrastructure Collection

_Utility libraries that power the core collection._

<div class="module-list">

- **[can-event]** <small><%canjs.package.dependencies.can-event%></small> Event mixin
  - `npm install can-event --save`
  - <a class="github-button" href="https://github.com/canjs/can-event" data-count-href="/canjs/can-event/stargazers" data-count-api="/repos/canjs/can-event#stargazers_count">Star</a>
- **[can-control]** <small><%canjs.package.dependencies.can-control%></small> DOM widget constructor
  - `npm install can-control --save`
  - <a class="github-button" href="https://github.com/canjs/can-control" data-count-href="/canjs/can-control/stargazers" data-count-api="/repos/canjs/can-control#stargazers_count">Star</a>
- **[can-util]** <small><%canjs.package.dependencies.can-util%></small> Low level JS and DOM utilities
  - `npm install can-util --save`
  - <a class="github-button" href="https://github.com/canjs/can-util" data-count-href="/canjs/can-util/stargazers" data-count-api="/repos/canjs/can-util#stargazers_count">Star</a>
- **[can-construct]** <small><%canjs.package.dependencies.can-construct%></small> Extensible constructors
  - `npm install can-construct --save`
  - <a class="github-button" href="https://github.com/canjs/can-construct" data-count-href="/canjs/can-construct/stargazers" data-count-api="/repos/canjs/can-construct#stargazers_count">Star</a>
- **[can-observation]** <small><%canjs.package.dependencies.can-observation%></small> Observation notification
  - `npm install can-observation --save`
  - <a class="github-button" href="https://github.com/canjs/can-observation" data-count-href="/canjs/can-observation/stargazers" data-count-api="/repos/canjs/can-observation#stargazers_count">Star</a>
- **[can-simple-map]** <small><%canjs.package.dependencies.can-simple-map%></small> Simple observable object
  - `npm install can-simple-map --save`
  - <a class="github-button" href="https://github.com/canjs/can-simple-map" data-count-href="/canjs/can-simple-map/stargazers" data-count-api="/repos/canjs/can-simple-map#stargazers_count">Star</a>
- **[can-view-callbacks]** <small><%canjs.package.dependencies.can-view-callbacks%></small> Register custom elements or attributes in can-stache
  - `npm install can-view-callbacks --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-callbacks" data-count-href="/canjs/can-view-callbacks/stargazers" data-count-api="/repos/canjs/can-view-callbacks#stargazers_count">Star</a>
- **[can-view-model]** <small><%canjs.package.dependencies.can-view-model%></small> Read a view-model from a custom element
  - `npm install can-view-model --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-model" data-count-href="/canjs/can-view-model/stargazers" data-count-api="/repos/canjs/can-view-model#stargazers_count">Star</a>
- **[can-view-scope]** <small><%canjs.package.dependencies.can-view-scope%></small> Scope lookup
  - `npm install can-view-scope --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-scope" data-count-href="/canjs/can-view-scope/stargazers" data-count-api="/repos/canjs/can-view-scope#stargazers_count">Star</a>
- **[can-view-parser]** <small><%canjs.package.dependencies.can-view-parser%></small> Parses HTML and magic tags
  - `npm install can-view-parser --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-parser" data-count-href="/canjs/can-view-parser/stargazers" data-count-api="/repos/canjs/can-view-parser#stargazers_count">Star</a>
- **[can-view-target]** <small><%canjs.package.dependencies.can-view-target%></small> A fast-path DOM fragment compile target
  - `npm install can-view-target --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-target" data-count-href="/canjs/can-view-target/stargazers" data-count-api="/repos/canjs/can-view-target#stargazers_count">Star</a>
- **[can-view-live]** <small><%canjs.package.dependencies.can-view-live%></small> Update the DOM with
  a compute
  - `npm install can-view-live --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-live" data-count-href="/canjs/can-view-live/stargazers" data-count-api="/repos/canjs/can-view-live#stargazers_count">Star</a>
- **[can-view-nodelist]** <small><%canjs.package.dependencies.can-view-nodelist%></small> Maintains live-binding relationships
  - `npm install can-view-nodelist --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-nodelist" data-count-href="/canjs/can-view-nodelist/stargazers" data-count-api="/repos/canjs/can-view-nodelist#stargazers_count">Star</a>

</div>


## Legacy Collection

_Former libraries that are not under active development, but we
still accept patches._

- [can-map] and [can-list]
- Adds the ability to define getter and setters on `can.Map` and `can.List` - [can-map-define]
- Adds live-sorting ability to `can-list` - [can-list-sort]
- [can-map-backup]
- [can-map-attributes]
- [can-view-href]
- [can-map-setter]
- [can-ejs]
- [can-mustache]

## Missing Something?

Is there an itch that CanJS doesn't scratch?  Let us know
on [gitter chat](https://gitter.im/canjs/canjs) or the [forums](http://forums.donejs.com/c/canjs).
We like contributions of all sorts.  Read the [guides] _Contributing_ section for more details.

## Love Something?

Let us know by staring us on Github and following on twitter.  If there's a particular package you like, make sure to star that too. Checkout the [guides/contributing/evangelism Evangelism Guide] on
how to help spread the word!
