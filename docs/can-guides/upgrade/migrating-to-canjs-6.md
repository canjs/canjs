@page migrate-6 Migrating to CanJS 6
@parent guides/upgrade 3
@templateRender <% %>
@description This guide walks you through the process to upgrade a 5.x app to CanJS 6.x.
@outline 2
@body


## Why Upgrade

CanJS 6.0:
  - Internet Explorer 11 support (still!)

## Breaking Changes

### No more nodeLists

__TODO How does this affect upgrades?__

### route.data

In 5.0 we changed [can-route.data route.data] to be a [can-define/map/map DefineMap] that was automatically connected to the route's properties. This meant you could use dot notation to listen to changes in route properties like so:

```js
import {DefineMap, route} from "can";

const ApplicationViewModel = DefineMap.extend("ApplicationViewModel", {
  page: {
    get() {
      return route.data.page;
    }
  }
});

route.register("{page}", { page: "home" });
route.ready();
```

Now `route.data` is instead an [can-observable-object ObservableObject]. Unless you are using methods only available on a DefineMap like [can-define/map/map.prototype.set] this change will most likely not be noticed.

If you want to continue to use a [can-define/map/map DefineMap] you can set `route.data` before any calls to [can-route.register]:

```js
import {DefineMap, route} from "can";

const ApplicationViewModel = DefineMap.extend("ApplicationViewModel", {
  page: {
    get() {
      return route.data.page;
    }
  }
});

route.data = new DefineMap();
route.register("{page}", { page: "home" });
route.ready();
```
@highlight 11


__TODO Explain how to map to the definemap version for IE11 compat. How do we show this?__

### beforeremove event removed

The event [can-component/beforeremove] was deprecated as part of CanJS 4.0 and is no longer available at all. This event was fired synchronously before the element was removed from the page.

In 6.0 this event was removed. Instead use [can-component/connectedCallback] with a return function. This function will be called when the ViewModel is torn down.

```js
import {Component} from "can";

Component.extend({
  tag: "my-component",
  view: `
      <p>Name changed: {{nameChanged}}</p>
      <p>Name: <input value:bind="name"/></p>
  `,
  ViewModel: {
      nameChanged: {type: "number", default: 0},
      name: "string",
      connectedCallback( element ) {
          this.listenTo( "name", function() {
              this.nameChanged++;
          } );
          const disconnectedCallback = this.stopListening.bind( this );
          return disconnectedCallback;
      }
  }
});
```

### can-connect/can/tag

The module `can-connect/can/tag` has been moved to its own package at [can-connect-tag]. You can import and use it like so:

```js
import {connectTag, restModel, DefineMap, DefineList} from "can";

const Todo = DefineMap.extend({
    id: {identity: true, type: "number"},
    name: "string"
});
Todo.List = DefineList.extend({"#": Todo});

Todo.connection = restModel({
    url: "/todos/{id}",
    Map: Todo
});

connectTag("todo-model", Todo.connection);
```

## Recommended Changes

The following are suggested changes to make sure your application is compatible beyond 6.0.

### Migrate to ObservableObject and ObservableArray for models

In CanJS 3.0 the [can-define/map/map DefineMap] and [can-define/list/list DefineList] were added as the preferred ways to build models. This allowed CanJS observables to work with the dot operator.

In 6.0 we are taking the next big step, by allowing [JavaScript classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) to be used as models through the new [can-observable-object ObservableObject] and [can-observable-array ObservableArray] base classes. You can extend them using the [extends](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends) keywork like so:

```js
import {ObservableObject} from "can";

class Todo extends ObservableObject {

}
```

#### Primitive constructors instead of string types

#### async getter

#### get default instead of default function

### Migrate to StacheElement
