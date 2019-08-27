import {
  fixture,
  ObservableArray,
  ObservableObject,
  realtimeRestModel,
  StacheElement,
  type
} from "//unpkg.com/can@pre/core.mjs";

class Todo extends ObservableObject {
  static props = {
    id: { type: type.convert(Number), identity: true },
    name: String,
    complete: { type: type.convert(Boolean), default: false }
  };
}

class TodoList extends ObservableArray {
  static items = Todo;

  static props = {
    get active() {
      return this.filter({ complete: false });
    },

    get complete() {
      return this.filter({ complete: true });
    }
  };
}

const todoStore = fixture.store(
  [
    { name: "mow lawn", complete: false, id: 5 },
    { name: "dishes", complete: true, id: 6 },
    { name: "learn canjs", complete: false, id: 7 }
  ],
  Todo
);

fixture("/api/todos", todoStore);
fixture.delay = 200;

realtimeRestModel({
  url: "/api/todos",
  Map: Todo,
  List: TodoList
});

class TodoMVC extends StacheElement {
  static view = `
    <section id="todoapp">
      <header id="header">
        <h1>{{ this.appName }}</h1>
        <input id="new-todo" placeholder="What needs to be done?">
      </header>
      <section id="main" class="">
        <input id="toggle-all" type="checkbox">
        <label for="toggle-all">Mark all as complete</label>
        <ul id="todo-list">
          {{# for(todo of this.todosPromise.value) }}
            <li class="todo {{# if(todo.complete) }}completed{{/ if }}
              {{# if(todo.isDestroying()) }}destroying{{/ if }}">
              <div class="view">
                <input class="toggle" type="checkbox" checked:bind="todo.complete">
                <label>{{ todo.name }}</label>
                <button class="destroy" on:click="todo.destroy()"></button>
              </div>
              <input class="edit" type="text" value="{{todo.name}}">
            </li>
          {{/ for }}
        </ul>
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
  `;

  static props = {
    appName: { default: "TodoMVC" },
    get todosPromise() {
      return Todo.getList({});
    }
  };
}
customElements.define("todo-mvc", TodoMVC);
