// models/todo.js
import DefineMap from "can-define/map/";
const Todo = DefineMap.extend( "Todo", {
	id: "string",
	name: "string",
	complete: {
		type: "boolean",
		default: false
	},
	toggleComplete: function() {
		this.complete = !this.complete;
	}
} );
export default Todo;
