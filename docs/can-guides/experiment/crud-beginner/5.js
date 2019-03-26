// Creates a mock backend with 5 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(5);

import { Component, realtimeRestModel } from "//unpkg.com/can@5/core.mjs";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
		{{# if(this.todosPromise.isResolved) }}
			<ul>
				{{# for(todo of this.todosPromise.value) }}
					<li>
						{{ todo.name }}
					</li>
				{{/ for }}
			</ul>
		{{/ if }}
	`,
	ViewModel: {
		get todosPromise() {
			return Todo.getList({sort: "name"});
		}
	}
});
