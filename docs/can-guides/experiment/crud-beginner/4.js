// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@6/index.mjs";
todoFixture(3);

import { realtimeRestModel, StacheElement } from "//unpkg.com/can@6/core.mjs";

const Todo = realtimeRestModel("/api/todos/{id}").ObjectType;

class TodosApp extends StacheElement {
  static view = `
    <h1>Today’s to-dos</h1>
  `;

  static props = {
    get todosPromise() {
      return Todo.getList({ sort: "name" });
    }
  };
}

customElements.define("todos-app", TodosApp);
