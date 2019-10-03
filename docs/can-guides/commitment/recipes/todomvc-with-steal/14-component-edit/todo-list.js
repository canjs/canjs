// components/todo-list/todo-list.js
import { StacheElement, type } from "can";
import view from "./todo-list.stache";
import Todo, { TodoList } from "~/models/todo";

export default class TodoListElement extends StacheElement {
  static view = view;

  static props = {
    todos: type.convert(TodoList),
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

customElements.define("todo-list", TodoListElement);
