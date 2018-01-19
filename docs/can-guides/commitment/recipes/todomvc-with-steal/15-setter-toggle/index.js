// index.js
import view from './index.stache';

import DefineMap from 'can-define/map/';

import Todo from '~/models/todo';
import '~/models/todos-fixture';


var AppViewModel = DefineMap.extend("AppViewModel",{
	appName: "string",
    todosList: {
		get: function(lastSet, resolve) {
			Todo.getList({}).then(resolve);
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

var frag = view(appVM);
document.body.appendChild(frag);

require("can-todomvc-test")(appVM);
