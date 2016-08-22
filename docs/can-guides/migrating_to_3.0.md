@page migrating Migrating to 3.0
@parent guides 7

@body

CanJS 3.0 introduces a new even more modular project structure and several new features, while having a minimal number of deprecations or removals to the existing 2.3 API.

## Getting CanJS 3.0

The recommended way to install CanJS 3.0 is through [npm](https://www.npmjs.com/). If you are already using the [can package](https://www.npmjs.com/package/can) you can continue to do so, but we recommend installing the specific dependencies that you need.

### Using can

If you haven't installed CanJS through npm in the past please skip to the next section and install the can-* packages.

If you are already using `can` through npm just change the version in your `package.json` to 3.0:

```js
{
  ...
  "dependencies": {
    "can": "^3.0.0"
  }
}
```

Using the *^* ensures you get minor and patch releases as those are released.

### Using can-*

Better than installing the `can` package is to install just the packages that you are using in your application. For example, if you are using [can-component] you can install it with:

```js
npm install can-component --save
```

A full list of the available packages are shown the [homepage](http://canjs.github.io/canjs/).

## Minimal migration path

At minimum, to upgrade to 3.0, you must make all of the below changes to your code:

### Use can/legacy

In your code where you normally would import `can`, instead import `can/legacy`:

```js
var can = require("can/legacy");
```

This will give you a `can` object with *most* of the same APIs as in 2.3 with the exception of:

* [can-mustache] is not included with can/legacy but can still be installed as a separate package.
* The former `can.view` functionality no longer exists, see below.

### Set leakScope on Components

In CanJS 2.2 we introduced `leakScope: false` as a property on a [can-component]. This prevents values in parent templates from leaking into your Component's template. In 3.0 **leakScope** is now false by default.

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

This `page` property is not available within some-component's own template.

If the component's template looks like:

```
<h1>Hello {{page}}</h1>
```

It can only look-up the `page` property on some-component's own ViewModel. To restore the behavior in 2.x, simply set leakScope to be `true` on the Component:

```js
Component.extend({
	tag: "some-component",
	ViewModel: ...,
	
	leakScope: true
});
```

### Asynchronous inserted/removed events

In your [can-component]s, the **inserted** and **removed** events were previously fired synchronously as the element was inserted into the DOM. To improve performance these events are now fired async. 

There is now a **beforeremove** event that fires synchronously in case you need to perform memory cleanup. For example you might need to access the parent's viewModel:

```js
Component.extend({
	tag: "my-panel",

	events: {
		"beforeremove": function(){
			canViewModel(this.element.parentNode).removePanel(this.viewModel);
		}
	}
}
```

### can.view is no more

The `can.view` methods have been removed in 3.0. The most common use was to create a template renderer from a script element with the page. Instead of:

```js
var render = can.view('some-id');
```

Just use the DOM APIs and pass the string directly into [can-stache]:

```js
var templateString = document.getElementById('some-id').innerHTML;
var render = stache(templateString);
```

If you were using `can.view.preload` then use [can-stache.registerPartial] instead.

```js
stache.registerPartial("some-id", renderer);
```

### Promises are needed

Native [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are used instead of jQuery promises which means you need to:

* Include a Promise polyfill if targeting browsers that do not have native support. [Steal](http://stealjs.com/) includes a polyfill for you.
* Instead of `.fail()` use `.catch()`.
* Instead of `.done()` use `.then()`.
* Only a single a value is returned from a native Promise.

### Passing the "this" value within each helper

When passing the `this` value to a helper like:

```
{{helper .}}
```

in [can-stache] this now passes a [can-compute] to the helper.

You can fix this either by having your helpers handle computes, or using [can-stache/expressions/call call expressions] instead:

```
{{helper(.)}}
```

### No more global scope names

Most recently-built applications do not depend on adding to the global namespace, but in case you have code that does:

```js
Construct.extend("foo.bar", ...)
```

Which sets `window.foo.bar`, this argument is no longer accepted by [can-construct]. If you *really* need to set a global you can do so yourself using the return value of [can-construct.extend].

## Modernized migration path

In addition to the above, to set your project up to more easily be able to upgrade in the future you can take the following measures:

### Use can-* packages

As mentioned earlier in the guide, CanJS 3.0 is divided into separate npm packages. This allows us to more quickly updating parts of CanJS without affecting other functionality. You can take advantage of this by installing the individual can-* packages and using them directly.

You might be using can-component like either:

```js
var can = require("can");

can.Component.extend({ ... });
```

or 

```js
var Component = require("can/component/component");

Component.extend({ ... });
```

Which you are using, update your code to instead look like:

```js
var Component = require("can-component");

Component.extend({ ... });
```

Use the same pattern for the other can modules you are using. In general you should not be using the `can.` properties any more, but rather importing (through your module loader / bundler) only the packages and modules that you are using.

### Wrap elements in jQuery objects

If you are using [can-jquery/legacy] to get automatically jQuery-wrapped elements in [can-control] event handlers, you'll want to remove the usage of [can-jquery/legacy] as it doesn't play well with [can-component]s that do not expect elements to be jQuery-wrapped.

Instead use [can-jquery] directly and handle the wrapping yourself. For example:

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

### Remove use of "change" events

When you upgrade to use [can-define] you'll no longer receive "change" events on maps. If you had any code that binded on a map's "change" event, you'll want to instead bind to the properties that you are interested in. For example:

```js
route.bind("change", function(){
  // The route changed
});
```

Can be modified to listen to the `route` property:

```js
route.on("route", function(){

});
```

As you might notice, we are also favoring using [can-event.on on()] rather than `bind()` now (although bind() still work the same).

## Future-proof migration path

In addition to the steps taken in the two above section, if you *really* want to stay ahead of the curve, make the following changes to your application:

### can-define replaces can-map

If you've used `can/map/define` in the past then using can-define should be familiar to you. Using [can-define/map/map] is the easiest migration path and is what we show in all of the examples in CanJS 3.0's docs.

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
	cars: CarList,
	favorite: Car,
	color: "string",
	age: {
		type: "number",
		value: 18
	}
});
```

Using [can-define] allows you to use maps without the `.attr()` method that's needed in [can-map] and [can-list]. To use this DefineMap just use the dot operator:

```js
var carOwner = new CarOwner();

// This is observable!
carOwner.favorite = new Car({ type: "Toyota" });
```

### Use can-connect directly

When using the easy migration path you were secretly using [can-connect/can/model/model], a constructor that is mostly backwards compatible with [can-model].

Most new projects should use can-connect directly, and [can-connect/can/super-map/super-map] is the easiest way to create models with connect's features. Using can-connect directly allows you to use [can-define/map/map]s as your models like so:

```js
var DefineMap = require("can-define/map/map");
var DefineList = require("can-define/list/list");
var superMap = require("can-connect/can/super-map/super-map");

var Message = DefineMap.extend({
  seal: false
}, {
  id: "*"
});

Message.List = DefineList.extend({
  "*": Message
});

var messageConnection = superMap({
  url: 'http://chat.donejs.com/api/messages',
  idProp: 'id',
  Map: Message,
  List: Message.List,
  name: 'message'
});
```

### Update use of binding syntax

In 2.3 we introduced new binding syntaxes. In 3.0 there are available with [can-stache-bindings]. Although the old binding syntaxes still work, they will likely be dropped in 4.0. View can-stache-binding's documentation to learn how to use the new bindings. 

An example is changing a can-value binding from:

```
<input type="text" can-value="{someProp}" />
```

To:

```
<input type="text" {($value})="someProp" />
```

3.0 also introduces new [can-stache.registerConverter stache converters] which are a special type of [can-stache.Helpers helper] that works two-way to update an element when an observable value changes, and also update the observable value when the form element's value changes (from user input).

An example is the [can-stache-bindings.converters.string-to-any] converter which converts a primitive value to a string to set a `<select>`'s value, and then converts the `<select>` value when a user selects an `<option>` back to the primitive value to update the scope value:

```
<select {($value)}="string-to-any(~favePlayer)">
  <option value="23">Michael Jordan</option>
  <option value="32">Magic Johnson</option>
</select>
```
