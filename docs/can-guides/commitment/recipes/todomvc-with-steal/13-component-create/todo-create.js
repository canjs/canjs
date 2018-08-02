import {Component, enterEvent, domEvents} from "can";
import Todo from "~/models/todo";

domEvents.addEvent(enterEvent);

export default Component.extend({
    tag: "todo-create",
    view: `
		<input id="new-todo"
			placeholder="What needs to be done?"
			value:bind="todo.name"
			on:enter="createTodo()" />
	`,
    ViewModel: {
		todo: {
			Default: Todo
		},
		createTodo() {
			this.todo.save().then(function() {
				this.todo = new Todo();
			}.bind(this));
		}
	}
});
