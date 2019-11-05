@page guides/recipes/file-navigator-simple File Navigator
@parent guides/recipes/beginner

@description This beginner guide walks you through building a simple file navigation
widget.  It takes about 25 minutes to complete.  It was written with
CanJS 6.0.0. Check out the [guides/recipes/file-navigator-advanced]
for an example that makes AJAX requests for its data and uses [can-stache-element].


@body

The final widget looks like:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="aboqrxK" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator simple [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/aboqrxK/">
  File Navigator simple [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

Click `ROOT/` to see its files and folders.

> **Note:** If you don’t see any files show up, run the CodePen again. This
> CodePen uses randomly generated files, so it’s possible nothing shows up.

__Start this tutorial by cloning the following CodePen__:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="YzKaXGv" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator simple [Starter]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/YzKaXGv/">
  File Navigator simple [Starter]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- __The problem__ — A description of what the section is trying to accomplish.
- __What you need to know__ — Information about CanJS that is useful for solving the problem.
- __The solution__ — The solution to the problem.
- Test it (uncommon) - How to make sure the solution works.


## Understand the data

There is a randomly generated `rootEntityData` variable that contains a nested structure of
folders and files.  It looks like:


```js
{
  "id": "0",
  "name": "ROOT/",
  "hasChildren": true,
  "type": "folder",
  "children": [
    {
      "id": "1",
      "name": "File 1",
      "parentId": "0",
      "type": "file",
      "hasChildren": false
    },
    {
      "id": "2",
      "name": "File 2",
      "parentId": "0",
      "type": "file",
      "hasChildren": false
    },
    {
      "id": "3",
      "name": "Folder 3",
      "parentId": "0",
      "type": "folder",
      "hasChildren": true,
      "children": [
        {
          "id": "4",
          "name": "File 4",
          "parentId": "3",
          "type": "file",
          "hasChildren": false
        },
        {
          "id": "5",
          "name": "File 5",
          "parentId": "3",
          "type": "file",
          "hasChildren": false
        },
        {
          "id": "6",
          "name": "File 6",
          "parentId": "3",
          "type": "file",
          "hasChildren": false
        },
        {
          "id": "7",
          "name": "File 7",
          "parentId": "3",
          "type": "file",
          "hasChildren": false
        },
        {
          "id": "8",
          "name": "Folder 8",
          "parentId": "3",
          "type": "folder",
          "hasChildren": false,
          "children": []
        }
      ]
    },
    {
      "id": "9",
      "name": "File 9",
      "parentId": "0",
      "type": "file",
      "hasChildren": false
    }
  ]
}
```
Notice that entities have the following properties:

- __id__ - a unique id
- __name__ - the name of the file or folder
- __type__ - if this entity a "file" or "folder"
- __hasChildren__ - if this entity has children
- __children__ - An array of the child file and folder entities for this folder

## Render the root folder and its contents

### The problem

Let’s render `rootEntityData` in the page with its immediate children.

### What you need to know

- CanJS uses [can-stache-element] to render data in a template
  and keep it updated.  Templates can be authored in the element `view` property like:

  ```js
  class MyComponent extends StacheElement {
    static view = `TEMPLATE CONTENT`;
  }
  customElements.define("my-component", MyComponent);
  ```

- A custom element view is a [can-stache] template that uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```js
  class MyComponent extends StacheElement {
    static view = `{{this.message}}`;
    static props = {
      message: "Hello, World"
    };
  }
  customElements.define("my-component", MyComponent);
  ```

- Use [can-stache-element/static.props] to define the custom element data.
- Use [can-stache.helpers.if {{# if(value) }}] to do `if/else` branching in [can-stache].
- Use [can-stache.helpers.for-of {{# for(of) }}] to do looping in [can-stache].
- Use [can-stache.helpers.is {{# eq(value1, value2) }}] to test equality in [can-stache].
- [can-stache/keys/current {{./key}}] only returns the value in the current scope.
- Write a `<ul>` to contain all the files.  Within the `<ul>` there should be:
  - An `<li>` with a className that includes `file` or `folder` and `hasChildren` if the folder has children.
  - The `<li>` should have `📝 <span>{{FILE_NAME}}</span>` if a file and `📁 <span>{{FOLDER_NAME}}</span>` if a folder.

### The solution

Update the __HTML__ tab to:

@sourceref ./file-navigator-simple.html
@highlight 1,only

Update the __JavaScript__ tab to:

```js
import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class FileNavigator extends StacheElement {
  static view = `
    <span>{{this.rootEntity.name}}</span>
    <ul>
      {{# for(child of this.rootEntity.children) }}
        <li class="{{child.type}} {{# if(child.hasChildren) }}hasChildren{{/ if }}">
          {{# eq(child.type, 'file')}}
            📝 <span>{{child.name}}</span>
          {{else}}
            📁 <span>{{child.name}}</span>
          {{/ eq}}
        </li>
      {{/ for }}
    </ul>
  `;

  static props = {
    rootEntity: {
      get default() {
        return rootEntityData;
      }
    }
  };
}

customElements.define("file-navigator", FileNavigator);
```
@highlight 5-16,20-24,only

## Render all the files and folders

### The Problem

Now let’s render all of the files and folders!  This means we want to render the files and folders recursively.  Every time we find a folder, we need to render its contents.

### What you need to know

- A template can call out to another registered _partial_ template with [can-stache.tags.partial {{>PARTIAL_NAME}}] like the following:

  ```html
  {{>PARTIAL_NAME}}
  ```

- You can register an inline named partial within the current template [can-stache.tags.named-partial {{<PARTIAL_NAME}}] like the following:

  ```js
  class MyComponent extends StacheElement {
    static view = `{{<partialView}} BLOCK {{/partialView}}`;
  }
  ```

- The registered inline named partial can be called
  [recursively](https://canjs.com/doc/can-stache.tags.named-partial.html#TooMuchRecursion) like the following:
```html
{{<recursiveView}}
  <div>{{name}} <b>Type:</b> {{#if(nodes.length)}}Branch{{else}}Leaf{{/if}}</div>
  {{# for (node of nodes) }}
    {{>recursiveView}}
  {{/ for }}
{{/recursiveView}}

{{>recursiveView(yayRecursion)}}`
```
### The Solution

Update the __JAVSCRIPT__ tab to:

- Call to an `{{>entities}}` partial.

```js
import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class FileNavigator extends StacheElement {
  static view = `
    {{<entities}}
      <span>{{this.name}}</span>
      <ul>
        {{# for(child of this.children) }}
          <li class="{{child.type}} {{# if(child.hasChildren) }}hasChildren{{/ if }}">
            {{# eq(child.type, 'file')}}
              📝 <span>{{child.name}}</span>
            {{else}}
              📁 {{entities(child)}}
            {{/ eq}}
          </li>
        {{/ for }}
      </ul>
    {{/entities}}

    {{entities(this.rootEntity)}}
  `;

  static props = {
    rootEntity: {
      get default() {
        return rootEntityData;
      }
    };
  }
}

customElements.define("file-navigator", FileNavigator);
```
@highlight 5-18,20,only

## Make the data observable

### The problem

For rich behavior, we need to convert the raw JS data into typed observable data.  When
we change the data, the UI will automatically change.

### What you need to know

- [can-observable-object] allows you to define a type by defining the type’s
  properties and the properties’ types like:

  ```js
  import { ObservableObject } from "can";

  class Person extends ObservableObject {
    static props = {
      name: String,
      age: Number
    };
  }
  ```

  This lets you create instances of that type and listen to changes like:

  ```js
  const person = new Person({
    name: "Justin",
    age: 34
  });

  person.on("name", function(ev, newName) {
    console.log("person name changed to ", newName);
  });

  person.name = "Kevin" //-> logs "entity name changed to Kevin"
  ```

- [can-observable-object ObservableObject] allows one to specify a property's type
as an [can-observable-array ObservableArray] of typed instances like:

  ```js
  import { ObservableArray, ObservableObject, type } from "can";

  class Person extends ObservableObject {
    static props = {
      name: String,
      age: Number,
      addresses: type.convert(ObservableArray.convertsTo(Address))
    };
  }
  ```

  However, if `Address` wasn’t immediately available, you could do the same thing like:

  ```js
  import { ObservableArray, ObservableObject, type } from "can";

  class Person extends ObservableObject {
    static props = {
      name: String,
      age: Number,
      addresses: type.late(() => type.convert(ObservableArray.convertsTo(Address)))
    };
  }
  ```


### The solution

Update the __JavaScript__ tab to:

- Define an `Entity` type and the type of its properties.
- Create an instance of the `Entity` type called `rootEntity`
- Use `rootEntity` to render the template

```js
import {
  ObservableArray,
  ObservableObject,
  StacheElement,
  type
} from "//unpkg.com/can@6/core.mjs";

class Entity extends ObservableObject {
  static props = {
    id: String,
    name: String,
    parentId: String,
    hasChildren: Boolean,
    type: String,
    children: type.late(() => type.convert(ObservableArray.convertsTo(Entity)))
  };
}

const rootEntity = new Entity(rootEntityData);

class FileNavigator extends StacheElement {
  static view = `
    {{<entities}}
      <span>{{this.name}}</span>
      <ul>
        {{# for(child of this.children) }}
          <li class="{{child.type}} {{# if(child.hasChildren) }}hasChildren{{/ if }}">
            {{# eq(child.type, 'file') }}
              📝 <span>{{child.name}}</span>
            {{else}}
              📁 {{entities(child)}}
            {{/ eq }}
          </li>
        {{/ for }}
      </ul>
    {{/entities}}

    {{entities(this.rootEntity)}}
  `;

  static props = {
    rootEntity: {
      get default() {
        return rootEntity;
      }
    }
  };
}

customElements.define("file-navigator", FileNavigator);
```
@highlight 2,3,5,8-17,19,44

### Test it

Run the following the __Console__ tab:

```js
var rootEntity = document.querySelector("file-navigator").rootEntity;
rootEntity.name= "Something New";
rootEntity.children.pop();
```

You should see the page change automatically.


## Make the folders open and close

### The problem

We want to be able to toggle if a folder is open or closed.

### What you need to know

- [can-observable-object ObservableObject] can specify a default value and a type:
  ```js
  import { ObservableObject } from "can";

  class Person extends ObservableObject {
    static props = {
      address: Address,
      age: { default: 33, type: Number }
    };
  }
  ```

- [can-observable-object ObservableObject] can also have methods:

  ```js
  import { ObservableObject } from "can";

  class Person extends ObservableObject {
    static props = {
      address: Address,
      age: { default: 33, type: Number }
    };
    birthday() {
      this.age += 1;
    }
  }
  ```

- Use [can-stache.helpers.if {{# if(value) }}] to do `if/else` branching in [can-stache].

- Use [can-stache-bindings.event on:EVENT] to listen to an event on an element and call a method in [can-stache].  For example, the following calls `doSomething()` when the `<div>` is clicked.

  ```html
  <div on:click="doSomething()"> ... </div>
  ```

### The solution

Update the __JavaScript__ tab to:

- Add an `isOpen` property to `Entity`.
- Add a `toggleOpen` method to `Entity`.

```js
import {
  ObservableArray,
  ObservableObject,
  StacheElement,
  type
} from "//unpkg.com/can@6/core.mjs";

class Entity extends ObservableObject {
  static props = {
    id: String,
    name: String,
    parentId: String,
    hasChildren: Boolean,
    type: String,
    children: type.late(() => type.convert(ObservableArray.convertsTo(Entity))),
    isOpen: { type: Boolean, default: false }
  };
  toggleOpen() {
    this.isOpen = !this.isOpen;
  }
}

const rootEntity = new Entity(rootEntityData);

class FileNavigator extends StacheElement {
  static view = `
    {{<entities}}
      <span on:click="this.toggleOpen()">{{this.name}}</span>
      {{# if(this.isOpen) }}
        <ul>
          {{# for(child of this.children) }}
            <li class="{{child.type}} {{# if(child.hasChildren) }}hasChildren{{/ if }}">
              {{# eq(child.type, 'file') }}
                📝 <span>{{child.name}}</span>
              {{else}}
                📁 {{entities(child)}}
              {{/ eq }}
            </li>
          {{/ for }}
        </ul>
      {{/ if }}
    {{/entities}}

    {{entities(this.rootEntity)}}
  `,

  static props = {
    rootEntity: {
      get default() {
        return rootEntity;
      }
    }
  };
}

customElements.define("file-navigator", FileNavigator);
```
@highlight 16,18-20,28-29,41,only

## Result

When complete, you should have a working file-navigation widget
like the following CodePen:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="bitovi" data-slug-hash="aboqrxK" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid black; margin: 1em 0; padding: 1em;" data-pen-title="File Navigator simple [Finished]">
  <span>See the Pen <a href="https://codepen.io/bitovi/pen/aboqrxK/">
  File Navigator simple [Finished]</a> by Bitovi (<a href="https://codepen.io/bitovi">@bitovi</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
