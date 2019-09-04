// models/todo.js
import { ObservableObject, type } from "can";

class Todo extends ObservableObject {
  static props = {
    id: { type: type.convert(String) },
    name: { type: type.convert(String) },
    complete: {
      type: type.convert(Boolean),
      default: false
    }
  };

  toggleComplete() {
    this.complete = !this.complete;
  }
}

export default Todo;
