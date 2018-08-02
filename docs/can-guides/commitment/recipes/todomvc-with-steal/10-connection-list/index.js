// index.js
import {Component} from "can";
import view from "./index.stache";
import Todo from "~/models/todo";
import "~/models/todos-fixture";
import test from "can-todomvc-test";

Component.extend({
	tag: "todo-mvc",
	view,
	ViewModel: {
		appName: {default: "TodoMVC"},
		todosList: {
			get: function(lastSet, resolve) {
				Todo.getList({}).then(resolve);
			}
		}
	}
});

const appVM = window.appVM = document.querySelector("todo-mvc").viewModel;

test(appVM);
