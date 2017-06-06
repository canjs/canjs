@page api API Docs
@parent canjs 2
@outline 0
@package ../../package.json
@templateRender <% %>
@subchildren
@description
Welcome to the CanJS docs! Learn about all the packages that make-up CanJS & how they work together to help you build amazing applications!

@body

## Collections

CanJS is made of many independent packages and modules.  Those packages and modules are
organized within the following collections.  Read on to get an overview of each collection’s
packages.  Please star what you like so we know where to put our effort.


### [can-core Core Collection]

_The best, most hardened and generally useful libraries in CanJS._

<div class="module-list">

- **[can-compute]** <small><%can-compute.package.version%></small> Observable values and observable composite values
  - `npm install can-compute --save`
  - <a class="github-button" href="https://github.com/canjs/can-compute">Star</a>
- **[can-define]** <small><%can-define.package.version%></small> Observable objects
  - `npm install can-define --save`
  - <a class="github-button" href="https://github.com/canjs/can-define">Star</a>
- **[can-set]** <small><%can-set.package.version%></small> Service modeling
  - `npm install can-set --save`
  - <a class="github-button" href="https://github.com/canjs/can-set">Star</a>
- **[can-connect]** <small><%can-connect.package.version%></small> Data connection
  - `npm install can-connect --save`
  - <a class="github-button" href="https://github.com/canjs/can-connect">Star</a>
- **[can-stache]** <small><%can-stache.package.version%></small> Live binding templates
  - `npm install can-stache --save`
  - <a class="github-button" href="https://github.com/canjs/can-stache">Star</a>
- **[can-component]** <small><%can-component.package.version%></small> Custom elements
  - `npm install can-component --save`
  - <a class="github-button" href="https://github.com/canjs/can-component">Star</a>
- **[can-stache-bindings]** <small><%can-stache-bindings.package.version%></small> View bindings
  - `npm install can-stache-bindings --save`
  - <a class="github-button" href="https://github.com/canjs/can-stache-bindings">Star</a>
- **[can-route]** <small><%can-route.package.version%></small> Routing
  - `npm install can-route --save`
  - <a class="github-button" href="https://github.com/canjs/can-route">Star</a>
- **[can-route-pushstate]** <small><%can-route-pushstate.package.version%></small> Pushstate routing
  - `npm install can-route-pushstate --save`
  - <a class="github-button" href="https://github.com/canjs/can-route-pushstate">Star</a>


</div>

### [can-infrastructure Infrastructure Collection]

_Utility libraries that power the core collection._

<div class="module-list">

- **[can-event]** <small><%can-event.package.version%></small> Event mixin
  - `npm install can-event --save`
  - <a class="github-button" href="https://github.com/canjs/can-event">Star</a>
- **[can-control]** <small><%can-control.package.version%></small> DOM widget constructor
  - `npm install can-control --save`
  - <a class="github-button" href="https://github.com/canjs/can-control">Star</a>
- **[can-util]** <small><%can-util.package.version%></small> Low-level JS and DOM utilities
  - `npm install can-util --save`
  - <a class="github-button" href="https://github.com/canjs/can-util">Star</a>
- **[can-construct]** <small><%can-construct.package.version%></small> Extensible constructors
  - `npm install can-construct --save`
  - <a class="github-button" href="https://github.com/canjs/can-construct">Star</a>
- **[can-observation]** <small><%can-observation.package.version%></small> Observation notification
  - `npm install can-observation --save`
  - <a class="github-button" href="https://github.com/canjs/can-observation">Star</a>
- **[can-simple-map]** <small><%can-simple-map.package.version%></small> Simple observable object
  - `npm install can-simple-map --save`
  - <a class="github-button" href="https://github.com/canjs/can-simple-map">Star</a>
- **[can-view-callbacks]** <small><%can-view-callbacks.package.version%></small> Register custom elements or attributes in can-stache
  - `npm install can-view-callbacks --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-callbacks">Star</a>
- **[can-view-model]** <small><%can-view-model.package.version%></small> Read a view-model from a custom element
  - `npm install can-view-model --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-model">Star</a>
- **[can-view-scope]** <small><%can-view-scope.package.version%></small> Scope lookup
  - `npm install can-view-scope --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-scope">Star</a>
- **[can-view-parser]** <small><%can-view-parser.package.version%></small> Parses HTML and magic tags
  - `npm install can-view-parser --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-parser">Star</a>
- **[can-view-target]** <small><%can-view-target.package.version%></small> A fast-path DOM fragment compile target
  - `npm install can-view-target --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-target">Star</a>
- **[can-view-live]** <small><%can-view-live.package.version%></small> Update the DOM with
  a compute
  - `npm install can-view-live --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-live">Star</a>
- **[can-view-nodelist]** <small><%can-view-nodelist.package.version%></small> Maintains live-binding relationships
  - `npm install can-view-nodelist --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-nodelist">Star</a>
- **[can-cid]** <small><%can-cid.package.version%></small> Get a unique identifier for objects
  - `npm install can-cid --save`
  - <a class="github-button" href="https://github.com/canjs/can-cid">Star</a>
- **[can-deparam]** <small><%can-deparam.package.version%></small> Deserialize a query string into an array or object
  - `npm install can-deparam --save`
  - <a class="github-button" href="https://github.com/canjs/can-deparam">Star</a>
- **[can-param]** <small><%can-param.package.version%></small> Serialize an array or object into a query string
  - `npm install can-param --save`
  - <a class="github-button" href="https://github.com/canjs/can-param">Star</a>
- **[can-types]** <small><%can-types.package.version%></small> A stateful container for CanJS type information
  - `npm install can-types --save`
  - <a class="github-button" href="https://github.com/canjs/can-types">Star</a>
- **[can-namespace]** <small><%can-namespace.package.version%></small> Namespace where can-* packages are registered
  - `npm install can-namespace --save`
  - <a class="github-button" href="https://github.com/canjs/can-namespace">Star</a>

</div>

### [can-ecosystem Ecosystem Collection]

_Useful libraries that add important features or extend the core collection._

<div class="module-list">

- **[can-fixture]** <small><%can-fixture.package.version%></small> Simulate AJAX requests
  - `npm install can-fixture --save`
  - <a class="github-button" href="https://github.com/canjs/can-fixture">Star</a>
- **[can-fixture-socket]** <small><%can-fixture-socket.package.version%></small> Simulate sockets
  - `npm install can-fixture-socket --save`
  - <a class="github-button" href="https://github.com/canjs/can-fixture-socket">Star</a>
- **[can-connect-feathers]** <small><%can-connect-feathers.package.version%></small> Create connections to a FeathersJS API server.
  - `npm install can-connect-feathers --save`
  - <a class="github-button" href="https://github.com/canjs/can-connect-feathers">Star</a>
- **[can-connect-signalr]** <small><%can-connect-signalr.package.version%></small> Create connections to a FeathersJS API server.
  - `npm install can-connect-signalr --save`
  - <a class="github-button" href="https://github.com/canjs/can-connect-signalr">Star</a>
- **[can-connect-cloneable]** <small><%can-connect-cloneable.package.version%></small> Make clones of Maps.
  - `npm install can-connect-cloneable --save`
  - <a class="github-button" href="https://github.com/canjs/can-connect-cloneable">Star</a>
- **[can-zone]** <small><%can-zone.package.version%></small> Track asynchronous activity
  - `npm install can-zone --save`
  - <a class="github-button" href="https://github.com/canjs/can-zone">Star</a>
- **[can-stache-converters]** <small><%can-stache-converters.package.version%></small> Form two-way binding helpers
  - `npm install can-stache-converters --save`
  - <a class="github-button" href="https://github.com/canjs/can-stache-converters">Star</a>
- **[steal-stache]** <small><%steal-stache.package.version%></small> Import can-stache templates as dependencies with [https://stealjs.com StealJS]
  - `npm install steal-stache --save`
  - <a class="github-button" href="https://github.com/canjs/steal-stache">Star</a>
- **[can-view-import]** <small><%can-view-import.package.version%></small> Import modules within can-stache templates
  - `npm install can-view-import --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-import">Star</a>
- **[can-view-autorender]** <small><%can-view-autorender.package.version%></small> Automatically
render templates in script tags
  - `npm install can-view-autorender --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-autorender">Star</a>
- **[can-jquery]** <small><%can-jquery.package.version%></small> jQuery integrations
  - `npm install can-jquery --save`
  - <a class="github-button" href="https://github.com/canjs/can-jquery">Star</a>
- **[can-construct-super]** <small><%can-construct-super.package.version%></small> Call can-construct base methods easily
  - `npm install can-construct-super --save`
  - <a class="github-button" href="https://github.com/canjs/can-construct-super">Star</a>
- **[can-vdom]** <small><%can-vdom.package.version%></small> A virtual DOM that supports can-stache
  - `npm install can-vdom --save`
  - <a class="github-button" href="https://github.com/canjs/can-vdom">Star</a>
- **[can-stream-kefir]** <small><%can-stream-kefir.package.version%></small> Convert observable values into streams
  - `npm install can-stream-kefir --save`
  - <a class="github-button" href="https://github.com/canjs/can-stream-kefir">Star</a>
- **[can-define-stream]** <small><%can-define-stream.package.version%></small> Define property values using streams
  - `npm install can-define-stream --save`
  - <a class="github-button" href="https://github.com/canjs/can-define-stream">Star</a>
- **[can-validate]** <small><%can-validate.package.version%></small> Validation tools and types definitions
  - `npm install can-validate --save`
  - <a class="github-button" href="https://github.com/canjs/can-validate">Star</a>
- **[can-validate-validatejs]** <small><%can-validate-validatejs.package.version%></small> Create validators with ValidateJS
  - `npm install can-validate-validatejs --save`
  - <a class="github-button" href="https://github.com/canjs/can-validate-validatejs">Star</a>
- **[can-define-validate-validatejs]** <small><%can-define-validate-validatejs.package.version%></small> Validation for DefineMaps using the ValidateJS library
  - `npm install can-define-validate-validatejs --save`
  - <a class="github-button" href="https://github.com/canjs/can-define-validate-validatejs">Star</a>


</div>

### [can-legacy Legacy Collection]

_Former libraries that are not under active development, but we
still accept patches._

<div class="module-list">

- **[can-map]** <small><%can-map.package.version%></small> Observable map
  - `npm install can-map --save`
  - <a class="github-button" href="https://github.com/canjs/can-map">Star</a>
- **[can-list]** <small><%can-list.package.version%></small> Observable lists
  - `npm install can-list --save`
  - <a class="github-button" href="https://github.com/canjs/can-list">Star</a>
- **[can-map-define]** <small><%can-map-define.package.version%></small> Define property behavior
  - `npm install can-map-define --save`
  - <a class="github-button" href="https://github.com/canjs/can-map-define">Star</a>
- **[can-map-backup]** <small><%can-map-backup.package.version%></small> Save the last state
  - `npm install can-map-backup --save`
  - <a class="github-button" href="https://github.com/canjs/can-map-backup">Star</a>
- **[can-ejs]** <small><%can-ejs.package.version%></small> EJS templates
  - `npm install can-ejs --save`
  - <a class="github-button" href="https://github.com/canjs/can-ejs">Star</a>
- **[can-view-href]** <small><%can-view-href.package.version%></small> Older routing view helpers
  - `npm install can-view-href --save`
  - <a class="github-button" href="https://github.com/canjs/can-view-href">Star</a>
- **[can-validate-legacy]** <small><%can-validate-legacy.package.version%></small> Validation plugin for can-map's.
  - `npm install can-validate-legacy --save`
  - <a class="github-button" href="https://github.com/canjs/can-validate-legacy">Star</a>
</div>

## The `can` Package

While CanJS is designed to be used and should be used
as independent packages, we still publish a `can` package
with a version number, currently `<%canjs.package.version%>`.
We do this so there is a specified version of all of the
sub-project packages that are __integration tested__ to work together.  

The `can` package uses [semantic versioning](http://semver.org/)
with respect to the [can-core] and [can-infrastructure] collections
only.  Read the [guides/contributing/releases Release Guide] for more information on CanJS’s release process.

The sub-project package versions for `can <%canjs.package.version%>`
are listed below. Copy the ones you use into your `package.json`
if you want to use the same packages that were tested as part of
CanJS `<%canjs.package.version%>`’s release.

__Core Collection__

```
  "can-component": "<%can-component.package.version%>",
  "can-compute": "<%can-compute.package.version%>",
  "can-connect": "<%can-connect.package.version%>",
  "can-define": "<%can-define.package.version%>",
  "can-route": "<%can-route.package.version%>",
  "can-route-pushstate": "<%can-route-pushstate.package.version%>",
  "can-set": "<%can-set.package.version%>",
  "can-stache": "<%can-stache.package.version%>",
  "can-stache-bindings": "<%can-stache-bindings.package.version%>",
```  

__Infrastructure Collection__

```js
  "can-construct": "<%can-stache-bindings.package.version%>",
  "can-control": "<%can-control.package.version%>",
  "can-event": "<%can-event.package.version%>",
  "can-observation": "<%can-observation.package.version%>",
  "can-simple-map": "<%can-simple-map.package.version%>",
  "can-util": "<%can-util.package.version%>",
  "can-view-callbacks": "<%can-view-callbacks.package.version%>",
  "can-view-live": "<%can-view-live.package.version%>",
  "can-view-model": "<%can-view-model.package.version%>",
  "can-view-nodelist": "<%can-view-nodelist.package.version%>",
  "can-view-parser": "<%can-view-parser.package.version%>",
  "can-view-scope": "<%can-view-scope.package.version%>",
  "can-view-target": "<%can-view-target.package.version%>",
```

__Ecosystem collection__

```
  "can-construct-super": "<%can-construct-super.package.version%>",
  "can-define-stream": "<%can-define-stream.package.version%>",
  "can-fixture": "<%can-fixture.package.version%>",
  "can-fixture-socket": "<%can-fixture-socket.package.version%>",
  "can-jquery": "<%can-jquery.package.version%>",
  "can-stache-converters": "<%can-stache-converters.package.version%>",
  "can-stream-kefir": "<%can-stream-kefir.package.version%>",
  "can-vdom": "<%can-vdom.package.version%>",
  "can-view-autorender": "<%can-view-autorender.package.version%>",
  "can-view-import": "<%can-view-import.package.version%>",
  "can-zone": "<%can-zone.package.version%>",
  "steal-stache": "<%steal-stache.package.version%>",
```

__Legacy Collection__

```js
  "can-ejs": "<%can-ejs.package.version%>",
  "can-list": "<%can-list.package.version%>",
  "can-map": "<%can-map.package.version%>",
  "can-map-backup": "<%can-map-backup.package.version%>",
  "can-map-define": "<%can-map-define.package.version%>",
  "can-view-href": "<%can-view-href.package.version%>",
```
