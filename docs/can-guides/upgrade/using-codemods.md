@page guides/upgrade/using-codemods Using Codemods
@parent guides/upgrade 4
@description Learn how to migrate your app to CanJS 6 using [can-migrate](https://www.npmjs.com/package/can-migrate).

@body

## Overview

A codemod is a transformation script that parses the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
of source code in order to do a code-aware find-and-replace refactor across
multiple files. [can-migrate](https://www.npmjs.com/package/can-migrate)
is a CLI utility for running codemods that can help migrate your app to CanJS 6.

For example, the following CanJS 5.0 code:

```js
import { Component } from "can";

Component.extend({
  tag: "person-form",
  view: `
    <form>
      <input value:bind="this.first">
      <input value:bind="this.last">
      <input value:bind="this.first" type="number">
    </form>
  `,
  ViewModel: {
    first: "string",
    last: "string",
    age: "number",
    description: {
      get() {
        return `${this.first} ${this.last} age ${this.age}`;
      }
    }
  }
});
```

…can be transformed to this:

```js
import { StacheElement, type } from "can";
import DeepObservable from "can-deep-observable";

class PersonForm extends StacheElement {
  static get view() {
    return `
      <form>
        <input value:bind="this.first">
        <input value:bind="this.last">
        <input value:bind="this.first" type="number">
      </form>
    `;
  }

  static get props() {
    return {
      first: type.maybeConvert(String),
      last: type.maybeConvert(String),
      age: type.maybeConvert(Number),
      description: {
        get() {
          return `${this.first} ${this.last} age ${this.age}`;
        }
      }
    };
  }

  static get propertyDefaults() {
    return DeepObservable;
  }

  static get seal() {
    return true;
  }
}
customElements.define("person-form", PersonForm);
```

Using this CLI will get you most of the way to having your codebase
migrated; it’s not a complete solution for a seamless migration, but it will get
you significantly closer than doing the migration by hand.

## Install

Install `can-migrate` from npm:

```shell
npm install -g can-migrate@2
```

This will make the `can-migrate` command available globally.

## Usage

The CLI provides the following options:

```
Usage
$ can-migrate [<file|glob> ...]

Updates files according to the CanJS 3.0 or CanJS 4.0 migration paths (minimal, modern, future)
More info for v3.0: http://canjs.github.io/canjs/doc/migrate-3.html#Modernizedmigrationpath
More info for v4.0: http://canjs.github.io/canjs/doc/migrate-4.html

Options
--apply     -a    Apply transforms (instead of a dry run)
--force           Apply transforms regardless of git status
--silent    -s    Silence output
--config    -c    Path to custom config file
--transform -t    Specify a transform
--can-version     Specify CanJS version to upgrade to
```

### Example

Runs all the `can-migrate` transforms for upgrading to CanJS 4.0 on the files that match the `**/*.js` glob:

```bash
can-migrate '**/*.js' --can-version 6 --apply
```

Runs the `can-stache-element/can-stache-element` transform on the files that match the `**/*.js` glob:

```bash
can-migrate '**/*.js' --transform can-stache-element/can-stache-element.js --apply
```

You can find a [complete list of version-6 transforms on GitHub](https://github.com/canjs/can-migrate/tree/master/src/transforms/version-6).

## List of CanJS 6 Transform Scripts

All of the transforms below will update code in a way that is most backward compatibile with how the APIs in CanJS 5.0 work and in a way that is compatible with most web browsers.

This means they will:

- use getters for class properties like [http://localhost/canjs/doc/can-stache-element/static.view#staticgetview_function_____ view] and [http://localhost/canjs/doc/can-stache-element/static.props#staticgetprops___return_______ props]
- make all nested objects and arrays [can-deep-observable observable]
- [can-observable-object/object.static.seal seal] all observables
- make all types [can-type#type_maybeConvert non-strict]

Being cautious like this can lead to having more code in the transformed version than in the original, but it will reduce the risk of causing bugs by upgrading. The extra code can be removed over time as work is done on the transformed components.

### Component -> StacheElement

`can-migrate` will transform all [can-component]s into [can-stache-element]s so this:

```js
import { Component } from "can";

Component.extend({
  tag: "my-el",
  view: ``,
  ViewModel: {}
});
```

...will be transformed into this:

```js
import { StacheElement } from "can";
import DeepObservable from "can-deep-observable";

class MyEl extends StacheElement {
  static get view() {
    return ``;
  }

  static get props() {
    return {};
  }

  static get propertyDefaults() {
    return DeepObservable;
  }

  static get seal() {
    return true;
  }
}
customElements.define("my-el", MyEl);
```

### DefineMap -> ObservableObject

`can-migrate` will convert all [can-define/map/map#newDefineMap__props__ instances] and [can-define/map/map.extend extended] `DefineMap`s into `ObservableObject`s.

This:

```js
import { DefineMap } from "can";

const MyMap = DefineMap.extend("MyMapConstructor", {
  prop: {
    default() {
      return new DefineMap({});
    }
  }
});
```

...will be transformed into this:

```js
import { ObservableObject } from "can";
import DeepObservable from "can-deep-observable";

class MyMap extends ObservableObject {
  static get props() {
    return {
      prop: {
        get default() {
          return new ObservableObject({});
        }
      }
    };
  }

  static get propertyDefaults() {
    return DeepObservable;
  }

  static get seal() {
    return true;
  }
}
```

### DefineList -> ObservableArray

`can-migrate` will convert all [can-define/list/list#newDefineList__props__ instances] and [can-define/list/list.extend extended] `DefineList`s into `ObservableArray`s.

This:

```js
import { DefineMap, DefineList } from "can";

const MyMap = DefineMap.extend("MyMapConstructor", {
  prop: {
    default() {
      return new DefineMap({});
    }
  }
});

const MyList = DefineList.extend("MyListConstructor", {
  "#": MyMap,

  selected: {
    default() {
      return new DefineList([]);
    }
  }
});
```

...will be transformed into this:

```js
import { ObservableArray, ObservableObject, type } from "can";
import DeepObservable from "can-deep-observable";

class MyMap extends ObservableObject {
  static get props() {
    return {
      prop: {
        get default() {
          return new ObservableObject({});
        }
      }
    };
  }

  static get propertyDefaults() {
    return DeepObservable;
  }

  static get seal() {
    return true;
  }
}

class MyList extends ObservableArray {
  static get props() {
    return {
      selected: {
        get default() {
          return new ObservableArray([]);
        }
      }
    };
  }

  static get items() {
    return type.maybeConvert(MyMap);
  }
}
```

### Property Definitions

`can-migrate` will handle converting all property [can-observable-object/object.types.definitionObject definitions] and [can-observable-object/object.types.property shorthands] to syntax compatible with `ObservableObject`. This makes several minor changes.

This:

```js
import { DefineMap } from "can";

const MyMap = DefineMap.extend("MyMapConstructor", {
  aString: "string",
  aNumber: "number",
  aBoolean: "boolean",
  aDate: "date",
  anything: "any",
  anObjectType: { Type: Thing },
  anObject: { Defaul: Thing },
  anotherString: { type: "string" },
  anotherNumber: { type: "number" },
  anotherBoolean: { type: "boolean" },
  anotherDate: { type: "date" },
  anotherAnything: { type: "any" },
  doNotSerialize: { serialize: false },
  anotherObject: {
    default() {
      return { /* ... */ };
    }
  },
  aGetter: {
    get() { /* ... */ }
  },
  anAsyncGetter: {
    get(lastSet, resolve) { /* ... */ }
  }
});
```

...will be transformed to this:

```js
import { ObservableObject, type } from "can";

class MyMap extends ObservableObject {
  static get props() {
    return {
      aString: type.maybeConvert(String),
      aNumber: type.maybeConvert(Number),
      aBoolean: type.maybeConvert(Boolean),
      aDate: type.maybeConvert(Date),
      anything: type.Any,
      anObjectType: { type: type.maybeConvert(Thing) },
      anObject: { Defaul: Thing },
      anotherString: { type: type.maybeConvert(String) },
      anotherNumber: { type: type.maybeConvert(Number) },
      anotherBoolean: { type: type.maybeConvert(Boolean) },
      anotherDate: { type: type.maybeConvert(Date) },
      anotherAnything: { type: type.Any },
      doNotSerialize: { enumerable: false },
      anotherObject: {
        get default() {
          return { /* ... */ };
        }
      },
      aGetter: {
        get() { /* ... */ }
      },
      anAsyncGetter: {
        async(resolve, lastSet) { /* ... */ }
      }
    };
  }
}
```

### Component Events

The [can-component.prototype.events] object on [can-component Component] will be replaced with a [can-control] that is instantiated in the [can-stache-element/lifecycle-hooks.connected connected hook].

This:

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

...becomes this:

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

### Map and List on restModel and realTimeRestModel

The `Map` and `List` options will be replaced when passed as options to [can-rest-model] (or [can-realtime-rest-model]):

```js
Todo.connection = restModel({
  Map: TodoList,
  List: Todo,
  url: "/api/todos/{id}"
});
```

...becomes:

```js
Todo.connection = restModel({
  ArrayType: TodoList,
  ObjectType: Todo,
  url: "/api/todos/{id}"
});
```

The properties returned by the `restModel` and `realtimeRestModel` functions will also be renamed. This:

```js
const Todo = realtimeRestModel("/api/todos/{id}").Map;
```

...becomes:

```js
const Todo = realtimeRestModel("/api/todos/{id}").ObjectType;
```

...and this:

```js
const TodoList = realtimeRestModel("/api/todos/{id}").List;
```

...becomes:

```js
const TodoList = realtimeRestModel("/api/todos/{id}").ArrayType;
```
