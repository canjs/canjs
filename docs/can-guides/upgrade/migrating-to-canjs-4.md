@page migrate-4 Migrating to CanJS 4
@parent guides/upgrade 1
@templateRender <% %>
@description This guide walks you through the step-by-step process to upgrade a 3.x app to CanJS 4.
@outline 0

@body

CanJS 4 is an improvement on much of the core infrastructure in CanJS 3. Keeping with the modular structure introduced in 3, CanJS 4 adds new packages such as [can-queues] that improve on [can-event/batch/batch]. The upgrade path to CanJS 4 is fairly simple, and warnings guide most of the changes you need to make.

Many of the changes in this guide are available as codemods.

## Preparing for migration

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

## Using codemods

We recommend reading this guide in full before starting on your migration, to get an understanding of the changes. Once you have, using codemods is a good way to take care of *many* of the changes described below. If you haven't already, review the [using-codemods] guide that discusses what codemods are and the [can-migrate](https://www.npmjs.com/package/can-migrate) tool.

Even if you have already installed can-migrate in the past, you need to upgrade to version 2 to run the 3-4 codemods.

```shell
npm install -g can-migrate@2
```

Once installed you can run any of the codemods discussed in sections below. *Or*, to run all of the 3-4 code mods you can run:

```shell
can-migrate --apply **/*.js --can-version 4
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

Is `foo` a function or a value? If `foo` is not a built-in helper and has no arguments, ex. `{{foo argument}}`, then we treat it as a value and use the `toString` to resolve the value unless `()` are present.

This is true of both methods on the ViewModel and helpers with no arguments. It does not apply to built-in helpers (such as each, eq, if, etc...) or registered helpers with at least one argument.

```handlebars
{{foo}}
```

change to:

```handlebars
{{foo()}}
```

### can-stache/helpers/route replaced with can-stache-route-helpers

> You can migrate this change with this codemod:
> ```
> can-migrate --apply **/*.* --transform can-stache/route-helpers.js
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
> can-migrate --apply **/*.* --transform can-queues/batch.js
> ```

If you are using [can-event/batch/batch] (or can.event) to batch changes like so:

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

If you were using [can-event] for its event mixin, this has been replaced by [can-event-queue/map/map]. First install this new dependency:

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

Most if what was done in the inserted event can be replaced in places like [can-define.types.value]. [can-component] also includes a new [can-component/connectedCallback] lifecycle callback that can directly replace the inserted event.

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
> can-migrate --apply **/*.* --transform can-stache/scope.js
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

### stache {{log}} helper

> You can migrate this change with this codemod:
> ```
> can-migrate --apply **/*.* --transform can-stache/console-log.js
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

## Non-breaking warnings

In addition to the above breaking changes, you'll likely see several warnings. It's important not to ignore warnings coming from CanJS, as they often pertain to changes that *will* break in a future release (such as in CanJS 5.0). Clear out as many warnings as you can.

Some that you might see include:

### can-route API changes

> To migrate this change with a codemod run:
> ```
> can-migrate --apply **/*.* --transform can-route/register.js
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
> can-migrate --apply **/*.* --transform can-define/default.js
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
