// components/todo-list/todo-list.js
var Component = require("can-component");
var DefineMap = require("can-define/map/");
var view = require("./todo-list.stache");
var Todo = require("~/models/todo");

var TodoListVM = DefineMap.extend({
	todos: Todo.List,
	editing: Todo,
	backupName: "string",
	isEditing: function(todo) {
		return todo === this.editing;
	},
	edit: function(todo) {
		this.backupName = todo.name;
		this.editing = todo;
	},
	cancelEdit: function() {
		if (this.editing) {
			this.editing.name = this.backupName;
		}
		this.editing = null;
	},
	updateName: function() {
		this.editing.save();
		this.editing = null;
	}
});

module.exports = Component.extend({
	tag: "todo-list",
	view: view,
	ViewModel: TodoListVM
});
