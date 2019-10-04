import {
  StacheElement,
  ObservableArray,
  ObservableObject,
  fixture,
  realtimeRestModel,
  type,
  domEvents,
  enterEvent
} from "//unpkg.com/can@6/everything.mjs";

domEvents.addEvent(enterEvent);

class Todo extends ObservableObject {
  static props = {
    id: { type: type.convert(Number), identity: true },
    name: String,
    complete: { type: type.convert(Boolean), default: false }
  };
}

class TodoList extends ObservableArray {
  static items = Todo;

  static props = {
    get active() {
      return this.filter({ complete: false });
    },

    get complete() {
      return this.filter({ complete: true });
    }
  };
}

const todoStore = fixture.store(
  [
    { name: "mow lawn", complete: false, id: 5 },
    { name: "dishes", complete: true, id: 6 },
    { name: "learn canjs", complete: false, id: 7 }
  ],
  Todo
);

fixture("/api/todos", todoStore);
fixture.delay = 200;

realtimeRestModel({
  url: "/api/todos",
  Map: Todo,
  List: TodoList
});

class TodoCreate extends StacheElement {
  static view = `
    <input id="new-todo"
      placeholder="What needs to be done?"
      value:bind="this.todo.name"
      on:enter="this.createTodo()"
    >
  `;

  static props = {
    todo: {
      get default() {
        return new Todo();
      }
    }
  };

  createTodo() {
    this.todo.save().then(() => {
      this.todo = new Todo();
    });
  }
}
customElements.define("todo-create", TodoCreate);

class TodoListElement extends StacheElement {
  static view = `
    <ul id="todo-list">
      {{# for(todo of this.todos) }}
        <li class="todo {{# if(todo.complete) }}completed{{/ if }}
          {{# if(todo.isDestroying()) }}destroying{{/ if }}
          {{# if(this.isEditing(todo)) }}editing{{/ if }}">
          <div class="view">
            <input 
              class="toggle"
              type="checkbox"
              checked:bind="todo.complete"
              on:change="todo.save()"
            >
            <label on:dblclick="this.edit(todo)">{{ todo.name }}</label>
            <button class="destroy" on:click="todo.destroy()"></button>
          </div>
          <input 
            class="edit"
            type="text"
            value:bind="todo.name"
            on:enter="this.updateName()"
            focused:from="this.isEditing(todo)"
            on:blur="this.cancelEdit()"
          >
        </li>
      {{/ for }}
    </ul>
  `;

  static props = {
    todos: type.maybeConvert(TodoListModel),
    editing: Todo,
    backupName: String
  };

  isEditing(todo) {
    return todo === this.editing;
  }

  edit(todo) {
    this.backupName = todo.name;
    this.editing = todo;
  }

  cancelEdit() {
    if (this.editing) {
      this.editing.name = this.backupName;
    }
    this.editing = null;
  }

  updateName() {
    this.editing.save();
    this.editing = null;
  }
}
customElements.define("todo-list", TodoListElement);

class TodoMVC extends StacheElement {
  static view = `
    <section id="todoapp">
      <header id="header">
        <h1>{{ this.appName }}</h1>
        <todo-create />
      </header>
      <section id="main" class="">
        <input id="toggle-all" type="checkbox">
        <label for="toggle-all">Mark all as complete</label>
        <todo-list todos:from="this.todosPromise.value" />
      </section>
      <footer id="footer" class="">
        <span id="todo-count">
          <strong>{{ this.todosPromise.value.active.length }}</strong> items left
        </span>
        <ul id="filters">
          <li>
            <a href="#!" class="selected">All</a>
          </li>
          <li>
            <a href="#!active">Active</a>
          </li>
          <li>
            <a href="#!complete">Completed</a>
          </li>
        </ul>
        <button id="clear-completed">
          Clear completed ({{ this.todosPromise.value.complete.length }})
        </button>
      </footer>
    </section>
  `;

  static props = {
    appName: { default: "TodoMVC" },
    get todosPromise() {
      return Todo.getList({});
    }
  };
}
customElements.define("todo-mvc", TodoMVC);
