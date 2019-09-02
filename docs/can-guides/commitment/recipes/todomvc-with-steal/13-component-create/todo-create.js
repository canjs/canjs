import { StacheElement, enterEvent, domEvents } from "can";
import Todo from "~/models/todo";

domEvents.addEvent(enterEvent);

class TodoCreate extends StacheElement {
  static view = `
    <input 
      id="new-todo"
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
