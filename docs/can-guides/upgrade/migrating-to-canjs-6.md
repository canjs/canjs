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

Below are the major differences between ObservableObject / ObservableArray and DefineMap / DefineList.

#### Primitive constructors instead of string types

In [can-define/map/map DefineMaps] you used string type names like so:

```js
const Todo = DefineMap.extend("Todo", {
  dueDate: "date",
  label: "string",
  complete: "boolean"
});
```

With [can-observable-object ObservableObject] you instead use the primitive constructors to convey the same information.

```js
class Todo extends ObservableObject {
  static props = {
    dueDate: Date,
    label: String,
    complete: Boolean
  };
}
```

#### Strict typing is the default

In addition to using primitive constructors, ObservableObject also differs in how it does type conversion. By default types defined for properties are strictly checked. That is, this scenario will throw:

```js
class Person extends ObservableObject {
  static props = {
    name: String,
    age: Number
  };
}

let person = new Person({ name: "Theresa", age: "4" }); // throws!
```

For more control over type conversion the new [can-type] package was built. The above can be made to be loose using [can-type/convert] like so:

```js
class Person extends ObservableObject {
  static props = {
    name: String,
    age: type.convert(Number)
  };
}

let person = new Person({ name: "Theresa", age: "4" }); // throws!
```
@highlight 4

#### Asynchronous getters

In DefineMap you can make a getter be asynchronous by using the `resolve` argument like so:

```js
const ViewModel = DefineMap.extend("TodoList", {
  todosPromise: {
    get() {
      return Todo.getList();
    }
  }
  todos: {
    get(lastSet, resolve) {
      this.todosPromise.then(resolve);
    }
  }
});
```

In ObservableObject this behavior still exists but is part of its own [can-observable-object/define/async behavior]. The above would be written as:

```js
class ViewModel extends ObservableObject {
  static props = {
    todosPromise: {
      get() {
        return Todo.getList();
      }
    },
    todos: {
      async(resolve) {
        this.todosPromise.then(resolve);
      }
    }
  };
}
```

#### get default instead of default function

In DefineMap you could have a default value be an object by making `default` be a function like so:

```js
const Configuration = DefineMap.extend("Configuration", {
  data: {
    default() {
      return { admin: false };
    }
  }
});
```

However this makes it less ergonomic to have the default value of a property be a function itself. With ObservableObject a default value *can* be a function. So in order to have the default value be an object, you can use [can-observable-object/define/get-default] like so:

```js
class Configuration extends ObservableObject {
  static props = {
    data: {
      get default() {
        return { admin: false };
      }
    }
  }
}
```

### Migrate to StacheElement

CanJS 6 includes a new base class for creating web components, [can-stache-element StacheElement]. This class shares the same API as [can-observable-object ObservableObject] for defining properties.

Here are some of the major differences between [can-stache-element] and [can-component]:

#### Based on JavaScript classes

Like with [can-observable-object] you create elements using `class Component extends` rather than [can-component.extend]. Because of this you need to use the separate [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) call to register the class as a custom element.

```js
import {StacheElement} from "can";

class MyElement extends StacheElement {

}

customElements.define("my-element", MyElement);
```

Replaces:

```js
import {Component} from "can";

Component.extend({
  tag: "my-element"
});
```

#### No events object

In [can-component] an [can-component.prototype.events events] object can be used to attach event listeners. This was deprecated in 4.0 and StacheElement doesn't support it.

It's recommended to instead use [can-stache-bindings.event] in the template *or* [can-event-queue/map/map.listenTo] in the element's [can-stache-element/lifecycle-hooks.connected] lifecycle hook.

```js
import {Component} from "can";

Component.extend({
  tag: "my-element",
  view: `<button>Increment {{count}}</button>`,
  ViewModel: {
    count: {
      default: 0
    }
  },

  events: {
      "button click": function() {
        this.viewModel.count++;
      }
  }
});
```

Instead do it this way:

```js
import {StacheElement} from "can";

class MyElement extends StacheElement {
  static view = `<button on:click="this.increment()">Increment {{count}}</button>`;
  static props = {
    count: 0
  };

  increment() {
    this.count++;
  }
}

customElements.define("my-element", MyElement);
```

When listening to properties on the element for side-effects you can use listenTo like so:

```js
import {StacheElement} from "can";

class MyElement extends StacheElement {
  static view = `<button on:click="this.increment()">Increment {{count}}</button>`;
  static props = {
    count: 0
  };

  increment() {
    this.count++;
  }

  connected() {
    this.listenTo("count", () => {
      console.log("Count is now", this.count);
    });
  }
}

customElements.define("my-element", MyElement);
```

#### No content element

[can-component] supported a `<content/>` element as a way to inserting light DOM content from a parent component like so:

```js
import {Compoent} from "can";

Component.extend({
  tag: "my-child",
  view: `<content />`
});

Component.extend({
  tag: "my-parent",
  view: `<my-child>Hello from the parent</my-child>`
});
```

With improvements to [can-stache] it's not possible to pass templates through properties. This gives more flexibility.

```js
import {StacheElement} from "can";

class MyChild extends StacheElement {
  static view = `{{ this.content() }}`;
}
customElements.define("my-child", MyChild);

class MyParent extends StacheElement {
  static view = `
    {{< content }}
      Hello from the parent
    {{/ content }}
    <my-child content:from="content" />
  `
}
customElements.define("my-parent", MyParent);
```
