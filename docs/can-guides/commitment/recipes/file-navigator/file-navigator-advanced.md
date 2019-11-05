@page guides/recipes/file-navigator-advanced File Navigator
@parent guides/recipes/advanced

@description This advanced guide walks you through building a file navigation
widget that requests data with fetch. It takes about 45 minutes to complete.


@body

> Check out the [guides/recipes/file-navigator-simple]
for an example that doesn't make data requests.

The final widget looks like:

<p class="codepen" data-height="404" data-theme-id="0" data-default-tab="result" data-user="bitovi" data-slug-hash="rNBMNrX" style="height: 404px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator advanced [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/rNBMNrX/">
  File Navigator advanced [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

> **Note:** If you don’t see any files show up, run the CodePen again. This
> CodePen uses randomly generated files, so it’s possible nothing shows up.

__START THIS TUTORIAL BY CLICKING THE “EDIT ON CODEPEN” BUTTON IN THE TOP RIGHT CORNER OF THE FOLLOWING EMBED__:

<p class="codepen" data-height="136" data-theme-id="0" data-default-tab="js" data-user="bitovi" data-slug-hash="jONYePW" style="height: 136px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator Guide (Advanced) [Starter]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/jONYePW/">
  File Navigator Guide (Advanced) [Starter]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p><br>

This CodePen has initial prototype CSS and JS which is useful for
getting the application to look right.

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.

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

### What you need to know

- [can-fixture] is used to trap AJAX requests like:

  ```js
  fixture("/api/entities", function(request) {
    // request.data.folderId -> "1"
    return {
      data: [
        // ...
      ]
    };
  });
  ```

- [can-fixture.store] can be used to automatically filter records using the query string:

  ```js
  const entities = [
    // ...
  ];
  const entitiesStore = fixture.store( entities );
  fixture("/api/entities", entitiesStore);
  ```

- [can-fixture.rand] can be used to create a random integer:
  ```js
  fixture.rand(10) //-> 10
  fixture.rand(10) //-> 0
  ```



### Solution

Update the __JavaScript__ tab to:

- Make a function that generates an array of `entities` that will be
stored on our fake server.

- Make those entities, create a `store` to house them, and trap AJAX
requests to use that `store`:

@sourceref ./file-navigator-advanced-2.js
@highlight 3-53,only

## Create the `Entity` Model

### The problem

When we load entities from the server, it’s useful to convert them into `Entity` type instances.  We will want to create an observable `Entity` type using [can-observable-object] so we can do:

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

### What you need to know

You can create an [can-observable-object ObservableObject] type with the type’s 
properties and the properties’ types like:

```js
import { ObservableObject } from "can";
class Type extends ObservableObject {
  static props = {
    id: String,
    hasChildren: Boolean
    // ...
  };
}
```

### The solution

Extend [can-observable-object ObservableObject] with each property and its type as follows:

@sourceref ./file-navigator-advanced-3.js
@highlight 1,55-63,only

## Connect the `Entity` model to the service layer

### The problem

We want to be able to load a list of `Entity` instances from `GET /api/entities` with:

```js
Entity.getList({ parentId: "0" }).then(function(entities) {
  console.log(entities.get()); //-> [ Entity{id: "1", parentId: "0", ...}, ...]
});
```

### What you need to know

[can-rest-model restModel()] can connect an `ObjectType` type to a `url` like:

```js
restModel({
  ObjectType: Entity,
  url: "URL"
});
```

### The solution

Use `restModel` to connect `Entity` to `/api/entities` like:

@sourceref ./file-navigator-advanced-4.js
@highlight 4,69-72,only

## Create the ROOT entity and render it

### The problem

We need to begin converting the static HTML the designer gave us into live HTML.  This means
rendering it in a template.  We’ll start slow by rendering the `root` parent folder’s name
in the same way it’s expected by the designer.


### What you need to know

- CanJS [can-stache-element StacheElement] uses [can-stache] to render data in a template
  and keep it live.  Templates can be authored in `view` property like:

  ```js
  import { StacheElement } from "can";

  class MyComponent extends StacheElement {
    static view = `TEMPLATE CONTENT`;
    static props = {};
  }

  customElements.define("my-component", MyComponent);
  ```

  A [can-stache] template uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```js
  import { StacheElement } from "can";

  class MyComponent extends StacheElement {
    static view = `{{something.name}}`;
    static props = {};
  }
  
  customElements.define("my-component", MyComponent);
  ```

- Mount the component into the page with its custom tag:

  ```html
  <my-component></my-component>
  ```

- You can create an `Entity` instance as follows:
  ```js
  const folder = new Entity({/*...*/});
  ```

  Where `{/*...*/}` is an object of the properties you need to create like `{id: "0", name: "ROOT", ...}`.
  Pass this to the template.


### The solution

Update the __HTML__ tab to render the `folder`’s name.

```html
<a-folder id="root"></a-folder>
```
@highlight 2

Update the __JavaScript__ tab to:

1. Define a component with `a-folder` custom tag
2. Write the component view template that displays the `folder` `Entity` `name`.
3. Add the following properties to the component:
  - `folder` which references the folder being displayed.
  - `entitiesPromise` which will be a promise of all files for that folder.
4. Set the component initial props values with the `assign` function

@sourceref ./file-navigator-advanced-5.js
@highlight 2,75-85,87-94,only

## Render the ROOT entities children

### The problem

In this section, we’ll list the files and folders within the root folder.

### What you need to know

- Use [can-stache.helpers.if {{# if(value) }}] to do `if/else` branching in [can-stache].
- Use [can-stache.helpers.for-of {{# for(of) }}] to do looping in [can-stache].
- Use [can-stache.helpers.is {{#eq(value1, value2)}}] to test equality in [can-stache].
- [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) are observable in [can-stache].  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{# if(somePromise.isPending) }}`.
  - Loop through the resolved value of the promise like: `{{# for(item of somePromise.value) }}`.
- Write `<div class="loading">Loading</div>` when files are loading.
- Write a `<ul>` to contain all the files.  Within the `<ul>` there should be:
  - An `<li>` with a class attribute that includes `file` or `folder` and `hasChildren` if the folder has children.
  - The `<li>` should have `📝 <span>{{FILE_NAME}}</span>` if a file and `📁 <span>{{FOLDER_NAME}}</span>` if a folder.

### The solution

Update the __JavaScript__ tab to:

- Add `entitiesPromise` property to the component.  `entitiesPromise`
will contain the files and folders that are directly within the root folder.

- Use `entitiesPromise` to write `<div class="loading">Loading</div>` while
the promise is pending, and then writes out an `<li>` for each entity in the resolved `entitiesPromise`

@sourceref ./file-navigator-advanced-6.js
@highlight 78-92,97-101,only

## Manage `<a-folder>` custom element behavior

### The problem

Now we want to make all the folders able to open and close.

### What you need to know

- CanJS uses [can-observable-object ObservableObject]-like properties to manage the behavior
  of views.  Components can have their own state, such as if a folder `isOpen` and should be showing
  its children.

- [can-observable-object ObservableObject]s can detail the type of a property with another type like:
  ```js
  import { ObservableObject } from "can";
  class Address extends ObservableObject {
    static props = {
      street: String,
      city: String
    };
  }
  class Person extends ObservableObject {
    static props = {
      address: Address
    };
  }
  ```

- [can-observable-object ObservableObject]s can also specify default values:
  ```js
  class Person extends ObservableObject {
    static props = {
      address: Address
      age: { default: 33 }
    };
  }
  ```

- [can-observable-object ObservableObject]s can also specify a default value and a type:
  ```js
  class Person extends ObservableObject {
    static props = {
      address: Address
      age: { type: Number, default: 33 }
    };
  }
  ```

- [can-observable-object ObservableObject]s can also have methods:

  ```js
  class Person extends ObservableObject {
    static props = {
      address: Address
      age: { type: Number, default: 33 }
    };
    birthday() {
      this.age++;
    }
  }
  ```

- Use [can-stache-bindings.event] to listen to an event on an element and call a method in [can-stache].  For example, the following calls `doSomething()` when the `<div>` is clicked.

  ```html
  <div on:click="doSomething()"> ... </div>
  ```


### The solution

The following:

3. Define component properties that will manage the UI state around a folder.:
  - `isOpen` which tracks if the folder’s children should be displayed.
  - `toggleOpen` which changes `isOpen`.
4. Recursively renders each child folder with `<a-folder folder:from="entity" />`.
5. Set the root folder `isOpen` property to `true` in the component mounting invocation (`root.assign`).


@sourceref ./file-navigator-advanced-7.js
@highlight 77-78,89,95,100,108-110,only



## Result

When complete, you should have a working file-navigation widget
like the following CodePen:

<p class="codepen" data-height="404" data-theme-id="0" data-default-tab="result" data-user="bitovi" data-slug-hash="rNBMNrX" style="height: 404px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator advanced [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/rNBMNrX/">
  File Navigator advanced [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
