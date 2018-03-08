// index.js
import view from "./index.stache";
import DefineMap from "can-define/map/";
import Todo from "~/models/todo";
import route from "can-route";
import "~/models/todos-fixture";
import test from "can-todomvc-test";

const AppViewModel = DefineMap.extend("AppViewModel", {
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

const appVM = window.appVM = new AppViewModel({
	appName: "TodoMVC"
});

route.data = appVM;
route.register("{filter}");
route.start();

const frag = view(appVM);
document.body.appendChild(frag);
test(appVM);
