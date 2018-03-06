# [CanJS](https://canjs.com/)

 [![Sauce Test Status](https://saucelabs.com/browser-matrix/canjs.svg)](https://saucelabs.com/u/canjs)

[![Join the chat at https://gitter.im/canjs/canjs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/canjs/canjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![npm version](https://badge.fury.io/js/can.svg)](https://www.npmjs.com/package/can)
[![Build Status](https://travis-ci.org/canjs/canjs.svg?branch=master)](https://travis-ci.org/canjs/canjs)
[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/canjs.svg)](https://greenkeeper.io/)

> WARNING: This npm package is for the [CanJS client-side MV* libraries](https://canjs.com). It was formerly
the [node-can project](https://github.com/sebi2k1/node-can) which has been moved 
to [socketcan](https://www.npmjs.com/package/socketcan). A HUGE thanks to Sebastian Haas for 
letting us use the `can` name!

> NOTE: The `canjs` NPM package name is deprecated. Use `can` instead.

CanJS is a collection of the following client-side JavaScript architectural libraries:

### Core Collection

_The best, most hardened and generally useful libraries in CanJS._

- Custom elements — [can-component](https://canjs.com/doc/can-component.html)
- Observable…
  - Values — [can-compute](https://canjs.com/doc/can-compute.html)
  - Custom types — [can-define](https://canjs.com/doc/can-define.html)
  - Lists — [can-define/list/list](https://canjs.com/doc/can-define/list/list.html)
  - Objects — [can-define/map/map](https://canjs.com/doc/can-define/map/map.html)
- Data connection and service modeling — [can-connect](https://canjs.com/doc/can-connect.html) and [can-set](https://canjs.com/doc/can-set.html)
- Routing — [can-route](https://canjs.com/doc/can-route.html) and [can-route-pushstate](https://canjs.com/doc/can-route-pushstate.html)
- Live binding templates — [can-stache](https://canjs.com/doc/can-stache.html), [can-stache/helpers/route](https://canjs.com/doc/can-stache/helpers/route.html) and [can-stache-bindings](https://canjs.com/doc/can-stache-bindings.html)

### Infrastructure Collection

_Utility libraries that power the core and ecosystem collections._

- Unique identifiers — [can-cid](https://canjs.com/doc/can-cid.html)
- Inheritable constructor functions — [can-construct](https://canjs.com/doc/can-construct.html)
- Declarative event bindings — [can-control](https://canjs.com/doc/can-control.html)
- Event handling utilities — [can-event](https://canjs.com/doc/can-event.html), [can-event/async/async](https://canjs.com/doc/can-event/async/async.html), [can-event/batch/batch](https://canjs.com/doc/can-event/batch/batch.html), [can-event/lifecycle/lifecycle](https://canjs.com/doc/can-event/lifecycle/lifecycle.html)
- An environment agnostic container for global variables - [can-globals](https://canjs.com/doc/can-globals.html)
- Namespace where can packages are registered — [can-namespace](https://canjs.com/doc/can-namespace.html)
- Observable hooks needed by every other observable — [can-observation](https://canjs.com/doc/can-observation.html)
- Reflection for gets/sets, events, and type inference across object types - [can-reflect](https://canjs.com/doc/can-reflect.html)
- Reflection to treat Promises as objects with value and state - [can-reflect-promise](https://canjs.com/doc/can-reflect-promise.html)
- Simple observable — [can-simple-map](https://canjs.com/doc/can-simple-map.html)
- A Symbol polyfill - [can-symbol](https://canjs.com/doc/can-symbol.html)
- A stateful container for CanJS type information — [can-types](https://canjs.com/doc/can-types.html)
- Common DOM and JS utilities — [can-util](https://canjs.com/doc/can-util.html)
- View helpers
  - Register custom elements or attributes in templates — [can-view-callbacks](https://canjs.com/doc/can-view-callbacks.html)
  - Keeps part of the DOM up to date with a compute — [can-view-live](https://canjs.com/doc/can-view-live.html)
  - Read a view model from a custom element — [can-view-model](https://canjs.com/doc/can-view-model.html)
  - Maintains — [can-view-nodelist](https://canjs.com/doc/can-view-nodelist.html)
  - Parses HTML and magic tags — [can-view-parser](https://canjs.com/doc/can-view-parser.html)
  - Lookup scope within a stache template — [can-view-scope](https://canjs.com/doc/can-view-scope.html)
  - A fast-path compile target — [can-view-target](https://canjs.com/doc/can-view-target.html)

### Ecosystem Collection

_Useful libraries that extend or add important features to the core collection._

- Integrate can-connect with a FeathersJS Client ([can-connect-feathers](https://canjs.com/doc/can-connect-feathers.html)) or a SignalR Hub ([can-connect-signalr](https://canjs.com/doc/can-connect-signalr.html))
- Call base functions from inside inheriting functions — [can-construct-super](https://canjs.com/doc/can-construct-super.html)
- Define property values using streams — [can-define-stream](https://canjs.com/doc/can-define-stream.html)
- Add validation methods and observables to a can-define/map/map using validate.js — [can-define-validate-validatejs](https://canjs.com/doc/can-define-validate-validatejs.html)
- Simulate ajax requests ([can-fixture](https://canjs.com/doc/can-fixture.html)) and socket.io services ([can-fixture-socket](https://canjs.com/doc/can-fixture-socket.html))
- Cross-bind can events and jquery events — [can-jquery](https://canjs.com/doc/can-jquery.html)
- Provides a set of converters useful for two-way binding with form elements — [can-stache-converters](https://canjs.com/doc/can-stache-converters.html)
- Convert observable values into streams — [can-stream](https://canjs.com/doc/can-stream.html) and [can-stream-kefir](https://canjs.com/doc/can-stream-kefir.html)
- Shared utilities and type definitions to process validation errors — [can-validate](https://canjs.com/doc/can-validate.html) and [can-validate-validatejs](https://canjs.com/doc/can-validate-validatejs.html)
- A virtual DOM that is able to run CanJS's templates — [can-vdom](https://canjs.com/doc/can-vdom.html)
- Automatically render templates found in the document — [can-view-autorender](https://canjs.com/doc/can-view-autorender.html)
- Import dependencies in CanJS views — [can-view-import](https://canjs.com/doc/can-view-import.html)
- A context for tracking asynchronous activity in JavaScript applications — [can-zone](https://canjs.com/doc/can-zone.html) and a compatible memory-based storage — [can-zone-storage](https://canjs.com/doc/can-zone-storage.html)
- A StealJS extension that allows stache templates as dependencies — [steal-stache](https://canjs.com/doc/steal-stache.html)

### Legacy Collection

_Former libraries that we still accept patches for, but are not under active development._

- [can-ejs](https://canjs.com/doc/can-ejs.html)
- [can-list](https://canjs.com/doc/can-list.html)
- [can-map](https://canjs.com/doc/can-map.html)
- [can-map-backup](https://canjs.com/doc/can-map-backup.html)
- [can-map-define](https://canjs.com/doc/can-map-define.html)
- [can-validate-legacy](https://canjs.com/doc/can-validate-legacy.html)
- [can-view-href](https://canjs.com/doc/can-view-href.html)

### Support / Contributing

Before you make an issue, please read our [Contributing](https://canjs.com/doc/guides/contribute.html) guide.

You can find the core team in [Gitter chat](https://gitter.im/canjs/canjs).

### Release History

See [Releases](https://github.com/canjs/canjs/releases).

### License

[MIT License](license.md).
