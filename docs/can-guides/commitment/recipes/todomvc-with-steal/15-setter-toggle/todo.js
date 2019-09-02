// models/todo.js
import {
  ObservableArray,
  ObservableObject,
  type,
  realtimeRestModel
} from "can";

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
};

Todo.connection = realtimeRestModel({
  url: "/api/todos/{id}",
  Map: Todo,
  List: Todo.List
});

export default Todo;
