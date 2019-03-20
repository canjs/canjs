// Creates a mock backend with 5 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(5);

import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "todos-app",
	view: `
		<h1>{{this.title}}</h1>
	`,
	ViewModel: {
		get title() {
			return "Today’s to-dos";
		}
	}
});
