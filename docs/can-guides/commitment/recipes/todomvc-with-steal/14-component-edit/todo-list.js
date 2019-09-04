// components/todo-list/todo-list.js
import { StacheElement, type } from "can";
import view from "./todo-list.stache";
import Todo from "~/models/todo";

class TodoList extends StacheElement {
  static view = view;

  static props = {
    todos: type.convert(Todo.List),
    editing: type.maybeConvert(Todo),
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

customElements.define("todo-list", TodoList);
