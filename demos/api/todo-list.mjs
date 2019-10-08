import { ObservableArray, type } from "//unpkg.com/can@6/core.mjs";
import Todo from "./todo.mjs";

class TodoList extends ObservableArray {
	// Specify the behavior of items in the TodoList
	static items = Todo;

	static props = {
		// Create a computed `complete` property
		get complete() {
			// Filter all complete todos
			return this.filter({ complete: true });
		}
	};
}

export default TodoList;
