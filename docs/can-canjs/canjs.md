@page canjs CanJS

@description A constantly evolving and improving set of client side JavaScript architectural libraries.

@body

### Core Collection

_The best, most hardened and generally useful libraries in CanJS._

- Constructors - [can-construct]
- Observables - [can-define] and [can-compute]
- Data connection and service modeling- [can-connect] and [can-set]
- Routing - [can-route] and [can-route-pushstate]
- Live binding templates - [can-stache]
- Custom elements and view bindings - [can-component] and [can-stache-bindings]

### Ecosystem Collection

_Useful libraries that extend or add important features to the core collection._

- Simulate ajax requests - [can-fixture]
- A virtual DOM that is able to run CanJS's templates - [can-simple-dom] and [can-vdom]
- Track async activity - [can-zone]


### Infrastructure Collection

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

### Legacy Collection

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

### Support / Contributing

Before you make an issue, please read our [Contributing] guide.

You can find the core team in [gitter chat](https://gitter.im/canjs/canjs).
