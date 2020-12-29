import {DefineMap, QueryLogic} from "can";

const Todo = DefineMap.extend({
	id: {
		identity: true,
		type: "number"
	},
	name: "string",
	complete: "boolean"
});

const todoQueryLogic = new QueryLogic(Todo);

const filter = todoQueryLogic.filterMembers({
	filter: {
		complete: false
	},
	sort: "-name",
	page: {start: 0, end: 19}
},[
	{id: 1, name: "do dishes", complete: false},
	{id: 2, name: "mow lawn", complete: true},
	// ...
]);
console.log( filter ); //-> [{id: 1, name: "do dishes", complete: false}]
