// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(3);

import { realtimeRestModel, StacheDefineElement } from "//unpkg.com/can@5/everything.mjs";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

class TodosApp extends StacheDefineElement {
    static get view() {
        return `
            <h1>Today’s to-dos</h1>
            {{# if(this.todosPromise.isResolved) }}
                <ul>
                    {{# for(todo of this.todosPromise.value) }}
                        <li class="{{# if(todo.complete) }}done{{/ if }}">
                            {{ todo.name }}
                        </li>
                    {{/ for }}
                </ul>
            {{/ if }}
        `;
    }

    static get define() {
        return {
            get todosPromise() {
                return Todo.getList({sort: "name"});
            }
        };
    }
};
customElements.define("todos-app", TodosApp);
