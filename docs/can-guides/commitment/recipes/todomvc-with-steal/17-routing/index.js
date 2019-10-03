// index.js
import { route, StacheElement } from "can";
import view from "./index.stache";
import Todo from "~/models/todo";

import test from "can-todomvc-test";
import "~/models/todos-fixture";

route.register("{filter}");

class TodoMVC extends StacheElement {
  static view = view;

  static props = {
    appName: { default: "TodoMVC" },
    routeData: {
      get default() {
        route.start();
        return route.data;
      }
    },
    allTodos: {
      async(resolve) {
        Todo.getList({}).then(resolve);
      }
    },
    get todosList() {
      if (this.allTodos) {
        if (this.routeData.filter === "complete") {
          return this.allTodos.complete;
        } else if (this.routeData.filter === "active") {
          return this.allTodos.active;
        } else {
          return this.allTodos;
        }
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
