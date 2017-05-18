@page guides/recipes/file-navigator-advanced File Navigator Guide (Advanced)
@parent guides/recipes

@description This guide walks you through building a file navigation
widget.  It takes about 45 minutes to complete.  It was written with
CanJS 3.4. Checkout the [guides/recipes/file-navigator-simple]
for an easier example that produces similar functionality.


@body

The final widget looks like:

<a class="jsbin-embed" href="//jsbin.com/qunuyi/embed?js,output">JS Bin on jsbin.com</a>

> Note: If you don't see any files show up, run the JSBin again. This
> JSBin uses randomly generated files so it's possible nothing shows up.

__Start this tutorial by cloning the following JSBin__:

<a class="jsbin-embed" href="//justinbmeyer.jsbin.com/xokopog/embed?html,output">JS Bin on jsbin.com</a>

This JSBin has initial prototype HTML and CSS which is useful for
getting the application to look right.

The following sections are broken down into:

- Problem - A description of what the section is trying to accomplish.
- Things to know - Information about CanJS that is useful for solving the problem.
- Solution - The solution to the problem.

## Build a fixtured service layer

### Problem

Make an `/api/entities` service layer that provides the files and folders for another folder.  An `entity` can be either a file or folder.  A single `entity` looks like:

```js
{
  id: "2",
  name: "dogs",
  parentId: "0",     // The id of the folder this file or folder is within.
  type: "folder"     // or "file",
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
  can.fixture("/api/entities", function(request){
    request.data.folderId //-> "1"

    return {data: [...]}
  })
  ```

- [can-fixture.store] can be used to automatically filter records using the querystring.

  ```js
  var entities = [ .... ];
  var entitiesStore = can.fixture.store( entities );
  can.fixture("/api/entities", entitiesStore);
  ```

- [can-fixture.rand] can be used to create a random integer.
  ```
  can.fixture.rand(10) //-> 10
  can.fixture.rand(10) //-> 0
  ```



### Solution

First, make a function that generates an array of `entities` that will be stored on our fake server:

```js
// Stores the next entity id to use.
var entityId = 1;

// Returns an array of entities for the given `parentId`.
// Makes sure the `depth` of entities doesn't exceed 5.
var makeEntities = function(parentId, depth){
  if(depth > 5) {
    return [];
  }
  // The number of entities to create.
  var entitiesCount = can.fixture.rand(10);

  // The array of entities we will return.
  var entities = [];

  for(var i = 0 ;  i< entitiesCount; i++) {

    // The id for this entity
    var id = ""+(entityId++),
        // If the entity is a folder or file
        isFolder = Math.random() > 0.3,
        // The children for this folder.
        children = isFolder ? makeEntities(id, depth+1) : [];

    var entity = {
      id: id,
      name: (isFolder ? "Folder" : "File")+" "+id,
      parentId: parentId,
      type: (isFolder ? "folder" : "file"),
      hasChildren: children.length ? true : false
    };
    entities.push(entity);

    // Add the children of a folder
    [].push.apply(entities,  children)

  }
  return entities;
};
```

Then, make those entities, create a `store` to house them, and trap AJAX requests to use that `store`.

```js
// Make the entities for the demo
var entities = makeEntities("0", 0);

// Add them to a client-like DB store
var entitiesStore = can.fixture.store(entities);

// Trap requests to /api/entities to read items from the entities store.
can.fixture("/api/entities", entitiesStore);

// Make requests to /api/entities take 1 second
can.fixture.delay = 1000;
```

## Create the `Entity` Model

### The problem

When we load entities from the server, it's useful to convert them into `Entity` type instances.  We will want to create an observable `Entity` type using [can-define/map/map] so we can do:

```js
var entity = new Entity({
  id: "2",
  name: "dogs",
  parentId: "0",     // The id of the folder this file or folder is within.
  type: "folder"     // or "file",
  hasChildren: true  // false for a folder with no children, or a file
});

entity.on("name", function(ev, newName){
  console.log("entity name changed to ", newName);
});

entity.name = "cats" //-> logs "entity name changed to cats"
```

### Things to know

You can create a `DefineMap` type using [can-define/map/map.extend DefineMap.extend] with the type's properties and the properties' types like:

```js
Type = can.DefineMap.extend({
  id: "string",
  hasChildren: "boolean",
  ...
})
```

### The solution

Extend `can.DefineMap` with each property and its type as follows:

```js
var Entity = can.DefineMap.extend({
  id: "string",
  name: "string",
  parentId: "string",
  hasChildren: "boolean",
  type: "string"
});
```

## Connect the `Entity` model to the service layer

### The problem

We want to be able to load a list of `Entity` instances from `GET /api/entities` with:

```js
Entity.getList({parentId: "0"}).then(function(entities){
    console.log(entities.get()) //-> [ Entity{id: "1", parentId: "0", ...}, ...]
})
```

### Things to know

[can-connect/can/base-map/base-map can.connect.baseMap()] can connect a `Map` type to
a `url` like:

```js
can.connect.baseMap({
  Map: Entity,
  url: "URL"
})
```

### The solution

Use `can.connect.baseMap` to connect `Entity` to `/api/entities` like:

```js
can.connect.baseMap({
  Map: Entity
  url: "/api/entities"
})
```

## Create the ROOT entity and render it

### The problem

We need to begin converting the static HTML the designer gave us into live HTML.  This means
rendering it in a template.  We'll start slow by rendering the `root` parent folder's name
in the same way it's expected by the designer.


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

- You can create an `Entity` instance as follows:
  ```js
  var folder = new Entity({...});
  ```

  Where {...} is an object of the properties you need to create like `{id: "0", name: "ROOT", ...}`.
  Pass this to the template.


### The solution

Update the `HTML` tab to render the `folder`'s name.

```html
<script type="text/stache" id="app-template">
<span>{{folder.name}}</span>
</script>
```

Update the `JS` tab to:

1. Create a `folder` `Entity` instance.
2. Load the `app-template`.  Renders it with `folder` instance, and inserts the result in the `<body>` element.

```js
var folder = new Entity({
  id: "0",
  name: "ROOT/",
  hasChildren: true,
  type: "folder"
});

var template = can.stache.from("app-template"),
    frag = template({
      folder: folder
    });

document.body.appendChild( frag );
```



## Render the ROOT entities children

### The problem

In this section, we'll list the files and folders within the root folder.

### Things to know

- Use [can-stache.helpers.if {{#if value}}] to do `if/else` branching in `can-stache`.
- Use [can-stache.helpers.each {{#each value}}] to do looping in `can-stache`.
- Use [can-stache.helpers.is {{#eq value1 value2}}] to test equality in `can-stache`.
- `Promise`s are observable in `can-stache`.  Given a promise `somePromise`, you can:
  - Check if the promise is loading like: `{{#if somePromise.isPending}}`.
  - Loop through the resolved value of the promise like: `{{#each somePromise.value}}`.
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
{{#if entitiesPromise.isPending}}
  <div class="loading">Loading</div>
{{else}}
  <ul>
    {{#each entitiesPromise.value}}
      <li class="{{type}} {{#if hasChildren}}hasChildren{{/if}}">
        {{#eq type 'file'}}
          📝 <span>{{name}}</span>
        {{else}}
          📁 <span>{{name}}</span>
        {{/eq}}
      </li>
    {{/each}}
  </ul>
{{/if}}
</script>
```

The following adds an `entitiesPromise` to data passed to the template.  `entitiesPromise`
will contain the files and folders that are directly within the root folder.

```js
    frag = template({
      folder: folder,
      entitiesPromise: Entity.getList({parentId: "0"})
    });
```

## Toggle children with a ViewModel

### The problem

We want to hide the root folder's children until the root folder is clicked on.  An subsequent
clicks on the root folder's name should toggle if the children are displayed.

### Things to know

- CanJS uses [guides/technicalViewModels#MaintainableMVVM ViewModels] to manage the behavior
  of views.  ViewModels can have their own state, such as if a folder `isOpen` and should be showing
  its children. `ViewModels` are custructor functions created with [can-define/map/map can.DefineMap].

- `can.DefineMap` can detail the type of a property with another type like:
  ```js
  var Address = can.DefineMap.extend({
    street: "string",
    city: "string"
  });
  var Person = can.DefineMap.extend({
    address: Address
  });
  ```

- `can.DefineMap` can also specify default values:
  ```js
  var Person = can.DefineMap.extend({
    address: Address,
    age: {value: 33}
  });
  ```

- `can.DefineMap` can also specify a default value and a type:
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

- Use [can-stache-bindings.event] to listen to an event on an element and call a method in `can-stache`.  For example, the following calls `doSomething()` when the `<div>` is clicked.

   ```html
   <div ($click)="doSomething()"> ... </div>
   ```

### The solution

The following:

 - Defines a `FolderVM` type that will manage the UI state around a folder.  Specifically `FolderVM` has:
   - `folder` which references the folder being displayed.
   - `entitiesPromise` which will be a promise of all files for that folder.
   - `isOpen` which tracks if the folder's children should be displayed.
   - `toggleOpen` which changes `isOpen`.
 -  Creates an instance of the `FolderVM` and uses it to render the template.

```js
var FolderVM = can.DefineMap.extend({
  folder: Entity,
  entitiesPromise: {
    value: function(){
      return Entity.getList({parentId: this.folder.id});
    }
  },
  isOpen: {type: "boolean", value: false},
  toggleOpen: function(){
    this.isOpen = !this.isOpen;
  }
});

// Create an instance of `FolderVM` with the root folder
var rootFolderVM = new FolderVM({
  folder: folder
});

var template = can.stache.from("app-template"),
    frag = template(rootFolderVM);

document.body.appendChild( frag );
```
@highlight 1-17,20

The following wraps the listing of child entities with a `{{#if isOpen}} {{/if}}`:

```html
<script type="text/stache" id="app-template">
<span ($click)="toggleOpen()">{{folder.name}}</span>
{{#if isOpen}}
  {{#if entitiesPromise.isPending}}
    <div class="loading">Loading</div>
  {{else}}
    <ul>
      {{#each entitiesPromise.value}}
        <li class="{{type}} {{#if hasChildren}}hasChildren{{/if}}">
          {{#eq type 'file'}}
            📝 <span>{{name}}</span>
          {{else}}
            📁 <span>{{name}}</span>
          {{/eq}}
        </li>
      {{/each}}
    </ul>
  {{/if}}
{{/if}}      
</script>
```
@highlight 3,19

## Create an `<a-folder>` custom element to manage folder behavior

### The problem

Now we want to make all the folders able to open and close.  This means creating a `FolderVM` for every folder entity.

### Things to know

- [can-component can.Component] is used to create custom elements like:
  ```js
  var MyComponentVM = DefineMap.extend({
    message: {value: "Hello There!"}
  });

  can.Component.extend({
    tag: "my-component",
    ViewModel: MyComponentVM,
    view: can.stache("<h1>{{message}}</h1>");
  });
  ```
  This component will be created anytime a `<my-component>` element is found in the page.  When the component is created, it creates
  an instance of it's `ViewModel`, in this case `MyComponentVM`.

- You can pass data to a component's `ViewModel` with [can-stache-bindings.toChild {data-bindings}] like:

  ```html
  <my-component {message}="'Hi There'"/>
  ```

  This sets `message` on the ViewModel to `'Hi There'`.  You can also send data within stache like:

  ```html
  <my-component {message}="greeting"/>
  ```
  This sets `message` on the ViewModel to what `greeting` is in the stache template.

- A component's [View] is rendered inside the component.  This means that if the following is in a template:

  ```
  <my-component {message}="'Hi There'"/>
  ```

  The following will be inserted into the page:

  ```
  <my-component {message}="'Hi There'"><h1>Hi There</h1></my-component>
  ```

- `this` in a stache template refers to the current context of a template or section.  

  For example, the `this` in `this.name` refers to the `context` object:

  ```javascript
  var template = stache("{{this.name}}");
  var context = {name: "Justin"};
  template(context);
  ```

  Or, when looping through a list of items, `this` refers to each item:

  ```html
  {{#each items}}
    <li>{{this.name}}</li> <!-- this is each item in items -->
  {{/each}}
  ```


### The solution

The following:

1. Changes the `app-template` to use the `<a-folder>` component to render the root folder. It
   passes the root folder as `folder` to the `<a-folder>` component's ViewModel.  It also sets the
   `<a-folder>` component's ViewModel's `isOpen` property to `true`.
2. Moves the content that was in `app-template` to the `folder-template` `<script>` tag.
3. Recursively renders each child folder with `<a-folder {folder}="this"/>`.

```html
<script type="text/stache" id="app-template">
  <a-folder {folder}="this" {is-open}="true"/>        <!-- CHANGED -->
</script>

<!-- CONTENT FROM app-template-->
<script type="text/stache" id="folder-template">
<span ($click)="toggleOpen()">{{folder.name}}</span>
{{#if isOpen}}
  {{#if entitiesPromise.isPending}}
    <div class="loading">Loading</div>
  {{else}}
    <ul>
      {{#each entitiesPromise.value}}
        <li class="{{type}} {{#if hasChildren}}hasChildren{{/if}}">
          {{#eq type 'file'}}
            📝 <span>{{name}}</span>
          {{else}}
            📁 <a-folder {folder}="this"/>            <!-- CHANGED -->
          {{/eq}}
        </li>
      {{/each}}
    </ul>
  {{/if}}
{{/if}}
</script>
```
@highlight 2,17

The following:

1. Defines a custom `<a-folder>` element that manages its behavior with `FolderVM` and uses it to render a `folder-template`
   template.
2. Renders the `app-template` with the root `parent` folder instead of the `rootFolderVM`.

```js
var FolderVM = can.DefineMap.extend({
  folder: Entity,
  entitiesPromise: {
    value: function(){
      return Entity.getList({parentId: this.folder.id});
    }
  },
  isOpen: {type: "boolean", value: false},
  toggleOpen: function(){
    this.isOpen = !this.isOpen;
  }
});

can.Component.extend({
  tag: "a-folder",
  ViewModel: FolderVM,
  view: can.stache.from("folder-template")
});

/*var rootFolderVM = new FolderVM({          // REMOVED
  folder: folder
});*/

var template = can.stache.from("app-template"),
    frag = template(folder);

document.body.appendChild( frag );
```
@highlight 14-22,25,only

When complete, you should have a working file-navigation widget
like the completed JSBin above.


<script src="//static.jsbin.com/js/embed.min.js?3.39.18"></script>
