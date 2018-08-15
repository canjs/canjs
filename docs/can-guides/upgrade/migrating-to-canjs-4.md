@page migrate-4 Migrating to CanJS 4
@parent guides/upgrade 1
@templateRender <% %>
@description This guide walks you through the step-by-step process to upgrade a 3.x app to CanJS 4.


@body

CanJS 4 is an improvement on much of the core infrastructure in CanJS 3. Keeping with the modular structure introduced in 3, CanJS 4 adds new packages such as [can-queues] that improve on [can-event/batch/batch](//v3.canjs.com/doc/can-event/batch/batch.html). The upgrade path to CanJS 4 is fairly simple, and warnings guide most of the changes you need to make.

## Why Upgrade

CanJS 4 is a big step forward in simplifying CanJS and enhancing your understanding of your
application. Read more details about it [CanJS 4.0's release article](https://www.bitovi.com/blog/canjs-4.0).  The following are some highlights:

- Debugging Tools - CanJS 4.0 makes it easier to discover how your code works (or doesn't)
  and fix it.  It works with [CanJS’s Chrome Debugger Tools](https://chrome.google.com/webstore/detail/hhdfadlgplkpapjfehnjhcebebgmibcb)
- Simplified Stache Templates - Most of [can-stache]’s quirks have been eliminated or simplified.
- Streaming property definitions - Contain the behavior of a stateful property within a single streaming property definition.  
- Determinism and Performance with Queues - CanJS’s new queuing system makes callback ordering
  deterministic, eliminating odd corner cases, improving debuggability and performance.
- Upgradability - CanJS 4.0 is much easier to upgrade to than 3.0.


## CanJS 4 Upgrade Video

The following video walks through much of this mirgation guide &mdash; including how to perform the upgrade, the changes you might need to make during the process, and all of the new features in CanJS 4 that you can take advantage of once your app is upgraded. The [slides](https://docs.google.com/presentation/d/1O0kF0Shr8Ema99yWi8fVpGttCUW7rjIHJLBM-u0M39s/edit#slide=id.p) for this presentation are also available.

<iframe width="560" height="315" src="https://www.youtube.com/embed/w_LqYMSVYW8" frameborder="0" allowfullscreen></iframe>

## Preparing for migration

> Many of the changes in this guide are available as codemods using
> [can-migrate](#Usingcodemods)

If you are still on CanJS 2.x, you'll first need to upgrade to CanJS 3 before jumping to 4. Follow the [migrate-3 CanJS 3 migration guide] before proceeding with this guide.

## Install CanJS 4 packages

### Using the can package

If you are using the [can](https://www.npmjs.com/search?q=can) package then upgrading is as simple as installing the latest version:

```shell
npm install can@4.x
```

### Using the modular packages

Unlike previous versions of CanJS, in CanJS 4 there are a mixture of different package versions. This is because CanJS is now developed as separate independent packages. Some, such as [can-util], do not have a 4.0 version because there were no breaking changes. Others, like [can-define] have a lower version (2.0 in can-define's case) because it is a newer library than those that date back to the 2.x days.

Because of this, the best way to know which packages to update is by using your package manager.

Using npm do:

```shell
npm outdated
```

This should list something like:

```
Package              Current  Wanted  Latest  Location
can-component          3.3.6   3.3.9   4.0.0  donejs-chat
can-connect           1.5.12  1.5.17   2.0.0  donejs-chat
can-fixture            1.2.0   1.2.2   2.0.0  donejs-chat
can-route              3.2.4   3.2.6   4.0.0  donejs-chat
can-route-pushstate    3.2.0   3.2.0   4.0.0  donejs-chat
```

Each of these rows list:

- The ***package***.
- The ***current*** version you have installed.
- The maximum version that satisfies your semver constraints (***wanted***).
- And the ***latest*** version that has been published.

Since you want to upgrade a major version, we will install what is the *latest*. You can do so by running npm install:

```shell
npm install can-component@latest
```

Which will install, in this case, __can-component@4.0.0__. The next time you run `npm outdated` you will see:

```
Package              Current  Wanted  Latest  Location
can-connect           1.5.12  1.5.17   2.0.0  donejs-chat
can-fixture            1.2.0   1.2.2   2.0.0  donejs-chat
can-route              3.2.4   3.2.6   4.0.0  donejs-chat
can-route-pushstate    3.2.0   3.2.0   4.0.0  donejs-chat
```

With __can-component__ no longer listed. Go through this process for each package until you no longer have any *can-* packages listed.

If you are using [Yarn](https://yarnpkg.com/en/) the process is almost identical. Instead of `npm outdated` use `yarn outdated`. The output looks the same as what you see above from npm. The major difference is that to install the latest version use `yarn add can-component@latest`.

> If you have a `package-lock.json` or `yarn.lock` file present, you may run into issues with dependencies or sub-dependencies not being installed correctly. To be sure you have the latest versions, delete this file and re-install all dependencies once your `package.json` has been completely updated to the new packages.

## Using codemods

We recommend reading this guide in full before starting on your migration, to get an understanding of the changes. Once you have, using codemods is a good way to take care of *many* of the changes described below. If you haven't already, review the [guides/upgrade/using-codemods] guide that discusses what codemods are and the [can-migrate](https://www.npmjs.com/package/can-migrate) tool.

Even if you have already installed can-migrate in the past, you need to upgrade to version 2 to run the 3-4 codemods.

```shell
npm install -g can-migrate@3to4
```

Once installed you can run any of the codemods discussed in sections below. *Or*, to run all of the 3-4 code mods you can run:

```shell
can-migrate '**/*.js' --can-version 4 --apply
```

## Breaking changes

The first step to upgrading to CanJS 4 is to deal with the breaking changes. Most can be changed relatively simply.

### In stache, functions without arguments should be called with ()

In CanJS 2.3 we introduced [can-stache/expressions/call call expressions] as a way to call functions with `()` just like you do in JavaScript. This enabled passing arguments as their *values* rather than as computes.

In 4.0, all functions in stache should be called with `()`.

For example:
```
{{#each items}}
```
Should be used as such:
```
{{#each(items)}}
```

This is to prevent syntax ambiguity.

Consider:
```
{{foo}}
```

Is `foo` a function or a value? It's impossible to tell when reading this that foo might be a function that will be called.

The exception is built-in helpers or Helper Expressions (when called with >=1 argument). This is so that many changes for helpers
like `{{#each items}}` or `{{#eq value1 value2}}` do not hinder upgradability.

In the `{{foo}}` example, change it to:
```handlebars
{{foo()}}
```

### can-stache/helpers/route replaced with can-stache-route-helpers

> You can migrate this change with this codemod:
> ```
> can-migrate '**/*.*' --transform can-stache/route-helpers.js --apply
> ```

If you are using the route helpers such as [can-stache-route-helpers.routeUrl], it has been moved into its own package now and no longer exists in [can-stache]. Your app will likely not load until you fix this.

If you have installed the route helpers in a stache file using [can-view-import] change:

```handlebars
<can-import from="can-stache/helpers/route" />
```

to:

```handlebars
<can-import from="can-stache-route-helpers" />
```

If you've imported these in a JavaScript then just update the import specifier to:

```js
import 'can-stache-route-helpers';
```

### Replacements for can-event

The can-event package in CanJS 3 contained a mixin for adding event capabilities to objects and contained a batching system.

The batching system was replaced with [can-queues] which has a more sophisticated queuing system.

> To migrate to can-queues with a codemod run:
> ```
> can-migrate '**/*.*' --transform can-queues/batch.js --apply
> ```

If you are using [can-event/batch/batch](//v3.canjs.com/doc/can-event/batch/batch.html) (or can.event) to batch changes like so:

```js
import canBatch from 'can-event/batch/batch';

// ...

canBatch.start();
person.first = 'Matthew';
person.last = 'Phillips';
canBatch.stop();
```

Instead use [can-queues] similarly:

```js
import queues from 'can-queues';

// ...

queues.batch.start();
person.first = 'Matthew';
person.last = 'Phillips';
queues.batch.stop();
```

If you were using [can-event](//v3.canjs.com/doc/can-event.html) for its event mixin, this has been replaced by [can-event-queue/map/map]. First install this new dependency:

```shell
npm install can-event-queue --save
```

Replace your can-event code:

```js
import assign from 'can-util/js/assign/assign';
import canEvent from 'can-event';

function Thing(){

}

assign(Thing.prototype, canEvent);

let thing = new Thing();
thing.on("prop", function(){ ... });
```

with:

```js
import mixinMapBindings from 'can-event-queue/map/map';

function Thing(){

}

mixinMapBindings(Thing.prototype);

let thing = new Thing();
thing.on("prop", function(){ ... });
```

### inserted/removed event

The __inserted__ and __removed__ events, most commonly used in [can-component]s are no longer included.

Most of what was done in the inserted event can be replaced in places like [can-define.types.value]. [can-component] also includes a new [can-component/connectedCallback] lifecycle callback that can directly replace the inserted event.

Code that looked like:

```js
import Component from "can-component";

Component.extend({
	events: {
		inserted: function(el){
			el.addEventListener('some-event', function(){

			});
		}
	}
});
```

Can be replaced to use [can-component/connectedCallback] like so:

```js
import Component from "can-component";

Component.extend({
	ViewModel: {
		connectedCallback(el){
			let onSomeEvent = function(){

			};

			el.addEventListener('some-event', onSomeEvent);

			return function(){
				el.removeEventListener('some-event', onSomeEvent);
			}
		}
	}
});
```

*Alternatively*, if your code can't be refactored to use connectedCallback, you can use the [can-3-4-compat](https://github.com/canjs/can-3-4-compat) package to bring back the inserted and removed events.

The above code example becomes:

```js
import Component from "can-component";
import "can-3-4-compat/dom-mutation-events";

Component.extend({
	events: {
		inserted: function(el){
			el.addEventListener('some-event', function(){

			});
		}
	}
});
```

### enter event

In 3.0 there was a global __enter__ event that could be used like so:

```handlebars
<input type="text" on:enter="search(scope.element.value)">
```

In 4.0 this behavior has been moved to the [can-event-dom-enter] package. You can use [can-event-dom-enter/add-global/add-global] to restore the global behavior from 4.0. First install the package:

```shell
npm install can-event-dom-enter
```

Then add the global event:

```js
import "can-event-dom-enter/add-global/add-global";
```

### Implicit scope walking

> ***Note***: If you upgrade to the latest version of CanJS 3 before migrating to 4, you should get the warnings about implicit scope walking. It would be a good idea to follow the below advice and fix the warnings before upgrading to CanJS 4.

In CanJS 3 [can-stache stache] templates would walk up the scope to find variables.For example if you had a template like:

```handlebars
{{#players}}
  {{team}} - {{name}}, {{position}}
{{/players}}
```

That was populated like so:

```js
import stache from "can-stache";

const view = stache.from("my-template");
view({
	team: "Dragons",
	players: [ ... ]
});
```

The __team__ property is part of the ViewModel. In CanJS 3 stache would walk up the scope to find it there. In CanJS 4 there is no implicit scope walking; it will only look for *team* on the item that is being iterated from the *players* list.

This can be fixed by either using relative path lookup (`../`) or by using `scope.root`, depending on where the variable is located.

The above example could be fixed like:

```handlebars
{{#players}}
  {{../team}} - {{name}}, {{position}}
{{/players}}
```

Or with:

```handlebars
{{#players}}
  {{scope.root.team}} - {{name}}, {{position}}
{{/players}}
```

Lastly, scope walking can be enabled by using `scope.find()` within the template. So the above could *also* be fixed like so:

```handlebars
{{#players}}
  {{scope.find('team')}} - {{name}}, {{position}}
{{/players}}
```

However, in general the first two methods should cover most cases.

### %event and other stache symbols

> You can migrate this change with this codemod:
> ```
> can-migrate '**/*.*' --transform can-stache/scope.js --apply
> ```

In [can-stache] 3 there were several special symbols that were useable within a template such as:

* `%index`
* `%event`
* `%key`

These have all been replaced with properties on the `scope` object. Within your template you can refer to `scope` to handle the same things you would have used `%event` et al. before.

```handlebars
{{#each(players)}}
  <span>Player {{scope.index}}</span>

	<a on:click="./destroy(scope.event)">Delete</a>
{{/each}}
```

### Passing string values

In 4.0 we removed the ability in [can-stache] to pass string values directly to components without using a [can-stache-bindings binding syntax]. Previously this looked like so:

```handlebars
<bit-panel title="Lunch menu">
```

This behavior was problematic given the (expanding) number of native attributes. In 4.0 you can either pass string values using [can-stache-bindings.toChild]:

```handlebars
<bit-panel title:from="'Lunch menu'">
```

Or the new [can-stache-bindings.raw] binding:

```handlebars
<bit-panel title:raw="Lunch menu">
```

### stache {{log}} helper

> You can migrate this change with this codemod:
> ```
> can-migrate '**/*.*' --transform can-stache/console-log.js --apply
> ```

Previously can-stache contained a `{{log}}` helper that was useful for logging the current context.

This functionality has been moved to [can-stache.helpers.console console.log]. Now all `console` methods are available within a template. Replace your log calls:

```handlebars
{{log}}
```

With this:

```handlebars
{{console.log(this)}}
```

Check out the [can-stache.helpers.console] docs for other interesting ways to use the new console methods.

### .each was removed from maps and lists

Previously [can-define/map/map], [can-define/list/list], [can-map], and [can-list] all had an `.each` method for looping over contained values. Due to the changes in scope-walking in stache, this would interfere with [can-stache.helpers.each]. For this reason, this was moved to `.forEach`.

Change:

```js
players.each(function(player){

})
```

to:

```js
players.forEach(function(player){

})
```

### can-define-backup is now mixin-based

Previously importing `can-define-backup` would add the `backup`, `restore`, and `isDirty` functions to all `DefineMap`s. In 4.0, the `can-define-backup` mixin function must be called on any maps you would like to use these functions with.

Change:

```js
import DefineMap from "can-define/map/map";
import "can-define-backup";

const Recipe = DefineMap.extend("Recipe", {
	name: "string"
});

const recipe = new Recipe();

recipe.backup();
```

to:

```js
import DefineMap from "can-define/map/map";
import defineBackup from "can-define-backup";

const Recipe = DefineMap.extend("Recipe", {
	name: "string"
});
defineBackup(Recipe);

const recipe = new Recipe();

recipe.backup();
```
@highlight 2,7

## Non-breaking warnings

In addition to the above breaking changes, you'll likely see several warnings. It's important not to ignore warnings coming from CanJS, as they often pertain to changes that *will* break in a future release (such as in CanJS 5.0). Clear out as many warnings as you can.

Some that you might see include:

### can-route API changes

> To migrate this change with a codemod run:
> ```
> can-migrate '**/*.*' --transform can-route/register.js --apply
> ```

Registering routes in [can-route] used to be done by calling the route function. That often confused people since `route` also includes other methods. We simplified this by moving registration to route.register. Change

```js
import route from "can-route";

route("{page}", { page: "home" });
````

to:

```js
import route from "can-route";

route.register("{page}", { page: "home" });
```

Additionally the old `route.ready()` function has been renamed to `route.start()`. To start the above routing, change it to:

```js
import route from "can-route";

route.register("{page}", { page: "home" });
route.start();
```

### can-define's `value` is now `default`

> You can migrate this change with this codemod:
> ```
> can-migrate '**/*.*' --transform can-define/default.js --apply
> ```

In [can-define] 1.0, you would define a default value for a property with the `value` property definition like so:

```js
import DefineMap from "can-define/map/map";

const ViewModel = DefineMap.extend({
	prop: {
		value: "hello world"
	}
});
```

In can-define 2.0 the [can-define.types.value value] property definition is now used to listen to changes in other properties. The *default* behavior is now in the `default` definition like so:

```js
import DefineMap from "can-define/map/map";

const ViewModel = DefineMap.extend({
	prop: {
		default: "hello world"
	}
});
```
