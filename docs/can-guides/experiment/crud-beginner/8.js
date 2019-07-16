// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5/index.mjs";
todoFixture(3);

import { realtimeRestModel, StacheDefineElement, type } from "//unpkg.com/can@5/everything.mjs";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

class TodosApp extends StacheDefineElement {
    static get view() {
        return `
            <h1>Today’s to-dos</h1>
            {{# if(this.todosPromise.isPending) }}
                Loading todos…
            {{/ if }}
            {{# if(this.todosPromise.isRejected) }}
                <p>Couldn’t load todos; {{ this.todosPromise.reason }}</p>
            {{/ if }}
            {{# if(this.todosPromise.isResolved) }}
                <input placeholder="What needs to be done?" value:bind="this.newName" />
                <button on:click="this.save()" type="button">Add</button>
                <ul>
                    {{# for(todo of this.todosPromise.value) }}
                        <li class="{{# if(todo.complete) }}done{{/ if }}">
                          <label>
                            <input checked:bind="todo.complete" on:change="todo.save()" type="checkbox" />
                          </label>
                          {{# eq(todo, this.selected) }}
                            <input focused:from="true" on:blur="this.saveTodo(todo)" value:bind="todo.name" />
                          {{ else }}
                            <span on:click="this.selected = todo">
                              {{ todo.name }}
                            </span>
                          {{/ eq }}
                        </li>
                    {{/ for }}
                </ul>
            {{/ if }}
        `;
    }

    static get define() {
        return {
            newName: String,
            selected: type.maybe(Todo),

            get todosPromise() {
                return Todo.getList({sort: "name"});
            }
        };
    }

    save() {
        const todo = new Todo({name: this.newName});
        todo.save();
        this.newName = "";
    }

    saveTodo(todo) {
        todo.save();
        this.selected = null;
    }
};
customElements.define("todos-app", TodosApp);
