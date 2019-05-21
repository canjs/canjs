import { DefineMap, QueryLogic, connect } from "//unpkg.com/can@5/core.mjs";

const Todo = DefineMap.extend('Todo', {
	id: {
		identity: true,
		type: "number"
	},
	userId: 'number',
	title: "string",
	completed: "boolean"
});

// a behavior that extends the `getData` method of the `Data Interface`, to add 
// logging whenever a single instance is loaded
const loggingBehavior = connect.behavior(
	'data-logging', 
	(previousPrototype) => {
		return {
			getData(query) {
				return previousPrototype.getData(query).then((data) => {
					console.log(
						`Successfully fetched ${this.Map.shortName} ${this.id(data)} data from server.`
					);
					return data;
				});
			}
		};
	}
);

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos/{id}',
	queryLogic: new QueryLogic(Todo),
	Map: Todo,
};

const connection = connect.constructor(loggingBehavior(connect.dataUrl(connect.base(
	connectionOptions
))));
connection.init();

connection.get({id: 5}).then((instance) => {
	document.body.innerText = JSON.stringify(instance, null, 4);
});
