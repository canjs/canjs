// index.js
import { StacheElement } from "can";
import view from "./index.stache";
import Todo from "~/models/todo";

import test from "can-todomvc-test";
import "~/models/todos-fixture";

class TodoMVC extends StacheElement {
  static view = view;

  static props = {
    appName: { default: "TodoMVC" },
    todosList: {
      async(resolve) {
        Todo.getList({}).then(resolve);
      }
    }
  };
}
customElements.define("todo-mvc", TodoMVC);

const appVM = document.querySelector("todo-mvc");
test(appVM);
