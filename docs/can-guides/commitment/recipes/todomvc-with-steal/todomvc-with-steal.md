@page guides/recipes/todomvc-with-steal TodoMVC with StealJS
@parent guides/recipes

@description This guide walks through building TodoMVC with StealJS.


@body

## Setup (Framework Overview)

### The problem

### What you need to know

- High level overview.

### The solution

Create a folder:

```cmd
mkdir todomvc
cd todomvc
```

Create a new project:

```cmd
npm init
```

Hit `Enter` to accept the defaults.


Install `steal`, `steal-tool`, and CanJS's core modules:

```cmd
npm install steal steal-tools steal-css --save-dev
npm install can-define can-stache steal-stache --save
```



Add __steal.plugins__ to _package.json_:

@sourceref ./1-setup/package.json


Create the starting HTML page:

```html
<!-- index.html -->
<script src="./node_modules/steal/steal.js"></script>
```

Create the application template:

@sourceref ./1-setup/index.stache.html

Save the test harness:

```cmd
npm install can-todomvc-test --save-dev
```

Create the main app

@sourceref ./1-setup/index.js

## Define Todo type (DefineMap basics)

### The problem

- Define a `Todo` and `Todo.List`

### What you need to know

- [can-define/map/map]
- type and value behaviors
- methods

### The solution

@sourceref ./2-define-todo/todo.js

## Define Todo.List type (DefineList basics)

### The problem
### What you need to know
### The solution

@sourceref ./3-define-todo-list/todo.js

## Render a list of todos (can-stache)

### The problem
### What you need to know

- stache basics
- don't do value as an object!

### The solution

@sourceref ./4-render-todos/index.js

@sourceref ./4-render-todos/index.html

## Toggle a todo's completed state (event bindings) ##

### The problem
### What you need to know
### The solution

@sourceref ./5-toggle-event/index.html

## Toggle a todo's completed state (data bindings) ##

@sourceref ./6-toggle-data/index.html

## Defining Todo.algebra (can-set)

### The Solution

```
npm install can-set --save
```

@sourceref ./7-algebra/todo.js

## Simulate the service layer (can-fixture) ##

### The solution

```
npm install can-fixture --save
```

@sourceref ./8-fixtures/todos-fixture.js

## Connect the Todo model to the service layer (can-connect) ##

### The solution

```
npm install can-connect --save
```

@sourceref ./9-connection/todo.js

## List todos in the page (can-connect use) ##

### What you need to know

- async getter

### The solution

@sourceref ./10-connection-list/index.js

## Toggling a todo's checkbox updates service layer

@sourceref ./11-toggle-save/index.html

## Delete todos in the page (can-connect use) ##

### Things to know

- isDestroying

### The solution

@sourceref ./12-connection-destroy/index.html

## Create todos (can-component) ##

### The solution

```
npm install can-component --save
```

@sourceref ./13-component-create/todo-create.stache.html

@sourceref ./13-component-create/todo-create.js

@sourceref ./13-component-create/index.html

## Edit todo names (DefineMap) ##

### The solution

@sourceref ./14-component-edit/todo-list.stache.html

@sourceref ./14-component-edit/todo-list.js

@sourceref ./14-component-edit/index.html

## Toggle all todos complete state (DefineMap setter) ##

### What you need to know

- `isSaving`
- `{disabled}`

### The solution

@sourceref ./15-setter-toggle/todo.js

@sourceref ./15-setter-toggle/index.js

@sourceref ./15-setter-toggle/index.html

## Setup routing (can-route) ##

### What you need to know

- stache/helpers

### The solution

```
npm install can-route --save
```

@sourceref ./16-routing/index.js

@sourceref ./16-routing/index.html
