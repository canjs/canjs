// index.js
import view from "./index.stache";
import DefineMap from "can-define/map/";
import Todo from "~/models/todo";
import "~/models/todos-fixture";
import test from "can-todomvc-test";
const AppViewModel = DefineMap.extend("AppViewModel", {
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

const appVM = window.appVM = new AppViewModel({
	appName: "TodoMVC"
});

const frag = view(appVM);
document.body.appendChild(frag);
test(appVM);
