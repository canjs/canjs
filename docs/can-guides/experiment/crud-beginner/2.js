// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5/index.mjs";
todoFixture(3);

import { StacheElement } from "//unpkg.com/can@5/everything.mjs";

class TodosApp extends StacheElement {
    static get view() {
        return `
            <h1>Today’s to-dos</h1>
        `;
    }

    static get props() {
        return {
        };
    }
};
customElements.define("todos-app", TodosApp);