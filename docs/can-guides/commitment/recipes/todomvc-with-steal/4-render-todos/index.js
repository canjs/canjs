// index.js
import { StacheElement } from "can";
import view from "./index.stache";
import Todo from "~/models/todo";

import test from "can-todomvc-test";

class TodoMVC extends StacheElement {
  static view = view;

  static props = {
    appName: { default: "TodoMVC" },
    todosList: {
      get default() {
        return new Todo.List([
          { name: "mow lawn", complete: false, id: 5 },
          { name: "dishes", complete: true, id: 6 },
          { name: "learn canjs", complete: false, id: 7 }
        ]);
      }
    }
  };
}
customElements.define("todo-mvc", TodoMVC);

test(document.querySelector("todo-mvc"));
