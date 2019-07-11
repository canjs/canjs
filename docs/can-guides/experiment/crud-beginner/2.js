// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(3);

import { StacheDefineElement } from "//unpkg.com/can@5/everything.mjs";

class TodosApp extends StacheDefineElement {
    static get view() {
        return `
            <h1>Today’s to-dos</h1>
        `;
    }

    static get define() {
        return {
        };
    }
};
customElements.define("todos-app", TodosApp);