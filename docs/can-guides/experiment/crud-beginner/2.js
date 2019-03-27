// Creates a mock backend with 3 todos
import { todoFixture } from "//unpkg.com/can-demo-models@5";
todoFixture(3);

import { Component } from "//unpkg.com/can@5/core.mjs";

Component.extend({
	tag: "todos-app",
	view: `
		<h1>Today’s to-dos</h1>
	`,
	ViewModel: {
	}
});
