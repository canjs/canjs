@module {{}} steal-stache
@parent can-views
@collection can-ecosystem
@package ./package.json

A [StealJS](http://stealjs.com) extension that allows stache templates as dependencies.

@signature `STACHE_MODULE_NAME!steal-stache`

Import a [can-stache stache] module in your code and use it to render.

```js
var template = require("./main.stache");
var Map = require("can-map");

var map = new Map();
var frag = template(map);

// frag is a live-bound DocumentFragment
```

  @param {moduleName} STACHE_MODULE_NAME The module name of a stache template. This
  will typically be something like `templates/main.stache`.

  @return {can-stache.renderer} A renderer function that will render the template into a document fragment.

@body

## Use

With [StealJS](https://stealjs.com) being used from `node_modules` like this:

```html
<script src="node_modules/steal/steal.js"></script>
```

Start by installing `steal-stache` with npm:

```shell
npm install steal-stache --save
```

Then add the plugins configuration to your `package.json`:

```json
{
  ...
  "steal": {
    ...
    "plugins": ["steal-stache"]
  }
}
```

Now you can load [can-stache] modules like this:

```js
import todosStache from "todos.stache"
todosStache([{name: "dishes"}]) //-> <documentFragment>
```

## Specifying Dependencies

This plugin allows [can-view-import <can-import>] elements that specify
template dependencies:


```
<can-import from="components/my_tabs"/>
<can-import from="helpers/prettyDate"/>

<my-tabs>
  <my-panel title="{{prettyDate start}}">...</my-panel>
  <my-panel title="{{prettyDate end}}">...</my-panel>
</my-tabs>
```
