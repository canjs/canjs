// components/todo-list/todo-list.js
import {Component} from "can";
import view from "./todo-list.stache";
import Todo from "~/models/todo";

export default Component.extend({
    tag: "todo-list",
    view,
    ViewModel: {
	    todos: Todo.List,
	    editing: Todo,
	    backupName: "string",
	    isEditing(todo) {
	        return todo === this.editing;
	    },
	    edit(todo) {
	        this.backupName = todo.name;
	        this.editing = todo;
	    },
	    cancelEdit() {
	        if (this.editing) {
	            this.editing.name = this.backupName;
	        }
	        this.editing = null;
	    },
	    updateName() {
	        this.editing.save();
	        this.editing = null;
	    }
	}
});
