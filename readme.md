# [CanJS](https://canjs.com/)
 
 [![Sauce Test Status](https://saucelabs.com/browser-matrix/canjs.svg)](https://saucelabs.com/u/canjs)

[![Build Status](https://travis-ci.org/canjs/canjs.png?branch=master)](https://travis-ci.org/canjs/canjs)
[![Join the chat at https://gitter.im/canjs/canjs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/canjs/canjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> WARNING: This npm package is for the [CanJS client-side MV* libraries](http://canjs.com). It was formerly
the [node-can project](https://github.com/sebi2k1/node-can) which has been moved 
to [socketcan](https://www.npmjs.com/package/socketcan). A HUGE thanks to Sebastian Haas for 
letting us use the `can` name!

> NOTE: The `canjs` NPM package name is deprecated. Use `can` instead.

CanJS is a collection of the following client-side JavaScript architectural libraries:

### Core Collection

_The best, most hardened and generally useful libraries in CanJS._

- Constructors - [can-construct](/canjs/can-construct)
- Observables - [can-define](/canjs/can-define) and [can-compute](/canjs/can-compute)
- Data connection and service modeling- [can-connect](/canjs/can-connect) and [can-set](/canjs/can-set)
- Routing - [can-route](/canjs/can-route) and [can-route-pushstate](/canjs/can-route-pushstate)
- Live binding templates - [can-stache](/canjs/can-stache)
- Custom elements and view bindings - [can-component](/canjs/can-component) and [can-stache-bindings](can-stache-bindings)

### Ecosystem Collection

_Useful libraries that extend or add important features to the core collection._

- Simulate ajax requests - [can-fixture](/canjs/can-fixture)
- A virtual DOM that is able to run CanJS's templates - [can-simple-dom](/canjs/can-simple-dom) and [can-vdom](/canjs/can-vdom)
- Track async activity - [can-zone](/canjs/can-zone)


### Support Collection

_Utility libraries that power the premier collection._

- DOM and JS utilities - [can-util](/canjs/can-util)
- Events - [can-event](/canjs/can-event)
- Observable notification - [can-observe-info](/canjs/can-observe-info)
- Simple Observable - [can-simple-map](/canjs/can-simple-map)
- View helpers
  - Register custom elements or attributes in templates - [can-view-callbacks](/canjs/can-view-callbacks)
  - Read a view model from a custom element - [can-view-model](/canjs/can-view-model)
  - Lookup scope within a stache template - [can-view-scope](/canjs/can-view-scope)
  - Parses HTML and magic tags - [can-view-parser](/canjs/can-view-parser)
  - A fast-path compile target - [can-view-target](/canjs/can-view-target)
  - Keeps part of the DOM up to date with a compute - [can-view-live](/canjs/can-view-live)
  - Maintains [can-view-nodelist](/canjs/can-view-nodelist)

### Legacy Collection

_Former libraries that are still supported._

- [can-control](/canjs/can-control)
- [can-map](/canjs/can-map) and [can-list](/canjs/can-list)
- Adds the ability to define getter and setters on `can.Map` and `can.List` - [can-map-define](/canjs/can-map-define)
- Adds live-sorting ability to `can-list` - [can-list-sort](/canjs/can-list-sort)
- [can-map-backup]
- [can-map-attributes]
- [can-view-href]
- [can-map-setter]

### Deprecated Collection

_Libraries that are no longer supported. We still accept patches._

- [can-ejs](/canjs/can-ejs)
- [can-mustache](/canjs/can-mustache)

### Support / Contributing
Before you make an issue, please read our [Contributing](contributing.md) guide.

You can find the core team in [gitter chat](https://gitter.im/canjs/canjs).

### Release History
See the [Changelog](changelog.md).

### License
MIT License, see [License](license.md).
