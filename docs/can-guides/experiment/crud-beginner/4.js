// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(3);

import { Component, realtimeRestModel } from "//unpkg.com/can@5/core.mjs";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
	`,
	ViewModel: {
		get todosPromise() {
			return Todo.getList({sort: "name"});
		}
	}
});
