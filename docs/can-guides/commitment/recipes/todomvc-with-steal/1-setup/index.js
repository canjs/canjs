// index.js
import {Component, viewModel} from "can";
import view from "./index.stache";

import test from "can-todomvc-test";

Component.extend({
	tag: "todo-mvc",
	view,
	ViewModel: {
		appName: {default: "TodoMVC"}
	}
});

const appVM = window.appVM = viewModel(document.querySelector("todo-mvc"));

test(appVM);
