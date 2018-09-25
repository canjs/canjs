@page guides/recipes/file-navigator-advanced File Navigator Guide (Advanced)
@parent guides/recipes

@description This guide walks you through building a file navigation
widget that requests data with fetch. It takes about 45 minutes to complete.


@body

> Check out the [guides/recipes/file-navigator-simple]
for an example that doesn't make data requests.

The final widget looks like:

<a class="jsbin-embed" href="https://jsbin.com/diqeyoj/30/embed?js,output">
  Finished version of the CanJS File Navigator Guide (Advanced) on jsbin.com
</a>
<a href="https://jsfiddle.net/donejs/0gxdzLa2/">Open in JSFiddle</a>

> Note: If you don’t see any files show up, run the JS Bin again. This
> JS Bin uses randomly generated files, so it’s possible nothing shows up.

__Start this tutorial by cloning the following JS Bin__:

<a class="jsbin-embed" href="https://jsbin.com/diqeyoj/33/embed?html,css,output">
  Starter version of the CanJS File Navigator Guide (Advanced) on jsbin.com
</a>
<a href="https://jsfiddle.net/donejs/t97z1hf9/">Open in JSFiddle</a>

This JS Bin has initial prototype HTML and CSS which is useful for
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
@highlight 43-53,only

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
Type = can.DefineMap.extend({
  id: "string",
  hasChildren: "boolean",
  ...
});
```

### The solution

Extend `can.DefineMap` with each property and its type as follows:

@sourceref ./file-navigator-advanced-3.js
@highlight 55-61,only

## Connect the `Entity` model to the service layer

### The problem

We want to be able to load a list of `Entity` instances from `GET /api/entities` with:

```js
Entity.getList({parentId: "0"}).then(function(entities) {
    console.log(entities.get()) //-> [ Entity{id: "1", parentId: "0", ...}, ...]
});
```

### Things to know

[can-connect/can/base-map/base-map can.connect.baseMap()] can connect a `Map` type to
a `url` like:

```js
can.connect.baseMap({
  Map: Entity,
  url: "URL"
});
```

### The solution

Use `can.connect.baseMap` to connect `Entity` to `/api/entities` like:

@sourceref ./file-navigator-advanced-4.js
@highlight 63-68,only

## Create the ROOT entity and render it

### The problem

We need to begin converting the static HTML the designer gave us into live HTML.  This means
rendering it in a template.  We’ll start slow by rendering the `root` parent folder’s name
in the same way it’s expected by the designer.


### Things to know

- CanJS uses [can-stache] to render data in a template
  and keep it live.  Templates can be authored in `<script>` tags like:

  ```html
  <script type="text/stache" id="app-template">
    TEMPLATE CONTENT
  </script>
  ```

  A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```html
  <script type="text/stache" id="app-template">
    {{something.name}}
  </script>
  ```

- Load a template from a `<script>` tag with [can-stache.from can.stache.from] like:
  ```js
  const template = can.stache.from(SCRIPT_ID);
  ```

- Render the template with data into a documentFragment like:

  ```js
  const fragment = template({
    something: {name: "Derek Brunson"}
  });
  ```

- Insert a fragment into the page with:

  ```
  document.body.appendChild(fragment);
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
<script type="text/stache" id="app-template">
  <span>{{folder.name}}</span>
</script>
```
@highlight 2

Update the __JavaScript__ tab to:

1. Create a `folder` `Entity` instance.
2. Load the `app-template`.  Renders it with `folder` instance, and inserts the result in the `<body>` element.

@sourceref ./file-navigator-advanced-5.js
@highlight 70-82,only

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

The following uses `entitiesPromise` to write `<div class="loading">Loading</div>` while
the promise is pending, and then writes out an `<li>` for each entity in the resolved `entitiesPromise`:

```html
<script type="text/stache" id="app-template">
  <span>{{folder.name}}</span>
  {{#if(entitiesPromise.isPending)}}
    <div class="loading">Loading</div>
  {{else}}
    <ul>
      {{#for(entity of entitiesPromise.value)}}
        <li class="{{entity.type}} {{#if(entity.hasChildren)}}hasChildren{{/if}}">
          {{#eq(entity.type, 'file')}}
            📝 <span>{{entity.name}}</span>
          {{else}}
            📁 <span>{{entity.name}}</span>
          {{/eq}}
        </li>
      {{/for}}
    </ul>
  {{/if}}
</script>
```
@highlight 3-17

The following adds an `entitiesPromise` to data passed to the template.  `entitiesPromise`
will contain the files and folders that are directly within the root folder.

@sourceref ./file-navigator-advanced-6.js
@highlight 79,only

## Toggle children with a ViewModel

### The problem

We want to hide the root folder’s children until the root folder is clicked on.  An subsequent
clicks on the root folder’s name should toggle if the children are displayed.

### Things to know

- CanJS uses [guides/technicalViewModels#MaintainableMVVM ViewModels] to manage the behavior
  of views.  ViewModels can have their own state, such as if a folder `isOpen` and should be showing
  its children. `ViewModels` are constructor functions created with [can-define/map/map can.DefineMap].

- `can.DefineMap` can detail the type of a property with another type like:
  ```js
  const Address = can.DefineMap.extend({
    street: "string",
    city: "string"
  });
  const Person = can.DefineMap.extend({
    address: Address
  });
  ```

- `can.DefineMap` can also specify default values:
  ```js
  const Person = can.DefineMap.extend({
    address: Address,
    age: {default: 33}
  });
  ```

- `can.DefineMap` can also specify a default value and a type:
  ```js
  const Person = can.DefineMap.extend({
    address: Address,
    age: {default: 33, type: "number"}
  });
  ```

- `can.DefineMap` can also have methods:

  ```js
  const Person = can.DefineMap.extend({
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

 - Defines a `FolderVM` type that will manage the UI state around a folder.  Specifically `FolderVM` has:
   - `folder` which references the folder being displayed.
   - `entitiesPromise` which will be a promise of all files for that folder.
   - `isOpen` which tracks if the folder’s children should be displayed.
   - `toggleOpen` which changes `isOpen`.
 -  Creates an instance of the `FolderVM` and uses it to render the template.

@sourceref ./file-navigator-advanced-7.js
@highlight 77-93,95,only

The following wraps the listing of child entities with a `{{#if(isOpen)}} {{/if}}`:

```html
<script type="text/stache" id="app-template">
  <span on:click="toggleOpen()">{{folder.name}}</span>
  {{#if(isOpen)}}
  {{#if(entitiesPromise.isPending)}}
    <div class="loading">Loading</div>
  {{else}}
    <ul>
      {{#for(entity of entitiesPromise.value)}}
        <li class="{{entity.type}} {{#if(entity.hasChildren)}}hasChildren{{/if}}">
          {{#eq(entity.type, 'file')}}
            📝 <span>{{entity.name}}</span>
          {{else}}
            📁 <span>{{entity.name}}</span>
          {{/eq}}
        </li>
      {{/for}}
    </ul>
  {{/if}}
  {{/if}}
</script>
```
@highlight 2-3,19

## Create an `<a-folder>` custom element to manage folder behavior

### The problem

Now we want to make all the folders able to open and close.  This means creating a `FolderVM` for every folder entity.

### Things to know

- [can-component can.Component] is used to create custom elements like:
  ```js
  const MyComponentVM = DefineMap.extend({
    message: {default: "Hello There!"}
  });

  can.Component.extend({
    tag: "my-component",
    ViewModel: MyComponentVM,
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


### The solution

The following:

1. Changes the `app-template` to use the `<a-folder>` component to render the root folder. It
   passes the root folder as `folder` to the `<a-folder>` component’s ViewModel.  It also sets the
   `<a-folder>` component’s ViewModel’s `isOpen` property to `true`.
2. Moves the content that was in `app-template` to the `folder-template` `<script>` tag.
3. Recursively renders each child folder with `<a-folder {folder}="this" />`.

```html
<script type="text/stache" id="app-template">
  <a-folder folder:from="this" isOpen:from="true" />        <!-- CHANGED -->
</script>

<!-- CONTENT FROM app-template-->
<script type="text/stache" id="folder-template">
  <span on:click="toggleOpen()">{{folder.name}}</span>
  {{#if(isOpen)}}
  {{#if(entitiesPromise.isPending)}}
    <div class="loading">Loading</div>
  {{else}}
    <ul>
      {{#for(entity of entitiesPromise.value)}}
        <li class="{{entity.type}} {{#if(entity.hasChildren)}}hasChildren{{/if}}">
          {{#eq(entity.type, 'file')}}
            📝 <span>{{entity.name}}</span>
          {{else}}
            📁 <a-folder folder:from="this" />            <!-- CHANGED -->
          {{/eq}}
        </li>
      {{/for}}
    </ul>
  {{/if}}
  {{/if}}
</script>
```
@highlight 2,18

The following:

1. Defines a custom `<a-folder>` element that manages its behavior with `FolderVM` and uses it to render a `folder-template`
   template.
2. Renders the `app-template` with the root `parent` folder instead of the `rootFolderVM`.

@sourceref ./file-navigator-advanced-8.js
@highlight 90-94,97,only

## Result

When complete, you should have a working file-navigation widget
like the following JS Bin:

<a class="jsbin-embed" href="https://jsbin.com/diqeyoj/30/embed?js,output">
  Finished version of the CanJS File Navigator Guide (Advanced) on jsbin.com
</a>
<a href="https://jsfiddle.net/donejs/0gxdzLa2/">Open in JSFiddle</a>

<script src="https://static.jsbin.com/js/embed.min.js?4.1.0"></script>
