import { Component, DefineMap, DefineList, fixture, realtimeRestModel,
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
          {{# if(todo.isDestroying()) }}destroying{{/ if }}">
          <div class="view">
            <input class="toggle" type="checkbox"
               checked:bind="todo.complete">
            <label>{{ todo.name }}</label>
            <button class="destroy" on:click="todo.destroy()"></button>
          </div>
          <input class="edit" type="text"
            value="{{todo.name}}"/>
        </li>
      {{/ for }}
    </ul>
  `,
  ViewModel: {
    todos: Todo.List
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
          <input id="toggle-all" type="checkbox"/>
          <label for="toggle-all">Mark all as complete</label>
          <todo-list todos:from="this.todosPromise.value"/>
        </section>
        <footer id="footer" class="">
          <span id="todo-count">
            <strong>{{ this.todosPromise.value.active.length }}</strong> items left
          </span>
          <ul id="filters">
            <li>
              <a href="#!" class="selected">All</a>
            </li>
            <li>
              <a href="#!active">Active</a>
            </li>
            <li>
              <a href="#!complete">Completed</a>
            </li>
          </ul>
          <button id="clear-completed">
            Clear completed ({{ this.todosPromise.value.complete.length }})
          </button>
        </footer>
      </section>
  `,
  ViewModel: {
    appName: {default: "TodoMVC"},
    get todosPromise() {
      return Todo.getList({});
    }
  }
});
