@page guides/recipes/file-navigator-simple File Navigator Guide (Simple)
@parent guides/recipes

@description This guide walks you through building a simple file navigation
widget.  It takes about 25 minutes to complete.  It was written with
CanJS 3.4. Checkout the [guides/recipes/file-navigator-advanced]
for an example that makes AJAX requests for its data and uses [can-component].


@body

The final widget looks like:

<a class="jsbin-embed" href="//jsbin.com/sodida/embed?js,output">JS Bin on jsbin.com</a>

Click `ROOT/` to see its files and folders.

> Note: If you don't see any files show up, run the JS Bin again. This
> JS Bin uses randomly generated files so it's possible nothing shows up.

__Start this tutorial by cloning the following JS Bin__:

<a class="jsbin-embed" href="//jsbin.com/caquxa/embed?html,output">JS Bin on jsbin.com</a>

This JS Bin has initial prototype HTML and CSS which is useful for
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
  var template = can.stache.from(SCRIPT_ID);
  ```

- Render the template with data into a documentFragment like:

  ```js
  var frag = template({
    something: {name: "Derek Brunson"}
  });
  ```

- Insert a fragment into the page with:

  ```
  document.body.appendChild(frag);
  ```

- Use [can-stache.helpers.if {{#if value}}] to do `if/else` branching in `can-stache`.
- Use [can-stache.helpers.each {{#each value}}] to do looping in `can-stache`.
- Use [can-stache.helpers.is {{#eq value1 value2}}] to test equality in `can-stache`.
- [can-stache/keys/current {{./key}}] only returns the value in the current scope.
- Write a `<ul>` to contain all the files.  Within the `<ul>` there should be:
  - An `<li>` with a className that includes `file` or `folder` and `hasChildren` if the folder has children.
  - The `<li>` should have `📝 <span>{{FILE_NAME}}</span>` if a file and `📁 <span>{{FOLDER_NAME}}</span>` if a folder.

### The solution

Update the __HTML__ tab to:

```html
<script type="text/stache" id="entities-template">
  <span>{{name}}</span>
  <ul>
    {{#each ./children}}
      <li class="{{type}} {{#if hasChildren}}hasChildren{{/if}}">
        {{#eq type 'file'}}
          📝 <span>{{name}}</span>
        {{else}}
          📁 <span>{{name}}</span>
        {{/eq}}
      </li>
    {{/each}}
  </ul>
</script>
```

Update the __JavaScript__ tab to:

```js
var template = can.stache.from("entities-template");

var frag = template( rootEntityData );  

document.body.appendChild( frag );
```

## Render all the files and folders

### The Problem

Now lets render all of the files and folders!  This means we want to render the files and folders recursively.  Every time we
find a folder, we need to render its contents.

### Things to know

- A template can call out to another registered _partial_ template with with [can-stache.tags.partial {{>PARTIAL_NAME}}] like the following:

  ```html
  {{>PARTIAL_NAME}}
  ```

- You can register partial templates with [can-stache.registerPartial can.stache.registerPartial] like the following:

  ```js
  var template = can.stache.from("TEMPLATE_ID");
  can.stache.registerPartial( "PARTIAL_NAME", template );
  ```

### The Solution

Update the __HTML__ tab to:

- Call to an `{{>entities}}` partial.

```html
<script type="text/stache" id="entities-template">
  <span>{{name}}</span>
  <ul>
    {{#each ./children}}
      <li class="{{type}} {{#if hasChildren}}hasChildren{{/if}}">
        {{#eq type 'file'}}
          📝 <span>{{name}}</span>
        {{else}}
          📁 {{>entities}}
        {{/eq}}
      </li>
    {{/each}}
  </ul>
</script>
```
@highlight 9

Update the __JavaScript__ tab to:

 - Register the `entities-template` as a partial:

```js
var template = can.stache.from("entities-template");
can.stache.registerPartial("entities", template );

var frag = template(rootEntityData);

document.body.appendChild( frag );
```
@highlight 2

## Make the data observable

### The problem

For rich behavior, we need to convert the raw JS data into typed observable data.  When
we change the data, the UI will automatically change.

### Things to know

- [can-define/map/map.extend DefineMap.extend] allows you to define a type by defining the type's
  properties and the properties' types like:

  ```js
  Person = can.DefineMap.extend("Person",{
    name: "string",
    age: "number"
  })
  ```

  This lets you create instances of that type and listen to changes like:

  ```js
  var person = new Person({
    name: "Justin",
    age: 34
  });

  person.on("name", function(ev, newName){
    console.log("person name changed to ", newName);
  });

  person.name = "Kevin" //-> logs "entity name changed to Kevin"
  ```

- `can.DefineMap` supports an [can-define.types.propDefinition#Array Array shorthand] that allows one to specify a [can-define/list/list can.DefineList] of typed instances like:

  ```js
  Person = can.DefineMap.extend("Person",{
    name: "string",
    age: "number",
    addresses: [Address]
  });
  ```

  However, if `Address` wasn't immediately available, you could do the same thing like:

  ```js
  Person = can.DefineMap.extend("Person",{
    name: "string",
    age: "number",
    addresses: [{
      type: function(rawData){
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
var Entity = can.DefineMap.extend("Entity",{  
  id: "string",
  name: "string",
  parentId: "string",
  hasChildren: "boolean",
  type: "string",
  children: [{
    type: function(entity){
      return new Entity(entity)
    }
  }]
});

var rootEntity = new Entity(rootEntityData);


var template = can.stache.from("entities-template");
can.stache.registerPartial("entities", template );

var frag = template(rootEntity);

document.body.appendChild( frag );
```
@highlight 1-14,18

### Test it

Run the following the `console` tab:

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
  var Person = can.DefineMap.extend({
    address: Address,
    age: {value: 33, type: "number"}
  });
  ```

- `can.DefineMap` can also have methods:

  ```js
  var Person = can.DefineMap.extend({
    address: Address,
    age: {value: 33, type: "number"},
    birthday: function(){
      this.age++;
    }
  });
  ```

- Use [can-stache.helpers.if {{#if value}}] to do `if/else` branching in `can-stache`.

- Use [can-stache-bindings.event ($EVENT)] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked.

   ```html
   <div on:click="doSomething()"> ... </div>
   ```

### The solution

Update the __JavaScript__ tab to:

- Add an `isOpen` property to `Entity`.
- Add a `toggleOpen` method to `Entity`.

```js
var Entity = can.DefineMap.extend("Entity",{
  id: "string",
  name: "string",
  parentId: "string",
  hasChildren: "boolean",
  type: "string",
  children: [{
    type: function(entity){
      return new Entity(entity)
    }
  }],
  isOpen: {type: "boolean", value: false},
  toggleOpen: function(){      
    this.isOpen = !this.isOpen;
  }
});

var rootEntity = new Entity(rootEntityData);

var template = can.stache.from("entities-template");
can.stache.registerPartial("entities", template );

var frag = template(rootEntity);              

document.body.appendChild( frag );
```
@highlight 12-15

Update the __HTML__ tab to:

- Call `toggleOpen()` when clicked.
- Only show the children `{{#if isOpen}}` is true.

```html
<script type="text/stache" id="entities-template">
<span on:click="toggleOpen()">{{name}}</span>
{{#if isOpen}}              
  <ul>
    {{#each ./children}}
      <li class="{{type}} {{#if hasChildren}}hasChildren{{/if}}">
        {{#eq type 'file'}}
          📝 <span>{{name}}</span>
        {{else}}
          📁 {{>entities}}      
        {{/eq}}
      </li>
    {{/each}}
  </ul>
{{/if}}                        
</script>
```
@highlight 2,3,15

When complete, you should have a working file-navigation widget
like the completed JS Bin above.

<script src="https://static.jsbin.com/js/embed.min.js?4.0.4"></script>
