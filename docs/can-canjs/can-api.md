@page api API Docs
@parent canjs 2
@group can-observables 1 Observables
@group can-views 2 Views
@group can-data-modeling 3 Data Modeling
@group can-routing 4 Routing
@group can-js-utilities 5 JS Utilities
@group can-dom-utilities 6 DOM Utilities
@group can-data-validation 7 Data Validation
@group can-typed-data 8 Typed Data
@group can-polyfills 9 Polyfills
@outline 1
@package ../../package.json
@templateRender <% %>
@subchildren
@description Welcome to the CanJS API documentation!
This page is a CHEAT-SHEET for the most common APIs within CanJS. Read the
[guides/technology-overview] page for background on the following APIs.

@body

<style>
.hidden-codepen {
	display: none;
}
.hidden-codepen + .codepen {
	border: none;
	position: relative;
	text-align: left;
	background: none;
	color: #3e7abe;
	padding: 0px;
	cursor: pointer;
	margin-bottom: 15px;
	top: 0px;
	text-decoration: underline;
}
.hidden-codepen + .codepen:hover {
	color: #4078c0;
	background-color: unset;
}
.hidden-codepen + .codepen:before {
	content: "See the previous examples in your browser!";
}
</style>

## Custom Element Basics

Custom elements are defined with [can-stache-element StacheElement]. 
The following defines a `<my-counter>` widget and includes it in the page:

```html
<!-- Adds the custom element to the page -->
<my-counter></my-counter>

<script type="module">
import { StacheElement } from "can";

// Extend StacheElement to define a custom element
class Counter extends StacheElement {
	// The HTML content within the custom element.
	//  - {{ this.count }} is a `stache` magic tag.
	//  - `on:click` is a `stache` event binding.
	// Read the VIEWS section below for more details. 👀
	static view = `
		Count: <span>{{ this.count }}</span>
		<button on:click="this.increment()">+1</button>
	`;

	// Defines the properties used in the view of this custom element.
	// Read the OBSERVABLES section below for more details. 👀
	static props = {
		count: 0
	};

	increment() {
		this.count++;
	}
}

// Make <my-counter></my-counter> custom element works in the HTML
customElements.define("my-counter", Counter);
</script>
```
@codepen

 An element's:

- [can-stache-element/static.props properties] are defined with the [api#Observables Observables] APIs documented below.
- [can-stache-element/static.view view] is defined with the [api#Views Views] APIs documented below.
- tag name is defined with [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define).


## Observables

Define custom observable key-value types with [can-observable-object ObservableObject].
`ObservableObject` is used to organize the logic of both your [can-stache-element StacheElement] props and your [api#DataModeling Data Models]. The logic
is expressed as properties and methods.

The following defines a `Todo` type with numerous property behaviors and
a `toggleComplete` method.

```js
import { ObservableObject, type } from "can";

// -------------------------------
// Define an observable Owner type:
// -------------------------------
class Owner extends ObservableObject {
  static props = {
    first: String,
    last: String
  };
}

// -------------------------------
// Define an observable Todo type:
// -------------------------------
class Todo extends ObservableObject {
  static props = {
    name: string,
    complete: false
  };

    // `toggleComplete` is a method
    toggleComplete() {
        this.complete = !this.complete;
    }
}

// Create a todo instance:
const todo = new Todo({ name: "Learn Observables" });
```
@codepen

<details>
<summary>Define Observable and observable list types with [can-observable-object ObservableObject] and [can-observable-array ObservableArray]:</summary>

```js
import { ObservableArray, type } from "can";
import Todo from "//canjs.com/demos/api/todo.mjs";

class Todo extends ObservableObject {
	static props = {
		// `id` is a Number
		// and uniquely identifies instances of this type.
		id: { type: Number, identity: true },

		// `complete` is a Boolean and defaults to `false`.
		complete: {
			type: Boolean,
			default: false
		},

		// `dueDate` is a Date
		dueDate: Date,

		// `isDueWithin24Hours` property returns if the `.dueDate`
		// is in the next 24 hrs. This is a computed property.
		get isDueWithin24Hours() {
			let msLeft = this.dueDate - new Date();
			return msLeft >= 0 && msLeft <= 24 * 60 * 60 * 1000;
		},

		// `name` is a String.
		name: String,

		// `nameChangeCount` increments when `name` changes.
		nameChangeCount: {
			value({ listenTo, resolve }) {
				let count = resolve(0);
				listenTo("name", () => {
					resolve(++count);
				});
			}
		},

		// Owner is a custom ObservableObject with a first and
		// last property. Whenever `owner` is set, the value
		// will be converted to the Owner type.
		owner: type.convert(Owner),

		// `tags` is an observable array of items that
		// defaults to including "new"
		tags: {
			get default() {
				return new ObservableArray(["new"]);
			}
		},
	};

	// `toggleComplete` is a method
	toggleComplete() {
		this.complete = !this.complete;
	}
}

// -----------------------------------------------------------
// Create and use instances of the observable key-value type:
// -----------------------------------------------------------

// Create a todo instance:
const todo = new Todo({ name: "Learn Observables" });

// Change a property:
todo.dueDate = new Date(new Date().getTime() + 1000 * 60 * 60);

// Listen to changes
todo.listenTo("nameChangeCount", ({ value }) => {
	console.log(value); //-> 1
});

let handler = ({ value }) => {
	console.log(value); //-> "Learn observables"
};
todo.listenTo("name", handler);

todo.name = "Learn observables";

// Stop listening to changes
todo.stopListening("name", handler);

// Stop listening to all registered handlers
todo.stopListening();

// Call a method
todo.toggleComplete();
console.log(todo.complete); //-> true

// Assign properties
todo.assign({
	owner: {
		first: "Justin",
		last: "Meyer"
	}
});

// Serialize to a plain JavaScript object
console.log(todo.serialize()); //-> {
//		complete: true,
//		dueDate: Date,
//		name: "Learn observables",
//		owner: { first: "Justin", last: "Meyer" },
//		tags: ["new"]
// }

// -----------------------------------
// Define an observable TodoList type:
// -----------------------------------
class TodoList extends ObservableArray {
	// Specify the behavior of items in the TodoList
	static items = type.convert(Todo);

	// Create a computed `complete` property
	get complete() {
		// Filter all complete todos
		return this.filter({ complete: true });
	}
}

// -----------------------------------
// Create and use instances of observable list types:
// -----------------------------------

/// Create a todo list
const todos = new TodoList([
	{ id: 1, name: "learn observable lists" },
	new Todo({ id: 2, name: "mow lawn", complete: true })
]);

// Read the length and access items
console.log(todos.length); //-> 2
console.log(todos[0]); //-> Todo { id: 1, name: "learn observable lists" }

// Read properties
console.log(todos.complete); //-> TodoList[Todo{ id: 2, name: "mow lawn", complete: true }]

// Listen for changes:
// TODO
todos.listenTo("length", ({ value }) => {
	console.log(value); //-> 1
});

// Make changes:
todos.pop();

// Call non-mutating methods
const areSomeComplete = todos.some((todo) => {
	return todo.complete === true;
});
console.log(areSomeComplete); //-> false
```
@codepen

</details>

## Typed properties

[can-type] is helpful to define typed properties for models and components by doing the following:
- Validates properties `value` types
- Converts a value to a type
- Allows `undefined` / `null` to be values 
- Converts a value to the correct type if not `null` / `undefined`

Also, you can use the defined custom types as value types, for example the following defines a `User` type 
that has a `person` property with `Person` type:

```js
import { ObservableObject, type } from "can";

class Person extends ObservableObject {
  static props = {
    first: type.check(String),  // type checking is the default behavior
    last: type.maybe(String),   // maybe null, undefined or string
    age: type.convert(Number),  // converts the value to number
    birthday: type.maybeConvert(Date) // converts the value to date if is defined 
  };
};

class User extends ObservableObject {
  static props = {
    username: type.check(String, requried: true),
    password: type.check(String, required: true),
    lastLogin: type.maybeConvert(Date)
    person: type.check(Person)
  }
};

const aPerson = new Person({
  first: "Fibonacci",
  last: null,
  age: "80",
  birthday: undefined
})

const fib = new User({
  username: "fib",
  password: "011235",
  lastLogin: null,
  person: aPerson
});

console.log(fib); // ->User{ ... }
```

## Views

Render a template that updates the page when any data changes using [can-stache]:

```js
import { stache } from "can";
import Todo from "//canjs.com/demos/api/todo.mjs";

// Create a template / view
let view = stache(`<p>I need to {{ this.name }}</p>`);

const todo = new Todo({ name: "learn views" });

// Render the template into document fragment
let fragment = view(todo);

// Insert fragment in the page
document.body.appendChild(fragment);
```
@codepen




Common [can-stache] tags and built in helpers:

<table>
<tr>
    <th>View</th>
    <th>Data</th>
    <th>Result</th>
</tr>
<tr>
<td>

```html
<p>{{ this.value }}</p>
```

</td>
<td>

```js
{ value: "<b>esc</b>" }
```

</td>
<td>

```html
<p>&gt;b&lt;esc&gt;/b&lt;</p>
```

</td>
</tr>

<tr>
<td>

<div class="code-toolbar"><pre class=" line-numbers language-html"><code class=" language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>&#123;{{ this.value }}}<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span><span aria-hidden="true" class="line-numbers-rows"><span></span></span></code></pre><div class="toolbar"><div class="toolbar-item"><a>Copy</a></div></div></div>

</td>
<td>

```js
{ value: "<b>unescape</b>" }
```

</td>
<td>

```html
<p><b>unescape</b></p>
```

</td>
</tr>

<tr>
<td>

```html
<p>
  {{# if(this.value) }}
    Hi
  {{ else }}
    Bye
  {{/ if }}
</p>
```

</td>
<td>

```js
{ value: true }







```

</td>
<td>

```html
<p>

     Hi  

</p>



```

</td>
</tr>

<tr>
<td>

```html
<p>
  {{# if(this.promise.isPending) }}
    Pending
  {{/ if }}
  {{# if(this.promise.isRejected) }}
    Rejected {{ promise.reason }}
  {{/ if }}
  {{# if(this.promise.isResolved) }}
    Resolved {{ promise.value }}
  {{/ if }}
</p>
```

</td>
<td>

```js
{
  promise:
    Promise.resolve("Yo")
}








```

</td>
<td>

```html
<p>

     Resolved Yo

</p>







```

</td>
</tr>


<tr>
<td>

```html
<ul>
  {{# for(todo of this.todos) }}
    <li>
      {{ todo.name }}-{{ this.owner }}
    </li>
  {{/ for }}
</ul>


```

</td>
<td>

```js
{
  todos: [
    { name: "lawn" },
    { name: "dishes" }
  ],
  owner: "Justin"
}


```

</td>
<td>

```html
<ul>
  <li>
    lawn-Justin  
  <li>
  <li>
    dishes-Justin  
  <li>
</ul>
```

</td>
</tr>

<tr>
<td>

```html
<ul>
  {{# for(todo of todos) }}
    <li> ... </li>
  {{ else }}
    <li>No todos</li>
  {{/ for }}
</ul>
```

</td>
<td>

```js
{
  todos: [],
  owner: "Justin"
}




```

</td>
<td>

```html
<ul>

  <li>No todos</li>

</ul>



```

</td>
</tr>

<tr>
<td>

```html
<p>
  {{# eq(this.value, 22) }}
    YES
  {{ else }}
    NO
  {{/ eq }}
</p>
```

</td>
<td>

```js
{
  value: 22
}





```

</td>
<td>

```html
<p>

     YES  

</p>



```

</td>
</tr>


<tr>
<td>

```html
<p>
  {{ let first = this.value.first }}
  {{ first }} {{ this.value.last }}
</p>



```

</td>
<td>

```js
{
  value: {
    first: "Bohdi",
    last: "Meyer"
  }
}

```

</td>
<td>

```html
<p>

     Bohdi Meyer  

</p>


```

</td>
</tr>

</table>
<div class='hidden-codepen'>

```html
<stache-examples></stache-examples>

<script type="module">
	import { StacheElement } from "can";

	// Extend StacheElement to define a custom element
	class StacheExamples extends StacheElement {
		static view = `
			<p>{{ this.escapeValue }}</p>
			<p>{{{ this.unescapeValue }}}</p>
			<p>
				{{# if(this.truthyValue) }}
					Hi
				{{ else }}
					Bye
				{{/ if }}
			</p>
			<p>
				{{# if(this.promise.isPending) }}
					Pending
				{{/ if }}
				{{# if(this.promise.isRejected) }}
					Rejected {{ this.promise.reason }}
				{{/ if }}
				{{# if(this.promise.isResolved) }}
					Resolved {{ this.promise.value }}
				{{/ if }}
			</p>
			<ul>
				{{# for(todo of this.todos) }}
					<li>
						{{ todo.name }}-{{ this.owner.first }}
					</li>
				{{/ for }}
			</ul>
			<p>
				{{# eq(this.eqValue, 22) }}
					YES
				{{ else }}
					NO
				{{/ eq }}
			</p>
			<p>
				{{ let first = this.owner.first }}
				{{ first }} {{ this.owner.last }}
			</p>
		`;
		static props = {
			escapeValue: "<b>esc</b>",
			unescapeValue: "<b>unescape</b>",
			truthyValue: true,
			promise: {
				get default() {
					return Promise.resolve("Yo");
				}
			},
			todos: {
				get default() {
					return [{ name: "lawn" }, { name: "dishes" }];
				}
			},
			owner: {
				get default() {
					return {
						first: "Bohdi",
						last: "Meyer"
					};
				}
			},
			eqValue: 22
		};
	}

	customElements.define("stache-examples", StacheExamples);
</script>
```

</div>
@codepen


Common [can-stache] expressions:

<table>
<tr>
    <th>View</th>
    <th>Data</th>
    <th>Result</th>
</tr>
<tr>
<td>

```html
<p>{{ [key] }}</p>




```

</td>
<td>

```js
{
  key: "age",
  age: 3
}
```

</td>
<td>

```html
<p>3</p>




```

</td>
</tr>

<tr>
<td>

```html
<p>{{ add(age, 2) }}</p>






```

</td>
<td>

```js
{
  add(v1, v2){
    return v1+v2;
  },
  age: 3
}
```

</td>
<td>

```html
<p>5</p>






```

</td>
</tr>

<tr>
<td>

```html
<p>{{ add(v1=age v2=2) }}</p>






```

</td>
<td>

```js
{
  add(vals){
    return vals.v1+vals.v2;
  },
  age: 3
}
```

</td>
<td>

```html
<p>5</p>






```

</td>
</tr>





</table>
<div class='hidden-codepen'>

```html
<stache-examples></stache-examples>

<script type="module">
import { StacheElement } from "can";

// Extend StacheElement to define a custom element
class StacheExamples extends StacheElement {
	static view = `
		<p>{{ [key] }}</p>
		<p>{{ addArgs(age, 2) }}</p>
		<p>{{ addProps(v1=age v2=2) }}</p>
	`;
	static props = {
		age: 3,
		key: "age",
		addArgs(v1, v2) {
			return v1 + v2;
		},
		addProps(vals) {
			return vals.v1 + vals.v2;
		}
	};
}

customElements.define("stache-examples", StacheExamples);
</script>
```

</div>
@codepen

## Element Bindings

Listen to events on elements, read data, write data, or cross-bind data on elements with [can-stache-bindings]:

<table>
<tr>
    <th>View</th>
    <th>Roughly Equivalent Code</th>
</tr>
<tr>
<td>

```js
<input value:from='todo.name'/>



```

</td>

<td>

```js
todo.on("name", () => {
  input.value = todo.name;
});
```

</td>
</tr>

<tr>
<td>

```js
<input value:to='todo.name'/>



```

</td>

<td>

```js
input.addEventListener("change", () => {
  todo.name = input.value;
});
```

</td>
</tr>

<tr>
<td>

```js
<input on:input:value:to='todo.name'/>



```

</td>

<td>

```js
input.addEventListener("input", () => {
  todo.name = input.value;
});
```

</td>
</tr>

<tr>
<td>

```js
<input value:bind='name'/>






```

</td>

<td>

```js
todo.on("name", () => {
  input.value = todo.name;
});
input.addEventListener("change", () => {
  todo.name = input.value;
});
```

</td>
</tr>
<tr>
<td>

```js
<input on:change='todo.method()'/>
```

</td>

<td>

```js
input.onchange = todo.method;
```

</td>
</tr>
<tr>
<td>

```js
<button on:click='todo.priority = 1'>
  Critical
</button>
```

</td>

<td>

```js
button.addEventListener("click", () => {
  todo.priority = 1;
});
```

</td>
</tr>

<tr>
<td>

```js
<div on:name:by:todo='this.shake(scope.element)'/>



```

</td>

<td>

```js
todo.on("name", () => {
	this.shake(div);
});
```

</td>
</tr>

</table>
<div class='hidden-codepen'>

```html
<stache-examples></stache-examples>
<style>
.shake {
    /* Start the shake animation and make the animation last for 0.5 seconds */
    animation: shake 0.5s;
}
@@keyframes shake {
    0% { transform: translate(1px, 1px) rotate(0deg); }
    10% { transform: translate(-1px, -2px) rotate(-1deg); }
    20% { transform: translate(-3px, 0px) rotate(1deg); }
    30% { transform: translate(3px, 2px) rotate(0deg); }
    40% { transform: translate(1px, -1px) rotate(1deg); }
    50% { transform: translate(-1px, 2px) rotate(-1deg); }
    60% { transform: translate(-3px, 1px) rotate(0deg); }
    70% { transform: translate(3px, 1px) rotate(-1deg); }
    80% { transform: translate(-1px, -1px) rotate(1deg); }
    90% { transform: translate(1px, 2px) rotate(0deg); }
    100% { transform: translate(1px, -2px) rotate(-1deg); }
}
</style>
<script type="module">
import { StacheElement, ObservableObject } from "can";

// Extend StacheElement to define a custom element
class StacheExamples extends StacheElement {
	static view = `
		<p>Updates when the todo's name changes:
			<input value:from='this.todo.name'/>
		</p>
		<p>Updates the todo's name when the input's <code>change</code> event fires:
			<input value:to='this.todo.name'/>
		</p>
		<p>Updates the todo's name when the input's <code>input</code> event fires:
			<input on:input:value:to='this.todo.name'/>
		</p>
		<p>Updates when the todo's name changes and update the
			todo's name when the input's <code>change</code> event fires:
			<input value:bind='this.todo.name'/>
		</p>
		<p>Calls the todo's <code>sayHi</code> method when the button
		   is clicked:
			<button on:click="this.todo.sayHi()">Say Hi</button>
		</p>
		<p>Animate the div when the todo's <code>name</code> event fires:
			<div on:name:by:todo='this.shake(scope.element)'
				on:animationend='this.removeShake(scope.element)'>
				{{ this.todo.name }}
			</div>
		</p>
	`;

	static props = {
		sayHi() {
			console.log("the element says hi");
		},
		shake(element) {
			element.classList.add("shake");
		},
		removeShake(element) {
			element.classList.remove("shake");
		},
		todo: {
			get default() {
				return new ObservableObject({
					name: "",
					sayHi() {
						console.log("the todo says hi");
					}
				});
			}
		}
	};
}

customElements.define("stache-examples", StacheExamples);
</script>
```

</div>
@codepen

## Custom Element Bindings

Similar to the bindings on normal elements in the previous section &mdash; you can
listen to events on custom elements, read, write or cross-bind an element’s properties with [can-stache-bindings].

The following shows examples of passing data to and from
the `<my-counter>` element in the [api#CustomElementBasics Custom Elements Basics]
section:

```html
<!-- Listens to when count changes and passes the value to doSomething -->
<my-counter on:count="this.doSomething(scope.element.count)"></my-counter>

<!-- Starts counting at 3 -->
<my-counter count:from="3"></my-counter>

<!-- Starts counting at startCount -->
<my-counter count:from="this.startCount"></my-counter>

<!-- Update parentCount with the value of count -->
<my-counter count:to="this.parentCount"></my-counter>

<!-- Cross bind parentCount with count -->
<my-counter count:bind="this.parentCount"></my-counter>
```

<div class='hidden-codepen'>

```html
<!-- Adds the custom element to the page -->
<my-app></my-app>

<script type="module">
import { StacheElement } from "can";

class MyCounter extends StacheElement {
	static view = `
		Count: <span>{{ this.count }}</span>
		<button on:click='this.increment()'>+1</button>
	`;
	static props = {
		count: { default: 0 },
		increment() {
			this.count++;
		}
	};
}
customElements.define("my-counter", MyCounter);

class MyApp extends StacheElement {
	static view = `
		<p>Calls <code>sayHi</code> when <code>count</code> changes.
			<my-counter on:count="this.sayHi(scope.element.count)"></my-counter>
		</p>
		<p>Start counting at 3.
			<my-counter count:from="3"></my-counter>
		</p>
		<p>Start counting at <code>startCount</code> ({{ this.startCount }}).
			<my-counter count:from="this.startCount"></my-counter>
		</p>
		<p>Update <code>parentCount</code> ({{ this.parentCount }}) with the value of count.
			<my-counter count:to="this.parentCount"></my-counter>
		</p>
		<p>Update <code>bindCount</code> ({{this.bindCount}}) with the value of count.
			<my-counter count:bind="this.bindCount"></my-counter>
		</p>
	`;

	static props = {
		sayHi(count) {
			console.log("MyApp says hi with", count);
		},
		startCount: { default: 4 },
		parentCount: {},
		bindCount: { default: 10 }
	};
}
customElements.define("my-app", MyApp);

</script>
```

</div>
@codepen

You can also pass data to custom elements directly in html using [can-observable-bindings/fromAttribute]:

```html
<!-- pass count directly to the <my-counter> element -->
<my-counter count="5"></my-counter>
```

<div class='hidden-codepen'>

```html
<!-- pass count directly to the <my-counter> element -->
<my-counter count="5"></my-counter>

<script type="module">
import { StacheElement, type, fromAttribute } from "can";

class MyCounter extends StacheElement {
	static view = `
		Count: <span>{{ this.count }}</span>
		<button on:click='this.increment()'>+1</button>
	`;
	static props = {
		count: { type: type.convert(String), default: 0, bind: fromAttribute },
		increment() {
			this.count++;
		}
	};
}
customElements.define("my-counter", MyCounter);

</script>
```

</div>
@codepen

Pass [can-stache.tags.named-partial can-stache renderers] to custom elements to customize layout:

```js
{{< incrementButton }}
	<button on:click="this.add(5)">ADD 5!</button>
{{/ incrementButton }}

{{< countDisplay }}
	You have counted to {{ this.count }}!
{{/ countDisplay }}

<my-counter count:from="5" incrementButton:from="incrementButton" countDisplay:from="countDisplay"></my-counter>
```

Use [can-stache/expressions/call call expressions] to call the passed renderer or the 
[can-observable-object/define/default default renderers] if one was not provided.

```js
import { StacheElement } from "can";

class MyCounter extends StacheElement {
	static view = `
		{{ incrementButton(this) }}
		{{ countDisplay(this) }}
	`;
	static props = {
		incrementButton() {
			return `<button on:click="add(1)">+1</button>`;
		},
		countDisplay() {
			return `{{ this.count }}`;
		},
		count: 0,
		add(increment) {
			this.count += increment;
		}
	};
}
customElement.define("my-counter", MyCounter);
```

<div class='hidden-codepen'>

```html
<!-- Adds the custom element to the page -->
<my-app></my-app>

<script type="module">
import { StacheElement } from "can";

class MyCounter extends StacheElement {
	static view = `
		{{ incrementButton(this) }}
		{{ countDisplay(this) }}
	`;
	static props = {
		incrementButton() {
			return `<button on:click="add(1)">+1</button>`;
		},
		countDisplay() {
			return `{{ this.count }}`;
		},
		count: 0,
		add(increment) {
			this.count += increment;
		}
	};
}
customElements.define("my-counter", MyCounter);

class MyApp extends StacheElement {
	static view = `
		{{< incrementButton }}
			<button on:click="this.add(5)">ADD 5!</button>
		{{/ incrementButton }}

		{{< countDisplay }}
			You have counted to {{ this.count }}!
		{{/ countDisplay }}

		<my-counter count:from="5" incrementButton:from="incrementButton" countDisplay:from="countDisplay"></my-counter>
	`;
}
customElements.define("my-app", MyApp);
</script>
```

</div>
@codepen


## Data Modeling

Connect data types to a restful service with [can-rest-model]:

```js
import { restModel } from "can";
import Todo from "//canjs.com/demos/api/todo.mjs";
import TodoList from "//canjs.com/demos/api/todo-list.mjs";

const todoConnection = restModel({
    ObjectType: Todo,
    ArrayType: TodoList,
    url: "/api/todos/{id}"
});
```
@codepen

Retrieve, create, update and destroy data programmatically:

<table>
<tr>
    <th>JavaScript API</th>
    <th>Request</th>
    <th>Response</th>
</tr>
<tr>
<td>

```js
Todo.getList({
  // Selects only the todos that match
  filter: {
    complete: { $in: [false, null] }
  },
  // Sort the results of the selection
  sort: "-name",
  // Paginate the sorted result
  page: { start: 0, end: 19 }
}) //-> Promise<TodoList[]>
```

</td>
<td>

```
GET /api/todos?
  filter[complete][$in][]=false&
  filter[complete][$in][]=null&
  sort=-name&
  page[start]=0&
  page[end]=19





```

</td>
<td>

```js
{
  "data": [
    {
      "id": 20,
      "name": "mow lawn",
      "complete": false
    },
    // ...
  ]
}
```

</td>
</tr>
<tr>
<td>

```js
Todo.get({
  id: 5
}) //-> Promise<Todo>



```

</td>
<td>

```
GET /api/todos/5





```

</td>
<td>

```js
{
  "id": 5,
  "name": "do dishes",
  "complete": true
}
```

</td>
</tr>
<tr>
<td>

```js
const todo = new Todo({
  name: "make a model"
})
todo.save()  //-> Promise<Todo>


```

</td>
<td>

```
POST /api/todos
    {
      "name": "make a model",
      "complete": false
    }
```

</td>
<td>

```js
{
  "id": 22,
  "name": "make a model",
  "complete": false
}
```

</td>
</tr>
<tr>
<td>

```js
todo.complete = true;
todo.save()  //-> Promise<Todo>




```

</td>
<td>

```
PUT /api/todos/22
    {
      "name": "make a model",
      "complete": true
    }
```

</td>
<td>

```js
{
  "id": 22,
  "name": "make a model",
  "complete": true
}
```

</td>
</tr>
<tr>
<td>

```js
todo.destroy()  //-> Promise<Todo>


```

</td>
<td>

```
DELETE /api/todos/22


```

</td>
<td>

```
Successful status code (2xx).
Response body is not necessary.
```

</td>
</tr>
</table>




Check the status of request:

```js
const todo = new Todo({ name: "make a model"});

// Return if the todo hasn't been persisted
todo.isNew()    //-> true

// Listen to when any todo is created:
Todo.on("created", (ev, todo) => {});

let savedPromise = todo.save();

// Return if the todo is being created or updated
todo.isSaving() //-> true

savedPromise.then(() => {
    todo.isNew() //-> false
    todo.isSaving() //-> false

    let destroyedPromise = todo.destroy();

    // Return if the todo is being destroyed
    todo.isDestroying() //-> true

    destroyedPromise.then(() => {
        todo.isDestroying() //-> false
    })
});
```


Connect data types to a restful service and have CanJS automatically manage
adding and removing items from lists with [can-realtime-rest-model]:

```js
import { realtimeRestModel } from "can";

// Define a real time restful model
const todoConnection = realtimeRestModel({
    ObjectType: Todo,
    ArrayType: Todo.List,
    url: "/api/todos/{id}"
});

// Update instances and lists from server-side events:
var loc = window.location;
const socket = new WebSocket('ws://'+loc.host+loc.pathname+"/ws");

socket.addEventListener("todo-created",(event) => {
    todoConnection.createInstance( JSON.parse(event.data) );
});

socket.addEventListener("todo-updated",(event) => {
    todoConnection.updateInstance( JSON.parse(event.data) );
});

socket.addEventListener("todo-removed",(event) => {
    todoConnection.destroyInstance( JSON.parse(event.data) );
});
```

Simulate a service layer where you can create, retrieve, update and delete (CRUD)
records:

```js
import { fixture } from "can";

let todosStore = fixture.store([
    { id: 0, name: "use fixtures", complete: false }
], Todo);

fixture("/api/todos/{id}", todosStore);
```

## Routing

Define routing rules and initialize routing with [can-route]:

```js
import { route } from "can";

// Create two-way routing rule:
route.register("{page}", { page: "home" });

// Define routing data type
class RouteData extends ObservableObject {
	static props = {
		page: String
	};
}

// Connect routing system to an instance
// of the routing data type
route.data = new RouteData();
// begin routing
route.start();


// Provide access to the route data to your application component
class MyApp extends StacheElement {
	static view = '<page-picker page:from="this.routeData.page"/>';

	static props = {
		routeData: {
			get default() {
				return route.data;
			}
		}
	};
}
```

Create responsive links in [can-stache] views with [can-stache-route-helpers]:


```html
<a href="{{ routeUrl(page='todos') }}"
   class="{{# routeCurrent(page='todos') }}
            inactive
          {{ else }}
            active
          {{/ routeCurrent }}">Todos
</a>
```


## Utilities

Make AJAX requests with [can-ajax]:

```js
import { ajax } from "can-ajax";

ajax({
    url: "http://query.yahooapis.com/v1/public/yql",
    data: {
        format: "json",
        q: 'select * from geo.places where text="sunnyvale, ca"'
    }
}) //-> Promise<Object>
````

Perform differences with [can-diff]:

```js
diff.list(["a","b"], ["a","c"])
//-> [{ type: "splice", index: 1, deleteCount: 1, insert: ["c"] }]

diff.map({ a: "a" },{ a: "A" })
//-> [{ type: "set", key: "a", value: "A" }]
```

Read and store the results of [feature detection](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Feature_detection) with [can-globals]:

```js
import { globals } from "can";

globals.getKeyValue("isNode")          //-> false
globals.getKeyValue("isBrowserWindow") //-> true
globals.getKeyValue("MutationObserver") //-> MutationObserver
```

Read and write nested values with [can-key]:

```js
import { key } from "can";

const task = {
    name: "learn can-key",
    owner: { name: { first: "Justin", last: "Meyer" } }
}

key.delete(task, "owner.name.first");
key.get(task, "owner.name.last") //-> "Meyer"
key.set(task, "owner.name.first", "Bohdi");
```

Parse a URI into its parts with [can-parse-uri]:

```js
import { parseURI } from "can";

parseURI("http://foo:8080/bar.html?query#change")
//-> {
//  authority: "//foo:8080",
//  hash: "#change",
//  host: "foo:8080",
//  hostname: "foo",
//  href: "http://foo:8080/bar.html?query#change",
//  pathname: "/bar.html",
//  port: "8080",
//  protocol: "http:",
//  search: "?query"
// }
```

Convert a string into another primitive type with [can-string-to-any]:

```js
import { stringToAny } from "can";
stringToAny( "NaN" ); // -> NaN
stringToAny( "44.4" ); // -> 44.4
stringToAny( "false" ); // -> false
```

Convert one string format to another string format with [can-string]:

```js
import { string } from "can";

string.camelize("foo-bar")) //-> "fooBar"
string.capitalize("foo")    //-> "Foo"
string.esc("<div>foo</div>")//-> "&lt;div&gt;foo&lt;/div&gt;"
string.hyphenate("fooBar")  //-> "foo-bar"
string.underscore("fooBar") //-> "foo_bar"
```

Operate on any data type with [can-reflect]:

```js
import { Reflect } from "can";

// Test the type:
Reflect.isBuiltIn(new Date()) //-> true
Reflect.isBuiltIn(new Todo()) //-> false
Reflect.isConstructorLike(function(){}) //-> false
Reflect.isConstructorLike(Date)         //-> true
Reflect.isListLike([]) //-> true
Reflect.isListLike({}) //-> false
Reflect.isMapLike([]) //-> true
Reflect.isMapLike({}) //-> true
Reflect.isMoreListLikeThanMapLike([]) //-> true
Reflect.isMoreListLikeThanMapLike({}) //-> false
Reflect.isObservableLike(new Todo()) //-> true
Reflect.isObservableLike({})         //-> false
Reflect.isPlainObject({})         //-> true
Reflect.isPlainObject(new Todo()) //-> false
Reflect.isPromiseLike(Promise.resolve()) //-> true
Reflect.isPromiseLike({})                //-> false
Reflect.isValueLike(22) //-> true
Reflect.isValueLike({}) //-> false

// Read and mutate key-value data
const obj = {};
Reflect.setKeyValue(obj,"prop","VALUE");
Reflect.getKeyValue(obj,"prop") //-> "VALUE"
Reflect.deleteKeyValue(obj,"prop","VALUE");

Reflect.assign(obj, { name: "Payal" });
```

Create types that work with [can-reflect.convert] using [can-type]:

```js
import { Reflect, type } from "can";

const MaybeNumber = type.maybe(Number);

Reflect.convert(42, MaybeNumber); // -> 42
Reflect.convert(null, MaybeNumber); // -> null
Reflect.convert(undefined, MaybeNumber); // -> undefined
Reflect.convert("hello world", MaybeNumber); // throws!

const ConvertString = type.convert(String);

Reflect.convert(42, ConvertString); // -> "42"
Reflect.convert(null, ConvertString); // -> "null"
Reflect.convert(undefined, ConvertString); // -> "undefined"
Reflect.convert("hello world", ConvertString); // -> "hello world"

const MaybeConvertBoolean = type.maybeConvert(Boolean);

Reflect.convert("false", MaybeConvertBoolean); // -> false
Reflect.convert(null, MaybeConvertBoolean); // -> null
Reflect.convert(undefined, MaybeConvertBoolean); // -> undefined
Reflect.convert("hello world", MaybeConvertBoolean); // -> true

const StrictNumber = type.check(Number);

Reflect.convert(42, StrictNumber); // -> 42
Reflect.convert(null, StrictNumber); // throws!
Reflect.convert(undefined, StrictNumber); // throws!
Reflect.convert("hello world", StrictNumber); // throws!
```
