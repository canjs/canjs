// index.js
import {Component} from "can";
import view from "./index.stache";
import Todo from "~/models/todo";

import test from "can-todomvc-test";

Component.extend({
	tag: "todo-mvc",
	view,
	ViewModel: {
		appName: {default: "TodoMVC"},
		todosList: {
			default: function(){
				return new Todo.List([
					{ name: "mow lawn", complete: false, id: 5 },
					{ name: "dishes", complete: true, id: 6 },
					{ name: "learn canjs", complete: false, id: 7 }
				]);
			}
		}
	}
});

const appVM = window.appVM = document.querySelector("todo-mvc").viewModel;

test(appVM);
