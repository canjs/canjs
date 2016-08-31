@page canjs CanJS
@dest ../index
@description CanJS is an evolving and improving set of client side
JavaScript architectural libraries that balances
innovation and stability.  

CanJS targets experienced developers building complex applications
with long futures ahead of them. Read more about [Why CanJS].

<img src="docs/can-canjs/tortoise.png"/>

@body

## [can-core Core Collection]

_The best, most hardened and generally useful libraries in CanJS._

<div class="module-list">

- **[can-construct]** <small>1.3.3</small> Extensible constructors
  - `npm install can-construct --save`
  - <a class="github-button" href="https://github.com/canjs/can-construct" data-count-href="/canjs/can-construct/stargazers" data-count-api="/repos/canjs/can-construct#stargazers_count">Star</a>
- **[can-define]** <small>1.3.3</small> Observables
  - `npm install can-define --save`
  - <a class="github-button" href="https://github.com/canjs/can-define" data-count-href="/canjs/can-define/stargazers" data-count-api="/repos/canjs/can-define#stargazers_count">Star</a>
- **[can-compute]** <small>1.3.3</small> Observables
  - `npm install can-compute --save`
  - <a class="github-button" href="https://github.com/canjs/can-compute" data-count-href="/canjs/can-compute/stargazers" data-count-api="/repos/canjs/can-compute#stargazers_count">Star</a>
- **[can-connect]** <small>1.3.3</small> Data connection
  - `npm install can-connect --save`
  - <a class="github-button" href="https://github.com/canjs/can-connect" data-count-href="/canjs/can-connect/stargazers" data-count-api="/repos/canjs/can-connect#stargazers_count">Star</a>
- **[can-set]** <small>1.3.3</small> Service modeling
  - `npm install can-set --save`
  - <a class="github-button" href="https://github.com/canjs/can-set" data-count-href="/canjs/can-set/stargazers" data-count-api="/repos/canjs/can-set#stargazers_count">Star</a>
- **[can-route]** <small>1.3.3</small> Routing
  - `npm install can-route --save`
  - <a class="github-button" href="https://github.com/canjs/can-route" data-count-href="/canjs/can-route/stargazers" data-count-api="/repos/canjs/can-route#stargazers_count">Star</a>
- **[can-route-pushstate]** <small>1.3.3</small> Pushy routing
  - `npm install can-route-pushstate --save`
  - <a class="github-button" href="https://github.com/canjs/can-route-pushstate" data-count-href="/canjs/can-route-pushstate/stargazers" data-count-api="/repos/canjs/can-route-pushstate#stargazers_count">Star</a>
- **[can-stache]** <small>1.3.3</small> Live binding templates
  - `npm install can-stache --save`
  - <a class="github-button" href="https://github.com/canjs/can-stache" data-count-href="/canjs/can-stache/stargazers" data-count-api="/repos/canjs/can-stache#stargazers_count">Star</a>
- **[can-component]** <small>1.3.3</small> Custom elements
  - `npm install can-component --save`
  - <a class="github-button" href="https://github.com/canjs/can-component" data-count-href="/canjs/can-component/stargazers" data-count-api="/repos/canjs/can-component#stargazers_count">Star</a>
- **[can-stache-bindings]** <small>1.3.3</small> View bindings
  - `npm install can-stache-bindings --save`
  - <a class="github-button" href="https://github.com/canjs/can-stache-bindings" data-count-href="/canjs/can-stache-bindings/stargazers" data-count-api="/repos/canjs/can-stache-bindings#stargazers_count">Star</a>

</div>

## Ecosystem Collection

_Useful libraries that extend or add important features to the core collection._

- Simulate ajax requests - [can-fixture]
- A virtual DOM that is able to run CanJS's templates - [can-simple-dom] and [can-vdom]
- Track async activity - [can-zone]


## Infrastructure Collection

_Utility libraries that power the core collection._

- DOM and JS utilities - [can-util]
- Events - [can-event]
- Observable notification - [can-observe-info]
- Simple Observable - [can-simple-map]
- View helpers
  - Register custom elements or attributes in templates - [can-view-callbacks]
  - Read a view model from a custom element - [can-view-model]
  - Lookup scope within a stache template - [can-view-scope]
  - Parses HTML and magic tags - [can-view-parser]
  - A fast-path compile target - [can-view-target]
  - Keeps part of the DOM up to date with a compute - [can-view-live]
  - Maintains live binding relationships - [can-view-nodelist]

## Legacy Collection

_Former libraries that are not under active development, but we
still accept patches._

- [can-control]
- [can-map] and [can-list]
- Adds the ability to define getter and setters on `can.Map` and `can.List` - [can-map-define]
- Adds live-sorting ability to `can-list` - [can-list-sort]
- [can-map-backup]
- [can-map-attributes]
- [can-view-href]
- [can-map-setter]
- [can-ejs]
- [can-mustache]

## Support / Contributing

Before you make an issue, please read our [Contributing] guide.

You can find the core team in [gitter chat](https://gitter.im/canjs/canjs).
