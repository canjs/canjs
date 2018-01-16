// components/todo-create/todo-create.js
var Component = require("can-component"); // remember to install
var DefineMap = require("can-define/map/");
var view = require("./todo-create.stache");
var Todo = require("~/models/todo");

var TodoCreateVM = DefineMap.extend({
	todo: {
		Default: Todo
	},
	createTodo: function() {
		this.todo.save().then(function() {
			this.todo = new Todo();
		}.bind(this));
	}
});

module.exports = Component.extend({
	tag: "todo-create",
	view: view,
	ViewModel: TodoCreateVM
});
