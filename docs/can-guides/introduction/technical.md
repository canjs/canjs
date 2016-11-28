@page guides/technical Technical Highlights
@parent guides/introduction 4
@description Learn about CanJS's technical accomplishments.
@outline 2

@body


## Browser and Environment Support

CanJS supports:

 - Latest Chrome, Firefox, Edge, Safari
 - IE9+
 - iOS Safari 9.3+
 - NodeJS 6+ with [can-vdom] as a document.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/canjs.svg)](https://saucelabs.com/u/canjs)

## Phenomenal Features, Small Size

The [can-core core] of CanJS, gzipped, is under 50KB. While there may be smaller architectural libraries, there are not other frameworks that provide comparable functionality. For custom elements, observables, live binding, routing, a model layer with intelligent caching and real-time support, 50KB is very small.

jQuery 3.1 is 30KB minified and gzipped, and that is only providing DOM utilities. CanJS implements it’s own DOM utilities, in addition to much more.

Ember 2.9 is 108KB minified and gzipped, providing a comparable feature set.

React 15.3 is 44KB minified and gzipped, yet React is, on it’s own, simply a View layer.

The Angular 2’s Hello World app, provided by the angular-cli, is ~100KB minified and gzipped

## Independent Repositories and Packages

CanJS 3.0 is maintained in independent repositories,
each with it’s own npm package and [semantic version](http://semver.org/) number.
Organizing CanJS into individual repositories and packages has many benefits.  

The obvious advantage is that pieces can be used without the whole. You can choose to use CanJS's observables or [can-fixture] without the rest of the framework. You could even mix and match CanJS libraries with other libraries like React quite easily.

However, the main benefit is that independent repositories
improves CanJS's stability - one half of CanJS's [guides/mission mission]. This is
because independent repositories make upgrades easier and more frequent. For example,
compare:

- Upgrading a 2.3 app, which was not organized in individual repositories, to
- Upgrading a 3.0 app.

Despite making relatively few breaking changes, and
providing a [migrate-3 migration guide], upgrading from CanJS 2.3 to 3.0 looks like
a big step:

<img src="../../docs/can-guides/images/introduction/mission-stability-3-upgrade.png" style="width:100%;max-width:400px"/>

But if you break that step down, CanJS 2.3 is mostly CanJS 3.0 with a bunch of bug
fixes, a heap of new features, and a few breaking changes.  Most of the difficulty
upgrading are the breaking changes, which account for the majority of the upgrade step size:

<img src="../../docs/can-guides/images/introduction/mission-stability-upgrade-breakdown.png" style="width:100%;max-width:400px"/>

To get all of those bug fixes and new features in 3.0, you have to
take on those breaking changes from 2.3 all at once.  Depending on your company culture,
and scale of your application, this might not be easy.

Going forward in CanJS 3.0, packages are released independently of
each other.  You can upgrade to bug fixes and new features
immediately and delay breaking changes (exampe: `can-route@4.0.0`) until later. You can upgrade breaking changes in steps too.  For example,
you might upgrade to `can-route@4.0.0` one month and `can-component@4.0.0`
the following month.  CanJS 3.0's upgrade path might look like:

<img src="../../docs/can-guides/images/introduction/mission-stability-upgrade-new.png" style="width:100%;max-width:450px"/>

Independent repositories also means that [can-legacy legacy] libraries, like [can-ejs] can continue
living through community driven fixes and releases.  It doesn't die simply because
it's no longer included in the core CanJS build.

## Flexible Features

No framework can perfectly satisfy every application
requirement.  Often, a framework can't even satisfy all the requirements
for a single application.

When this happens, it's nice to have a framework that can
flexibly adapt to the challenge.  The sections below have a
many examples of this flexibility:

- CanJS can be both [object oriented and functional](#Objectorientedandfunctional),
  imperative and declarative.
- CanJS's MVVM [observables are useful outside the framework](#Flexible).
- CanJS [integrates with jQuery](#jQueryintegration), making DOM centric development easier.

There's a bunch of other ways that CanJS makes it easy to develop outside the box:

 - [can-control] can handle when DOM-centric programming is necessary.
 - [can-compute] can be wired up to anything.
 - The [can-infrastructure] collection has a number of utility libraries that
   can help jump start development.

## Cool Computes

CanJS has two powerful observable systems that are the foundation for many of the other
core libraries:

 - [can-compute] - Observable values and derived observable values.
 - [can-define] - Observable objects.

This section is about the technical highlights of [can-compute].  However,
as [can-define] uses computes internally for [computed getter properties](#Computedgetterproperties)
and [asynchronous computed getter properties](##Asynccomputedgetterproperties), the benefits
of computes extend to [can-define]. In many cases, we'll use _computed getter properties_ to
show the advantages of computes.

[can-compute] is used in similar situations as event streams libraries like RXJS and Bacon.js. Computes
are used to transform a set of observable values into another observable value.  While event stream libraries are able to setup more complex transformations, computes can setup transformations
much more easily.

For example, the following compute keeps the completed count of todos in a list:

```js
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var compute = require("can-compute");

var todoList = new DefineList([
    {name: "dishes",  complete: true},
    {name: "laundry", complete: false}
]);

var completedCount = compute(function(){
    return todoList.filter(function(todo){
        return todo.complete;
    });
})
```

`completedCount` is updated when any todo's `complete` property changes like:

```js
todoList[0].complete = false;
```

Or a todo is added to or removed from the list like:

```js
todoList.push({name: "learn about computes", complete: true})
```

`completedCount` automatically listens to all of these changes because
[can-compute] infers dependencies.

### Inferred dependencies

In event stream libraries or other computed computed libraries, you must declare your
dependencies like:

```js
var fullNameStream = Kefir.combine(firstNameStream, lastNameStream, function(firstName, lastName){
    return firstName + " " + lastName;
});
```

or like:

```js
fullName: Ember.computed('firstName', 'lastName', function() {
	return this.get('firstName')+" "+this.get('lastName');
});
```

[can-compute] infers their own dependencies without needing to explicitly declare them, therefore requiring less boilerplate code. This means you can write `fullName` like:

```js
var fullName = compute(function(){
    return firstName() + " " + lastName();
});
```

or like:

```js
Person = DefineMap.extend({
    firstName: "string",
    lastName: "string",
    get fullName() {
        return this.firstName + " " +this.lastName;
    }
});
```

This ability is especially useful when the dependencies are dynamic as in the
following `completedCount` example:


```js
var todoList = new DefineList([
    {name: "dishes",  complete: true},
    {name: "laundry", complete: false}
]);

var completedCount = compute(function(){
    return todoList.filter(function(todo){
        return todo.complete;
    });
})
```

When todos are added to and removed from `todoList`, `completedCount`
will update its bindings automatically.


### Cached values

Once a compute is bound (using [can-compute.computed.on] or [can-compute.computed.addEventListener]), it immediately calculates its
value and caches it so any future reads will use the cached value.

In the following example, before `fullName` is bound,
`fullName`'s value is recalculated every time it is read.  After `fullName` is bound,
its value is recalculated only when a dependent value changes.

```js
var compute = require("can-compute");
var firstName = compute("Payal");
var lastName = compute("Meyer");

var fullName = compute(function(){
    console.log("Calculating fullName.");
    return firstName()+" "+lastName();
});

fullName() // console.logs "Calculating fullName."
           //-> "Payal Meyer"

fullName() // console.logs "Calculating fullName."
           //-> "Payal Meyer"

fullName.on("change", function(){}) // console.logs "Calculating fullName."

fullName() //-> "Payal Meyer"
fullName() //-> "Payal Meyer"

firstName("Ramiya") // console.logs "Calculating fullName."

fullName() //-> "Ramiya Meyer"
```

Using cached values can dramatically improve performance in situations where a computed value is frequently read by multiple parts of the application.  

### Synchronous

CanJS observables synchronously notify any event listeners. This makes testing
and debugging quite a bit easier.

The following example shows how you can
change the `firstName` value and immediately check the consequences of that change:

```js
var stache = require("can-stache");
var compute = require("can-compute");

var template = stache("<h1>Welcome {{fullName}}</h1>");

var firstName = compute("Justin");
var lastName = compute("Meyer");

var fullName = compute(function(){
    return firstName()+" "+lastName();
});

var frag = template({fullName: fullName});

assert.equal(frag.firstChild.innerHTML, "Welcome Payal Meyer");

firstName("Ramiya");

assert.equal(frag.firstChild.innerHTML, "Welcome Ramiya Meyer");
```

### Batched events

Observable property changes [can-event/batch/batch.dispatch] synchronous events that update
computes and the DOM are ideal for many scenarios, but there are times where this can cause performance problems. To prevent unnecessary updates, events can be batched using [can-event/batch/batch.start batch.start] and [can-event/batch/batch.stop batch.stop]. Computes and the DOM will only be updated
once for all changes within the batch.

In the previous example, `{{fullName}}` would be updated twice
if `firstName` and `lastName` are changed:

```js
firstName("Payal");
lastName("Shah");
```

Wrapping this in a batch will make `{{fullName}}` update only once:


```js
var batch = require("can-event/batch/batch");

batch.start();
firstName("Payal");
lastName("Shah");
batch.stop();
```

Using [can-event/batch/batch.start batch.start] and [can-event/batch/batch.stop batch.stop]
can even make quadratic updates (`O(n^2)`) become linear (`O(n)`).

Consider the performance of a `completeAll` method that completes every todo in a list
and a `completeCount` compute that calculates the number of complete todos:

```js
var todoList = new DefineList([
    {name: "dishes",  complete: false},
    {name: "laundry", complete: false}
]);

var completeAll = function(){
    todoList.forEach(function(todo){
        console.log("completing", todo.name)
        todo.complete = true;
    });
};

var completedCount = compute(function(){
    return todoList.filter(function(todo){
        console.log("checking", todo.name);
        return todo.complete;
    });
});

completedCount.on("change", function(ev, newVal){
    console.log("completedCount is", newVal);
});
```

If `completeAll` is called, the following will be logged:

```
completeAll();
// console.logs "completing dishes"
// console.logs "checking dishes"
// console.logs "checking laundry"
// console.logs "completedCount is 1"
// console.logs "completing laundry"
// console.logs "checking dishes"
// console.logs "checking laundry"
// console.logs "completedCount is 2"
```

This means that every time a todo is marked as complete, `completedCount` loops
through every todo.

However, changing `completeAll` to use `batch.start` and `batch.stop` like:

```js
var completeAll = function(){
    batch.start();
    todoList.forEach(function(todo){
        console.log("completing", todo.name)
        todo.complete = true;
    });
    batch.stop()
};
```

means `completeAll` will log the following:

```js
completeAll();
// console.logs "completing dishes"
// console.logs "completing laundry"
// console.logs "checking dishes"
// console.logs "checking laundry"
// console.logs "completedCount is 2"
```

[can-event/batch/batch.start batch.start] and [can-event/batch/batch.stop batch.stop]
can improve performance by preventing compute recalculations.

## Outstanding Observable Objects

[can-define] is used to create observable [models](#Models) and [view-models](#ViewModels) like:

```js
var DefineMap = require("can-define/map/map");

var Person = DefineMap.extend({
    first: "string",
    last: "string",
    get fullName(){
        return this.first + " " + this.last;
    }
})
```

[can-define] uses [can-compute] internally to support [computed getter properties](##Computedgetterproperties) like the previous example's `fullName`, so make sure to read about the benefits of [cool computes](#CoolComputes).

As [can-define] powers almost everything in a CanJS application, it has grown to be
quite powerful, performant and flexible.  Read on to explore some of its best characteristics.

### Expressive property definition syntax

[can-define] supports an expressive, powerful syntax for defining properties on observable objects and lists. It supports [can-define.types.get getter], [can-define.types.set setter],
initial [can-define.types.value], and [can-define.types.type] conversion, [can-define.types.serialize]
and [can-define-stream.stream] behaviors.

The following illustrates the signatures of these behaviors:

```js
DefineMap.extend({
    propertyName: {
        get: function(lastSetValue, resolve){ ... },
        set: function(newValue, resolve){ ... },
        type: function(newValue, propertyName){ ... },
        Type: Constructor,
        value: function(){ ... },
        Value: Constructor,
        serialize: function(){ ... },
        stream: function(setStream){ ... }
    }
})
```

[can-define] also supports a wide variety of short hands for setting up these
behaviors. The following illustrates some of these behaviors:

```js
DefineMap.extend({
    propertyA: Object      -> PropertyDefinition
    propertyB: String      -> {type: String}
    propertyC: Constructor -> {Type: Constructor}
    propertyD: [PropDefs]  -> {Type: DefineList.extend({"#": PropDefs})>}
    get propertyE(){...}   -> {get: propertyE(){...}}
    set propertyF(){...}   -> {get: propertyF(){...}}
    method: Function
})
```

### Object oriented and functional

CanJS's observables produce data types that are easy for others to consume,
but can be implemented with the rigor of declarative programming.  This is
accomplished by combining the benefits of object oriented programming,
functional programming, and functional reactive programming.

[Functional programming](https://en.wikipedia.org/wiki/Functional_programming), which is a
form of [declarative programming](https://en.wikipedia.org/wiki/Declarative_programming), avoids
changing state and mutable data.  It treats programming as math.  This eliminates side effects,
making it easier to predict the behavior of an application.

> Programming is, at its best, a branch of formal mathematics and applied logic.   
> __Edsger Dijkstra__ - _1 March 1999 at the ACM Symposium on Applied Computing at San Antonio, TX_

However, [object oriented](https://en.wikipedia.org/wiki/Object-oriented_programming) APIs often feel more natural.

> Object oriented programming leverages the fact that humans have millions of years of evolution invested in conceiving of the world in terms of things which have properties and associated methods of doing things with them. A salt shaker has a property of the amount of salt in it, and can be shaken.  
> [Tim Boudreau, Oracle Labs](https://www.quora.com/Why-did-Dijkstra-say-that-%E2%80%9CObject-oriented-programming-is-an-exceptionally-bad-idea-which-could-only-have-originated-in-California-%E2%80%9D)

We agree with both of these ideas! The following object-oriented `SaltShaker` API feels intuitive - any
developer can immediately understand it.

```js
var saltShaker = new SaltShaker();

saltShaker.fill();  

saltShaker.shake() //-> "salt"
saltShaker.shake() //-> "salt"  
saltShaker.shake() //-> null   

saltShaker.empty   //-> true
```

To satisfy this API, `SaltShaker` could be implemented as follows:

```js
var DefineMap = require("can-define/map/map");

SaltShaker = DefineMap.extend({
    saltCount: {type: "number", value: 0},
    fill: function(){
        this.saltCount = 2;
    },
    shake: function(){
        var hasSalt = this.saltCount;
        this.saltCount = hasSalt ? this.saltCount - 1 : 0;
        return hasSalt ? "salt" : null;
    },
    get empty() {
        return ! this.saltCount;
    }
});
```

While `empty` is implemented [declaratively](https://en.wikipedia.org/wiki/Declarative_programming),
notice how both `fill` and `shake` mutate the state of `saltCount`.  In a more complex type,
this can easily lead to bugs.  Instead, the following uses [can-define-stream] and
[functional reactive programming](https://en.wikipedia.org/wiki/Functional_reactive_programming)
to make `saltCount` a function of the calls to `fill` and `shake`:

```js
var SaltShaker = DefineMap.extend({
    saltCount: {
        stream: function() {
            return this.stream("fill")
					.merge(this.stream("shake"))
					.scan(function(prev, event){
				if(event.type === "fill") {
					return 2;
				} else {
					return prev > 0 ? prev - 1 :  0;
				}
			},0);
        }
    },
    fill: function() {
        this.dispatch("fill");
    },
    shake: function() {
		var hadSalt = this.saltCount;
        this.dispatch("shake");
        return hadSalt ? "salt" : null;
    },
    get empty() {
        return !this.saltCount;
    }
});
```

CanJS provides three powerful functional helpers on [can-define/map/map] and [can-define/list/list]:

 - [can-define.types.get computed getter properties]
 - [can-define.types.get async computed getter properties]
 - [can-define-stream.stream streamed properties]

### Computed getter properties

[can-define.types.get Computed getters] are the easiest way to declaratively transform
stateful values into derived values.  For example, the following defines a `completedCount`
property on instances of the `TodoList` type:

```js
var TodoList = DefineList.extend({
    "#": Todo,
    get completedCount(){
        return this.filter({complete: true}).length
    }
});

var todos = new TodoList([{complete: true}, {complete:false}]);
todos.completedCount //-> 1
```

These [can-define.types.get getters] are made with [can-compute], so they
[infer dependencies](#Inferreddependencies), [cache their values](#Cachedvalues), and are [synchronous](#Synchronous).

### Async computed getter properties

It's very common to load data asynchronously given some state. For example, given
a `todoId`, you might need to load a todo from the server.  This `todo` property
can be described as [can-define.types.get asynchronous computed getters] as follows:

```js
var EditTodoVM = DefineMap.extend({
    todoId: "number",
    todo: {
        get: function(lastSetValue, resolve){
            Todo.get(this.todoId).then(resolve);
        }
    }    
});
```

### Streamed properties

When the behavior of properties can't be described with computes,
the [can-define-stream] module adds the ability to work with event streams.

```js
var Person = DefineMap.extend({
  name: "string",
  lastValidName: {
    stream: function(){
      return this.stream(".name").filter(function(name){
        return name.indexOf(" ") >= 0;
      })
    }
  }
});

var me = new Person({name: "James"});

me.on("lastValidName", function(lastValid) {
  console.log(lastValid)
});

me.name = "JamesAtherton";

me.name = "James Atherton";
//-> console.logs "James Atherton";

me.name = "JustinMeyer";

me.name = "Justin Meyer";
//-> console.logs "Justin Meyer";
```

## Maintainable MVVM


CanJS applications are Model-View-ViewModel (MVVM) architecture with
custom elements providing orchestration.

<img src="../../docs/can-guides/images/introduction/mvvm.png" style="width:100%;max-width:750px" alt="Model-View-ViewModel Diagram"/>

It's a [straightforward](#Straightforward), but [flexible](#Flexible) architecture that
produces [easily-testable](#Easily_testable), [compose-able](#Compose_able) modules and components.

### Straightforward

On the highest level, CanJS applications are broken down into 2 parts:

- **Custom Elements** that manage a particular part of the application.  
- **Models** that handle data requests to and from the server.

For example, consider the following order page from [place-my-order](http://place-my-order.com):

<img src="../../docs/can-guides/images/introduction/tech-component-map.png" style="width:100%;max-width:750px" />

This page might be broken down into the following
custom elements:

 - `<pmo-nav>`
 - `<pmo-order-new>` which is further broken down into:
   - `<bit-tabs>`
   - `<pmo-order-menu>`

These _Custom Elements_ use the `Restaurant` model
to get a restaurant's menu by making a `GET` request to `/api/restaurants`;
and they use the `Order` model to create an order by making a `POST` request to
`POST /api/orders`.

_Custom Elements_ are broken down themselves into two layers:

- **ViewModels** that manage the logic of a custom element.
- **Views** templates that convert the data and values of the
 _ViewModel_ into HTML elements. Views update their HTML
 elements when the _ViewModel_ changes and are able to
 call methods on the _ViewModel_ when a user interacts
 with their HTML.

All off these parts, _Custom Elements_, _Models_,
_View Models_, and _Views_, are written mostly using just
two and a half APIs:

- [can-define] observables for _ViewModels_ and _Models_.
- [can-stache] templates with [can-stache-bindings] for _Views_.

The rest of the core APIs are just decorators, used
to turn [can-define] observables and [can-stache] templates
into something more:

 - [can-component] combines a [can-define] observable
   and [can-stache] template into a _Custom Element_.
 - [can-route] two-way binds a [can-define] observable
   with the browser's URL.
 - [can-connect] adds methods to a [can-define] observable,
   enabling it to create, read, update, and delete data on
   a restful URL.

CanJS is straightforward because it's just about building
custom elements and models with just a small set of tools -  [can-define]
and [can-stache].

### Independent

CanJS's Models, Views, and ViewModels are all independent, individually
useful layers.  This independence is the source for the benefits of
MVVM architecture discussed in the following sections:

 - [Flexible] - change tools and patterns when the need arises.
 - [Easily-testable] - easily unit test parts of the application.
 - [Compose-able] -combine smaller units of functionality into a large whole.

For now, we'll just demonstrate that these things actually are independent using
code in the [guides/todomvc].  We'll organize code related to the `<todo-list>` component
into individual and independent modules and files that look like:

```
├── models/
|   ├── todo.js
├── components/
|   ├── todo-list/
|   |   ├── view-model.js
|   |   ├── view.stache
|   |   ├── todo-list.js
```

The __Model__, in _models/todo.js_, looks like:

```js
var DefineMap = require("can-define/map/map"),
    DefineList = require("can-define/list/list"),
    set = require("can-set"),
    superMap = require("can-connect/can/super-map/super-map");

var Todo = DefineMap.extend({
  id: "string",
  name: "string",
  complete: {type: "boolean", value: false}
});

Todo.List = DefineList.extend({
  "#": Todo,
  get active(){
    return this.filter({complete: false});
  },
  get complete(){
    return this.filter({complete: true});
  }
});

Todo.algebra = new set.Algebra(
  can.set.props.boolean("complete"),
  can.set.props.id("id"),
  can.set.props.sort("sort")
);

Todo.connection = superMap({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List,
  name: "todo",
  algebra: Todo.algebra
});

module.exports = Todo;
```

This model can independently make requests to a restful service layer.

- [can-connect/can/map/map.getList Get a list] of Todos
  ```js
  Todo.getList({complete: true}).then(function(todos){})
  ```
- [can-connect/can/map/map.get Get] a single Todo
  ```js
  Todo.get({_id: 6}).then(function(todo){})
  ```
- [can-connect/can/map/map.prototype.save Create] a Todo
  ```js
  var todo = new Todo({name: "do dishes", complete: false})
  todo.save().then(function(todo){})
  ```
- [can-connect/can/map/map.prototype.save Update] an [can-connect/can/map/map.prototype.isNew already created] Todo
  ```js
  todo.complete = true;
  todo.save().then(function(todo){})
  ```
- [can-connect/can/map/map.prototype.destroy Delete] a Todo
  ```js
  todo.destroy().then(function(todo){})
  ```

The __ViewModel__, in _components/todo-list/view-model.js_, looks like:

```js
var DefineMap = "can-define/map/map";
var Todo = "../models/todo";

module.exports = DefineMap.extend({
  todos: Todo.List,
  editing: Todo,
  backupName: "string",
  isEditing: function(todo){
    return todo === this.editing;
  },
  edit: function(todo){
    this.backupName = todo.name;
    this.editing = todo;
  },
  cancelEdit: function(){
    if(this.editing) {
      this.editing.name = this.backupName;
    }
    this.editing = null;
  },
  updateName: function() {
    this.editing.save();
    this.editing = null;
  }
});
```

This _ViewModel_ will be tested independent of the view in the
[easily-testable](#Easily_testable) section.  

The __View__, in _components/todo-list/view.stache_, looks like:

```
<ul id="todo-list">
  {{#each todos}}
    <li class="todo {{#if complete}}completed{{/if}}
      {{#if isDestroying}}destroying{{/if}}
      {{#if isEditing(this)}}editing{{/if}}">
      <div class="view">
        <input class="toggle" type="checkbox"
               {($checked)}="complete" ($change)="save()">
        <label ($dblclick)="edit(this)">{{name}}</label>
        <button class="destroy" ($click)="destroy()"></button>
      </div>
      <input class="edit" type="text"
        {($value)}="name"
        ($enter)="updateName()"
        {$focused}="isEditing(this)"
        ($blur)="cancelEdit()"/>
    </li>
  {{/each}}
</ul>
```

This _View_ lives in its own file, so a designer could easily modify it
without touching any JavaScript directly.

Finally, the component file in _components/todo-list/todo-list.js_ puts
everything together:

```js
var Component = require('can-component');
var ViewModel = require("./view-model");
var view = require('./view.stache!');

Component.extend({
    tag: 'todo-list',
    ViewModel: ViewModel,
    view: view
});
```

Read on to see how CanJS's independence results in easily-testable, flexible,
and compose-able code.


### Easily-testable

CanJS's MVVM architecture results in testable code. In the previous
section, we created the [guides/todomvc]'s `<todo-list>`'s Model, ViewModel, and View code.
The following shows examples of testing each part.

Testing the __Model__:

```js
test("Todo active and complete", function(){
    var list = new Todo.List([
        {name: "dishes", complete: false},
        {name: "lawn", complete: true}
    ]);
    assert.deepEqual(list.active.get(), [{name: "dishes", complete: false}], "one active");
    assert.deepEqual(list.complete.get(), [{name: "lawn", complete: true}], "one complete")
});
```

Testing the __ViewModel__:

```js
test("TodoListVM cancelEdit", function(){
    var todos = new Todo.List([
        {name: "mow lawn", complete: false},
        {name: "dishes", complete: true},
    ]);

    var todoListVM = new TodoListVM({
        todos: todos
    });

    todoListVM.edit(todos[0]);
    todos[0].name = "mow yard";

    todoListVM.cancelEdit();

    assert.equal(todos[0].name, "mow lawn");
});
```

To test the __View__, we typically recommend testing the component like:

```js
test("<todo-list> can update todo name", function(done){

    fixture("PUT /api/todos/{id}", function(request){
        assert.equal(request.data.name, "MOW YARD", "update");
        done();
    });

    var todos = new Todo.List([
        {name: "mow lawn", complete: false, id: 22},
        {name: "dishes", complete: true, id: 23},
    ]);

    var template = stache("<todo-list {todos}='todos'/>");
    var todoListElement = template({todos: todos}).firstChild;

    // double click todo
    todosListElement.querySelector(".todo label").dispatch( new MouseEvent('dblclick') );

    // change its value to MOW YARD by hitting enter (which causes a change first)
    var input = todoListElement.querySelector(".todo input.edit");
    input.value = "MOW YARD";

    input.dispatchEvent( new Event('change') );

    input.dispatchEvent( new KeyboardEvent("keyup",{code: "Enter", keyCode: 13}) );
});
```

Checkout these tests running in [this JSBin](http://justinbmeyer.jsbin.com/xaduto/edit?html,js,output).

### Flexible

CanJS's architecture produces observables that stand on their
own, useful outside of the framework.  CanJS's observables aren't dependent on a diffing engine to identify changes.  Instead, any other tool or library can be an observer or call methods
on the observable.

[This JSBin](http://jsbin.com/vivowu/edit?html,js,output) shows an analog clock that uses the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). The `Analog`
clock listens to a `timer` observable and updates the position of the second, hour, and minute
hands when the time changes.

```js
Analog = function(element, timer) {
    ...
    timer.on("time", this.drawClock.bind(this) );
};

var timer = new Timer();
new Analog(document.getElementById("analog"), timer);
```

Also, with the ideas discussed in [Object oriented and functional](#Objectorientedandfunctional),
CanJS applications can closely approximate a stateless, redux-like,
architecture.  While we think this architecture creates more work than necessary for
developers, it's possible by:

 - Having a single, application-view-model that contains all state, derived using
   [can-define-stream] from events dispatched on the application-view-model.
 - Enforcing that parent-to-child communication only uses one-way
   [can-stache-bindings.toChild] bindings like:
   ```
   <child-component {prop}="parentValue"/>
   ```
 - Enforcing that child-to-parent communication is [can-stache-bindings.event] based:
   ```
   <child-component (event)="parentMethod()"/>
   ```


### Compose-able

We believe that application state should be federated:

> [Federated](https://en.oxforddictionaries.com/definition/federate) - form or be formed into a single centralized unit, within which each state or organization keeps some internal autonomy.

CanJS applications are composed from hierarchical [can-component]s, each containing their own independent state (its own ViewModel). This architecture is at the core of CanJS’s approach to building large applications.

> The secret to building large apps is never build large apps. Break your applications into small pieces. Then, assemble those testable, bite-sized pieces into your big application.

CanJS applications can be represented by [Hierarchical State Machines](https://en.wikipedia.org/wiki/UML_state_machine#Hierarchically_nested_states). The [guides/atm]
walks through an example of this concept where a `Card`, `Deposit`, and `Withdrawal`'s states
are composed into the `ATM`'s state.

<img src="../../docs/can-guides/experiment/atm/1-pages-template/state-diagram.png">

This dispersed (federated) state means that a `Card` is still useful without the
`ATM`.  A `Card` can make AJAX requests and maintains its state of being
`verified` or `unverified`.

Federated state stands in contrast to architectures that have a
_one-way_ data flow. Architectures with a _one-way_ data flow usually flow to
a central and global _state mechanism_. That _state mechanism_
becomes an implicit dependency of every component in the application. This creates additional downstream problems:

* It becomes harder to work independently and verify the behavior of component of the project. Thus, scaling the team and parallelizing the effort becomes trickier, as several developers might have to touch the same central state mechanism.

* Individual components become less reusable in other contexts because of their dependency on this external state layer.

* Individual components become harder to test in isolation, since testing them requires importing or mocking large external dependencies.

## ViewModels

CanJS's ViewModels are [can-define] observables that manage the state of a [can-component].
As ViewModels are observables, CanJS's ViewModels have all the benefits of
CanJS's outstanding observable objects, namely:

 - Expressive property definition syntax
 - Object oriented and functional
 - Computed getter properties
 - Async computed getter properties
 - Streamed properties

In CanJS, the ViewModel is its own layer, completely independent from the
template and the component. This is why ViewModels are largely responsible for
many of the benefits of CanJS's maintainable MVVM architecture:

 - [Independence](#Independent)
 - [Flexible](#Independent)
 - [Easily-testable](#Easily_testable)
 - [Compose-able](#Compose_able)

The introduction of a strong ViewModel provides key advantages for maintaining large applications:

* Decouples the presentation from its business logic - A ViewModel is essentially an object and methods representing the state of a View. This separation of concerns enables simple, HTML-based Views containing minimal logic, while the ViewModel manages the complexities of application logic.

* Enables designer/developer cooperation - Because the view is stripped of code and application logic, designers can safely and comfortably change the View without fear of breaking things.

* Enables easier testing - ViewModels can be unit tested easily. Because they represent the view's state without any knowledge of the DOM, they provide a simple interface for testing.

## Views

CanJS views are [can-stache] templates, that implement a syntax similar to
[Mustache](https://mustache.github.io/mustache.5.html) and [Handlebars](http://handlebarsjs.com/),
and include special features like event bindings, custom elements, and performance optimizations.

[can-stache] templates look like HTML, but with _magic_ tags like [can-stache.tags.escaped]
and view bindings like [can-stache-bindings.twoWay] in the template. For example, the following is the application template in the [guides/todomvc]:

```
<header id="header">
	<h1>todos</h1>
	<todo-create/>
</header>

<ul id="todo-list">
	{{#each todos}}
		<li class="todo {{#if complete}}completed{{/if}}">
				<div class="view">
						<input class="toggle" type="checkbox" {($checked)}="complete">
						<label>{{name}}</label>
						<button class="destroy" ($click)="destroy()"></button>
				</div>

				<input class="edit" type="text" value="{{name}}"/>
		</li>
	{{/each}}
</ul>
```

### Terseness

[can-stache] templates are based around the same syntax in the Mustache
syntax. It also adopts many of the helpers in Handlebars, a popular JS
flavor of Mustache.

Mustache is great because it simplifies the most common needs of templates into
a very limited subset of syntax.  There's no branching, else, or loops.  




Handlebars templates are a superset of Mustache templates that includes some convenient helper methods.

Developers love Mustache templates because they are designed to be "logic-less", meaning no if statements, else clauses, for loops. There are only tags. The resulting simplicity makes templates easier to read and understand. It also makes it possible for designers to modify templates more easily, with less of a risk of breaking something.

CanJS’s version of Handlebars is called [can-stache](../../can-stache.html).

### One, two-way, and event bindings

CanJS templates support data and event bindings through the [can-stache-bindings](../../can-stache-bindings.html) module.

Data binding means Stache templates bind to observable property changes and update the DOM as needed.

#### Data binding

For example, there may be a template that looks like this:

```
<div>{{firstName}}</div>
```

Initially, if person is an observable like `{firstName: ‘Mila’}`, then the DOM would render like:

```
<div>Mila</div>
```

An invisible binding is created for any properties of observable data. If `first` is changed:

```javascript
person.firstName = 'Jane';
```

`firstName` triggers a change. The Stache binding changes the DOM to reflect the new value.

```
<div>Jane</div>
```

When a change occurs that triggers a data binding, Stache is very precise about modifying only the most localized part of the template needed to reflect the change. More on that below.

#### Event and input binding

Setting up an event binding on an element is simple:

```
<div ($click)="doSomething()"/>
```

The value of the event binding can be inline JavaScript that modifies data in the template, or it can be a method on the ViewModel, if the template is part of a custom element.

Stache also supports setting up two way data bindings with input values:

```
<input value='{{plateName}}'>
```

The plateName property will always reflect the value of this input, and vice versa.

#### Passing data between custom elements

Similar to the typical data bindings shown in the example above, components pass parts of their ViewModel to the ViewModels of child components, all the way down the application hierarchy. This is done using HTML attributes when instantiating a custom element.

Stache allows users to control the direction of data flow from parent to child components, for maximum flexibility. Properties that are passed from one component to another can create bindings in either direction, or both directions.

Sometimes you want changes in the parent component to update the child component:

```
<my-component {child-prop}="value"/>
```

Sometimes you want changes in the child to update the parent:

```
<my-component {^child-prop}="value"/>
```

Sometimes you want changes in the parent to update the child, and vice versa. This is especially useful when binding to the value of an input:

```
<my-component {(child-prop)}="value"/>
```

### Custom elements

One of the most important concepts in CanJS is splitting up your application functionality into independent, isolated, reusable custom HTML elements.

The major advantages of building applications based on custom HTML elements are:

1. Ease of page composition - Designers can do it! Non-developers can express complex behavior with little to no JavaScript required. All you need to build a new page or feature is HTML.

2. Forced modularity - Because the nature of HTML elements are isolated modules, custom HTML elements must be designed as small, isolated components. This makes them easier to test, debug, and understand.

3. Reuse - Custom elements are designed to be reusable across pages and applications.

Consider the following example:

```
<order-model get-list="{ period='previous_week' }" {^value}="*previousWeek" />
<order-model get-list="{ period='current_week' }" {^value}="*currentWeek" />

<bit-c3>
	<bit-c3-data>
		<bit-c3-data-column key="Last Week" {value}="*previousWeek.totals" />
		<bit-c3-data-column key="This Week" {value}="*currentWeek.totals" />
	</bit-c3-data>
</bit-c3>
```

This code demonstrates:

1. An element that can load data

2. Composable widget elements (a graph with a line-series)

If our designer wanted to add another period, all they would need to do is add another `<order-model>` and `<bit-c3-data-column>` element.

Here’s a working version of the same example in a JSBin.

[Custom HTML Elements on jsbin.com](http://jsbin.com/puwesa/embed?html,output)

Just like HTML’s natural advantages, composing entire applications from HTML building blocks allows for powerful and easy expression of dynamic behavior.

#### Benefits of custom elements

First, it's important to understand the background of custom elements and their advantages.

Before custom HTML elements existed, to add a datepicker to your page, you would:

1. Load a datepicker script

2. Add a placeholder HTML element

```
<div class='datepicker' />
```

1. Add JavaScript code to instantiate your datepicker

```javascript
$('.datepicker').datepicker()
```

With custom HTML elements, to add the same datepicker, you would:

1. Load a datepicker script

2. Add the datepicker to your HTML or template:

```
<datepicker value="{date}"/>
```

That might seem like a subtle difference, but it is actually a major step forward. The custom HTML element syntax allows for instantiation, configuration, and location, all happening at the same time.

Custom HTML elements are one aspect of [Web Components](http://webcomponents.org/), a collection of browser specs that have [yet to be implemented](http://caniuse.com/#search=components) across browsers.

#### Defining a custom element

[can-component](../../can-component.html) is a modern take on web components.

Components in CanJS have three basic building blocks:

* a template

* a viewModel object

* event handlers

```javascript
var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var stache = require("can-stache");

var HelloWorldVM = DefineMap.extend({
		visible: {value: false},
		message: {value: "Hello There!"}
});

Component.extend({
	tag: "hello-world",
	view: stache("{{#if visible}}{{message}}{{else}}Click me{{/if}}"),
	ViewModel: HelloWorldVM,
	events: {
		click: function(){
				this.viewModel.visible = !this.viewModel.visible;
		}
	}
});
```

Another way to define a component is with a [web component](https://github.com/donejs/done-component) style declaration, using a single file with a `.component` extension:

```
<can-component tag="hello-world">
		<style type="less">
				i {
						color: red;
				}
		</style>
		<template>
				{{#if visible}}<b>{{message}}</b>{{else}}<i>Click me</i>{{/if}}
		</template>
		<script type="view-model">
				export default {
						visible: true,
						message: "Hello There!"
				};
		</script>
		<script type="events">
				export default {
						click: function(){
								this.viewModel.attr("visible", !this.viewModel.attr("visible"))
						}
				};
		</script>
</can-component>
```

#### Loading data with custom elements

The beauty and power of custom HTML elements is most apparent when visual widgets (like graphs) are combined with elements that express data.

Back to our original example:

```
<order-model findAll="{previousWeek}" [previousWeekData]="{value}"/>
<order-model findAll="{currentWeek}" [currentWeekData]="{value}"/>

<bit-graph title="Week over week">
	<bit-series data="{../previousWeekData}" />
	<bit-series data="{../currentWeekData}" color="Blue"/>
</bit-graph>
```

This template combines a request for data with an element that expresses it. It's immediately obvious how you would add or remove features from this, allowing for quick changes and easy prototyping. Without custom elements, the same changes would require more difficult code changes and wiring those changes up with widget elements that display the data.

Data custom elements are part of can-connect's [can-tag](../../can-connect/can/tag/tag.html) feature.

### Minimal DOM updates

Virtual DOM

Consider the following Stache template:

```
{{#rows}}
	<div>{{name}}</div>
{{/rows}}
```

And the following change to its data:

```javascript
rows[0].name = 'changed'; // change the first row's name
```

A data binding for that row would be invoked. The data binding results in the following code being run:

```javascript
textNode.nodeValue = 'changed';
```

Similarly, if the binding existed as an attribute, like `<div class={{className}}>`, the data binding would use `setAttribute` to make the update.

This is significant because Stache takes pains to localize any changes to a template, changing only the most minimal piece necessary. Updates to the DOM are relatively expensive, so stache tries to keep the path between a data change and the DOM change as frictionless as possible.

In Backbone, you would need to manually re-render the template or roll your own rendering library.

In React and other virtual DOM libraries, that would result in the virtual DOM being re-rendered. A diff algorithm comparing the new and old virtual DOM would discover the changed node, and then the specific DOM node would be updated.

Stache, by comparison, performs less logic than Virtual DOMs would require in order to update the DOM in the most minimal way necessary because the virtual DOM comparison step is not necessary, which is visible in the following benchmark that tests the time needed to update the DOM when a single property changes:

<img src="../../docs/can-guides/images/introduction/dom-updates.png" style="width:100%;max-width:750px" />

You can run this test yourself at [JS Bin](http://output.jsbin.com/giyobi/1)

This performance gap is more visible when rendering a large number of items in the page:

<img src="../../docs/can-guides/images/introduction/rendering-performance.png" style="width:100%;max-width:750px" />

*For a small set of todos the difference is negligible but as the number increases the gap widens to the point where React is 6 times slower than Stache when rendering 1000 todos.*

You can run this test for yourself at [JS Bin](http://output.jsbin.com/monoqagofa/1).

With synchronously observable objects and data bindings that change minimal parts of the DOM, Stache aims to hit the sweet spot between powerful and performant.

### Template minification

While templates provide obvious benefits to application maintainability, they can be a bane on performance unless they are correctly integrated into the build tool chain.

An ecosystem library called [steal-stache](../../steal-stache.html) provides an easy hook to load Stache templates using ES6 import statements and include the compiled templates into the minified result of the build.

Steal-stache returns a renderer function that will render the template into a document fragment.

```javascript
import todosStache from "todos.stache"
todosStache([{name: "dishes"}]) //-> <documentFragment>
```

When the build is run, this import statement will tell StealJS that "todos.stache" is a dependency, and will include it in the minification like any other script dependencies in the application.

### In-template dependency declarations

[can-view-import](../../can-view-import.html) is a feature that allows templates to be entirely self-sufficient. You can load custom elements, helpers, and other modules straight from a template file like:

```
<can-import from="components/my_tabs"/>
<can-import from="helpers/prettyDate"/>
<my-tabs>
  <my-panel title="{{prettyDate start}}">...</my-panel>
  <my-panel title="{{prettyDate end}}">...</my-panel>
</my-tabs>
```

### Progressive Loading

A template may load or conditionally load a module after the initial page load. `<can-import>` allows progressive loading by using an end tag.

This feature, when used with [steal-stache](../../steal-stache.html), signals to the build that the enclosed section's dependencies should be dynamically loaded at runtime.

```
{{#eq location 'home'}}
<can-import from="components/home">
  <my-home/>
</can-import>
{{/eq}}
{{#eq location 'away'}}
<can-import from="components/chat">
  <my-chat/>
</can-import>
{{/eq}}
```

## Models

As previously mentioned, models are responsible for loading data from a server and representing the data sent back from a server.

Models often perform data validation and sanitization logic. They use intelligent set logic to cache data, minimize network requests, and provide real-time functionality.

### Server connection and data type separation of concerns

CanJS helps you organize your model code into two distinct parts:

1) Communicating with a server.
2) Managing the returned data.

This is accomplished by encapsulating the code required to connect to a service and encouraging typed definitions of the data the service returns.

In essence, for every “type” of data object in your project, you can create a model to represent the properties and methods attached to it. With this model in hand, you can also structure how you communicate with your server. Different API calls can return the same type of data and have those represented as model objects.

Let’s look at an example of how we would define a `Todo` type and a list of todos:

```javascript
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");

var Todo = DefineMap.extend({
	complete: "boolean",
	name: "string"
});

var TodoList = DefineList.extend({
	"#": Todo,
	completeCount: function(){
		return this.filter({complete: true}).length;
	}
})
```

This example uses [can-define/map/map] to create a type definition for a `Todo`; each instance of `Todo` has a boolean `complete` property and a string `name` property.

This example also uses [can-define/list/list] to define a type for an array of `Todo` instances; the list has a `completeCount` method for easily determining how many todos in the list have been completed.

Using [can-connect], we can create a connection that connects a restful `/api/todos` service to `Todo` instances and `TodoList` lists:

```javascript
var connect = require("can-connect");
var todoConnection = connect([
	require("can-connect/constructor/constructor"),
	require("can-connect/data/url/url")
], {
	url: "/api/todos",
	list: function(listData, set) {
		return new TodoList(listData.data);
	},
	instance: function(props) {
		return new Todo(props);
	}
});
```

That connection can be used to get a `TodoList` of `Todo`s:

```javascript
todoConnection.getList({}).then(function(todos) {
	// Do what you’d like with the `todos`
});
```

### Real-time instance updates

As mentioned previously, CanJS has observables to automatically propagate changes from an object to the view (DOM); this is called live binding.

[can-connect] also has an instance store for two purposes:

1. Preventing duplicate instances of a model from creating duplicate instance copies that get out of sync.
2. Cleaning up old unused instances so that the size of this store remains minimal and applications don't slowly collect memory over time without releasing it.

#### Duplicate instances

The instance store prevents duplicate instances from being created by storing each model object by its `id` (by default; you can configure which property is used).

Let’s look at how duplicate instances are prevented by continuing with our todo app example.

```javascript
todoConnection.getList({completed: false}).then(function(incompleteTodos) {});
```

`incompleteTodos` might look like this:

    [
      {id: 2, completed: false, name: "Finish docs", priority: "high"},
      {id: 3, completed: false, name: "Publish release", priority: "medium"}
    ]

Next, let’s fetch a list of high-priority todos:

```javascript
todoConnection.getList({priority: "high"}).then(function(urgentTodos) {});
```

`urgentTodos` might look like this:

    [
      {id: 1, completed: true, name: "Finish code", priority: "high"},
      {id: 2, completed: false, name: "Finish docs", priority: "high"}
    ]

Note that the “Finish docs” todo appears in both lists. CanJS [can-set.props.id intelligently] matches the todos by `id`, thus reusing the first instance of “Finish docs” that was created when `incompleteTodos` was fetched.

If these todos are displayed in separate lists on the page, and a user marks “Finish docs” as completed in one of the lists (causing the `completed` property to be set to `true`), then the other list will reflect this change.

#### Prevent memory leaks

A global instance store _sounds_ great until you consider the memory implications: if every model object instance is tracked, then won’t the application’s memory usage only grow over time?

CanJS intelligently solves this potential problem for you by keeping track of which objects are observing changes to your model object instances.

The reference count for each object increases in two ways:

1. Explicitly: if you call `.bind()` on an instance, like so: `todo.bind('name', function(){})`

2. Implicitly: if properties of the instance are bound to via live-binding in a view, e.g. `Name: {{name}}` in a [can-stache] template

Similarly, the reference count is decreased in two ways:

1. Explicitly: if you call `.unbind()` on an instance

2. Implicitly: if part of the DOM connected to a live-binding gets removed

When the reference count for a model object instance gets back down to 0 (no more references), the instance is removed from the store so its memory can be garbage collected.

The result is that in long-running applications that stream large amounts of data, this store will not cause memory to increase unnecessarily over time.

You can read more about the benefits of the instance store in our [“Avoid the Zombie Apocalypse” blog post](https://www.bitovi.com/blog/avoid-the-zombie-apocalypse).

### Real-time list updates

In addition to keeping object instances up to date, CanJS also automatically inserts, removes, and replaces objects within lists.

Let’s continue with our incomplete and urgent todo example from the previous section.

`incompleteTodos` looks like this:

    [
      {id: 2, completed: false, name: "Finish docs", priority: "high"},
      {id: 3, completed: false, name: "Publish release", priority: "medium"}
    ]

`urgentTodos` looks like this:

    [
      {id: 1, completed: true, name: "Finish code", priority: "high"},
      {id: 2, completed: false, name: "Finish docs", priority: "high"}
    ]

In the UI, there’s a checkbox next to each urgent todo that sets the `completed` property like this:

```javascript
todo.completed = !todo.completed;
```

When the user clicks the checkbox for the “Finish docs” todo, its `completed` property gets set to `true` and it automatically disappears from the `incompleteTodos` list.

How is that possible? The answer is the list store and set logic, made possible with [can-set].

Similar to the instance store, the list store is a collection of all the model lists in a CanJS application. It’s memory safe (it won’t leak) and understands what your parameters mean, so it can intelligently insert, remove, and replace objects within your lists.

#### Parameter awareness

When you make a request like the one below:

```javascript
todoConnection.getList({completed: false}).then(function(incompleteTodos) {});
```

[can-connect] uses [can-set] to create an [can-set.Algebra Algebra] that represents all incomplete todos.

```
var set = require("can-set");
var algebra = new set.Algebra(
	set.props.boolean("completed")
);
``` 

The `algebra` is associated with `incompleteTodos` so `can-connect` knows that `incompleteTodos` should contain _any_ todo with a `false` `completed` property. Thus, when our application logic sets `completed` on any todo to `false`, that todo will be added to `incompleteTodos` _without_ re-fetching the list from the server; similarly, if you set `completed` to `true` on any todo within `incompleteTodos`, that todo will be removed from the list.

This behavior is extremely powerful for a couple reasons:

- You don’t have to update any lists yourself.
- You don’t need to make another request to the server to refresh data updated within the application.

If you’ve ever written a CRUD application and had to implement this functionality yourself, you’ll understand the immense value in having this abstracted away from you by CanJS.

You can read more about the magic of `can-set` in its [can-set API docs].

### Caching and minimal data requests

Undoubtedly, the slowest part of any web application is communicating with the server. CanJS uses the following strategies to improve performance:

* Combining requests: combine multiple requests to the same API into one request
* Fall-through caching: improve perceived performance by showing cached data first (while still fetching the latest data)
* Request caching: reduce the number and size of server requests by intelligently using cached datasets

#### Combining requests

CanJS collects requests that are made within [can-connect/data/combine-requests.time a millisecond] of each other and tries to combine them into a single request if they are for the same API.

For example, let’s say we’re loading a page that has two parts: a section with todos that need to be completed and a section that’s an archive of completed todos. The incomplete section is just a list of todos, while the archive section is broken up by month, so you want to split these sections into two different components.

In most other frameworks, you would probably decide to have some parent component fetch the list of all todos so you could pass different subsets to each component. This decreases the reusability and maintainability of the components, but it would result in just one network request instead of two.

With CanJS, you don't have to choose between maintainability and performance. You can decide to have each component fetch its data independently and [can-connect] will intelligently combine the two requests into one.

This is made possible by the [can-set] algebra we discussed earlier. [can-connect] sees the outgoing requests, can determine that requests for `todoConnection.getList({completed: true})` and `todoConnection.getList({completed: false})` are equivalent to just one `todoConnection.getList({})` request, then make that single request and return the correct data to each call.

This [can-connect/data/combine-requests/combine-requests configurable behavior] is extremely powerful because it abstracts network request complexity away from how you create and compose your application.

#### Fall-through caching

To increase perceived performance, `can-connect` includes a [can-connect/fall-through-cache/fall-through-cache fall-through cache] that first serves cached data from `localStorage` while simultaneously making the API request to get the latest data.

The major benefit of this technique is improved perceived performance: users will see content faster because it’s returned immediately from the cache. When the data hasn’t changed, the user doesn’t notice anything, but when it has, the magic of live-bindings automatically updates the data as soon as the API request finishes.

#### Request caching

In some scenarios, an even more aggressive caching strategy is favorable. One example is fetching data that doesn’t change very often, or cached data that you can invalidate yourself. The [can-connect/cache-requests/cache-requests] behavior can reduce both the number of requests that are made and the size of those requests in these cases.

In the first scenario, where the data doesn’t change very often (and thus shouldn’t be fetched again during the lifetime of the application), no more requests to the API will be made for that same set of data. In the second scenario, you can choose to invalidate the cache yourself, so after the first API request the data is always cached until you clear it manually.

Additionally, the request logic is more aggressive in its attempts to find subsets of the data within the cache and to only make an API request for the subset NOT found in the cache. In other words, partial cache hits are supported.

### Works with related data

CanJS makes dealing with document-based APIs easier by handling situations where the server might return either a reference to a value or the value itself.

For example, in a MongoDB setup, a request like `GET /api/todos/2` might return:

```
{
  id: 2,
  name: "Finish docs",
  projectRef: 1
}
```

But a request like `GET /api/todos/2?$populate=projectRef` might return:

```
{
  id: 2,
  name: "Finish docs",
  projectRef: {
	id: 1,
	name: "Release"
  }
}
```

[can-connect/can/ref/ref] handles this ambiguity by creating a [can-connect/can/ref/ref.Map.Ref Ref type] that is always populated by the `id` and can contain the full value if it’s been fetched.

For example, without populating the project data:

```
Todo.get({id: 2}).then(function(todo){
  todo.projectRef.id //-> 2
});
```

With populating the project data:

```
Todo.get({id: 2, populate: "projectRef"}).then(function(todo){
  todo.projectRef.id //-> 2
});
```

The values of other properties and methods on the [can-connect/can/ref/ref.Map.Ref Ref type] are determined by whether the reference was populated or the referenced item already exists in the [can-connect/constructor/store/store.instanceStore].

For example, `value`, which points to the referenced instance, will be populated if the reference was populated:

```
Todo.get({id: 2, populate: "projectRef"}).then(function(todo){
  todo.projectRef.value.name //-> “Release”
});
```

Or, it can be lazy loaded if it’s used in a template. For example, with this template:

```
{{#each todos as todo}}
  Name: {{todo.name}}
  Project: {{todo.projectRef.value.name}}
{{/each}}
```

If `todo.projectRef.value` hasn’t been loaded by some other means, CanJS will fetch it from the server so it can be displayed in the template. This is handled automatically without you having to write any additional code to fetch the project data.

Additionally, if multiple todos have the same project, only one request will be made to the server (if the data isn’t already cached), thanks to the [can-connect/data/combine-requests/combine-requests] behavior.

## jQuery integration

By default, CanJS's [can-core] works without jQuery.  However, the [can-jquery]
module integrates jQuery's and CanJS's event system.  This allows you to listen to
jQuery custom events like `draginit` directly in [can-stache-bindings.event can-stache event bindings]
or using [can-control].

[This JSBin](http://jsbin.com/yifopus/edit?html,css,js,output) lets a user drag an item
into a trash can using custom jQuery drag/drop events.

## Server Side Rendering

CanJS applications are able to be rendered on the server by running the same code. This is known as [Isomorphic JavaScript](http://isomorphic.net/javascript) or [Universal JavaScript](https://medium.com/@mjackson/universal-javascript-4761051b7ae9).

Server-side rendering (SSR) provides two main benefits over traditional single page apps: better page load performance and SEO support.

CanJS makes it possible to load your application on the server. This is because CanJS works in a NodeJS context, on top of a virtual DOM.

Using [can-vdom](../can-vdom.html) and [can-zone](../can-zone.html), you can set up your own server side rendering system, such as [the one used in DoneJS](https://donejs.com/Apis.html#section=section_ServerSideRenderingAPIs). For information on using SSR without setting anything up yourself, please check out the DoneJS [quick start](https://donejs.com/Guide.html) and [in depth](https://donejs.com/place-my-order.html) guides.
