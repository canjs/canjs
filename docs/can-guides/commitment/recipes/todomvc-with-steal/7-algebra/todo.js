// models/todo.js
import { ObservableArray, ObservableObject, type } from "can";

class Todo extends ObservableObject {
  static props = {
    id: { type: type.convert(String), identity: true },
    name: { type: type.convert(String) },
    complete: {
      type: type.maybeConvert(Boolean),
      default: false
    }
  };

  toggleComplete() {
    this.complete = !this.complete;
  }
}

Todo.List = class TodoList extends ObservableArray {
  static items = type.convert(Todo);

  static props = {
    get active() {
      return this.filter({
        complete: false
      });
    },

    get complete() {
      return this.filter({
        complete: true
      });
    },

    get allComplete() {
      return this.length === this.complete.length;
    }
  };
}

export default Todo;
