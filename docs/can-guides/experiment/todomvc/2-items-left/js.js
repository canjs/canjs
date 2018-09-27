import { Component, DefineMap, DefineList } from "//unpkg.com/can@5/core.mjs";

const Todo = DefineMap.extend("Todo",{
  id: "number",
  name: "string",
  complete: { type: "boolean", default: false }
});

Todo.List = DefineList.extend("TodoList",{
  "#": Todo,
  get active() {
    return this.filter({ complete: false });
  },
  get complete() {
    return this.filter({ complete: true });
  }
});

Component.extend({
  tag: "todo-mvc",
  view: `
      <section id="todoapp">
        <header id="header">
          <h1>{{ this.appName }}</h1>
          <input id="new-todo"
            placeholder="What needs to be done?"/>
        </header>
        <section id="main" class="">
          <input id="toggle-all" type="checkbox"/>
          <label for="toggle-all">Mark all as complete</label>
          <ul id="todo-list">
            {{# for(todo of this.todos) }}
              <li class="todo {{# if(todo.complete) }}completed{{/ if }}">
                <div class="view">
                  <input class="toggle" type="checkbox"
                     checked:bind="todo.complete">
                  <label>{{ todo.name }}</label>
                  <button class="destroy"></button>
                </div>
                <input class="edit" type="text"
                  value="{{todo.name}}"/>
              </li>
            {{/ for }}
          </ul>
        </section>
        <footer id="footer" class="">
          <span id="todo-count">
            <strong>{{ this.todos.active.length }}</strong> items left
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
            Clear completed ({{ this.todos.complete.length }})
          </button>
        </footer>
      </section>
  `,
  ViewModel: {
    appName: {default: "TodoMVC"},
    todos: {
      default(){
        return new Todo.List([
          { id: 5, name: "mow lawn", complete: false },
          { id: 6, name: "dishes", complete: true },
          { id: 7, name: "learn canjs", complete: false }
        ]);
      }
    }
  }
});
