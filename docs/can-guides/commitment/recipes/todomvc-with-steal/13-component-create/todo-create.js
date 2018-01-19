// components/todo-create/todo-create.js
import Component from 'can-component';
 // remember to install
import DefineMap from 'can-define/map/';

import view from './todo-create.stache';

import Todo from '~/models/todo';


var TodoCreateVM = DefineMap.extend({
	todo: {
		Value: Todo
	},
	createTodo: function() {
		this.todo.save().then(function() {
			this.todo = new Todo();
		}.bind(this));
	}
});

export default Component.extend({
	tag: "todo-create",
	view: view,
	ViewModel: TodoCreateVM
});
