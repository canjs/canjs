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

const unionization = todoQueryLogic.union(
  { filter: {name: "assigned"} },
  { filter: {name: "complete"} }
);

console.log( JSON.stringify(unionization) ); //-> "{'filter':{'name':{'$in':['assigned','complete']}}}"
