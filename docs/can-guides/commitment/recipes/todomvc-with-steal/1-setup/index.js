// index.js
import { StacheElement } from "can";
import view from "./index.stache";

import test from "can-todomvc-test";

class TodoMVC extends StacheElement {
  static view = view;

  static props = {
    appName: { default: "TodoMVC" }
  };
}

customElements.define("todo-mvc", TodoMVC);

test(document.querySelector("todo-mvc"));
