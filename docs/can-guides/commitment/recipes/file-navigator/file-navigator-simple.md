@page guides/recipes/file-navigator-simple File Navigator Guide (Simple)
@parent guides/recipes

@description This guide walks you through building a simple file navigation
widget.  It takes about 25 minutes to complete.  It was written with
CanJS 5.22.0. Check out the [guides/recipes/file-navigator-advanced]
for an example that makes AJAX requests for its data and uses [can-component].


@body

The final widget looks like:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="cherifGsoul" data-slug-hash="pYvOdG" data-pen-title="File Navigator simple [Finished]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/pYvOdG/">
  File Navigator simple [Finished]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>


Click `ROOT/` to see its files and folders.

> Note: If you don’t see any files show up, run the CodePen again. This
> CodePen uses randomly generated files, so it’s possible nothing shows up.

__Start this tutorial by cloning the following CodePen__:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="css,result" data-user="cherifGsoul" data-slug-hash="gEpqeB" data-pen-title="File Navigator simple [Starter]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/gEpqeB/">
  File Navigator simple [Starter]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

This CodePen has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- Problem - A description of what the section is trying to accomplish.
- Things to know - Information about CanJS that is useful for solving the problem.
- Solution - The solution to the problem.
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
      "id": "1", "name": "File 1",
      "parentId": "0",
      "type": "file",
      "hasChildren": false
    },
    {
      "id": "2", "name": "File 2",
      "parentId": "0",
      "type": "file",
      "hasChildren": false
    },
    {
      "id": "3", "name": "Folder 3",
      "parentId": "0",
      "type": "folder",
      "hasChildren": true,
      "children": [
        {
          "id": "4", "name": "File 4",
          "parentId": "3",
          "type": "file",
          "hasChildren": false
        },
        {
          "id": "5", "name": "File 5",
          "parentId": "3",
          "type": "file",
          "hasChildren": false
        },
        {
          "id": "6", "name": "File 6",
          "parentId": "3",
          "type": "file",
          "hasChildren": false
        },
        {
          "id": "7", "name": "File 7",
          "parentId": "3",
          "type": "file",
          "hasChildren": false
        },
        {
          "id": "8", "name": "Folder 8",
          "parentId": "3",
          "type": "folder",
          "hasChildren": false,
          "children": []
        }
      ]
    },
    {
      "id": "9", "name": "File 9",
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

- CanJS uses [can-component] to render data in a template
  and keep it updated.  Templates can be authored in the Component `view` property like:

  ```js
  Component.extend({
    tag: "my-component",
    view: `TEMPLATE CONTENT`
  });
  ```

- A Component view is a [can-stache] template that uses
  [can-stache.tags.escaped {{key}}] magic tags to insert data into
  the HTML output like:

  ```js
  Component.extend({
    tag: "my-component",
    view: `TEMPLATE CONTENT`
  });
  ```

- Use [can-define/map/map] to model Component data as [can-component.prototype.ViewModel] 

- Use [can-stache.helpers.if {{#if(value)}}] to do `if/else` branching in `can-stache`.
- Use [can-stache.helpers.for-of {{#for(of)}}] to do looping in `can-stache`.
- Use [can-stache.helpers.is {{#eq(value1, value2)}}] to test equality in `can-stache`.
- [can-stache/keys/current {{./key}}] only returns the value in the current scope.
- Write a `<ul>` to contain all the files.  Within the `<ul>` there should be:
  - An `<li>` with a className that includes `file` or `folder` and `hasChildren` if the folder has children.
  - The `<li>` should have `📝 <span>{{FILE_NAME}}</span>` if a file and `📁 <span>{{FOLDER_NAME}}</span>` if a folder.

### The solution

Update the __HTML__ tab to:

```html
<file-navigator></file-navigator>
```
@highlight 1

Update the __JavaScript__ tab to:

```js
import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "file-navigator",
  view: `
    <span>{{this.name}}</span>
    <ul>
      {{# for(child of this.children) }}
        <li class="{{child.type}} {{# if(child.hasChildren) }}hasChildren{{/ if}}">
          {{# eq(child.type, 'file')}}
            📝 <span>{{child.name}}</span>
          {{else}}
            📁 <span>{{child.name}}</span>
          {{/ eq}}
        </li>
      {{/ for }}
    </ul>
  `,
  ViewModel: {
     rootEntity: {
      default: () => {
        return rootEntityData;
      }
    }
  }
});
```
@highlight 6-17, 20-24, only

## Render all the files and folders

### The Problem

Now let’s render all of the files and folders!  This means we want to render the files and folders recursively.  Every time we
find a folder, we need to render its contents.

### Things to know

- A template can call out to another registered _partial_ template with [can-stache.tags.partial {{>PARTIAL_NAME}}] like the following:

  ```html
  {{>PARTIAL_NAME}}
  ```

- You can register an inline named partial within the current template [can-stache.tags.named-partial {{<PARTIAL_NAME}}] like the following:

  ```js
  Component.extend({
    tag: "my-component",
    view: `{{<partialView}} BLOCK {{/partialView}}`
  });
  ```

- The registered inline named partial can be called 
  [recursively](https://canjs.com/doc/can-stache.tags.named-partial.html#TooMuchRecursion) like the following:
```html
{{<recursiveView}}
  <div>{{name}} <b>Type:</b> {{#if(nodes.length)}}Branch{{else}}Leaf{{/if}}</div>
  {{#each(nodes)}}
    {{>recursiveView}}
  {{/each}}
{{/recursiveView}}

{{>recursiveView yayRecursion}}`
```
### The Solution

Update the __JAVSCRIPT__ tab to:

- Call to an `{{>entities}}` partial.

```js
import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
  tag: "file-navigator",
  view: `
    {{<entities}}
      <span>{{this.name}}</span>
      <ul>
        {{# for(child of this.children) }}
          <li class="{{child.type}} {{# if(child.hasChildren) }}hasChildren{{/ if}}">
            {{# eq(child.type, 'file')}}
              📝 <span>{{child.name}}</span>
            {{else}}
              📁 {{entities child}}
            {{/ eq}}
          </li>
        {{/ for }}
      </ul>
    {{/entities}}
   
    {{entities rootEntity}}
  `,
  ViewModel: {
     rootEntity: {
      default: () => {
        return rootEntityData;
      }
    }
  }
});
```
@highlight 6,21,19,only

## Make the data observable

### The problem

For rich behavior, we need to convert the raw JS data into typed observable data.  When
we change the data, the UI will automatically change.

### Things to know

- [can-define/map/map.extend DefineMap.extend] allows you to define a type by defining the type’s
  properties and the properties’ types like:

  ```js
  import { DefineMap } from "can";
  
  Person = DefineMap.extend("Person", {
    name: "string",
    age: "number"
  })
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

- `can.DefineMap` supports an [can-define.types.propDefinition#Array Array shorthand] that allows one to specify a [can-define/list/list can.DefineList] of typed instances like:

  ```js
  import { DefineMap } from "can";

  const Person = DefineMap.extend("Person", {
    name: "string",
    age: "number",
    addresses: [Address]
  });
  ```

  However, if `Address` wasn’t immediately available, you could do the same thing like:

  ```js
  import { DefineMap } from "can";

  const Person = DefineMap.extend("Person", {
    name: "string",
    age: "number",
    addresses: [{
      type: function(rawData) {
        return new Address(rawData);
      }
    }]
  });
  ```


### The solution

Update the __JavaScript__ tab to:

- Define an `Entity` type and the type of its properties.
- Create an instance of the `Entity` type called `rootEntity`
- Use `rootEntity` to render the template

```js
import { Component, DefineMap } from "//unpkg.com/can@5/core.mjs";

const Entity = DefineMap.extend("Entity", {
  id: "string",
  name: "string",
  parentId: "string",
  hasChildren: "boolean",
  type: "string",
  children: [{
    type: function(entity) {
      return new Entity(entity)
    }
  }]
});

const rootEntity = new Entity(rootEntityData);

Component.extend({
  tag: "file-navigator",
  view: `
    {{<entities}}
      <span>{{this.name}}</span>
      <ul>
        {{# for(child of this.children) }}
          <li class="{{child.type}} {{# if(child.hasChildren) }}hasChildren{{/ if}}">
            {{# eq(child.type, 'file')}}
              📝 <span>{{child.name}}</span>
            {{else}}
              📁 {{entities child}}
            {{/ eq}}
          </li>
        {{/ for }}
      </ul>
    {{/entities}}
   
    {{entities rootEntity}}
  `,
  ViewModel: {
     rootEntity: {
      default: () => {
        return rootEntityData;
      }
    }
  }
});
```
@highlight 1,3-14,16

### Test it

Run the following the __Console__ tab:

```js
rootEntity.name= "Something New";
rootEntity.children.pop();
```

You should see the page change automatically.


## Make the folders open and close

### The problem

We want to be able to toggle if a folder is open or closed.

### Things to know

- `can.DefineMap` can specify a default value and a type:
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
    birthday: function(){
      this.age++;
    }
  });
  ```

- Use [can-stache.helpers.if {{#if(value)}}] to do `if/else` branching in `can-stache`.

- Use [can-stache-bindings.event on:EVENT] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked.

   ```html
   <div on:click="doSomething()"> ... </div>
   ```

### The solution

Update the __JavaScript__ tab to:

- Add an `isOpen` property to `Entity`.
- Add a `toggleOpen` method to `Entity`.

```js
import { Component, DefineMap } from "//unpkg.com/can@5/core.mjs";

const Entity = DefineMap.extend("Entity", {
  id: "string",
  name: "string",
  parentId: "string",
  hasChildren: "boolean",
  type: "string",
  children: [{
    type: function(entity) {
      return new Entity(entity)
    }
  }],
  isOpen: {type: "boolean", default: false},
  toggleOpen: function(){      
    this.isOpen = !this.isOpen;
  }
});

const rootEntity = new Entity(rootEntityData);

Component.extend({
  tag: "file-navigator",
  view: `
    {{<entities}}
      <span on:click="toggleOpen()">{{this.name}}</span>
      <ul>
        {{# for(child of this.children) }}
          <li class="{{child.type}} {{# if(child.hasChildren) }}hasChildren{{/ if}}">
            {{# eq(child.type, 'file')}}
              📝 <span>{{child.name}}</span>
            {{else}}
              📁 {{entities child}}
            {{/ eq}}
          </li>
        {{/ for }}
      </ul>
    {{/entities}}
   
    {{entities rootEntity}}
  `,
  ViewModel: {
     rootEntity: {
      default: () => {
        return rootEntityData;
      }
    }
  }
});
```
@highlight 14,15-17,26,only

## Result

When complete, you should have a working file-navigation widget
like the following CodePen:

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="js,result" data-user="cherifGsoul" data-slug-hash="pYvOdG" data-pen-title="File Navigator simple [Finished]">
  <span>See the Pen <a href="https://codepen.io/cherifGsoul/pen/pYvOdG/">
  File Navigator simple [Finished]</a> by Mohamed Cherif Bouchelaghem (<a href="https://codepen.io/cherifGsoul">@cherifGsoul</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>

<script async src="https://static.codepen.io/assets/embed/ei.js"></script>
