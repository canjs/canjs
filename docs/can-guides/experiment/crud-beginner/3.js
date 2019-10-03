// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@6/index.mjs";
todoFixture(3);

import { StacheElement } from "//unpkg.com/can@6/core.mjs";

class TodosApp extends StacheElement {
  static view = `
    <h1>{{ this.title }}</h1>
  `;

  static props = {
    get title() {
      return "Today’s to-dos!";
    }
  };
}

customElements.define("todos-app", TodosApp);
