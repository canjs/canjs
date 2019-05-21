import { DefineMap, QueryLogic, connect } from "//unpkg.com/can@5/core.mjs";

const Todo = DefineMap.extend({
	id: {
		identity: true,
		type: "number"
	},
	userId: 'number',
	title: "string",
	completed: "boolean"
});

// a behavior that implements the `getList` method of the `Instance Interface`, consuming from `getListData`
const todoConstructor = connect.behavior('todo-constructor', (previousPrototype) => {
	return {
		get(query) {
			return this.getData(query).then((data) => new Todo(data));
		}
		// ... an actual Instance Interface implementation would also implement getList, destroy, save & update
	};
});

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos/{id}',
	queryLogic: new QueryLogic(Todo)
};

const connection = todoConstructor(connect.dataUrl(connect.base(connectionOptions)));
connection.init();

connection.get({id: 5}).then((result) => {
	console.log(`Fetched A Todo: `, result);
});