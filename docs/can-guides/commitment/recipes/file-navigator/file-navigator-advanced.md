@page guides/recipes/file-navigator-advanced File Navigator Guide (Advanced)
@parent guides/recipes

@description This guide walks you through building a file navigation
widget that requests data with fetch. It takes about 45 minutes to complete.


@body

> Check out the [guides/recipes/file-navigator-simple]
for an example that doesn't make data requests.

The final widget looks like:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="cherifGsoul" data-slug-hash="zbxLGW" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator advanced [Finished]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/zbxLGW/">
  File Navigator advanced [Finished]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

> Note: If you don’t see any files show up, run the CodePen again. This
> CodePen uses randomly generated files, so it’s possible nothing shows up.

__Start this tutorial by cloning the following CodePen__:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="css,result" data-user="cherifGsoul" data-slug-hash="gEojEK" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator Guide (Advanced) [Starter]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/gEojEK/">
  File Navigator Guide (Advanced) [Starter]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- Problem - A description of what the section is trying to accomplish.
- Things to know - Information about CanJS that is useful for solving the problem.
- Solution - The solution to the problem.

Watch a video of us building this recipe here:

<iframe width="560" height="315" src="https://www.youtube.com/embed/_7FJA0PzAgA" frameborder="0" allowfullscreen></iframe>


## Build a service layer with fixtures

### Problem

Make an `/api/entities` service layer that provides the files and folders for another folder.  An `entity` can be either a file or folder.  A single `entity` looks like:

```js
{
  id: "2",
  name: "dogs",
  parentId: "0",     // The id of the folder this file or folder is within.
  type: "folder",    // or "file",
  hasChildren: true  // false for a folder with no children, or a file
}
```

To get the list of files and folders within a given folder, a `GET` request should be made as follows:

```
GET /api/entities?folderId=0
```

This should return the list of folders and files directly within that folder like:

```js
{
  data: [
   { id: "7", name: "pekingese.png", parentId: "0", type: "file",   hasChildren: false },
   { id: "8", name: "poodles",       parentId: "0", type: "folder", hasChildren: false },
   { id: "9", name: "hounds",        parentId: "0", type: "folder", hasChildren: true }
  ]
}
```

The first level files and folders should have a `parentId` of `"0"`.

### Things to know

- [can-fixture] is used to trap AJAX requests like:

  ```js
  can.fixture("/api/entities", function(request) {
    // request.data.folderId -> "1"
    return {data: [ ... ]}
  })
  ```

- [can-fixture.store] can be used to automatically filter records using the query string:

  ```js
  const entities = [ ... ];
  const entitiesStore = can.fixture.store( entities );
  can.fixture("/api/entities", entitiesStore);
  ```

- [can-fixture.rand] can be used to create a random integer:
  ```
  can.fixture.rand(10) //-> 10
  can.fixture.rand(10) //-> 0
  ```



### Solution

First, let’s make a function that generates an array of `entities` that will be
stored on our fake server. Update the __JavaScript__ tab to:

@sourceref ./file-navigator-advanced-1.js

Next, let’s make those entities, create a `store` to house them, and trap AJAX
requests to use that `store`:

@sourceref ./file-navigator-advanced-2.js
@highlight 45-55,only

## Create the `Entity` Model

### The problem

When we load entities from the server, it’s useful to convert them into `Entity` type instances.  We will want to create an observable `Entity` type using [can-define/map/map] so we can do:

```js
const entity = new Entity({
  id: "2",
  name: "dogs",
  parentId: "0",     // The id of the folder this file or folder is within.
  type: "folder",    // or "file",
  hasChildren: true  // false for a folder with no children, or a file
});

entity.on("name", function(ev, newName) {
  console.log("entity name changed to ", newName);
});

entity.name = "cats" //-> logs "entity name changed to cats"
```

### Things to know

You can create a `DefineMap` type using [can-define/map/map.extend DefineMap.extend] with the type’s properties and the properties’ types like:

```js
import { DefineMap } from "can";
Type = DefineMap.extend({
  id: "string",
  hasChildren: "boolean",
  ...
});
```

### The solution

Extend [can-define/map/map DefineMap] with each property and its type as follows:

@sourceref ./file-navigator-advanced-3.js
@highlight 1,57-63,only

## Connect the `Entity` model to the service layer

### The problem

We want to be able to load a list of `Entity` instances from `GET /api/entities` with:

```js
Entity.getList({parentId: "0"}).then(function(entities) {
    console.log(entities.get()) //-> [ Entity{id: "1", parentId: "0", ...}, ...]
});
```

### Things to know

[can-realtime-rest-model realtimeRestModel()] can connect a `Map` type to
a `url` like:

```js
realtimeRestModel({
  Map: Entity,
  url: "URL"
});
```

### The solution

Use `realtimeRestModel` to connect `Entity` to `/api/entities` like:

@sourceref ./file-navigator-advanced-4.js
@highlight 1,65-67,69-73,only

## Create the ROOT entity and render it

### The problem

We need to begin converting the static HTML the designer gave us into live HTML.  This means
rendering it in a template.  We’ll start slow by rendering the `root` parent folder’s name
in the same way it’s expected by the designer.


### Things to know

- CanJS [can-component Component] uses [can-stache] to render data in a template
  and keep it live.  Templates can be authored in `view` property like:

  ```js
  import { Component } from "can";

  Component.extend({
    tag: 'my-component',
    view: `TEMPLATE CONTENT`
    ViewModel: {}
  });
  ```

  A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```js
  import { Component } from "can";
  
  Component.extend({
    tag: 'my-component',
    view: `{{something.name}}`
    ViewModel: {}
  });
  ```

- Mount the component into the page with it's custom tag:

  ```
  <my-component />
  ```

- You can create an `Entity` instance as follows:
  ```js
  const folder = new Entity({...});
  ```

  Where {...} is an object of the properties you need to create like `{id: "0", name: "ROOT", ...}`.
  Pass this to the template.


### The solution

Update the __HTML__ tab to render the `folder`’s name.

```html
<file-navigator></file-navigator>
```
@highlight 2

Update the __JavaScript__ tab to:

1. Create a `folder` `Entity` instance.
2. Write the component view template that displays the `folder` `Entity` `name`.
3- Write the component `ViewModel` that has `folder` property with `folder` `Entity` instance as value.

@sourceref ./file-navigator-advanced-5.js
@highlight 1,74-79,81-91,only

## Render the ROOT entities children

### The problem

In this section, we’ll list the files and folders within the root folder.

### Things to know

- Use [can-stache.helpers.if {{#if(value)}}] to do `if/else` branching in `can-stache`.
- Use [can-stache.helpers.for-of {{#for(of)}}] to do looping in `can-stache`.
- Use [can-stache.helpers.is {{#eq(value1, value2)}}] to test equality in `can-stache`.
- `Promise`s are observable in `can-stache`.  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{#if(somePromise.isPending)}}`.
  - Loop through the resolved value of the promise like: `{{#for(item of somePromise.value)}}`.
- Write `<div class="loading">Loading</div>` when files are loading.
- Write a `<ul>` to contain all the files.  Within the `<ul>` there should be:
  - An `<li>` with a class attribute that includes `file` or `folder` and `hasChildren` if the folder has children.
  - The `<li>` should have `📝 <span>{{FILE_NAME}}</span>` if a file and `📁 <span>{{FOLDER_NAME}}</span>` if a folder.

### The solution

Update the __JavaScript__ tab to:

- Use `entitiesPromise` to write `<div class="loading">Loading</div>` while
the promise is pending, and then writes out an `<li>` for each entity in the resolved `entitiesPromise`

- Add `entitiesPromise` property to the `ViewModel`.  `entitiesPromise`
will contain the files and folders that are directly within the root folder.

@sourceref ./file-navigator-advanced-6.js
@highlight 85-99,105-109,only

## Create an `<a-folder>` custom element to manage folder behavior

### The problem

Now we want to make all the folders able to open and close.  This means creating a `FolderVM` for every folder entity.

### Things to know

- [can-component Component] is used to create custom elements like:
  ```js
  import { Component } from "can";
  Component.extend({
    tag: "my-component",
    ViewModel: {
      message: {default: "Hello There!"}
    },
    view: can.stache("<h1>{{message}}</h1>");
  });
  ```
  This component will be created anytime a `<my-component>` element is found in the page.  When the component is created, it creates
  an instance of its `ViewModel`, in this case `MyComponentVM`.

- You can pass data to a component’s `ViewModel` with [can-stache-bindings.toChild {data-bindings}] like:

  ```html
  <my-component message:from="'Hi There'" />
  ```

  This sets `message` on the ViewModel to `'Hi There'`.  You can also send data within stache like:

  ```html
  <my-component message:from="greeting" />
  ```
  This sets `message` on the ViewModel to what `greeting` is in the stache template.

- A component’s [View] is rendered inside the component.  This means that if the following is in a template:

  ```
  <my-component {message}="'Hi There'" />
  ```

  The following will be inserted into the page:

  ```
  <my-component {message}="'Hi There'"><h1>Hi There</h1></my-component>
  ```

- `this` in a stache template refers to the current context of a template or section.  

  For example, the `this` in `this.name` refers to the `context` object:

  ```javascript
  const template = stache("{{this.name}}");
  const context = {name: "Justin"};
  template(context);
  ```
- CanJS uses [guides/technicalViewModels#MaintainableMVVM ViewModels] to manage the behavior
  of views.  ViewModels can have their own state, such as if a folder `isOpen` and should be showing
  its children. `ViewModels` are constructor functions created with [can-define/map/map DefineMap].

- [can-define/map/map DefineMap] can detail the type of a property with another type like:
  ```js
  import { DefineMap } from "can";
  const Address = DefineMap.extend({
    street: "string",
    city: "string"
  });
  const Person = DefineMap.extend({
    address: Address
  });
  ```

- [can-define/map/map DefineMap] can also specify default values:
  ```js
  const Person = DefineMap.extend({
    address: Address,
    age: {default: 33}
  });
  ```

- [can-define/map/map DefineMap] can also specify a default value and a type:
  ```js
  const Person = DefineMap.extend({
    address: Address,
    age: {default: 33, type: "number"}
  });
  ```

- [can-define/map/map DefineMap] can also have methods:

  ```js
  const Person = DefineMap.extend({
    address: Address,
    age: {default: 33, type: "number"},
    birthday: function() {
      this.age++;
    }
  });
  ```

- Use [can-stache-bindings.event] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked.

   ```html
   <div on:click="doSomething()"> ... </div>
   ```


### The solution

The following:

1. Moves the content that was in the `<file-navigator>` `view` to the `<a-folder>` `view`.
2. Changes the `view` in `file-navigator` component to use the `<a-folder>` component to render the root folder. It
   passes the root folder as `folder` to the `<a-folder>` component’s ViewModel.
3. Define `<a-folder>` `ViewModel` that will manage the UI state around a folder.  Specifically the `ViewModel` has:
   - `folder` which references the folder being displayed.
   - `entitiesPromise` which will be a promise of all files for that folder.
   - `isOpen` which tracks if the folder’s children should be displayed.
   - `toggleOpen` which changes `isOpen`.
4. Recursively renders each child folder with `<a-folder folder:from="this" />`.


@sourceref ./file-navigator-advanced-7.js
@highlight 81-115,119,only



## Result

When complete, you should have a working file-navigation widget
like the following CodePen:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="cherifGsoul" data-slug-hash="zbxLGW" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator advanced [Finished]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/zbxLGW/">
  File Navigator advanced [Finished]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
