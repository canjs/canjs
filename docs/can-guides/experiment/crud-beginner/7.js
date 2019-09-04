// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@6/index.mjs";
todoFixture(3);

import { realtimeRestModel, StacheElement } from "//unpkg.com/can@6/core.mjs";

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
            {{ todo.name }}
          </li>
        {{/ for }}
      </ul>
    {{/ if }}
  `;

  static props = {
    newName: String,

    get todosPromise() {
      return Todo.getList({ sort: "name" });
    }
  };

  save() {
    const todo = new Todo({ name: this.newName });
    todo.save();
    this.newName = "";
  }
}

customElements.define("todos-app", TodosApp);
