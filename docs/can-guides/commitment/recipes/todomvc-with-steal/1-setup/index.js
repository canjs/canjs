// index.js
import {Component} from "can";
import view from "./index.stache";

import test from "can-todomvc-test";

Component.extend({
	tag: "todo-mvc",
	view,
	ViewModel: {
		appName: {default: "TodoMVC"}
	}
});

const appVM = window.appVM = document.querySelector("todo-mvc").viewModel;

test(appVM);
