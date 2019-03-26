// Creates a mock backend with 5 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(5);

import { Component, realtimeRestModel } from "//unpkg.com/can@5/core.mjs";

const Todo = realtimeRestModel("/api/todos/{id}").Map;

Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
		{{# if(this.todosPromise.isPending) }}
			Loading todos…
		{{/ if }}
		{{# if(this.todosPromise.isRejected) }}
			<p>Couldn’t load todos; {{ this.todosPromise.reason }}</p>
		{{/ if }}
		{{# if(this.todosPromise.isResolved) }}
			<input placeholder="What needs to be done?" value:bind="this.newName" />
			<button on:click="this.save()" type="button">Add</button>
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
		newName: "string",
		get todosPromise() {
			return Todo.getList({sort: "name"});
		},
		save() {
			const todo = new Todo({name: this.newName});
			todo.save();
			this.newName = "";
		}
	}
});
