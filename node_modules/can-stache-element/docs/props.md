@function can-stache-element/static.props props
@parent can-stache-element/static 1

@description A static property used to create [can-observable-object ObservableObject]-like properties on each `StacheElement` instance.

@signature `static props = { ... };`

  To manage the logic and state of an element, [can-observable-object ObservableObject]-like property definitions can be added to explicitly configure how an element's properties are defined.

  To add property definitions, add a `static` class field like shown below.

  ```js
  import { StacheElement } from "can";

  class TodoItem extends StacheElement {
	  static props = {
		  name: String,
		  completed: false
	  };
  }
  customElements.define("todo-item", TodoItem);

  const todo = new TodoItem()
	  // `initialize` must be called for properties to be set up
	  .initialize({ name: "go grocery shopping" });

  todo.name; // -> "go grocery shopping"
  todo.completed; // -> false
  ```
  @codepen

  > Note: to see all the options supported by `props`, see [can-observable-object].

@signature `static get props() { return { ... }; }`

  For browsers that do not support class fields (and applications not using a transpiler), properties can be defined using a `static` getter like shown below.

  ```js
  class TodoItem extends StacheElement {
      static get props() {
          return {
              name: String,
              completed: false
          };
      }
  }
  customElements.define("todo-item", TodoItem);
  ```

  > Note: to see all the options supported by `props`, see [can-observable-object].

@body

## Use

Defining a property using a [can-observable-object/object.types.property shorthand] or [can-observable-object/object.types.definitionObject definition object] is a great way to encapsulate the logic and state of an element's properties.

Among other things, this can be used to create

  - typed properties using type checking or type conversion
  - declarative, derived properties
  - required properties

These are discussed below and the full set of options can be found in the [can-observable-object ObservableObject documentation].

### Typed properties

[can-observable-object#Typedproperties Typed properties] can be used to ensure that the value of an element's property is the expected type. Types are strict by default, but type conversion is also available for properties that do not need to be stricty typed through methods like [can-type/maybe type.maybe], [can-type/convert type.convert], and others.

The following example...

```js
import { StacheElement, type } from "can";

class Person extends StacheElement {
	static view = `
		<p>{{first}}</p>
		<p>{{last}}</p>
		<p>{{age}}</p>
		<p>{{birthday}}</p>
	`;
	static props = {
		first: String,
		last: type.maybe(String),
		age: type.convert(Number),
		birthday: type.maybeConvert(Date)
	};
}
customElements.define("per-son", Person);

let fib = new Person({
	first: "Fibonacci",
	last: null,
	age: "80",
	birthday: undefined
});

document.body.appendChild(fib);
```
@codepen
@highlight 11-14

### Declarative properties

[can-observable-object#Declarativeproperties Declarative properties] can be used to create properties that functionally derive their value from other property values. There are many options for creating declarative properties, including [can-observable-object/define/get getters], [can-observable-object/define/async asynchronous properties], and even techniques similar to [can-observable-object/define/value event streams and functional reactive programming].

The following example shows a few examples of declarative properties:

```html
<per-son></per-son>
<script type="module">
import { StacheElement } from "can";

class Person extends StacheElement {
	static view = `
		<p>First: <input value:bind="first"></p>
		<p>Last: <input value:bind="last"></p>
		<p>Full Name: {{fullName}}</p>
		<p>Name Changes: {{nameChangeCount}}</p>
	`;
	static props = {
		first: "Kevin",
		last: "McCallister",
		get fullName() {
			return `${this.first} ${this.last}`;
		},
		nameChangeCount: {
			value({ listenTo, resolve }) {
				let count = resolve(0);
				listenTo("fullName", () => {
					count = resolve(count++);
				});
			}
		}
	};
}
customElements.define("per-son", Person);
</script>
```
@codepen
@highlight 15-25

### Required properties

[can-observable-object/define/required Required properties] ensure that if an element is instantiated without a value for that property, an error will be thrown.

In the following example, an error is thrown because the `<to-do>` element is instantiated without a `name` property. To prevent this, the element should be created with a value for `name` like [can-stache-bindings <to-do name:raw="Go Shopping" />].

```html
<to-do></to-do>
<script type="module">
import { StacheElement } from "can";

class Todo extends StacheElement {
	static props = {
		name: { type: String, required: true }
	};
}
customElements.define("to-do", Todo);
</script>
```
@codepen
@highlight 7

For all of the options available for defining properties, see the [can-observable-object ObservableObject documentation].
