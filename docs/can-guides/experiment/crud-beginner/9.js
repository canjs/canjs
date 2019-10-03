// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@6/index.mjs";
todoFixture(3);

import {
  realtimeRestModel,
  StacheElement,
  type
} from "//unpkg.com/can@6/core.mjs";

const Todo = realtimeRestModel("/api/todos/{id}").ObjectType;

class TodosApp extends StacheElement {
  static view = `
    <h1>Today’s to-dos</h1>
    {{# if(this.todosPromise.isPending) }}
      Loading todos…
    {{/ if }}
    {{# if(this.todosPromise.isRejected) }}
      <p>Couldn’t load todos; {{ this.todosPromise.reason }}</p>
    {{/ if }}
    {{# if(this.todosPromise.isResolved) }}
      <input placeholder="What needs to be done?" value:bind="this.newName">
      <button on:click="this.save()" type="button">Add</button>
      <ul>
        {{# for(todo of this.todosPromise.value) }}
          <li class="{{# if(todo.complete) }}done{{/ if }}">
            <label>
              <input checked:bind="todo.complete" on:change="todo.save()" type="checkbox">
            </label>
            {{# eq(todo, this.selected) }}
              <input focused:from="true" on:blur="this.saveTodo(todo)" value:bind="todo.name">
            {{ else }}
              <span on:click="this.selected = todo">
                {{ todo.name }}
              </span>
            {{/ eq }}
            <button on:click="todo.destroy()" type="button"></button>
          </li>
        {{/ for }}
      </ul>
    {{/ if }}
  `;

  static props = {
    newName: String,
    selected: type.maybe(Todo),

    get todosPromise() {
      return Todo.getList({ sort: "name" });
    }
  };

  save() {
    const todo = new Todo({ name: this.newName });
    todo.save();
    this.newName = "";
  }

  saveTodo(todo) {
    todo.save();
    this.selected = null;
  }
}

customElements.define("todos-app", TodosApp);
