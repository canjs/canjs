import {
  domEvents,
  enterEvent,
  fixture,
  ObservableArray,
  ObservableObject,
  realtimeRestModel,
  route,
  StacheElement,
  type
} from "//unpkg.com/can@6/everything.mjs";

domEvents.addEvent(enterEvent);

class Todo extends ObservableObject {
  static props = {
    id: { type: type.convert(Number), identity: true },
    name: String,
    complete: false
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
    },

    get allComplete() {
      return this.length === this.complete.length;
    },

    get saving() {
      return this.filter(function(todo) {
        return todo.isSaving();
      });
    }
  };

  updateCompleteTo(value) {
    this.forEach(function(todo) {
      todo.complete = value;
      todo.save();
    });
  }

  destroyComplete() {
    this.complete.forEach(function(todo) {
      todo.destroy();
    });
  }
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
  ObjectType: Todo,
  ArrayType: TodoList
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
    todos: type.maybeConvert(TodoList),
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
        <todo-create/>
      </header>
      <section id="main">
        <input 
          id="toggle-all" 
          type="checkbox"
          checked:bind="this.allChecked"
          disabled:from="this.todosList.saving.length"
        >
        <label for="toggle-all">Mark all as complete</label>
        <todo-list todos:from="this.todosPromise.value"/>
      </section>
      <footer id="footer">
        <span id="todo-count">
          <strong>{{ this.todosPromise.value.active.length }}</strong> items left
        </span>
        <ul id="filters">
          <li>
            <a href="{{ routeUrl(filter=undefined) }}"
              {{# routeCurrent(filter=undefined) }}class="selected"{{/ routeCurrent }}>All</a>
          </li>
          <li>
            <a href="{{ routeUrl(filter='active') }}"
              {{# routeCurrent(filter='active') }}class="selected"{{/ routeCurrent }}>Active</a>
          </li>
          <li>
            <a href="{{ routeUrl(filter='complete') }}"
              {{# routeCurrent(filter='complete') }}class="selected"{{/ routeCurrent }}>Completed</a>
          </li>
        </ul>
        <button id="clear-completed" on:click="this.todosList.destroyComplete()">
          Clear completed ({{ this.todosPromise.value.complete.length }})
        </button>
      </footer>
    </section>
  `;

  static props = {
    appName: { default: "TodoMVC" },
    routeData: {
      get default() {
        route.register("{filter}");
        route.start();
        return route.data;
      }
    },
    get todosPromise() {
      if (!this.routeData.filter) {
        return Todo.getList({});
      } else {
        return Todo.getList({
          filter: { complete: this.routeData.filter === "complete" }
        });
      }
    },
    todosList: {
      async(resolve) {
        this.todosPromise.then(resolve);
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
