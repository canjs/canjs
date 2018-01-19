// index.js
import view from './index.stache';

import DefineMap from 'can-define/map/';

import Todo from '~/models/todo';

import route from 'can-route';
import '~/models/todos-fixture';


var AppViewModel = DefineMap.extend("AppViewModel", {
	appName: {type: "string", serialize: false},
	filter: "string",
	allTodos: {
		get: function(lastSet, resolve) {
			Todo.getList({}).then(resolve);
		}
	},
	get todosList() {
		if(this.allTodos) {
			if(this.filter === "complete") {
				return this.allTodos.complete;
			} else if(this.filter === "active") {
				return this.allTodos.active;
			} else {
				return this.allTodos;
			}
		}
	},
	get allChecked() {
		return this.todosList && this.todosList.allComplete;
	},
	set allChecked(newVal) {
		this.todosList && this.todosList.updateCompleteTo(newVal);
	}
});

var appVM = window.appVM = new AppViewModel({
	appName: "TodoMVC"
});

route.data = appVM;
route("{filter}");
route.ready();

var frag = view(appVM);
document.body.appendChild(frag);

require("can-todomvc-test")(appVM);
