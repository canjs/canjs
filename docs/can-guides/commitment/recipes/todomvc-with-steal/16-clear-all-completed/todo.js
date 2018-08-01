// models/todo.js
import {DefineMap, DefineList, realtimeRestModel} from "can";

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
	},
	get saving() {
		return this.filter(function(todo) {
			return todo.isSaving();
		});
	},
	updateCompleteTo(value) {
		this.forEach(function(todo) {
			todo.complete = value;
			todo.save();
		});
	},
	destroyComplete(){
        this.complete.forEach(function(todo){
            todo.destroy();
        });
    }
});

Todo.connection = realtimeRestModel({
	url: "/api/todos/{id}",
	Map: Todo,
	List: Todo.List
});

export default Todo;
