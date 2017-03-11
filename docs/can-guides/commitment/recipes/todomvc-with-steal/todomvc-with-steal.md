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

Install `steal`, `steal-tool`, and CanJS's core modules:

```cmd
npm install steal steal-tools steal-css --save-dev
npm install can-define can-stache steal-stache --save
```

Save the test harness:

```cmd
npm install can-todomvc-test --save-dev
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

Create

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

```
npm install can-set --save
```

## Simulate the service layer (can-fixture) ##

### The solution

```
npm install can-set --save
```

## Connect the Todo model to the service layer (can-connect) ##

### The solution

```
npm install can-connect --save
```

## List todos in the page (can-connect use)

### What you need to know

- async getter

### The solution

## Create todos (can-component) ##

### The solution

```
npm install can-component
```

## Edit todo names (DefineMap)

## Toggle all todos complete state (DefineMap setter)

### What you need to know

- `isSaving`
- `{disabled}`

## Setup routing (can-route)
