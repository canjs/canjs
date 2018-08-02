// models/todo.js
import {DefineMap, DefineList} from "can";

const Todo = DefineMap.extend("Todo", {
	id: {type: "string", identity: true},
	name: "string",
	complete: {
		type: "boolean",
		default: false
	},
	toggleComplete() {
		this.complete = !this.complete;
	}
});

Todo.List = DefineList.extend("TodoList", {
	"#": Todo,
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
});

export default Todo;
