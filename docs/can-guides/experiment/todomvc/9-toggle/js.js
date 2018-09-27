import { Component, DefineMap, DefineList, fixture, realtimeRestModel, route,
  domEvents, enterEvent } from "//unpkg.com/can@5/everything.mjs";

domEvents.addEvent(enterEvent);

const Todo = DefineMap.extend("Todo",{
  id: {type: "number", identity: true},
  name: "string",
  complete: { type: "boolean", default: false }
});

Todo.List = DefineList.extend({
  "#": Todo,
  get active() {
    return this.filter({ complete: false });
  },
  get complete() {
    return this.filter({ complete: true });
  },
  get allComplete() {
    return this.length === this.complete.length;
  },
  get saving() {
    return this.filter(function(todo) {
      return todo.isSaving();
    });
  },
  updateCompleteTo: function(value) {
    this.forEach(function(todo) {
      todo.complete = value;
      todo.save();
    });
  },
  destroyComplete: function() {
    this.complete.forEach(function(todo) {
      todo.destroy();
    });
  }
});

const todoStore = fixture.store([
  { name: "mow lawn", complete: false, id: 5 },
  { name: "dishes", complete: true, id: 6 },
  { name: "learn canjs", complete: false, id: 7 }
], Todo);

fixture("/api/todos", todoStore);
fixture.delay = 200;

realtimeRestModel({
  url: "/api/todos",
  Map: Todo,
  List: Todo.List
});

Component.extend({
  tag: "todo-create",
  view: `
    <input id="new-todo"
      placeholder="What needs to be done?"
      value:bind="todo.name"
      on:enter="createTodo()"/>
  `,
  ViewModel: {
    todo: { Default: Todo },
    createTodo: function() {
      this.todo.save().then(function(){
        this.todo = new Todo();
      }.bind(this));
    }
  }
});

Component.extend({
  tag: "todo-list",
  view: `
    <ul id="todo-list">
      {{# for(todo of this.todos) }}
        <li class="todo {{# if(todo.complete) }}completed{{/ if }}
          {{# if(todo.isDestroying()) }}destroying{{/ if }}
          {{# if(this.isEditing(todo)) }}editing{{/ if }}">
          <div class="view">
            <input class="toggle" type="checkbox"
               checked:bind="todo.complete" on:change="todo.save()">
            <label on:dblclick="this.edit(todo)">{{ todo.name }}</label>
            <button class="destroy" on:click="todo.destroy()"></button>
          </div>
          <input class="edit" type="text"
            value:bind="todo.name"
            on:enter="this.updateName()"
            focused:from="this.isEditing(todo)"
            on:blur="this.cancelEdit()"/>
        </li>
      {{/ for }}
    </ul>
  `,
  ViewModel: {
    todos: Todo.List,
    editing: Todo,
    backupName: "string",
    isEditing: function(todo) {
      return todo === this.editing;
    },
    edit: function(todo) {
      this.backupName = todo.name;
      this.editing = todo;
    },
    cancelEdit: function() {
      if(this.editing) {
        this.editing.name = this.backupName;
      }
      this.editing = null;
    },
    updateName: function() {
      this.editing.save();
      this.editing = null;
    }
  }
});

Component.extend({
  tag: "todo-mvc",
  view: `
      <section id="todoapp">
        <header id="header">
          <h1>{{ this.appName }}</h1>
          <todo-create/>
        </header>
        <section id="main" class="">
          <input id="toggle-all" type="checkbox"
            checked:bind="allChecked"
            disabled:from="this.todosList.saving.length"/>
          <label for="toggle-all">Mark all as complete</label>
          <todo-list todos:from="this.todosPromise.value"/>
        </section>
        <footer id="footer" class="">
          <span id="todo-count">
            <strong>{{ this.todosPromise.value.active.length }}</strong> items left
          </span>
          <ul id="filters">
            <li>
              <a href="{{routeUrl(filter=undefined)}}"
                {{#routeCurrent(filter=undefined)}}class="selected"{{/routeCurrent}}>All</a>
            </li>
            <li>
              <a href="{{routeUrl(filter='active')}}"
                {{#routeCurrent(filter='active')}}class="selected"{{/routeCurrent}}>Active</a>
            </li>
            <li>
              <a href="{{routeUrl(filter='complete')}}"
                {{#routeCurrent(filter='complete')}}class="selected"{{/routeCurrent}}>Completed</a>
            </li>
          </ul>
          <button id="clear-completed"
            on:click="this.todosList.destroyComplete()">
            Clear completed ({{ this.todosPromise.value.complete.length }})
          </button>
        </footer>
      </section>
  `,
  ViewModel: {
    appName: {default: "TodoMVC"},
    routeData: {
      default(){
        route.register("{filter}");
        route.start();
        return route.data;
      }
    },
    get todosPromise() {
      if(!this.routeData.filter) {
        return Todo.getList({});
      } else {
        return Todo.getList({filter: { complete: this.routeData.filter === "complete" }});
      }
    },
    todosList: {
      get: function(lastSet, resolve) {
        this.todosPromise.then(resolve);
      }
    },
    get allChecked() {
      return this.todosList && this.todosList.allComplete;
    },
    set allChecked(newVal) {
      this.todosList && this.todosList.updateCompleteTo(newVal);
    }
  }
});
