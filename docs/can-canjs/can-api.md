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
This page is a cheat-sheet for the most common APIs within CanJS. Read the
[guides/technology-overview] page for background on the following APIs.

@body

## Observables

Define observable key-value types with [can-define/map/map]:

```js
import {DefineMap} from "can";

// Define an observable Todo type.
const Todo = DefineMap.extend("Todo",{

    // `id` is a Number, null, or undefined and
    // uniquely identifies instances of this type.
    id: { type: "number", identity: true },

    // `complete` is a Boolean, null or undefined
    // and defaults to `true`.
    complete: { type: "boolean", default: true },

    // `dueDate` is a Date, null or undefined.
    dueDate: "date",

    // `isDueWithin24Hours` property returns if the `.dueDate`
    // is in the next 24 hrs.
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

    owner: {
        Type: {
            first: "string",
            last: "string"
        }
    },

    // `toggleComplete` is a method
    toggleComplete(){
        this.complete != this.complete;
    }
});
```

Create and use instances of the observable key-value types:

```js
// Create a todo instance:
const todo = new Todo({name: "Learn Observables"});

// Change a property:
todo.dueDate = new Date().getTime() + 1000*60*60;

// Listen to changes
let handler = function(ev, newVal, oldVal){};
todo.on("complete", handler);
// Stop listening to changes
todo.off("complete", handler);

// Listen to changes that can be easily unregistered
todo.listenTo("complete", function(ev, newVal, oldVal){})
// Stop listening to all registered handlers
todo.stopListening();

// Call a method
todo.toggleComplete();

// Assign properties
todo.assign({
    owner: {
        first: "Justin", last: "Meyer"
    }
});
```

Define observable list types with [can-define/list/list]:

```js
import {DefineList} from "can";

// Define an observable TodoList type
const TodoList = DefineList.extend("TodoList",{

    // Specify the behavior of items in the TodoList
    "#": {Type: Todo},

    // Create a computed `complete` property
    get complete(){
        // Filter all complete todos
        return this.filter({complete: true})
    }
})
```

Create and use instances of observable list types:

```js
// Create a todo list
const todos = new TodoList([
    {id: 1, name: "learn observable lists"},
    new Todo({id: 2, name: "mow lawn", complete: true})
])

// Read the length and access items
todos.length //-> 2
todos[0] //-> Todo{id: 1, name: "learn observable lists"}

// Read properties
todos.complete //-> TodoList[Todo{id: 2, name: "mow lawn", complete: true}]

// Listen for changes:
todos.on("length", function(event, newLength, oldLength){})
todos.on("add", function(event, addedItems, index){})
todos.on("remove", function(event, removedItems, index){})

// Make changes:
todos.pop();

// Call non-mutating methods
todos.some(function(todo){
    return todo.complete = true;
}) //-> false
```

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

// Create a template / view
let view = stache(`<p>I need to {{name}}</p>`);

const todo = new Todo({name: "learn views"});

// Render the template into document fragment
let fragment = view(todo);

// Insert fragment in the page
document.body.appendChild(fragment);
```

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
<p>{{value}}</p>
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

<div class="code-toolbar"><pre class=" line-numbers language-html"><code class=" language-html"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>p</span><span class="token punctuation">&gt;</span></span>&#123;{{value}}}<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>p</span><span class="token punctuation">&gt;</span></span><span aria-hidden="true" class="line-numbers-rows"><span></span></span></code></pre><div class="toolbar"><div class="toolbar-item"><a>Copy</a></div></div></div>

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
  {{# if( value ) }}
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
  {{# if( promise.isPending ) }}
    Pending
  {{/ if }}
  {{# if( promise.isRejected ) }}
    Rejected {{promise.reason}}
  {{/ if }}
  {{# if( promise.isResolved ) }}
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
  {{# each( todos, todo=value ) }}
    <li>
      {{todo.name}}-{{../owner}}
    </li>
  {{/ each }}
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
  {{# each( todos, todo=value ) }}
    <li> ... </li>
  {{else}}
    <li>No todos</li>
  {{/ each }}
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
  {{# eq(value,22) }}
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
  {{# with(value) }}
    {{first}} {{last}}
  {{/ with }}
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
<p>
  {{# with(name) }}
    {{first}} {{../age}}
  {{/ with}}
</p>


```

</td>
<td>

```js
{
  name: {
    first: "Ramiya"
  },
  age: 3
}
```

</td>
<td>

```html
<p>

     Ramiya 3  

</p>


```

</td>
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
  key: "height",
  height: 71
}
```

</td>
<td>

```html
<p>71</p>




```

</td>
</tr>

<tr>
<td>

```html
<p>{{ add(num, 2) }}</p>






```

</td>
<td>

```js
{
  add(v1, v2){
    return v1+v2;
  },
  num: 3
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
<p>{{ add(v1=num v2=2) }}</p>






```

</td>
<td>

```js
{
  add(vals){
    return vals.v1+vals.v2;
  },
  num: 3
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

Listen to events on elements, read data, write data, or cross-bind data on elements with [can-stache-bindings]:

<table>
<tr>
    <th>View</th>
    <th>Roughly Equivalent Code</th>
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
<input on:name:by:todo='todo.method()'/>
```

</td>

<td>

```js
todo.on("name",todo.method);
```

</td>
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
<custom-element value:raw='VALUE'/>
```

</td>

<td>

```js
customElement.value = "VALUE";
```

</td>
</tr>



</table>

Define custom elements with [can-component]:

```js
import {Component} from "can";

Component.extend({

    // Defines the tag name
    tag: "my-counter",

    // Defines the content within the
    // custom element.
    view: `
        <button on:click="add(1)">+1</button>
        {{count}}
    `,
    // Defines the `ViewModel` observable
    // used to render the `view`. This
    // object is used to extend `DefineMap`.
    ViewModel: {
        count: {type: "number", default: 0},
        add(increment){
            this.count += increment;
        }
    }
});
```

Create custom elements like:

```html
<my-counter></my-counter>
```

Listen to events on custom elements, read, write or cross-bind `ViewModel` data with [can-stache-bindings]:

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

Pass [can-component/can-template can-template] views to custom elements to customize layout:

```js
<my-counter count:from="5">
  <can-template name="incrementButton" this:from="this">
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
```


> [See it live](https://justinbmeyer.jsbin.com/hexubon/2/edit?html,js,output)

## Data Modeling

Connect data types to a restful service with [can-rest-model]:

```js
import {restModel} from "can";

const todoConnection = restModel({
    Map: Todo,
    List: Todo.List,
    url: "/api/todos/{id}"
});
```

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
socket.on('todo created', (todo) => {
    todoConnection.createInstance(order);
}).on('todo updated', (todo) => {
    todoConnection.updateInstance(order);
}).on('todo removed', (todo) => {
    todoConnection.destroyInstance(order);
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
