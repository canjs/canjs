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
    color: #4078c0;
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

Custom elements are defined with [can-component Component]. The following defines
a `<my-counter>` widget and includes it in the page:

```html
<!-- Adds the custom element to the page -->
<my-counter></my-counter>

<script type="module">
import { Component } from "can";

// Extend Component to define a custom element
Component.extend({

    // The name of the custom element
    tag: "my-counter",

    // The HTML content within the custom element.
    //  - {{count}} is a `stache` magic tag.
    //  - `on:click` is a `stache` event binding.
	// Read the VIEWS section below for more details. 👀
    view: `
        Count: <span>{{this.count}}</span>
        <button on:click='this.increment()'>+1</button>
    `,

    // Defines a DefineMap used to control the
    // logic of this custom element.
	// Read the OBSERVABLES section below for more details. 👀
    ViewModel: {
        count: {default: 0},
        increment() {
            this.count++;
        }
    }
});
</script>
```
@codepen

 A component's:

- [can-component.prototype.ViewModel] is defined with the [api#Observables Observables] APIs documented below.
- [can-component.prototype.view] is defined with the [api#Views Views] APIs documented below.

Also, the [api#ElementBindings Element Bindings] section shows how to pass data between
components.


## Observables

Define custom observable key-value types with [can-define/map/map DefineMap].
`DefineMap` is used to organize the logic of both your [can-component.prototype.ViewModel Component's ViewModel] and your [api#DataModeling Data Models]. The logic
is expressed as properties and methods. Property behaviors are defined within a [can-define.types.propDefinition].

The following defines a `Todo` type with numerous property behaviors and
a `toggleComplete` method.

```js
import {DefineMap} from "can";

// -------------------------------
// Define an observable Todo type:
// -------------------------------
const Todo = DefineMap.extend("Todo",{

    // `id` is a Number, null, or undefined and
    // uniquely identifies instances of this type.
    id: { type: "number", identity: true },

    // `complete` is a Boolean, null or undefined
    // and defaults to `false`.
    complete: { type: "boolean", default: false },

    // `dueDate` is a Date, null or undefined.
    dueDate: "date",

    // `isDueWithin24Hours` property returns if the `.dueDate`
    // is in the next 24 hrs. This is a computed property.
    get isDueWithin24Hours(){
        let msLeft = this.dueDate - new Date();
        return msLeft >= 0 && msLeft <= 24 * 60 * 60 * 1000;
    },

    // `name` is a String, null or undefined.
    name: "string",
    // `nameChangeCount` increments when `name` changes.
    nameChangeCount: {
        value({listenTo, resolve}) {
            let count = resolve(0);
            listenTo("name", ()=> {
                resolve(++count);
            })
        }
    },
	// `owner` is a custom DefineMap with a first and
	// last property.
    owner: {
        Type: {
            first: "string",
            last: "string"
        }
    },
	// `tags` is an observable list of items that
	// defaults to including "new"
	tags: {
		default(){
			return ["new"]
		}
	},
    // `toggleComplete` is a method
    toggleComplete(){
        this.complete != this.complete;
    }
});

// -----------------------------------------------------------
// Create and use instances of the observable key-value type:
// -----------------------------------------------------------

// Create a todo instance:
const todo = new Todo({name: "Learn Observables"});

// Change a property:
todo.dueDate = new Date().getTime() + 1000*60*60;

// Listen to changes
let handler = function(event, newValue, oldValue){
    console.log(newValue) //-> "Learn DefineMap"
};
todo.listenTo("name", handler);
todo.name = "Learn DefineMap";

// Stop listening to changes
todo.stopListening("name", handler);
// Stop listening to all registered handlers
todo.stopListening();

// Call a method
todo.toggleComplete();
console.log(todo.complete) //-> true

// Assign properties
todo.assign({
    owner: {
        first: "Justin", last: "Meyer"
    }
});

// Serialize to a plain JavaScript object
console.log( todo.serialize() ) //-> {
//     complete: true,
//     dueDate: Date,
//     name: "Learn DefineMap",
//     nameChangeCount: 1,
//     owner: {first: "Justin", last: "Meyer"},
//     tags: ["new"]
// }
```
@codepen

Define observable list types with [can-define/list/list]:

```js
import {DefineList} from "can";
import Todo from "//canjs.com/demos/api/todo.mjs";

// -----------------------------------
// Define an observable TodoList type:
// -----------------------------------
const TodoList = DefineList.extend("TodoList",{

    // Specify the behavior of items in the TodoList
    "#": {Type: Todo},

    // Create a computed `complete` property
    get complete(){
        // Filter all complete todos
        return this.filter({complete: true});
    }
});

// -----------------------------------
// Create and use instances of observable list types:
// -----------------------------------

// Create a todo list
const todos = new TodoList([
    {id: 1, name: "learn observable lists"},
    new Todo({id: 2, name: "mow lawn", complete: true})
])

// Read the length and access items
console.log(todos.length) //-> 2
console.log(todos[0]) //-> Todo{id: 1, name: "learn observable lists"}

// Read properties
console.log(todos.complete) //-> TodoList[Todo{id: 2, name: "mow lawn", complete: true}]

// Listen for changes:
todos.listenTo("length", (event, newLength, oldLength) => {
	console.log(newLength) //-> 1
})
todos.listenTo("add", function(event, addedItems, index){})
todos.listenTo("remove", function(event, removedItems, index){
	console.log(removedItems.length, index) //-> 1, 1
})

// Make changes:
todos.pop();

// Call non-mutating methods
var areSomeComplete = todos.some(function(todo){
    return todo.complete === true;
});
console.log( areSomeComplete ) //-> false
```
@codepen

<details>
<summary>Ecosystem APIs</summary>

Create and use observable objects and arrays with [can-observe]:

```js
import {observe} from "can";

// Create an observable object
const todo = observe( {name: "dishes"} );

// get, set and delete properties as usual
todo.name //-> "dishes"
todo.id = 1;
delete todo.id;

// Create an observable array
const todos = observe([todo]);

// use the array as usual
todos.push({
    name: "lawn"
});
todos[1].name //-> "lawn"
```

Define observable objects types:

```js
class Todo extends observe.Object {

    constructor(props){
        super(props);
        // identity?
        if(this.hasOwnProperty("complete")) {
            this.complete = false;
        }
    }

    // `isDueWithin24Hours` property returns if the `.dueDate`
    // is in the next 24 hrs.
    get isDueWithin24Hours(){
        let msLeft = this.dueDate - new Date();
        return msLeft >= 0 && msLeft <= 24 * 60 * 60 * 1000;
    }

    // `nameChangeCount` increments when `name` changes.
    @@observe.resolvedBy
    nameChangeCount({listenTo, resolve}) {
        let count = resolve(0);
        listenTo("name", ()=> {
            resolve(++count);
        })
    }

    // `toggleComplete` is a method
    toggleComplete(){
        this.complete != this.complete;
    }
}
```


</details>


<details>
<summary>Infrastructure APIs</summary>

```js
const fullName = new Observation( function() {
    return person.first + " " + person.last;
} );
```

</details>


## Views

Render a template that updates the page when any data changes using [can-stache]:

```js
import {stache} from "can";
import Todo from "//canjs.com/demos/api/todo.mjs";

// Create a template / view
let view = stache(`<p>I need to {{this.name}}</p>`);

const todo = new Todo({name: "learn views"});

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
<p>{{this.value}}</p>
```

</td>
<td>

```js
{value: "<b>esc</b>"}
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

<div class="code-toolbar"><pre class=" line-numbers language-html"><code class=" language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>&#123;{{this.value}}}<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span><span aria-hidden="true" class="line-numbers-rows"><span></span></span></code></pre><div class="toolbar"><div class="toolbar-item"><a>Copy</a></div></div></div>

</td>
<td>

```js
{value: "<b>unescape</b>"}
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
  {{# if( this.value ) }}
    Hi
  {{else}}
    Bye
  {{/ if }}
</p>
```

</td>
<td>

```js
{value: true}







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
  {{# if( this.promise.isPending ) }}
    Pending
  {{/ if }}
  {{# if( this.promise.isRejected ) }}
    Rejected {{promise.reason}}
  {{/ if }}
  {{# if( this.promise.isResolved ) }}
    Resolved {{promise.value}}
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
  {{# for( todo of this.todos ) }}
    <li>
      {{todo.name}}-{{this.owner}}
    </li>
  {{/ for }}
</ul>


```

</td>
<td>

```js
{
  todos: [
    {name: "lawn"},
    {name: "dishes"}
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
  {{# for( todo of todos ) }}
    <li> ... </li>
  {{else}}
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
  {{# eq(this.value,22) }}
    YES
  {{else}}
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
  {{let first=this.value.first}}
  {{first}} {{this.value.last}}
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
import { Component } from "can";

// Extend Component to define a custom element
Component.extend({
    tag: "stache-examples",
    view: `
        <p>{{this.escapeValue}}</p>
        <p>{{{this.unescapeValue}}}</p>
        <p>
          {{# if( this.truthyValue ) }}
            Hi
          {{else}}
            Bye
          {{/ if }}
        </p>
        <p>
          {{# if( this.promise.isPending ) }}
            Pending
          {{/ if }}
          {{# if( this.promise.isRejected ) }}
            Rejected {{this.promise.reason}}
          {{/ if }}
          {{# if( this.promise.isResolved ) }}
            Resolved {{this.promise.value}}
          {{/ if }}
        </p>
        <ul>
          {{# for(todo of this.todos) }}
            <li>
              {{todo.name}}-{{this.owner.first}}
            </li>
          {{/ for }}
        </ul>
        <p>
          {{# eq(this.eqValue,22) }}
            YES
          {{else}}
            NO
          {{/ eq }}
        </p>
        <p>
          {{let first=this.owner.first}}
          {{first}} {{this.owner.last}}
        </p>
    `,
    ViewModel: {
        escapeValue: {default: "<b>esc</b>"},
        unescapeValue: {default: "<b>unescape</b>"},
        truthyValue: {default: true },
        promise: {
            default: () => Promise.resolve("Yo")
        },
        todos: {
            default: ()=> [ {name: "lawn"}, {name: "dishes"} ]
        },
        owner: {
            default() {
                return {
                    first: "Bohdi",
                    last: "Meyer"
                };
            }
        },
		eqValue: {default: 22}
    }
});
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
import { Component } from "can";

// Extend Component to define a custom element
Component.extend({
    tag: "stache-examples",
    view: `
        <p>{{ [key] }}</p>
        <p>{{ addArgs(age, 2) }}</p>
        <p>{{ addProps(v1=age v2=2) }}</p>
    `,
    ViewModel: {
		age: {default: 3},
		key: {default: "age"},
		addArgs(v1, v2) {
			return v1+v2;
		},
		addProps(vals){
			return vals.v1+vals.v2;
		}
    }
});
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
todo.on("name",()=>{
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
input.addEventListener("change",()=>{
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
input.addEventListener("input",()=>{
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
todo.on("name",()=>{
  input.value = todo.name;
});
input.addEventListener("change",()=>{
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
button.addEventListener("click",()=>{
  todo.priority = 1;
});
```

</td>
</tr>

<tr>
<td>

```js
<div on:name:by:todo='shake(scope.element)'/>



```

</td>

<td>

```js
todo.on("name",function(){
	viewModel.shake(div);
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
import { Component } from "can";

// Extend Component to define a custom element
Component.extend({
	tag: "stache-examples",
	view: `
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
				{{this.todo.name}}
			</div>
		</p>
	`,
	ViewModel: {
		sayHi: function(){
			console.log("the ViewModel says hi");
		},
		shake(element) {
			element.classList.add("shake");
		},
		removeShake(element) {
			element.classList.remove("shake");
		},
		todo: {
			default(){
				return {
					name: "",
					sayHi(){
						console.log("the todo says hi");
					}
				}
			}
		}
	}
});
</script>
```

</div>
@codepen

## Custom Element Bindings

Similar to the bindings on normal elements in the previous section, you can
listen to events on custom elements, read, write or cross-bind `ViewModel` data with [can-stache-bindings].

The following shows examples of passing data to and from
the `<my-counter>` element in the [api#CustomElementBasics Custom Elements Basics]
section:

```html
<!-- Listens to when count changes and passes the value to doSomething -->
<my-counter on:count="doSomething(scope.viewModel.count)"></my-counter>

<!-- Starts counting at 3 -->
<my-counter count:from="3"></my-counter>

<!-- Starts counting at startCount -->
<my-counter count:from="startCount"></my-counter>

<!-- Update parentCount with the value of count -->
<my-counter count:to="parentCount"></my-counter>

<!-- Cross bind parentCount with count -->
<my-counter count:bind="parentCount"></my-counter>
```

<div class='hidden-codepen'>

```html
<!-- Adds the custom element to the page -->
<my-app></my-app>

<script type="module">
import { Component } from "can";

Component.extend({
	tag: "my-counter",
	view: `
		Count: <span>{{this.count}}</span>
		<button on:click='this.increment()'>+1</button>`,
	ViewModel: {
		count: {default: 0},
		increment() {
			this.count++;
		}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		<p>Calls <code>sayHi</code> when <code>count</code> changes.
			<my-counter on:count="this.sayHi(scope.viewModel.count)"></my-counter>
		</p>
		<p>Start counting at 3.
			<my-counter count:from="3"></my-counter>
		</p>
		<p>Start counting at <code>startCount</code> ({{this.startCount}}).
			<my-counter count:from="this.startCount"></my-counter>
		</p>
		<p>Update <code>parentCount</code> ({{this.parentCount}}) with the value of count.
			<my-counter count:to="this.parentCount"></my-counter>
		</p>
		<p>Update <code>bindCount</code> ({{this.bindCount}}) with the value of count.
			<my-counter count:bind="this.bindCount"></my-counter>
		</p>
	`,
	ViewModel: {
		sayHi(count){
			console.log("The MyApp ViewModel says hi with",count);
		},
		startCount: {default: 4},
		parentCount: {},
		bindCount: {default: 10}
	}
});
</script>
```

</div>
@codepen

Pass [can-component/can-template can-template] views to custom elements to customize layout:

```js
<my-counter count:from="5">
  <can-template name="incrementButton">
    <button on:click="add(5)">ADD 5!</button>
  </can-template>
  <can-template name="countDisplay">
    You have counted to {{count}}!
  </can-template>
</my-counter>
```

Use [can-component/can-slot can-slot] to render the passed `<can-template>` views or
provide default content if a corresponding `<can-template>` was not provided:

```js
Component.extend({
	tag: "my-counter",
	view: `
		<can-slot name="incrementButton"
			add:from="this.add">
			<button on:click="add(1)">+1</button>
		</can-slot>
		<can-slot name="countDisplay"
			count:from="this.count">
			{{count}}
		</can-slot>
	`,
	ViewModel: {
		count: {type: "number", default: 0},
		add(increment){
			this.count += increment;
		}
	}
});
```

<div class='hidden-codepen'>

```html
<!-- Adds the custom element to the page -->
<my-app></my-app>

<script type="module">
import { Component } from "can";

can.Component.extend({
	tag: "my-counter",
	view: `
		<can-slot name="incrementButton"
			add:from="add">
			<button on:click="add(1)">+1</button>
		</can-slot>
		<can-slot name="countDisplay"
			count:from="count">
			{{count}}
		</can-slot>
	`,
	ViewModel: {
		count: {type: "number", default: 0},
		add(increment){
			this.count += increment;
		}
	}
});

Component.extend({
	tag: "my-app",
	view: `
		<my-counter count:from="5">
			<can-template name="incrementButton">
				<button on:click="add(5)">ADD 5!</button>
			</can-template>
			<can-template name="countDisplay">
				You've counted to {{count}}!
			</can-template>
		</my-counter>
	`
});
</script>
```

</div>
@codepen


## Data Modeling

Connect data types to a restful service with [can-rest-model]:

```js
import {restModel} from "can";
import Todo from "//canjs.com/demos/api/todo.mjs";
import TodoList from "//canjs.com/demos/api/todo-list.mjs";

const todoConnection = restModel({
    Map: Todo,
    List: TodoList,
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
    complete: {$in: [false, null]}
  },
  // Sort the results of the selection
  sort: "-name",
  // Paginate the sorted result
  page: {start: 0, end: 19}
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
    ...
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
Todo.on("created", function(ev, todo){});

let savedPromise = todo.save();

// Return if the todo is being created or updated
todo.isSaving() //-> true

savedPromise.then(function(){
    todo.isNew() //-> false
    todo.isSaving() //-> false

    let destroyedPromise = todo.destroy();

    // Return if the todo is being destroyed
    todo.isDestroying() //-> true

    destroyedPromise.then(function(){
        todo.isDestroying() //-> false
    })
});
```


Connect data types to a restful service and have CanJS automatically manage
adding and removing items from lists with [can-realtime-rest-model]:

```js
import {realtimeRestModel} from "can";

// Define a real time restful model
const todoConnection = realtimeRestModel({
    Map: Todo,
    List: Todo.List,
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
import {fixture} from "can";

let todosStore = fixture.store([
    {id: 0, name: "use fixtures", complete: false}
], Todo);

fixture("/api/todos/{id}", todosStore);
```

## Routing

Define routing rules and initialize routing with [can-route]:

```js
import {route} from "can";

// Create two-way routing rule:
route.register("{page}", {page: "home"});

// Define routing data type
const RouteData = DefineMap.extend({
    // Allow undefined properties to be created
    seal: false
},{
    page: "string"
});

// Connect routing system to an instance
// of the routing data type
route.data = new RouteData();
// begin routing
route.start();


// Provide access to the route data to your application component
Component.extend({
    tag: "my-app",
    view: `
        <page-picker page:from="routeData.page"/>
    `,
    ViewModel: {
        routeData: {
            default(){
                return route.data;
            }
        }
    }
});
```

Create responsive links in [can-stache] views with [can-stache-route-helpers]:


```html
<a href="{{ routeUrl(page='todos') }}"
   class="{{# routeCurrent(page='todos') }}
            inactive
          {{else}}
            active
          {{/ routeCurrent}}">Todos
</a>
```


## Utilities

Make AJAX requests with [can-ajax]:

```js
import {ajax} from "can-ajax";

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
//-> [{type: "splice", index: 1, deleteCount: 1, insert: ["c"]}]

diff.map({a: "a"},{a: "A"})
//-> [{type: "set", key: "a", value: "A"}]
```

Read and store the results of [feature detection](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Cross_browser_testing/Feature_detection) with [can-globals]:

```js
import {globals} from "can";

globals.getKeyValue("isNode")          //-> false
globals.getKeyValue("isBrowserWindow") //-> true
globals.getKeyValue("MutationObserver") //-> MutationObserver
```

Read and write nested values with [can-key]:

```js
import  {key} from "can";

const task = {
    name: "learn can-key",
    owner: { name: {first: "Justin", last: "Meyer"} }
}

key.delete(task, "owner.name.first");
key.get(task, "owner.name.last") //-> "Meyer"
key.set(task, "owner.name.first", "Bohdi");
```

Operate on any data type with [can-reflect]:

```js
import {Reflect} from "can";

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

Reflect.assign(obj, {name: "Payal"});
```


Parse a URI into its parts with [can-parse-uri]:

```js
import {parseURI} from "can";

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
import {stringToAny} from "can";
stringToAny( "NaN" ); // -> NaN
stringToAny( "44.4" ); // -> 44.4
stringToAny( "false" ); // -> false
```

Convert one string format to another string format with [can-string]:

```js
import {string} from "can";

string.camelize("foo-bar")) //-> "fooBar"
string.capitalize("foo")    //-> "Foo"
string.esc("<div>foo</div>")//-> "&lt;div&gt;foo&lt;/div&gt;"
string.hyphenate("fooBar")  //-> "foo-bar"
string.underscore("fooBar") //-> "foo_bar"
```
