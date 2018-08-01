// models/todo.js
import {DefineMap} from "can";

const Todo = DefineMap.extend("Todo", {
	id: "string",
	name: "string",
	complete: {
		type: "boolean",
		default: false
	},
	toggleComplete() {
		this.complete = !this.complete;
	}
});

export default Todo;
