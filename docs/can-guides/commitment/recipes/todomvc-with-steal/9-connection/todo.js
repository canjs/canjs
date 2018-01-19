// models/todo.js
import DefineMap from 'can-define/map/';

import DefineList from 'can-define/list/';

import set from 'can-set';

import connectBaseMap from 'can-connect/can/base-map/';


var Todo = DefineMap.extend("Todo", {
	id: "string",
	name: "string",
	complete: {
		type: "boolean",
		value: false
	},
	toggleComplete: function() {
		this.complete = !this.complete;
	}
});

Todo.List = DefineList.extend("TodoList", {
	"#": Todo,
	get active() {
		return this.filter({
			complete: false
		});
	},
	get complete() {
		return this.filter({
			complete: true
		});
	},
	get allComplete() {
		return this.length === this.complete.length;
	}
});

Todo.algebra = new set.Algebra(
	set.props.boolean("complete"),
	set.props.id("id"),
	set.props.sort("sort")
);

Todo.connection = connectBaseMap({
	url: "/api/todos",
	Map: Todo,
	List: Todo.List,
	name: "todo",
	algebra: Todo.algebra
});

export default Todo;
