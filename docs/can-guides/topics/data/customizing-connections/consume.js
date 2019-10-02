import { ObservableObject, QueryLogic, connect } from "//unpkg.com/can@pre/core.mjs";

class Todo extends ObservableObject {
  static props = {
    id: {
      identity: true,
      type: Number
    },
    userId: Number,
    title: String,
    completed: Boolean,
    lastAccessedDate: String,
  }
}

// a behavior that implements the `getList` method of the `Instance Interface`,
// consumes from `getListData`
const todoConstructor = connect.behavior(
	'todo-constructor',
	(previousPrototype) => {
		return {
			get(query) {
				return this.getData(query).then((data) => new Todo(data));
			}
			// ... an actual Instance Interface implementation would also implement:
			//     getList, destroy, save & update
		};
	}
);

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos/{id}',
	queryLogic: new QueryLogic(Todo)
};

const connection = todoConstructor(connect.dataUrl(connect.base(
	connectionOptions
)));
connection.init();

connection.get({id: 5}).then((result) => {
	console.log(`Fetched A Todo: `, result);
});
