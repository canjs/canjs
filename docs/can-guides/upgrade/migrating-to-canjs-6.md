@page migrate-6 Migrating to CanJS 6
@parent guides/upgrade 3
@templateRender <% %>
@description This guide walks you through the process to upgrade a 5.x app to CanJS 6.x.
@outline 2
@body


## Why Upgrade

CanJS 6.0 is a major step forward for CanJS, fully embracing [JavaScript classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and other modern features. The highlights of the release include:

  - __[can-observable-object ObservableObject]__ and __[can-observable-array ObservableArray]__ as new simplified replacements for [can-define/map/map DefineMap] and [can-define/list/list DefineList] based on JavaScript class syntax. These new types use [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) so they can react to changes even if properties are not predefined.
    ```js
    import { ObservableObject } from "can";

    class Person extends ObservableObject {
      get fullName() {
        return this.first + " " + this.last;
      }
    }

    let person = new Person();
    person.on("fullName", ({ value }) => {
      console.log("Full name is", value);
    });

    person.first = "Ada";
    person.last = "Lovelace";
    ```
    @codepen
  - __[can-stache-element StacheElement]__, a new base class for creating *web components*, a standard way to share components that works in any framework. StacheElement has the same API as [can-observable-object ObservableObject] so you only need to know the one API to use for both [guides/data models] and components.
    ```js
    import { StacheElement } from "can";

    class HelloWorld extends StacheElement {
      static view = `Hello {{ this.name }}!`;
    }
    customElements.define("hello-world", HelloWorld);

    let el = new HelloWorld();
    el.name = "world";
    document.body.append(el);
    ```
    @codepen

  - New package __[can-type]__ brings a high level of flexibility to defining property types on [can-observable-object] and [can-stache-element]. It allows defining [can-type/check strict types], [can-type/maybe types that can be null/undefined] and more.
    ```js
    import { ObservableObject, type } from "can";

    class Person extends ObservableObject {
      static props = {
        age: type.maybe(Number)
      };
    }

    let person = new Person({ age: null });
    console.log(person.age); // null

    person.age = 11;
    console.log(person.age); // 11

    person.age = "14"; // throws!!
    ```

  - Internet Explorer 11 support (still!)

Although [can-stache-element StacheElement], [can-observable-object ObservableObject], and [can-observable-array ObservableArray] use features such as [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) and [proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that are not supported in IE11, you can continue to use [can-component Component] and [can-define DefineMap and DefineList] if your application needs to be compatible with IE11.

See the [guides/setup#IE11Support Setup Guide] for more details.

## Using Codemods

This guide will help you understand all of the changes in CanJS 6. We recommend you read it in full before starting the migration process.

Once you have read this guide, using codemods is a good way to take care of *many* of the changes described below. If you haven't already, read the [guides/upgrade/using-codemods] guide, which explains what codemods are and how the [can-migrate](https://www.npmjs.com/package/can-migrate) CLI tool works.

Even if you have already installed `can-migrate` in the past, you need to upgrade to a version that supports CanJS 6.

```shell
npm install -g can-migrate@2
```

Once installed, you can run all of the CanJS 6 codemods on your code:

```shell
can-migrate '**/*.js' --can-version 6 --apply
```

## Breaking Changes

The following are the breaking changes in CanJS 6.

### Removal of can-view-nodelist

The package [can-view-nodelist](https://www.npmjs.com/package/can-view-nodelist) was used in previous versions of CanJS primarily for tracking when DOM nodes were removed from the page and doing necessary cleanup (such as removing event listeners). Using nodeLists was cumbersome, so in 6.0 we made it a priority to remove the need for them.

nodeLists have been completely removed from CanJS, but because several packages depended on them in the past these changes represent a breaking change. However it should have no affect on your codebase, and simply upgrading all of your packages is all you need to do.

### route.data is now an ObservableObject

In 5.0 we changed [can-route.data route.data] to be a [can-define/map/map DefineMap] that was automatically connected to the route's properties. This meant you could use dot notation to listen to changes in route properties like so:

```js
import { DefineMap, route } from "can";

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
import { DefineMap, route } from "can/everything";

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

### beforeremove event removed

The event [can-component/beforeremove] was deprecated as part of CanJS 4.0 and is no longer available at all. This event was fired synchronously before the element was removed from the page.

In 6.0 this event was removed. Instead use [can-component/connectedCallback] with a return function. This function will be called when the ViewModel is torn down.

```js
import { Component } from "can";

Component.extend({
  tag: "my-component",
  view: `
      <p>Name changed: {{ this.nameChanged }}</p>
      <p>Name: <input value:bind="this.name"/></p>
  `,
  ViewModel: {
      nameChanged: { type: "number", default: 0 },
      name: "string",
      connectedCallback(element) {
          this.listenTo("name", () => {
              this.nameChanged++;
          });
          const disconnectedCallback = this.stopListening.bind( this );
          return disconnectedCallback;
      }
  }
});
```

### can-connect/can/tag moved to an ecosystem package

The module `can-connect/can/tag` has been moved to its own package at [can-connect-tag]. You can import and use it like so:

```js
import { connectTag, restModel, DefineMap, DefineList } from "can/everything";

const Todo = DefineMap.extend({
    id: { identity: true, type: "number" },
    name: "string"
});
Todo.List = DefineList.extend({ "#": Todo });

Todo.connection = restModel({
    url: "/todos/{id}",
    Map: Todo
});

connectTag("todo-model", Todo.connection);
```

### Component / DefineMap / DefineList moved to legacy

[can-component], [can-define/map/map], and [can-define/list/list] are no longer part of core, but are still available as [can-legacy legacy] packages. This will only affect you if you were using the `core.mjs` or `dist/global/core.js` bundles. Use either `everything.mjs` or `dist/globale/everything.js` instead.

### inserted/removed event

[migrate-4#inserted_removedevent Starting with CanJS 4], the __inserted__ and __removed__ events are no longer available by default.

If you still need to listen to those events on an element, you can write the following:

```js
import { domEvents, domMutateDomEvents } from "can";

domEvents.addEvent(domMutateDomEvents.inserted);
domEvents.addEvent(domMutateDomEvents.removed);
```

## Recommended Changes

The following are suggested changes to make sure your application is compatible beyond 6.0.

### Map, List in connections renamed

The `Map` and `List` properties which are used to configure the instance and list types to create, have been renamed. Most likely this is used in configuration of [can-rest-model] or [can-realtime-rest-model], but it also might be used with [can-connect] directly. These have been renamed to `ObjectType` and `ArrayType`, respectively. This is to keep in line with the new class-based [can-observable-object] and [can-observable-array] types.

```js
Todo.connection = restModel({
  List: TodoList,
  Map: Todo,
  url: "/api/todos/{id}"
});
```

becomes:

```js
Todo.connection = restModel({
  ArrayType: TodoList,
  ObjectType: Todo,
  url: "/api/todos/{id}"
});
```

### Migrate to ObservableObject and ObservableArray for models

In CanJS 3.0 the [can-define/map/map DefineMap] and [can-define/list/list DefineList] were added as the preferred ways to build models. This allowed CanJS observables to work with the dot operator.

In 6.0 we are taking the next big step, by allowing [JavaScript classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) to be used as models through the new [can-observable-object ObservableObject] and [can-observable-array ObservableArray] base classes. You can extend them using the [extends](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends) keywork like so:

```js
import { ObservableObject } from "can";

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
  },
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
import { StacheElement } from "can";

class MyElement extends StacheElement {

}
customElements.define("my-element", MyElement);
```

Replaces:

```js
import { Component } from "can";

Component.extend({
  tag: "my-element"
});
```

#### No events object

In [can-component] an [can-component.prototype.events events] object can be used to attach event listeners. This was deprecated in 4.0 and StacheElement doesn't support it.

It's recommended to instead use [can-stache-bindings.event] in the template *or* [can-event-queue/map/map.listenTo] in the element's [can-stache-element/lifecycle-hooks.connected] lifecycle hook.

```js
import { Component } from "can";

Component.extend({
  tag: "my-element",
  view: `<button>Increment {{ this.count }}</button>`,
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
import { StacheElement } from "can";

class MyElement extends StacheElement {
  static view = `<button on:click="this.increment()">Increment {{ this.count }}</button>`;
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
import { StacheElement } from "can";

class MyElement extends StacheElement {
  static view = `<button on:click="this.increment()">Increment {{ this.count }}</button>`;
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

If the options above do not work for you, you can replace your `events` object with a [can-control] like:

```js
import { StacheElement, Control } from "can/everything";

class MyElement extends StacheElement {
  static view = `<button>Increment {{ this.count }}</button>`;
  static props = {
    count: 0
  };
  connected() {
    const EventsControl = Control.extend({
      "button click": function() {
        this.element.count++;
      }
    });
    new EventsControl(this);
  }
}
customElements.define("my-element", MyElement);
```

#### No content element

[can-component] supported a `<content/>` element as a way to inserting light DOM content from a parent component like so:

```js
import { Compoent } from "can";

Component.extend({
  tag: "my-child",
  view: `<content />`
});

Component.extend({
  tag: "my-parent",
  view: `<my-child>Hello from the parent</my-child>`
});
```

With improvements to [can-stache], it's now possible to pass templates through properties. This gives more flexibility.

```js
import { StacheElement } from "can";

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
  `;
}
customElements.define("my-parent", MyParent);
```
@codepen

You can also use the [can-stache-element#Passingtemplates_customizinglayout_ <can-template>] tag to pass templates that have access to the same scope as the component they are being passed to:

```js
import { StacheElement } from "can";

class MyChild extends StacheElement {
  static view = `{{ this.content() }}`;
}
customElements.define("my-child", MyChild);

class MyParent extends StacheElement {
  static view = `
    {{ let where = "the parent" }}
    <my-child>
      <can-template name="content">
        Hello from {{ where }}
      </can-template>
    </my-child>
  `;
}
customElements.define("my-parent", MyParent);
```
@codepen
