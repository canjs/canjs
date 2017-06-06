@page migrate-3 Migrating to CanJS 3
@parent guides/upgrade 0
@templateRender <% %>
@description This guide walks you through the step-by-step process to upgrade a 2.x app to CanJS 3.
@outline 0

@body

CanJS 3 introduces an even more modular project structure and several new features, while having a minimal number of deprecations and removals from the [2.3 API](//v2.canjs.com/docs/).

This guide goes over:

* [*Pre-migration preparation*](#Pre_migrationpreparation) you can do in your current 2.x project to more easily move to 3.x in the future.
* [The *minimal migration path*](#Minimalmigrationpath), which includes the fewest changes required to upgrade from 2.x to 3.x.
* [The *modernized migration path*](#Modernizedmigrationpath), which includes upgrading your code to match more modern conventions (such as using the new npm packages).
* [The *latest & greatest migration path*](#Latest_greatestmigrationpath), which uses all of the modern libraries we are most excited about (such as [can-define]).
* [How to *avoid future deprecations & removals*](#Avoidfuturedeprecations_removals) in releases after 3.x

## Pre-migration preparation

Before upgrading your project from 2.x to 3.x, make sure your project builds successfully and all the tests pass.

Additionally, you can take the following steps in your CanJS 2.x app to prepare it for migrating to CanJS 3.

### Use the module folders

You can start importing CanJS code in a modular way before moving to CanJS 3.

For example, you might be using [can-component] like this:

```js
var can = require("can");

can.Component.extend({ ... });
```

Update your code to instead look like this:

```js
var Component = require("can/component/component");

Component.extend({ ... });
```

Use the same pattern for the other modules you are using. Be careful when declaring names for imported modules that share a similar name to native objects like Map.

Instead of:

```js
import Map from 'can/map/map'; // this local declaration of Map will collide with ECMAScript2015 [Map](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map)
```

Write:

```js
import CanMap from 'can/map/map';
```

Here’s a list of all the `can.` properties in CanJS 2.3 that can be replaced with modular paths:

- `can.autorender` — `can/view/autorender/autorender`
- `can.batch` — `can/event/batch/batch`
- `can.bindings` — `can/view/bindings/bindings`
- `can.Component` — `can/component/component`
- `can.compute` — `can/compute/compute`
- `can.Construct` — `can/construct/construct`
- `can.Control` — `can/control/control`
- `can.Deferred` — `can/util/deferred`
- `can.define` — `can/map/define`
- `can.deparam` — `can/util/string/deparam/deparam`
- `can.ejs` — `can/view/ejs/ejs`
- `can.event` — `can/event/event`
- `can.fixture` — `can/util/fixture`
- `can.isFunction` — `can/util/js/is-function/is-function`
- `can.LazyMap` — `can/map/lazy/lazy`
- `can.List` — `can/list/list`
- `can.Map` — `can/map/map`
- `can.Model` — `can/model/model`
- `can.Model.Cached` — `can/model/cached/cached`
- `can.mustache` — `can/view/mustache/mustache`
- `can.Object` — `can/util/object/object`
- `can.route` — `can/route/route`
- `can.stache` — `can/view/stache/stache`
- `can.util` — `can/util/util`
- `can.view.callbacks` — `can/view/callbacks/callbacks`

### Replace uses of `can.$`

[`can.$`](//v2.canjs.com/docs/can.$.html) allows you to access the underlying DOM library bundled with CanJS; for example, jQuery in `can.jquery.js`.

You might be using it in your code to easily reference the library:

```js
var can = require("can");
var body = can.$('body');
```

Update your code to explicitly require the library on which you depend. For example:

```js
var $ = require("jquery");
var body = $('body');
```

### Set `leakScope` in components

CanJS 2.2 introduced [can-component.prototype.leakScope leakScope: false] as a property on a [can-component]. This prevents values in parent templates from leaking into your component’s template. In CanJS 3, **leakScope** is now `false` by default.

If you have a template like:

```
<some-component></some-component>
```

That you render with a [can-map map] containing a `page` property like so:

```js
render(new Map({
	page: "home"
}));
```

This `page` property is not available within `some-component`’s own template.

If the component’s template looks like:

```
<h1>Hello {{page}}</h1>
```

It can only lookup the `page` property on `some-component`’s own [can-component.prototype.ViewModel]. To restore the behavior in 2.x, simply set [can-component.prototype.leakScope] to be `true` on the component:

```js
Component.extend({
	tag: "some-component",
	ViewModel: ...,
	leakScope: true
});
```
@highlight 4

## Minimal migration path

If you are already using `can` through npm, simply run the following command to install the latest version:

```
npm install can@3 --save
```

This will update your `package.json` to look something like this:

```js
{
  ...
  "dependencies": {
    "can": "^<%canjs.package.version%>"
  }
}
```

The `^` ensures you get minor and patch releases as those are released.

At a minimum, to upgrade your code for CanJS 3, you must make all of the following changes to your code:

### Use `can/legacy`

In your code where you normally would import `can`, instead import `can/legacy`:

```js
var can = require("can/legacy");
```

This will give you a `can` object with *most* of the same APIs as in 2.3, with a few exceptions:

* [can.mustache](v2.canjs.com/docs/can.mustache.html) is not included with `can/legacy`, but it can still be installed as a [separate package](https://www.npmjs.com/package/can-mustache).
* The former `can.view` functionality no longer exists; see below for more details.

### Asynchronous `inserted` & `removed` events

In your [can-component]s, the [can-util/dom/events/inserted/inserted inserted] and [can-util/dom/events/removed/removed] events were previously fired synchronously as the element was inserted or removed from the DOM. To improve performance, these events are now fired asynchronously.

There is now a [can-component/beforeremove] event that fires synchronously in case you need to perform memory cleanup. For example, you might need to access the parent’s viewModel:

```js
Component.extend({
	tag: "my-panel",

	events: {
		"{element} beforeremove": function(){
			canViewModel(this.element.parentNode).removePanel(this.viewModel);
		}
	}
}
```

### Replace uses of `can.view`

The `can.view` methods have been removed in CanJS 3. The most common use was to create a template renderer from a script element within the page.

Instead of:

```js
var render = can.view('some-id');
```

Just use the DOM APIs and pass the string directly into [can-stache]:

```js
var templateString = document.getElementById('some-id').innerHTML;
var render = stache(templateString);
```

If you were using `can.view` to load a template from a URL like so:

```js
var render = can.view('./template.stache');
```

We encourage you to use [StealJS](https://stealjs.com/) with [steal-stache](#Usingsteal_stachefortemplates):

```js
import render from "./template.stache";
```

Alternatively, use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API):

```js
fetch("./todos.stache")
	.then((resp) => stache(resp.text()))
	.then((render) => /* use render */);
```

If you’re using another module loader (such as Browserify or webpack), check out [guides/setup] for instructions on how to load templates.

#### `can.view.preload`

If you were using `can.view.preload` then use [can-stache.registerPartial] instead.

```js
stache.registerPartial("some-id", renderer);
```

### Replace uses of `can.Construct.proxy`

 The `can.Construct.proxy` method has been removed in favor of [Function.prototype.bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).

 Instead of:

 ```js
 this.proxy(randFunc)
 ```

 You should now do this:

 ```js
 randFunc.bind(this)
 ```

 ### Replace uses of `can.batch`

 `can.batch` has been moved to the `can-event` module.

 Instead of:

 ```js
 can.batch.method();
 ```

You should now do this:

```js
import canBatch from 'can-event/batch/batch';
canBatch.method();
```

The `trigger` method has also been renamed to `dispatch`.

 ```js
 can.batch.trigger(myObj, 'myEvent');
 ```

 Becomes:

 ```js
 canBatch.dispatch(myObj, 'myEvent');
 ```

 ### Replace uses of `can.isFunction`

 `can.isFunction` has been moved to the `can-util` module.

 Instead of:

 ```js
 can.isFunction(func);
 ```

 You should now do this:

 ```js
 import isFunction from 'can/util/js/is-function/is-function';
 isFunction(func);
 ```

### `can.event`

Some methods have been renamed in `can.event`.

```js
can.event.addEvent.call(el, 'click', function() {});
can.event.removeEvent.call(el, 'click', function() {});
```

Becomes:

```js
can.event.addEventListener.call(el, 'click', function() {});
can.event.removeEventListener.call(el, 'click', function() {});
```

### `can.extend`

This method has been split into two: a shallow and deep merge. Previously, passing `true` as the first parameter would do a deep merge. Now, you explicitly invoke the deep merge or shallow merge function.

```js
can.extend({}, { answer: 42 }); // shallow
can.extend(true, {}, { answer: 42 }); // deep
```

Becomes:

```js
import assign from 'can-util/js/assign/assign';
import deepAssign from 'can-util/js/deepAssign/deepAssign';
assign({}, { answer: 42 }); // shallow
deepAssign({}, { answer: 42 }); // deep
```

### `can.addClass`

This method now requires the DOM element to be the context of function.

Replace this:

```js
can.addClass(el, 'myClass');
```

With this:

```js
import className from 'can-util/dom/class-name/class-name';
className.add.call(el, 'myClass');
```

### `can.append`

This method now require the DOM element to be the context of function.

Replace this:

```js
can.append(el, '<p></p>');
```

With this:

```js
import mutate from 'can-util/dom/mutate/mutate';
mutate.append.call(el, '<p></p>');
```

### `can.data`

This method now requires the DOM element to be the context of function. It also has a separate method for getting and setting data.

Replace this:

```js
can.data(el, 'something', 'secret'); // set
can.data(el, 'something'); // get
```

With this:

```js
import domData from 'can-util/dom/data/data';
domData.set.call(el, 'something', 'secret');
domData.get.call(el, 'something');
```

### String methods

All string methods are grouped together now, so you only have to import the string utilities once.

```js
can.camelize('first-name');
can.hyphenate('firstName');
```

Becomes:

```js
import string from 'can-util/js/string/string';

string.camelize('first-name');
string.hyphenate('firstName');
```

### Use native Promises

Native [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are used instead of jQuery promises which means you need to:

* Include a Promise polyfill if targeting browsers that do not have native support. [Steal](https://stealjs.com/) includes a polyfill for you.
* Use `.catch()` instead of `.fail()`.
* Use `.then()` instead of `.done()`.

Note that only a single value is returned from a native Promise.

### Passing the `this` value to a helper

[can-stache] now passes a [can-compute] to [can-stache.Helpers helpers].

If you were passing the `this` value to a helper like so:

```
{{helper .}}
```

You can fix this either by having your helpers handle computes, or by using [can-stache/expressions/call call expressions] instead:

```
{{helper(.)}}
```

### No more global scope names

Most recently-built applications do not depend on adding to the global namespace, but in case you have code that does:

```js
Construct.extend("foo.bar", ...)
```

Which sets `window.foo.bar`, this argument is no longer accepted by [can-construct]. If you *really* need to set a global, you can do so yourself using the return value of [can-construct.extend].

Instead, the first argument to [can-construct.extend] is the name of the constructor function. This is nice for development as you’ll get named objects in your dev tools.

<a id="Usingsteal_stachefortemplates"></a>

### Using `steal-stache` for templates

If you use StealJS, you’ll need to install [steal-stache] to load your templates:

```
npm install steal-stache@3 --save
```

If you’re using StealJS 0.16, you don’t need to do anything else to make your templates load correctly.

If you’re using StealJS 1, you also need to add `steal-stache` to the `plugins` configuration in your `package.json`:

```json
{
  ...
  "steal": {
    ...
    "plugins": ["steal-stache"]
  }
}
```

### Replace `template` with `view` in components

The `template` property name has been deprecated in favor of `view`.

Instead of:

```js
import template from "./todo.stache";
Component.extend({
	tag: "some-component",
	template: template
});
```
@highlight 4

You should write:

```js
import view from "./todo.stache";
Component.extend({
	tag: "some-component",
	view: view
});
```
@highlight 4

## Modernized migration path

CanJS 3 is divided into separate npm packages. This allows us to more quickly update parts of CanJS without affecting other functionality.

In addition to the above, take advantage of the individual packages by installing and using them directly to set your project up for easier upgrades in the future.

For example, you might be using [can-component] like either:

```js
var can = require("can");

can.Component.extend({ ... });
```

or

```js
var Component = require("can/component/component");

Component.extend({ ... });
```

Regardless of which you are using, update your code to instead look like:

```js
var Component = require("can-component");

Component.extend({ ... });
```

Use the same pattern for the other `can` modules you are using. In general, you should not be using the `can.` properties any more, but rather importing (through your module loader / bundler) only the packages and modules that you are using.

Here’s a list of all the paths in CanJS 2.3 that now have separate modules in CanJS 3:

- `can/component/component` — [can-component]
- `can/compute/compute` — [can-compute]
- `can/construct/construct` — [can-construct]
- `can/construct/super` — [can-construct-super]
- `can/control/control` — [can-control]
- `can/event/event` — [can-event]
- `can/list/list` — [can-list]
- `can/map/backup` — [can-map-backup]
- `can/map/define` — [can-map-define]
- `can/map/map` — [can-map]
- `can/model/model` — [can-model](https://github.com/canjs/can-model)
- `can/route/pushstate/pushstate` — [can-route-pushstate]
- `can/route/route` — [can-route]
- `can/util/fixture` — [can-fixture]
- `can/util/string/deparam/deparam` — [can-deparam]
- `can/util/util` — [can-util]
- `can/view/autorender/autorender` — [can-view-autorender]
- `can/view/callbacks/callbacks` — [can-view-callbacks]
- `can/view/ejs/ejs` — [can-ejs]
- `can/view/href/href` — [can-view-href]
- `can/view/import/import` — [can-view-import]
- `can/view/live/live` — [can-view-live]
- `can/view/mustache/mustache` — [can-mustache](https://github.com/canjs/can-mustache)
- `can/view/node_lists/node_lists` — [can-view-nodelist]
- `can/view/parser/parser` — [can-view-parser]
- `can/view/scope/scope` — [can-view-scope]
- `can/view/stache/stache` — [can-stache]
- `can/view/target/target` — [can-view-target]

<a id="Future_proofmigrationpath"></a>
## Latest & greatest migration path

In addition to the steps taken in the two sections above, make the following changes to your application if you *really* want to stay ahead of the curve.

### Move from `can-map` to `can-define`

If you’ve used [can-map-define] in the past, then using [can-define] should be familiar to you. Using [can-define/map/map] is the easiest migration path and is what we show in all of the examples in CanJS 3’s docs.

A typical map looks like:

```js
var Map = require("can-map");
require("can-map-define");

var CarOwner = Map.extend({
	define: {
		cars: {
			Type: Car.List
		},
		favorite: {
			Type: Car
		},
		color: {
			type: "string"
		},
		age: {
			value: 18
		}
	}
});
```

Which can be replaced by flattening it into a [can-define/map/map] like so:

```js
var DefineMap = require("can-define/map/map");

var CarOwner = DefineMap.extend({
	cars: Car.List,
	favorite: Car,
	color: "string",
	age: {
		type: "number",
		value: 18
	}
});
```

Using [can-define] allows you to use maps without the [can-map.prototype.attr .attr()] method that’s needed in [can-map] and [can-list]. To use this with `DefineMap`, just use the `.` (dot) operator instead:

```js
var carOwner = new CarOwner();

// This is observable!
carOwner.favorite = new Car({ make: "Toyota" });
```

**Note:** With `can-map` you are able to assign initial values to a property while defining a `Map` like so:

```js
var CanMap = require("can-map");

var Person = CanMap.extend({
  name: "Justin"
});
```

This shorthand in `can-define/map/map` defines the [can-define.types type], not the initial value.

Here’s the example above updated for `can-define/map/map`:

```js
var DefineMap = require("can-define/map/map");

var Person = DefineMap.extend({
  name: {value: "Justin"}
});
```

#### Remove use of `change` events

When you upgrade to use [can-define], you’ll no longer receive `change` events on maps. If you had any code that binded to a map’s `change` event, you’ll want to instead bind to the properties that you are interested in.

For example:

```js
route.bind("change", function(){
	// The route changed
});
```

Can be modified to instead use a compute that calls `serialize` on the route’s map:

```js
var routeMap = compute(function(){
	return route.map.serialize();
});

routeMap.bind("change", function(){
	// A property on the route’s map changed.
});
```

As you might notice, [can-event.on on()] is preferable to `bind()`, although `bind()` still works the same.

### Use `can-connect` directly

When using the easy migration path, you were secretly using [can-connect/can/model/model], a constructor that is mostly backwards-compatible with [can-model](//v2.canjs.com/docs/can.Model.html).

Most new projects should use [can-connect] directly. [can-connect/can/super-map/super-map] is the easiest way to create models with `can-connect`’s features. Using `can-connect` directly allows you to use [can-define/map/map]s as your models like so:

```js
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var superMap = require("can-connect/can/super-map/super-map");

var Message = DefineMap.extend({
	id: "*"
});

Message.List = DefineList.extend({
	"#": Message
});

var messageConnection = superMap({
	url: 'https://chat.donejs.com/api/messages',
	idProp: 'id',
	Map: Message,
	List: Message.List,
	name: 'message'
});
```

## Avoid future deprecations & removals

### Wrap elements in jQuery objects

If you are using [can-jquery/legacy] to automatically get jQuery-wrapped elements in [can-control] event handlers, you’ll want to remove the usage of [can-jquery/legacy] as it doesn’t play well with [can-component]s that do not expect elements to be jQuery-wrapped.

Instead, use [can-jquery] directly and handle the wrapping yourself. For example:

```js
var Component = require("can-component");
var $ = require("can-jquery");

Component.extend({
	tag: "some-component",

	events: {
		inserted: function(){
			this.element = $(this.element);
		},
		"li click": function(li){
			var $li = $(li);
		}
	}
});
```

[can-jquery] will continue to be supported indefinitely but [can-jquery/legacy] will be dropped in a future major version.

### Use the new binding syntax

CanJS 2.3 introduced new binding syntaxes. They’re available in CanJS 3 with [can-stache-bindings]. Although the old binding syntaxes still work, they will likely be dropped in 4.0. View [can-stache-bindings]’s documentation to learn how to use the new binding syntax.

An example is changing a `can-value` binding from:

```
<input type="text" can-value="{someProp}" />
```

To:

```
<input type="text" {($value})="someProp" />
```

CanJS 3 also introduces new [can-stache.registerConverter stache converters], which are special two-way [can-stache.Helpers helpers] that update an element when an observable value changes and update the observable value when the form element’s value changes (from user input).

An example is the [can-stache-converters.string-to-any] converter, which converts a primitive value to a string to set a `<select>`’s value, and then converts the `<select>` value when a user selects an `<option>` back to the primitive value to update the scope value:

```
<select {($value)}="string-to-any(~favePlayer)">
	<option value="23">Michael Jordan</option>
	<option value="32">Magic Johnson</option>
</select>
```
