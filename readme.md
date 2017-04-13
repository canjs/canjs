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

- Constructors - [can-construct](https://v3.canjs.com/doc/can-construct.html)
- Observables - [can-define](https://v3.canjs.com/doc/can-define.html) and [can-compute](https://v3.canjs.com/doc/can-compute.html)
- Data connection and service modeling- [can-connect](https://v3.canjs.com/doc/can-connect.html) and [can-set](https://v3.canjs.com/doc/can-set.html)
- Routing - [can-route](https://v3.canjs.com/doc/can-route.html) and [can-route-pushstate](https://v3.canjs.com/doc/can-route-pushstate.html)
- Live binding templates - [can-stache](https://v3.canjs.com/doc/can-stache.html)
- Custom elements and view bindings - [can-component](https://v3.canjs.com/doc/can-component.html) and [can-stache-bindings](https://v3.canjs.com/doc/can-stache-bindings.html)

### Ecosystem Collection

_Useful libraries that extend or add important features to the core collection._

- Simulate ajax requests - [can-fixture](https://v3.canjs.com/doc/can-fixture.html)
- A virtual DOM that is able to run CanJS's templates - [can-simple-dom](https://v3.canjs.com/doc/can-simple-dom.html) and [can-vdom](https://v3.canjs.com/doc/can-vdom.html)
- Track async activity - [can-zone](https://v3.canjs.com/doc/can-zone.html)


### Support Collection

_Utility libraries that power the premier collection._

- DOM and JS utilities - [can-util](https://v3.canjs.com/doc/can-util.html)
- Events - [can-event](https://v3.canjs.com/doc/can-event.html)
- Observable notification - [can-observe-info](https://v3.canjs.com/doc/can-observe-info.html)
- Simple Observable - [can-simple-map](https://v3.canjs.com/doc/can-simple-map.html)
- View helpers
  - Register custom elements or attributes in templates - [can-view-callbacks](https://v3.canjs.com/doc/can-view-callbacks.html)
  - Read a view model from a custom element - [can-view-model](https://v3.canjs.com/doc/can-view-model.html)
  - Lookup scope within a stache template - [can-view-scope](https://v3.canjs.com/doc/can-view-scope.html)
  - Parses HTML and magic tags - [can-view-parser](https://v3.canjs.com/doc/can-view-parser.html)
  - A fast-path compile target - [can-view-target](https://v3.canjs.com/doc/can-view-target.html)
  - Keeps part of the DOM up to date with a compute - [can-view-live](https://v3.canjs.com/doc/can-view-live.html)
  - Maintains [can-view-nodelist](https://v3.canjs.com/doc/can-view-nodelist.html)

### Legacy Collection

_Former libraries that are still supported._

- [can-control](https://v3.canjs.com/doc/can-control.html)
- [can-map](https://v3.canjs.com/doc/can-map.html) and [can-list](https://v3.canjs.com/doc/can-list.html)
- Adds the ability to define getter and setters on `can.Map` and `can.List` - [can-map-define](https://v3.canjs.com/doc/can-map-define.html)
- Adds live-sorting ability to `can-list` - [can-list-sort](https://v3.canjs.com/doc/can-list-sort.html)
- [can-map-backup]
- [can-map-attributes]
- [can-view-href]
- [can-map-setter]

### Deprecated Collection

_Libraries that are no longer supported. We still accept patches._

- [can-ejs](https://v2.canjs.com/docs/can.ejs.html)
- [can-mustache](https://v2.canjs.com/docs/can.mustache.html)

### Support / Contributing
Before you make an issue, please read our [Contributing](contributing.md) guide.

You can find the core team in [gitter chat](https://gitter.im/canjs/canjs).

### Release History
See the [Changelog](changelog.md).

### License
MIT License, see [License](license.md).
