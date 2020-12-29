@module {function} can-observable-array
@parent can-observables
@collection can-core
@group can-observable-array/static 0 static
@group can-observable-array/prototype 1 prototype
@alias can.ObservableArray
@package ../package.json
@templateRender true

@description Create observable arrays with defined properties.

@signature `class extends ObservableArray`

  Creates a derived class extending from `ObservableArray`. Useful for creating typed lists to use with associated typed [can-observable-object objects].

  ```js
  import { ObservableArray, ObservableObject, type } from "can/everything";

  class Todo extends ObservableObject {
    static props = {
      label: String
    };
  }

  class TodoList extends ObservableArray {
    static items = type.convert(Todo);
  }

  let todos = new TodoList([
    { label: "Walk the dog" },
    { label: "Make dinner" }
  ]);

  console.log(todos[0] instanceof Todo); // -> true
  ```
  @codepen

  @return {Constructor} An extended `ObservableArray` constructor with definitions from [can-observable-object/object.static.props].

@signature `new ObservableArray([items])`

  Creates an instance of a ObservableArray or an extended ObservableArray with enumerated properties from `items`.

  ```js
  import { ObservableArray } from "can/everything";

  const people = new ObservableArray(
  	{ first: "Justin", last: "Meyer" },
  	{ first: "Paula", last: "Strozak" }
  );
  ```

  @param {Array} items Array of items to be added to the array. If [can-observable-array/static.items] is defined, each item will run through the type converter.

  @return {can-observable-array} An instance of `ObservableArray` with the values from _items_.

@body

## Mixed-in instance methods and properties

Instances of `ObservableArray` have all methods and properties from
[can-event-queue/map/map]:

{{#each (getChildren [can-event-queue/map/map])}}
- [{{name}}] - {{description}}{{/each}}

Example:

```js
class MyArray extends ObservableArray {
  static items = String;
}

const listInstance = new MyArray(["a", "b"]);

listInstance.on( "length", function( event, newLength, oldLength ) { /* ... */ } );
```

`ObservableArray` [class fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Class_fields) are also observables, example:


 ```js
import { ObservableArray } from "can/everything";

class MyArray extends ObservableArray {
  prop = ['foo', 'bar'];
}

const myInstance = new MyArray();

myInstance.on( "prop", ( event, newVal, oldVal ) => {
	console.log( newVal ); //-> ['baz']
	console.log( oldVal ); //-> ['foo', 'bar']
});

myInstance.prop = ['baz'];
```


## Mixed-in type methods and properties

Extended `ObservableArray` classes have all methods and properties from
[can-event-queue/type/type]:

{{#each (getChildren [can-event-queue/type/type])}}
- [{{name}}] - {{description}}{{/each}}

Example:

```js
class MyArray extends ObservableArray {
  static items = String;
}

canReflect.onInstancePatches( MyArray, ( instance, patches ) => {
  console.log(patches, instance);
});

people.pop(); // [{index:2, deleteCount:1, type:'splice'}] ["alice", "bob"]
people.unshift( "Xerxes" ); // [{index:0, deleteCount:0, insert':['Xerxes'], type':'splice'}] ["Xerxes", "alice", "bob"]
```
@codepen

## Using

The `can-observable-array` package exports a `ObservableArray` class.  It can be used
with `new` to create observable lists.  For example:

```js
import { ObservableArray } from "can/everything";
const list = new ObservableArray([ "a", "b", "c" ]);
console.log(list[ 0 ]); //-> "a";

list.push( "x" );
list.pop(); //-> "x"
```
@codepen

It can also be extended to define custom observable list types with `extends`.  For example, the following defines a `StringList` type where every item is converted to a string by specifying the [can-observable-array/static.items items definition]:

```js
import { ObservableArray, type } from "can/everything";

class StringList extends ObservableArray {
  static items = {
    type: type.convert(String)
  }
}

const strings = new StringList([ 1, new Date( 1475370478173 ), false ]);

console.log(strings[ 0 ]); //-> "1"
console.log(strings[ 1 ]); //-> "Sat Oct 01 2016 20:07:58 GMT-0500 (CDT)"
console.log(strings[ 2 ]); //-> "false"
```
@codepen

Non-numeric properties can also be defined on custom ObservableArray type.  The following
defines a `completed` property that returns the completed todos:

```js
import { ObservableArray, ObservableObject, type } from "can/everything";

class Todo extends ObservableObject {
  static props = {
    complete: false
  };
}

class TodoList extends ObservableArray {
  static items = type.convert(Todo);
  get completed() {
    return this.filter( { complete: true } );
  }
}

const todos = new TodoList([ { complete: true }, { complete: false } ]);
console.log(todos.completed.length); //-> 1
```
@codepen
