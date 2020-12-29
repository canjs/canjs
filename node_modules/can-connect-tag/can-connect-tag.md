/**
@module {function} can-connect-tag
@parent can-data-modeling
@collection can-ecosystem
@package ./package.json

@description Create custom elements that can be used to retrieve model instances.

@signature `connectTag(tagName, connection)`

Registers a custom element named `tagName` so it can make requests through `connection`.

Create the custom element using your connection:

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

Then, use the custom element in your [can-stache] views.  

Use `getList` to retrieve a list of items.  The
contents of the element will be rendered with a `Promise<Todo.List>` as the context:

```html
<todo-model getList="type='new'">
  <ul>
  {{#isPending}}<li>Loading</li>{{/isPending}}
  {{# if( isResolved ) }}
    {{# each(value) }}
      <li>{{name}}</li>
    {{/ each}}
  {{/ if}}
  </ul>
</order-model>
```

Use `get` to retrieve a single item by id.  The
contents of the element will be rendered with a `Promise<Todo>` as the context:

```html
<todo-model get="id=5">
  {{#isPending}}<li>Loading</li>{{/isPending}}
  {{# if( isResolved ) }}
    <span>{{name}}</span>
  {{/ if}}
</order-model>
```


@param {String} tagName
@param {Object} connection
