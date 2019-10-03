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
    },
    get allChecked() {
      return this.todosList && this.todosList.allComplete;
    },
    set allChecked(newVal) {
      this.todosList && this.todosList.updateCompleteTo(newVal);
    }
  };
}
customElements.define("todo-mvc", TodoMVC);

test(document.querySelector("todo-mvc"));
